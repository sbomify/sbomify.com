---

url: /guides/sbomify-action/publishing/
title: "Publishing SBOMs: Uploading, Releases and Dependency Track"
description: "How to upload SBOMs from CI to sbomify using OIDC trusted publishing or an API token, tag them against product releases, and send them to Dependency Track."
keywords: ["OIDC trusted publishing", "SBOM upload", "product release", "Dependency Track", "sbomify token"]
section: guides
tldr: "On GitHub Actions, use OIDC trusted publishing and skip long-lived secrets entirely. Everywhere else, use a scoped API token. Uploads can also go to Dependency Track, or nowhere at all."
---

Uploading is optional. Set `UPLOAD: false` and you get a file on disk and nothing else - useful for storing SBOMs as build artifacts or feeding them into another tool.

Destinations are chosen with `UPLOAD_DESTINATIONS`, and can be combined.

## OIDC trusted publishing

On GitHub Actions, you do not need a long-lived token. The workflow can exchange a GitHub-issued identity token for a short-lived sbomify token at run time.

This is the recommended approach wherever it is available. There is no secret to rotate, no secret to leak, and the resulting credential expires in about 15 minutes.

### Setting it up

**1. Create the binding in sbomify first.** Open your component, go to Settings, then Trusted Publishing, and add your GitHub organisation and repository.

This step is not optional. sbomify pins the binding to GitHub's immutable owner and repository IDs rather than their names, which defeats repository-resurrection attacks - but it also means **the exchange returns 403 until the binding exists**. If trusted publishing fails with a permission error, this is almost always why.

**2. Grant the workflow permission to mint tokens:**

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: sbomify/sbomify-action@v26.8.0
        env:
          COMPONENT_ID: your-component-id
          LOCK_FILE: requirements.txt
          AUGMENT: true
          ENRICH: true
```

No `TOKEN`. The `id-token: write` permission is what makes it work; without it GitHub does not expose the endpoints needed to mint the identity token.

### How it works

1. The workflow grants `id-token: write`, and the runner exposes an OIDC request URL and token.
2. The action mints a JWT with the configured audience, which defaults to `sbomify.com`.
3. It posts that JWT to sbomify, which validates it against the trusted publisher binding.
4. sbomify returns a short-lived access token, valid for roughly 15 minutes.

Because CI logs outlive that window, tokens and JWTs are scrubbed from error output before anything is logged.

### Notes and limits

- **GitHub Actions only, for now.** The exchange depends on GitHub-issued identity tokens. Other runtimes use a token.
- **A token takes precedence.** If `TOKEN` or `SBOMIFY_TOKEN` is set, it is used and OIDC is not attempted. To force OIDC, remove the token.
- **Self-hosted** instances derive the audience from `API_BASE_URL`. Override it explicitly with `OIDC_AUDIENCE` if needed.

See [the trusted publishing FAQ](/faq/how-do-i-set-up-oidc-trusted-publishing/) for the sbomify-side setup in more detail.

## API tokens

On every other runtime, authenticate with an API token stored in your CI platform's secret store.

```yaml
env:
  TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
  COMPONENT_ID: your-component-id
  LOCK_FILE: requirements.txt
  AUGMENT: true
  ENRICH: true
```

Precedence is the `--token` flag, then `SBOMIFY_TOKEN`, then `TOKEN`.

Good practice:

- **One token per consumer.** A token per pipeline or per repository means revoking one does not break everything else, and makes it obvious what stopped working.
- **Scope to the workspace** that actually needs it.
- **Store it as a secret**, never in the repository. Note that CI secrets are typically not exposed to pull requests from forks, so those builds should run with `UPLOAD: false`.
- **Rotate on a schedule.** New tokens expire after 90 days by default.
- **Prefer OIDC where you can.** A credential that lives 15 minutes is categorically safer than one that lives 90 days.

## Component IDs

`COMPONENT_ID` identifies which sbomify component an SBOM belongs to. Find it in the component's URL or settings page, or let the [setup wizard](/guides/sbomify-action/quickstart/) create components and fill this in for you.

A component maps to one buildable thing. A repository containing a frontend and a backend has two components, each with its own ID and its own pipeline step. See [how products, components and releases fit together](/faq/how-do-products-work-in-sbomify/).

## Product releases

Tag uploaded SBOMs against one or more product releases:

```yaml
env:
  TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
  COMPONENT_ID: your-component-id
  LOCK_FILE: requirements.txt
  PRODUCT_RELEASE: '["your-product-id:v1.0.0"]'
