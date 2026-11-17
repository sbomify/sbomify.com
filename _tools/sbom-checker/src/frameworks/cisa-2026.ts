/** 2026 Minimum Elements.
 * Finding IDs originated in the platform plugins. Standard-derived behavior
 * takes precedence over historical platform parity; see ../STANDARDS.md.
 * File-only checks do not prove artifact completeness or signature authenticity.
 */

import { cdxComponents, dependencyCoverage, cryptoHash, rfc9557, spdx3Nodes } from "./standards";
import type { DetectedSbom, Finding, FindingStatus, Framework, JsonObject } from "../types";
import {
  affectedFields,
  hasKey,
  isObject,
  lastSegment,
  pyGet,
  pySplit,
  pyStr,
  pyStrip,
  PY_WORD_CHAR,
  truthy,
} from "./util";
import {
  spdx2AnnotationTargetsDocument,
  spdx2ReferenceType,
  spdx2RootSpdxid,
  spdx2YoctoSourceDownloads,
} from "./spdx-shared";
import {
  extractSpdx3Elements,
  extractSpdx3Licenses,
  getSpdx3PackageLicense,
  isSpdx3,
  iterSpdx3ExternalIdentifiers,
  spdx3Refs,
} from "./spdx3-helpers";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STANDARD_NAME = "2026 Minimum Elements for a Software Bill of Materials (SBOM)";
export const STANDARD_VERSION = "2026-07";
export const STANDARD_URL =
  "https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom";

/** Python's `str.isspace()` characters, for regexes that use `\s`. */
const PY_WS =
  "\\t\\n\\v\\f\\r\\x1c\\x1d\\x1e\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";

/** `re.compile(r"\s*SPDX", re.I).match`, Unicode-aware like Python's `str` patterns. */
const SPDX_DECLARED = new RegExp(`^[${PY_WS}]*SPDX`, "iu");
/** `re.compile(r"\s*SPDX\D*\d", re.I).match`. */
const SPDX_DECLARED_VERSION = new RegExp(`^[${PY_WS}]*SPDX[^\\p{Nd}]*\\p{Nd}`, "iu");

export const GENERATION_CONTEXT_VALUES: ReadonlySet<string> = new Set([
  // CISA's own wording, in both spellings tools use.
  "before build",
  "before_build",
  "during build",
  "during_build",
  "build",
  "after build",
  "after_build",
  "post build",
  "post_build",
  // CycloneDX lifecycle phases.
  "design",
  "pre-build",
  "post-build",
  "operations",
  "discovery",
  "decommission",
  // SPDX 3 SbomType values.
  "source",
  "deployed",
  "runtime",
  "analyzed",
]);

export const SPDX3_SBOM_TYPES: ReadonlySet<string> = new Set([
  "design",
  "source",
  "build",
  "deployed",
  "runtime",
  "analyzed",
]);

export { RECOMMENDED_HASHES as HASH_ALGORITHMS } from "./standards";
import { RECOMMENDED_HASHES as HASH_ALGORITHMS, CRYPTO_HASHES } from "./standards";

/** Wider than the shared SPDX 2 set: the 2026 elements also name gitoid (OmniBOR) and swhid. */
const SPDX2_IDENTIFIER_TYPES: ReadonlySet<string> = new Set(["purl", "cpe22Type", "cpe23Type", "swid", "gitoid", "swhid"]);

/** A document saying it does not know. `NONE` is deliberately absent: it is an answer. */
const UNKNOWN_MARKERS: ReadonlySet<string> = new Set(["noassertion", "unknown", "notprovided"]);


/** Longest RFC 9557 string worth attempting. */
export const MAX_TIMESTAMP_LEN = 512;

const GENERATION_CONTEXT_PROP = "internal:sbom:generationContext";
const LEGACY_GENERATION_CONTEXT_PROP = "cdx:sbom:generationContext";

export const METADATA_ELEMENTS = [
  "sbom_author",
  "sbom_author_signature",
  "sbom_data_format_name",
  "sbom_data_format_version",
  "sbom_generation_context",
  "sbom_timestamp",
  "sbom_tool_name",
  "sbom_tool_version",
  "sbom_version",
] as const;

export const COMPONENT_ELEMENTS = [
  "component_producer",
  "component_name",
  "component_version",
  "component_identifiers",
  "component_hash_value",
  "component_hash_algorithm",
  "component_license",
  "component_dependency_relationship",
] as const;

export type Element = (typeof METADATA_ELEMENTS)[number] | (typeof COMPONENT_ELEMENTS)[number];
type ComponentElement = (typeof COMPONENT_ELEMENTS)[number];

/** Title and definition per element, the definitions quoted from Appendix A. */
export const ELEMENTS: Record<Element, [string, string]> = {
  sbom_author: ["SBOM Author", "The name of the entity that creates the SBOM data for the target component"],
  sbom_author_signature: ["SBOM Author Signature", "A digital signature attributable to the SBOM author"],
  sbom_data_format_name: ["SBOM Data Format Name", "The name of the data format used to represent the SBOM data"],
  sbom_data_format_version: [
    "SBOM Data Format Version",
    "Identifier designated by the SBOM data format to specify the version of the data format",
  ],
  sbom_generation_context: [
    "SBOM Generation Context",
    "The software lifecycle phase and data available when the SBOM author generated the SBOM",
  ],
  sbom_timestamp: ["SBOM Timestamp", "Record of the date and time of the most recent update to the SBOM data"],
  sbom_tool_name: ["SBOM Tool Name", "The name of the tool used by the SBOM author to generate or amend the SBOM"],
  sbom_tool_version: ["SBOM Tool Version", "Identifier for the version of the tool named in SBOM Tool Name"],
  sbom_version: [
    "SBOM Version",
    "Identifier specifying a change in the SBOM document from a previous version, or that it is the first",
  ],
  component_producer: ["Component Producer", "The name of an entity that creates, defines, and identifies components"],
  component_name: ["Component Name", "The name assigned by the component producer to a software component"],
  component_version: [
    "Component Version",
    "Identifier specifying a change in a component from a previous version, or that it is the first",
  ],
  component_identifiers: [
    "Component Identifiers",
    "Identifiers used to identify a component or serve as a look-up key for relevant databases",
  ],
  component_hash_value: [
    "Component Hash Value",
    "The output of applying a cryptographic hash algorithm to an executable component artifact",
  ],
  component_hash_algorithm: [
    "Component Hash Algorithm",
    "The cryptographic algorithm used to compute the Component Hash Value",
  ],
  component_license: [
    "Component License",
    "The identifiers for the licenses under which the software component is available",
  ],
  component_dependency_relationship: [
    "Component Dependency Relationship",
    "The relationship between two components, where one is necessary for the operation of the other",
  ],
};

