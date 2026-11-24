/**
 * Shared types for the SBOM checker.
 *
 * Framework checks are ports of the assessment plugins in the sbomify web
 * app (sbomify/sbomify, `sbomify/apps/plugins/builtins/`). They keep the
 * same finding IDs, titles and pass/fail/warning semantics so a result here
 * matches what the app reports for the same document.
 */

/** Any parsed JSON object. SBOM input is untrusted, so nothing is assumed. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

/** Which checker is running: the SBOM checker, or the CBOM, HBOM or AIBOM validator. */
export type BomKind = "sbom" | "cbom" | "hbom" | "aibom";

export type SbomFormat = "cyclonedx" | "spdx" | "spdx3" | "unknown";

export interface DetectedSbom {
  format: SbomFormat;
  /** Spec version as written in the document, e.g. "1.6", "SPDX-2.3", "3.0.1". */
  specVersion: string | null;
  /** Normalised version used to pick a schema, e.g. "1.6", "2.3", "3.0.1". */
  schemaVersion: string | null;
  data: JsonObject;
}

export type FindingStatus = "pass" | "fail" | "warning" | "error";

export interface Finding {
  /** Stable identifier, e.g. "ntia-2021:supplier-name". */
  id: string;
  title: string;
  /** What the element is and, when it fails, what was missing. */
  description: string;
  status: FindingStatus;
  /** How to fix it. Present for fail and warning. */
  remediation?: string;
  /** Up to a handful of component names the finding applies to. */
  affected?: string[];
  /** Total number of affected items, when `affected` is truncated. */
  affectedCount?: number;
}

export interface FrameworkResult {
  /** Machine id, e.g. "ntia-2021". */
  id: string;
  name: string;
  /** e.g. "2021-07". */
  version: string;
  url: string;
  /** sbomify.com guide for the framework. */
  guideUrl: string;
  findings: Finding[];
  summary: { pass: number; fail: number; warning: number; error: number };
}

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  version: string;
  url: string;
  guideUrl: string;
  /** Run the checks. Must never throw on hostile input. */
  assess(sbom: DetectedSbom): Finding[];
}

export function summarise(findings: Finding[]): FrameworkResult["summary"] {
  const summary = { pass: 0, fail: 0, warning: 0, error: 0 };
  for (const f of findings) summary[f.status] += 1;
  return summary;
}

export function runFramework(framework: Framework, sbom: DetectedSbom): FrameworkResult {
  let findings: Finding[];
  try {
    findings = framework.assess(sbom);
  } catch (err) {
    findings = [
      {
        id: `${framework.id}:error`,
        title: "Assessment error",
        description: `The check could not finish: ${err instanceof Error ? err.message : String(err)}`,
        status: "error",
      },
    ];
  }
  return {
    id: framework.id,
    name: framework.name,
    version: framework.version,
    url: framework.url,
    guideUrl: framework.guideUrl,
    findings,
    summary: summarise(findings),
  };
}
