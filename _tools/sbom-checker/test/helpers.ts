/**
 * Test helpers for the framework ports.
 *
 * `sbom(data)` detects the format the way the Python plugins' `_detect_format`
 * does, so a fixture ported from the sbomify tests reaches the same branch.
 */

import type { DetectedSbom, Finding, Framework, JsonObject, SbomFormat } from "../src/types";
import { isSpdx3 } from "../src/frameworks/spdx3-helpers";

export function detectFormat(data: unknown): SbomFormat {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return "unknown";
  const obj = data as Record<string, unknown>;
  const has = (k: string): boolean => Object.prototype.hasOwnProperty.call(obj, k);
  if (isSpdx3(obj)) return "spdx3";
  if (has("spdxVersion")) return "spdx";
  if (typeof obj.bomFormat === "string" && obj.bomFormat.toLowerCase() === "cyclonedx") return "cyclonedx";
  if (has("specVersion") && has("components")) return "cyclonedx";
  return "unknown";
}

/** A DetectedSbom for a fixture. Accepts any value: the frameworks must cope. */
export function sbom(data: unknown): DetectedSbom {
  const format = detectFormat(data);
  const obj = (typeof data === "object" && data !== null && !Array.isArray(data) ? data : {}) as JsonObject;
  const rawVersion = format === "cyclonedx" ? obj.specVersion : (obj.spdxVersion ?? null);
  const specVersion = typeof rawVersion === "string" ? rawVersion : null;
  return { format, specVersion, schemaVersion: specVersion, data: obj };
}

/** Run a framework and index the findings by id. */
export function run(framework: Framework, data: unknown): { findings: Finding[]; byId: Record<string, Finding> } {
  const findings = framework.assess(sbom(data));
  const byId: Record<string, Finding> = {};
  for (const f of findings) byId[f.id] = f;
  return { findings, byId };
}

/** The finding with this id, failing loudly if absent. */
export function findingById(findings: Finding[], id: string): Finding {
  const f = findings.find((x) => x.id === id);
  if (!f) throw new Error(`no finding ${id}; got ${findings.map((x) => x.id).join(", ")}`);
  return f;
}

/** pass/fail counts, like the Python AssessmentSummary. */
export function counts(findings: Finding[]): { pass: number; fail: number; warning: number; error: number; total: number } {
  const c = { pass: 0, fail: 0, warning: 0, error: 0, total: findings.length };
  for (const f of findings) c[f.status] += 1;
  return c;
}
