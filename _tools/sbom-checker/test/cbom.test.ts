import { describe, expect, test } from "bun:test";
import { analyse } from "../src/analyse";
import { cbomRequired } from "../src/frameworks/cbom";
import { linksFor } from "../src/links";
import { run } from "./helpers";

const EXAMPLE = await Bun.file(new URL("../../../static/tools/cbom-checker/example.cbom.json", import.meta.url)).text();
const example = () => JSON.parse(EXAMPLE);

const status = (data: unknown, id: string) => run(cbomRequired, data).byId[`cbom:${id}`]?.status;

describe("CBOM required fields", () => {
  test("the example passes every check and its schema", async () => {
    const a = await analyse(EXAMPLE, "example.cbom.json", "cbom");
    if (!a.ok) throw new Error(a.error);
    expect(a.schema.status).toBe("valid");
    expect(a.frameworks.map((f) => f.id)).toEqual(["cbom"]);
    expect(a.frameworks[0]!.findings.filter((f) => f.status !== "pass")).toEqual([]);
    expect(a.inventory.cryptoAssets).toBe(6);
    expect(a.refs).toEqual([]);
  });

  test("a software SBOM with no crypto assets fails, and per-asset checks are skipped", () => {
    const { byId, findings } = run(cbomRequired, { bomFormat: "CycloneDX", specVersion: "1.6", components: [{ type: "library", name: "x", version: "1" }] });
    expect(byId["cbom:crypto-assets"]!.status).toBe("fail");
    expect(findings.map((f) => f.id)).toEqual(["cbom:spec-version", "cbom:crypto-assets", "cbom:subject", "cbom:timestamp"]);
  });

  test("CycloneDX before 1.6 fails the spec version, with a hint for pre-standard CBOMs", () => {
    const d = example();
    d.specVersion = "1.4";
    d.components[0].type = "crypto-asset";
    const f = run(cbomRequired, d).byId["cbom:spec-version"]!;
    expect(f.status).toBe("fail");
    expect(f.remediation).toContain("crypto-asset");
  });

  test("an asset without cryptoProperties or with an unknown assetType fails asset-type", () => {
    const d = example();
    delete d.components[0].cryptoProperties;
    d.components[1].cryptoProperties.assetType = "cipher";
    const f = run(cbomRequired, d).byId["cbom:asset-type"]!;
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["AES-256-GCM", "SHA256withRSA"]);
  });

  test("components carrying cryptoProperties count as crypto assets whatever their type", () => {
    const d = example();
    d.components[0].type = "library";
    expect(run(cbomRequired, d).byId["cbom:crypto-assets"]!.description).toContain("Found 6");
  });

  test("type-specific required properties", () => {
    const d = example();
    delete d.components[0].cryptoProperties.algorithmProperties.primitive;
    delete d.components[3].cryptoProperties.relatedCryptoMaterialProperties.type;
    delete d.components[4].cryptoProperties.certificateProperties.issuerName;
    delete d.components[4].cryptoProperties.certificateProperties.notValidAfter;
    delete d.components[5].cryptoProperties.protocolProperties.type;
    expect(status(d, "algorithm-primitive")).toBe("fail");
    expect(status(d, "material-type")).toBe("fail");
    expect(status(d, "certificate-identity")).toBe("fail");
    expect(status(d, "certificate-validity")).toBe("warning");
    expect(status(d, "protocol-type")).toBe("fail");
  });

  test("checks for an asset type are only shown when the CBOM has that type", () => {
    const d = example();
    d.components = d.components.filter((c: { cryptoProperties: { assetType: string } }) => c.cryptoProperties.assetType === "algorithm");
    const ids = run(cbomRequired, d).findings.map((f) => f.id);
    expect(ids).toContain("cbom:algorithm-primitive");
    expect(ids).not.toContain("cbom:certificate-identity");
    expect(ids).not.toContain("cbom:protocol-type");
    expect(ids).not.toContain("cbom:material-type");
    expect(ids).not.toContain("cbom:asset-references");
  });

  test("missing OID and bom-ref are warnings", () => {
    const d = example();
    delete d.components[0].cryptoProperties.oid;
    delete d.components[1]["bom-ref"];
    expect(status(d, "algorithm-oid")).toBe("warning");
    expect(status(d, "bom-ref")).toBe("warning");
  });

  test("a reference to a bom-ref that is not in the document fails", () => {
    const d = example();
    d.components[5].cryptoProperties.protocolProperties.cipherSuites[0].algorithms.push("crypto/algorithm/missing");
    const f = run(cbomRequired, d).byId["cbom:asset-references"]!;
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["TLS 1.3"]);
  });

  test("1.7 relatedCryptographicAssets are followed", () => {
    const d = example();
    d.specVersion = "1.7";
    d.components[3].cryptoProperties.relatedCryptoMaterialProperties.relatedCryptographicAssets = [{ type: "algorithm", ref: "nope" }];
    expect(status(d, "asset-references")).toBe("fail");
  });

  test("a crypto asset as metadata.component counts", () => {
    const d = example();
    d.metadata.component = d.components[0];
    d.components = [];
    expect(status(d, "crypto-assets")).toBe("pass");
  });

  test("missing metadata.component and timestamp are warnings", () => {
    const d = example();
    delete d.metadata;
    expect(status(d, "subject")).toBe("warning");
    expect(status(d, "timestamp")).toBe("warning");
  });

  test("SPDX is not a CBOM", () => {
    const { findings } = run(cbomRequired, { spdxVersion: "SPDX-2.3", packages: [] });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ id: "cbom:format", status: "fail" });
  });

  test("hostile input does not throw", () => {
    for (const d of [{}, { bomFormat: "CycloneDX", components: [null, 1, "x", { cryptoProperties: null }, { type: "cryptographic-asset", cryptoProperties: { assetType: "protocol", protocolProperties: { cipherSuites: [null, { algorithms: 5 }], cryptoRefArray: "x" } } }] }]) {
      expect(() => run(cbomRequired, d)).not.toThrow();
    }
  });

  test("findings get no SBOM action or guide links", () => {
    expect(linksFor("cbom", { id: "cbom:timestamp" })).toEqual({});
  });
});
