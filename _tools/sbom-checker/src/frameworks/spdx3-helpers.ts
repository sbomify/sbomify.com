/**
 * SPDX 3.x extraction helpers shared by the framework checks.
 *
 * Mirrors sbomify `sbomify/apps/plugins/builtins/_spdx3_helpers.py`.
 *
 * SPDX 3.0 uses a JSON-LD graph (@context/@graph) instead of the flat SPDX
 * 2.x document. Field mappings (SPDX 2.x → 3.0.1):
 *   packages[]               → @graph elements typed "software_Package"
 *   creationInfo.creators    → CreationInfo.createdBy → Agent
 *   creationInfo.created     → CreationInfo.created
 *   package.versionInfo      → software_packageVersion
 *   package.supplier         → originatedBy (or suppliedBy) → Agent
 *   package.purl             → software_packageUrl, or an externalIdentifier
 *                              of type packageUrl
 *   package.checksums        → verifiedUsing
 *   package.licenseConcluded → Relationship hasConcludedLicense
 *   package.downloadLocation → software_downloadLocation
 *   relationships            → @graph elements typed "Relationship"
 *
 * Reading rules that keep old documents scoring:
 *   - `externalIdentifier` is the spec property; the invalid plural
 *     `externalIdentifiers` is still read because stored artifacts carry it.
 *   - `packageUrl` is the vocabulary value; `packageURL` and `purl` are
 *     accepted variants.
 *   - Anything in Agent position (createdBy, originatedBy, suppliedBy) may be
 *     a string reference, the literal "SpdxOrganization", or an inline Agent.
 *
 * Python dicts keyed by spdxId become `Map`s. Hostile input never throws.
 */

import { spdx3Nodes, cryptoHash } from "./standards";
import type { JsonObject } from "../types";
import { isObject, lastSegment, pyGet, pyStr, pyStrip, truthy } from "./util";

/** Keys Python could hash from JSON: a non-string spdxId is kept, never matched by a string ref. */
export type Spdx3Key = string | number | boolean;
/** spdxId → element, for agents and tools. */
export type Spdx3ElementMap = Map<Spdx3Key, JsonObject>;
/** spdxId → licensing element. */
export type Spdx3LicenseMap = Map<string, JsonObject>;

/** The literal "SpdxOrganization" in Agent position: the SPDX organisation itself. */
export const SPDX_ORGANIZATION_AGENT: Readonly<JsonObject> = Object.freeze({ type: "Organization", name: "SPDX" });

/** Every concrete Agent subtype plus the base type, matched on the unprefixed tail. */
export const AGENT_TYPES: ReadonlySet<string> = new Set(["Person", "Organization", "SoftwareAgent", "Agent"]);

export const UNIQUE_ID_TYPES: ReadonlySet<string> = new Set([
  "packageUrl",
  "packageURL",
  "purl",
  "cpe22",
  "cpe23",
  "swid",
  "gitoid",
  "swhid",
]);
export const PURL_ID_TYPES: ReadonlySet<string> = new Set(["packageUrl", "packageURL", "purl"]);
export const CPE_ID_TYPES: ReadonlySet<string> = new Set(["cpe23", "cpe23Type"]);

/** Python `x in frozenset(...)`: only a string can match these string sets. */
function inSet(set: ReadonlySet<string>, value: unknown): boolean {
  return typeof value === "string" && set.has(value);
}

