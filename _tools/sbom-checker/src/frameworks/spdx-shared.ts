/**
 * Shared SPDX helpers used by multiple compliance frameworks.
 *
 * Mirrors sbomify `sbomify/apps/plugins/builtins/_spdx_shared.py`. Covers
 * both SPDX 2.x and SPDX 3.x: the SPDX 2.3 §12 annotation-subject scope and
 * the SPDX 3.0.1 rootElement semantics live here so every framework reads
 * them the same way. Hostile input never throws.
 */

import { spdx3Nodes } from "./standards";
import type { JsonObject } from "../types";
import { isObject, pyGet, pyStr, pyStrip, truthy } from "./util";

/**
 * Well-formed SPDX 3.x elements from `@graph` (or the `elements` alias).
 *
 * Prefers `@graph` when it is a list or a single-node object, otherwise the
 * `elements` alias under the same rule. Non-object entries are skipped, so a
 * malformed `@graph` (null, string, number) cannot hide a valid `elements`.
 */
export function* iterSpdx3Elements(data: unknown): Generator<JsonObject> {
  yield* spdx3Nodes(data);
}

/**
 * The external-reference types that identify a package, bare. SPDX 2.x also
 * allows each written as the full IRI it abbreviates, which is what
 * spdx2ReferenceType strips before comparing.
 */
export const SPDX2_IDENTIFIER_TYPES: ReadonlySet<string> = new Set(["purl", "cpe22Type", "cpe23Type", "swid"]);

/**
 * The bare external-reference type, whatever spelling the document used
 * (`cpe23Type` or `http://spdx.org/rdf/references/cpe23Type`). "" for
 * anything that is not a reference with a string type.
 */
export function spdx2ReferenceType(ref: unknown): string {
  if (!isObject(ref)) return "";
  const value = pyGet(ref, "referenceType");
  if (typeof value !== "string") return "";
  const i = value.lastIndexOf("/");
  return i < 0 ? value : value.slice(i + 1);
}

/**
 * SPDXIDs of the source downloads in a Yocto recipe document.
 *
 * Yocto's `create-spdx` emits one `SPDXRef-Download-<recipe>-<n>` package per
 * fetched source. It has no purl, CPE or SWID and none can be given, so it is
 * exempt from the per-package identifier check. All three must hold: the
 * document is written by OpenEmbedded's create-spdx, the SPDXID has the
 * prefix, and `downloadLocation` names a location. Empty otherwise.
 */
export function spdx2YoctoSourceDownloads(data: unknown): ReadonlySet<string> {
  const creationInfo = pyGet(data, "creationInfo");
  const creators = isObject(creationInfo) ? pyGet(creationInfo, "creators") : null;
  if (
    !Array.isArray(creators) ||
    !creators.some((c) => typeof c === "string" && c.startsWith("Tool: OpenEmbedded Core create-spdx"))
  ) {
    return new Set();
  }
  const packages = pyGet(data, "packages");
  if (!Array.isArray(packages)) return new Set();
  const out = new Set<string>();
  for (const p of packages) {
    if (!isObject(p)) continue;
    const spdxId = pyGet(p, "SPDXID");
    const location = pyGet(p, "downloadLocation");
    if (
      typeof spdxId === "string" &&
      spdxId.startsWith("SPDXRef-Download-") &&
      typeof location === "string" &&
      !["", "NOASSERTION", "NONE"].includes(pyStrip(location).toUpperCase())
    ) {
      out.add(spdxId);
    }
  }
  return out;
}

/**
 * The SPDXID of the BOM subject of an SPDX 2.x document: documentDescribes[0],
 * else the first DESCRIBES relationship from SPDXRef-DOCUMENT. null when no
 * root can be identified.
 */
export function spdx2RootSpdxid(data: unknown): string | null {
  const describes = pyGet(data, "documentDescribes");
  if (Array.isArray(describes) && describes.length > 0) {
    const first = describes[0];
    if (typeof first === "string" && first) return first;
  }
  const rawRelationships = pyGet(data, "relationships");
  const relationships = truthy(rawRelationships) ? rawRelationships : [];
  if (!Array.isArray(relationships)) return null;
  for (const rel of relationships) {
    if (!isObject(rel)) continue;
    const relType = pyGet(rel, "relationshipType");
    if (pyStr(truthy(relType) ? relType : "").toUpperCase() !== "DESCRIBES") continue;
    if (pyGet(rel, "spdxElementId") !== "SPDXRef-DOCUMENT") continue;
    const related = pyGet(rel, "relatedSpdxElement");
    if (typeof related === "string" && related) return related;
  }
  return null;
}

/**
 * Whether a top-level SPDX 2.x annotation describes the document or the BOM
 * subject (root). Per SPDX 2.3 §12 an annotation on a specific package
 * describes that package, not the document.
 *
 * An empty or missing spdxElementId counts as document-scoped only when the
 * document declares a DESCRIBES target, so an unanchored annotation cannot
 * inflate a score.
 */
export function spdx2AnnotationTargetsDocument(annotation: unknown, rootSpdxid: string | null): boolean {
  if (!isObject(annotation)) return false;
  const subject = pyGet(annotation, "spdxElementId", "");
  if (typeof subject !== "string") return false;
  if (subject === "SPDXRef-DOCUMENT") return true;
  if (subject === "") return rootSpdxid !== null;
  return rootSpdxid !== null && subject === rootSpdxid;
}

/**
 * [documentIds, rootElementIds] for an SPDX 3.x document: the spdxId of each
 * SpdxDocument element, and the ids its `rootElement` names (a bare string
 * is accepted for the JSON-LD compact single-value form).
 */
export function spdx3DocumentSubjects(data: unknown): [Set<string>, Set<string>] {
  const documentIds = new Set<string>();
  const rootElementIds = new Set<string>();
  for (const element of iterSpdx3Elements(data)) {
    const elemType = pyGet(element, "type", pyGet(element, "@type", ""));
    if (typeof elemType !== "string" || !elemType.includes("SpdxDocument")) continue;
    const docId = pyGet(element, "spdxId", pyGet(element, "@id", ""));
    if (typeof docId === "string" && docId) documentIds.add(docId);
    const rawRoots = pyGet(element, "rootElement");
    let roots: unknown = truthy(rawRoots) ? rawRoots : [];
    if (typeof roots === "string") roots = [roots];
    if (!Array.isArray(roots)) continue;
    for (const root of roots) {
      if (typeof root === "string" && root) rootElementIds.add(root);
    }
  }
  return [documentIds, rootElementIds];
}

/**
 * Whether an SPDX 3.x Annotation targets the document or one of its
 * rootElements. An empty subject counts only when a rootElement is declared.
 */
export function spdx3AnnotationSubjectMatches(
  element: unknown,
  documentIds: ReadonlySet<string>,
  rootElementIds: ReadonlySet<string>,
): boolean {
  if (!isObject(element)) return false;
  const subject = pyGet(element, "subject", pyGet(element, "annotationSubject", ""));
  if (typeof subject !== "string") return false;
  if (subject === "") return rootElementIds.size > 0;
  return documentIds.has(subject) || rootElementIds.has(subject);
}
