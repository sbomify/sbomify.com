/**
 * Every link the report shows under a finding must land on a real heading:
 * the anchors are derived from the site's Markdown headings the way Hugo's
 * default (GitHub-style) heading IDs are, so renaming a heading fails here
 * rather than silently breaking the deep link.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detect } from "../src/detect";
import { FRAMEWORKS } from "../src/frameworks";
import { fixSummary, linksFor } from "../src/links";

const content = join(import.meta.dir, "..", "..", "..", "content");

function slug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function anchorsOf(path: string): Set<string> {
  const file = [join(content, `${path}.md`), join(content, path, "_index.md")].find(existsSync);
  if (!file) throw new Error(`no content file for ${path}`);
  const ids = new Set<string>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^#{2,6}\s+(.+?)\s*$/);
    if (m) ids.add(slug(m[1]!));
  }
  return ids;
}

function check(href: string) {
  const [path, anchor] = href.split("#") as [string, string | undefined];
  const page = path.replace(/^\/|\/$/g, "");
  if (!anchor) {
    expect(anchorsOf(page).size, page).toBeGreaterThan(-1);
    return;
  }
  expect([...anchorsOf(page)], `${href}`).toContain(anchor);
}

// Every finding every framework can emit, from a complete and an empty document.
const findings = (() => {
  const out: { framework: string; id: string }[] = [];
  const docs = [
    JSON.parse(readFileSync(join(import.meta.dir, "fixtures", "cases", "cdx16-complete.json"), "utf8")),
    JSON.parse(readFileSync(join(import.meta.dir, "fixtures", "cases", "spdx23-complete.json"), "utf8")),
    { bomFormat: "CycloneDX", specVersion: "1.6", components: [{ type: "library", name: "x" }], vulnerabilities: [{ id: "CVE-2026-0001" }] },
  ];
  for (const d of docs) for (const fw of FRAMEWORKS) for (const f of fw.assess(detect(d))) out.push({ framework: fw.id, id: f.id });
  return [...new Map(out.map((f) => [`${f.framework}|${f.id}`, f])).values()];
})();

describe("finding links", () => {
  test("covers every element of every framework", () => {
    expect(findings.length).toBeGreaterThan(50);
    for (const f of findings) {
      const links = linksFor(f.framework, f);
      expect(links.guide, f.id).toBeDefined();
    }
  });

  for (const f of findings) {
    test(`${f.id} links resolve`, () => {
      const links = linksFor(f.framework, f);
      for (const l of [links.fix, links.guide, links.crosswalk]) if (l) check(l.href);
    });
  }

  test("the action is credited only for what it fills in", () => {
    for (const id of ["bsi-tr03183:filename", "bsi-tr03183:executable-property", "bsi-tr03183:archive-property", "bsi-tr03183:structured-property", "bsi-tr03183:no-vulnerabilities"]) {
      expect(linksFor("bsi-tr03183-2", { id }).fix, id).toBeUndefined();
    }
    expect(linksFor("cisa-2026", { id: "cisa-2026:component-hash-value" }).fix?.step).toBe("enrichment");
    expect(linksFor("ntia-2021", { id: "ntia-2021:sbom-author" }).fix?.step).toBe("augmentation");
    expect(linksFor("cisa-2025", { id: "cisa-2025:generation-context" }).fix?.href).toBe("/sbomify-action/augmentation/#valid-values");
  });

  test("fixSummary counts failed elements by step", () => {
    const by = fixSummary([{ id: "cisa-2026", findings: [
      { id: "cisa-2026:component-license", title: "", description: "", status: "fail" },
      { id: "cisa-2026:sbom-author", title: "", description: "", status: "fail" },
      { id: "cisa-2026:component-hash-value", title: "", description: "", status: "warning" },
    ] }]);
    expect(by).toEqual({ enrichment: 1, augmentation: 1, generation: 0, attestation: 0 });
  });
});
