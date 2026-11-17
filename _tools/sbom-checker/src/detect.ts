/**
 * Parse an uploaded file and work out which SBOM format and version it is.
 */
import type { DetectedSbom, JsonObject } from "./types";

export type ParseResult =
  | { ok: true; sbom: DetectedSbom }
  | { ok: false; error: string; hint?: string; kind: ParseErrorKind };

/** Why a document could not be read; reported to analytics instead of the message. */
export type ParseErrorKind = "empty" | "xml" | "tag_value" | "invalid_json" | "not_object" | "attestation";

const isObject = (v: unknown): v is JsonObject => typeof v === "object" && v !== null && !Array.isArray(v);

/** Parse text into a detected SBOM, or explain why that is not possible. */
export function parseSbom(text: string): ParseResult {
  const trimmed = text.replace(/^﻿/, "").trimStart();
  if (!trimmed) return { ok: false, error: "The file is empty.", kind: "empty" };

  if (trimmed.startsWith("<")) {
    return {
      ok: false,
      kind: "xml",
      error: "This looks like an XML document. The checker reads JSON SBOMs.",
      hint: "Export the SBOM as CycloneDX JSON, or convert it with the CycloneDX CLI (cyclonedx convert --output-format json).",
    };
  }
  if (/^(SPDXVersion|##)\s*:?/m.test(trimmed.slice(0, 2000)) && !trimmed.startsWith("{")) {
    return {
      ok: false,
      kind: "tag_value",
      error: "This looks like an SPDX tag-value document. The checker reads SPDX JSON.",
      hint: "Convert it to JSON with the SPDX tools (pyspdxtools -i sbom.spdx -o sbom.spdx.json).",
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch (err) {
    return {
      ok: false,
      kind: "invalid_json",
      error: `The file is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
      hint: "Check that the file was not truncated and that it is the SBOM itself, not an attestation or archive.",
    };
  }
  if (!isObject(data)) {
    return { ok: false, error: "The document is valid JSON but not a JSON object, so it cannot be an SBOM.", kind: "not_object" };
  }

  // An in-toto attestation wrapping an SBOM: unwrap the predicate.
  if (isObject(data.predicate) && typeof data._type === "string" && data._type.includes("in-toto")) {
    data = data.predicate;
    if (!isObject(data)) return { ok: false, error: "The attestation's predicate is not a JSON object.", kind: "attestation" };
  }

  return { ok: true, sbom: detect(data as JsonObject) };
}

/** Classify a parsed JSON object. Never throws. */
export function detect(data: JsonObject): DetectedSbom {
  // SPDX 3: JSON-LD with an spdx.org context.
  const context = data["@context"];
  const contexts = Array.isArray(context) ? context : [context];
  const spdx3Context = contexts.find((c): c is string => typeof c === "string" && /spdx\.org\/rdf\/3\./.test(c));
  if (spdx3Context || isObject(data["@graph"]) || Array.isArray(data["@graph"])) {
    const fromContext = spdx3Context?.match(/rdf\/(3\.\d+(?:\.\d+)?)\//)?.[1] ?? null;
    const fromCreationInfo = findSpdx3SpecVersion(data);
    const specVersion = fromCreationInfo ?? fromContext;
    return { format: "spdx3", specVersion, schemaVersion: spdx3Schema(specVersion), data };
  }

  if (typeof data.spdxVersion === "string") {
    const specVersion = data.spdxVersion;
    // Legacy SPDX 3 drafts wrote spdxVersion "SPDX-3.0" with an `elements` list.
    if (/^SPDX-3/i.test(specVersion)) {
      return { format: "spdx3", specVersion, schemaVersion: null, data };
    }
    const m = specVersion.match(/^SPDX-(2\.\d)/i);
    return { format: "spdx", specVersion, schemaVersion: m ? m[1]! : null, data };
  }

  const bomFormat = data.bomFormat;
  if ((typeof bomFormat === "string" && bomFormat.toLowerCase() === "cyclonedx") || ("specVersion" in data && "components" in data)) {
    const specVersion = typeof data.specVersion === "string" ? data.specVersion : null;
    const m = specVersion?.match(/^(1\.\d+)/);
    return { format: "cyclonedx", specVersion, schemaVersion: m ? m[1]! : null, data };
  }

  return { format: "unknown", specVersion: null, schemaVersion: null, data };
}

function findSpdx3SpecVersion(data: JsonObject): string | null {
  const graph = Array.isArray(data["@graph"]) ? data["@graph"] : isObject(data["@graph"]) ? [data["@graph"]] : [];
  for (const el of graph) {
    if (isObject(el) && el.type === "CreationInfo" && typeof el.specVersion === "string") return el.specVersion;
  }
  return null;
}

/** 3.0.0 has its own schema; any later 3.0.x patch validates against 3.0.1. */
function spdx3Schema(version: string | null): string | null {
  if (!version) return null;
  if (version === "3.0.0" || version === "3.0") return "3.0.0";
  if (/^3\.0\.\d+$/.test(version)) return "3.0.1";
  return null;
}

export function formatLabel(sbom: DetectedSbom): string {
  switch (sbom.format) {
    case "cyclonedx":
      return `CycloneDX ${sbom.specVersion ?? "(no specVersion)"}`;
    case "spdx":
      return sbom.specVersion ?? "SPDX 2.x";
    case "spdx3":
      return `SPDX ${sbom.specVersion ?? "3.x"}`;
    default:
      return "Unknown format";
  }
}
