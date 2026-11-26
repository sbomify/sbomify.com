/**
 * Where each finding leads: the sbomify GitHub Action step that fills the
 * element in, the section of our compliance guide that explains it, and the
 * schema crosswalk row that says where the field goes in CycloneDX and SPDX.
 *
 * Elements are keyed by the part of the finding ID after the colon
 * ("cisa-2026:component-hash-value" → "component-hash-value"). An element
 * the action does not populate (the BSI component properties, for example)
 * gets no action link rather than a misleading one.
 *
 * Every href here is a heading anchor on sbomify.com; test/links.test.ts
 * keeps them in step with the pages.
 */
import type { Finding } from "./types";

export type FixStep = "enrichment" | "augmentation" | "generation" | "attestation";

export interface FixLink {
  step: FixStep;
  /** What the step does for this element, as link text. */
  label: string;
  href: string;
}

export interface FindingLinks {
  fix?: FixLink;
  guide?: { label: string; href: string };
  crosswalk?: { label: string; href: string };
}

const ACTION = "/sbomify-action";

const FIX: Record<string, FixLink> = {
  supplier: { step: "enrichment", label: "Enrichment adds suppliers from package registries", href: `${ACTION}/enrichment/#what-gets-added` },
  licence: { step: "enrichment", label: "Enrichment adds licences from package registries and distro licence databases", href: `${ACTION}/enrichment/#what-gets-added` },
  hash: { step: "enrichment", label: "Enrichment attaches the integrity hashes in your lockfile", href: `${ACTION}/enrichment/#integrity-hashes` },
  uri: { step: "enrichment", label: "Enrichment adds repository and download URLs", href: `${ACTION}/enrichment/#what-gets-added` },
  dependencies: { step: "enrichment", label: "Generation records the dependency graph, and enrichment discovers missing transitive dependencies", href: `${ACTION}/enrichment/#transitive-dependency-discovery` },
  author: { step: "augmentation", label: "Augmentation sets the SBOM authors (with contact details) from sbomify.json", href: `${ACTION}/augmentation/#the-config-file` },
  producer: { step: "augmentation", label: "Augmentation sets your own supplier and authors from sbomify.json", href: `${ACTION}/augmentation/#field-reference` },
  context: { step: "augmentation", label: "Augmentation sets lifecycle_phase from sbomify.json", href: `${ACTION}/augmentation/#valid-values` },
  generation: { step: "generation", label: "Generation records the tool, version, timestamp and serial number", href: `${ACTION}/how-it-works/#1-generation` },
  identity: { step: "generation", label: "Generation records name, version and package URL for every component, normalised before output", href: `${ACTION}/how-it-works/#4-finalization` },
  version: { step: "generation", label: "Pick the output format version with SPEC_VERSION", href: `${ACTION}/configuration/#output` },
  signature: { step: "attestation", label: "Sign the SBOM in CI with a build provenance attestation", href: `${ACTION}/advanced/#attestation` },
};

/** Element key → fix. Elements missing here have no action step. */
const ELEMENT_FIX: Record<string, keyof typeof FIX> = {
  // Who made the component.
  "component-producer": "supplier",
  "supplier-name": "supplier",
  "software-producer": "supplier",
  "component-creator": "supplier",
  // Licences.
  "component-license": "licence",
  license: "licence",
  "distribution-licences": "licence",
  "original-licences": "licence",
  // Hashes.
  "component-hash-value": "hash",
  "component-hash-algorithm": "hash",
  "component-hash": "hash",
  "hash-value": "hash",
  // Locations.
  "source-code-uri": "uri",
  "uri-deployable-form": "uri",
  // Dependencies.
  "component-dependency-relationship": "dependencies",
  "dependency-relationship": "dependencies",
  dependencies: "dependencies",
  // Document metadata only you know.
  "sbom-author": "author",
  "sbom-creator": "author",
  "sbom-generation-context": "context",
  "generation-context": "context",
  // Document metadata the generator writes.
  "sbom-tool-name": "generation",
  "sbom-tool-version": "generation",
  "tool-name": "generation",
  "sbom-timestamp": "generation",
  timestamp: "generation",
  "sbom-data-format-name": "generation",
  "sbom-version": "generation",
  "sbom-uri": "generation",
  "sbom-data-format-version": "version",
  "sbom-format": "version",
  // Component identity.
  "component-name": "identity",
  "component-version": "identity",
  version: "identity",
  "component-identifiers": "identity",
  "unique-identifiers": "identity",
  "software-identifiers": "identity",
  // Signing.
  "sbom-author-signature": "signature",
  "attestation-check": "signature",
};

const GUIDE = "/compliance";
const CROSSWALK = `${GUIDE}/schema-crosswalk`;