/** Python dicts only take hashable keys; arrays/objects would raise there. */
function isKey(value: unknown): value is Spdx3Key {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/**
 * Whether the document is SPDX 3.x: an @context mentioning
 * "spdx.org/rdf/3.", a root-level @graph array, or a legacy root
 * spdxVersion starting with "SPDX-3.".
 */
export function isSpdx3(sbomData: unknown): boolean {
  if (!isObject(sbomData)) return false;
  const context = pyGet(sbomData, "@context", "");
  if (typeof context === "string") {
    if (context.includes("spdx.org/rdf/3.")) return true;
  } else if (Array.isArray(context)) {
    for (const entry of context) {
      if (pyStr(entry).includes("spdx.org/rdf/3.")) return true;
    }
  } else if (isObject(context)) {
    if (pyStr(context).includes("spdx.org/rdf/3.")) return true;
  }
  if (Array.isArray(pyGet(sbomData, "@graph"))) return true;
  const rawVersion = pyGet(sbomData, "spdxVersion");
  const spdxVersion = truthy(rawVersion) ? rawVersion : "";
  return typeof spdxVersion === "string" && spdxVersion.startsWith("SPDX-3.");
}

/**
 * The members of a set-valued SPDX 3 property as a list. JSON-LD compact
 * form writes a one-element set as a bare string or object; anything else
 * resolves nobody.
 */
export function spdx3Refs(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isObject(value)) return [value];
  if (typeof value === "string") return [value];
  return [];
}

/**
 * Resolve anything legal in an Agent position to an agent object: an inline
 * Agent, the literal "SpdxOrganization", or a reference into the graph.
 * `{}` when nothing resolves.
 */
export function resolveSpdx3Agent(ref: unknown, agents: ReadonlyMap<Spdx3Key, JsonObject>): JsonObject {
  if (isObject(ref)) return ref;
  if (ref === "SpdxOrganization") return { ...SPDX_ORGANIZATION_AGENT };
  if (typeof ref === "string") return agents.get(ref) ?? {};
  return {};
}

/** All ExternalIdentifier objects on an element, under either spelling. */
export function* iterSpdx3ExternalIdentifiers(entity: unknown): Generator<JsonObject> {
  for (const key of ["externalIdentifier", "externalIdentifiers"]) {
    const value = pyGet(entity, key);
    if (Array.isArray(value)) {
      for (const item of value) if (isObject(item)) yield item;
    }
  }
}

/** `software_packageUrl` first, else a purl-typed external identifier; null when neither. */
export function spdx3PackagePurl(pkg: unknown): string | null {
  const direct = pyGet(pkg, "software_packageUrl");
  if (typeof direct === "string" && direct) return direct;
  for (const extId of iterSpdx3ExternalIdentifiers(pkg)) {
    if (inSet(PURL_ID_TYPES, pyGet(extId, "externalIdentifierType"))) {
      const identifier = pyGet(extId, "identifier");
      if (truthy(identifier)) return pyStr(identifier);
    }
  }
  return null;
}

/** The package's CPE 2.3 identifiers, in document order. */
export function spdx3PackageCpes(pkg: unknown): string[] {
  const out: string[] = [];
  for (const extId of iterSpdx3ExternalIdentifiers(pkg)) {
    const identifier = pyGet(extId, "identifier");
    if (inSet(CPE_ID_TYPES, pyGet(extId, "externalIdentifierType")) && truthy(identifier)) {
      out.push(pyStr(identifier));
    }
  }
  return out;
}

/** Whether any supplier ref resolves to an agent. */
export function hasSpdx3Supplier(supplierRefs: readonly unknown[], agents: ReadonlyMap<Spdx3Key, JsonObject>): boolean {
  return supplierRefs.some((ref) => truthy(resolveSpdx3Agent(ref, agents)));
}

/** [creationInfo, packages, relationships, agents, tools], as the Python tuple. */
export type Spdx3Elements = [
  creationInfo: JsonObject | null,
  packages: JsonObject[],
  relationships: JsonObject[],
  agents: Spdx3ElementMap,
  tools: Spdx3ElementMap,
];

/**
 * Typed elements from @graph (or `elements`). `agents` holds every Agent
 * subtype (Person, Organization, SoftwareAgent, Agent), keyed by spdxId.
 * Falls back to a root-level creationInfo object for legacy documents.
 *
 * Includes legal embedded element/CreationInfo/Agent serializations.
 */
