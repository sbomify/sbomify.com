---

title: "Announcing sbomify-action v0.14: The One With Yocto"
description: "sbomify-action v0.14 adds a dedicated Yocto/OpenEmbedded batch processing command, full SPDX 3.0.1 pipeline support, pipdeptree integration for Python transitive dependencies, caching for faster CI runs, and renames from github-action to sbomify-action."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, spdx, yocto, python, cli]
tldr: "sbomify-action v0.14 renames the project from github-action to sbomify-action, adds a dedicated Yocto/OpenEmbedded batch processing command, delivers full SPDX 3.0.1 pipeline support with roundtrip fidelity, integrates pipdeptree for Python transitive dependencies, and introduces caching for faster CI runs."
date: 2026-03-02
slug: announcing-sbomify-action-v0-14-the-one-with-yocto
---

What started as `github-action` has outgrown its name. With v0.14, we are officially renaming the project to `sbomify-action` to reflect what it has become: a standalone CLI and multi-platform tool that happens to also work great as a GitHub Action. This release also brings dedicated Yocto/OpenEmbedded support, full SPDX 3.0.1 pipeline fidelity, and pipdeptree integration for complete Python dependency trees.

---

## From github-action to sbomify-action

When we first published the project, it was a GitHub Action and nothing else. The name `github-action` made perfect sense. Then v0.11 brought PyPI distribution and CLI support. v0.13 added the configuration wizard and we presented at FOSDEM. People started running it in GitLab CI, Bitbucket Pipelines, and on their laptops. The name stopped fitting.

With v0.14, the name catches up with reality. The project is now `sbomify-action` everywhere: on [PyPI](https://pypi.org/project/sbomify-action/), on GitHub, and in the documentation. The GitHub repository has moved from `sbomify/github-action` to `sbomify/sbomify-action`.

If you are using the GitHub Action, your existing `sbomify/github-action@v0.14` references continue to work. GitHub handles repository renames transparently, so there is no breaking change. We recommend updating your workflow files when convenient, but there is no rush.

---

## Yocto/OpenEmbedded CLI Command

Yocto and OpenEmbedded are the backbone of embedded Linux development. From industrial controllers to medical devices to automotive systems, Yocto builds the firmware that runs critical infrastructure. With the EU Cyber Resilience Act and FDA cybersecurity guidance now requiring SBOMs for these devices, embedded teams need tooling that can handle Yocto's unique SBOM output.

The challenge is scale. A typical Yocto build produces hundreds of individual per-package SBOM files, one for each recipe in the image. Processing them manually, setting visibility, injecting PURLs, and uploading them to a management platform, is impractical at that volume.

The new `sbomify-action yocto` command handles all of this in a single invocation:

```bash
sbomify-action --token $SBOMIFY_TOKEN \
  --augment --enrich \
  yocto tmp/deploy/images/qemux86-64/core-image-base.rootfs.spdx.tar.zst \
  --release "my-product:1.0.0"
```

It walks the Yocto SPDX output directory, processes every SBOM it finds, injects PURLs where missing, and uploads them in batch. Both SPDX 2.2 and SPDX 3 output formats from Yocto are supported.

The `--visibility` flag lets you control whether uploaded SBOMs are public, internal, or private, which is important when dealing with proprietary firmware builds.

For a complete walkthrough of integrating sbomify into your Yocto workflow, see our [Yocto guide](/guides/yocto/).

---

## Full SPDX 3.0.1 Pipeline Support

SPDX 3.0 is the first major version bump since SPDX 2.3, and organizations preparing for CRA compliance need their tooling to handle it end to end. With v0.14, we now support SPDX 3.0.1 across all four phases of our pipeline: generation, augmentation, enrichment, and upload.

If you saw our [FOSDEM talk](/2026/02/04/announcing-sbomify-action-v0-13-the-one-where-we-go-to-fosdem/) on the four-phase SBOM generation model, this is the release where SPDX 3 achieves full parity with CycloneDX across that entire pipeline.

A significant part of this work was ensuring roundtrip fidelity. In earlier versions, running an SPDX 3 document through our enrichment phase could lose elements, strip type prefixes, or rename properties in ways that made the output invalid. We have fixed all of these issues. You can now generate an SPDX 3.0.1 document, enrich it with license data and metadata, and get back a valid SPDX 3.0.1 document with all original elements preserved.

---

## Pipdeptree Integration for Python

A `requirements.txt` file lists your direct dependencies, but it says nothing about what those dependencies pull in. If `requests` depends on `urllib3` and `certifi`, those transitive dependencies belong in your SBOM too. Without them, your SBOM is incomplete, and any vulnerability scanner consuming it will have blind spots.

sbomify-action v0.14 natively integrates [pipdeptree](https://github.com/tox-dev/pipdeptree) to automatically discover and include transitive dependencies in your Python SBOMs. When you point sbomify-action at a `requirements.txt`, it resolves the full dependency tree and ensures every package, direct or transitive, appears in the final SBOM.

This completes the Python story we have been building across releases: PyPI enrichment for metadata, hash enrichment from lockfiles, and now pipdeptree for the complete dependency graph.

---

## Other Improvements

- **Caching** - License databases, Trivy, and Syft are now cached between runs. (Note: Trivy has since been [removed from sbomify-action](/2026/03/26/trivy-compromise-hardening-sbomify-action/) as of v26.1.0 following its March 2026 compromise.) This significantly reduces execution time for repeat CI runs where the tooling has not changed.
- **Standalone mode** - Use `--lock-file none` to run sbomify-action without a lockfile. This is useful when you want to inject additional packages or metadata into an existing SBOM without re-running dependency analysis.
- **Gzip compression** - Large SBOM uploads are now automatically compressed with gzip to avoid timeouts on slow or constrained network connections.
- **Configurable upload timeout** - You can now set a custom timeout for SBOM uploads, and the tool will stop early if your plan's component limit is reached.
- **Updated Trivy** - Bumped from 0.68.2 to 0.69.2 for the latest vulnerability database and scanning improvements. (Note: Trivy has since been [removed from sbomify-action](/2026/03/26/trivy-compromise-hardening-sbomify-action/) as of v26.1.0 following its March 2026 compromise.)
- **Updated dependencies** - All project dependencies have been bumped to their latest versions.

---

## Bug Fixes

- Fixed SPDX 3 roundtrip issues: elements are now preserved during enrichment, type prefixes are restored correctly, and property names are no longer renamed
- Fixed SPDX 3 version override not updating the PURL to match the new version
- Fixed unsupported format/version combinations producing an unhandled ValueError instead of a clear error message
- Fixed SPDX namespace uniqueness to prevent collisions and added test assertion guards
- Fixed various data corruption, sanitization, and error handling edge cases

---

## Getting Started

Install from PyPI:

```bash
pip install sbomify-action
```

Or use the GitHub Action:

```yaml
- uses: sbomify/sbomify-action@v0.14
```

Existing `sbomify/github-action@v0.14` references continue to work thanks to the GitHub repository redirect.

Check out the [full changelog on GitHub](https://github.com/sbomify/sbomify-action/compare/v0.13...v0.14) for complete details.
