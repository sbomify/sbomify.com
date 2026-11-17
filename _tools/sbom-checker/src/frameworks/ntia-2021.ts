/** NTIA 2021 Minimum Elements.
 * Finding IDs originated in the platform plugins. Standard-derived behavior
 * takes precedence over historical platform parity; see ../STANDARDS.md.
 * File-only checks do not prove artifact completeness or signature authenticity.
 */

import { minimumElementsTimestamp, cdxComponents, dependencyCoverage } from "./standards";
import type { DetectedSbom, Finding, Framework, JsonObject } from "../types";
import { SPDX2_IDENTIFIER_TYPES, spdx2ReferenceType, spdx2YoctoSourceDownloads } from "./spdx-shared";
import {
  extractSpdx3Elements,
  getSpdx3CreationInfoFields,
  getSpdx3PackageFields,
  hasSpdx3Supplier,
} from "./spdx3-helpers";
import {
  affectedFields,
  asList,
  displayName,
  isObject,
  missingForSentence,
  pyGet,
  pyStr,
  truthy,
} from "./util";

type Element =
  | "supplier_name"
  | "component_name"
  | "version"
  | "unique_identifiers"
  | "dependency_relationship"
  | "sbom_author"
  | "timestamp";

export const NTIA_2021_FINDING_IDS: Readonly<Record<Element, string>> = {
  supplier_name: "ntia-2021:supplier-name",
  component_name: "ntia-2021:component-name",
  version: "ntia-2021:version",
  unique_identifiers: "ntia-2021:unique-identifiers",
  dependency_relationship: "ntia-2021:dependency-relationship",
  sbom_author: "ntia-2021:sbom-author",
  timestamp: "ntia-2021:timestamp",
};

const TITLES: Readonly<Record<Element, string>> = {
  supplier_name: "Supplier Name",
  component_name: "Component Name",
  version: "Component Version",
  unique_identifiers: "Unique Identifiers",
  dependency_relationship: "Dependency Relationship",
  sbom_author: "SBOM Author",
  timestamp: "Timestamp",
};

const DESCRIPTIONS: Readonly<Record<Element, string>> = {
  supplier_name: "Name of entity that creates, defines, and identifies components",
  component_name: "Designation assigned to a unit of software by the original supplier",
  version: "Identifier used by supplier to specify a change from previous version",
  unique_identifiers: "Other identifiers for component lookup (PURL, CPE, SWID, etc.)",
  dependency_relationship: "Characterizes the relationship that an upstream component is included in software",
  sbom_author: "Name of entity that creates the SBOM data for this component",
  timestamp: "Record of date and time of SBOM data assembly",
};

