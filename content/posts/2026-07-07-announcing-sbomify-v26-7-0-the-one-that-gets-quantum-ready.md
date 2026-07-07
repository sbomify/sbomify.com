---
title: "Announcing sbomify v26.7.0: The One That Gets Quantum-Ready"
description: "sbomify v26.7.0 adds Cryptography BOM (CBOM) support with NIST-grounded post-quantum readiness assessment, per-token API rate limiting with audit logging, a rebuilt authorization layer, and a broad security hardening pass."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, cbom, pqc, post-quantum, security, api, compliance]
tldr: "sbomify v26.7.0 introduces Cryptography BOM (CBOM) support: upload a CBOM and sbomify builds an inventory of your cryptographic assets and grades them against NIST post-quantum guidance, so you can see exactly which algorithms in your stack will not survive the quantum transition. The release also makes API tokens far more manageable with per-token rate limiting, audit logging, last-used tracking, and bulk revocation, and it ships a rebuilt authorization layer plus a wide security hardening pass."
date: 2026-07-07
slug: announcing-sbomify-v26-7-0-the-one-that-gets-quantum-ready
---

Most of the SBOM world is focused on one question: what software am I shipping? v26.7.0 adds a second question that is about to matter a great deal: what cryptography am I shipping, and will it survive the post-quantum transition? This release brings Cryptography BOM (CBOM) support with built-in post-quantum readiness assessment, a much more manageable API token story, and a deep security and authorization overhaul. Here is what matters for you.

## CBOM Support and Post-Quantum Readiness

A **Cryptography BOM (CBOM)** is to your cryptographic assets what an SBOM is to your dependencies: a machine-readable inventory of the algorithms, keys, protocols, and certificates your software actually uses. It is part of the CycloneDX specification, and it exists because "which of our systems still use RSA-2048?" is a question most organizations cannot answer today.

That question is becoming urgent. NIST has finalized its first post-quantum cryptography (PQC) standards, and the guidance is clear: the classical public-key algorithms that underpin most of today's software, such as RSA and elliptic-curve cryptography, are expected to be broken by a sufficiently capable quantum computer. Attackers are already harvesting encrypted traffic now to decrypt later. You cannot plan a migration away from vulnerable algorithms until you know where they are.

v26.7.0 makes sbomify a place to answer that:

- **Upload a CBOM and get a crypto-asset inventory.** sbomify extracts the cryptographic assets from your CBOM into a browsable inventory, with a read API so you can pull it into your own tooling.
- **NIST-grounded PQC readiness classification.** Every asset is graded against NIST post-quantum guidance, so you can see at a glance which algorithms are quantum-safe, which are on borrowed time, and which need to go first.
- **A PQC posture card on your components.** The new assessment plugin summarizes a component's post-quantum readiness right where you already look at its SBOMs and vulnerabilities.
- **Zero-effort ingestion.** CBOMs are auto-detected and tagged on upload. You do not need to tell sbomify what you are sending; if a document contains CBOM content, it is recognized and processed. If you have uploaded CBOMs in the past, they are picked up too.

And because we do not ship anything we do not use ourselves, **sbomify now publishes its own CBOM** from CI on every release, alongside its SBOMs.

If regulators follow the same path with cryptographic transparency that they took with software transparency, and the early signals suggest they will, getting your crypto inventory in order now puts you ahead of the curve rather than behind a deadline.

---

## API Tokens You Can Actually Manage

If you run integrations against the sbomify API, this release gives you the operational visibility that has been missing:

- **See which tokens are actually in use.** Every token now tracks when it was last used, surfaced right in the UI. That token from an experiment eight months ago? You can now see it has been idle since, and revoke it with confidence.
- **Bulk revocation.** When someone leaves the team or you need to respond to an incident, you can revoke tokens in bulk instead of clicking through them one at a time.
- **An audit trail for token authentication.** Token-auth events are now written to a structured audit log, so "who accessed what, with which credential, and when" has an answer.
- **Per-token rate limiting.** API requests are now rate limited per token, with standard `429` responses, a `Retry-After` header, and `X-RateLimit-*` headers on responses so well-behaved clients can pace themselves. Upload endpoints get stricter limits. One runaway script can no longer degrade things for everyone else, including your own other integrations.

