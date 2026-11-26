import { describe, expect, test } from "bun:test";
import { analyse } from "../src/analyse";
import { aibomRequired } from "../src/frameworks/aibom";
import { linksFor } from "../src/links";
import { run } from "./helpers";

const dir = new URL("../../../static/tools/aibom-checker/", import.meta.url);
const CDX = await Bun.file(new URL("example.aibom.cdx.json", dir)).text();
const SPDX = await Bun.file(new URL("example.aibom.spdx.json", dir)).text();
const cdx = () => JSON.parse(CDX);
const spdx = () => JSON.parse(SPDX);

const status = (data: unknown, id: string) => run(aibomRequired, data).byId[`aibom:${id}`]?.status;
const node = (d: { "@graph": { type: string }[] }, type: string) => d["@graph"].find((e) => e.type === type) as Record<string, unknown>;

describe("AIBOM required fields: CycloneDX", () => {
  test("the example is schema-valid, meets every required field and shows two recommendations", async () => {
    const a = await analyse(CDX, "example.aibom.cdx.json", "aibom");
    if (!a.ok) throw new Error(a.error);
    expect(a.schema.status).toBe("valid");
    expect(a.frameworks.map((f) => f.id)).toEqual(["aibom"]);
    const open = a.frameworks[0]!.findings.filter((f) => f.status !== "pass");
    expect(open.map((f) => [f.id, f.status])).toEqual([
      ["aibom:model-datasets", "warning"],
      ["aibom:model-license", "warning"],
    ]);
    expect(a.inventory).toMatchObject({ models: 2, datasets: 1 });
    expect(a.refs).toEqual([]);
  });

  test("no models fails, and per-model checks are skipped", () => {
    const { byId, findings } = run(aibomRequired, { bomFormat: "CycloneDX", specVersion: "1.6", components: [{ type: "library", name: "torch", version: "2" }] });
    expect(byId["aibom:models"]!.status).toBe("fail");
    expect(findings.map((f) => f.id)).toEqual(["aibom:spec-version", "aibom:models", "aibom:subject", "aibom:timestamp"]);
  });

  test("CycloneDX before 1.5 fails the spec version", () => {
    const d = cdx();
    d.specVersion = "1.4";
    expect(status(d, "spec-version")).toBe("fail");
  });

  test("missing supplier, version or model card fail", () => {
    const d = cdx();
    delete d.components[0].supplier;
    delete d.components[0].version;
    delete d.components[1].modelCard;
    expect(run(aibomRequired, d).byId["aibom:model-supplier"]).toMatchObject({ status: "fail", affected: ["example-ticket-classifier"] });
    expect(status(d, "model-version")).toBe("fail");
    expect(run(aibomRequired, d).byId["aibom:model-card"]).toMatchObject({ status: "fail", affected: ["example-reply-drafter"] });
    expect(status(d, "model-task")).toBe("warning");
  });

  test("authors or manufacturer stand in for supplier", () => {
    const d = cdx();
    delete d.components[0].supplier;
    d.components[0].authors = [{ name: "Jane Example" }];
    expect(status(d, "model-supplier")).toBe("pass");
    delete d.components[0].authors;
    d.components[0].manufacturer = { name: "Example Corp" };
    expect(status(d, "model-supplier")).toBe("pass");
  });
});

describe("AIBOM required fields: SPDX 3", () => {
  test("the example is schema-valid and meets everything", async () => {
    const a = await analyse(SPDX, "example.aibom.spdx.json", "aibom");
    if (!a.ok) throw new Error(a.error);
    expect(a.schema.status).toBe("valid");
    expect(a.frameworks[0]!.findings.filter((f) => f.status !== "pass")).toEqual([]);
    expect(a.inventory).toMatchObject({ models: 1, datasets: 1 });
  });

  test("the AI profile's mandatory properties fail when missing", () => {
    const d = spdx();
    const m = node(d, "ai_AIPackage");
    for (const k of ["suppliedBy", "releaseTime", "software_packageVersion", "software_downloadLocation", "software_primaryPurpose"]) delete m[k];
    const { byId } = run(aibomRequired, d);
    for (const id of ["model-supplier", "model-release-time", "model-version", "model-download-location", "model-primary-purpose"]) {
      expect(byId[`aibom:${id}`]).toMatchObject({ status: "fail", affected: ["example-ticket-classifier"] });
    }
  });

  test("the Dataset profile's mandatory properties fail when missing", () => {
    const d = spdx();
    const ds = node(d, "dataset_DatasetPackage");
    for (const k of ["originatedBy", "builtTime", "dataset_datasetType"]) delete ds[k];
    ds.dataset_datasetType = [];
    const { byId } = run(aibomRequired, d);
    expect(byId["aibom:dataset-originator"]!.status).toBe("fail");
    expect(byId["aibom:dataset-built-time"]!.status).toBe("fail");
    expect(byId["aibom:dataset-type"]!.status).toBe("fail");
    expect(byId["aibom:dataset-release-time"]!.status).toBe("pass");
  });

  test("training data and licence relationships are recommendations", () => {
    const d = spdx();
    d["@graph"] = d["@graph"].filter((e: { type: string }) => e.type !== "Relationship");
    expect(status(d, "model-datasets")).toBe("warning");
    expect(status(d, "model-license")).toBe("warning");
  });

  test("an SPDX 3 document without an AI package fails", () => {
    const d = spdx();
    d["@graph"] = d["@graph"].filter((e: { type: string }) => e.type !== "ai_AIPackage");
    expect(status(d, "models")).toBe("fail");
  });
});

describe("AIBOM: other inputs", () => {
  test("SPDX 2 cannot describe a model", () => {
    expect(run(aibomRequired, { spdxVersion: "SPDX-2.3", packages: [] }).findings).toMatchObject([{ id: "aibom:format", status: "fail" }]);
  });

  test("hostile input does not throw", () => {
    for (const d of [{}, { bomFormat: "CycloneDX", components: [null, { type: "machine-learning-model", modelCard: [], authors: "x", licenses: 3 }] }, { "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": [{ type: "ai_AIPackage" }, { type: "Relationship", from: {} }] }]) {
      expect(() => run(aibomRequired, d)).not.toThrow();
    }
  });

  test("findings get no SBOM action or guide links", () => {
    expect(linksFor("aibom", { id: "aibom:model-license" })).toEqual({});
  });
});
