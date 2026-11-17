/**
 * CISA 2025 Minimum Elements for a Software Bill of Materials (August 2025
 * public comment draft).
 *
 * Mirrors sbomify `sbomify/apps/plugins/builtins/cisa_2025.py`: same finding
 * ids, titles, descriptions, pass/fail rules and remediation text. Per-component
 * failures are reported in `affected` / `affectedCount` instead of a
 * "Missing for: a, b, c" suffix on the description.
 *
 * The eleven elements: SBOM author, software producer, component name,
 * component version, software identifiers, component hash, license,
 * dependency relationship, tool name, timestamp, generation context.
 *
 * Generation context:
 *   - CycloneDX: metadata.lifecycles[].phase, or a metadata property named
 *     `internal:sbom:generationContext` (legacy `cdx:sbom:generationContext`).
 *   - SPDX 2.3: creationInfo.comment, the document comment, or an OTHER
 *     annotation on the document / DESCRIBES root carrying
 *     `cisa:generationContext=<phase>`.
 *   - SPDX 3: software_Sbom.software_sbomType, SpdxDocument or CreationInfo
 *     comments, or a document-scoped Annotation.
 */

import type { DetectedSbom, Finding, Framework, JsonObject } from "../types";
import {
  SPDX2_IDENTIFIER_TYPES,
  iterSpdx3Elements,
  spdx2AnnotationTargetsDocument,
  spdx2ReferenceType,
  spdx2RootSpdxid,
  spdx2YoctoSourceDownloads,
  spdx3AnnotationSubjectMatches,
  spdx3DocumentSubjects,
} from "./spdx-shared";
import {
  extractSpdx3Elements,
  extractSpdx3Licenses,
  getSpdx3CreationInfoFields,
  getSpdx3PackageFields,
  getSpdx3PackageLicense,
  hasSpdx3Supplier,
} from "./spdx3-helpers";
import {
  PY_WORD_CHAR,
  affectedFields,
  asList,
  displayName,
  escapeRegExp,
  isObject,
  isValidIsoTimestamp,
  lastSegment,
  missingForSentence,
  pyGet,
  pySplit,
  pyStr,
  pyStrip,
  truthy,
} from "./util";

/**
 * Accepted generation-context values: CISA's own words ("before build",
 * "build", "after build") in the spellings documents use, the CycloneDX
 * lifecycle phases, and two tooling synonyms ("source", "analyzed").
 */
export const GENERATION_CONTEXT_VALUES: ReadonlySet<string> = new Set([
  "before build",
  "before_build",
  "during build",
  "during_build",
  "build",
  "after build",
  "after_build",
  "post build",
  "post_build",
  "design",
  "pre-build",
  "post-build",
  "operations",
  "discovery",
  "decommission",
  "source",
  "analyzed",
]);

const GENERATION_CONTEXT_PATTERNS: readonly RegExp[] = [...GENERATION_CONTEXT_VALUES].map(
  (value) => new RegExp(`(?<!${PY_WORD_CHAR})${escapeRegExp(value)}(?!${PY_WORD_CHAR})`, "u"),
);

/**
 * Whether the text names a lifecycle phase as a phrase rather than inside a
 * word ("rebuild", "resource" and "cooperations" do not count). Word
 * boundaries use Python's Unicode `\w`.
 */
export function statesGenerationContext(text: string): boolean {
  const lowered = text.toLowerCase();
  return GENERATION_CONTEXT_PATTERNS.some((re) => re.test(lowered));
}

type Element =
  | "sbom_author"
  | "software_producer"
  | "component_name"
  | "component_version"
  | "software_identifiers"
  | "component_hash"
  | "license"
  | "dependency_relationship"
  | "tool_name"
  | "timestamp"
  | "generation_context";

export const CISA_2025_FINDING_IDS: Readonly<Record<Element, string>> = {
  sbom_author: "cisa-2025:sbom-author",
  software_producer: "cisa-2025:software-producer",
  component_name: "cisa-2025:component-name",
  component_version: "cisa-2025:component-version",
  software_identifiers: "cisa-2025:software-identifiers",
  component_hash: "cisa-2025:component-hash",
  license: "cisa-2025:license",
  dependency_relationship: "cisa-2025:dependency-relationship",
  tool_name: "cisa-2025:tool-name",
  timestamp: "cisa-2025:timestamp",
  generation_context: "cisa-2025:generation-context",
};

