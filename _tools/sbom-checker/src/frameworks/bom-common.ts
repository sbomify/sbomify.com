/**
 * Helpers shared by the CBOM and HBOM required-field checks. Both kinds are
 * CycloneDX documents that describe something other than software, so they
 * share the document-level checks (what the BOM describes, when it was made)
 * and the way findings are built.
 */
import type { DetectedSbom, Finding, FindingStatus, JsonObject } from "../types";
import { cdxComponents } from "./standards";
import { affectedFields, displayName, isObject, isValidIsoTimestamp } from "./util";

/** Components of the document, metadata.component and nested ones included. */
export const allComponents = (data: JsonObject): JsonObject[] => cdxComponents(data);

/** A non-empty, non-blank string. */
export const present = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** A sub-object of a component, or undefined. */
export const sub = (obj: unknown, key: string): JsonObject | undefined => {
  const v = isObject(obj) ? obj[key] : undefined;
  return isObject(v) ? v : undefined;
};

/** "1.6" → [1, 6]; null when it is not a CycloneDX x.y version. */
export function cdxVersion(v: string | null): [number, number] | null {
  const m = v?.match(/^(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export function atLeast(v: string | null, major: number, minor: number): boolean {
  const p = cdxVersion(v);
  return !!p && (p[0] > major || (p[0] === major && p[1] >= minor));
}

/** Label for a component in an affected list: name, else bom-ref, else its position. */
export function label(c: JsonObject, i: number): string {
  return displayName(c.name, present(c["bom-ref"]) ? String(c["bom-ref"]) : `component #${i + 1}`);
}

export interface Check {
  id: string;
  title: string;
  /** What the element is; shown on every status. */
  about: string;
  /** Status when the check is not met. */
  missing: Exclude<FindingStatus, "pass" | "error">;
  remediation: string;
  /** Override the default "Present for…" / "Missing for…" sentences. */
  phrase?: { ok: (total: number) => string; bad: (n: number, total: number) => string };
}

const count = (n: number, noun: [string, string]) => `${n} ${n === 1 ? noun[0] : noun[1]}`;

/**
 * A finding for a per-component check: pass when nothing is affected,
 * otherwise `check.missing` with the affected names listed.
 */
export function perComponent(check: Check, affected: string[], total: number, noun: [string, string]): Finding {
  if (!affected.length) {
    const ok = check.phrase?.ok(total) ?? (total === 1 ? `Present for the one ${noun[0]}.` : `Present for all ${count(total, noun)}.`);
    return { id: check.id, title: check.title, description: `${check.about} ${ok}`, status: "pass" };
  }
  const bad = check.phrase?.bad(affected.length, total) ?? `Missing for ${affected.length} of ${count(total, noun)}.`;
  return {
    id: check.id,
    title: check.title,
    description: `${check.about} ${bad}`,
    status: check.missing,
    remediation: check.remediation,
    ...affectedFields(affected),
  };
}

/** A finding for a document-level check. */
export function single(check: Check, ok: boolean, detail?: string): Finding {
  const description = detail ? `${check.about} ${detail}` : check.about;
  return ok ? { id: check.id, title: check.title, description, status: "pass" } : { id: check.id, title: check.title, description, status: check.missing, remediation: check.remediation };
}

/** The one finding for a document that is not CycloneDX at all. */
export function notCycloneDx(prefix: string, kind: string, sbom: DetectedSbom): Finding {
  const what = sbom.format === "spdx" || sbom.format === "spdx3" ? "an SPDX document" : "not a CycloneDX document";
  return {
    id: `${prefix}:format`,
    title: "CycloneDX format",
    description: `${kind}s are written in CycloneDX, and this is ${what}.`,
    status: "fail",
    remediation: `Export the ${kind} as CycloneDX JSON.`,
  };
}

/** metadata.component and metadata.timestamp, the two document-level recommendations. */
export function documentChecks(prefix: string, kind: string, data: JsonObject): Finding[] {
  const metadata = sub(data, "metadata");
  const subject = sub(metadata, "component");
  const timestamp = metadata?.timestamp;
  return [
    single(
      {
        id: `${prefix}:subject`,
        title: "Subject of the BOM",
        about: `\`metadata.component\` says which product or system the ${kind} describes.`,
        missing: "warning",
        remediation: `Add \`metadata.component\` with the name and version of the product the ${kind} is for, so a reader can tell which product and release it belongs to.`,
      },
      !!subject && present(subject.name),
    ),
    single(
      {
        id: `${prefix}:timestamp`,
        title: "Timestamp",
        about: `\`metadata.timestamp\` records when the ${kind} was produced.`,
        missing: "warning",
        remediation: "Add `metadata.timestamp` as an ISO 8601 date and time, for example `2026-11-19T09:00:00Z`.",
      },
      timestamp !== undefined && isValidIsoTimestamp(timestamp),
    ),
  ];
}

export type { FindingStatus };
