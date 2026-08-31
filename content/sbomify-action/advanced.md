---

url: /sbomify-action/advanced/
aliases:
  - /guides/sbomify-action/advanced/
title: "Advanced Usage: Attestation, Audit Trail, Caching and Troubleshooting"
description: "Attestation and signing, the SBOM audit trail, cache configuration, monorepo layouts, telemetry, version pinning and troubleshooting for the sbomify action."
keywords: ["SBOM attestation", "build provenance", "SBOM audit trail", "SBOM caching", "action pinning"]
section: sbomify-action
tldr: "Sign your SBOM in CI with build provenance attestation, keep the audit trail as evidence of what the pipeline changed, and cache the license database so runs stay fast."
---

## Attestation

The action does not sign SBOMs itself. It produces a file, and you attest that file with your platform's provenance tooling - which keeps signing under your control and your identity, rather than a vendor's.

On GitHub Actions:

```yaml
permissions:
  contents: read
  id-token: write
  attestations: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: sbomify/sbomify-action@master
        env:
          LOCK_FILE: Cargo.lock
          OUTPUT_FILE: sbom.cdx.json
          ENRICH: true
          UPLOAD: false

      - uses: actions/attest-build-provenance@v4
        with:
          subject-path: sbom.cdx.json
```

You can also attest the build artifact itself and attach the SBOM to it, with [`actions/attest-sbom`](https://github.com/actions/attest-sbom), passing your build output as `subject-path` and the generated SBOM as `sbom-path`.

### Where attestation is available

`actions/attest-build-provenance` is not available everywhere, and the failure mode is a broken build rather than a graceful skip. Check before you add it:

| Repository                                   | Availability      |
| -------------------------------------------- | ----------------- |
| Public repository, any plan                  | Works             |
| Private or internal, GitHub Enterprise Cloud | Works             |
| Private or internal, Free, Pro or Team       | **Not available** |
| Any repository on GitHub Enterprise Server   | **Not available** |

If your repository falls into one of the unsupported rows, either gate the step on repository visibility or sign with [cosign](/faq/how-do-i-sign-an-sbom/) instead, which has no such restriction.

### Why sign in CI

Signing at build time binds the SBOM to the pipeline run and the source commit that produced it. Since [sbomify never modifies uploaded artifacts](/sbomify-action/why/#the-part-most-platforms-get-wrong), that signature keeps validating for as long as the document exists - anyone can verify it independently, without trusting sbomify.

See [how to sign an SBOM](/faq/how-do-i-sign-an-sbom/) and [working with signature files](/faq/how-do-i-use-signature-files/).

## Audit trail

Every modification the pipeline makes is recorded. This is what turns "we generated an SBOM" into something you can hand to an auditor.

Three outputs:

**A summary table**, always printed:

```text
┌─────────────────────┬───────┐
│ Metric              │ Value │
├─────────────────────┼───────┤
│ Overrides applied   │     3 │
│ Components enriched │    42 │
│ Sanitization fixes  │     5 │
└─────────────────────┴───────┘
```

**`audit_trail.txt`**, written next to your SBOM:

```text
# SBOM Audit Trail
# Generated: 2026-01-18T12:34:56Z
# Input: requirements.txt
# Output: sbom.cdx.json

## Override
[2026-01-18T12:34:56Z] OVERRIDE component.version SET "2.0.0" (source: cli/env)
[2026-01-18T12:34:56Z] OVERRIDE component.name MODIFIED "old-name" -> "my-app" (source: cli/env)

## Enrichment
[2026-01-18T12:34:57Z] ENRICHMENT pkg:pypi/requests@2.31.0 license ADDED (source: pypi)
[2026-01-18T12:34:57Z] ENRICHMENT pkg:pypi/requests@2.31.0 description ADDED (source: pypi)
```

**A collapsible group** in GitHub Actions logs containing the full trail.

Four categories are tracked: overrides from the CLI or environment, augmentation values and their source, per-component enrichment additions, and sanitization fixes such as PURL normalisation. Timestamps are UTC, ISO 8601.

Archive `audit_trail.txt` alongside your SBOM. Together they answer "where did every field in this document come from?" - which is the question that actually gets asked in an audit.

## Caching

Two caches are worth persisting: the license databases, at roughly 20-50 MB, and Syft's package metadata cache.

**GitHub Actions**

```yaml
- uses: actions/cache@v6
  with:
    path: .sbomify-cache
    key: sbomify-${{ runner.os }}

- uses: sbomify/sbomify-action@master
  env:
    SBOMIFY_CACHE_DIR: ${{ github.workspace }}/.sbomify-cache
    SYFT_CACHE_DIR: ${{ github.workspace }}/.sbomify-cache/syft
    LOCK_FILE: requirements.txt
    ENRICH: true
    UPLOAD: false
```

**GitLab CI**

```yaml
generate-sbom:
  image: ghcr.io/sbomify/sbomify-action
  cache:
    key: sbomify-cache
    paths:
      - .sbomify-cache/
  variables:
    SBOMIFY_CACHE_DIR: "${CI_PROJECT_DIR}/.sbomify-cache/sbomify"
    SYFT_CACHE_DIR: "${CI_PROJECT_DIR}/.sbomify-cache/syft"
    LOCK_FILE: poetry.lock
    ENRICH: "true"
    UPLOAD: "false"
  script:
    - sbomify-action
```

**Plain Docker** - use a named volume:

```bash
docker volume create sbomify-cache

docker run --rm \
  -v "$(pwd):/github/workspace" \
  -v sbomify-cache:/cache \
  -w /github/workspace \
  -e SBOMIFY_CACHE_DIR=/cache/sbomify \
  -e SYFT_CACHE_DIR=/cache/syft \
  -e LOCK_FILE=requirements.txt \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

Caching reduces network calls, which also reduces exposure to the [license database rate limit](/sbomify-action/enrichment/#license-database-rate-limits).

## Tool runtimes

Only `cyclonedx-py` ships in the image, as a dependency of the CLI itself. Every other generator is fetched: Syft, cdxgen, the JVM toolchain, Go, Rust, PHP, .NET, `crane` and `cosign` are downloaded on first use, verified against a digest pinned at build time, and unpacked into a cache directory.

This is why the image is small, why the same tool selection works identically under `uvx`, and why the tool set cannot change without a release - which matters for something whose output is a provenance document.

Two things follow that are worth configuring:

**Cache the runtimes.** Without a persistent cache every run re-downloads them. Set `SBOMIFY_TOOL_CACHE` to a path your CI restores between builds. If it is unset, the cache falls back to `XDG_CACHE_HOME`, then `$HOME/.cache`, then the temp directory - the last of which does not survive a run.

```yaml
env:
  SBOMIFY_TOOL_CACHE: ${{ github.workspace }}/.sbomify-cache/runtimes
```

**Air-gapped builds need an opt-out.** Set `SBOMIFY_FETCH_RUNTIMES=0` to refuse downloads and use only preinstalled tools.

Be deliberate about that flag. Declining to fetch does not leave the tool without an opinion - it silently falls back to whatever generator is already available, which is usually the worse one. A Rust project resolved by Syft instead of `cargo-cyclonedx` is not a neutral outcome, and nothing in the output says so. If you set it, make sure the native generators you care about are installed.

Bundles published by sbomify also carry a Sigstore attestation, verified with `cosign` before use. `cosign` itself is digest-pinned only, since verifying it would require it to already be present.

## Monorepos

Use the `working-dir` input to point at a subdirectory:

```yaml
- uses: sbomify/sbomify-action@master
  with:
    working-dir: packages/my-app
  env:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true
    UPLOAD: false
```

> The workflow-level `working-directory:` setting **does not affect this action**, because it runs in a container. Use the `working-dir` input. On other runtimes, set `WORKING_DIR` or change the container's working directory.

For several components in one repository, use a matrix:

```yaml
jobs:
  sbom:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - name: frontend
            lock_file: frontend/package-lock.json
            component_id: abc123
          - name: backend
            lock_file: backend/requirements.txt
            component_id: def456
    steps:
      - uses: actions/checkout@v7
      - uses: sbomify/sbomify-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: ${{ matrix.component_id }}
          LOCK_FILE: ${{ matrix.lock_file }}
          OUTPUT_FILE: sbom-${{ matrix.name }}.cdx.json
          ENRICH: true
```

Each component gets its own SBOM and its own component ID. See [the SBOM hierarchy](/features/sbom-hierarchy/) for how these roll up into a product.

## Version pinning

Three levels, in increasing order of strictness:

```yaml
# Pinned to a release tag - readable, and what most projects want
- uses: sbomify/sbomify-action@v26.8.0

# Pinned to a commit SHA - immutable, and what we recommend for production
- uses: sbomify/sbomify-action@a1b2c3d4e5f6...

# Floating - convenient for trying things out, not for production
- uses: sbomify/sbomify-action@master
```

A full 40-character commit SHA is the only reference GitHub treats as immutable; tags can be moved. If your threat model includes a compromised upstream action, pin to a SHA. The [setup wizard](/sbomify-action/quickstart/) does this automatically for the workflows it generates.

Releases use CalVer, so `v26.8.0` is the eighth release of 2026.

## Telemetry and privacy

**Error telemetry is enabled by default.** Unhandled exceptions are reported to Sentry to help find crashes.

To disable it:

```yaml
env:
  TELEMETRY: "false"
```

Or pass `--no-telemetry` on the CLI. To send reports to your own Sentry instance instead, set `SENTRY_DSN`.

If your organisation restricts outbound connections from build agents, turn this off explicitly rather than relying on the network to block it.

## Troubleshooting

**Enrichment added far fewer fields than expected.** Almost always GitHub API rate limiting on the license database download. Set `GITHUB_TOKEN` - see [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

**"No transitive dependencies discovered".** Informational, not an error. The stage inspects the installed environment, so it finds nothing in a clean checkout. Install dependencies before generating if you want it to contribute.

**Trusted publishing returns 403.** The trusted publisher binding does not exist on the component yet, or it points at a different repository. Create it under Component, Settings, Trusted Publishing. Also confirm the workflow grants `id-token: write`.

**"No generator found for input".** Either the file is not a recognised lockfile, or you asked for a spec version nothing can emit - `SPEC_VERSION=3.0.1` is the usual culprit, since SPDX 3.0.1 can be processed but not generated.

**The action ignores my `working-directory`.** Expected. Use the `working-dir` input instead.

**Generation fails in CI but works locally.** Usually missing dependencies. Some generators inspect the installed environment rather than only the lockfile, so run your install step first. Confirm the lockfile is committed and the path is right relative to the working directory.

**Uploads time out on a large SBOM.** Raise `SBOMIFY_UPLOAD_TIMEOUT` above its 120-second default.

**Fork pull requests fail on upload.** CI secrets are generally not exposed to forks. Gate uploads so fork builds run with `UPLOAD: false` and still verify that generation works.

## Reproducibility

Enrichment queries live registries, so the same input can produce slightly different output on different days. That is a deliberate trade: richer, more current metadata in exchange for byte-level reproducibility.

The audit trail is what makes this manageable. Any given SBOM records exactly what was added and which source provided it, so it remains fully explainable even though a rerun might differ. If you need strict reproducibility, run with `ENRICH: false` and rely on [augmentation](/sbomify-action/augmentation/) plus lockfile hashes, both of which are entirely local.

## Security

- Pin to a commit SHA in production.
- Grant the smallest set of `permissions:` the job needs.
- Store tokens as CI secrets, and prefer [OIDC trusted publishing](/sbomify-action/publishing/#oidc-trusted-publishing) where it is available.
- Review generated SBOMs before publishing them. Internal package names, private registry URLs and hostnames can be more revealing than they look.

Vulnerabilities in the action itself go to <security@sbomify.com>.
