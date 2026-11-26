import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { analyse } from "../src/analyse";
import { detect, parseSbom } from "../src/detect";
import type { Json } from "../src/types";
import { describePath, validateSchema } from "../src/validate";

const samples = join(import.meta.dir, "fixtures", "samples");
const read = (f: string) => {
  const buf = readFileSync(join(samples, f));
  return (f.endsWith(".gz") ? gunzipSync(buf) : buf).toString("utf8");
};

describe("format detection", () => {
  test.each([
    ["cdx-1.2-valid-metadata-author.json", "cyclonedx", "1.2"],
    ["cdx-1.3-dependencytrack.json", "cyclonedx", "1.3"],
    ["cdx-1.5-hello-world.json", "cyclonedx", "1.5"],
    ["cdx-1.6-trivy.json", "cyclonedx", "1.6"],
    ["cdx-1.7-sample.json", "cyclonedx", "1.7"],
    ["spdx-2.2-example.json", "spdx", "2.2"],
    ["spdx-2.3-trivy.json", "spdx", "2.3"],
    ["spdx-3.0.0-yocto.json.gz", "spdx3", "3.0.0"],
    ["spdx-3.0.1-yocto.json.gz", "spdx3", "3.0.1"],
  ])("%s is %s %s", (file, format, version) => {
    const r = parseSbom(read(file));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sbom.format).toBe(format as never);
    expect(r.sbom.schemaVersion).toBe(version);
  });

  test("explains XML, tag-value, non-JSON and non-objects", () => {
    expect(parseSbom("<bom/>")).toMatchObject({ ok: false, error: expect.stringContaining("XML") });
    expect(parseSbom("SPDXVersion: SPDX-2.3\nDataLicense: CC0-1.0")).toMatchObject({ ok: false, error: expect.stringContaining("tag-value") });
    expect(parseSbom("{nope")).toMatchObject({ ok: false, error: expect.stringContaining("not valid JSON") });
    expect(parseSbom("[1,2]")).toMatchObject({ ok: false });
    expect(parseSbom("")).toMatchObject({ ok: false });
  });

  test("unwraps an in-toto attestation", () => {
    const r = parseSbom(JSON.stringify({ _type: "https://in-toto.io/Statement/v1", predicateType: "https://cyclonedx.org/bom", predicate: { bomFormat: "CycloneDX", specVersion: "1.6" } }));
    expect(r.ok && r.sbom.format).toBe("cyclonedx");
  });

  test("a later SPDX 3.0.x patch is unsupported until its schema is supplied", () => {
    const d = detect({ "@context": "https://spdx.org/rdf/3.0.2/spdx-context.jsonld", "@graph": [{ type: "CreationInfo", specVersion: "3.0.2" }] });
    expect(d.schemaVersion).toBeNull();
  });

  test("an SPDX 3 pre-release layout is reported, not validated", async () => {
    const d = detect({ spdxVersion: "SPDX-3.0", elements: [] });
    expect(d.format).toBe("spdx3");
    expect(await validateSchema(d)).toMatchObject({ status: "unsupported" });
  });
});

describe("schema validation", () => {
  for (const file of readdirSync(samples).filter((f) => !f.includes("invalid"))) {
    test(`${file} is valid`, async () => {
      const r = parseSbom(read(file));
      if (!r.ok) throw new Error(r.error);
      const v = await validateSchema(r.sbom);
      expect(v.status === "invalid" ? v.issues : v.status).toBe("valid");
    });
  }

  test("reports where and why a document is invalid", async () => {
    const r = parseSbom(read("cdx-1.6-invalid-component-type.json"));
    if (!r.ok) throw new Error(r.error);
    const v = await validateSchema(r.sbom);
    expect(v.status).toBe("invalid");
    if (v.status !== "invalid") return;
    expect(v.issues[0]!.path).toBe("/components/0/type");
    expect(v.issues[0]!.location).toContain("components[0]");
    expect(v.issues[0]!.message).toContain("must be one of");
  });

  test("names misplaced properties and bad formats", async () => {
    const d = detect({ bomFormat: "CycloneDX", specVersion: "1.6", metadata: { timestamp: "yesterday" }, components: [{ type: "library", name: "x", bogus: true }] });
    const v = await validateSchema(d);
    if (v.status !== "invalid") throw new Error(v.status);
    const messages = v.issues.map((i) => `${i.location}: ${i.message}`);
    expect(messages).toContainEqual(expect.stringContaining('metadata → timestamp: Value is not a valid date-time'));
    expect(messages).toContainEqual(expect.stringContaining('Property "bogus" is not allowed'));
  });

  test("unknown CycloneDX version is unsupported, not invalid", async () => {
    expect(await validateSchema(detect({ bomFormat: "CycloneDX", specVersion: "9.9" }))).toMatchObject({ status: "unsupported" });
  });

  test("describePath names array members", () => {
    const data: Json = { components: [{ name: "a" }, { name: "lodash", licenses: [{}] }] };
    expect(describePath("/components/1/licenses/0", data)).toBe('components[1] "lodash" → licenses[0]');
    expect(describePath("", data)).toBe("document root");
  });
});

describe("analyse", () => {
  test("runs every framework on a real document", async () => {
    const a = await analyse(read("cdx-1.6-trivy.json"), "trivy.json");
    if (!a.ok) throw new Error(a.error);
    expect(a.frameworks.map((f) => f.id)).toHaveLength(4);
    for (const f of a.frameworks) {
      expect(f.findings.length).toBeGreaterThan(0);
      expect(f.summary.error).toBe(0);
    }
    expect(a.inventory.components).toBeGreaterThan(0);
  });

  test("never throws on hostile shapes", async () => {
    const shapes = [
      { bomFormat: "CycloneDX", specVersion: "1.6", components: "x", metadata: 5, dependencies: [null, 1, "a"] },
      { bomFormat: "CycloneDX", specVersion: "1.6", components: [null, 1, [], { name: 5, supplier: "x", hashes: {}, licenses: [null] }] },
      { spdxVersion: "SPDX-2.3", packages: [null, { name: [] }], relationships: {}, creationInfo: [] },
      { "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": [null, 1, { type: 7 }, { type: "software_Package", originatedBy: 3 }] },
    ];
    for (const s of shapes) {
      const a = await analyse(JSON.stringify(s), "hostile.json");
      expect(a.ok).toBe(true);
      if (a.ok) for (const f of a.frameworks) expect(f.summary.error, `${f.id} on ${JSON.stringify(s)}`).toBe(0);
    }
  });
});
