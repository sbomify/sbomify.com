---
title: "Announcing sbomify v0.27: The One with TEA"
description: "sbomify v0.27 adds full Transparency Exchange API (TEA) support, SPDX 3.0 compatibility, scoped access tokens, and improved account management."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, tea, spdx, plugins, gdpr, access-tokens]
tldr: "sbomify v0.27 introduces full Transparency Exchange API (TEA) support so your customers and partners can discover and retrieve your SBOMs automatically, SPDX 3.0 format support, workspace-scoped access tokens for safer CI/CD integrations, and improved account management with data export and a grace period for account deletion."
date: 2026-02-24
slug: announcing-sbomify-v0-27-the-one-with-tea
---

We have been working towards this release for a while. sbomify v0.27 brings full Transparency Exchange API (TEA) support, SPDX 3.0 compatibility, scoped access tokens, and a number of quality-of-life improvements across the platform.

## Transparency Exchange API (TEA)

The headline feature of v0.27 is full support for the [Transparency Exchange API](https://github.com/CycloneDX/transparency-exchange-api). TEA is a CycloneDX initiative that creates a standard way for organizations to publish and exchange SBOMs. Think of it as a well-known URL where anyone can automatically discover and retrieve the SBOMs for your products, no manual sharing required.

We have been involved as contributors to the TEA specification for over a year now, and we are excited to finally bring it into sbomify as a first-class feature.

Here is what this means for you: each Trust Center gets its own **TEA-compatible endpoint**. Your customers and partners can point any TEA-compatible tool at your Trust Center and automatically pull the latest SBOMs for the products you share with them.

To get started, enable TEA from **Settings -> Trust Center**. You will need a validated custom domain for your Trust Center, as the `.well-known/tea` discovery endpoint relies on it.

As more tools adopt the TEA specification, this becomes even more powerful. You publish once, and anyone who needs your SBOMs can retrieve them on their own terms.

---

## SPDX 3.0 Support

If your organization uses the SPDX format, you can now upload **SPDX 3.0** SBOMs and they will be fully recognized and validated. All compliance assessment plugins (NTIA, CISA, BSI, FDA, and GitHub Attestation) work with SPDX 3.0 out of the box. Note that vulnerability scanners (OSV and Dependency Track) do not yet support SPDX 3.0. OSV currently requires SPDX 2.x, and Dependency Track only supports CycloneDX.

We have also increased the **upload size limit to 100 MB**, so larger SBOMs from complex applications or monorepos are no longer a problem.

---

## OSV and Dependency Track Plugins

The **OSV scanner** and **Dependency Track scanner** have been upgraded to run as plugins. If you were already using OSV, your existing scan results have been **migrated automatically**. For Dependency Track, previous scan results were not carried over. New scans will populate fresh results under the plugin framework. Both plugins now benefit from improved reliability: if one plugin encounters an issue, it no longer affects anything else in your workspace.

---

## Scoped Access Tokens

Previously, personal access tokens gave access to every workspace in your account. That is not ideal when you are using different tokens in different CI/CD pipelines.

You can now **scope each token to a single workspace**. A token for your production workspace cannot touch your staging workspace. Create separate tokens for each workspace you need to access. This is especially useful if you have multiple teams or environments and want tighter control over what each integration can access.

---

## Account Management and Data Export

Deleting your account now comes with a **14-day grace period**. During that window your account is disabled, but if you change your mind, you can contact support to restore it. After the grace period, everything is permanently removed, including your subscription and login credentials.

Before deleting, you can **export all your personal data** via the API (`GET /api/v1/user/export`). We have also reorganized the account settings page with a clear **danger zone** section so irreversible actions are easy to find but hard to trigger by accident.

---

## Other Improvements

- **Faster API responses**: Large payloads are now compressed automatically, so downloads and API calls feel snappier.
- **Smoother notifications**: In-app messages now appear without interrupting what you are doing.
- **Clearer navigation**: The sidebar has been reorganized with updated labels to make features easier to find.
- **UI polish**: More pages have been updated to the new design language introduced in v0.26.
- **Simpler billing**: Managing your subscription now takes fewer clicks.

---

## Bug Fixes

- Fixed an issue where large SBOM uploads could time out.
- Fixed assessment results not refreshing after re-enabling a plugin.
- Fixed the workspace switcher not updating the sidebar immediately.
- Fixed token permissions not updating correctly after workspace role changes.
- Fixed subscription downgrades not processing correctly mid-billing cycle.

---

## Getting Started

If you are on the **hosted platform**, everything is already live. No action needed.

For **self-hosted** deployments, update to v0.27.0 by pulling the latest release.

Check out the [full changelog on GitHub](https://github.com/sbomify/sbomify/compare/v0.26.0...v0.27.0) for complete details. We would love to hear your feedback. Reach out via [GitHub Issues](https://github.com/sbomify/sbomify/issues) or our community channels.
