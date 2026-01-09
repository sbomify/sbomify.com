---
layout: post
title: "Announcing GitHub Action 0.7.0 and sbomify 0.19"
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, github-actions]
---

![Zero to SBOM Hero](/assets/images/release-0-19-cover.png)

We are excited to announce significant updates to both our GitHub Action and the core sbomify platform. This release brings major architectural improvements, enhanced security features, and expanded support for SBOM standards.

## [GitHub Action 0.7.0](https://github.com/sbomify/github-action/releases/tag/v0.7.0)

The latest version of our GitHub Action includes major changes to enrichment, format support, and telemetry.

### Major Changes

- **Enrichment via ecosyste.ms**: We have switched our package metadata enrichment from Parley to the [ecosyste.ms](https://ecosyste.ms) API. A big thank you to @andrew for this integration!
- **SPDX Support**: We now offer full support for SPDX 2.2 and 2.3 formats alongside CycloneDX, powered by the new `spdx-tools` dependency.
- **Enhanced Telemetry**: Sentry error tracking now respects repository visibility, ensuring that private repositories do not send CI context.

### Improvements

- **API Updates**: The product releases API now uses `sbom_id` instead of `artifact_id`/`artifact_type`.
- **Release Tagging**: Improved workflow for release tagging with better ID resolution.
- **Vendor Normalization**: Fixed tool vendor normalization to prevent serialization comparison errors.
- **Caching**: Better cache management for enrichment API calls.
- **Error Filtering**: User errors (validation/configuration) are now filtered from telemetry to reduce noise.

### Testing & Dependencies

We've added comprehensive Sentry filtering tests across GitHub Actions, GitLab CI, and Bitbucket Pipelines, along with new tool vendor normalization tests. Dependencies have been updated to include `spdx-tools`, `beartype`, `click`, `isodate`, `ply`, `rdflib`, `semantic-version`, `uritools`, and `xmltodict`.

---

## [sbomify 0.19](https://github.com/sbomify/sbomify/releases/tag/v0.19)

This is a massive release for the sbomify platform, involving a complete frontend architecture migration and significant infrastructure enhancements.

### Summary

- Major frontend architecture migration
- Infrastructure enhancements

### Architecture Changes

We have almost completed the full migration from Vue.js to a stack of **Django + HTMX + Alpine.js**.

- Removed ~3,700 lines of Vue code.
- All frontend is now server-driven with Django templates.
- Added [`ADR-001`](https://github.com/sbomify/sbomify/blob/master/docs/ADR/ADR-001.md) (Django Monolith) and [`ADR-002`](https://github.com/sbomify/sbomify/blob/master/docs/ADR/ADR-002.md) (Languages & Frameworks) to our architectural decision records.

### Infrastructure & Security

- **Caddy Reverse Proxy**: Now handling automatic Let's Encrypt TLS certificate management and health monitoring.
- **Custom Domain Support**: Workspaces can now use custom domains with auto-provisioned TLS and automated validation.
- **Security**:
  - Added Turnstile CAPTCHA on enterprise contact forms.
  - Enhanced client IP detection with spoofing protection.
  - Keycloak authentication fixes.

### New Features

- **Global Components**: Workspace-level reusable components.
- **Contact Profiles**: Reusable supplier information for SBOMs.
- **Workspace Visibility Controls**: Toggle between public and private workspaces (paid plans).
- **Improved CycloneDX 1.6 & added 1.7 Support**: Support for the latest SBOM specifications.
- **Release Date Tracking**: Added an optional `released_at` field.
- **Vulnerability Scanning Dashboard**: Centralized management for scans.
- **Enhanced Trust Center**: A redesigned public workspace page for better transparency.

These updates mark a significant step forward in our mission to simplify SBOM management and security compliance.
