/**
 * The whole check for one document: parse, schema-validate, run every
 * framework and list the external references. Pure apart from loading the
 * schema validator chunk, so it runs the same in a worker and in tests.
 */
import { formatLabel, parseSbom } from "./detect";
import { FRAMEWORKS } from "./frameworks";
import { cbomRequired, cryptoAssets } from "./frameworks/cbom";
import { devices, hbomRequired } from "./frameworks/hbom";
import { aibomRequired, aiInventory } from "./frameworks/aibom";
import { extractRefs, type ExternalRef } from "./refs";
import { runFramework, type BomKind, type Framework, type FrameworkResult, type JsonObject, type SbomFormat } from "./types";
import { validateSchema, type SchemaResult } from "./validate";

export interface Inventory {
  components: number;
  dependencies: number;
  /** Components of type cryptographic-asset (CBOM checker only). */
  cryptoAssets?: number;
  /** Components of type device (HBOM checker only). */
  devices?: number;
  /** AI models and datasets (AIBOM checker only). */
  models?: number;
  datasets?: number;
}

/** What each checker runs. The CBOM, HBOM and AIBOM checkers skip the SBOM frameworks and reference checks. */
const CHECKS: Record<BomKind, Framework[]> = { sbom: FRAMEWORKS, cbom: [cbomRequired], hbom: [hbomRequired], aibom: [aibomRequired] };

export type Analysis =
  | { ok: false; name: string; error: string; hint?: string; errorKind?: string }
  | {
      ok: true;
      name: string;
      kind: BomKind;
      format: SbomFormat;
      formatLabel: string;
      specVersion: string | null;
      inventory: Inventory;
      schema: SchemaResult;
      frameworks: FrameworkResult[];
      refs: ExternalRef[];
    };

export async function analyse(text: string, name: string, kind: BomKind = "sbom"): Promise<Analysis> {
  const parsed = parseSbom(text);
  if (!parsed.ok) return { ok: false, name, error: parsed.error, hint: parsed.hint, errorKind: parsed.kind };
  const sbom = parsed.sbom;
  const schema = await validateSchema(sbom).catch(
    (err): SchemaResult => ({ status: "unsupported", reason: `Schema validation failed to run: ${err instanceof Error ? err.message : String(err)}` }),
  );
  return {
    ok: true,
    name,
    kind,
    format: sbom.format,
    formatLabel: formatLabel(sbom),
    specVersion: sbom.specVersion,
    inventory: { ...inventory(sbom.format, sbom.data, kind), ...(kind === "aibom" ? aiInventory(sbom) : {}) },
    schema,
    frameworks: CHECKS[kind].map((f) => runFramework(f, sbom)),
    refs: kind === "sbom" ? extractRefs(sbom) : [],
  };
}

function inventory(format: SbomFormat, d: JsonObject, kind: BomKind): Inventory {
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  if (format === "cyclonedx") {
    const extra = kind === "cbom" ? { cryptoAssets: cryptoAssets(d).length } : kind === "hbom" ? { devices: devices(d).length } : {};
    let components = 0;
    const walk = (cs: unknown) => {
      for (const c of list(cs)) {
        components += 1;
        if (c && typeof c === "object") walk((c as JsonObject).components);
      }
    };
    walk(d.components);
    return { components, dependencies: list(d.dependencies).reduce<number>((n, dep) => n + list((dep as JsonObject)?.dependsOn).length, 0), ...extra };
  }
  if (format === "spdx") {
    return {
      components: list(d.packages).length,
      dependencies: list(d.relationships).filter((r) => /^(DEPENDS_ON|DEPENDENCY_OF|CONTAINS)$/.test(String((r as JsonObject)?.relationshipType ?? ""))).length,
    };
  }
  if (format === "spdx3") {
    const graph = list(d["@graph"] ?? d.elements) as JsonObject[];
    return {
      components: graph.filter((e) => e && (e.type === "software_Package" || e.type === "Package")).length,
      dependencies: graph.filter((e) => e && e.type === "Relationship" && /^(dependsOn|contains)$/.test(String(e.relationshipType ?? ""))).length,
    };
  }
  return { components: 0, dependencies: 0 };
}
