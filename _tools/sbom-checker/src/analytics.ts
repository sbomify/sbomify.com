/**
 * PostHog events for the SBOM checker.
 *
 * Consent: nothing here loads PostHog. Until the visitor accepts analytics,
 * `window.posthog` is the no-op stub from layouts/partials/posthog.html, so
 * every call below is dropped.
 *
 * Privacy: the SBOM never leaves the browser, and neither does anything
 * from inside it. Events carry shape only: format, version, counts, sizes
 * as buckets, statuses, and element IDs from our own frameworks
 * ("cisa-2026:component-hash-value"). Never file names, component names,
 * suppliers, URLs or identifiers from the document. test/analytics.test.ts
 * checks the result payload against a document full of tell-tale strings.
 *
 * The CBOM, HBOM and AIBOM validators share this script and these event
 * names; `tool` tells them apart (sbom_checker, cbom_checker, hbom_checker,
 * aibom_checker).
 *
 * Events (all prefixed sbom_checker_, all with tool and site_section):
 *   _input            a document was handed to the checker
 *   _result           the checks finished (or the document could not be read)
 *   _refs_checked     the visitor ran the external reference checks
 *   _report_download  the JSON report was downloaded
 *   _link_click       a link in the report (fix step, guide, field mapping)
 *   _expand           a collapsed list was opened (affected, passed, nested)
 *   _tile_click       an overview tile was used to jump to a section
 * Clicks on the closing call to action are `cta_click`, through the
 * site-wide listener (data-cta-location="sbom_checker_results").
 */
import type { Analysis } from "./analyse";
import { elementOf, fixSummary } from "./links";
import type { RefCheck } from "./refs";
import type { BomKind } from "./types";

type Props = Record<string, string | number | boolean | string[] | null | undefined>;

const BASE = { tool: "sbom_checker", site_section: "tools" };

/** Which checker the page runs; sets the `tool` property on every event. */
export function setTool(kind: BomKind): void {
  BASE.tool = `${kind}_checker`;
}

export function track(event: string, props: Props = {}, instant = false): void {
  const ph = (globalThis as { posthog?: { capture?: (e: string, p?: object, o?: object) => void } }).posthog;
  if (!ph?.capture) return;
  try {
    ph.capture(`sbom_checker_${event}`, { ...BASE, ...props }, instant ? { send_instantly: true, transport: "sendBeacon" } : undefined);
  } catch {
    // Analytics must never break the tool.
  }
}

export function countBucket(n: number): string {
  if (n === 0) return "0";
  if (n < 10) return "1-9";
  if (n < 100) return "10-99";
  if (n < 1000) return "100-999";
  if (n < 10000) return "1000-9999";
  return "10000+";
}

export function sizeBucket(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 10) return "<10KB";
  if (kb < 100) return "10-100KB";
  if (kb < 1024) return "100KB-1MB";
  if (kb < 10 * 1024) return "1-10MB";
  return "10MB+";
}

/** Property-safe key for a framework id: "cisa-2026" → "cisa_2026". */
const key = (id: string) => id.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

/** Properties for sbom_checker_result. Shape only; see the header. */
export function resultProps(a: Analysis, durationMs: number): Props {
  if (!a.ok) return { ok: false, error_kind: a.errorKind ?? "unknown", duration_ms: durationMs };
  const props: Props = {
    ok: true,
    format: a.format,
    spec_version: a.specVersion,
    schema_status: a.schema.status,
    schema_issue_count: a.schema.status === "invalid" ? a.schema.totalIssues : 0,
    components_bucket: countBucket(a.inventory.components),
    dependencies_bucket: countBucket(a.inventory.dependencies),
    refs_count: a.refs.length,
    refs_bom_count: a.refs.filter((r) => r.kind === "bom").length,
    duration_ms: durationMs,
  };
  const failed: string[] = [];
  const warned: string[] = [];
  let frameworksPassed = 0;
  for (const f of a.frameworks) {
    const k = key(f.id);
    const status = f.summary.error ? "error" : f.summary.fail ? "fail" : f.summary.warning ? "warning" : "pass";
    if (status === "pass") frameworksPassed += 1;
    props[`${k}_status`] = status;
    props[`${k}_pass`] = f.summary.pass;
    props[`${k}_fail`] = f.summary.fail;
    props[`${k}_warning`] = f.summary.warning;
    for (const fd of f.findings) {
      if (fd.status === "fail") failed.push(`${f.id}:${elementOf(fd)}`);
      else if (fd.status === "warning") warned.push(`${f.id}:${elementOf(fd)}`);
    }
  }
  const by = fixSummary(a.frameworks);
  props.frameworks_passed = frameworksPassed;
  props.failed_total = failed.length;
  props.failed_elements = failed;
  props.warning_elements = warned;
  props.fixable_by_enrichment = by.enrichment;
  props.fixable_by_augmentation = by.augmentation;
  props.fixable_by_generation = by.generation;
  props.fixable_by_attestation = by.attestation;
  return props;
}

/** Properties for sbom_checker_refs_checked. Counts only, no URLs. */
export function refsProps(checks: RefCheck[], durationMs: number, nested: number): Props {
  const count = (s: RefCheck["status"]) => checks.filter((c) => c.status === s).length;
  return {
    checked: checks.length,
    bom_refs: checks.filter((c) => c.ref.kind === "bom").length,
    ok: count("ok"),
    reachable: count("reachable"),
    broken: count("http-error"),
    unreachable: count("unreachable"),
    skipped: count("skipped"),
    hash_verified: checks.filter((c) => c.hash?.status === "match").length,
    hash_mismatch: checks.filter((c) => c.hash?.status === "mismatch").length,
    nested_checked: nested,
    duration_ms: durationMs,
  };
}
