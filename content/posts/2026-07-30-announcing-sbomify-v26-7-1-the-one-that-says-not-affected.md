---
title: "Announcing sbomify v26.7.1: The One That Says \"Not Affected\""
description: "sbomify v26.7.1 ships end-to-end VEX support across CycloneDX, OpenVEX, and CSAF, with in-product triage, Dependency-Track sync, and scheduled drift detection. CBOM ingestion now covers every lineage, the Trust Center exposes VEX and CBOM per release, and vulnerability counts finally reflect your current posture."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, vex, openvex, csaf, cbom, vulnerability-management, trust-center]
tldr: "sbomify v26.7.1 makes VEX a first-class citizen: author or upload VEX in CycloneDX, OpenVEX, or CSAF, triage findings in the product, sync triage decisions from Dependency-Track, and let scheduled drift detection tell you when your statements have gone stale or a new High/Critical finding is uncovered. The release also broadens CBOM ingestion to every lineage, surfaces VEX and CBOM per release in the Trust Center, and fixes vulnerability counts so they reflect your current release rather than every SBOM you have ever uploaded."
date: 2026-07-30
slug: announcing-sbomify-v26-7-1-the-one-that-says-not-affected
---

An SBOM tells you what is in your software. A vulnerability scanner tells you which of those components have known CVEs. Neither answers the question your customers actually ask: **are you affected?**

Most of the time, the honest answer is no. The vulnerable function is never called, the affected code path is compiled out, the component ships but is never reachable. That answer has a standard format, VEX, and until now sbomify could store it but not really work with it. v26.7.1 changes that. Here is what matters for you.

## VEX, End to End

**VEX** (Vulnerability Exploitability eXchange) is a machine-readable statement about whether a specific vulnerability actually affects a specific product. Instead of shipping an SBOM and leaving your customers to draw their own conclusions from a raw CVE list, you tell them: this one is not affected, and here is why.

The reason this matters is asymmetric effort. Without VEX, every customer who scans your artifact independently rediscovers the same forty findings and files the same questions with your security team. With VEX, you make the determination once and it travels with the product.

v26.7.1 supports the whole lifecycle:

- **Three formats, one workflow.** Author or upload VEX as CycloneDX VEX, [OpenVEX](https://github.com/openvex), or [CSAF](https://oasis-open.github.io/csaf-documentation/). sbomify ingests all three and normalizes them, so your choice of format is a detail rather than a commitment.
- **Triage inside the product.** Findings can be triaged where you already look at them, with the status and justification recorded as a proper VEX statement rather than a comment in a spreadsheet.
- **Dependency-Track triage sync.** If your team already triages in Dependency-Track, that work no longer has to be redone. Opt in, and triage decisions flow into sbomify and are automatically pinned to the relevant release.
- **Scheduled drift detection.** This is the part teams underestimate. VEX statements go stale: a new version changes whether a code path is reachable, or a new High/Critical finding lands with no statement covering it at all. sbomify now checks on a schedule and tells you, rather than letting a six-month-old "not affected" quietly become wrong.

That last point is the difference between VEX as a compliance artifact and VEX as something you can actually rely on.

---

## CBOM: Every Lineage Now Ingests

[v26.7.0 introduced Cryptography BOM support](/2026/07/07/announcing-sbomify-v26-7-0-the-one-that-gets-quantum-ready/) and post-quantum readiness assessment. The gap in that release was ingestion breadth: depending on which tool produced your CBOM, sbomify might or might not recognize it.

That gap is closed. Every CBOM lineage now ingests, with CycloneDX 1.7 crypto-registry normalization so assets from different generators land in the same shape. Alongside that, the crypto asset UX has been reworked, CBOMs are exposed through [TEA](https://github.com/CycloneDX/transparency-exchange-api), and your workspace dashboard now includes crypto posture next to everything else.

If you tried CBOM upload last month and your generator was not picked up, try again.

---

## The Trust Center Gets Your Posture

Your [Trust Center](/features/trust-center/) is the public face of all this, and it now carries the new artifacts:

- **VEX and CBOM downloads per release**, alongside the SBOMs already there.
- **Vulnerability posture on the release page**, so a customer can see your position without emailing you for it.
- **A simpler posture panel.** The VEX toggle is gone. It was a control that asked visitors to understand an implementation detail before they could read the page, which is precisely backwards for a page aimed at people evaluating your product.

---

## Numbers That Reflect Reality

One fix in this release deserves calling out on its own, because if you looked at your vulnerability counts before today, they were probably wrong in a specific and unhelpful way.

Counts were aggregated across **every historical SBOM version** rather than your current posture. Upload ten iterations of a component over six months, fix things along the way, and the dashboard still counted findings from all ten. The number went up and never came down.

Counts now reflect current posture. Expect your totals to drop, in most cases substantially. Nothing was fixed by the change itself; the number is simply telling the truth now.

Alongside that:

- **Component pages no longer time out at scale.** Two query fixes for workspaces with large artifact histories, where the page could hit a 504.
- **Dependency-Track 4 and 5 both work**, including findings pagination.
- **The SBOMs list shows the latest artifact per format**, not just the most recent upload overall, so a CycloneDX SBOM no longer hides behind an SPDX one.
- **Skipped assessments read as skipped**, not as warnings. A skipped scan is information, not a problem to investigate.

---

## A Fresh Look

The dashboard onboarding flow has been redesigned, and component, product, and vulnerability pages have had a design refresh. Under it, the front end has migrated to Tailwind v4 colours, which mostly means the palette is consistent in places it previously was not.

---

## API and Security

- **Workspace-scoped tokens are enforced across the whole workspaces API.** A token bound to one workspace cannot read another, on every endpoint rather than most of them.
- **The component SBOMs list endpoint gains version and format filtering**, so you can ask for exactly the artifact you want instead of fetching everything and filtering client-side.
- **Dependency updates** covering pillow, pyasn1, and datamodel-code-generator.

---

## Under the Hood

A few things that are invisible in the product but change how quickly we can respond when something breaks for you:

- Every app's test suite now runs in CI, and CI fails loudly if one goes missing rather than silently skipping it.
- Frontend test failures can no longer pass CI silently, and a long-standing flake in the vulnerability trends timeline is fixed.
- Our error tracking stopped tagging production events as `development`, which had been quietly hiding production alerts from the people meant to see them.

Unglamorous, but it is the difference between hearing about a problem from our monitoring and hearing about it from you.

---

## Getting Started

If you are on the **hosted platform**, all of the above is already live. The fastest way to see the VEX work is to open a component with known findings and triage one: pick a status, record a justification, and note that what you get back is a real VEX statement you can publish, not an annotation trapped in our database. If you already triage in Dependency-Track, enable the sync instead and let your existing decisions flow in.

For **self-hosted** deployments, pull `ghcr.io/sbomify/sbomify:v26.7.1` and update.

Either way, check your vulnerability counts after upgrading. If they drop sharply, that is the posture fix working as intended.

For the full technical detail, see the [v26.7.1 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.7.1).

As always, I would like to hear how this lands, and particularly where the VEX workflow does not fit how your team actually triages. VEX is a young standard and the tooling around it is still finding its shape; if the model we have chosen gets in your way, that is useful for us to know. Open a support ticket from inside [the app](https://app.sbomify.com) and it will reach the team.