const TITLES: Readonly<Record<Element, string>> = {
  sbom_author: "SBOM Author",
  software_producer: "Software Producer",
  component_name: "Component Name",
  component_version: "Component Version",
  software_identifiers: "Software Identifiers",
  component_hash: "Component Hash",
  license: "License",
  dependency_relationship: "Dependency Relationship",
  tool_name: "Tool Name",
  timestamp: "Timestamp",
  generation_context: "Generation Context",
};

const DESCRIPTIONS: Readonly<Record<Element, string>> = {
  sbom_author: "Name of entity that creates the SBOM data for this component",
  software_producer: "Name of entity that creates, defines, and identifies components",
  component_name: "Name assigned by the Software Producer to a software component",
  component_version: "Identifier used by Software Producer to specify a change from previous version",
  software_identifiers: "At least one identifier for component lookup (PURL, CPE preferred)",
  component_hash: "Cryptographic hash value generated from the software component",
  license: "License(s) under which the software component is made available",
  dependency_relationship: "Relationship between software components (includes/derived from)",
  tool_name: "Name of tool(s) used by SBOM Author to generate the SBOM",
  timestamp: "Record of date and time of SBOM data assembly (ISO 8601)",
  generation_context: "Software lifecycle phase at SBOM generation (before build, build, after build)",
};

/** The sanctioned CycloneDX fallback property (taxonomy `internal:` namespace). */
export const GENERATION_CONTEXT_PROP = "internal:sbom:generationContext";
/** Deprecated name under the reserved `cdx:` namespace, still accepted. */
export const LEGACY_GENERATION_CONTEXT_PROP = "cdx:sbom:generationContext";

function finding(
  element: Element,
  status: "pass" | "fail",
  details: string | null,
  remediation: string,
  affected: string[] = [],
): Finding {
  const f: Finding = {
    id: CISA_2025_FINDING_IDS[element],
    title: TITLES[element],
    description: details ? `${DESCRIPTIONS[element]}. ${details}` : DESCRIPTIONS[element],
    status,
  };
  if (status === "fail") {
    f.remediation = remediation;
    Object.assign(f, affectedFields(affected));
  }
  return f;
}

function perComponent(element: Element, failures: string[], remediation: string): Finding {
  return failures.length > 0
    ? finding(element, "fail", missingForSentence(failures.length), remediation, failures)
    : finding(element, "pass", null, remediation);
}

function check(element: Element, ok: boolean, failDetails: string, remediation: string): Finding {
  return finding(element, ok ? "pass" : "fail", ok ? null : failDetails, remediation);
}

function timestampFinding(timestamp: unknown, remediation: string): Finding {
  const valid = isValidIsoTimestamp(timestamp);
  return check("timestamp", valid, !truthy(timestamp) ? "Missing timestamp" : "Invalid ISO-8601 format", remediation);
}

/** `<value>` of each whitespace-separated `<prefix><value>` token in `text`. */
function prefixedValues(text: string, prefix: string): string[] {
  return pySplit(text)
    .filter((part) => part.startsWith(prefix))
    .map((part) => part.slice(part.indexOf("=") + 1));
}

// ---------------------------------------------------------------------------
// SPDX 2.x
// ---------------------------------------------------------------------------

function spdxHasGenerationContext(data: JsonObject): boolean {
  const rawCi = pyGet(data, "creationInfo");
  const creationInfo = truthy(rawCi) ? rawCi : {};
  if (isObject(creationInfo)) {
    const creatorComment = pyGet(creationInfo, "comment", "");
    if (typeof creatorComment === "string" && statesGenerationContext(creatorComment)) return true;
  }

  const documentComment = pyGet(data, "comment", "");
  if (typeof documentComment === "string" && statesGenerationContext(documentComment)) return true;

  // Only annotations on the document or its DESCRIBES root (SPDX 2.3 §12).
  const rootSpdxid = spdx2RootSpdxid(data);
  const annotations = pyGet(data, "annotations");
  if (!Array.isArray(annotations)) return false;
  for (const annotation of annotations) {
    if (!isObject(annotation)) continue;
    if (pyGet(annotation, "annotationType") !== "OTHER") continue;
    if (!spdx2AnnotationTargetsDocument(annotation, rootSpdxid)) continue;
    const comment = pyGet(annotation, "comment", "");
    if (typeof comment !== "string") continue;
    if (comment.includes("cisa:generationContext=")) {
      for (const value of prefixedValues(comment, "cisa:generationContext=")) {
        if (GENERATION_CONTEXT_VALUES.has(pyStrip(value.toLowerCase()))) return true;
      }
    }
  }
  return false;
}

