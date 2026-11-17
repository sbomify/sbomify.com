/**
 * Schema validation against the upstream CycloneDX and SPDX JSON schemas.
 *
 * Validators are generated at build time (scripts/compile-schemas.ts) and
 * each one is its own chunk, so a visitor downloads only the schema for the
 * version they upload.
 */
import type { DetectedSbom, Json } from "./types";
import { findSchema, SCHEMAS, type SchemaEntry } from "./schema/catalogue";

interface AjvError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}
type ValidateFn = ((data: unknown) => boolean) & { errors?: AjvError[] | null };

const LOADERS: Record<string, () => Promise<{ validate: ValidateFn }>> = {
  "cdx-1.2": () => import("./schema/generated/cdx-1.2.js"),
  "cdx-1.3": () => import("./schema/generated/cdx-1.3.js"),
  "cdx-1.4": () => import("./schema/generated/cdx-1.4.js"),
  "cdx-1.5": () => import("./schema/generated/cdx-1.5.js"),
  "cdx-1.6": () => import("./schema/generated/cdx-1.6.js"),
  "cdx-1.7": () => import("./schema/generated/cdx-1.7.js"),
  "spdx-2.2": () => import("./schema/generated/spdx-2.2.js"),
  "spdx-2.3": () => import("./schema/generated/spdx-2.3.js"),
  "spdx-3.0.0": () => import("./schema/generated/spdx-3.0.0.js"),
  "spdx-3.0.1": () => import("./schema/generated/spdx-3.0.1.js"),
};

export interface SchemaIssue {
  /** JSON Pointer to the offending value, "" for the document root. */
  path: string;
  /** Human-readable location, e.g. `components[3] "lodash" → type`. */
  location: string;
  message: string;
}

export type SchemaResult =
  | { status: "valid"; schema: SchemaEntry }
  | { status: "invalid"; schema: SchemaEntry; issues: SchemaIssue[]; totalIssues: number }
  | { status: "unsupported"; reason: string; hint?: string };

/** Maximum number of issues shown; the total is still reported. */
export const MAX_ISSUES = 50;

export function supportedVersionsText(): string {
  return SCHEMAS.map((s) => s.label).join(", ");
}

export async function validateSchema(sbom: DetectedSbom): Promise<SchemaResult> {
  if (sbom.format === "unknown") {
    return {
      status: "unsupported",
      reason: "The document is neither CycloneDX (no bomFormat) nor SPDX (no spdxVersion or SPDX 3 @context).",
      hint: "Check that you uploaded the SBOM itself and not, for example, a vulnerability report.",
    };
  }
  const entry = findSchema(sbom.format, sbom.schemaVersion);
  if (!entry) {
    const declared = sbom.specVersion ?? "no version";
    const hint =
      sbom.format === "spdx3" && sbom.data.spdxVersion !== undefined
        ? "This uses the pre-release SPDX 3 layout (spdxVersion with an elements list). SPDX 3.0 documents are JSON-LD with @context and @graph; regenerate it with a current tool."
        : `Supported versions: ${supportedVersionsText()}.`;
    return { status: "unsupported", reason: `There is no published schema for ${sbom.format === "cyclonedx" ? "CycloneDX" : "SPDX"} ${declared}.`, hint };
  }

  const loader = LOADERS[entry.id];
  if (!loader) return { status: "unsupported", reason: `No validator is bundled for ${entry.label}.` };
  const { validate } = await loader();
  if (validate(sbom.data)) return { status: "valid", schema: entry };

  const errors = validate.errors ?? [];
  const issues = condense(errors).map((e) => toIssue(e, sbom.data));
  return { status: "invalid", schema: entry, issues: issues.slice(0, MAX_ISSUES), totalIssues: issues.length };
}

/**
 * Ajv reports every branch of a failed anyOf/oneOf, which reads as noise
 * ("must match exactly one schema in oneOf" plus a dozen branch failures).
 * Keep the most specific errors: drop combinator summaries when a deeper
 * error explains the same location, and drop exact duplicates.
 */
function condense(errors: AjvError[]): AjvError[] {
  const seen = new Set<string>();
  const out: AjvError[] = [];
  const paths = errors.map((e) => e.instancePath);
  for (const e of errors) {
    if ((e.keyword === "anyOf" || e.keyword === "oneOf" || e.keyword === "if") && paths.some((p) => p !== e.instancePath && p.startsWith(e.instancePath))) {
      continue;
    }
    if (e.keyword === "if") continue;
    const key = `${e.instancePath}|${e.keyword}|${JSON.stringify(e.params)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

function toIssue(e: AjvError, data: Json): SchemaIssue {
  return { path: e.instancePath, location: describePath(e.instancePath, data), message: describeError(e) };
}

function describeError(e: AjvError): string {
  const p = e.params;
  switch (e.keyword) {
    case "required":
      return `Missing required property "${String(p.missingProperty)}".`;
    case "additionalProperties":
      return `Property "${String(p.additionalProperty)}" is not allowed here by the schema. Check the spelling, or move it into "properties" if it is custom data.`;
    case "unevaluatedProperties":
      return `Property "${String(p.unevaluatedProperty)}" is not defined for this element type.`;
    case "enum":
      return `Value must be one of: ${(p.allowedValues as unknown[]).slice(0, 12).map((v) => JSON.stringify(v)).join(", ")}${(p.allowedValues as unknown[]).length > 12 ? ", …" : ""}`;
    case "const":
      return `Value must be ${JSON.stringify(p.allowedValue)}.`;
    case "type":
      return `Value must be of type ${String(p.type)}.`;
    case "format":
      return `Value is not a valid ${String(p.format)}.`;
    case "pattern":
      return `Value does not match the required pattern ${String(p.pattern)}.`;
    case "uniqueItems":
      return `Items must be unique (items ${String(p.j)} and ${String(p.i)} are identical).`;
    case "minItems":
      return `Must contain at least ${String(p.limit)} item(s).`;
    case "minLength":
      return `Must be at least ${String(p.limit)} character(s) long.`;
    default: {
      const msg = e.message ?? e.keyword;
      return msg.charAt(0).toUpperCase() + msg.slice(1) + ".";
    }
  }
}

/** Turn "/components/3/licenses/0" into `components[3] "lodash" → licenses[0]`. */
export function describePath(pointer: string, data: Json): string {
  if (!pointer) return "document root";
  const parts = pointer.split("/").slice(1).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let node: Json | undefined = data;
  const out: string[] = [];
  for (const part of parts) {
    if (Array.isArray(node) && /^\d+$/.test(part)) {
      node = node[Number(part)];
      let label = `[${part}]`;
      if (node && typeof node === "object" && !Array.isArray(node)) {
        const name = node.name ?? node.SPDXID ?? node["@id"] ?? node.spdxId ?? node["bom-ref"];
        if (typeof name === "string") label += ` "${name.length > 60 ? name.slice(0, 57) + "…" : name}"`;
      }
      if (out.length) out[out.length - 1] += label;
      else out.push(label);
    } else {
      node = node && typeof node === "object" && !Array.isArray(node) ? node[part] : undefined;
      out.push(part);
    }
  }
  return out.join(" → ");
}
