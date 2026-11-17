/**
 * BSI TR-03183-2 v2.1.0 (the technical guideline for EU Cyber Resilience Act
 * SBOMs).
 *
 * Port of sbomify `sbomify/apps/plugins/builtins/bsi.py`. Finding IDs,
 * titles, statuses and remediation text match the plugin. Two things differ
 * by design:
 *
 *   - Component lists are not embedded in descriptions ("Missing for: a, b");
 *     they go to `affected` / `affectedCount` and the description keeps a
 *     short count.
 *   - The attestation cross-check reads the result of sbomify's attestation
 *     plugins, which a browser does not have. It reports a warning that
 *     explains what satisfies it (see `checkAttestationRequirement`).
 *
 * Where the Python would raise on a malformed document (a `null` hashes
 * list, a non-string `alg`, a non-dict `@graph` entry) the port skips the
 * value instead. Input is hostile; nothing here throws.
 */

import type { DetectedSbom, Finding, FindingStatus, Framework, JsonObject } from "../types";
import { spdx2ReferenceType, spdx2YoctoSourceDownloads, spdx3DocumentSubjects } from "./spdx-shared";
import {
  extractSpdx3Elements,
  extractSpdx3Licenses,
  getSpdx3PackageFields,
  getSpdx3PackageLicense,
  isSpdx3,
  iterSpdx3ExternalIdentifiers,
  resolveSpdx3Agent,
  spdx3Refs,
  type Spdx3ElementMap,
  type Spdx3LicenseMap,
} from "./spdx3-helpers";
import {
  affectedFields,
  asList,
  asObjectList,
  displayName,
  hasKey,
  isObject,
  isValidIsoTimestamp,
  lastSegment,
  missingForSentence,
  pyGet,
  pyStr,
  pyStrip,
  truthy,
} from "./util";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum format versions per BSI TR-03183-2 v2.1.0 §4. */
export const MIN_CYCLONEDX_VERSION = "1.6";
export const MIN_SPDX_VERSION = "3.0.1";

const BSI_PROPERTY_PREFIX = "bsi:component:";

export const STANDARD_NAME = "BSI TR-03183-2: Cyber Resilience Requirements - Part 2: SBOM";
export const STANDARD_VERSION = "2.1.0";
export const STANDARD_URL = "https://bsi.bund.de/dok/TR-03183-en";

/**
 * Framework id. The Python plugin is named "bsi-tr03183-v2.1-compliance";
 * the checker's ids are short like the other frameworks' ("ntia-2021",
 * "cisa-2026") and test/fixtures/cases/expectations.json uses this one.
 */
const FRAMEWORK_ID = "bsi-tr03183-2";

/** Attestation plugins the app accepts for the cross-check. */
const SUPPORTED_ATTESTATION_PLUGINS = ["sbom-verification"];

type FormatKind = "spdx" | "cyclonedx" | "unknown";

type Element =
  | "sbom_format"
  | "sbom_creator"
  | "timestamp"
  | "component_creator"
  | "component_name"
  | "component_version"
  | "filename"
  | "dependencies"
  | "distribution_licences"
  | "hash_value"
  | "executable_property"
  | "archive_property"
  | "structured_property"
  | "sbom_uri"
  | "source_code_uri"
  | "uri_deployable_form"
  | "unique_identifiers"
  | "original_licences"
  | "no_vulnerabilities"
  | "attestation_check";

const FINDING_IDS: Record<Element, string> = {
  sbom_format: "bsi-tr03183:sbom-format",
  sbom_creator: "bsi-tr03183:sbom-creator",
  timestamp: "bsi-tr03183:timestamp",
  component_creator: "bsi-tr03183:component-creator",
  component_name: "bsi-tr03183:component-name",
  component_version: "bsi-tr03183:component-version",
  filename: "bsi-tr03183:filename",
  dependencies: "bsi-tr03183:dependencies",
  distribution_licences: "bsi-tr03183:distribution-licences",
  hash_value: "bsi-tr03183:hash-value",
  executable_property: "bsi-tr03183:executable-property",
  archive_property: "bsi-tr03183:archive-property",
  structured_property: "bsi-tr03183:structured-property",
  sbom_uri: "bsi-tr03183:sbom-uri",
  source_code_uri: "bsi-tr03183:source-code-uri",
  uri_deployable_form: "bsi-tr03183:uri-deployable-form",
  unique_identifiers: "bsi-tr03183:unique-identifiers",
  original_licences: "bsi-tr03183:original-licences",
  no_vulnerabilities: "bsi-tr03183:no-vulnerabilities",
  attestation_check: "bsi-tr03183:attestation-check",
};

const FINDING_TITLES: Record<Element, string> = {
  sbom_format: "SBOM Format Version",
  sbom_creator: "SBOM Creator",
  timestamp: "Timestamp",
  component_creator: "Component Creator",
  component_name: "Component Name",
  component_version: "Component Version",
  filename: "Component Filename",
  dependencies: "Dependencies with Completeness",
  distribution_licences: "Distribution Licenses",
  hash_value: "Hash Value (SHA-512)",
  executable_property: "Executable Property",
  archive_property: "Archive Property",
  structured_property: "Structured Property",
  sbom_uri: "SBOM URI",
  source_code_uri: "Source Code URI",
  uri_deployable_form: "URI of Deployable Form",
  unique_identifiers: "Unique Identifiers",
  original_licences: "Original Licenses",
  no_vulnerabilities: "No Embedded Vulnerabilities",
  attestation_check: "Digital Signature Attestation",
};

const FINDING_DESCRIPTIONS: Record<Element, string> = {
  sbom_format:
    `SBOM MUST be in JSON or XML format using CycloneDX v${MIN_CYCLONEDX_VERSION}+ ` +
    `or SPDX v${MIN_SPDX_VERSION}+ (BSI TR-03183-2 §4)`,
  sbom_creator: "Email address or URL of the entity that created the SBOM (BSI TR-03183-2 §5.2.1 Table 2)",
  timestamp: "Date and time of the SBOM data compilation in ISO-8601 format (BSI TR-03183-2 §5.2.1 Table 2)",
  component_creator:
    "Email address or URL of the entity that created and maintains the component " +
    "(BSI TR-03183-2 §5.2.2 Table 3)",
  component_name:
    "Name assigned to the component by the component creator, or actual filename if none " +
    "(BSI TR-03183-2 §5.2.2 Table 3)",
  component_version:
    "Version identifier used by the creator, or file modification date per RFC 3339 " +
    "(BSI TR-03183-2 §5.2.2 Table 3)",
  filename: "The actual filename of the component (not its file system path) (BSI TR-03183-2 §5.2.2 Table 3)",
  dependencies:
    "Enumeration of all direct dependencies with completeness indicator " +
    "(complete/incomplete/unknown) (BSI TR-03183-2 §5.2.2 Table 3)",
  distribution_licences:
    "Distribution license(s) using SPDX identifiers or expressions (BSI TR-03183-2 §5.2.2 Table 3, §6.1)",
  hash_value: "Cryptographically secure SHA-512 hash of the deployable component (BSI TR-03183-2 §5.2.2 Table 3)",
  executable_property:
    "Indicates whether the component is executable (executable/non-executable) (BSI TR-03183-2 §5.2.2 Table 3)",
  archive_property:
    "Indicates whether the component is an archive (archive/no archive) (BSI TR-03183-2 §5.2.2 Table 3)",
  structured_property:
    "Indicates whether the component is structured (structured/unstructured) (BSI TR-03183-2 §5.2.2 Table 3)",
  sbom_uri:
    "Uniform Resource Identifier of this SBOM — MUST be provided if it exists and " +
    "fulfills the requirements of the SBOM format specification (BSI TR-03183-2 §5.2.3 Table 4)",
  source_code_uri:
    "URI of the source code of the component — MUST be provided if it exists (BSI TR-03183-2 §5.2.4 Table 5)",
  uri_deployable_form:
    "URI pointing directly to the deployable (e.g. downloadable) form of the component — " +
    "MUST be provided if it exists (BSI TR-03183-2 §5.2.4 Table 5)",
  unique_identifiers:
    "Other identifiers for vulnerability lookup (CPE, purl) - MUST be provided if they exist " +
    "(BSI TR-03183-2 §5.2.4 Table 5)",
  original_licences:
    "Original license(s) assigned by the component creator (distinct from distribution " +
    "licenses). MUST be provided if they exist (BSI TR-03183-2 §5.2.4 Table 5, §6.1)",
  no_vulnerabilities:
    "SBOM MUST NOT contain vulnerability information. Use CSAF or VEX documents instead " +
    "(BSI TR-03183-2 §3.1, §8.1.14)",
  attestation_check:
    "SBOM integrity MUST be verified via digital signature. Run one of the attestation plugins " +
    "to verify SBOM provenance and integrity (BSI TR-03183-2 §3.2, CRA Article 10)",
};