function validateSpdx(data: JsonObject): Finding[] {
  const rawPackages = pyGet(data, "packages");
  const packages = asList(truthy(rawPackages) ? rawPackages : []).filter(isObject);
  const rawRelationships = pyGet(data, "relationships");
  const relationships = asList(truthy(rawRelationships) ? rawRelationships : []);
  const rawCi = pyGet(data, "creationInfo");
  const creationInfo = isObject(rawCi) ? rawCi : {};

  const producerFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const identifierFailures: string[] = [];
  const hashFailures: string[] = [];
  const licenseFailures: string[] = [];

  const spdxIdOf = (p: JsonObject): string => {
    const raw = pyGet(p, "SPDXID");
    return pyStr(truthy(raw) ? raw : "");
  };
  const sourceDownloads = spdx2YoctoSourceDownloads(data);

  packages.forEach((pkg, i) => {
    const packageName = displayName(pyGet(pkg, "name", `Package ${i + 1}`), `Package ${i + 1}`);

    // Component name applies to every entry, file entries included.
    if (!truthy(pyGet(pkg, "name"))) nameFailures.push(`Package at index ${i}`);
    if (spdxIdOf(pkg).includes("-File-")) return;

    if (!truthy(pyGet(pkg, "supplier"))) producerFailures.push(packageName);
    if (!truthy(pyGet(pkg, "versionInfo"))) versionFailures.push(packageName);

    // The reference type is read bare, so the full IRI form counts too.
    const purl = pyGet(pkg, "purl");
    const hasIdentifier =
      (typeof purl === "string" && purl !== "") ||
      asList(pyGet(pkg, "externalRefs")).some((ref) => SPDX2_IDENTIFIER_TYPES.has(spdx2ReferenceType(ref)));
    if (!hasIdentifier && !sourceDownloads.has(spdxIdOf(pkg))) identifierFailures.push(packageName);

    if (!truthy(pyGet(pkg, "checksums"))) hashFailures.push(packageName);

    // NOASSERTION is acceptable: it states the licence is unknown.
    const hasLicense = truthy(pyGet(pkg, "licenseConcluded", "")) || truthy(pyGet(pkg, "licenseDeclared", ""));
    if (!hasLicense) licenseFailures.push(packageName);
  });

  const hasDependencies = relationships.some((rel) => {
    const t = pyGet(rel, "relationshipType");
    return isObject(rel) && typeof t === "string" && ["DEPENDS_ON", "CONTAINS", "DESCENDANT_OF"].includes(t.toUpperCase());
  });

  // A bare string would iterate as characters, and non-strings have no startswith.
  const rawCreators = pyGet(creationInfo, "creators", []);
  const creators = Array.isArray(rawCreators) ? rawCreators.filter((e): e is string => typeof e === "string") : [];
  const toolEntries = creators.filter((c) => c.startsWith("Tool:"));
  const hasGenerationContext = spdxHasGenerationContext(data);

  return [
    perComponent("software_producer", producerFailures, "Add supplier field to packages. Use 'Organization: <name>' format."),
    perComponent("component_name", nameFailures, "Add name field to all packages."),
    perComponent("component_version", versionFailures, "Add versionInfo field. Use file creation date if version is unknown."),
    perComponent(
      "software_identifiers",
      identifierFailures,
      "Add externalRefs with at least one identifier (PURL or CPE preferred).",
    ),
    perComponent("component_hash", hashFailures, "Add checksums field with cryptographic hash (SHA-256 recommended)."),
    perComponent("license", licenseFailures, "Add licenseConcluded or licenseDeclared field with SPDX license expression."),
    check(
      "dependency_relationship",
      hasDependencies,
      "No DEPENDS_ON, CONTAINS, or DESCENDANT_OF relationships found",
      "Add relationships section with DEPENDS_ON, CONTAINS, or DESCENDANT_OF relationships.",
    ),
    check(
      "sbom_author",
      creators.length > 0,
      "No creators found in creationInfo",
      "Add creators field in creationInfo with tool or person information.",
    ),
    check(
      "tool_name",
      toolEntries.length > 0,
      "No Tool entries found in creators",
      "Add 'Tool: <tool-name>' entry in creationInfo.creators.",
    ),
    timestampFinding(pyGet(creationInfo, "created"), "Add created field in creationInfo with ISO-8601 timestamp."),
    check(
      "generation_context",
      hasGenerationContext,
      "No generation context found",
      "Add generation context in creationInfo.comment (CreatorComment) or " +
        "document-level comment (DocumentComment) with lifecycle phase " +
        "(e.g., 'build', 'pre-build', 'post-build'). Alternatively, add " +
        "annotation with 'cisa:generationContext=<context>'.",
    ),
  ];
}

