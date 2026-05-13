---
title: "Announcing sbomify v26.2.0: The One That Signs the DoC"
description: "sbomify v26.2.0 completes the EU CRA workflow with a signed Declaration of Conformity, adds Component Lifecycle Events, SBOM signatures and provenance, and full CycloneDX 1.7 / SPDX 3.0.1 support."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, cra, compliance, tea, sigstore, provenance]
tldr: "sbomify v26.2.0 finishes the EU Cyber Resilience Act workflow we started in v26.1.0. You can now generate a Declaration of Conformity inside sbomify, sign it with a real handwritten signature, optionally seal the bundle with sigstore, and publish it directly to your product's public page. We have also added Component Lifecycle Events for tracking when products reach end of life, SBOM signatures and provenance for proving where your SBOMs came from, and broader format support across CycloneDX and SPDX."
date: 2026-05-13
slug: announcing-sbomify-v26-2-0-the-one-that-signs-the-doc
---

In [v26.1.0](/2026/04/02/announcing-sbomify-v26-1-0-the-one-where-we-switch-to-calver/) we shipped the first half of the EU Cyber Resilience Act workflow: figuring out whether you are in scope, and what you need to fix. v26.2.0 is where we close the loop. You can now generate a signed Declaration of Conformity straight from sbomify, and publish it on your product's public page in front of customers and regulators.

## The Declaration of Conformity, End to End

If you are putting a product on the EU market under the CRA, you need a [Declaration of Conformity](/compliance/eu-cra/). It is the document where you, the manufacturer, formally state that your product meets the regulation's requirements. Customers want it. Distributors want it. Regulators absolutely want it.

With v26.2.0, you can produce one inside sbomify, end to end. The CRA Compliance Wizard now covers the full workflow:

1. **Scope screening.** Figure out whether your product is in scope. *(shipped in v26.1.0)*
2. **Fix guidance.** Resolve any SBOM gaps that would block conformity. *(shipped in v26.1.0)*
3. **EN 18031 opt-in.** If your product is in scope for the harmonised radio equipment standards, layer EN 18031-1/2/3 assessment on top. *(new in v26.2.0)*
4. **Sign the DoC.** Generate the Declaration of Conformity, capture a manufacturer signature directly in the browser (no DocuSign required), and export it as a PDF. Optionally seal the whole bundle with a sigstore signature for cryptographic provenance. *(new in v26.2.0)*
5. **Publish.** The resulting DoC is available on your product's public page, ready to share with customers and regulators with a single link. *(new in v26.2.0)*

We have also added a **stale-assessment guard**. If your SBOM has been updated since the last CRA assessment, the wizard surfaces a banner so you do not accidentally publish a DoC against outdated evidence.

If you have a hardware product heading into the EU market in 2027, this is the workflow we built for you.

---

## Component Lifecycle Events

Knowing when a product or component reaches end of support or end of life is critical for both customers and your own internal planning. In v0.25 we introduced lifecycle dates on products and components. With v26.2.0, we have made those a first-class concept.

**Component Lifecycle Events** capture the full history of a product's life: when it was released, when it enters its mainstream support phase, when it goes into extended support, and when it finally reaches end of life. Each transition is recorded as an event, with a date and a context, rather than just a single static date field.

For you, this means:

- **History instead of state.** You can see how a product's lifecycle has evolved over time, not just where it is right now.
- **Automatic publication.** A new public endpoint on your Trust Center exposes these events, so customers and downstream tooling can subscribe to lifecycle changes the same way they already pull SBOMs.
- **No manual work.** Your existing release-date and end-of-life fields have been migrated automatically. You do not need to do anything.

If you are tracking the lifecycle of a Linux distribution, a runtime, a library, or your own product, you now have a standard way to consume and propagate that signal.

---

## SBOM Signatures and Provenance

An SBOM tells you what is in your software. A signed SBOM tells you where it came from and that nobody has tampered with it.

v26.2.0 adds first-class support for **SBOM signatures and provenance attestations**. If you generate signed SBOMs from your CI/CD pipeline using [sbomify-action](https://github.com/sbomify/sbomify-action), sbomify will now:

- **Verify the signature** automatically on upload, using [Sigstore](https://www.sigstore.dev/), the same infrastructure that powers supply-chain security across the open source ecosystem.
- **Display a Signed badge** on the SBOM detail page when a valid signature is present.
- **Display a Provenance badge** when an in-toto-style provenance attestation is attached.
- **Show both badges in your Trust Center.** Customers looking at your public SBOM listings will see at a glance which artifacts are cryptographically verified.

The trust signal is now visible inside your own dashboards and outside in front of customers.

---

## More SBOMs Will Just Work

We have always been format-agnostic on uploads, but format support has been quietly broadening. With v26.2.0 we now accept:

- **CycloneDX 1.3, 1.4, 1.5, 1.6, and 1.7**
- **SPDX 2.2, 2.3, and 3.0.1**

We have also relaxed two strict-validation rules that were tripping up real-world SBOMs from upstream tooling: CycloneDX SBOMs without a `metadata.component` field are now accepted, and so are SPDX 3.0.1 SBOMs without a top-level document name. Both are technically permitted by the respective specs, but several SBOM generators omit them in practice.

If you have ever had an SBOM rejected by sbomify because of a missing field that you cannot control, this release likely fixes it for you.

---

## A Friendlier First Login

A few smaller things that add up:

- **Workspace hierarchy in the empty dashboard.** New workspaces now render a clickable hierarchy tree (Workspace → Product → Component → SBOM) so it is immediately obvious how the pieces fit together. Click anywhere on the tree to start creating the first one.
- **Onboarding drip emails.** New users now receive a series of targeted tips after sign-up, rather than a single welcome message followed by silence.
- **Redesigned emails.** Notification emails have been rebuilt from scratch, with full dark-mode support. Email clients finally caught up.

---

## Getting Started

If you are on the **hosted platform**, everything in this release is already live, no action needed. The CRA Compliance Wizard is available from any product page, and your existing lifecycle dates have already been migrated into the new Component Lifecycle Events model.

For **self-hosted** deployments, pull `ghcr.io/sbomify/sbomify:v26.2.0` and update. Take a database snapshot before you upgrade, as there is a real data migration in this release.

For the full technical detail, including the complete list of bug fixes, dependency upgrades, and the under-the-hood plugin and infrastructure changes, see the [v26.2.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.2.0).

As always, I would love to hear your feedback. If you are working through the CRA Compliance Wizard and something is confusing, or worse, missing, open a support ticket from inside [the app](https://app.sbomify.com) and the team will get back to you. The whole point of building this in the open is so we can fix the rough edges before the regulation actually starts to bite.
