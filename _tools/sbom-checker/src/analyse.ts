/**
 * The whole check for one document: parse, schema-validate, run every
 * framework and list the external references. Pure apart from loading the
 * schema validator chunk, so it runs the same in a worker and in tests.
 */
import { formatLabel, parseSbom } from "./detect";
import { FRAMEWORKS } from "./frameworks";
import { extractRefs, type ExternalRef } from "./refs";
import { runFramework, type FrameworkResult, type JsonObject, type SbomFormat } from "./types";
import { validateSchema, type SchemaResult } from "./validate";

export interface Inventory {
  components: number;
  dependencies: number;
}

export type Analysis =
  | { ok: false; name: string; error: string; hint?: string }
  | {
      ok: true;
      name: string;
      format: SbomFormat;
      formatLabel: string;
      specVersion: string | null;
      inventory: Inventory;
      schema: SchemaResult;
      frameworks: FrameworkResult[];
      refs: ExternalRef[];
    };

export async function analyse(text: string, name: string): Promise<Analysis> {
  const parsed = parseSbom(text);
  if (!parsed.ok) return { ok: false, name, error: parsed.error, hint: parsed.hint };
  const sbom = parsed.sbom;
  const schema = await validateSchema(sbom).catch(
    (err): SchemaResult => ({ status: "unsupported", reason: `Schema validation failed to run: ${err instanceof Error ? err.message : String(err)}` }),
  );
  return {
    ok: true,
    name,
    format: sbom.format,
    formatLabel: formatLabel(sbom),
    specVersion: sbom.specVersion,
    inventory: inventory(sbom.format, sbom.data),
    schema,
    frameworks: FRAMEWORKS.map((f) => runFramework(f, sbom)),
    refs: extractRefs(sbom),
  };
}

function inventory(format: SbomFormat, d: JsonObject): Inventory {
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  if (format === "cyclonedx") {
    let components = 0;
    const walk = (cs: unknown) => {
      for (const c of list(cs)) {
        components += 1;
        if (c && typeof c === "object") walk((c as JsonObject).components);
      }
    };
    walk(d.components);
    return { components, dependencies: list(d.dependencies).reduce<number>((n, dep) => n + list((dep as JsonObject)?.dependsOn).length, 0) };
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