```

The value is a JSON array of `product_id:version` strings, so one SBOM can belong to several releases at once:

```yaml
PRODUCT_RELEASE: '["product_one:v1.0.0", "product_two:v2.0.0"]'
```

Behaviour worth knowing:

- **Get or create.** Existing releases are reused; missing ones are created.
- **Partial failures warn rather than fail.** If some releases tag and others do not, the run logs a warning and continues - the SBOM is already stored, so failing the build would not help.
- Requires credentials and `COMPONENT_ID`, since it talks to the sbomify API.

A common pattern is to tag releases only on tagged builds:

```yaml
PRODUCT_RELEASE: ${{ startsWith(github.ref, 'refs/tags/') && format('["your-product-id:{0}"]', github.ref_name) || '' }}
```

See [how to create a software release](/faq/how-do-i-create-a-software-release/) and [versioning SBOMs](/guides/how-to-version-sboms/).

## Dependency Track

Upload to [OWASP Dependency Track](https://dependencytrack.org/) instead of, or alongside, sbomify.

```yaml
- uses: sbomify/sbomify-action@v26.8.0
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: true
    UPLOAD_DESTINATIONS: dependency-track
    COMPONENT_NAME: my-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    DTRACK_API_KEY: ${{ secrets.DTRACK_API_KEY }}
    DTRACK_API_URL: https://dtrack.example.com/api
    DTRACK_AUTO_CREATE: true
    ENRICH: true
```

The project is identified either by `DTRACK_PROJECT_ID`, or by `COMPONENT_NAME` plus `COMPONENT_VERSION` together. Full variable list in the [configuration reference](/guides/sbomify-action/configuration/#dependency-track).

**Dependency Track accepts CycloneDX only.** Combining `SBOM_FORMAT: spdx` with this destination will not work.

### Both at once

```yaml
env:
  LOCK_FILE: requirements.txt
  UPLOAD_DESTINATIONS: sbomify,dependency-track
  COMPONENT_NAME: my-app
  COMPONENT_VERSION: ${{ github.ref_name }}
  TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
  COMPONENT_ID: your-component-id
  DTRACK_API_KEY: ${{ secrets.DTRACK_API_KEY }}
  DTRACK_API_URL: https://dtrack.example.com/api
  ENRICH: true
```

The same enriched SBOM goes to both. `COMPONENT_NAME` and `COMPONENT_VERSION` are shared.

## Self-hosted sbomify

Point `API_BASE_URL` at your instance:

```yaml
env:
  TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
  COMPONENT_ID: your-component-id
  API_BASE_URL: https://sbomify.yourcompany.com
  LOCK_FILE: requirements.txt
  AUGMENT: true
  ENRICH: true
```

The OIDC audience is derived from that hostname automatically. Override with `OIDC_AUDIENCE` if your deployment expects something different.

## Other artifact types

`BOM_TYPE` uploads related artifacts through the same tooling:

| Value  | Artifact                                 |
| ------ | ---------------------------------------- |
| `sbom` | Software Bill of Materials. The default. |
| `vex`  | Vulnerability Exploitability eXchange    |
| `cbom` | Cryptography Bill of Materials           |
| `hbom` | Hardware Bill of Materials               |

Non-SBOM types are uploaded **verbatim** - augmentation, enrichment, overrides and package injection are all skipped, and Dependency Track and `PRODUCT_RELEASE` are rejected. Only the sbomify destination accepts them.

```yaml
- uses: sbomify/sbomify-action@v26.8.0
  with:
    bom-type: vex
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: your-component-id
    SBOM_FILE: vex.json
```

OpenVEX and CSAF VEX documents are detected from their contents. CycloneDX documents containing cryptographic assets are classified as `cbom` automatically. See [using VEX](/faq/how-do-i-use-vex/) and [what a CBOM is](/faq/what-is-a-cbom/).

## What happens after upload

Nothing. That is the point.

sbomify stores the bytes it received and serves those same bytes back. It does not enrich, normalise, deduplicate or reformat your SBOM. Any signature you made in CI keeps validating indefinitely, and what an auditor downloads is byte-for-byte what your pipeline produced.

Analysis - vulnerability scanning, compliance assessment, attestation verification - reads the artifact and writes findings alongside it, never into it.

The reasoning behind that design, and why it matters more than it might first appear, is in [why SBOM quality matters](/guides/sbomify-action/why/#the-part-most-platforms-get-wrong).