export function extractSpdx3Elements(data: unknown): Spdx3Elements {
  const elements = spdx3Nodes(data);

  let creationInfo: JsonObject | null = null;
  const packages: JsonObject[] = [];
  const relationships: JsonObject[] = [];
  const agents: Spdx3ElementMap = new Map();
  const tools: Spdx3ElementMap = new Map();

  for (const element of elements as unknown[]) {
    if (!isObject(element)) continue;
    const rawType = pyGet(element, "type", pyGet(element, "@type", ""));
    const elemType = truthy(rawType) ? rawType : "";
    if (typeof elemType !== "string") continue;
    const bareType = lastSegment(elemType, "/");
    if (elemType.includes("CreationInfo")) {
      creationInfo = element;
    } else if (elemType.includes("software_Package") || elemType === "Package") {
      packages.push(element);
    } else if (elemType.includes("Relationship")) {
      relationships.push(element);
    } else if (AGENT_TYPES.has(bareType)) {
      const spdxId = pyGet(element, "spdxId", pyGet(element, "@id", ""));
      if (truthy(spdxId) && isKey(spdxId)) agents.set(spdxId, element);
    } else if (elemType.includes("Tool")) {
      const spdxId = pyGet(element, "spdxId", pyGet(element, "@id", ""));
      if (truthy(spdxId) && isKey(spdxId)) tools.set(spdxId, element);
    }
  }

  if (creationInfo === null) {
    const rootCi = pyGet(data, "creationInfo");
    if (isObject(rootCi)) creationInfo = rootCi;
  }
  return [creationInfo, packages, relationships, agents, tools];
}

export interface Spdx3CreationInfoFields {
  /** Agent names and their external identifiers (emails, URLs). */
  creators: string[];
  /** Tool names from createdUsing (or the raw reference when unresolved). */
  toolEntries: string[];
  /** CreationInfo.created as written (any JSON type). */
  timestamp: unknown;
}

/**
 * Creators, tools and timestamp from a CreationInfo element.
 *
 * Python appended any truthy value; here non-string values are coerced with
 * `str()` so the lists are string-typed. Truthiness is unchanged.
 */
export function getSpdx3CreationInfoFields(
  creationInfo: unknown,
  personsOrgs: ReadonlyMap<Spdx3Key, JsonObject>,
  tools: ReadonlyMap<Spdx3Key, JsonObject> | null = null,
): Spdx3CreationInfoFields {
  if (!truthy(creationInfo) || !isObject(creationInfo)) {
    return { creators: [], toolEntries: [], timestamp: null };
  }
  const toolMap: ReadonlyMap<Spdx3Key, JsonObject> = tools ?? new Map();

  const creators: string[] = [];
  for (const ref of spdx3Refs(pyGet(creationInfo, "createdBy"))) {
    const entity = resolveSpdx3Agent(ref, personsOrgs);
    const name = pyGet(entity, "name", "");
    if (truthy(name)) creators.push(pyStr(name));
    for (const extId of iterSpdx3ExternalIdentifiers(entity)) {
      const identifier = pyGet(extId, "identifier", "");
      if (truthy(identifier)) creators.push(pyStr(identifier));
    }
  }

  const toolEntries: string[] = [];
  for (const ref of spdx3Refs(pyGet(creationInfo, "createdUsing"))) {
    if (typeof ref === "string") {
      const fromTools = toolMap.get(ref);
      const toolElement = truthy(fromTools) ? fromTools : personsOrgs.get(ref);
      if (truthy(toolElement)) {
        const toolName = pyGet(toolElement, "name", "");
        if (truthy(toolName)) {
          toolEntries.push(pyStr(toolName));
          continue;
        }
      }
      toolEntries.push(ref);
    } else if (isObject(ref)) {
      const toolName = pyGet(ref, "name", "");
      if (truthy(toolName)) toolEntries.push(pyStr(toolName));
    }
  }

  return { creators, toolEntries, timestamp: pyGet(creationInfo, "created") };
}

export interface Spdx3PackageFields {
  /** `name` as written (any JSON type; "" when absent). */
  name: unknown;
  /** `software_packageVersion` as written ("" when absent). */
  version: unknown;
  /** originatedBy members, else suppliedBy members. */
  supplierRefs: unknown[];
  hasUniqueId: boolean;
  hasHash: boolean;
  downloadLocation: unknown;
  externalRefs: unknown;
  /** Every ExternalIdentifier object, both spellings. */
  externalIdentifiers: JsonObject[];
}

