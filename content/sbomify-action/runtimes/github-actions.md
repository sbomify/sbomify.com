---

url: /sbomify-action/runtimes/github-actions/
aliases:
  - /guides/sbomify-action/runtimes/github-actions/
title: "SBOM Generation in GitHub Actions"
description: "Run the sbomify action in GitHub Actions with OIDC trusted publishing, build provenance attestation, caching and matrix builds."
keywords: ["GitHub Actions SBOM", "SBOM workflow", "OIDC trusted publishing", "attest build provenance"]
tldr: "GitHub Actions is the most fully featured runtime: a native action, tokenless OIDC publishing, build provenance attestation and wizard-generated workflows."
---

GitHub Actions has a native action, so there is no container syntax to write. It is also the only runtime that currently supports OIDC trusted publishing and build provenance attestation, both of which depend on GitHub-issued identity tokens.

## Minimal example

```yaml
name: Generate SBOM

on:
  push:
    branches: [main]
  pull_request:

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: sbomify/sbomify-action@master
        env:
          LOCK_FILE: package-lock.json
          OUTPUT_FILE: sbom.cdx.json
          ENRICH: true
          UPLOAD: false

      - uses: actions/upload-artifact@v7
        with:
          name: sbom
          path: sbom.cdx.json
```

No account required. Swap the lockfile for whichever one your project uses.

## Uploading without a token

Prefer OIDC trusted publishing over a long-lived secret. **Create the trusted publisher binding in sbomify first** - Component, Settings, Trusted Publishing - or the exchange returns 403.

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: sbomify/sbomify-action@master
        env:
          COMPONENT_ID: your-component-id
          LOCK_FILE: requirements.txt
          AUGMENT: true
          ENRICH: true
```

The `id-token: write` permission is what makes this work. If `TOKEN` is also set it takes precedence and OIDC is skipped, so remove it to force tokenless publishing.

Full details in [publishing](/sbomify-action/publishing/#oidc-trusted-publishing).

### With a token instead

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    AUGMENT: true
    ENRICH: true
```

## Attestation

Sign the SBOM in the same job that produced it:

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
          COMPONENT_NAME: my-app
          COMPONENT_VERSION: ${{ github.ref_name }}
          ENRICH: true
          UPLOAD: false

      - uses: actions/attest-build-provenance@v4
        with:
          subject-path: sbom.cdx.json
```

`actions/attest-build-provenance` is **not available on private or internal repositories on Free, Pro or Team plans, or on GitHub Enterprise Server at all**. Check the [availability table](/sbomify-action/advanced/#where-attestation-is-available) before adding it, or sign with [cosign](/faq/how-do-i-sign-an-sbom/) instead.

## Container images

```yaml
- uses: sbomify/sbomify-action@master
  env:
    DOCKER_IMAGE: ghcr.io/${{ github.repository }}:${{ github.sha }}
    OUTPUT_FILE: container-sbom.cdx.json
    COMPONENT_NAME: ${{ github.repository }}
    COMPONENT_VERSION: ${{ github.sha }}
    ENRICH: true
    UPLOAD: false
```

The image must be pullable from the runner, so push it or load it into the local daemon first. [Chainguard base images](/sbomify-action/sources/#chainguard-images) are detected automatically and their published SBOM is reused.

## Caching

Worth doing - it avoids re-downloading the license database on every run, and reduces exposure to [rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

```yaml
- uses: actions/cache@v6
  with:
    path: .sbomify-cache
    key: sbomify-${{ runner.os }}

- uses: sbomify/sbomify-action@master
  env:
    SBOMIFY_CACHE_DIR: ${{ github.workspace }}/.sbomify-cache
    SYFT_CACHE_DIR: ${{ github.workspace }}/.sbomify-cache/syft
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    LOCK_FILE: requirements.txt
    ENRICH: true
    UPLOAD: false
```

Setting `GITHUB_TOKEN` here is strongly recommended even on GitHub Actions - it raises the license database download limit from 60 to 5,000 requests per hour.

## Monorepos

The workflow-level `working-directory:` setting **does not affect this action**, because it runs in a container. Use the `working-dir` input:

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

For several components, use a matrix - see [advanced usage](/sbomify-action/advanced/#monorepos).

## Tagging releases

```yaml
- uses: sbomify/sbomify-action@master
  env:
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    COMPONENT_VERSION: ${{ github.ref_name }}
    PRODUCT_RELEASE: '["your-product-id:${{ github.ref_name }}"]'
    AUGMENT: true
    ENRICH: true
```

Run this on tag pushes rather than every commit. See [product releases](/sbomify-action/publishing/#product-releases).

## VCS detection

Automatic. Repository URL, commit SHA and branch or tag are read from the environment and added to the SBOM, including on GitHub Enterprise Server. Nothing to configure.

## Pull requests from forks

Secrets are not exposed to fork pull requests, so uploads will fail. Verify generation without uploading:

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true
    UPLOAD: ${{ github.event.pull_request.head.repo.fork && 'false' || 'true' }}
```

## Version pinning

The examples on this page use `@master` so they stay correct as the action moves. Do not ship that. Pin to a release tag for something readable, or to a full 40-character commit SHA - the only reference GitHub treats as immutable - for production. The [setup wizard](/sbomify-action/quickstart/) writes SHA pins automatically, and [version pinning](/sbomify-action/advanced/#version-pinning) covers the trade-offs.

## Let the wizard write it

The wizard generates a complete workflow, including SHA pins and matrix entries per lockfile:

```bash
docker run --rm -it \
  -v "$(pwd):/workspace" \
  ghcr.io/sbomify/sbomify-action \
  sbomify-action wizard
```

It writes `.github/workflows/sboms.yml` and will never overwrite a workflow you wrote yourself. See the [quick start](/sbomify-action/quickstart/).

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Publishing](/sbomify-action/publishing/) - OIDC, releases, Dependency Track
- [Advanced](/sbomify-action/advanced/) - attestation, audit trail, troubleshooting
