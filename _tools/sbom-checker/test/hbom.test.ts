import { describe, expect, test } from "bun:test";
import { analyse } from "../src/analyse";
import { hbomRequired } from "../src/frameworks/hbom";
import { linksFor } from "../src/links";
import { run } from "./helpers";

const EXAMPLE = await Bun.file(new URL("../../../static/tools/hbom-checker/example.hbom.json", import.meta.url)).text();
const example = () => JSON.parse(EXAMPLE);

const status = (data: unknown, id: string) => run(hbomRequired, data).byId[`hbom:${id}`]?.status;

describe("HBOM required fields", () => {
  test("the example is schema-valid, meets every required field and shows one recommendation", async () => {
    const a = await analyse(EXAMPLE, "example.hbom.json", "hbom");
    if (!a.ok) throw new Error(a.error);
    expect(a.schema.status).toBe("valid");
    expect(a.frameworks.map((f) => f.id)).toEqual(["hbom"]);
    const open = a.frameworks[0]!.findings.filter((f) => f.status !== "pass");
    expect(open.map((f) => [f.id, f.status])).toEqual([["hbom:device-identifier", "warning"]]);
    expect(a.inventory.devices).toBe(5);
    expect(a.refs).toEqual([]);
  });

  test("a document with no device components fails, and per-device checks are skipped", () => {
    const { byId, findings } = run(hbomRequired, { bomFormat: "CycloneDX", specVersion: "1.6", components: [{ type: "firmware", name: "fw", version: "1" }] });
    expect(byId["hbom:devices"]!.status).toBe("fail");
    expect(findings.map((f) => f.id)).toEqual(["hbom:devices", "hbom:subject", "hbom:timestamp"]);
  });

  test("nested devices are checked", () => {
    const d = example();
    delete d.components[0].components[0].manufacturer;
    delete d.components[0].components[1].version;
    d.components[0].components[2].name = " ";
    const { byId } = run(hbomRequired, d);
    expect(byId["hbom:device-manufacturer"]).toMatchObject({ status: "fail", affected: ["EX-SOC-400 system on chip"] });
    expect(byId["hbom:device-version"]).toMatchObject({ status: "fail", affected: ["EXF-25Q128 SPI flash"] });
    expect(byId["hbom:device-name"]!.status).toBe("fail");
  });

  test("supplier stands in for manufacturer (CycloneDX before 1.6)", () => {
    const d = example();
    d.components[0].supplier = d.components[0].manufacturer;
    delete d.components[0].manufacturer;
    expect(status(d, "device-manufacturer")).toBe("pass");
  });

  test("a purl or SWID tag satisfies the identifier", () => {
    const d = example();
    d.components[0].components[2].purl = "pkg:generic/example-radio/exw-6@2.0";
    expect(status(d, "device-identifier")).toBe("pass");
    delete d.components[0].components[2].purl;
    d.components[0].components[2].swid = { tagId: "x", name: "EXW-6" };
    expect(status(d, "device-identifier")).toBe("pass");
  });

  test("SPDX is not an HBOM", () => {
    expect(run(hbomRequired, { spdxVersion: "SPDX-2.3" }).findings).toMatchObject([{ id: "hbom:format", status: "fail" }]);
  });

  test("hostile input does not throw", () => {
    for (const d of [{}, { bomFormat: "CycloneDX", components: [null, { type: "device", manufacturer: "x", supplier: [], name: 5 }] }]) {
      expect(() => run(hbomRequired, d)).not.toThrow();
    }
  });

  test("findings get no SBOM action or guide links", () => {
    expect(linksFor("hbom", { id: "hbom:device-version" })).toEqual({});
  });
});