function finding(element: Element, status: "pass" | "fail", details: string | null, remediation: string, affected: string[] = []): Finding {
  const f: Finding = {
    id: NTIA_2021_FINDING_IDS[element],
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

/** A per-component finding: fails when any component is listed. */
function perComponent(element: Element, failures: string[], remediation: string): Finding {
  return failures.length > 0
    ? finding(element, "fail", missingForSentence(failures.length), remediation, failures)
    : finding(element, "pass", null, remediation);
}

function timestampFinding(timestamp: unknown, remediation: string): Finding {
  const valid = minimumElementsTimestamp(timestamp);
  return finding(
    "timestamp",
    valid ? "pass" : "fail",
    valid ? null : !truthy(timestamp) ? "Missing timestamp" : "Invalid ISO-8601 format",
    remediation,
  );
}

function validateSpdx(data: JsonObject): Finding[] {
  const rawPackages = pyGet(data, "packages");
  const packages = asList(truthy(rawPackages) ? rawPackages : []).filter(isObject);
  const rawCi = pyGet(data, "creationInfo");
  const creationInfo = isObject(rawCi) ? rawCi : {};

  const supplierFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const uniqueIdFailures: string[] = [];
  const sourceDownloads = spdx2YoctoSourceDownloads(data);

  packages.forEach((pkg, i) => {
    const packageName = displayName(pyGet(pkg, "name", `Package ${i + 1}`), `Package ${i + 1}`);
    const spdxIdRaw = pyGet(pkg, "SPDXID");
    const spdxId = pyStr(truthy(spdxIdRaw) ? spdxIdRaw : "");

    if (!truthy(pyGet(pkg, "originator")) && !truthy(pyGet(pkg, "supplier"))) supplierFailures.push(packageName);
    if (!truthy(pyGet(pkg, "name"))) nameFailures.push(`Package at index ${i}`);
    if (!truthy(pyGet(pkg, "versionInfo"))) versionFailures.push(packageName);
    if (!sourceDownloads.has(spdxId)) {
      const purl = pyGet(pkg, "purl");
      const hasUniqueId =
        (typeof purl === "string" && purl !== "") ||
        asList(pyGet(pkg, "externalRefs")).some((ref) => SPDX2_IDENTIFIER_TYPES.has(spdx2ReferenceType(ref)));
      if (!hasUniqueId) uniqueIdFailures.push(packageName);
    }
  });

  const hasDependencies = dependencyCoverage(data, "spdx");
  const creators = pyGet(creationInfo, "creators", []);

  return [
    perComponent("supplier_name", supplierFailures, "Add supplier field to packages. Use 'NOASSERTION' if supplier is unknown."),
    perComponent("component_name", nameFailures, "Add name field to all packages."),
    perComponent("version", versionFailures, "Add versionInfo field to packages. Use 'NOASSERTION' if version is unknown."),
    perComponent("unique_identifiers", uniqueIdFailures, "Add externalRefs with PURL, CPE, or other identifiers."),
    finding(
      "dependency_relationship",
      hasDependencies ? "pass" : "fail",
      hasDependencies ? null : "No DEPENDS_ON or CONTAINS relationships found",
      "Add relationships section with DEPENDS_ON or CONTAINS relationships.",
    ),
    finding(
      "sbom_author",
      truthy(creators) ? "pass" : "fail",
      truthy(creators) ? null : "No creators found in creationInfo",
      "Add creators field in creationInfo section with tool or person information.",
    ),
    timestampFinding(pyGet(creationInfo, "created"), "Add created field in creationInfo with ISO-8601 timestamp."),
  ];
}

function validateSpdx3(data: JsonObject): Finding[] {
  const [creationInfo, packages, , personsOrgs, tools] = extractSpdx3Elements(data);
  const ciFields = getSpdx3CreationInfoFields(creationInfo, personsOrgs, tools);

  const supplierFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const uniqueIdFailures: string[] = [];

  packages.forEach((pkg, i) => {
    const fields = getSpdx3PackageFields(pkg);
    const pkgName = displayName(truthy(fields.name) ? fields.name : null, `Package ${i + 1}`);
    if (!hasSpdx3Supplier(fields.supplierRefs, personsOrgs)) supplierFailures.push(pkgName);
    if (!truthy(fields.name)) nameFailures.push(`Package at index ${i}`);
    if (!truthy(fields.version)) versionFailures.push(pkgName);
    if (!fields.hasUniqueId) uniqueIdFailures.push(pkgName);
  });

  const hasDependencies = dependencyCoverage(data, "spdx3");
  const hasCreators = ciFields.creators.length > 0 || ciFields.toolEntries.length > 0;

  return [
    perComponent("supplier_name", supplierFailures, "Add originatedBy reference to Person/Organization element."),
    perComponent("component_name", nameFailures, "Add name field to all software_Package elements."),
    perComponent("version", versionFailures, "Add software_packageVersion field to packages."),
    perComponent(
      "unique_identifiers",
      uniqueIdFailures,
      "Add software_packageUrl to each package, or an externalIdentifier of type packageUrl, cpe23 or swid.",
    ),
    finding(
      "dependency_relationship",
      hasDependencies ? "pass" : "fail",
      hasDependencies ? null : "No dependsOn or contains relationships found",
      "Add Relationship elements with relationshipType 'dependsOn' or 'contains'.",
    ),
    finding(
      "sbom_author",
      hasCreators ? "pass" : "fail",
      hasCreators ? null : "No creators found in CreationInfo.createdBy",
      "Add createdBy reference to Person/Organization element in CreationInfo.",
    ),
    timestampFinding(ciFields.timestamp, "Add created field in CreationInfo with ISO-8601 timestamp."),
  ];
}

function validateCycloneDx(data: JsonObject): Finding[] {
  const components = cdxComponents(data);
  const rawMetadata = pyGet(data, "metadata");
  const metadata = isObject(rawMetadata) ? rawMetadata : {};

  const supplierFailures: string[] = [];
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const uniqueIdFailures: string[] = [];

  components.forEach((component, i) => {
    const componentName = displayName(pyGet(component, "name", `Component ${i + 1}`), `Component ${i + 1}`);

    {
      const supplierField = pyGet(component, "supplier");
      const publisher = pyGet(component, "publisher");
      const supplier = pyGet(pyGet(component, "manufacturer"), "name") || (truthy(publisher) ? publisher : isObject(supplierField) ? pyGet(supplierField, "name") : null);
      if (!truthy(supplier)) supplierFailures.push(componentName);
    }
    if (!truthy(pyGet(component, "name"))) nameFailures.push(`Component at index ${i}`);
    if (!truthy(pyGet(component, "version"))) versionFailures.push(componentName);
    {
      const hasUniqueId =
        truthy(pyGet(component, "purl")) || truthy(pyGet(component, "cpe")) || truthy(pyGet(component, "swid"));
      if (!hasUniqueId) uniqueIdFailures.push(componentName);
    }
  });

  const hasDependencies = dependencyCoverage(data, "cyclonedx");
  // NTIA explicitly permits analysis tools as the metadata source.
  const tools = pyGet(metadata, "tools");
  const hasAuthor = asList(pyGet(metadata, "authors")).some(a => truthy(pyGet(a, "name"))) ||
    truthy(pyGet(pyGet(metadata, "manufacturer"), "name")) ||
    (Array.isArray(tools) ? tools : asList(pyGet(tools, "components"))).some(t => truthy(pyGet(t, "name")));

  return [
    perComponent("supplier_name", supplierFailures, "Add publisher field or supplier.name to components."),
    perComponent("component_name", nameFailures, "Add name field to all components."),
    perComponent("version", versionFailures, "Add version field to components."),
    perComponent("unique_identifiers", uniqueIdFailures, "Add purl, cpe, or swid to components."),
    finding(
      "dependency_relationship",
      hasDependencies ? "pass" : "fail",
      hasDependencies ? null : "No dependencies section found",
      "Add dependencies section with dependency relationships.",
    ),
    finding(
      "sbom_author",
      hasAuthor ? "pass" : "fail",
      hasAuthor ? null : "No authors found in metadata",
      "Add authors field in metadata section with organization or person information.",
    ),
    timestampFinding(pyGet(metadata, "timestamp"), "Add timestamp field in metadata with ISO-8601 format."),
  ];
}

export const ntia2021: Framework = {
  id: "ntia-2021",
  name: "NTIA Minimum Elements for a Software Bill of Materials (SBOM)",
  shortName: "NTIA 2021",
  version: "2021-07",
  url: "https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials-sbom",
  guideUrl: "https://sbomify.com/compliance/ntia-minimum-elements/",
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
            id: "ntia-2021:error",
            title: "Assessment Error",
            description: "Unable to detect SBOM format (expected SPDX or CycloneDX)",
            status: "error",
          },
        ];
    }
  },
};
