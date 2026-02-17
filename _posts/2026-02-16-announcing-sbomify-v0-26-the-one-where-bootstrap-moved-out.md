---
layout: post
title: "Announcing sbomify v0.26: The One Where Bootstrap Moved Out"
description: "sbomify v0.26 delivers a faster, more accessible UI, real-time dashboard updates, BSI TR-03183-2 compliance, and GDPR self-service account deletion."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, tailwind, websocket, compliance, gdpr]
tldr: "sbomify v0.26 delivers a faster and more accessible UI, real-time dashboard updates, BSI TR-03183-2 compliance for the German market, GDPR self-service account deletion, and fine-grained access control for components and documents."
---

## A Faster, More Accessible UI

The first thing you will notice is that **sbomify feels faster**. Pages load more quickly, transitions are smoother, and the interface is more consistent throughout the application. Dark mode now works reliably across every page, and accessibility has been improved with better contrast ratios, keyboard navigation, and screen reader support.

Under the hood, we rebuilt the entire frontend from scratch. But what matters to you is the result: a cleaner, more polished experience that gets out of your way.

We have also redesigned the **onboarding wizard**. New users can now get from sign-up to their first SBOM upload in fewer steps, with clearer guidance at each stage.

---

## Real-Time Dashboard Updates

Until now, checking whether an assessment finished or a new SBOM was uploaded meant manually refreshing the page. That changes with v0.26.

Your dashboard now updates in **real-time**. When a teammate uploads an SBOM, a compliance assessment completes, or a component status changes, you see it immediately. No more guessing, no more stale data.

From your perspective, it just works.

---

## BSI TR-03183-2 Compliance

If you operate in Germany or sell into the German market, sbomify now supports automated compliance checking against **BSI TR-03183-2** — the German Federal Office for Information Security's technical guideline for SBOM quality and completeness.

Like our other compliance plugins, you can enable it in **Settings -> Plugins**. Once enabled, every SBOM upload is assessed automatically against the BSI requirements.

This plugin also introduces a **dependency system** for compliance plugins. Plugins can now build on each other, so related standards share foundational checks rather than duplicating work. This means more consistent results across overlapping compliance frameworks.

---

## GDPR Self-Service Account Deletion

Under GDPR, you have the right to delete your account and all associated data. Previously, this required contacting our support team and waiting for manual processing.

With v0.26, you can **delete your own account** directly from your profile settings. No tickets, no waiting. Your data is removed in accordance with our data retention policy.

---

## Fine-Grained Access Control

You can now control who sees what at a more granular level. Set **component visibility** to restrict which components are visible to which roles, and control **document-level access** to limit who can view specific SBOM documents.

This is particularly useful for organizations sharing SBOMs externally through the **Trust Center**. You can make some components public for customers and partners while keeping internal components private — all from the same workspace.

---

## Other Improvements

- **Version field on Releases** — You can now track release versions aligned with the Transparency Exchange API (TEA), making it easier to correlate SBOMs with specific product versions.
- **Improved error tracking** — We catch and resolve issues faster now, often before you notice them.
- **Custom login experience** — The login page now uses a branded sbomify theme with better password validation feedback, so you know exactly what is needed when setting or changing your password.
- **Zero-downtime deployments** — Deployments no longer cause brief interruptions. Updates happen seamlessly in the background, so the platform is always available.

---

## Bug Fixes

- Fixed an issue where compliance assessments could fail on retry.
- Fixed IP address capture in NDA audit trails.
- Improved error responses for duplicate SBOM uploads — the API response now includes an error code for easier debugging in CI/CD pipelines.

---

## Infrastructure

For self-hosted users, note that sbomify v0.26 now requires **Python 3.13**. We have also updated several key dependencies, including gunicorn 25.x, ruff 0.15.x, and bandit 1.9.3. Check the full changelog for upgrade notes before updating your deployment.

---

## Getting Started

If you are on the **hosted platform**, everything is already live — no action needed.

For **self-hosted** deployments, update to v0.26.0 by pulling the latest release.

Check out the [full changelog on GitHub](https://github.com/sbomify/sbomify/compare/v0.25.1...v0.26.0) for complete details. We would love to hear your feedback — reach out via [GitHub Issues](https://github.com/sbomify/sbomify/issues) or our community channels.