/** Common fields of a software_Package element. */
export function getSpdx3PackageFields(pkg: unknown): Spdx3PackageFields {
  const name = pyGet(pkg, "name", "");
  const version = pyGet(pkg, "software_packageVersion", "");
  const originatedBy = spdx3Refs(pyGet(pkg, "originatedBy"));
  const suppliedBy = spdx3Refs(pyGet(pkg, "suppliedBy"));
  const supplierRefs = originatedBy.length > 0 ? originatedBy : suppliedBy;
  const downloadLocation = pyGet(pkg, "software_downloadLocation", "");

  const externalIdentifiers = [...iterSpdx3ExternalIdentifiers(pkg)];
  const directPurl = pyGet(pkg, "software_packageUrl");
  const contentIdentifiers = pyGet(pkg, "software_contentIdentifier");
  const hasContentIdentifier =
    Array.isArray(contentIdentifiers) &&
    contentIdentifiers.some((ci) => {
      const value = pyGet(ci, "software_contentIdentifierValue");
      return isObject(ci) && typeof value === "string" && pyStrip(value) !== "";
    });
  const hasUniqueId =
    (typeof directPurl === "string" && directPurl !== "") ||
    hasContentIdentifier ||
    externalIdentifiers.some((extId) => inSet(UNIQUE_ID_TYPES, pyGet(extId, "externalIdentifierType", "")));

  return {
    name,
    version,
    supplierRefs,
    hasUniqueId,
    hasHash: cryptoHash(pyGet(pkg, "verifiedUsing"), "algorithm", "hashValue"),
    downloadLocation,
    externalRefs: pyGet(pkg, "externalRef", []),
    externalIdentifiers,
  };
}

// ---------------------------------------------------------------------------
// Licensing
// ---------------------------------------------------------------------------

/**
 * The bare type name, whatever the serialization: full IRI
 * (.../SimpleLicensing/LicenseExpression), JSON-LD compact IRI
 * (simplelicensing:LicenseExpression) or the underscore compact form.
 */
export function licenseTypeTail(elemType: string): string {
  return lastSegment(lastSegment(elemType, "/"), ":");
}

/** The bare names plus each prefixed spelling. */
export function withVocabularyPrefixes(bases: ReadonlySet<string>, ...prefixes: string[]): ReadonlySet<string> {
  const out = new Set(bases);
  for (const base of bases) for (const prefix of prefixes) out.add(`${prefix}${base}`);
  return out;
}

export const SIMPLE_LICENSING_BASES: ReadonlySet<string> = new Set(["LicenseExpression", "SimpleLicensingText"]);
export const EXPANDED_LICENSING_BASES: ReadonlySet<string> = new Set([
  "ListedLicense",
  "CustomLicense",
  "NoAssertionLicense",
  "NoneLicense",
  "ConjunctiveLicenseSet",
  "DisjunctiveLicenseSet",
  "OrLaterOperator",
  "WithAdditionOperator",
  "ListedLicenseException",
  "CustomLicenseAddition",
]);

export const LICENSE_TYPE_TAILS: ReadonlySet<string> = new Set([
  ...withVocabularyPrefixes(SIMPLE_LICENSING_BASES, "simplelicensing_", "simpleLicensing_"),
  ...withVocabularyPrefixes(EXPANDED_LICENSING_BASES, "expandedlicensing_", "expandedLicensing_"),
]);

export const NO_LICENSE_TAILS: ReadonlySet<string> = withVocabularyPrefixes(
  new Set(["NoAssertionLicense", "NoneLicense"]),
  "expandedlicensing_",
  "expandedLicensing_",
);

/** Licensing elements from @graph (or `elements`), keyed by spdxId. */
export function extractSpdx3Licenses(data: unknown): Spdx3LicenseMap {
  const elements = spdx3Nodes(data);
  const licenses: Spdx3LicenseMap = new Map();
  if (!Array.isArray(elements)) return licenses;
  for (const element of elements) {
    if (!isObject(element)) continue;
    const rawType = pyGet(element, "type", pyGet(element, "@type", ""));
    const elemType = truthy(rawType) ? rawType : "";
    if (typeof elemType !== "string") continue;
    if (!LICENSE_TYPE_TAILS.has(licenseTypeTail(elemType))) continue;
    const spdxId = pyGet(element, "spdxId", pyGet(element, "@id", ""));
    if (typeof spdxId === "string" && spdxId) licenses.set(spdxId, element);
  }
  return licenses;
}

