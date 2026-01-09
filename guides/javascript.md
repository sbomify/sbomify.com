---
layout: page
permalink: /guides/javascript/
title: "SBOM Generation Guide for JavaScript - npm, yarn, pnpm, Bun"
description: "Learn how to generate Software Bill of Materials for JavaScript and Node.js projects. Complete guide with package-lock.json, yarn.lock, pnpm-lock.yaml, and bun.lock examples."
section: guides
---

## Source vs Build SBOMs

In the JavaScript ecosystem, SBOMs can be generated either from lockfiles (source/pre-build) or from the installed `node_modules` directory (build/post-install). The JavaScript ecosystem has one of the most mature dependency management systems, with multiple package managers each providing their own lockfile format.

For most JavaScript projects, generating SBOMs from lockfiles is the preferred approach because:
- Lockfiles contain exact versions and integrity hashes
- They're committed to version control, ensuring reproducibility
- They capture the full dependency tree including transitive dependencies

## Lockfile Deep Dive

JavaScript projects have several package managers, each with their own lockfile format. Understanding these differences is crucial for accurate SBOM generation.

### npm (package-lock.json)

The `package-lock.json` file is npm's lockfile, introduced in npm 5. It contains:
- Exact resolved versions of all dependencies
- Integrity hashes (SHA-512) for verification
- The full dependency tree structure

Example structure:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "": {
      "name": "my-app",
      "dependencies": {
        "express": "^4.18.2"
      }
    },
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ=="
    }
  }
}
```

**Important:** Always commit your `package-lock.json` to version control. Without it, you only have the version ranges from `package.json`, which makes reproducible SBOMs impossible.

### yarn (yarn.lock)

Yarn's lockfile uses a custom format (YAML-like in v1, YAML in v2+):

```yaml
# yarn.lock (Classic v1)
express@^4.18.2:
  version "4.18.2"
  resolved "https://registry.yarnpkg.com/express/-/express-4.18.2.tgz"
  integrity sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ==
  dependencies:
    accepts "~1.3.8"
    body-parser "1.20.1"
```

Yarn Berry (v2+) uses a different format with more metadata and supports PnP (Plug'n'Play) installations.

### pnpm (pnpm-lock.yaml)

pnpm's lockfile is YAML-based and includes additional information about the content-addressable store:

```yaml
lockfileVersion: '9.0'
settings:
  autoInstallPeers: true
packages:
  express@4.18.2:
    resolution: {integrity: sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ==}
    engines: {node: '>= 0.10.0'}
    dependencies:
      accepts: 1.3.8
```

### Bun (bun.lock)

Bun uses a binary lockfile format (`bun.lockb`) by default for performance, but also supports a text format (`bun.lock`). For SBOM generation, you'll want the text format:

```bash
# Generate text lockfile
bun install --save-text-lockfile
```

## The node_modules Problem

JavaScript's dependency resolution creates a flat or nested `node_modules` structure depending on the package manager:

- **npm (v3+)**: Flat structure with hoisting
- **yarn (Classic)**: Similar flat structure
- **pnpm**: Symlinked structure using content-addressable storage
- **Bun**: Symlinked structure similar to pnpm

This affects SBOM generation because build-time SBOMs analyze what's actually installed, which may differ from the lockfile in edge cases (platform-specific optional dependencies, for example).

## npm audit vs SBOM-based Vulnerability Scanning

While `npm audit` provides quick vulnerability checking, SBOM-based scanning offers advantages:

| Feature | npm audit | SBOM + Scanner |
|---------|-----------|----------------|
| Offline analysis | No | Yes |
| Historical tracking | No | Yes |
| Cross-project analysis | No | Yes |
| Multiple vulnerability DBs | npm only | OSV, NVD, etc. |
| License compliance | No | Yes |

## Generating an SBOM

### Using cdxgen (Recommended)

[cdxgen](https://github.com/CycloneDX/cdxgen) has excellent JavaScript support and understands all major lockfile formats:

```bash
# Install cdxgen
npm install -g @cyclonedx/cdxgen

# Generate SBOM from package-lock.json
cdxgen -o sbom.cdx.json

# Generate SBOM from specific lockfile
cdxgen --type npm -o sbom.cdx.json
```

### Using Trivy

[Trivy](https://github.com/aquasecurity/trivy) can scan JavaScript projects and generate SBOMs:

```bash
# Generate CycloneDX SBOM
trivy fs --format cyclonedx --output sbom.cdx.json .

# Generate SPDX SBOM
trivy fs --format spdx-json --output sbom.spdx.json .
```

### Using Syft

[Syft](https://github.com/anchore/syft) from Anchore also supports JavaScript lockfiles:

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) simplifies SBOM generation in your CI/CD pipeline:

```yaml
---
name: Generate SBOM for JavaScript Project

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-js-component'
          LOCK_FILE: 'package-lock.json'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true
          UPLOAD: true
```

For yarn projects:

```yaml
env:
  LOCK_FILE: 'yarn.lock'
```

For pnpm projects:

```yaml
env:
  LOCK_FILE: 'pnpm-lock.yaml'
```

For Bun projects:

```yaml
env:
  LOCK_FILE: 'bun.lock'
```

## GitLab and Other CI/CD

For GitLab CI, you can use the sbomify Docker image:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/github-action:latest
  stage: build
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "package-lock.json"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
  artifacts:
    paths:
      - sbom.cdx.json
```

## Monorepo Considerations

For monorepos with multiple `package.json` files, you have several options:

1. **Generate per-workspace SBOMs**: Run SBOM generation for each workspace
2. **Use workspace-aware tools**: cdxgen supports npm/yarn workspaces natively
3. **Aggregate SBOMs**: Generate individual SBOMs and merge them

```bash
# cdxgen with workspace support
cdxgen --type npm -o sbom.cdx.json --include-subprojects
```

## Best Practices

1. **Always commit your lockfile** - This ensures reproducible SBOMs
2. **Use exact versions in production** - Avoid version ranges for deployed applications
3. **Regularly update dependencies** - Use tools like Renovate or Dependabot
4. **Include dev dependencies carefully** - Consider whether they belong in your SBOM
5. **Verify integrity hashes** - Modern package managers do this automatically

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes additional JavaScript-specific tools and general SBOM utilities for generation, distribution, and analysis.