// ---------------------------------------------------------------------------
// Python regex and value semantics
// ---------------------------------------------------------------------------

/**
 * Python's `\s` for str patterns (`str.isspace()`), which JS `\s` does not
 * match exactly: Python includes \x1c-\x1f and \x85, JS includes ﻿.
 */
const PY_WS = "\\t\\n\\v\\f\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";

/**
 * `re.match(r"^...$")`: Python's `$` also matches before one trailing
 * newline, hence the `\n?` before the JS end anchor.
 */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\n?$/;
/** `^https?://[^\s/$.?#].[^\s]*$` (IGNORECASE); Python `.` is anything but \n. */
const URL_PATTERN = new RegExp(`^https?://[^${PY_WS}/$.?#][^\\n][^${PY_WS}]*\\n?$`, "i");
const CYCLONEDX_SERIAL_NUMBER_URN =
  /^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\n?$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value);
}

function isValidUrl(value: unknown): value is string {
  return typeof value === "string" && URL_PATTERN.test(value);
}

/** The first valid URL from an organizationalEntity `url` (array, or a bare string). */
function firstValidUrl(url: unknown): string | null {
  if (typeof url === "string") return isValidUrl(url) ? url : null;
  if (Array.isArray(url)) {
    for (const u of url) if (isValidUrl(u)) return u;
  }
  return null;
}

/** Python `str.lower()` on `str(x or "").strip()`. */
function normalisedLower(value: unknown): string {
  return pyStrip(pyStr(truthy(value) ? value : "")).toLowerCase();
}

/** Non-empty after `str.strip()`. */
function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && pyStrip(value) !== "";
}

/**
 * What a Python `for x in value` walks for JSON values: list items, dict
 * keys, string characters. Values Python cannot iterate (None, numbers,
 * booleans) give nothing instead of raising.
 */
function pyIter(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isObject(value)) return Object.keys(value);
  if (typeof value === "string") return Array.from(value);
  return [];
}

/** Python `item in container` for JSON values; containers Python rejects give false. */
function pyIn(item: unknown, container: unknown): boolean {
  if (typeof container === "string") return typeof item === "string" && container.includes(item);
  if (Array.isArray(container)) return container.some((x) => pyEq(x, item));
  if (isObject(container)) return typeof item === "string" && hasKey(container, item);
  return false;
}

/** Python `len()` for the JSON values that have one; 0 otherwise. */
function pyLen(value: unknown): number {
  if (typeof value === "string") return Array.from(value).length;
  if (Array.isArray(value)) return value.length;
  if (isObject(value)) return Object.keys(value).length;
  return 0;
}

/** Python `==` for JSON values (True == 1, dict equality ignores key order). */
function pyEq(a: unknown, b: unknown): boolean {
  const numeric = (x: unknown): x is number | boolean => typeof x === "number" || typeof x === "boolean";
  if (numeric(a) && numeric(b)) return Number(a) === Number(b);
  if (a === null || a === undefined || b === null || b === undefined) return a === b || (a == null && b == null);
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => pyEq(x, b[i]));
  }
  if (isObject(a) && isObject(b)) {
    const ka = Object.keys(a);
    if (ka.length !== Object.keys(b).length) return false;
    return ka.every((k) => hasKey(b, k) && pyEq(a[k], b[k]));
  }
  return a === b;
}

/** `x if isinstance(x, dict) else {}` after `x or {}`. */
function asObject(value: unknown): JsonObject {
  return isObject(value) ? value : {};
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/** Python `int(part)` for the strings it accepts (ASCII digits, sign, underscores, surrounding whitespace). */
function pyInt(text: string): number | null {
  const stripped = pyStrip(text);
  if (!/^[+-]?\d+(?:_\d+)*$/.test(stripped)) return null;
  return Number(stripped.replaceAll("_", ""));
}

/** The plugin's `_parse_version`: a tuple of ints, non-numeric parts as 0. */
export function parseVersionTuple(version: string): number[] {
  let v = version.replace(/^v+/, "").replace(/^V+/, "");
  if (v.toUpperCase().startsWith("SPDX-")) v = v.slice(5);
  return v.split(".").map((part) => pyInt(part) ?? 0);
}

/** Python tuple comparison. */
function compareTuples(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i]! !== b[i]!) return a[i]! < b[i]! ? -1 : 1;
  }
  return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

/** The PEP 440 grammar `packaging.version.Version` parses (VERSION_PATTERN, verbose, ignorecase). */
const PEP440 = new RegExp(
  `^[${PY_WS}]*v?` +
    "(?:(?:([0-9]+)!)?" + // epoch
    "([0-9]+(?:\\.[0-9]+)*)" + // release
    "([-_.]?(alpha|a|beta|b|preview|pre|c|rc)[-_.]?([0-9]+)?)?" + // pre
    "((?:-([0-9]+))|(?:[-_.]?(post|rev|r)[-_.]?([0-9]+)?))?" + // post
    "([-_.]?(dev)[-_.]?([0-9]+)?)?" + // dev
    ")" +
    "(?:\\+([a-z0-9]+(?:[-_.][a-z0-9]+)*))?" + // local
    `[${PY_WS}]*$`,
  "i",
);

/** A comparison key with the same order as packaging's `_cmpkey`. */
type Pep440Key = {
  epoch: number;
  release: number[];
  /** [rank, letter, number]: rank -1 = dev-only (sorts first), 0 = has pre, 1 = no pre. */
  pre: [number, string, number];
  /** null = no post (sorts first). */
  post: number | null;
  /** null = no dev (sorts last). */
  dev: number | null;
  /** null = no local (sorts first). */
  local: Array<number | string> | null;
};

function parsePep440(version: string): Pep440Key | null {
  const m = PEP440.exec(version);
  if (!m) return null;
  const num = (s: string | undefined): number => (s === undefined ? 0 : Number(s));
  const release = m[2]!.split(".").map(Number);
  while (release.length > 0 && release[release.length - 1] === 0) release.pop();
  const hasPre = m[3] !== undefined;
  const hasPost = m[6] !== undefined;
  const hasDev = m[10] !== undefined;
  let preLetter = (m[4] ?? "").toLowerCase();
  if (preLetter === "alpha") preLetter = "a";
  else if (preLetter === "beta") preLetter = "b";
  else if (["c", "pre", "preview"].includes(preLetter)) preLetter = "rc";
  const pre: [number, string, number] = hasPre
    ? [0, preLetter, num(m[5])]
    : !hasPost && hasDev
      ? [-1, "", 0]
      : [1, "", 0];
  const post = hasPost ? num(m[7] ?? m[9]) : null;
  const dev = hasDev ? num(m[12]) : null;
  const local =
    m[13] === undefined
      ? null
      : m[13]
          .toLowerCase()
          .split(/[-_.]/)
          .map((part) => (/^[0-9]+$/.test(part) ? Number(part) : part));
  return { epoch: num(m[1]), release, pre, post, dev, local };
}