const URL_SCHEME = /^[A-Za-z][A-Za-z0-9+\-.]*$/;

/**
 * The licence id from a real SPDX licence-list URL (http(s)://spdx.org or
 * www.spdx.org, path /licenses/<id>), else null. A port of Python's
 * `urllib.parse.urlparse`, not a substring match, so a hostile URL cannot
 * smuggle `spdx.org/licenses/` into its path. Where urlparse would raise
 * (bad IPv6 brackets), this returns null.
 */
export function spdxListedLicenseTail(reference: string): string | null {
  // urlsplit: lstrip C0 controls and space, drop tab/CR/LF everywhere.
  let url = reference.replace(/^[\x00-\x20]+/, "").replace(/[\t\r\n]/g, "");
  let scheme = "";
  const colon = url.indexOf(":");
  if (colon > 0 && URL_SCHEME.test(url.slice(0, colon))) {
    scheme = url.slice(0, colon).toLowerCase();
    url = url.slice(colon + 1);
  }
  let netloc = "";
  if (url.startsWith("//")) {
    let delim = url.length;
    for (const c of "/?#") {
      const w = url.indexOf(c, 2);
      if (w >= 0) delim = Math.min(delim, w);
    }
    netloc = url.slice(2, delim);
    url = url.slice(delim);
    if (netloc.includes("[") || netloc.includes("]")) return null;
  }
  const hash = url.indexOf("#");
  if (hash >= 0) url = url.slice(0, hash);
  const query = url.indexOf("?");
  if (query >= 0) url = url.slice(0, query);
  // urlparse: http(s) paths split off ";params" after the last "/".
  let path = url;
  if (path.includes(";")) {
    const i = path.includes("/") ? path.indexOf(";", path.lastIndexOf("/")) : path.indexOf(";");
    if (i >= 0) path = path.slice(0, i);
  }
  if (scheme !== "http" && scheme !== "https") return null;
  if (netloc !== "spdx.org" && netloc !== "www.spdx.org") return null;
  if (!path.startsWith("/licenses/")) return null;
  const tail = path.slice("/licenses/".length).replace(/\/+$/, "");
  return tail && !tail.includes("/") ? tail : null;
}

/** Both vocabulary casings of an ExpandedLicensing property. */
export function expandedLicensingField(element: unknown, name: string): unknown {
  return pyGet(element, "expandedlicensing_" + name, pyGet(element, "expandedLicensing_" + name));
}

/**
 * The licence string a relationship target denotes, or null.
 *
 * Order: a LicenseExpression's expression, then the ExpandedLicensing
 * compound shapes (AND/OR sets, or-later, with-addition) composed
 * recursively, then a Listed/Custom licence's name, then the licence-list
 * id of a `spdx.org/licenses/…` reference with no element. NoAssertion/None
 * singletons and anything unresolvable are null.
 */