const BSI_SECTION: Record<string, [string, string]> = {
  "sbom-format": ["format-requirements-4", "BSI TR-03183-2 §4: format"],
  "sbom-creator": ["sbom-level-required-fields-521", "BSI TR-03183-2 §5.2.1: SBOM-level fields"],
  timestamp: ["sbom-level-required-fields-521", "BSI TR-03183-2 §5.2.1: SBOM-level fields"],
  "unique-identifiers": ["conditional-fields---required-if-present-523-524", "BSI TR-03183-2 §5.2.3–5.2.4: fields required if present"],
  "sbom-uri": ["conditional-fields---required-if-present-523-524", "BSI TR-03183-2 §5.2.3–5.2.4: fields required if present"],
  "source-code-uri": ["conditional-fields---required-if-present-523-524", "BSI TR-03183-2 §5.2.3–5.2.4: fields required if present"],
  "uri-deployable-form": ["conditional-fields---required-if-present-523-524", "BSI TR-03183-2 §5.2.3–5.2.4: fields required if present"],
  "original-licences": ["conditional-fields---required-if-present-523-524", "BSI TR-03183-2 §5.2.3–5.2.4: fields required if present"],
  "no-vulnerabilities": ["critical-requirements", "BSI TR-03183-2: critical requirements"],
};

const BSI_PROPERTIES = new Set(["filename", "executable-property", "archive-property", "structured-property"]);
const DOCUMENT_LEVEL = new Set(["sbom-author", "sbom-creator", "timestamp", "sbom-timestamp", "tool-name", "sbom-tool-name", "sbom-tool-version", "generation-context", "sbom-generation-context", "sbom-version", "sbom-uri", "sbom-data-format-name", "sbom-data-format-version", "sbom-format"]);
const IDENTIFIERS = new Set(["component-identifiers", "unique-identifiers", "software-identifiers"]);
const RELATIONSHIPS = new Set(["component-dependency-relationship", "dependency-relationship", "dependencies"]);

function guideFor(framework: string, element: string): FindingLinks["guide"] {
  if (framework === "ntia-2021") return { label: "NTIA 2021: required data fields", href: `${GUIDE}/ntia-minimum-elements/#required-data-fields` };
  if (framework === "cisa-2026") {
    return element.startsWith("sbom-")
      ? { label: "CISA 2026: SBOM metadata elements", href: `${GUIDE}/cisa-minimum-elements/#sbom-metadata-9-elements` }
      : { label: "CISA 2026: component data elements", href: `${GUIDE}/cisa-minimum-elements/#component-data-8-elements` };
  }
  if (framework === "cisa-2025") return { label: "CISA Minimum Elements: what changed from NTIA 2021", href: `${GUIDE}/cisa-minimum-elements/#what-changed-from-ntia-2021` };
  if (framework.startsWith("bsi")) {
    if (element === "attestation-check") return { label: "EU CRA: digital signature", href: `${GUIDE}/eu-cra/#digital-signature` };
    const [anchor, label] = BSI_SECTION[element] ?? ["component-level-required-fields-522", "BSI TR-03183-2 §5.2.2: component-level fields"];
    return { label, href: `${GUIDE}/bsi-tr-03183/#${anchor}` };
  }
  return undefined;
}

function crosswalkFor(framework: string, element: string): FindingLinks["crosswalk"] {
  if (element === "no-vulnerabilities" || element === "attestation-check" || element === "sbom-author-signature") return undefined;
  if (BSI_PROPERTIES.has(element)) return { label: "BSI component properties in CycloneDX and SPDX", href: `${CROSSWALK}/#bsi-tr-03183-2-component-properties` };
  if (framework === "cisa-2026") {
    return element.startsWith("sbom-")
      ? { label: "Where SBOM metadata goes in CycloneDX and SPDX", href: `${CROSSWALK}/#sbom-metadata` }
      : { label: "Where component data goes in CycloneDX and SPDX", href: `${CROSSWALK}/#component-data` };
  }
  if (IDENTIFIERS.has(element)) return { label: "Identifier fields in CycloneDX and SPDX", href: `${CROSSWALK}/#component-identification` };
  if (RELATIONSHIPS.has(element)) return { label: "Relationship fields in CycloneDX and SPDX", href: `${CROSSWALK}/#relationships` };
  if (DOCUMENT_LEVEL.has(element)) return { label: "Document metadata fields in CycloneDX and SPDX", href: `${CROSSWALK}/#document-level-metadata` };
  return { label: "Component fields in CycloneDX and SPDX", href: `${CROSSWALK}/#component-data` };
}

export function elementOf(finding: Pick<Finding, "id">): string {
  const i = finding.id.indexOf(":");
  return i >= 0 ? finding.id.slice(i + 1) : finding.id;
}

/** The CBOM, HBOM and AIBOM checks are not SBOM frameworks: the action and the SBOM guides do not apply. */
const NON_SBOM = new Set(["cbom", "hbom", "aibom"]);

export function linksFor(frameworkId: string, finding: Pick<Finding, "id">): FindingLinks {
  if (NON_SBOM.has(frameworkId)) return {};
  const element = elementOf(finding);
  const fixKey = ELEMENT_FIX[element];
  return {
    fix: fixKey ? FIX[fixKey] : undefined,
    guide: guideFor(frameworkId, element),
    crosswalk: crosswalkFor(frameworkId, element),
  };
}

/** How many failing elements each action step would address. */
export function fixSummary(results: { id: string; findings: Finding[] }[]): Record<FixStep, number> {
  const out: Record<FixStep, number> = { enrichment: 0, augmentation: 0, generation: 0, attestation: 0 };
  for (const r of results) {
    for (const f of r.findings) {
      if (f.status !== "fail") continue;
      const fix = linksFor(r.id, f).fix;
      if (fix) out[fix.step] += 1;
    }
  }
  return out;
}
