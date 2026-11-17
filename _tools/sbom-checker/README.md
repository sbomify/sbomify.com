# SBOM checker

The browser-side SBOM checker behind [/tools/sbom-checker/](https://sbomify.com/tools/sbom-checker/). It validates a CycloneDX or SPDX JSON document against its official schema, scores it against compliance frameworks, and checks its external references. All of it runs in the visitor's browser; nothing is uploaded.

## Layout

- `src/main.ts`: page controller. Wires up the form in `layouts/tools/sbom-checker.html` and renders the report.
- `src/worker.ts`, `src/analyse.ts`: the analysis, run in a Web Worker so large documents do not block the page.
- `src/detect.ts`: parsing and format/version detection.
- `src/validate.ts`, `src/schema/`: schema validation. `schemas/` holds the upstream schemas; `scripts/compile-schemas.ts` compiles them with Ajv in standalone mode into `src/schema/generated/` (not committed). The browser never runs a schema compiler, and each schema is its own chunk, loaded only for the version being checked.
- `src/refs.ts`: external references (collect, resolve, verify hashes, fetch referenced SBOMs).
- `src/frameworks/`: the compliance checks. These are ports of the assessment plugins in the sbomify platform (`sbomify/apps/plugins/builtins/` in sbomify/sbomify) and retain their finding IDs. Standard-derived corrections take precedence over historical scoring parity; see [STANDARDS.md](STANDARDS.md) for the sources, review resolutions and assessment limits.

## Commands

```bash
bun install
bun run build       # compile schemas, bundle into ../../static/js/sbom-checker/, write ../../data/sbom_checker.json
bun test            # unit tests (needs the compiled schemas: run build or scripts/compile-schemas.ts first)
bun run typecheck
```

From the site root, `bun run build:tools` and `bun run test:tools` do the same.

## Schemas

| File                            | Source                                                                     |
| ------------------------------- | -------------------------------------------------------------------------- |
| `bom-1.2` to `bom-1.7`          | `CycloneDX/specification`, `schema/`                                       |
| `spdx.schema.json`, `jsf-0.82`  | `CycloneDX/specification`, `schema/` (referenced by the CycloneDX schemas) |
| `cryptography-defs.schema.json` | `CycloneDX/specification`, `schema/` (referenced by CycloneDX 1.7)         |
| `spdx-2.2`, `spdx-2.3`          | `spdx/spdx-spec`, `schemas/spdx-schema.json` at tags `v2.2.2` and `v2.3`   |
| `spdx-3.0.0`, `spdx-3.0.1`      | `https://spdx.org/schema/<version>/spdx-json-schema.json`                  |

To add a version, drop its schema in `schemas/` and add a row to `src/schema/catalogue.ts` and a loader to `src/validate.ts`.

## Tests

- `test/*.test.ts` next to each framework port carry over the platform plugin's own tests.
- `test/cases.test.ts` runs `test/fixtures/cases/`: small documents that each change one thing from a complete SBOM, with the outcome the standard's text calls for. All cases run, including the 16 formerly skipped discrepancies.
- `test/standards-regressions.test.ts` covers all 17 review findings, using official-schema-valid inputs where applicable.
- `test/fixtures/samples/` holds real generator output for every supported format version.