function cmp<T extends number | string>(a: T, b: T): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

function comparePep440(a: Pep440Key, b: Pep440Key): number {
  let c = cmp(a.epoch, b.epoch);
  if (c) return c;
  c = compareTuples(a.release, b.release);
  if (c) return c;
  c = cmp(a.pre[0], b.pre[0]) || cmp(a.pre[1], b.pre[1]) || cmp(a.pre[2], b.pre[2]);
  if (c) return c;
  c = cmp(a.post ?? -Infinity, b.post ?? -Infinity);
  if (c) return c;
  c = cmp(a.dev ?? Infinity, b.dev ?? Infinity);
  if (c) return c;
  if (a.local === null || b.local === null) return a.local === b.local ? 0 : a.local === null ? -1 : 1;
  // Numeric segments sort above alphanumeric ones; shorter sorts first on a tie.
  const n = Math.min(a.local.length, b.local.length);
  for (let i = 0; i < n; i++) {
    const x = a.local[i]!;
    const y = b.local[i]!;
    if (typeof x === "number" && typeof y === "number") c = cmp(x, y);
    else if (typeof x === "string" && typeof y === "string") c = cmp(x, y);
    else c = typeof x === "number" ? 1 : -1;
    if (c) return c;
  }
  return cmp(a.local.length, b.local.length);
}

/**
 * The plugin's `_version_gte`: PEP 440 comparison (`packaging.version`), and
 * the int-tuple fallback when either side is not a valid PEP 440 version.
 */
export function versionGte(version: string, minVersion: string): boolean {
  const a = parsePep440(version);
  const b = parsePep440(minVersion);
  if (a && b) return comparePep440(a, b) >= 0;
  return compareTuples(parseVersionTuple(version), parseVersionTuple(minVersion)) >= 0;
}

/** The 3.x version an SPDX 3 document names in its @context, or "". */
function spdx3ContextVersion(data: JsonObject): string {
  const context = pyGet(data, "@context", "");
  const m = /spdx\.org\/rdf\/(\d+\.\d+(?:\.\d+)?)\//.exec(pyStr(context));
  return m ? m[1]! : "";
}

/**
 * A version value as the Python carries it. The plugin calls string methods
 * on it and raised on anything else; here None reads as "" and other
 * scalars as their `str()`.
 */
function versionString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return pyStr(value);
}

/** The plugin's `_detect_format_and_version`. */
export function detectFormatAndVersion(data: unknown): [FormatKind, string] {
  if (!isObject(data)) return ["unknown", ""];

  if (hasKey(data, "spdxVersion")) {
    let version = versionString(pyGet(data, "spdxVersion", ""));
    if (version.toUpperCase().startsWith("SPDX-")) version = version.slice(5);
    return ["spdx", version];
  }

  if (isSpdx3(data)) {
    for (const elem of asList(pyGet(data, "@graph", []))) {
      if (!isObject(elem)) continue;
      if (pyEq(pyGet(elem, "type"), "CreationInfo") && truthy(pyGet(elem, "specVersion"))) {
        return ["spdx", versionString(elem["specVersion"])];
      }
      const ci = pyGet(elem, "creationInfo");
      if (isObject(ci) && truthy(pyGet(ci, "specVersion"))) return ["spdx", versionString(ci["specVersion"])];
    }
    return ["spdx", spdx3ContextVersion(data)];
  }

  const bomFormat = pyGet(data, "bomFormat");
  if (
    (typeof bomFormat === "string" && bomFormat.toLowerCase() === "cyclonedx") ||
    (hasKey(data, "specVersion") && hasKey(data, "components"))
  ) {
    return ["cyclonedx", versionString(pyGet(data, "specVersion", ""))];
  }
  return ["unknown", ""];
}

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

interface FindingInput {
  status: FindingStatus;
  details?: string | null;
  remediation?: string;
  /** Component names, when the finding lists them. */
  names?: readonly string[];
}

/** The plugin's `_create_finding`, with component lists moved to `affected`. */
function createFinding(element: Element, input: FindingInput): Finding {
  let description = FINDING_DESCRIPTIONS[element];
  if (input.details) description = `${description}. ${input.details}`;
  const finding: Finding = {
    id: FINDING_IDS[element],
    title: FINDING_TITLES[element],
    description,
    status: input.status,
  };
  if ((input.status === "fail" || input.status === "warning") && input.remediation) {
    finding.remediation = input.remediation;
  }
  if (input.names && input.names.length > 0) Object.assign(finding, affectedFields(input.names));
  return finding;
}

/** A per-component finding: fail (or `badStatus`) when any component is listed. */
function listFinding(
  element: Element,
  names: readonly string[],
  remediation: string,
  badStatus: FindingStatus = "fail",
  passDetails: string | null = null,
): Finding {
  if (names.length === 0) return createFinding(element, { status: "pass", details: passDetails, remediation });
  return createFinding(element, { status: badStatus, details: missingForSentence(names.length), remediation, names });
}

function countPhrase(count: number): string {
  return `${count} ${count === 1 ? "component" : "components"}`;
}

/** Hash: fail if any component has none, warning if any is not SHA-512, else pass. */
function hashFinding(failures: readonly string[], warnings: readonly string[], remediation: string): Finding {
  if (failures.length > 0) {
    return createFinding("hash_value", {
      status: "fail",
      details: `No hash found for ${countPhrase(failures.length)}`,
      remediation,
      names: failures,
    });
  }
  if (warnings.length > 0) {
    return createFinding("hash_value", {
      status: "warning",
      details:
        `Non-SHA-512 hash found (acceptable but not ideal) for ${countPhrase(warnings.length)}. ` +
        "BSI TR-03183-2 recommends SHA-512.",
      remediation,
      names: warnings,
    });
  }
  return createFinding("hash_value", { status: "pass", remediation });
}

function dependencyFinding(hasDeps: boolean, hasCompleteness: boolean, noCompleteness: string, remediation: string) {
  let details: string | null = null;
  if (!hasDeps) details = "No valid dependency relationships found";
  else if (!hasCompleteness) details = noCompleteness;
  return createFinding("dependencies", { status: hasDeps && hasCompleteness ? "pass" : "fail", details, remediation });
}

/** The plugin's `_check_format_version`. */
export function checkFormatVersion(format: FormatKind, version: string): Finding {
  const isSpdx = format === "spdx";
  const minVersion = isSpdx ? MIN_SPDX_VERSION : MIN_CYCLONEDX_VERSION;
  const formatName = isSpdx ? "SPDX" : "CycloneDX";

  // BSI §4 accepts officially released versions only: 3.1 must not clear
  // the floor just by sorting above 3.0.1.
  if (isSpdx && compareTuples(parseVersionTuple(version).slice(0, 2), [3, 0]) > 0) {
    return createFinding("sbom_format", {
      status: "fail",
      details: `SPDX ${version} is not an officially released version`,
      remediation:
        `BSI TR-03183-2 v2.1.0 §4 accepts officially released specification ` +
        `versions only. SPDX ${version} has not been released; send SPDX 3.0.1 ` +
        `or CycloneDX ${MIN_CYCLONEDX_VERSION}+.`,
    });
  }

  if (versionGte(version, minVersion)) {
    return createFinding("sbom_format", {
      status: "pass",
      details: `${formatName} ${version} meets minimum requirement of ${minVersion}`,
    });
  }
  const remediation =
    isSpdx && (version === "3.0" || version === "3.0.0")
      ? "BSI TR-03183-2 v2.1.0 §4 requires SPDX version 3.0.1 or higher; " +
        "SPDX 3.0 falls one patch release short. Producers that emit 3.0.1: " +
        "cdxgen 12.3.0+, and Yocto 5.2 onward (upgrade if this SBOM came " +
        "from an older Yocto). CycloneDX 1.6+ also satisfies the floor."
      : `BSI TR-03183-2 §4 requires ${formatName} version ${minVersion} or higher. ` +
        "Please regenerate your SBOM using a compliant format version.";
  return createFinding("sbom_format", {
    status: "fail",
    details: `${formatName} ${version} does not meet minimum requirement of ${minVersion}`,
    remediation,
  });
}