export function findingId(element: Element): string {
  return `cisa-2026:${element.replaceAll("_", "-")}`;
}

// ---------------------------------------------------------------------------
// Value helpers (Python semantics)
// ---------------------------------------------------------------------------

/** A field's value as trimmed text, or empty for anything that is not a string. */
function text(value: unknown): string {
  return typeof value === "string" ? pyStrip(value) : "";
}

function isUnknown(value: unknown): boolean {
  return UNKNOWN_MARKERS.has(text(value).toLowerCase().replaceAll(" ", "").replaceAll("_", ""));
}

function stated(value: unknown): boolean {
  return text(value) !== "" && !isUnknown(value);
}

/** `\d+\.\d+|[-\s(]v?\d+\b`, with Python's Unicode `\d`, `\s` and `\b`. */
const LOOKS_VERSIONED = new RegExp(
  `\\p{Nd}+\\.\\p{Nd}+|[-${PY_WS}(]v?\\p{Nd}+(?!${PY_WORD_CHAR})`,
  "u",
);

function looksVersioned(value: string): boolean {
  return LOOKS_VERSIONED.test(value);
}

function normaliseAlgorithm(value: unknown): string {
  return text(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Escape for a `u`-flag RegExp (where `\-` outside a class is a syntax error). */
function escapeForUnicodeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

const GENERATION_CONTEXT_PATTERNS: RegExp[] = [...GENERATION_CONTEXT_VALUES].map(
  (value) => new RegExp(`(?<!${PY_WORD_CHAR})${escapeForUnicodeRegExp(value)}(?!${PY_WORD_CHAR})`, "u"),
);

/** Whether the text names a lifecycle phase as a phrase rather than inside a word. */
function statesGenerationContext(value: string): boolean {
  const lowered = value.toLowerCase();
  return GENERATION_CONTEXT_PATTERNS.some((re) => re.test(lowered));
}

/** Python `obj.get(a) or obj.get(b)`. */
function getOr(obj: JsonObject, a: string, b: string): unknown {
  const first = pyGet(obj, a);
  return truthy(first) ? first : pyGet(obj, b);
}

/** The bare type name of an SPDX 3 element (`type` or `@type`, after the last "/"). */
function elementType(element: JsonObject): string {
  return lastSegment(text(getOr(element, "type", "@type")), "/");
}

/** Look a key up in a Map or a plain object map, own members only. */
function lookup(map: unknown, key: string): unknown {
  if (map instanceof Map) return map.get(key);
  if (isObject(map) && Object.prototype.hasOwnProperty.call(map, key)) return map[key];
  return undefined;
}

/** `data.get("@graph", data.get("elements", []))`. */
function graphElements(data: JsonObject): unknown {
  return spdx3Nodes(data);
}

const SPDX_HOST_CONTEXT_C0_OR_SPACE = /^[\x00-\x20]+/;

/**
 * Hostname as Python's `urllib.parse.urlparse(value).hostname` reports it,
 * or `null`. Where Python would raise (malformed brackets, a netloc that
 * NFKC-normalises into URL delimiters) this returns `null`: in the app that
 * raise escapes the plugin and fails the run, which is not a useful outcome.
 */
export function pyUrlHostname(raw: string): string | null {
  let url = raw.replace(SPDX_HOST_CONTEXT_C0_OR_SPACE, "").replace(/[\t\r\n]/g, "");
  const colon = url.indexOf(":");
  if (colon > 0 && /^[A-Za-z]$/.test(url[0]!) && /^[A-Za-z0-9+\-.]+$/.test(url.slice(0, colon))) {
    url = url.slice(colon + 1);
  }
  if (!url.startsWith("//")) return null;
  let end = url.length;
  for (const c of "/?#") {
    const i = url.indexOf(c, 2);
    if (i >= 0) end = Math.min(end, i);
  }
  const netloc = url.slice(2, end);
  if (netloc.includes("[") || netloc.includes("]")) return null;
  // eslint-disable-next-line no-control-regex
  if (!/^[\x00-\x7f]*$/.test(netloc)) {
    const n = netloc.replace(/[@:#?]/g, "");
    const normalised = n.normalize("NFKC");
    if (n !== normalised && /[/?#@:]/.test(normalised)) return null;
  }
  const at = netloc.lastIndexOf("@");
  const hostinfo = at >= 0 ? netloc.slice(at + 1) : netloc;
  const portSep = hostinfo.indexOf(":");
  const hostname = portSep >= 0 ? hostinfo.slice(0, portSep) : hostinfo;
  if (!hostname) return null;
  const pct = hostname.indexOf("%");
  return pct >= 0 ? hostname.slice(0, pct).toLowerCase() + hostname.slice(pct) : hostname.toLowerCase();
}

/** Whether a JSON-LD context URL is one SPDX publishes, judged by host. */
function isSpdxContext(value: string): boolean {
  const host = pyUrlHostname(pyStrip(value)) ?? "";
  return host === "spdx.org" || host.endsWith(".spdx.org");
}

/** RFC 9557 date-time check, then the impossible-date check `fromisoformat` does. */
export function validTimestamp(value: unknown): boolean {
  return rfc9557(value);
}

// ---------------------------------------------------------------------------
// Outcome shaping
// ---------------------------------------------------------------------------

class Tally {
  missing: string[] = [];
  unknown: string[] = [];
  unapproved: string[] = [];

  record(name: string, value: unknown): void {
    if (isUnknown(value)) this.unknown.push(name);
    else if (!text(value)) this.missing.push(name);
  }

  note(name: string, isStated: boolean, isUnknownValue = false): void {
    if (isStated) return;
    (isUnknownValue ? this.unknown : this.missing).push(name);
  }
}

function recordAlgorithm(tally: Tally, name: string, hashes: JsonObject[], key: string): void {
  if (hashes.some(h => HASH_ALGORITHMS.has(normaliseAlgorithm(h[key])))) return;
  if (hashes.some(h => CRYPTO_HASHES.has(normaliseAlgorithm(h[key])))) tally.unapproved.push(name);
  else tally.missing.push(name);
}

function newTallies(): Record<ComponentElement, Tally> {
  const out = {} as Record<ComponentElement, Tally>;
  for (const element of COMPONENT_ELEMENTS) out[element] = new Tally();
  return out;
}

function finding(
  element: Element,
  status: FindingStatus,
  details?: string | null,
  remediation?: string | null,
  extra?: Pick<Finding, "affected" | "affectedCount">,
): Finding {
  const [title, definition] = ELEMENTS[element];
  const out: Finding = {
    id: findingId(element),
    title,
    description: details ? `${definition}. ${details}` : definition,
    status,
  };
  if (status !== "pass" && remediation) out.remediation = remediation;
  if (extra?.affected) out.affected = extra.affected;
  if (extra?.affectedCount !== undefined) out.affectedCount = extra.affectedCount;
  return out;
}

interface DocumentOutcome {
  stated: boolean;
  unknown?: boolean;
  details?: string;
  remediation?: string;
}

function documentFinding(element: Element, o: DocumentOutcome): Finding {
  if (o.stated) return finding(element, "pass");
  if (o.unknown) return finding(element, "warning", "The document states this is unknown.", o.remediation);
  return finding(element, "fail", o.details, o.remediation);
}

function countPhrase(count: number): string {
  return `${count} ${count === 1 ? "component" : "components"}`;
}

/** A per-component element: any miss fails, declared unknowns warn, no components warns. */
function componentFinding(element: Element, tally: Tally, total: number, remediation: string): Finding {
  if (!total) {
    return finding(
      element,
      "warning",
      "The document lists no components, so there was nothing to assess.",
      remediation,
    );
  }
  if (tally.missing.length) {
    return finding(
      element,
      "fail",
      `Missing for ${countPhrase(tally.missing.length)}.`,
      remediation,
      affectedFields(tally.missing),
    );
  }
  if (tally.unknown.length) {
    return finding(
      element,
      "warning",
      `Stated as unknown for ${countPhrase(tally.unknown.length)}.`,
      remediation,
      affectedFields(tally.unknown),
    );
  }
  if (tally.unapproved.length) {
    return finding(element, "warning", "Algorithm approval by a relevant authority has not been established; use an approved SHA-2/SHA-3 algorithm or confirm approval under the applicable policy.", remediation, affectedFields(tally.unapproved));
  }
  return finding(element, "pass");
}

const SIGNATURE_REMEDIATION =
  "Sign the SBOM and attach the signature to the artifact, or carry one in the document. " +
  "A detached signature published alongside the SBOM (for example a Sigstore or cosign bundle) satisfies this element, " +
  "but this checker only reads the SBOM file and cannot see one.";

/**
 * Signature presence is not cryptographic verification or author attribution.
 */
function signatureFinding(inDocument: boolean, note: string): Finding {
  return finding(
    "sbom_author_signature", "warning",
    inDocument
      ? "A signature block is present, but its cryptographic validity, approved algorithm and attribution to the author have not been verified."
      : `${note} Detached signatures cannot be inspected from the SBOM file alone. Signature authenticity is unverified.`,
    SIGNATURE_REMEDIATION,
  );
}

const ORDER: Map<string, number> = new Map(
  [...METADATA_ELEMENTS, ...COMPONENT_ELEMENTS].map((element, index) => [findingId(element), index]),
);

function ordered(findings: Finding[]): Finding[] {
  const fallback = ORDER.size;
  return findings
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (ORDER.get(a.f.id) ?? fallback) - (ORDER.get(b.f.id) ?? fallback) || a.i - b.i)
    .map(({ f }) => f);
}

// ---------------------------------------------------------------------------
// Format detection
// ---------------------------------------------------------------------------

/** The plugin's own `_detect_format`, so routing matches the app exactly. */
export function detectFormat(data: JsonObject): "spdx3" | "spdx" | "cyclonedx" | "unknown" {
  if (isSpdx3(data)) return "spdx3";
  if (hasKey(data, "spdxVersion")) return "spdx";
  const bomFormat = data.bomFormat;
  if (typeof bomFormat === "string" && bomFormat.toLowerCase() === "cyclonedx") return "cyclonedx";
  if (hasKey(data, "specVersion") && hasKey(data, "components")) return "cyclonedx";
  return "unknown";
}

// ---------------------------------------------------------------------------
// CycloneDX
// ---------------------------------------------------------------------------


function cyclonedxHasAuthor(metadata: JsonObject): boolean {
  const authors = pyGet(metadata, "authors");
  if (Array.isArray(authors)) {
    for (const author of authors) {
      if (isObject(author) && stated(pyGet(author, "name"))) return true;
    }
  }
  for (const key of ["manufacturer", "manufacture"]) {
    const entity = pyGet(metadata, key);
    if (isObject(entity) && stated(pyGet(entity, "name"))) return true;
  }
  return false;
}

function cyclonedxHasSignature(data: JsonObject): boolean {
  const signature = pyGet(data, "signature");
  if (isObject(signature)) {
    return (
      text(pyGet(signature, "value")) !== "" || truthy(pyGet(signature, "signers")) || truthy(pyGet(signature, "chain"))
    );
  }
  return Array.isArray(signature) && signature.length > 0;
}

function cyclonedxTool(metadata: JsonObject): [string, string] {
  const tools = pyGet(metadata, "tools");
  const candidates: JsonObject[] = [];
  if (Array.isArray(tools)) {
    candidates.push(...tools.filter(isObject));
  } else if (isObject(tools)) {
    for (const key of ["components", "services"]) {
      const entries = pyGet(tools, key);
      if (Array.isArray(entries)) candidates.push(...entries.filter(isObject));
    }
  }
  for (const tool of candidates) {
    const name = text(pyGet(tool, "name")) || text(pyGet(tool, "vendor"));
    if (name) return [name, text(pyGet(tool, "version"))];
  }
  return ["", ""];
}

function cyclonedxHasGenerationContext(metadata: JsonObject): boolean {
  const lifecycles = pyGet(metadata, "lifecycles");
  if (Array.isArray(lifecycles)) {
    for (const lifecycle of lifecycles) {
      if (!isObject(lifecycle)) continue;
      if (GENERATION_CONTEXT_VALUES.has(text(pyGet(lifecycle, "phase")).toLowerCase())) return true;
      if (stated(pyGet(lifecycle, "name"))) return true;
    }
  }
  const properties = pyGet(metadata, "properties");
  if (!Array.isArray(properties)) return false;
  for (const prop of properties) {
    if (!isObject(prop)) continue;
    const name = pyGet(prop, "name");
    if (name !== GENERATION_CONTEXT_PROP && name !== LEGACY_GENERATION_CONTEXT_PROP) continue;
    if (GENERATION_CONTEXT_VALUES.has(text(pyGet(prop, "value")).toLowerCase())) return true;
  }
  return false;
}

function cyclonedxProducerFields(component: JsonObject): unknown[] {
  const values: unknown[] = [];
  for (const key of ["manufacturer", "manufacture", "supplier"]) {
    const entity = pyGet(component, key);
    if (isObject(entity)) values.push(pyGet(entity, "name"));
  }
  const authors = pyGet(component, "authors");
  if (Array.isArray(authors)) {
    for (const a of authors) if (isObject(a)) values.push(pyGet(a, "name"));
  }
  values.push(pyGet(component, "author"));
  values.push(pyGet(component, "publisher"));
  return values;
}

function cyclonedxHasIdentifier(component: JsonObject): boolean {
  if (["purl", "cpe"].some((key) => stated(pyGet(component, key)))) return true;
  const swid = pyGet(component, "swid");
  if (isObject(swid)) {
    if (stated(pyGet(swid, "tagId")) || stated(pyGet(swid, "name"))) return true;
  } else if (stated(swid)) {
    return true;
  }
  for (const key of ["omniborId", "swhid"]) {
    const value = pyGet(component, key);
    const entries = Array.isArray(value) ? value : [value];
    if (entries.some(stated)) return true;
  }
  return false;
}

function cyclonedxLicenses(component: JsonObject): JsonObject[] {
  const licenses = pyGet(component, "licenses");
  return Array.isArray(licenses) ? licenses.filter(isObject) : [];
}

function cyclonedxLicenseMatches(component: JsonObject, test: (value: unknown) => boolean): boolean {
  for (const entry of cyclonedxLicenses(component)) {
    if (test(pyGet(entry, "expression"))) return true;
    const licence = pyGet(entry, "license");
    if (isObject(licence) && (test(pyGet(licence, "id")) || test(pyGet(licence, "name")))) return true;
  }
  return false;
}


/** Python `isinstance(v, int) and v >= 1`; bool is an int in Python. */
function isPositiveInt(value: unknown): boolean {
  if (value === true) return true;
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}


function validateCyclonedx(data: JsonObject): Finding[] {
  const rawMetadata = pyGet(data, "metadata");
  const metadata: JsonObject = isObject(rawMetadata) ? rawMetadata : {};
  const components = cdxComponents(data);

  const findings: Finding[] = [
    documentFinding("sbom_author", {
      stated: cyclonedxHasAuthor(metadata),
      details: "No metadata.authors or metadata.manufacturer names an entity.",
      remediation:
        "Add metadata.authors[].name, or metadata.manufacturer.name for an organization. " +
        "A tool in metadata.tools is not the author.",
    }),
    signatureFinding(cyclonedxHasSignature(data), "The document carries no signature block."),
    documentFinding("sbom_data_format_name", {
      stated: text(pyGet(data, "bomFormat")).toLowerCase() === "cyclonedx",
      details: "bomFormat does not name the format.",
      remediation: 'Set bomFormat to "CycloneDX".',
    }),
    documentFinding("sbom_data_format_version", {
      stated: text(pyGet(data, "specVersion")) !== "",
      details: "specVersion is absent.",
      remediation: "Set specVersion to the CycloneDX version the document is written in.",
    }),
    documentFinding("sbom_generation_context", {
      stated: cyclonedxHasGenerationContext(metadata),
      details: "No lifecycle phase is stated.",
      remediation:
        "Add metadata.lifecycles[].phase, which is the CycloneDX-sanctioned path, " +
        `or a metadata property named "${GENERATION_CONTEXT_PROP}".`,
    }),
    documentFinding("sbom_timestamp", {
      stated: validTimestamp(pyGet(metadata, "timestamp")),
      details: "metadata.timestamp is absent or is not an RFC 9557 date-time.",
      remediation: "Set metadata.timestamp to an RFC 9557 date-time, such as 2026-07-29T10:00:00Z.",
    }),
  ];

  const [toolName, toolVersion] = cyclonedxTool(metadata);
  findings.push(
    documentFinding("sbom_tool_name", {
      stated: toolName !== "",
      details: "No tool is named in metadata.tools.",
      remediation: "Add the generating tool to metadata.tools.components[] with its name.",
    }),
    documentFinding("sbom_tool_version", {
      stated: stated(toolVersion),
      unknown: isUnknown(toolVersion),
      details: "The tool is named without a version.",
      remediation: "Add the tool's version alongside its name, or state that it is unknown.",
    }),
    documentFinding("sbom_version", {
      stated: isPositiveInt(pyGet(data, "version")),
      details: "The document states no version number.",
      remediation: "Set version to 1 for a first document and raise it on every revision.",
    }),
  );

  const tallies = newTallies();
  components.forEach((component, index) => {
    const name = text(pyGet(component, "name")) || `component at index ${index}`;
    tallies.component_name.note(name, text(pyGet(component, "name")) !== "");

    const producers = cyclonedxProducerFields(component);
    tallies.component_producer.note(name, producers.some(stated), producers.some(isUnknown));
    tallies.component_version.record(name, pyGet(component, "version"));
    tallies.component_identifiers.note(name, cyclonedxHasIdentifier(component));

    const rawHashes = pyGet(component, "hashes");
    const hashes = Array.isArray(rawHashes) ? rawHashes.filter(isObject) : [];
    tallies.component_hash_value.note(
      name,
      cryptoHash(hashes, "alg", "content"),
    );
    recordAlgorithm(tallies.component_hash_algorithm, name, hashes, "alg");
    tallies.component_license.note(
      name,
      cyclonedxLicenseMatches(component, stated),
      cyclonedxLicenseMatches(component, isUnknown),
    );
  });

  const assessed = components.length;
  const remediations: Record<ComponentElement, string> = {
    component_producer:
      "Add manufacturer.name for the organization that created the component, " +
      "or authors[].name. supplier.name is accepted where the supplier is the producer.",
    component_name: "Add name to every component.",
    component_version: "Add version to every component, or state that it is unknown.",
    component_identifiers: "Add at least one of purl, cpe, swid, omniborId or swhid.",
    component_hash_value: "Add hashes[].content for every component.",
    component_hash_algorithm: "Name the algorithm in hashes[].alg, such as SHA-256.",
    component_license:
      "Add licenses[] with an SPDX identifier or expression, " + "or state that the license is unknown.",
    component_dependency_relationship: "Add a dependencies[] entry with dependsOn for each component.",
  };
  for (const element of COMPONENT_ELEMENTS) {
    if (element === "component_dependency_relationship") continue;
    const total = element === "component_name" ? components.length : assessed;
    findings.push(componentFinding(element, tallies[element], total, remediations[element]));
  }
  findings.push(
    documentFinding("component_dependency_relationship", {
      stated: dependencyCoverage(data, "cyclonedx"),
      details: "No dependencies[] entry states what a component depends on.",
      remediation: remediations.component_dependency_relationship,
    }),
  );
  return ordered(findings);
}

// ---------------------------------------------------------------------------
// SPDX 2.x
// ---------------------------------------------------------------------------

/** `c.split(":", 1)[1].strip()`; callers have already checked a ":" is present. */
function afterColon(value: string): string {
  return pyStrip(value.slice(value.indexOf(":") + 1));
}

function spdx2HasIdentifier(pkg: JsonObject): boolean {
  if (stated(pyGet(pkg, "purl"))) return true;
  const refs = pyGet(pkg, "externalRefs");
  if (!Array.isArray(refs)) return false;
  for (const ref of refs) {
    if (!isObject(ref)) continue;
    if (SPDX2_IDENTIFIER_TYPES.has(spdx2ReferenceType(ref)) && stated(pyGet(ref, "referenceLocator"))) return true;
  }
  return false;
}



function spdx2HasGenerationContext(data: JsonObject): boolean {
  const creationInfo = pyGet(data, "creationInfo");
  if (isObject(creationInfo) && statesGenerationContext(text(pyGet(creationInfo, "comment")))) return true;
  if (statesGenerationContext(text(pyGet(data, "comment")))) return true;

  const rootSpdxid = spdx2RootSpdxid(data);
  const annotations = pyGet(data, "annotations");
  if (!Array.isArray(annotations)) return false;
  for (const annotation of annotations) {
    if (!isObject(annotation) || pyGet(annotation, "annotationType") !== "OTHER") continue;
    if (!spdx2AnnotationTargetsDocument(annotation, rootSpdxid)) continue;
    for (const part of pySplit(text(pyGet(annotation, "comment")))) {
      if (part.startsWith("cisa:generationContext=")) {
        const value = pyStrip(part.slice(part.indexOf("=") + 1).toLowerCase());
        if (GENERATION_CONTEXT_VALUES.has(value)) return true;
      }
    }
  }
  return false;
}

function validateSpdx2(data: JsonObject): Finding[] {
  const rawCreationInfo = pyGet(data, "creationInfo");
  const creationInfo: JsonObject = isObject(rawCreationInfo) ? rawCreationInfo : {};
  const rawCreators = pyGet(creationInfo, "creators");
  const creators = Array.isArray(rawCreators)
    ? rawCreators.filter((c): c is string => typeof c === "string").map(text)
    : [];
  const rawPackages = pyGet(data, "packages");
  const packages = Array.isArray(rawPackages) ? rawPackages.filter(isObject) : [];

  const authors = creators.filter(
    (c) => (c.startsWith("Person:") || c.startsWith("Organization:")) && afterColon(c) !== "",
  );
  const tools = creators.filter((c) => c.startsWith("Tool:") && afterColon(c) !== "");
  const spdxVersion = text(pyGet(data, "spdxVersion"));

  const findings: Finding[] = [
    documentFinding("sbom_author", {
      stated: authors.length > 0,
      details: "creationInfo.creators names no Person or Organization.",
      remediation:
        'Add a creator of the form "Organization: Acme Inc" or "Person: Jane Doe". ' +
        "A Tool entry names the tool, not the author.",
    }),
    signatureFinding(false, "SPDX carries no in-document signature."),
    documentFinding("sbom_data_format_name", {
      stated: SPDX_DECLARED.test(spdxVersion),
      details: "spdxVersion is absent or does not name SPDX, so the document does not name its format.",
      remediation: 'Set spdxVersion, such as "SPDX-2.3".',
    }),
    documentFinding("sbom_data_format_version", {
      stated: SPDX_DECLARED_VERSION.test(spdxVersion),
      details: "spdxVersion states no version.",
      remediation: 'Set spdxVersion to the version the document is written in, such as "SPDX-2.3".',
    }),
    documentFinding("sbom_generation_context", {
      stated: spdx2HasGenerationContext(data),
      details:
        "No lifecycle phase is stated in the creator comment, the document comment, " +
        "or a document-level annotation.",
      remediation: 'State the phase in creationInfo.comment, for example "after build".',
    }),
    documentFinding("sbom_timestamp", {
      stated: validTimestamp(pyGet(creationInfo, "created")),
      details: "creationInfo.created is absent or is not an RFC 9557 date-time.",
      remediation: "Set creationInfo.created to an RFC 9557 date-time, such as 2026-07-29T10:00:00Z.",
    }),
    documentFinding("sbom_tool_name", {
      stated: tools.length > 0,
      details: "creationInfo.creators names no Tool.",
      remediation: 'Add a creator of the form "Tool: syft-1.51.1".',
    }),
  ];

  const toolVersions = tools.map(afterColon);
  findings.push(
    documentFinding("sbom_tool_version", {
      stated: toolVersions.some(looksVersioned),
      unknown: toolVersions.some(isUnknown),
      details: "The tool entry carries no version.",
      remediation: 'Append the version to the tool name, as in "Tool: syft-1.51.1".',
    }),
    documentFinding("sbom_version", {
      stated: text(pyGet(data, "documentNamespace")) !== "",
      details: "documentNamespace is absent, so revisions of this document cannot be told apart.",
      remediation: "Set a documentNamespace that is unique to this revision of the document.",
    }),
  );

  const tallies = newTallies();
  let assessed = 0;
  const sourceDownloads = spdx2YoctoSourceDownloads(data);
  packages.forEach((pkg, index) => {
    const name = text(pyGet(pkg, "name")) || `package at index ${index}`;
    tallies.component_name.note(name, text(pyGet(pkg, "name")) !== "");
    assessed += 1;

    const producers = [pyGet(pkg, "originator"), pyGet(pkg, "supplier")];
    tallies.component_producer.note(name, producers.some(stated), producers.some(isUnknown));
    tallies.component_version.record(name, pyGet(pkg, "versionInfo"));
    const spdxid = pyGet(pkg, "SPDXID");
    const spdxidText = truthy(spdxid) ? pyStr(spdxid) : "";
    tallies.component_identifiers.note(name, sourceDownloads.has(spdxidText) || spdx2HasIdentifier(pkg));

    const rawChecksums = pyGet(pkg, "checksums");
    const checksums = Array.isArray(rawChecksums) ? rawChecksums.filter(isObject) : [];
    tallies.component_hash_value.note(
      name,
      cryptoHash(checksums, "algorithm", "checksumValue"),
    );
    recordAlgorithm(tallies.component_hash_algorithm, name, checksums, "algorithm");
    const licences = [pyGet(pkg, "licenseConcluded"), pyGet(pkg, "licenseDeclared")];
    tallies.component_license.note(name, licences.some(stated), licences.some(isUnknown));
  });

  const remediations: Record<ComponentElement, string> = {
    component_producer:
      "Add originator to every package, in the form " +
      '"Organization: Acme Inc", or state NOASSERTION for unknown provenance.',
    component_name: "Add name to every package.",
    component_version: "Add versionInfo to every package, or state NOASSERTION.",
    component_identifiers: "Add externalRefs with a purl or a CPE.",
    component_hash_value: "Add checksums[].checksumValue to every package.",
    component_hash_algorithm: "Name the algorithm in checksums[].algorithm, such as SHA256.",
    component_license: "Add licenseConcluded or licenseDeclared, or state NOASSERTION.",
    component_dependency_relationship: "Add relationships with DEPENDS_ON or CONTAINS.",
  };
  for (const element of COMPONENT_ELEMENTS) {
    if (element === "component_dependency_relationship") continue;
    const total = element === "component_name" ? packages.length : assessed;
    findings.push(componentFinding(element, tallies[element], total, remediations[element]));
  }
  findings.push(
    documentFinding("component_dependency_relationship", {
      stated: dependencyCoverage(data, "spdx"),
      details: "No relationship states that one component is necessary to another.",
      remediation: remediations.component_dependency_relationship,
    }),
  );
  return ordered(findings);
}

// ---------------------------------------------------------------------------
// SPDX 3.x
// ---------------------------------------------------------------------------

/** Resolve a ref in an agent position: an inline object, or a string looked up in the map. */
function resolveRef(ref: unknown, map: unknown): unknown {
  if (typeof ref === "string") return lookup(map, ref);
  return isObject(ref) ? ref : undefined;
}

export function spdx3HasAuthor(creationInfo: JsonObject, agents: unknown): boolean {
  for (const ref of spdx3Refs(pyGet(creationInfo, "createdBy"))) {
    const entity = resolveRef(ref, agents);
    if (!isObject(entity)) continue;
    const type = elementType(entity);
    if ((type === "Person" || type === "Organization") && stated(pyGet(entity, "name"))) return true;
  }
  return false;
}

export function spdx3Tools(creationInfo: JsonObject, tools: unknown, agents: unknown): JsonObject[] {
  const found: JsonObject[] = [];
  for (const ref of spdx3Refs(pyGet(creationInfo, "createdUsing"))) {
    if (isObject(ref)) {
      found.push(ref);
    } else if (typeof ref === "string") {
      // `tools.get(ref) or agents.get(ref)`, then `if element:`.
      const fromTools = lookup(tools, ref);
      const element = truthy(fromTools) ? fromTools : lookup(agents, ref);
      if (truthy(element) && isObject(element)) found.push(element);
    }
  }
  return found;
}

function spdx3ToolVersion(tool: JsonObject): boolean {
  if (stated(pyGet(tool, "software_packageVersion")) || stated(pyGet(tool, "version"))) return true;
  if (looksVersioned(text(pyGet(tool, "name")))) return true;
  for (const ext of iterSpdx3ExternalIdentifiers(tool)) {
    if (looksVersioned(text(pyGet(ext, "identifier")))) return true;
  }
  return false;
}

function spdx3ToolVersionUnknown(tool: JsonObject): boolean {
  return ["software_packageVersion", "version"].some((key) => isUnknown(pyGet(tool, key)));
}

function spdx3DeclaresSpdx(data: JsonObject): boolean {
  const contexts = pyGet(data, "@context");
  for (const entry of Array.isArray(contexts) ? contexts : [contexts]) {
    if (typeof entry === "string" && isSpdxContext(entry)) return true;
    if (isObject(entry) && Object.values(entry).some((v) => typeof v === "string" && isSpdxContext(v))) return true;
  }
  return SPDX_DECLARED.test(text(pyGet(data, "spdxVersion")));
}

function spdx3HasDocumentIdentity(data: JsonObject): boolean {
  const elements = graphElements(data);
  if (!Array.isArray(elements)) return false;
  for (const element of elements) {
    if (!isObject(element)) continue;
    const type = elementType(element);
    if (type === "SpdxDocument" || type === "software_Sbom" || type === "Sbom") {
      if (stated(pyGet(element, "spdxId")) || stated(pyGet(element, "@id"))) return true;
    }
  }
  return false;
}

export function spdx3HasGenerationContext(data: JsonObject): boolean {
  const elements = graphElements(data);
  if (!Array.isArray(elements)) return false;
  for (const element of elements) {
    if (!isObject(element)) continue;
    const type = elementType(element);
    if (["SpdxDocument", "CreationInfo"].includes(type) && statesGenerationContext(text(element.comment))) return true;
    if (type === "Annotation") {
      const subjects = spdx3Refs(element.subject);
      const documentIds = new Set(spdx3Nodes(data).filter(n => ["SpdxDocument", "software_Sbom", "Sbom"].includes(elementType(n))).map(n => n.spdxId));
      if (subjects.some(ref => documentIds.has(ref as string)) && statesGenerationContext(text(element.statement) || text(element.comment))) return true;
    }
    if (type !== "software_Sbom" && type !== "Sbom") continue;
    const raw = getOr(element, "software_sbomType", "sbomType");
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (SPDX3_SBOM_TYPES.has(lastSegment(text(value), "/").toLowerCase())) return true;
    }
  }
  return false;
}

export function spdx3ProducerNames(pkg: JsonObject, agents: unknown): unknown[] {
  const values: unknown[] = [];
  for (const key of ["originatedBy", "suppliedBy"]) {
    for (const ref of spdx3Refs(pyGet(pkg, key))) {
      const entity = resolveRef(ref, agents);
      if (isObject(entity)) {
        values.push(pyGet(entity, "name"));
      } else if (typeof ref === "string" && isUnknown(ref)) {
        // NOASSERTION arrives as a bare string rather than a reference.
        values.push(ref);
      }
    }
  }
  return values;
}

function spdx3HasIdentifier(pkg: JsonObject): boolean {
  if (stated(pyGet(pkg, "software_packageUrl"))) return true;
  for (const ext of iterSpdx3ExternalIdentifiers(pkg)) {
    if (stated(pyGet(ext, "identifier"))) return true;
  }
  return false;
}

function spdx3Hashes(pkg: JsonObject): JsonObject[] {
  let verified = pyGet(pkg, "verifiedUsing");
  if (isObject(verified)) verified = [verified];
  return Array.isArray(verified) ? verified.filter(isObject) : [];
}

function spdx3PackageId(pkg: JsonObject): string {
  return text(pyGet(pkg, "spdxId")) || text(pyGet(pkg, "@id"));
}



function validateSpdx3(data: JsonObject): Finding[] {
  const [rawCreationInfo, packages, relationships, agents, tools] = extractSpdx3Elements(data);
  const creationInfo: JsonObject = isObject(rawCreationInfo) ? rawCreationInfo : {};

  const findings: Finding[] = [
    documentFinding("sbom_author", {
      stated: spdx3HasAuthor(creationInfo, agents),
      details: "CreationInfo.createdBy names no Person or Organization.",
      remediation:
        "Point createdBy at a Person or Organization element. A SoftwareAgent is the tool, " +
        "which the standard says is not the author.",
    }),
    signatureFinding(false, "SPDX carries no in-document signature."),
    documentFinding("sbom_data_format_name", {
      stated: spdx3DeclaresSpdx(data),
      details: "Nothing in the document names SPDX as its format.",
      remediation:
        "Set @context to the SPDX 3 context, such as " + '"https://spdx.org/rdf/3.0.1/spdx-context.jsonld".',
    }),
    documentFinding("sbom_data_format_version", {
      stated: text(pyGet(creationInfo, "specVersion")) !== "",
      details: "CreationInfo.specVersion is absent.",
      remediation: 'Set CreationInfo.specVersion, such as "3.0.1".',
    }),
    documentFinding("sbom_generation_context", {
      stated: spdx3HasGenerationContext(data),
      details: "No software_Sbom element states a software_sbomType the specification defines.",
      remediation:
        "Set software_sbomType on the software_Sbom element to one of " + `${[...SPDX3_SBOM_TYPES].sort().join(", ")}.`,
    }),
    documentFinding("sbom_timestamp", {
      stated: validTimestamp(pyGet(creationInfo, "created")),
      details: "CreationInfo.created is absent or is not an RFC 9557 date-time.",
      remediation: "Set CreationInfo.created to an RFC 9557 date-time, such as 2026-07-29T10:00:00Z.",
    }),
  ];

  const toolElements = spdx3Tools(creationInfo, tools, agents);
  findings.push(
    documentFinding("sbom_tool_name", {
      stated: toolElements.some((tool) => stated(pyGet(tool, "name"))),
      details: "CreationInfo.createdUsing names no tool.",
      remediation: "Point createdUsing at a Tool element carrying a name.",
    }),
    documentFinding("sbom_tool_version", {
      stated: toolElements.some(spdx3ToolVersion),
      unknown: toolElements.some(spdx3ToolVersionUnknown),
      details: "The tool element states no version.",
      remediation:
        "Carry the tool version in software_packageVersion, in the tool's name, " + "or as an external identifier.",
    }),
    documentFinding("sbom_version", {
      stated: spdx3HasDocumentIdentity(data),
      details: "No SpdxDocument element carries an identifier, so revisions cannot be told apart.",
      remediation: "Give the SpdxDocument element a spdxId that is unique to this revision.",
    }),
  );

  // Packages whose licence relationship resolves to a licensing element.
  const licences = extractSpdx3Licenses(data);
  const licenceSubjects = new Set<string>();
  for (const pkg of packages) {
    const id = spdx3PackageId(pkg);
    if (!id) continue;
    for (const kind of ["hasDeclaredLicense", "hasConcludedLicense"]) {
      const resolved = getSpdx3PackageLicense(pkg, relationships, licences, kind);
      if (resolved !== null && resolved !== undefined && !isUnknown(resolved)) {
        licenceSubjects.add(id);
        break;
      }
    }
  }

  const tallies = newTallies();
  packages.forEach((pkg, index) => {
    const name = text(pyGet(pkg, "name")) || `package at index ${index}`;
    const packageId = spdx3PackageId(pkg);
    tallies.component_name.note(name, text(pyGet(pkg, "name")) !== "");

    const producers = spdx3ProducerNames(pkg, agents);
    tallies.component_producer.note(name, producers.some(stated), producers.some(isUnknown));
    tallies.component_version.record(name, pyGet(pkg, "software_packageVersion"));
    tallies.component_identifiers.note(name, spdx3HasIdentifier(pkg));

    const hashes = spdx3Hashes(pkg);
    tallies.component_hash_value.note(
      name,
      cryptoHash(hashes, "algorithm", "hashValue"),
    );
    recordAlgorithm(tallies.component_hash_algorithm, name, hashes, "algorithm");
    const unknownLicense = ["hasDeclaredLicense", "hasConcludedLicense"].some(kind =>
      isUnknown(getSpdx3PackageLicense(pkg, relationships, licences, kind)));
    tallies.component_license.note(name, licenceSubjects.has(packageId), unknownLicense);
  });

  const remediations: Record<ComponentElement, string> = {
    component_producer: "Point originatedBy at a Person or Organization element for every package.",
    component_name: "Add name to every software_Package element.",
    component_version: "Add software_packageVersion to every package, or state NOASSERTION.",
    component_identifiers:
      "Add software_packageUrl, or an externalIdentifier of type " + "packageUrl, cpe23, gitoid or swhid.",
    component_hash_value: "Add verifiedUsing with a Hash carrying hashValue.",
    component_hash_algorithm: "Name the algorithm in the Hash element, such as sha256.",
    component_license:
      "Add a hasDeclaredLicense relationship, which is what the producer declares, " + "or hasConcludedLicense.",
    component_dependency_relationship: "Add a Relationship of type dependsOn or contains.",
  };
  for (const element of COMPONENT_ELEMENTS) {
    if (element === "component_dependency_relationship") continue;
    findings.push(componentFinding(element, tallies[element], packages.length, remediations[element]));
  }
  findings.push(
    documentFinding("component_dependency_relationship", {
      stated: dependencyCoverage(data, "spdx3"),
      details: "No Relationship states that one component is necessary to another.",
      remediation: remediations.component_dependency_relationship,
    }),
  );
  return ordered(findings);
}

// ---------------------------------------------------------------------------
// Framework
// ---------------------------------------------------------------------------

function errorFinding(message: string): Finding {
  return { id: "cisa-2026:error", title: "Assessment Error", description: message, status: "error" };
}

/**
 * Score a parsed document; never throws. `format` is the checker's own
 * detection; when it could not classify the document, the plugin's
 * `_detect_format` gets a second look (it routes e.g. a null `spdxVersion`).
 */
export function assessCisa2026(data: unknown, format: string = "unknown"): Finding[] {
  if (!isObject(data)) return [errorFinding("The document is valid JSON but not an object")];
  try {
    const route = format === "spdx3" || format === "spdx" || format === "cyclonedx" ? format : detectFormat(data);
    switch (route) {
      case "spdx3":
        return validateSpdx3(data);
      case "spdx":
        return validateSpdx2(data);
      case "cyclonedx":
        return validateCyclonedx(data);
      default:
        return [errorFinding("Unable to detect SBOM format (expected SPDX or CycloneDX)")];
    }
  } catch (err) {
    return [errorFinding(`The check could not finish: ${err instanceof Error ? err.message : String(err)}`)];
  }
}

export const cisa2026: Framework = {
  id: "cisa-2026",
  name: STANDARD_NAME,
  shortName: "CISA 2026",
  version: STANDARD_VERSION,
  url: STANDARD_URL,
  guideUrl: "https://sbomify.com/compliance/cisa-minimum-elements/",
  assess(sbom: DetectedSbom): Finding[] {
    return assessCisa2026(sbom?.data, sbom?.format);
  },
};
