/**
 * External references: collect every URL an SBOM points at, check whether
 * each one resolves, verify declared hashes, and fetch referenced SBOMs so
 * they can be checked too.
 *
 * Everything runs in the visitor's browser, so two browser rules shape the
 * results:
 *  - CORS. A server that does not send Access-Control-Allow-Origin cannot
 *    be read from another origin. We then retry in `no-cors` mode: an
 *    opaque response still proves the host answered, but not with which
 *    status, so it reports as "reachable" rather than "ok".
 *  - Mixed content. An https page may not fetch plain http URLs, so those
 *    are reported as not checked rather than as broken.
 */
import type { DetectedSbom, Json, JsonObject } from "./types";

export type RefKind = "bom" | "other";

export interface ExternalRef {
  url: string;
  kind: RefKind;
  /** Reference type as written: "bom", "vcs", "downloadLocation", ... */
  type: string;
  /** Where in the document it was found, e.g. `component "lodash"`. */
  source: string;
  /** Declared digests, algorithm (lowercase, e.g. "sha-256") to hex. */
  hashes: Record<string, string>;
}

export type RefStatus =
  | "ok" // fetched, 2xx
  | "reachable" // host answered, status hidden by CORS
  | "http-error" // fetched, non-2xx
  | "unreachable" // network error, DNS failure or timeout
  | "skipped"; // not fetchable from a browser (scheme, mixed content, BOM-Link)

export interface RefCheck {
  ref: ExternalRef;
  status: RefStatus;
  detail: string;
  httpStatus?: number;
  /** Hash verification: undefined when there was nothing to verify. */
  hash?: { status: "match" | "mismatch" | "unverifiable"; detail: string };
  /** Body, when it was readable and the reference points at an SBOM. */
  body?: string;
}

const isObject = (v: unknown): v is JsonObject => typeof v === "object" && v !== null && !Array.isArray(v);
const asList = (v: Json | undefined): Json[] => (Array.isArray(v) ? v : []);
const str = (v: Json | undefined): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Values SPDX uses to say "no location"; never fetched. */
const SPDX_NO_VALUE = new Set(["NOASSERTION", "NONE"]);

const ALGORITHMS: Record<string, string> = {
  "sha-1": "SHA-1",
  sha1: "SHA-1",
  "sha-256": "SHA-256",
  sha256: "SHA-256",
  "sha-384": "SHA-384",
  sha384: "SHA-384",
  "sha-512": "SHA-512",
  sha512: "SHA-512",
};

function hashMap(list: Json | undefined, algKey: string, valueKey: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of asList(list)) {
    if (!isObject(h)) continue;
    const alg = str(h[algKey]);
    const value = str(h[valueKey]);
    if (alg && value) out[alg.toLowerCase()] = value.toLowerCase();
  }
  return out;
}

