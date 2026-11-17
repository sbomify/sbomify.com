import { describe, expect, test } from "bun:test";
import { detect } from "../src/detect";
import { checkRef, extractRefs, toFetchable, verifyHashes, type ExternalRef } from "../src/refs";

const ref = (url: string, extra: Partial<ExternalRef> = {}): ExternalRef => ({ url, kind: "other", type: "website", source: "test", hashes: {}, ...extra });

describe("extractRefs", () => {
  test("CycloneDX: document, metadata component, nested components and services", () => {
    const refs = extractRefs(detect({
      bomFormat: "CycloneDX", specVersion: "1.6",
      externalReferences: [{ type: "bom", url: "https://example.com/parent.cdx.json", hashes: [{ alg: "SHA-256", content: "AB" }] }],
      metadata: { component: { name: "app", externalReferences: [{ type: "vcs", url: "https://example.com/app.git" }] } },
      components: [{ name: "a", version: "1", externalReferences: [{ type: "website", url: "https://example.com/a" }], components: [{ name: "b", externalReferences: [{ type: "website", url: "https://example.com/b" }] }] }],
      services: [{ name: "svc", externalReferences: [{ type: "documentation", url: "https://example.com/svc" }] }],
    }));
    expect(refs.map((r) => r.url)).toEqual(["https://example.com/parent.cdx.json", "https://example.com/app.git", "https://example.com/a", "https://example.com/b", "https://example.com/svc"]);
    expect(refs[0]).toMatchObject({ kind: "bom", hashes: { "sha-256": "ab" } });
    expect(refs[2]!.source).toBe('component "a@1"');
  });

  test("SPDX 2: externalDocumentRefs, download locations and homepages, skipping NOASSERTION", () => {
    const refs = extractRefs(detect({
      spdxVersion: "SPDX-2.3",
      externalDocumentRefs: [{ externalDocumentId: "DocumentRef-x", spdxDocument: "https://example.com/x.spdx.json", checksum: { algorithm: "SHA1", checksumValue: "AA" } }],
      packages: [{ name: "p", downloadLocation: "NOASSERTION", homepage: "https://example.com/p" }, { name: "q", downloadLocation: "git+https://example.com/q.git@v1.0" }],
    }));
    expect(refs.map((r) => [r.url, r.kind])).toEqual([["https://example.com/x.spdx.json", "bom"], ["https://example.com/p", "other"], ["git+https://example.com/q.git@v1.0", "other"]]);
    expect(refs[0]!.hashes).toEqual({ sha1: "aa" });
  });

  test("SPDX 3: externalRef locators and SpdxDocument imports", () => {
    const refs = extractRefs(detect({
      "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
      "@graph": [
        { type: "software_Package", name: "p", externalRef: [{ type: "ExternalRef", externalRefType: "vcs", locator: ["https://example.com/p.git"] }] },
        { type: "SpdxDocument", import: [{ type: "ExternalMap", externalSpdxId: "urn:x", locationHint: "https://example.com/other.spdx3.json" }] },
      ],
    }));
    expect(refs.map((r) => [r.url, r.kind])).toEqual([["https://example.com/p.git", "other"], ["https://example.com/other.spdx3.json", "bom"]]);
  });

  test("deduplicates by URL", () => {
    const refs = extractRefs(detect({ bomFormat: "CycloneDX", specVersion: "1.6", components: [1, 2].map((n) => ({ name: `c${n}`, externalReferences: [{ type: "website", url: "https://example.com/" }] })) }));
    expect(refs).toHaveLength(1);
  });
});

describe("toFetchable", () => {
  test.each([
    ["https://example.com/a", "https://example.com/a"],
    ["git+https://example.com/r.git@v1.2#sub", "https://example.com/r.git"],
  ])("%s → %s", (input, out) => expect(toFetchable(input)).toEqual({ url: out }));
  test.each(["urn:cdx:3e671687-395b-41f5-a30f-a58921a69b79/1#x", "pkg:npm/a@1", "git@github.com:a/b.git", "ftp://example.com/x", "http://example.com/x", "not a url", "https://u:p@example.com/"])("%s is skipped", (input) => {
    expect(toFetchable(input)).toHaveProperty("skip");
  });
  test("plain http is fine from an http page", () => expect(toFetchable("http://example.com/", "http:")).toEqual({ url: "http://example.com/" }));
});

describe("checkRef", () => {
  const response = (status: number, body = "") => new Response(body, { status });

  test("readable 2xx is ok", async () => {
    const r = await checkRef(ref("https://example.com/"), { fetchImpl: (async () => response(200)) as unknown as typeof fetch });
    expect(r.status).toBe("ok");
  });

  test("readable 404 is an http error", async () => {
    const r = await checkRef(ref("https://example.com/"), { fetchImpl: (async () => response(404)) as unknown as typeof fetch });
    expect(r).toMatchObject({ status: "http-error", httpStatus: 404 });
  });

  test("CORS refusal with an opaque no-cors answer is reachable", async () => {
    const f = (async (_u: string, init?: RequestInit) => {
      if (init?.mode === "cors") throw new TypeError("Failed to fetch");
      return response(200); // stands in for the opaque no-cors response
    }) as unknown as typeof fetch;
    expect((await checkRef(ref("https://example.com/"), { fetchImpl: f })).status).toBe("reachable");
  });

  test("failure in both modes is unreachable", async () => {
    const f = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect((await checkRef(ref("https://example.invalid/"), { fetchImpl: f })).status).toBe("unreachable");
  });

  test("retries HEAD-rejecting servers with GET", async () => {
    const methods: string[] = [];
    const f = (async (_u: string, init?: RequestInit) => {
      methods.push(init?.method ?? "GET");
      return response(init?.method === "HEAD" ? 405 : 200);
    }) as unknown as typeof fetch;
    expect((await checkRef(ref("https://example.com/"), { fetchImpl: f })).status).toBe("ok");
    expect(methods).toEqual(["HEAD", "GET"]);
  });

  test("verifies hashes and returns referenced SBOM bodies", async () => {
    const body = '{"bomFormat":"CycloneDX","specVersion":"1.6"}';
    const sha256 = new Bun.CryptoHasher("sha256").update(body).digest("hex");
    const f = (async () => response(200, body)) as unknown as typeof fetch;
    const good = await checkRef(ref("https://example.com/b.json", { kind: "bom", hashes: { "sha-256": sha256 } }), { fetchImpl: f });
    expect(good.hash?.status).toBe("match");
    expect(good.body).toBe(body);
    const bad = await checkRef(ref("https://example.com/b.json", { kind: "bom", hashes: { "sha-256": "00" } }), { fetchImpl: f });
    expect(bad.hash?.status).toBe("mismatch");
  });

  test("MD5 cannot be verified in a browser", async () => {
    expect((await verifyHashes(new TextEncoder().encode("x").buffer as ArrayBuffer, { md5: "00" })).status).toBe("unverifiable");
  });
});