/**
 * The plugin's `_check_attestation_requirement`.
 *
 * The app passes the orchestrator's dependency status: whether an
 * attestation plugin (sbom-verification) passed for the stored SBOM. A
 * browser has no such status, so `assess` always calls this without one.
 * The Python reports that case as a warning reading "Dependency status not
 * available from orchestrator"; here the warning says what would satisfy the
 * check instead. With a status, the pass/fail branches match the Python.
 */
export function checkAttestationRequirement(dependencyStatus?: unknown): Finding {
  const pluginsList = SUPPORTED_ATTESTATION_PLUGINS.join(", ");

  if (!truthy(dependencyStatus)) {
    return createFinding("attestation_check", {
      status: "warning",
      details:
        "This check runs in your browser and cannot see a signature or attestation " +
        "stored next to the file, so it could not be verified",
      remediation:
        "Sign the SBOM, or publish a Sigstore attestation for it (for example with GitHub " +
        "artifact attestations or cosign), and distribute the signature with it. Uploaded to " +
        `sbomify, the SBOM passes this check when the ${pluginsList} attestation plugin ` +
        "verifies that signature. BSI TR-03183-2 requires digital signature verification.",
    });
  }

  const oneOf = pyGet(dependencyStatus, "requires_one_of", {});
  const names = (value: unknown): string => asList(value).map(pyStr).join(", ");

  if (truthy(pyGet(oneOf, "satisfied"))) {
    return createFinding("attestation_check", {
      status: "pass",
      details: `Passing attestation(s): ${names(pyGet(oneOf, "passing_plugins", []))}`,
    });
  }
  const failed = pyGet(oneOf, "failed_plugins");
  if (truthy(failed)) {
    return createFinding("attestation_check", {
      status: "fail",
      details: `Attestation plugin(s) ran but did not pass: ${names(failed)}`,
      remediation:
        "Review the attestation plugin results and resolve any issues. " +
        "The SBOM must have a valid digital signature for BSI compliance.",
    });
  }
  return createFinding("attestation_check", {
    status: "fail",
    details: "No attestation plugin has been run for this SBOM",
    remediation:
      `Run one of the following attestation plugins to verify SBOM integrity: ` +
      `${pluginsList}. BSI TR-03183-2 requires digital signature verification.`,
  });
}

// ---------------------------------------------------------------------------
// CycloneDX
// ---------------------------------------------------------------------------

/** The value of a `bsi:component:<name>` property, if it is a string. The first match wins. */
function getBsiProperty(component: JsonObject, propName: string): string | null {
  const fullName = `${BSI_PROPERTY_PREFIX}${propName}`;
  const properties = pyGet(component, "properties");
  if (!Array.isArray(properties)) return null;
  for (const prop of properties) {
    if (!isObject(prop)) continue;
    if (pyGet(prop, "name") === fullName) {
      const value = pyGet(prop, "value");
      return typeof value === "string" ? value : null;
    }
  }
  return null;
}

function cyclonedxSbomCreator(metadata: JsonObject): string | null {
  for (const sourceKey of ["manufacturer", "supplier"]) {
    const source = pyGet(metadata, sourceKey, {});
    // A truthy non-dict raised AttributeError in the Python.
    if (!truthy(source) || !isObject(source)) continue;
    const url = firstValidUrl(pyGet(source, "url"));
    if (url) return url;
    for (const contact of asObjectList(pyGet(source, "contact"))) {
      const email = pyGet(contact, "email");
      if (isValidEmail(email)) return email;
    }
  }
  for (const author of asObjectList(pyGet(metadata, "authors"))) {
    const email = pyGet(author, "email");
    if (isValidEmail(email)) return email;
  }
  return null;
}

function cyclonedxComponentCreator(component: JsonObject): string | null {
  const manufacturer = pyGet(component, "manufacturer");
  if (!truthy(manufacturer)) return null;
  if (!isObject(manufacturer)) return null;
  const url = firstValidUrl(pyGet(manufacturer, "url"));
  if (url) return url;
  const contacts = pyGet(manufacturer, "contact");
  if (truthy(contacts) && !Array.isArray(contacts)) return null;
  for (const contact of asObjectList(contacts)) {
    const email = pyGet(contact, "email", "");
    if (isValidEmail(email)) return email;
  }
  return null;
}

function hasValidCyclonedxLicence(component: JsonObject): boolean {
  for (const licence of asObjectList(pyGet(component, "licenses"))) {
    if (truthy(pyGet(licence, "expression"))) return true;
    const nested = pyGet(licence, "license");
    if (isObject(nested) && truthy(pyGet(nested, "id"))) return true;
  }
  return false;
}

function cyclonedxHasExternalRef(component: JsonObject, refTypes: readonly string[]): boolean {
  for (const ref of asObjectList(pyGet(component, "externalReferences"))) {
    if (refTypes.includes(normalisedLower(pyGet(ref, "type"))) && isNonBlankString(pyGet(ref, "url"))) return true;
  }
  return false;
}

function cyclonedxHasOriginalLicence(component: JsonObject): boolean {
  for (const licence of asObjectList(pyGet(component, "licenses"))) {
    if (normalisedLower(pyGet(licence, "acknowledgement")) === "declared") return true;
  }
  for (const propName of ["associatedLicences", "effectiveLicence"]) {
    if (isNonBlankString(getBsiProperty(component, propName))) return true;
  }
  return false;
}

/** "sha512", "other" or "none". The Python raised on non-dict entries and non-string `alg`. */
function cyclonedxComponentHash(component: JsonObject): "sha512" | "other" | "none" {
  let hasOther = false;
  const scan = (hashes: unknown): boolean => {
    for (const hash of asObjectList(hashes)) {
      const rawAlg = pyGet(hash, "alg", "");
      const alg = typeof rawAlg === "string" ? rawAlg.toUpperCase() : "";
      if (alg === "SHA-512") return true;
      if (alg) hasOther = true;
    }
    return false;
  };
  for (const ref of asObjectList(pyGet(component, "externalReferences", []))) {
    if (pyGet(ref, "type") === "distribution" && scan(pyGet(ref, "hashes", []))) return "sha512";
  }
  if (scan(pyGet(component, "hashes", []))) return "sha512";
  return hasOther ? "other" : "none";
}

