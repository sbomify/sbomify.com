---

url: /guides/javascript/
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

| Feature                    | npm audit | SBOM + Scanner |
| -------------------------- | --------- | -------------- |
| Offline analysis           | No        | Yes            |
| Historical tracking        | No        | Yes            |
| Cross-project analysis     | No        | Yes            |
| Multiple vulnerability DBs | npm only  | OSV, NVD, etc. |
| License compliance         | No        | Yes            |

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For JavaScript, sbomify uses **cdxgen** under the hood as it has excellent support for all JavaScript lockfile formats.

**Standalone (no account needed):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-node-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

The action supports all JavaScript lockfiles: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, and `bun.lock`.

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cdxgen (recommended for manual use):**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -o sbom.cdx.json
```

**Trivy:**

```bash
trivy fs --format cyclonedx --output sbom.cdx.json .
```

**Syft:**

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
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

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes additional JavaScript-specific tools and general SBOM utilities for generation, distribution, and analysis.