// ---------------------------------------------------------------------------
// SPDX 3.x
// ---------------------------------------------------------------------------

function spdx3HasGenerationContext(data: JsonObject): boolean {
  // Empty-subject annotations count only when a rootElement is declared.
  const [docIds, rootIds] = spdx3DocumentSubjects(data);

  for (const element of iterSpdx3Elements(data)) {
    const elemType = pyGet(element, "type", pyGet(element, "@type", ""));
    if (typeof elemType !== "string") continue;
    const bareType = lastSegment(elemType, "/");

    // The first-class lifecycle declaration (how Yocto states it).
    if (bareType === "software_Sbom" || bareType === "Sbom") {
      const sbomType = pyGet(element, "software_sbomType");
      if (typeof sbomType === "string" && pyStrip(sbomType)) return true;
      if (Array.isArray(sbomType) && sbomType.some((v) => typeof v === "string" && pyStrip(v))) return true;
    }

    if (bareType === "SpdxDocument") {
      const comment = pyGet(element, "comment", "");
      if (typeof comment === "string" && statesGenerationContext(comment)) return true;
    }

    if (elemType.includes("CreationInfo")) {
      const comment = pyGet(element, "comment", "");
      if (typeof comment === "string" && statesGenerationContext(comment)) return true;
    }

    if (elemType.includes("Annotation")) {
      if (!spdx3AnnotationSubjectMatches(element, docIds, rootIds)) continue;
      const rawComment = pyGet(element, "statement", pyGet(element, "comment", ""));
      if (typeof rawComment !== "string") continue;
      const comment = rawComment.toLowerCase();
      if (statesGenerationContext(rawComment)) return true;
      if (comment.includes("cisa:generationcontext=")) {
        for (const value of prefixedValues(comment, "cisa:generationcontext=")) {
          if (GENERATION_CONTEXT_VALUES.has(pyStrip(value))) return true;
        }
      }
    }
  }
  return false;
}

