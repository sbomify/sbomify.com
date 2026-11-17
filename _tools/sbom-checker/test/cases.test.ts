/**
 * Independent cases: small SBOMs that each change one thing from a complete
 * document, with the outcome each framework's text calls for. Every case was
 * checked against the standard, not just against our own implementation.
 *
 * Cases marked `ours_wrong` are places where the current checks (here and in
 * the sbomify platform, which these mirror) read the standard differently
 * from the case. They are listed as todo so they stay visible until the
 * platform's checks change; this tool follows the platform so the two never
 * disagree about the same SBOM.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { detect } from "../src/detect";
import { FRAMEWORKS } from "../src/frameworks";

interface Expectation {
  fixture: string;
  framework: string;
  finding: string;
  status: "pass" | "fail" | "warning";
  note: string;
  ours_wrong?: boolean;
}

const dir = join(import.meta.dir, "fixtures", "cases");
const expectations: Expectation[] = JSON.parse(readFileSync(join(dir, "expectations.json"), "utf8"));

describe("standard-derived cases", () => {
  for (const e of expectations) {
    const name = `${e.fixture} → ${e.finding} is ${e.status}`;
    if (e.ours_wrong) {
      test.todo(`${name} (known divergence: ${e.note})`);
      continue;
    }
    test(name, () => {
      const framework = FRAMEWORKS.find((f) => f.id === e.framework);
      expect(framework, `framework ${e.framework}`).toBeDefined();
      const sbom = detect(JSON.parse(readFileSync(join(dir, e.fixture), "utf8")));
      const finding = framework!.assess(sbom).find((f) => f.id === e.finding);
      expect(finding, `finding ${e.finding}`).toBeDefined();
      expect(finding!.status, e.note).toBe(e.status);
    });
  }
});
