---
layout: post
title: "Announcing sbomify-action v0.11: The One Where They Go to PyPI"
description: "sbomify-action v0.11 transforms from a CI-only tool into a fully-fledged CLI available on PyPI. Major additions include audit trails for compliance, SPDX format support, a pre-computed license database covering 28 Linux distro versions, and native Rust SBOM generation."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, github-actions, pypi, cli]
---

With v0.11, sbomify-action is no longer tied to your CI/CD pipeline. Install it anywhere with `pip install sbomify-action` and generate enriched SBOMs on your laptop, in your build scripts, or wherever you need them. This release also tackles two of the biggest pain points in SBOM generation: missing license data and tracking end-of-life software.

## Highlights

- **Use it anywhere** - Install from PyPI and run locally, in CI, or in any workflow
- **Fill in missing licenses** - LicenseDB automatically adds license data for 28 Linux distro versions
- **Know when software goes EOL** - Lifecycle Database tracks support dates for distros and frameworks
- **Choose your format** - SPDX and CycloneDX with feature parity
- **Prove what happened** - Audit trail logs every SBOM transformation for compliance
- **Rust projects welcome** - Native generation and enrichment for the Rust ecosystem

## Never Miss a License Again

One of the most frustrating aspects of generating SBOMs for container images is discovering that half your packages are missing license information. This happens because many Linux distribution packages do not include machine-readable license metadata in their package manifests.

**LicenseDB** solves this. We have built a pre-computed database of valid package licenses covering 28 Linux distro versions:

- Debian (11, 12, 13)
- Ubuntu (20.04, 22.04, 24.04)
- Alpine (3.13-3.21)
- Fedora (39, 40, 41, 42)
- Amazon Linux (2, 2023)
- CentOS Stream (8, 9)
- AlmaLinux (8, 9)
- Rocky Linux (8, 9)
- Wolfi/Chainguard (rolling)

When you generate an SBOM, LicenseDB automatically fills in license data for packages that would otherwise be missing it. The lookup is architecture-agnostic, so you get consistent results whether you are building for amd64 or arm64.

LicenseDB is our primary license source, but not our only one. We integrate with multiple providers for license data, including PyPI, crates.io, and other package registries. LicenseDB is checked first because it is fast (downloaded once from GitHub releases then cached locally) and reliable. When LicenseDB does not have coverage for a package, we fall back to other sources. See our [integrations page]({{ site.url }}/features/integrations/) for the full list of data sources.

We take a conservative approach: LicenseDB only includes licenses we can verify from authoritative sources. This means we do not have full coverage of every package, but we would rather provide a smaller, accurate database than try to guess licenses with heuristics. When it comes to license compliance, accuracy matters more than completeness.

## Know When Your Software Goes End-of-Life

Compliance frameworks like FedRAMP and SOC2 increasingly require organizations to demonstrate they are not running end-of-life software. But tracking EOL dates across dozens of components, base images, and frameworks is tedious and error-prone.

