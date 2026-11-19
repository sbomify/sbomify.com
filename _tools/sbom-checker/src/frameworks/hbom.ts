/**
 * HBOM (Hardware Bill of Materials) required fields.
 *
 * An HBOM is a CycloneDX document whose components include hardware: type
 * `device`. The schema requires only a type and a name for each component;
 * these checks add what identifies a part: a non-empty name, who made it,
 * and its version or revision, with a machine-readable identifier (a CPE
 * with part `h`, or a package URL) recommended.
 */
import type { DetectedSbom, Finding, Framework, JsonObject } from "../types";
import { allComponents, documentChecks, label, notCycloneDx, perComponent, present, single, sub } from "./bom-common";
import { isObject } from "./util";

const P = "hbom";

export const isDevice = (c: unknown): c is JsonObject => isObject(c) && c.type === "device";

export function devices(data: JsonObject): JsonObject[] {
  return allComponents(data).filter(isDevice);
}

function hasMaker(c: JsonObject): boolean {
  return present(sub(c, "manufacturer")?.name) || present(sub(c, "supplier")?.name);
}

function assess(sbom: DetectedSbom): Finding[] {
  if (sbom.format !== "cyclonedx") return [notCycloneDx(P, "HBOM", sbom)];
  const data = sbom.data;
  const list = devices(data);
  const findings: Finding[] = [
    single(
      {
        id: `${P}:devices`,
        title: "Hardware components",
        about: "An HBOM lists hardware as components of type `device`: boards, chips, modules and the parts they are built from.",
        missing: "fail",
        remediation: "Describe each hardware part as a component of type `device`, nesting parts under the assembly they belong to with `components`.",
      },
      list.length > 0,
      list.length ? `Found ${list.length}.` : "None found.",
    ),
  ];

  if (list.length) {
    const noun: [string, string] = ["device", "devices"];
    const names = (bad: (c: JsonObject) => boolean) => list.flatMap((c, i) => (bad(c) ? [label(c, i)] : []));
    findings.push(
      perComponent(
        {
          id: `${P}:device-name`,
          title: "Device name",
          about: "`name` is the designation the manufacturer gives the part.",
          missing: "fail",
          remediation: "Set `name` on every device to the manufacturer's designation for the part.",
        },
        names((c) => !present(c.name)),
        list.length,
        noun,
      ),
      perComponent(
        {
          id: `${P}:device-manufacturer`,
          title: "Manufacturer",
          about: "`manufacturer` (CycloneDX 1.6+) or `supplier` says who made the part.",
          missing: "fail",
          remediation: "Set `manufacturer.name` (CycloneDX 1.6 and later) or `supplier.name` on every device.",
        },
        names((c) => !hasMaker(c)),
        list.length,
        noun,
      ),
      perComponent(
        {
          id: `${P}:device-version`,
          title: "Version or revision",
          about: "`version` records the model, hardware revision or part number that distinguishes this part from others with the same name.",
          missing: "fail",
          remediation: "Set `version` on every device to its hardware revision, model or part number.",
        },
        names((c) => !present(c.version)),
        list.length,
        noun,
      ),
      perComponent(
        {
          id: `${P}:device-identifier`,
          title: "Unique identifier",
          about: "A CPE (part h, for hardware), package URL or SWID tag lets the part be matched against vulnerability and end-of-life data.",
          missing: "warning",
          remediation: "Add a `cpe` (for example `cpe:2.3:h:vendor:product:revision:*:*:*:*:*:*:*`) or a `purl` to every device.",
        },
        names((c) => !present(c.cpe) && !present(c.purl) && !isObject(c.swid)),
        list.length,
        noun,
      ),
    );
  }

  findings.push(...documentChecks(P, "HBOM", data));
  return findings;
}

export const hbomRequired: Framework = {
  id: "hbom",
  name: "HBOM required fields",
  shortName: "Required fields",
  version: "CycloneDX 1.2+",
  url: "https://cyclonedx.org/capabilities/hbom/",
  guideUrl: "",
  assess,
};