export function resolveSpdx3LicenseExpression(
  target: unknown,
  licenses: ReadonlyMap<string, JsonObject>,
  seen: ReadonlySet<string> = new Set(),
): string | null {
  let element: JsonObject | undefined;
  if (isObject(target)) {
    element = target;
  } else if (typeof target === "string") {
    if (seen.has(target)) return null; // a licence set citing itself must not recurse forever
    seen = new Set([...seen, target]);
    element = licenses.get(target);
  } else {
    return null;
  }

  if (element === undefined) {
    return typeof target === "string" ? spdxListedLicenseTail(target) : null;
  }

  const rawType = pyGet(element, "type", pyGet(element, "@type", ""));
  const elemType = truthy(rawType) ? rawType : "";
  if (typeof elemType === "string" && NO_LICENSE_TAILS.has(licenseTypeTail(elemType))) return null;

  const bareType = typeof elemType === "string" ? licenseTypeTail(elemType) : "";
  const compound = resolveCompoundLicense(bareType, element, licenses, seen);
  if (compound !== null) return compound;

  const expression = pyGet(
    element,
    "simplelicensing_licenseExpression",
    pyGet(element, "simpleLicensing_licenseExpression"),
  );
  if (typeof expression === "string" && pyStrip(expression)) return pyStrip(expression);
  const name = pyGet(element, "name");
  if (typeof name === "string" && pyStrip(name)) return pyStrip(name);
  const spdxId = pyGet(element, "spdxId", pyGet(element, "@id", ""));
  if (bareType.endsWith("SimpleLicensingText")) {
    // A nameless free-text licence still is a licence; its id identifies it.
    const text = pyGet(element, "simplelicensing_licenseText", pyGet(element, "simpleLicensing_licenseText"));
    if (typeof text === "string" && pyStrip(text) && typeof spdxId === "string" && spdxId) return spdxId;
  }
  if (typeof spdxId === "string") return spdxListedLicenseTail(spdxId);
  return null;
}

/**
 * An SPDX expression composed from the ExpandedLicensing compound shapes. A
 * compound member is parenthesized so AND/OR nesting survives.
 */
export function resolveCompoundLicense(
  bareType: string,
  element: JsonObject,
  licenses: ReadonlyMap<string, JsonObject>,
  seen: ReadonlySet<string>,
): string | null {
  const operand = (target: unknown): string | null => {
    const resolved = resolveSpdx3LicenseExpression(target, licenses, seen);
    if (resolved === null) return null;
    if (resolved.includes(" AND ") || resolved.includes(" OR ")) return `(${resolved})`;
    return resolved;
  };

  if (bareType.endsWith("ConjunctiveLicenseSet") || bareType.endsWith("DisjunctiveLicenseSet")) {
    let members = expandedLicensingField(element, "member");
    if (typeof members === "string" || isObject(members)) members = [members];
    if (!Array.isArray(members)) return null;
    // Resolve every member before judging any, as the Python does.
    const resolvedMembers = members.map(operand);
    if (resolvedMembers.length < 2) return null;
    const operands: string[] = [];
    for (const resolved of resolvedMembers) {
      if (resolved === null) return null; // an unresolvable member must not half-score
      operands.push(resolved);
    }
    return operands.join(bareType.endsWith("ConjunctiveLicenseSet") ? " AND " : " OR ");
  }

  if (bareType.endsWith("OrLaterOperator")) {
    const subject = operand(expandedLicensingField(element, "subjectLicense"));
    return subject ? `${subject}+` : null;
  }

  if (bareType.endsWith("WithAdditionOperator")) {
    const subject = operand(expandedLicensingField(element, "subjectLicense"));
    const addition = operand(expandedLicensingField(element, "subjectAddition"));
    return subject && addition ? `${subject} WITH ${addition}` : null;
  }

  return null;
}

/**
 * The resolved licence for `pkg` via `relationshipType`
 * ("hasConcludedLicense" / "hasDeclaredLicense"): the first resolvable
 * target wins. null when no relationship exists or none resolves.
 */
export function getSpdx3PackageLicense(
  pkg: unknown,
  relationships: readonly unknown[],
  licenses: ReadonlyMap<string, JsonObject>,
  relationshipType: string,
): string | null {
  const ownId = pyGet(pkg, "spdxId");
  const pkgId = truthy(ownId) ? ownId : pyGet(pkg, "@id");
  if (typeof pkgId !== "string" || !pkgId) return null;
  for (const rel of relationships) {
    if (!isObject(rel)) continue;
    if (pyGet(rel, "from") !== pkgId || pyGet(rel, "relationshipType") !== relationshipType) continue;
    let targets = pyGet(rel, "to", []);
    if (typeof targets === "string" || isObject(targets)) targets = [targets];
    if (!Array.isArray(targets)) continue;
    for (const target of targets) {
      const resolved = resolveSpdx3LicenseExpression(target, licenses);
      if (resolved) return resolved;
    }
  }
  return null;
}