The new **Lifecycle Database** embeds [CLE (Common Lifecycle Enumeration)](https://sbomify.com/compliance/cle/) data directly into your SBOMs, following the ECMA-428 specification. For every component we recognize, you get:

| What You Learn | Why It Matters                                    |
| -------------- | ------------------------------------------------- |
| Release Date   | Know how old a component is                       |
| End of Support | When bugfixes stop (security-only after this)     |
| End of Life    | When all support ends, including security patches |

### Coverage

**Linux Distributions**: Alpine, Ubuntu, Debian, Fedora, Rocky Linux, AlmaLinux, Amazon Linux, CentOS Stream, Oracle Linux, openSUSE Leap, Wolfi

**Language Runtimes and Frameworks**:

- Python (2.7, 3.10-3.14)
- PHP (7.4, 8.0-8.5)
- Go (1.22-1.25)
- Rust (1.90-1.92)
- Django (4.2, 5.2, 6.0)
- Rails (7.0-8.1)
- Laravel (10-13)
- React (17, 18, 19)
- Vue.js (2, 3)

With this data in your SBOMs, you can answer questions like "Which of our containers are running EOL base images?" or "When does Python 3.12 stop receiving security patches?" without leaving your SBOM tooling.

Here is what the lifecycle data looks like in a CycloneDX SBOM:

```json
{
  "name": "python3",
  "version": "3.12.1",
  "properties": [
    { "name": "cle:releaseDate", "value": "2023-10-02" },
    { "name": "cle:eos", "value": "2025-04-02" },
    { "name": "cle:eol", "value": "2028-10-31" }
  ]
}
```

## Run It Anywhere

Until now, sbomify-action lived exclusively in CI/CD pipelines. That made it hard to test configurations, debug issues, or generate SBOMs during local development.

With v0.11, install it from PyPI and run it wherever you need:

```bash
pip install sbomify-action
```

```bash
$ sbomify-action
   __                    _ ____         ___        __  _
  _____/ /_  ____  ____ ___  (_) __/_  __   /   | _____/ /_(_)___  ____
 / ___/ __ \/ __ \/ __ `__ \/ / /_/ / / /  / /| |/ ___/ __/ / __ \/ __ \
(__  ) /_/ / /_/ / / / / / / / __/ /_/ /  / ___ / /__/ /_/ / /_/ / / / /
/____/_.___/\____/_/ /_/ /_/_/_/  \__, /  /_/  |_\___/\__/_/\____/_/ /_/
                                /____/
v0.11 - Zero to SBOM hero
```

The CLI supports both command-line flags and environment variables, so your existing CI configurations translate directly. Test locally, commit with confidence.

## Choose CycloneDX or SPDX

Your supply chain partners may require SPDX. Your internal tooling may expect CycloneDX. You should not have to choose between them or accept a degraded experience with one format.

Our goal is **feature parity between CycloneDX and SPDX**. With v0.11, we have made significant progress:

```bash
sbomify-action --lock-file requirements.txt -f spdx -o sbom.spdx.json
```

License sanitization, lifecycle data, and enrichment from all data sources now work identically regardless of output format. Whichever format your organization or supply chain partners require, you get the same high-quality, enriched SBOMs.

## Prove What Happened to Your SBOM

When auditors or customers ask how an SBOM was generated, you need to show your work. The new **audit trail** logs every transformation applied during generation and enrichment, with timestamps.

### What Gets Tracked

- **Overrides** - Component name, version, and PURL changes from CLI or environment variables
- **Augmentation** - Supplier, manufacturer, authors, licenses, VCS info, lifecycle phase additions
- **Enrichment** - Per-component metadata additions (description, license, publisher, URLs)
- **Sanitization** - PURL normalizations, URL validations, stub components added

### Output

Every run produces three outputs:

1. **Summary table** in the console showing counts by category
2. **audit_trail.txt** written alongside your SBOM output with full details
3. **Collapsible group** in GitHub Actions with the complete audit trail

Here is what the audit trail looks like:

```
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

All timestamps are in UTC (ISO 8601 format), making it easy to correlate with CI logs and other audit evidence. This is exactly the provenance and integrity evidence that compliance frameworks like FedRAMP and SOC2 require.

## Rust Ecosystem Support

Rust projects now get first-class support:

- Native SBOM generation via cargo-cyclonedx
- Package metadata enrichment from crates.io

This follows our [plugin architecture](https://github.com/sbomify/github-action/blob/master/docs/adr/0001-plugin-architecture.md) principle of "native-first with generic fallback." Native sources like crates.io provide the most accurate metadata for their ecosystem, with generic aggregators as fallbacks for broader coverage.

## Other Improvements

**Docker Image**: Multi-arch support (amd64/arm64), lazy installation of Java/Maven and Go to reduce image size.

**PURL Handling**: Fixed double-encoding issues, consistent version updates, short git hashes for SBOM versions.

**Compliance**: NTIA compliance checkers aligned with the NTIA 2021 standard.

## Breaking Changes

- The `rpmrepo` and `ubuntu` enrichment sources have been removed, replaced by LicenseDB which provides broader and more consistent coverage.

## Getting Started

Install from PyPI:

```bash
pip install sbomify-action
```

Or continue using the GitHub Action as before. The CLI and Action share the same codebase and configuration options.

Check out the [full changelog on GitHub](https://github.com/sbomify/github-action/compare/v0.10...v0.11) for complete details.