function validateCyclonedx(data: JsonObject): Finding[] {
  const findings: Finding[] = [];
  const components = asObjectList(pyGet(data, "components"));
  const dependencies = asList(pyGet(data, "dependencies"));
  const compositions = asList(pyGet(data, "compositions"));
  const metadata = asObject(pyGet(data, "metadata"));

  const sbomCreator = cyclonedxSbomCreator(metadata);
  findings.push(
    createFinding("sbom_creator", {
      status: sbomCreator ? "pass" : "fail",
      details: sbomCreator ? null : "No valid email address or URL found for SBOM creator",
      remediation:
        "Add manufacturer.contact[].email or manufacturer.url in metadata section " +
        "with a valid email address or URL.",
    }),
  );

  const timestamp = pyGet(metadata, "timestamp");
  const timestampValid = isValidIsoTimestamp(timestamp);
  findings.push(
    createFinding("timestamp", {
      status: timestampValid ? "pass" : "fail",
      details: timestampValid ? null : truthy(timestamp) ? "Invalid ISO-8601 format" : "Missing timestamp",
      remediation: "Add timestamp in ISO-8601 format (e.g., 2024-01-15T12:00:00Z).",
    }),
  );

  const name: string[] = [];
  const version: string[] = [];
  const creator: string[] = [];
  const filename: string[] = [];
  const licence: string[] = [];
  const hashFail: string[] = [];
  const hashWarn: string[] = [];
  const executable: string[] = [];
  const archive: string[] = [];
  const structured: string[] = [];
  const identifier: string[] = [];
  const sourceCode: string[] = [];
  const deployable: string[] = [];
  const original: string[] = [];

  components.forEach((component, i) => {
    const componentName = displayName(pyGet(component, "name", null), `Component ${i + 1}`);
    // type=file entries (lockfiles, scan inputs) are skipped for the
    // per-component checks; only the name is still required of them.
    const isFileType = pyStr(pyGet(component, "type", "")).toLowerCase() === "file";

    if (!truthy(pyGet(component, "name"))) name.push(`Component at index ${i}`);
    if (isFileType) return;

    if (!truthy(pyGet(component, "version"))) version.push(componentName);
    if (!cyclonedxComponentCreator(component)) creator.push(componentName);
    if (!getBsiProperty(component, "filename")) filename.push(componentName);
    if (!hasValidCyclonedxLicence(component)) licence.push(componentName);

    const hash = cyclonedxComponentHash(component);
    if (hash === "none") hashFail.push(componentName);
    else if (hash === "other") hashWarn.push(componentName);

    const exe = getBsiProperty(component, "executable");
    if (exe !== "executable" && exe !== "non-executable") executable.push(componentName);
    const arc = getBsiProperty(component, "archive");
    if (arc !== "archive" && arc !== "no archive") archive.push(componentName);
    const str = getBsiProperty(component, "structured");
    if (str !== "structured" && str !== "unstructured") structured.push(componentName);

    if (!(truthy(pyGet(component, "purl")) || truthy(pyGet(component, "cpe")) || truthy(pyGet(component, "swid")))) {
      identifier.push(componentName);
    }
    if (!cyclonedxHasExternalRef(component, ["vcs", "source-distribution"])) sourceCode.push(componentName);
    if (!cyclonedxHasExternalRef(component, ["distribution", "distribution-intake"])) deployable.push(componentName);
    if (!cyclonedxHasOriginalLicence(component)) original.push(componentName);
  });

  findings.push(listFinding("component_name", name, "Add name field to all components."));
  findings.push(
    listFinding(
      "component_version",
      version,
      "Add version field to components (or file modification date per RFC 3339).",
    ),
  );
  findings.push(
    listFinding("component_creator", creator, "Add manufacturer.contact[].email or manufacturer.url to each component."),
  );
  findings.push(
    listFinding(
      "filename",
      filename,
      `Add property with name="${BSI_PROPERTY_PREFIX}filename" and the actual filename ` +
        "to each component's properties array.",
    ),
  );
  findings.push(
    listFinding(
      "distribution_licences",
      licence,
      "Add licenses array with expression field using SPDX identifiers " +
        '(e.g., {"expression": "MIT", "acknowledgement": "concluded"}).',
    ),
  );
  findings.push(
    hashFinding(
      hashFail,
      hashWarn,
      "Add hashes with alg='SHA-512' for each component. " +
        "Other algorithms (SHA-256, etc.) are acceptable but SHA-512 is recommended.",
    ),
  );
  findings.push(
    listFinding(
      "executable_property",
      executable,
      `Add property with name="${BSI_PROPERTY_PREFIX}executable" and value ` +
        '"executable" or "non-executable" to each component.',
    ),
  );
  findings.push(
    listFinding(
      "archive_property",
      archive,
      `Add property with name="${BSI_PROPERTY_PREFIX}archive" and value ` + '"archive" or "no archive" to each component.',
    ),
  );
  findings.push(
    listFinding(
      "structured_property",
      structured,
      `Add property with name="${BSI_PROPERTY_PREFIX}structured" and value ` +
        '"structured" or "unstructured" to each component.',
    ),
  );

  const hasDeps = dependencies.some((dep) => isObject(dep) && truthy(pyGet(dep, "ref")));
  const hasCompleteness = compositions.some((comp) => {
    const aggregate = pyGet(comp, "aggregate");
    return (
      isObject(comp) &&
      typeof aggregate === "string" &&
      ["complete", "incomplete", "unknown", "not_specified"].includes(aggregate)
    );
  });
  findings.push(
    dependencyFinding(
      hasDeps,
      hasCompleteness,
      "Dependencies found but missing completeness indicator in compositions",
      "Add dependencies array with ref and dependsOn fields. Also add compositions " +
        'array with aggregate field set to "complete", "incomplete", or "unknown".',
    ),
  );

  findings.push(
    listFinding(
      "unique_identifiers",
      identifier,
      "Add purl, cpe, or swid identifiers to components. Per BSI TR-03183-2 §5.2.4, " +
        "these MUST be provided if they exist for the component.",
      "warning",
      "All components have unique identifiers",
    ),
  );

  const serial = pyGet(data, "serialNumber");
  const hasSbomUri = typeof serial === "string" && CYCLONEDX_SERIAL_NUMBER_URN.test(pyStrip(serial));
  findings.push(
    createFinding("sbom_uri", {
      status: hasSbomUri ? "pass" : "warning",
      details: hasSbomUri ? null : "No serialNumber (or equivalent SBOM URI) found on the BOM",
      remediation:
        "Set the BOM serialNumber field to a URN such as urn:uuid:<uuid> so the SBOM " +
        "has a stable URI. Per BSI TR-03183-2 §5.2.3, the SBOM-URI MUST be provided if " +
        "it exists for the format.",
    }),
  );

  findings.push(
    listFinding(
      "source_code_uri",
      sourceCode,
      'Add externalReferences with type="vcs" or type="source-distribution" (CycloneDX) ' +
        "so the upstream source location is available. Per BSI TR-03183-2 §5.2.4, this " +
        "MUST be provided if it exists for the component.",
      "warning",
      "All components expose a source-code URI",
    ),
  );
  findings.push(
    listFinding(
      "uri_deployable_form",
      deployable,
      'Add externalReferences with type="distribution" or type="distribution-intake" ' +
        "so consumers can fetch the deployable artifact. Per BSI TR-03183-2 §5.2.4, " +
        "this MUST be provided if it exists for the component.",
      "warning",
      "All components expose a deployable-form URI",
    ),
  );
  findings.push(
    listFinding(
      "original_licences",
      original,
      'Mark the component\'s original license with licenses[].acknowledgement = "declared" ' +
        "(CycloneDX 1.5+) or add the bsi:component:associatedLicences / " +
        "bsi:component:effectiveLicence BSI property. Per BSI TR-03183-2 §5.2.4, original " +
        "licenses MUST be provided if they exist for the component.",
      "warning",
      "All components expose original license information",
    ),
  );

  findings.push(checkCyclonedxVulnerabilities(data));
  return findings;
}

function checkCyclonedxVulnerabilities(data: JsonObject): Finding {
  const vulnerabilities = pyGet(data, "vulnerabilities", []);
  const count = pyLen(vulnerabilities);
  const vulnExtensions = pyIter(pyGet(data, "extensions", [])).filter((e) => pyStr(e).toLowerCase().includes("vuln"));

  if (count > 0) {
    return createFinding("no_vulnerabilities", {
      status: "fail",
      details: `Found ${count} embedded vulnerabilities`,
      remediation:
        "Remove the 'vulnerabilities' array from the SBOM. " +
        "Use CSAF or VEX documents to communicate vulnerability information separately.",
    });
  }
  if (vulnExtensions.length > 0) {
    return createFinding("no_vulnerabilities", {
      status: "warning",
      details: "Found vulnerability-related extensions",
      remediation:
        "Consider removing vulnerability extensions. " + "Use CSAF or VEX documents for vulnerability information.",
    });
  }
  return createFinding("no_vulnerabilities", { status: "pass", details: "No embedded vulnerability information found" });
}

