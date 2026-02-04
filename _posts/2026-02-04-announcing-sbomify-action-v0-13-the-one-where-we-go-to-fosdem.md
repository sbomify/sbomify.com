---
layout: post
title: "Announcing sbomify-action v0.13: The One Where We Go to FOSDEM"
description: "sbomify-action v0.13 brings hash enrichment from lockfiles, an interactive configuration wizard, Conan Center integration for C/C++, and improved NTIA compliance with supplier fields and PURL generation from VCS URLs."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, github-actions, fosdem, compliance]
---

We timed the sbomify-action v0.13 release for [FOSDEM 2026](https://fosdem.org/2026/schedule/event/UYTGWA-sbom-generation/), where we presented on CRA-ready SBOM generation.

## FOSDEM 2026: CRA-Ready SBOMs

This past weekend, we presented at FOSDEM in the Software Bill of Materials devroom. The talk covers a four-phase SBOM generation model addressing the EU's Cyber Resilience Act requirements: authoring, augmenting, enriching, and signing SBOMs to exceed minimal compliance standards. It includes a demo of an open-source workflow using sbomify-action, helping teams avoid compliance gaps as the CRA timeline approaches.

If you missed it, you can watch the full talk below.

{% include components/video-embed-native.html
video_url="https://video.fosdem.org/2026/ud2208/UYTGWA-sbom-generation.av1.webm"
title="CRA-Ready SBOMs: A Practical Blueprint for High-Quality Generation"
description="A four-phase SBOM generation model addressing the EU's Cyber Resilience Act requirements, covering authoring, augmenting, enriching, and signing SBOMs."
%}

You can also find the talk on the [FOSDEM schedule](https://fosdem.org/2026/schedule/event/UYTGWA-sbom-generation/).

---

## What's New in v0.13

### Breaking Changes

**Python 3.11+ now required** - We have increased the minimum Python version from 3.10 to 3.11 to take advantage of the built-in `tomllib` module for TOML parsing. If you are running sbomify-action locally, ensure you have Python 3.11 or later installed.

---

## New Features

### Hash Enrichment from Lockfiles

A common gap in SBOMs is missing cryptographic hashes for components. Many SBOM generation tools do not extract hashes, even when they are available in lockfiles.

The new hash enrichment subsystem automatically extracts cryptographic hashes from your lockfiles and adds them to SBOM components. This improves SBOM quality and supports integrity verification workflows.

**Supported lockfiles:**

- Cargo.lock (Rust)
- package-lock.json (npm)
- Pipfile.lock (Pipenv)
- pnpm-lock.yaml (pnpm)
- poetry.lock (Poetry)
- pubspec.lock (Dart/Flutter)
- uv.lock (uv)
- yarn.lock (Yarn)

### Interactive Configuration Wizard

Getting started with sbomify-action is now easier than ever. The new `sbomify init` command walks you through an interactive wizard to create your `sbomify.json` configuration file. Answer a few questions about your project, and the wizard generates a working configuration.

```bash
sbomify-action init
```

### Conan Center Enrichment

C/C++ projects using Conan now get automatic metadata enrichment from the Conan Center API. For each package, we fetch:

- License information
- Author details
- Homepage URL
- Repository URL
- Package description

This follows our enrichment-first philosophy: even if your SBOM generation tool produces sparse output, sbomify-action fills in the gaps from authoritative sources.

### Component Supplier Field (NTIA Compliance)

NTIA's minimum elements for SBOMs include supplier information. Previously, some tools would populate this with package authors, which is not quite right. The supplier should be the distribution platform, not the individual who wrote the code.

Components now include a `supplier` field populated with the distribution platform:

- PyPI for Python packages
- npm for JavaScript packages
- crates.io for Rust packages
- And so on for other ecosystems

This improves compliance with NTIA SBOM requirements.

### PURL Generation from VCS URL

For SPDX SBOMs, the main package component now generates a PURL from the VCS (Version Control System) URL when no explicit PURL is available. This ensures better NTIA compliance by providing a unique identifier for your software, even when traditional package manager PURLs are not applicable.

### Organization Data from Contact Profile API

The sbomify API integration now extracts organizational data from the contact_profile structure. This means your SBOMs can include accurate manufacturer and supplier organization details from your sbomify account settings.

---

## Improvements

### Lifecycle Property Standardization

We have updated lifecycle properties to use the official CycloneDX taxonomy. If you are using lifecycle data in your SBOMs, the property names have changed:

| Old Property | New Property |
|--------------|--------------|
| `cle:releaseDate` | `cdx:lifecycle:milestone:generalAvailability` |
| `cle:eos` | `cdx:lifecycle:milestone:endOfSupport` |
| `cle:eol` | `cdx:lifecycle:milestone:endOfLife` |

This aligns with the CycloneDX specification and improves interoperability with other tools.

### Better Error Handling

We have made significant improvements to error handling throughout the tool:

- **ToolNotAvailableError** - Graceful handling when SBOM generation tools are missing, with clear instructions on what to install
- **Improved "component not found" messages** - More context about what failed and why
- **Better diagnostic info** - SBOM generation errors now include more details for debugging
- **Path expansion errors** - Now include the file name and searched paths
- **CLI flag detection** - Helpful error when a file path looks like a CLI flag (a common typo)
- **Stdout capture** - Tools that output errors to stdout instead of stderr are now handled correctly

---

## Getting Started

Install from PyPI:

```bash
pip install sbomify-action
```

Or use the GitHub Action:

```yaml
- uses: sbomify/github-action@v0.13
```

Check out the [full changelog on GitHub](https://github.com/sbomify/github-action/compare/v0.12...v0.13) for complete details.