function validateSpdx3(data: JsonObject): Finding[] {
  const [creationInfo, packages, relationships, personsOrgs, tools] = extractSpdx3Elements(data);
  const licenses = extractSpdx3Licenses(data);
  const ciFields = getSpdx3CreationInfoFields(creationInfo, personsOrgs, tools);

  const producerFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const identifierFailures: string[] = [];
  const hashFailures: string[] = [];
  const licenseFailures: string[] = [];

  packages.forEach((pkg, i) => {
    const fields = getSpdx3PackageFields(pkg);
    const pkgName = displayName(truthy(fields.name) ? fields.name : null, `Package ${i + 1}`);
    if (!hasSpdx3Supplier(fields.supplierRefs, personsOrgs)) producerFailures.push(pkgName);
    if (!truthy(fields.name)) nameFailures.push(`Package at index ${i}`);
    if (!truthy(fields.version)) versionFailures.push(pkgName);
    if (!fields.hasUniqueId) identifierFailures.push(pkgName);
    if (!fields.hasHash) hashFailures.push(pkgName);
    // Either relationship states a licence, and it must resolve to one.
    if (
      ["hasDeclaredLicense", "hasConcludedLicense"].every(
        (kind) => getSpdx3PackageLicense(pkg, relationships, licenses, kind) === null,
      )
    ) {
      licenseFailures.push(pkgName);
    }
  });

  const hasDependencies = relationships.some((rel) => {
    const t = pyGet(rel, "relationshipType");
    return typeof t === "string" && ["dependsOn", "contains", "descendantOf"].includes(t);
  });
  const hasGenerationContext = spdx3HasGenerationContext(data);

  return [
    perComponent("software_producer", producerFailures, "Add originatedBy reference to Person/Organization element."),
    perComponent("component_name", nameFailures, "Add name field to all software_Package elements."),
    perComponent("component_version", versionFailures, "Add software_packageVersion field to packages."),
    perComponent(
      "software_identifiers",
      identifierFailures,
      "Add software_packageUrl to each package, or an externalIdentifier of type packageUrl, cpe23 or swid.",
    ),
    perComponent("component_hash", hashFailures, "Add verifiedUsing with Hash element to packages."),
    perComponent(
      "license",
      licenseFailures,
      "Add a hasDeclaredLicense or hasConcludedLicense Relationship pointing at a LicenseExpression element.",
    ),
    check(
      "dependency_relationship",
      hasDependencies,
      "No dependsOn, contains, or descendantOf relationships found",
      "Add Relationship elements with dependsOn, contains, or descendantOf.",
    ),
    check(
      "sbom_author",
      ciFields.creators.length > 0,
      "No creators found in CreationInfo.createdBy",
      "Add createdBy reference to Person/Organization element in CreationInfo.",
    ),
    check(
      "tool_name",
      ciFields.toolEntries.length > 0,
      "No tools found in CreationInfo.createdUsing",
      "Add createdUsing reference to Tool element in CreationInfo.",
    ),
    timestampFinding(ciFields.timestamp, "Add created field in CreationInfo with ISO-8601 timestamp."),
    check(
      "generation_context",
      hasGenerationContext,
      "No generation context found",
      "Add generation context in SpdxDocument comment, CreationInfo comment, " +
        "or Annotation element with lifecycle phase.",
    ),
  ];
}

// ---------------------------------------------------------------------------
// CycloneDX
// ---------------------------------------------------------------------------

/** Tool names in metadata.tools: the 1.4 array form or the 1.5+ `tools.components`. */
function cyclonedxHasTool(metadata: JsonObject): boolean {
  const tools = pyGet(metadata, "tools");
  if (Array.isArray(tools)) {
    return tools.some((t) => isObject(t) && (truthy(pyGet(t, "name")) || truthy(pyGet(t, "vendor"))));
  }
  if (isObject(tools)) {
    const components = pyGet(tools, "components");
    if (!Array.isArray(components)) return false;
    return components.some((c) => isObject(c) && truthy(pyGet(c, "name")));
  }
  return false;
}

function cyclonedxHasGenerationContext(metadata: JsonObject): boolean {
  const rawLifecycles = pyGet(metadata, "lifecycles");
  const lifecycles = truthy(rawLifecycles) ? rawLifecycles : [];
  if (Array.isArray(lifecycles)) {
    for (const lifecycle of lifecycles) {
      if (!isObject(lifecycle)) continue;
      const phase = pyGet(lifecycle, "phase", "");
      if (typeof phase !== "string") continue;
      if (GENERATION_CONTEXT_VALUES.has(pyStrip(phase.toLowerCase()))) return true;
    }
  }

  const rawProperties = pyGet(metadata, "properties");
  const properties = truthy(rawProperties) ? rawProperties : [];
  if (!Array.isArray(properties)) return false;
  for (const prop of properties) {
    if (!isObject(prop)) continue;
    const name = pyGet(prop, "name");
    if (name === GENERATION_CONTEXT_PROP || name === LEGACY_GENERATION_CONTEXT_PROP) {
      const value = pyGet(prop, "value", "");
      if (typeof value !== "string") continue;
      if (GENERATION_CONTEXT_VALUES.has(pyStrip(value.toLowerCase()))) return true;
    }
  }
  return false;
}