// ---------------------------------------------------------------------------
// SPDX 3
// ---------------------------------------------------------------------------

function spdx3Contact(refs: unknown, agents: Spdx3ElementMap): string | null {
  for (const ref of spdx3Refs(refs)) {
    const entity = resolveSpdx3Agent(ref, agents);
    for (const extId of iterSpdx3ExternalIdentifiers(entity)) {
      const idType = pyGet(extId, "externalIdentifierType", "");
      const identifier = pyGet(extId, "identifier", "");
      if (idType === "email" && isValidEmail(identifier)) return identifier;
      if ((idType === "urlScheme" || idType === "other") && isValidUrl(identifier)) return identifier;
    }
  }
  return null;
}

/** The plugin's `_get_spdx3_sbom_creator`. */
export function spdx3SbomCreator(creationInfo: unknown, agents: Spdx3ElementMap): string | null {
  if (!truthy(creationInfo)) return null;
  return spdx3Contact(pyGet(creationInfo, "createdBy"), agents);
}

/** The plugin's `_get_spdx3_component_creator`. */
export function spdx3ComponentCreator(pkg: unknown, agents: Spdx3ElementMap): string | null {
  return spdx3Contact(pyGet(pkg, "originatedBy"), agents);
}

/** A set key with Python's hash equality for scalars (True == 1 == 1.0); null for unhashable values. */
function scalarKey(value: unknown): string | null {
  if (value === null) return "none";
  if (typeof value === "number" || typeof value === "boolean") return `n:${Number(value)}`;
  if (typeof value === "string") return `s:${value}`;
  return null;
}

/**
 * The plugin's `_get_spdx3_related_files`, indexed once per document so a
 * large graph is not rescanned per package: hasDistributionArtifact targets
 * by `from`, and files by id.
 */
function spdx3FileIndex(relationships: readonly JsonObject[], files: readonly JsonObject[]) {
  const targetsByFrom = new Map<string, string[]>();
  for (const rel of relationships) {
    if (pyGet(rel, "relationshipType") !== "hasDistributionArtifact") continue;
    const from = scalarKey(pyGet(rel, "from"));
    if (from === null) continue;
    const targets = targetsByFrom.get(from) ?? [];
    // As in the Python, a bare-string `to` is walked character by character;
    // unhashable members (which raised there) are skipped.
    for (const toRef of pyIter(pyGet(rel, "to", []))) {
      const key = scalarKey(toRef);
      if (key !== null) targets.push(key);
    }
    targetsByFrom.set(from, targets);
  }
  const filesById = new Map<string, JsonObject[]>();
  for (const file of files) {
    const key = scalarKey(pyGet(file, "spdxId", pyGet(file, "@id")));
    if (key !== null) filesById.set(key, [...(filesById.get(key) ?? []), file]);
  }
  return (pkgId: unknown): JsonObject[] => {
    const key = scalarKey(pkgId);
    const targets = key === null ? undefined : targetsByFrom.get(key);
    if (!targets) return [];
    return [...new Set(targets)].flatMap((target) => filesById.get(target) ?? []);
  };
}

function spdx3FileHash(file: JsonObject): "sha512" | "other" | "none" {
  let hasOther = false;
  for (const verified of asObjectList(pyGet(file, "verifiedUsing", []))) {
    const alg = pyGet(verified, "algorithm", "");
    if (alg === "sha512") return "sha512";
    if (truthy(alg)) hasOther = true;
  }
  return hasOther ? "other" : "none";
}

/** The plugin's `_spdx3_has_source_code_uri`. */
export function spdx3HasSourceCodeUri(pkg: unknown): boolean {
  if (isNonBlankString(pyGet(pkg, "software_sourceInfo"))) return true;

  const externalRefs = pyGet(pkg, "externalRef");
  if (Array.isArray(externalRefs)) {
    for (const ref of externalRefs) {
      if (!isObject(ref)) continue;
      const refType = normalisedLower(pyGet(ref, "externalRefType"));
      if (refType !== "vcs" && refType !== "sourceartifact") continue;
      let locators: unknown = pyGet(ref, "locator");
      if (!truthy(locators)) locators = [];
      if (typeof locators === "string") locators = [locators];
      if (pyIter(locators).some(isNonBlankString)) return true;
    }
  }

  // Documents stored before the vocabulary fix carry an externalIdentifier
  // of type vcs/url; still read it.
  for (const extId of iterSpdx3ExternalIdentifiers(pkg)) {
    const idType = normalisedLower(pyGet(extId, "externalIdentifierType"));
    const ident = pyGet(extId, "identifier");
    if ((idType === "vcs" || idType === "url") && isNonBlankString(ident)) return true;
  }
  return false;
}

