/**
 * Builds the SBOM checker for the site.
 *
 *   1. Compiles the JSON schemas into standalone validators.
 *   2. Bundles the page script and the worker, splitting each schema
 *      validator into its own chunk, into static/js/sbom-checker/ with
 *      content-hashed names (Hugo copies static/ as is).
 *   3. Writes data/sbom_checker.json so the page template can find the
 *      hashed entry files.
 */
import { $ } from "bun";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const here = join(import.meta.dir, "..");
const site = join(here, "..", "..");
const outDir = join(site, "static", "js", "sbom-checker");
const publicPath = "/js/sbom-checker/";

await $`bun ${join(here, "scripts", "compile-schemas.ts")}`.cwd(here).quiet();

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const result = await Bun.build({
  entrypoints: [join(here, "src", "main.ts"), join(here, "src", "worker.ts")],
  outdir: outDir,
  target: "browser",
  format: "esm",
  splitting: true,
  minify: true,
  sourcemap: "none",
  publicPath,
  naming: { entry: "[name]-[hash].[ext]", chunk: "chunk-[hash].[ext]", asset: "[name]-[hash].[ext]" },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const manifest: Record<string, string> = {};
let total = 0;
for (const output of result.outputs) {
  total += output.size;
  const name = basename(output.path);
  if (output.kind === "entry-point") manifest[name.replace(/-[a-z0-9]+\.js$/, "")] = publicPath + name;
  console.log(`${relative(site, output.path).padEnd(60)} ${(output.size / 1024).toFixed(1).padStart(8)} KiB`);
}
console.log(`total ${(total / 1024).toFixed(0)} KiB`);
mkdirSync(join(site, "data"), { recursive: true });
writeFileSync(join(site, "data", "sbom_checker.json"), JSON.stringify(manifest, null, 2) + "\n");