function validateCycloneDx(data: JsonObject): Finding[] {
  const rawComponents = pyGet(data, "components");
  const components = asList(truthy(rawComponents) ? rawComponents : []).filter(isObject);
  const rawDependencies = pyGet(data, "dependencies");
  const dependencies = asList(truthy(rawDependencies) ? rawDependencies : []).filter(isObject);
  const rawMetadata = pyGet(data, "metadata");
  const metadata = isObject(rawMetadata) ? rawMetadata : {};

  const producerFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const identifierFailures: string[] = [];
  const hashFailures: string[] = [];
  const licenseFailures: string[] = [];

  components.forEach((component, i) => {
    const componentName = displayName(pyGet(component, "name", `Component ${i + 1}`), `Component ${i + 1}`);
    // type=file components are input metadata; only the name applies.
    const isFileType = pyStr(pyGet(component, "type", "")).toLowerCase() === "file";

    if (!truthy(pyGet(component, "name"))) nameFailures.push(`Component at index ${i}`);
    if (isFileType) return;

    const supplierField = pyGet(component, "supplier");
    const publisher = pyGet(component, "publisher");
    const supplier = truthy(publisher) ? publisher : isObject(supplierField) ? pyGet(supplierField, "name") : null;
    if (!truthy(supplier)) producerFailures.push(componentName);

    if (!truthy(pyGet(component, "version"))) versionFailures.push(componentName);

    const hasIdentifier =
      truthy(pyGet(component, "purl")) || truthy(pyGet(component, "cpe")) || truthy(pyGet(component, "swid"));
    if (!hasIdentifier) identifierFailures.push(componentName);

    if (!truthy(pyGet(component, "hashes"))) hashFailures.push(componentName);
    if (!truthy(pyGet(component, "licenses", []))) licenseFailures.push(componentName);
  });

  const hasValidDependencies = dependencies.some((dep) => truthy(pyGet(dep, "ref")));
  // "Author of SBOM Data" is an entity, so tools do not count.
  const hasAuthor = truthy(pyGet(metadata, "authors", []));

  return [
    perComponent("software_producer", producerFailures, "Add publisher field or supplier.name to components."),
    perComponent("component_name", nameFailures, "Add name field to all components."),
    perComponent("component_version", versionFailures, "Add version field. Use file creation date if version is unknown."),
    perComponent("software_identifiers", identifierFailures, "Add at least one identifier: purl (preferred), cpe, or swid."),
    perComponent("component_hash", hashFailures, "Add hashes field with cryptographic hash (SHA-256 recommended)."),
    perComponent("license", licenseFailures, "Add licenses field with license information."),
    check(
      "dependency_relationship",
      hasValidDependencies,
      "No valid dependency relationships found",
      "Add dependencies section with dependency relationships.",
    ),
    check(
      "sbom_author",
      hasAuthor,
      "No authors found in metadata",
      "Add authors field in metadata section with organization or person information.",
    ),
    check(
      "tool_name",
      cyclonedxHasTool(metadata),
      "No tool information found in metadata",
      "Add tools field in metadata with tool name and version.",
    ),
    timestampFinding(pyGet(metadata, "timestamp"), "Add timestamp field in metadata with ISO-8601 format."),
    check(
      "generation_context",
      cyclonedxHasGenerationContext(metadata),
      "No generation context found in metadata",
      "Add metadata.lifecycles[].phase (preferred, CycloneDX-sanctioned) " +
        "with value: design, pre-build, build, post-build, operations, " +
        "discovery, or decommission. Alternatively, add property " +
        "'internal:sbom:generationContext' in metadata.properties. Note: " +
        "the legacy 'cdx:sbom:generationContext' name is still recognized " +
        "for backward compatibility but is deprecated. Unofficial names " +
        "must not be used under the cdx: namespace.",
    ),
  ];
}

export const cisa2025: Framework = {
  id: "cisa-2025",
  name: "CISA 2025 Minimum Elements for a Software Bill of Materials (SBOM) - Public Comment Draft",
  shortName: "CISA 2025",
  version: "2025-08-draft",
  url: "https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf",
  guideUrl: "https://sbomify.com/compliance/cisa-minimum-elements/",
  assess(sbom: DetectedSbom): Finding[] {
    const data: JsonObject = isObject(sbom.data) ? sbom.data : {};
    switch (sbom.format) {
      case "spdx3":
        return validateSpdx3(data);
      case "spdx":
        return validateSpdx(data);
      case "cyclonedx":
        return validateCycloneDx(data);
      default:
        return [
          {
            id: "cisa-2025:error",
            title: "Assessment Error",
            description: "Unable to detect SBOM format (expected SPDX or CycloneDX)",
            status: "error",
          },
        ];
    }
  },
};