Alongside this, we published two new guides: [API access-token best practices and a legacy-token rotation guide](https://github.com/sbomify/sbomify/pull/1073). If you still have long-lived tokens from before expiry became the default, the rotation guide is written for you.

---

## An Authorization Overhaul

A large part of this release happened below the waterline: we rebuilt how sbomify decides who is allowed to do what.

Previously, authorization checks lived inline throughout the codebase, each endpoint doing its own thing. Every check has now been migrated onto a single authorization front door, and a CI gate prevents new inline checks from sneaking back in. One consistent enforcement point instead of hundreds of scattered ones.

What you actually get from this:

- **Token scopes are enforced everywhere.** A read-only token is now read-only on every endpoint, including list, artifact, and component reads, and workspace-scoped tokens cannot reach outside their workspace. The scope you set on a token is the access it has, full stop.
- **Destructive actions are owner-only.** Deleting things now requires owner privileges, and guests can be granted upload access without gaining anything else.
- **CI bots stay in their lane.** OIDC trusted publishing credentials (introduced in v26.3.0) can publish releases but are confined to the specific component they are bound to. A compromised pipeline cannot publish on behalf of the rest of your workspace.

---

## Security Hardening

The usual unglamorous-but-important pass, and this one was thorough:

- **Stored-XSS prevention** in inline document serving, so a malicious document uploaded to a workspace cannot execute script in the browser of someone viewing it.
- **Content-Security-Policy and `X-Content-Type-Options` headers** across the platform, adding defense in depth against script injection and MIME confusion.
- **Client IPs are no longer spoofable.** The `X-Real-IP` header is only trusted when it comes from configured proxies, which keeps audit logs and rate limiting honest.
- **Workspace-isolation fixes** in team management, plugin settings, and public aggregates, closing cross-workspace access paths (IDOR) that should never have been reachable.
- **Dependency and container-image updates** clearing all High-severity advisories across the stack.

None of these require any action from you. They are the kind of fixes you want your SBOM platform, of all things, to take seriously.

---

## Performance, Billing, and the Rest

- **Faster aggregate SBOM builds.** Cold builds of aggregated release and product SBOMs now fetch in parallel, so the first load after a change is noticeably quicker.
- **SPDX-native cross-document linking.** Aggregated SPDX documents now reference their constituent documents the way the SPDX spec intends, which makes them play better with downstream SPDX tooling.
- **Atomic release-artifact replacement.** Replacing an artifact on a release is now all-or-nothing, so consumers never see a half-updated release.
- **Billing does the right thing on downgrade.** Downgrading now cancels the actual subscription, and the grace-period logic has been hardened.
- **Vulnerability dashboard summary cards are point-in-time snapshots**, so the numbers you see reflect a consistent moment rather than shifting under you.
- **Inbound notification emails set Reply-To to the submitter**, so replying to a notification reaches the person who triggered it.

One housekeeping note: you may notice the version jumped from v26.3.0 straight to v26.7.0. Under [CalVer](https://calver.org/), the minor version is the month of release. Nothing was skipped; it has simply been a few months of heads-down work.

---

## Getting Started

If you are on the **hosted platform**, everything above is already live. To try the CBOM support, generate a CBOM for one of your components (tools like [cdxgen](https://github.com/CycloneDX/cdxgen) can emit them) and upload it the same way you upload an SBOM. sbomify will detect it, build your crypto inventory, and show you the PQC posture card. While you are in the app, take two minutes to look at your API tokens: the new last-used column makes stale credentials easy to spot, and bulk revocation makes them easy to clean up.

For **self-hosted** deployments, pull `ghcr.io/sbomify/sbomify:v26.7.0` and update. If you have previously uploaded CBOMs, run the backfill command to tag them and generate PQC assessments for your existing data.

For the full technical detail, see the [v26.7.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.7.0).

As always, I would love to hear your feedback, especially on the post-quantum readiness work. This is a new area for most teams, and we want to build the tooling that makes the transition tractable. If something is unclear or you want to see the assessment go deeper, open a support ticket from inside [the app](https://app.sbomify.com) and the team will get back to you.