/** Collect every external reference in the document, deduplicated by URL. */
export function extractRefs(sbom: DetectedSbom): ExternalRef[] {
  const refs: ExternalRef[] = [];
  const add = (r: ExternalRef) => {
    if (!r.url) return;
    const existing = refs.find((x) => x.url === r.url);
    if (existing) {
      if (r.kind === "bom") existing.kind = "bom";
      Object.assign(existing.hashes, r.hashes);
      return;
    }
    refs.push(r);
  };
  const d = sbom.data;

  if (sbom.format === "cyclonedx") {
    const fromList = (list: Json | undefined, source: string) => {
      for (const er of asList(list)) {
        if (!isObject(er)) continue;
        const url = str(er.url);
        const type = str(er.type) ?? "other";
        if (url) add({ url, kind: type === "bom" ? "bom" : "other", type, source, hashes: hashMap(er.hashes, "alg", "content") });
      }
    };
    fromList(d.externalReferences, "document");
    const meta = isObject(d.metadata) ? d.metadata : {};
    if (isObject(meta.component)) fromList(meta.component.externalReferences, componentLabel(meta.component, "metadata component"));
    const walk = (list: Json | undefined) => {
      for (const c of asList(list)) {
        if (!isObject(c)) continue;
        fromList(c.externalReferences, componentLabel(c, "component"));
        walk(c.components);
      }
    };
    walk(d.components);
    for (const s of asList(d.services)) if (isObject(s)) fromList(s.externalReferences, componentLabel(s, "service"));
  } else if (sbom.format === "spdx") {
    for (const ed of asList(d.externalDocumentRefs)) {
      if (!isObject(ed)) continue;
      const url = str(ed.spdxDocument);
      const checksum = isObject(ed.checksum) ? ed.checksum : {};
      const alg = str(checksum.algorithm);
      const value = str(checksum.checksumValue);
      if (url) add({ url, kind: "bom", type: "externalDocumentRef", source: `externalDocumentRefs ${str(ed.externalDocumentId) ?? ""}`.trim(), hashes: alg && value ? { [alg.toLowerCase()]: value.toLowerCase() } : {} });
    }
    for (const p of asList(d.packages)) {
      if (!isObject(p)) continue;
      const source = componentLabel(p, "package");
      for (const key of ["downloadLocation", "homepage"] as const) {
        const v = str(p[key]);
        if (v && !SPDX_NO_VALUE.has(v.toUpperCase())) add({ url: v, kind: "other", type: key, source, hashes: {} });
      }
      for (const er of asList(p.externalRefs)) {
        if (!isObject(er)) continue;
        const loc = str(er.referenceLocator);
        if (loc && /^https?:\/\//i.test(loc)) add({ url: loc, kind: "other", type: str(er.referenceType) ?? "externalRef", source, hashes: {} });
      }
    }
  } else if (sbom.format === "spdx3") {
    const graph = Array.isArray(d["@graph"]) ? d["@graph"] : Array.isArray(d.elements) ? d.elements : [];
    for (const el of graph) {
      if (!isObject(el)) continue;
      const source = componentLabel(el, String(el.type ?? "element"));
      for (const er of asList(el.externalRef)) {
        if (!isObject(er)) continue;
        const type = str(er.externalRefType) ?? "other";
        for (const loc of asList(er.locator)) {
          const url = str(loc);
          if (url && /^[a-z][a-z0-9+.-]*:/i.test(url)) add({ url, kind: "other", type, source, hashes: {} });
        }
      }
      for (const key of ["software_downloadLocation", "software_homePage"] as const) {
        const v = str(el[key]);
        if (v) add({ url: v, kind: "other", type: key.replace("software_", ""), source, hashes: {} });
      }
      // SpdxDocument.import (3.0.1) / imports (3.0.0): ExternalMap entries for
      // elements defined in other documents, with a hint where to find them.
      for (const im of [...asList(el.import), ...asList(el.imports)]) {
        if (!isObject(im)) continue;
        const url = str(im.locationHint);
        if (url) {
          const hashes: Record<string, string> = {};
          const ver = isObject(im.verifiedUsing) ? [im.verifiedUsing] : asList(im.verifiedUsing);
          for (const h of ver) {
            if (isObject(h) && str(h.algorithm) && str(h.hashValue)) hashes[str(h.algorithm)!.toLowerCase()] = str(h.hashValue)!.toLowerCase();
          }
          add({ url, kind: "bom", type: "import", source: `import ${str(im.externalSpdxId) ?? ""}`.trim(), hashes });
        }
      }
    }
  }
  return refs;
}

function componentLabel(c: JsonObject, fallback: string): string {
  const name = str(c.name);
  const version = str(c.version) ?? str(c.versionInfo) ?? str(c.software_packageVersion);
  if (!name) return fallback;
  return `${fallback} "${name}${version ? "@" + version : ""}"`;
}

/** Map a reference to a URL a browser can fetch, or explain why not. */
export function toFetchable(url: string, pageProtocol = "https:"): { url: string } | { skip: string } {
  let u = url.trim();
  if (/^urn:cdx:/i.test(u)) return { skip: "BOM-Link (urn:cdx). It names a BOM by serial number rather than a location, so there is nothing to fetch." };
  if (/^(pkg|cpe|swid|urn):/i.test(u)) return { skip: "An identifier, not a location." };
  // SPDX VCS locations: git+https://host/repo.git@rev#path
  const vcs = u.match(/^(?:git|hg|svn|bzr)\+(https?:\/\/.+)$/i);
  if (vcs) u = vcs[1]!.replace(/@[^/@]+(#.*)?$/, "").replace(/#.*$/, "");
  if (/^git@|^ssh:\/\/|^git:\/\//i.test(u)) return { skip: "An SSH or git:// address. Browsers can only fetch http(s)." };
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return { skip: "Not a valid absolute URL." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { skip: `The ${parsed.protocol} scheme cannot be fetched from a browser.` };
  if (parsed.protocol === "http:" && pageProtocol === "https:") {
    return { skip: "Plain http. Browsers block it from an https page; consider publishing it over https." };
  }
  if (parsed.username || parsed.password) return { skip: "The URL embeds credentials, so it was not requested." };
  return { url: parsed.toString() };
}

export interface CheckOptions {
  timeoutMs?: number;
  pageProtocol?: string;
  fetchImpl?: typeof fetch;
  /** Largest body kept for hashing or expanding, in bytes. */
  maxBodyBytes?: number;
}

const MAX_BODY = 25 * 1024 * 1024;

export async function checkRef(ref: ExternalRef, opts: CheckOptions = {}): Promise<RefCheck> {
  const target = toFetchable(ref.url, opts.pageProtocol);
  if ("skip" in target) return { ref, status: "skipped", detail: target.skip };
  const doFetch = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const wantBody = ref.kind === "bom" || Object.keys(ref.hashes).length > 0;

  const attempt = async (mode: RequestMode) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await doFetch(target.url, { mode, method: wantBody || mode === "no-cors" ? "GET" : "HEAD", redirect: "follow", signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await attempt("cors");
    // Some servers reject HEAD; retry with GET before calling it an error.
    if (!wantBody && (res.status === 405 || res.status === 501)) {
      res = await doFetch(target.url, { mode: "cors", method: "GET", credentials: "omit", referrerPolicy: "no-referrer" });
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return { ref, status: "unreachable", detail: `No response within ${Math.round(timeoutMs / 1000)} seconds.` };
    // A TypeError here is either a network failure or a CORS refusal; the
    // browser does not say which. no-cors tells them apart.
    try {
      await attempt("no-cors");
      return withHashNote({ ref, status: "reachable", detail: "The server answered, but does not allow cross-origin reads, so the HTTP status and content cannot be inspected from the browser." });
    } catch (err2) {
      if (err2 instanceof Error && err2.name === "AbortError") return { ref, status: "unreachable", detail: `No response within ${Math.round(timeoutMs / 1000)} seconds.` };
      return { ref, status: "unreachable", detail: "The request failed: the host did not resolve, refused the connection, or has a TLS problem." };
    }
  }

  if (!res.ok) {
    return withHashNote({ ref, status: "http-error", httpStatus: res.status, detail: `The server returned HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}.` });
  }
  const check: RefCheck = { ref, status: "ok", httpStatus: res.status, detail: `HTTP ${res.status}.` };
  if (wantBody) {
    const buf = await readCapped(res, opts.maxBodyBytes ?? MAX_BODY);
    if (!buf) {
      check.hash = Object.keys(ref.hashes).length ? { status: "unverifiable", detail: "The file is too large to hash in the browser." } : undefined;
      return check;
    }
    if (Object.keys(ref.hashes).length) check.hash = await verifyHashes(buf, ref.hashes);
    if (ref.kind === "bom") check.body = new TextDecoder().decode(buf);
  }
  return check;
}

function withHashNote(c: RefCheck): RefCheck {
  if (Object.keys(c.ref.hashes).length) c.hash = { status: "unverifiable", detail: "The content could not be read, so the declared hash was not verified." };
  return c;
}

async function readCapped(res: Response, max: number): Promise<ArrayBuffer | null> {
  const len = Number(res.headers.get("content-length") ?? "0");
  if (len > max) return null;
  const buf = await res.arrayBuffer();
  return buf.byteLength > max ? null : buf;
}

export async function verifyHashes(buf: ArrayBuffer, hashes: Record<string, string>): Promise<NonNullable<RefCheck["hash"]>> {
  const unsupported: string[] = [];
  for (const [alg, expected] of Object.entries(hashes)) {
    const webAlg = ALGORITHMS[alg];
    if (!webAlg) {
      unsupported.push(alg.toUpperCase());
      continue;
    }
    const digest = await crypto.subtle.digest(webAlg, buf);
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex !== expected) return { status: "mismatch", detail: `${webAlg} is ${hex}, but the SBOM declares ${expected}. The referenced file has changed since the SBOM was written, or the hash is wrong.` };
    return { status: "match", detail: `${webAlg} matches the declared value.` };
  }
  return { status: "unverifiable", detail: `The browser cannot compute ${unsupported.join(", ")}.` };
}

/** Run checks with bounded concurrency, reporting progress. */
export async function checkRefs(refs: ExternalRef[], opts: CheckOptions & { concurrency?: number; onProgress?: (done: number, total: number) => void } = {}): Promise<RefCheck[]> {
  const results: RefCheck[] = new Array(refs.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < refs.length) {
      const i = next++;
      results[i] = await checkRef(refs[i]!, opts);
      done += 1;
      opts.onProgress?.(done, refs.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.concurrency ?? 6, refs.length) }, worker));
  return results;
}
