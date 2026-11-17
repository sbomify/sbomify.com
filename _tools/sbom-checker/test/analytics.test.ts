import { afterEach, describe, expect, test } from "bun:test";
import { analyse } from "../src/analyse";
import { countBucket, refsProps, resultProps, sizeBucket, track } from "../src/analytics";
import type { RefCheck } from "../src/refs";

// A document whose every free-text value is a marker that must never reach
// analytics: file name, component names, supplier, URLs, purls, hashes.
const SECRET = "zz-secret";
const doc = {
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  serialNumber: "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  version: 1,
  metadata: {
    timestamp: "2026-11-02T09:30:00Z",
    authors: [{ name: `${SECRET}-author`, email: `${SECRET}@example.com` }],
    component: { type: "application", name: `${SECRET}-app`, version: "1.0.0", supplier: { name: `${SECRET}-supplier` } },
  },
  components: [
    { type: "library", "bom-ref": `${SECRET}-ref`, name: `${SECRET}-lib`, version: "2.0.0", purl: `pkg:npm/${SECRET}-lib@2.0.0`, externalReferences: [{ type: "bom", url: `https://${SECRET}.example.com/bom.json` }] },
  ],
};

describe("analytics payloads", () => {
  test("result properties carry shape, never document content", async () => {
    const a = await analyse(JSON.stringify(doc), `${SECRET}.cdx.json`);
    const props = resultProps(a, 42);
    const json = JSON.stringify(props);
    expect(json).not.toContain(SECRET);
    expect(json).not.toContain("example.com");
    expect(props).toMatchObject({ ok: true, format: "cyclonedx", spec_version: "1.6", schema_status: "valid", components_bucket: "1-9", refs_count: 1, refs_bom_count: 1, duration_ms: 42 });
    expect(props.cisa_2026_status).toBe("fail");
    expect(props.bsi_tr03183_2_status).toBeDefined();
    expect(props.failed_elements).toContain("cisa-2026:component-hash-value");
    expect(props.fixable_by_enrichment).toBeGreaterThan(0);
  });

  test("a document that cannot be read reports its kind, not its message", async () => {
    for (const [text, kind] of [["", "empty"], ["<bom/>", "xml"], ["{nope", "invalid_json"], ["[1]", "not_object"]] as const) {
      const props = resultProps(await analyse(text, `${SECRET}.json`), 1);
      expect(props).toEqual({ ok: false, error_kind: kind, duration_ms: 1 });
    }
  });

  test("reference check counts carry no URLs", () => {
    const ref = (url: string, kind: "bom" | "other" = "other") => ({ url, kind, type: "website", source: `component "${SECRET}"`, hashes: {} });
    const checks: RefCheck[] = [
      { ref: ref(`https://${SECRET}.example.com/a`), status: "ok", detail: "" },
      { ref: ref(`https://${SECRET}.example.com/b`, "bom"), status: "http-error", detail: "", hash: { status: "mismatch", detail: "" } },
      { ref: ref(`git@${SECRET}:x.git`), status: "skipped", detail: "" },
    ];
    const props = refsProps(checks, 5, 1);
    expect(JSON.stringify(props)).not.toContain(SECRET);
    expect(props).toEqual({ checked: 3, bom_refs: 1, ok: 1, reachable: 0, broken: 1, unreachable: 0, skipped: 1, hash_verified: 0, hash_mismatch: 1, nested_checked: 1, duration_ms: 5 });
  });

  test("buckets", () => {
    expect([0, 3, 42, 420, 4200, 42000].map(countBucket)).toEqual(["0", "1-9", "10-99", "100-999", "1000-9999", "10000+"]);
    expect([5e3, 5e4, 5e5, 5e6, 5e7].map(sizeBucket)).toEqual(["<10KB", "10-100KB", "100KB-1MB", "1-10MB", "10MB+"]);
  });
});

describe("track", () => {
  const g = globalThis as { posthog?: unknown };
  afterEach(() => delete g.posthog);

  test("prefixes the event and adds tool and section", () => {
    const calls: unknown[][] = [];
    g.posthog = { capture: (...args: unknown[]) => calls.push(args) };
    track("input", { source: "file" });
    track("link_click", { kind: "fix" }, true);
    expect(calls[0]).toEqual(["sbom_checker_input", { tool: "sbom_checker", site_section: "tools", source: "file" }, undefined]);
    expect(calls[1]![0]).toBe("sbom_checker_link_click");
    expect(calls[1]![2]).toEqual({ send_instantly: true, transport: "sendBeacon" });
  });

  test("is a no-op without PostHog (no consent) and never throws", () => {
    expect(() => track("input")).not.toThrow();
    g.posthog = { capture: () => { throw new Error("boom"); } };
    expect(() => track("input")).not.toThrow();
  });
});