/** The plugin's `_validate_spdx3`. */
export function validateSpdx3(data: JsonObject): Finding[] {
  const findings: Finding[] = [];

  let elements: unknown;
  if (hasKey(data, "@graph")) elements = data["@graph"];
  else {
    const doc = pyGet(data, "spdxDocument", {});
    elements = isObject(doc) ? pyGet(doc, "elements", []) : [];
  }
  if (!truthy(elements)) elements = pyGet(data, "elements", []);

  const [creationInfo, packages, relationships, agents] = extractSpdx3Elements({ "@graph": elements as JsonObject[] });
  const licenses: Spdx3LicenseMap = extractSpdx3Licenses({ "@graph": elements as JsonObject[] });
  const files = pyIter(elements).filter(
    (e): e is JsonObject =>
      isObject(e) && ["software_File", "File"].includes(lastSegment(pyStr(pyGet(e, "type", pyGet(e, "@type", ""))), "/")),
  );
  const relatedFilesOf = spdx3FileIndex(relationships, files);

  const sbomCreator = spdx3SbomCreator(creationInfo, agents);
  findings.push(
    createFinding("sbom_creator", {
      status: sbomCreator ? "pass" : "fail",
      details: sbomCreator ? null : "No valid email or URL found for SBOM creator in CreationInfo",
      remediation:
        "Point createdBy at a Person or Organization element carrying an " +
        "externalIdentifier of type email or urlScheme.",
    }),
  );

  const timestamp = truthy(creationInfo) ? pyGet(creationInfo, "created") : null;
  const timestampValid = isValidIsoTimestamp(timestamp);
  findings.push(
    createFinding("timestamp", {
      status: timestampValid ? "pass" : "fail",
      details: timestampValid ? null : truthy(timestamp) ? "Invalid ISO-8601 format" : "Missing timestamp",
      remediation: "Add created field in CreationInfo with ISO-8601 format.",
    }),
  );

  const name: string[] = [];
  const version: string[] = [];
  const creator: string[] = [];
  const filename: string[] = [];
  const licence: string[] = [];
  const hashFail: string[] = [];
  const hashWarn: string[] = [];
  const executable: string[] = [];
  const archive: string[] = [];
  const structured: string[] = [];
  const identifier: string[] = [];
  const sourceCode: string[] = [];
  const deployable: string[] = [];
  const original: string[] = [];

  packages.forEach((pkg, i) => {
    const pkgName = displayName(pyGet(pkg, "name", null), `Package ${i + 1}`);

    if (!truthy(pyGet(pkg, "name"))) name.push(`Package at index ${i}`);
    if (!truthy(pyGet(pkg, "software_packageVersion"))) version.push(pkgName);
    if (!spdx3ComponentCreator(pkg, agents)) creator.push(pkgName);

    const pkgId = pyGet(pkg, "spdxId", pyGet(pkg, "@id", ""));
    const relatedFiles = relatedFilesOf(pkgId);
    if (relatedFiles.length === 0) {
      for (const list of [filename, hashFail, executable, archive, structured]) list.push(pkgName);
    } else {
      // The Python appends the package once per related file that misses a
      // property; a package is listed once here, so the count is of packages.
      const miss = { filename: false, hashFail: false, hashWarn: false, executable: false, archive: false, structured: false };
      for (const file of relatedFiles) {
        if (!truthy(pyGet(file, "name"))) miss.filename = true;
        const hash = spdx3FileHash(file);
        if (hash === "none") miss.hashFail = true;
        else if (hash === "other") miss.hashWarn = true;

        const purposes = pyGet(file, "software_additionalPurpose", []);
        const isExec = pyIn("executable", purposes);
        const isNonExec = ["source", "documentation", "data"].some((p) => pyIn(p, purposes));
        if (!isExec && !isNonExec) miss.executable = true;
        if (!pyIn("archive", purposes) && !pyIn("container", purposes)) miss.archive = true;
        if (!pyIn("container", purposes) && !pyIn("firmware", purposes)) miss.structured = true;
      }
      if (miss.filename) filename.push(pkgName);
      if (miss.hashFail) hashFail.push(pkgName);
      if (miss.hashWarn) hashWarn.push(pkgName);
      if (miss.executable) executable.push(pkgName);
      if (miss.archive) archive.push(pkgName);
      if (miss.structured) structured.push(pkgName);
    }

    if (getSpdx3PackageLicense(pkg, relationships, licenses, "hasConcludedLicense") === null) licence.push(pkgName);
    if (!getSpdx3PackageFields(pkg).hasUniqueId) identifier.push(pkgName);
    if (!spdx3HasSourceCodeUri(pkg)) sourceCode.push(pkgName);
    if (!isNonBlankString(pyGet(pkg, "software_downloadLocation"))) deployable.push(pkgName);
    if (getSpdx3PackageLicense(pkg, relationships, licenses, "hasDeclaredLicense") === null) original.push(pkgName);
  });

  findings.push(listFinding("component_name", name, "Add name field to all software_Package elements."));
  findings.push(listFinding("component_version", version, "Add software_packageVersion field to packages."));
  findings.push(
    listFinding("component_creator", creator, "Add originatedBy reference to Person/Organization with email or URL."),
  );
  findings.push(
    listFinding(
      "filename",
      filename,
      "Add software_File elements with name field via hasDistributionArtifact relationship.",
    ),
  );
  findings.push(
    listFinding(
      "distribution_licences",
      licence,
      "Add hasConcludedLicense relationship to simpleLicensing_LicenseExpression element.",
    ),
  );
  findings.push(
    hashFinding(
      hashFail,
      hashWarn,
      "Add verifiedUsing with algorithm sha512 to software_File elements. " +
        "Other algorithms (sha256, etc.) are acceptable but SHA-512 is recommended.",
    ),
  );
  findings.push(
    listFinding(
      "executable_property",
      executable,
      'Add "executable" to software_additionalPurpose array if component is executable.',
    ),
  );
  findings.push(
    listFinding(
      "archive_property",
      archive,
      'Add "archive" to software_additionalPurpose array if component is an archive.',
    ),
  );
  findings.push(
    listFinding(
      "structured_property",
      structured,
      'Add "container" or "firmware" to software_additionalPurpose to indicate structure.',
    ),
  );

  let hasDeps = false;
  let hasCompleteness = false;
  for (const rel of relationships) {
    const relType = pyGet(rel, "relationshipType", "");
    if (relType === "dependsOn" || relType === "contains") {
      hasDeps = true;
      const completeness = pyGet(rel, "completeness");
      if (completeness === "complete" || completeness === "incomplete" || completeness === "noAssertion") {
        hasCompleteness = true;
      }
    }
  }
  findings.push(
    dependencyFinding(
      hasDeps,
      hasCompleteness,
      "Dependencies found but missing completeness indicator",
      "Add Relationship elements with relationshipType 'dependsOn' or 'contains' " +
        "and completeness field set to 'complete', 'incomplete', or 'noAssertion'.",
    ),
  );

  findings.push(
    listFinding(
      "unique_identifiers",
      identifier,
      "Add software_packageUrl to each package, or an externalIdentifier " + "of type packageUrl, cpe22, cpe23 or swid.",
      "warning",
    ),
  );

  const [documentIds] = spdx3DocumentSubjects(data);
  const hasSbomUri = documentIds.size > 0;
  findings.push(
    createFinding("sbom_uri", {
      status: hasSbomUri ? "pass" : "warning",
      details: hasSbomUri ? null : "No SpdxDocument URI (spdxId) found",
      remediation: "Set the SpdxDocument element's spdxId to a URI identifying the SBOM.",
    }),
  );

  findings.push(
    listFinding(
      "source_code_uri",
      sourceCode,
      "Populate software_sourceInfo, or add an externalRef of type vcs " + "naming the source repository, for each package.",
      "warning",
    ),
  );
  findings.push(
    listFinding(
      "uri_deployable_form",
      deployable,
      "Set software_downloadLocation to the deployable artifact URL on each package.",
      "warning",
    ),
  );
  findings.push(
    listFinding(
      "original_licences",
      original,
      "Add a Relationship of type hasDeclaredLicense to a " + "simpleLicensing_LicenseExpression element on each package.",
      "warning",
    ),
  );

  findings.push(checkSpdxVulnerabilities(data));
  return findings;
}

// ---------------------------------------------------------------------------
// SPDX 2.x (fails the format floor; validated for information)
// ---------------------------------------------------------------------------

function isFilePackage(pkg: JsonObject): boolean {
  const id = pyGet(pkg, "SPDXID");
  return pyStr(truthy(id) ? id : "").includes("-File-");
}

function spdx2HasSourceCodeUri(pkg: JsonObject): boolean {
  if (isNonBlankString(pyGet(pkg, "sourceInfo"))) return true;
  const externalRefs = pyGet(pkg, "externalRefs");
  if (!Array.isArray(externalRefs)) return false;
  for (const ref of externalRefs) {
    if (!isObject(ref)) continue;
    const refType = normalisedLower(pyGet(ref, "referenceType"));
    if ((refType === "vcs" || refType === "url") && isNonBlankString(pyGet(ref, "referenceLocator"))) return true;
  }
  return false;
}

/** A string that is neither blank nor a NOASSERTION / NONE placeholder. */
function isAssertedValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const stripped = pyStrip(value);
  if (!stripped) return false;
  const upper = stripped.toUpperCase();
  return upper !== "NOASSERTION" && upper !== "NONE";
}

