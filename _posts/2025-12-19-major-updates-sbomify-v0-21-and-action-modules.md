---
layout: post
title: "Major Updates: sbomify v0.21 and Action Module v0.8 & v0.9"
description: "Triple release: sbomify v0.21 with vulnerability trends dashboard, plus GitHub Action v0.8 and v0.9 featuring modular generation plugins and 8 enrichment data sources."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, github-actions]
---

![Major Updates](/assets/images/sbomify-v0-21-release.png)

We have been busy at sbomify! Today we are announcing a triple release covering significant updates to both the core platform and our GitHub Action module. Here is a breakdown of what's new.

## sbomify v0.21: "The One Where We Almost Ditched Vue"

This release brings substantial improvements to the user interface and underlying technology stack. As the release name suggests, we've undertaken a significant refactoring effort to streamline our frontend architecture.

### Key Features

- **Vulnerability Trends Dashboard:** A new interactive dashboard to visualize vulnerability trends over time.
- **Enhanced Workspace Management:** A new workspace switcher with a modal interface in the sidebar makes managing multiple environments easier than ever.
- **Custom Keycloak Login:** We've introduced a custom Keycloak login theme with Tailwind CSS styling for a more seamless authentication experience.
- **Improved Navigation:** A new navbar search, improved notifications, and version display in the footer.

Under the hood, we migrated the Documents and SBOMs tables from Vue.js to **HTMX and Alpine.js**, resulting in a lighter and more responsive interface. We also cleaned up the codebase by removing deprecated Vue.js components.

[Read the full v0.21 release notes](https://github.com/sbomify/sbomify/releases/tag/v0.21)

---

## sbomify-action v0.9: "The One Where Generation Gets Modular"

Our GitHub Action module has received a major architectural upgrade focused on modularity and extensibility.

### Modular Generation

Version 0.9 introduces a **plugin architecture for SBOM generation**. This system uses priority-based selection with automatic fallback (e.g., trying `cyclonedx-py` first, then `Trivy`, then `Syft`), ensuring you get the best possible SBOM for your project type without manual configuration.

### Ubuntu APT Enrichment

We've added native metadata source support for `pkg:deb/ubuntu/*` packages, covering LTS versions from 18.04 to 24.04 and 24.10.

### Built-in Validation

Generated SBOMs are now automatically validated against the JSON Schema to ensure strict compliance.

---

## sbomify-action v0.8: "The One With Enrichment Plugins"

Just prior to v0.9, we released v0.8, which completely rewrote the SBOM enrichment system.

### Plugin-based Enrichment

Similar to generation, enrichment is now plugin-based. We prioritize multiple data sources to maximize NTIA compliance. We have implemented 8 data sources including **PyPI, Debian, deps.dev, ecosyste.ms, PURL, ClearlyDefined, Repology, and RPM Repo**.

Crucially, **lockfile components are now enriched** rather than removed, preserving the integrity of your dependency graph while adding valuable metadata.

### Expanded Ecosystem Support

- **RPM Repository Enrichment:** Native Tier 1 enrichment for RHEL-compatible distros (Rocky, Alma, CentOS Stream, Fedora, Amazon Linux).
- **Dart/Flutter:** Added support for Dart packages via pub.dev and `pubspec.lock` enrichment.
- **CycloneDX 1.7:** Full support for the latest CycloneDX 1.7 schema.

These updates represent a significant step forward in making sbomify the most flexible and compliant SBOM management platform.

Check out the updated [sbomify-action repository](https://github.com/sbomify/github-action) to get started with these new features!