function validateSpdx2Legacy(data: JsonObject): Finding[] {
  const findings: Finding[] = [];
  const packages = asObjectList(pyGet(data, "packages"));
  const relationships = asObjectList(pyGet(data, "relationships"));
  const creationInfo = asObject(pyGet(data, "creationInfo"));

  const creators = asList(pyGet(creationInfo, "creators")).filter((c): c is string => typeof c === "string");
  const hasCreatorContact = creators.some((c) => c.includes("@") || c.toLowerCase().includes("http"));
  findings.push(
    createFinding("sbom_creator", {
      status: hasCreatorContact ? "pass" : "fail",
      details: hasCreatorContact ? null : "No email or URL found in creators",
      remediation: "Add creator with email or URL in creationInfo.creators array.",
    }),
  );

  const timestamp = pyGet(creationInfo, "created");
  const timestampValid = isValidIsoTimestamp(timestamp);
  findings.push(
    createFinding("timestamp", {
      status: timestampValid ? "pass" : "fail",
      details: timestampValid ? null : truthy(timestamp) ? "Invalid format" : "Missing",
      remediation: "Add created field in creationInfo with ISO-8601 timestamp.",
    }),
  );

  const label = (pkg: JsonObject, i: number) => displayName(pyGet(pkg, "name", null), `Package ${i}`);
  const nameFailures: string[] = [];
  const versionFailures: string[] = [];
  const supplierFailures: string[] = [];
  packages.forEach((pkg, i) => {
    if (!truthy(pyGet(pkg, "name"))) nameFailures.push(label(pkg, i));
    if (isFilePackage(pkg)) return;
    if (!truthy(pyGet(pkg, "versionInfo"))) versionFailures.push(label(pkg, i));
    if (!truthy(pyGet(pkg, "supplier"))) supplierFailures.push(label(pkg, i));
  });

  findings.push(listFinding("component_name", nameFailures, "Add name field to all packages."));
  findings.push(listFinding("component_version", versionFailures, "Add versionInfo field to packages."));
  findings.push(listFinding("component_creator", supplierFailures, "Add supplier field with email or URL to packages."));

  const limitation = "SPDX 2.x does not directly support this BSI requirement. Upgrade to SPDX 3.0.1+.";
  const unsupported: Element[] = [
    "filename",
    "distribution_licences",
    "hash_value",
    "executable_property",
    "archive_property",
    "structured_property",
  ];
  for (const field of unsupported) {
    findings.push(
      createFinding(field, {
        status: "fail",
        details: limitation,
        remediation: `Upgrade to SPDX 3.0.1+ to properly represent ${field.replaceAll("_", " ")}.`,
      }),
    );
  }

  const hasDeps = relationships.some((rel) => {
    const relType = pyGet(rel, "relationshipType");
    return typeof relType === "string" && ["DEPENDS_ON", "CONTAINS", "DEPENDENCY_OF"].includes(relType.toUpperCase());
  });
  findings.push(
    createFinding("dependencies", {
      status: hasDeps ? "pass" : "fail",
      details: hasDeps ? null : "No dependency relationships found",
      remediation: "Add relationships with DEPENDS_ON or CONTAINS relationship types.",
    }),
  );

  // File entries and Yocto source downloads carry no package identifiers.
  const sourceDownloads = spdx2YoctoSourceDownloads(data);
  const identifierWarnings: string[] = [];
  packages.forEach((pkg, i) => {
    const spdxId = pyGet(pkg, "SPDXID");
    if (isFilePackage(pkg) || sourceDownloads.has(pyStr(truthy(spdxId) ? spdxId : ""))) return;
    const purl = pyGet(pkg, "purl");
    const hasId =
      (typeof purl === "string" && purl !== "") ||
      asList(pyGet(pkg, "externalRefs")).some((ref) =>
        ["purl", "cpe22Type", "cpe23Type"].includes(spdx2ReferenceType(ref)),
      );
    if (!hasId) identifierWarnings.push(label(pkg, i));
  });
  findings.push(
    listFinding("unique_identifiers", identifierWarnings, "Add externalRefs with purl or CPE identifiers.", "warning"),
  );

  const namespace = pyGet(data, "documentNamespace");
  const hasSbomUri = isNonBlankString(namespace);
  findings.push(
    createFinding("sbom_uri", {
      status: hasSbomUri ? "pass" : "warning",
      details: hasSbomUri ? null : "documentNamespace is missing",
      remediation: "Set documentNamespace to a unique URI identifying this SBOM.",
    }),
  );

  const sourceCode: string[] = [];
  const deployable: string[] = [];
  const original: string[] = [];
  packages.forEach((pkg, i) => {
    if (isFilePackage(pkg)) return;
    if (!spdx2HasSourceCodeUri(pkg)) sourceCode.push(label(pkg, i));
    if (!isAssertedValue(pyGet(pkg, "downloadLocation"))) deployable.push(label(pkg, i));
    if (!isAssertedValue(pyGet(pkg, "licenseDeclared"))) original.push(label(pkg, i));
  });

  findings.push(
    listFinding(
      "source_code_uri",
      sourceCode,
      "Populate sourceInfo with the upstream source URL, or add externalRefs with " +
        "referenceType indicating the VCS location on each package.",
      "warning",
    ),
  );
  findings.push(
    listFinding(
      "uri_deployable_form",
      deployable,
      'Set downloadLocation to the URL of the deployable artifact on each package (not "NOASSERTION").',
      "warning",
    ),
  );
  findings.push(
    listFinding(
      "original_licences",
      original,
      "Populate licenseDeclared on each package. It holds the license originally " +
        "assigned by the component creator (distinct from licenseConcluded).",
      "warning",
    ),
  );

  findings.push(checkSpdxVulnerabilities(data));
  return findings;
}

/** Vulnerability elements (SPDX 3) or vulnerability annotations on packages (SPDX 2). */
function checkSpdxVulnerabilities(data: JsonObject): Finding {
  const elements = pyGet(data, "elements", pyGet(data, "@graph", []));
  const vulnElements = pyIter(elements).filter((e) => {
    if (!isObject(e)) return false;
    const type = pyStr(pyGet(e, "type", pyGet(e, "@type", "")));
    return type.includes("Vulnerability") || type.includes("VulnAssessment");
  });

  let vulnAnnotations = 0;
  for (const pkg of pyIter(pyGet(data, "packages", []))) {
    if (!isObject(pkg)) continue;
    for (const ann of pyIter(pyGet(pkg, "annotations", []))) {
      const text = pyStr(ann).toLowerCase();
      if (text.includes("vuln") || text.includes("cve")) vulnAnnotations++;
    }
  }

  if (vulnElements.length > 0) {
    return createFinding("no_vulnerabilities", {
      status: "fail",
      details: `Found ${vulnElements.length} vulnerability elements`,
      remediation:
        "Remove vulnerability elements from the SBOM. " +
        "Use CSAF or VEX documents to communicate vulnerability information separately.",
    });
  }
  if (vulnAnnotations > 0) {
    return createFinding("no_vulnerabilities", {
      status: "warning",
      details: "Found potential vulnerability annotations",
      remediation:
        "Consider removing vulnerability-related annotations. " +
        "Use CSAF or VEX documents for vulnerability information.",
    });
  }
  return createFinding("no_vulnerabilities", { status: "pass", details: "No embedded vulnerability information found" });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** The plugin's `_validate_spdx`: 3.x graph checks, or the 2.x legacy path. */
export function validateSpdx(data: JsonObject, formatVersion: string): Finding[] {
  return versionGte(formatVersion, "3.0") ? validateSpdx3(data) : validateSpdx2Legacy(data);
}

function assess(sbom: DetectedSbom): Finding[] {
  const data: unknown = sbom?.data;
  const [format, version] = detectFormatAndVersion(data);
  if (format === "unknown" || !isObject(data)) {
    return [
      {
        id: "bsi-tr03183:error",
        title: "Assessment Error",
        description:
          "Unable to detect SBOM format (expected SPDX 3.0.1+ or CycloneDX 1.6+). " +
          "BSI TR-03183-2 requires these specific format versions.",
        status: "error",
      },
    ];
  }
  const findings: Finding[] = [checkFormatVersion(format, version)];
  findings.push(...(format === "spdx" ? validateSpdx(data, version) : validateCyclonedx(data)));
  findings.push(checkAttestationRequirement());
  return findings;
}

export const bsiTr03183: Framework = {
  id: FRAMEWORK_ID,
  name: "BSI TR-03183-2 (EU Cyber Resilience Act)",
  shortName: "CRA (BSI TR-03183-2)",
  version: STANDARD_VERSION,
  url: STANDARD_URL,
  guideUrl: "https://sbomify.com/compliance/bsi-tr-03183/",
  assess,
};
