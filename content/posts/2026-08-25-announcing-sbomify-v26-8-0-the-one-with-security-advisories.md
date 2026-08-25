---
title: "Announcing sbomify v26.8.0: The One With Security Advisories"
description: "sbomify v26.8.0 adds full security advisory publishing with per-product gating, a rebuilt Trust Center, patch SLA targets and CRA KPIs, formal risk acceptance, malicious package detection, CSV evidence exports, and a new brand."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, cra, advisories, vex, trust-center, compliance, vulnerability-management]
tldr: "sbomify v26.8.0 closes the loop between finding a vulnerability and telling your customers about it. You can now write security advisories inside sbomify, walk them through a public timeline, and publish them on your Trust Center with per-product gating so an embargoed advisory only reaches the customers entitled to see it. The release also lands the measurable half of CRA compliance: patch SLA targets, the five CRA KPIs, formal risk acceptance with an owner and an expiry, end-of-life obligations, and ten-year evidence retention. Plus CSV exports for auditors, malicious package detection, and a completely new look."
date: 2026-08-25
slug: announcing-sbomify-v26-8-0-the-one-with-security-advisories
---

Most vulnerability tooling stops at the moment of discovery. You get a finding, a severity, maybe a fix version, and then you are on your own for the part that actually matters to your customers: telling them what happened, which of your products it affects, and what they should do about it.

v26.8.0 is about that second half. It is also, not coincidentally, the half the [EU Cyber Resilience Act](/compliance/eu-cra/) starts asking about on **11 September 2026**, when Article 14's reporting obligations come into force. That is three weeks after this post goes out.

---

## Security Advisories, Written and Published From One Place

The new Security Advisories module lets you author a proper vendor advisory inside sbomify: a summary, a severity with its CVSS vector, the affected and fixed version ranges, the products it touches, and a timeline of what you knew and when.

The timeline is the part I would encourage you to look at first. Each entry carries an absolute timestamp, its age, and the gap since the previous update, rendered as "2 weeks later". That gap is the number your customers actually judge you on. A vendor who posted five updates over ten days handled an incident. A vendor whose timeline jumps from "under investigation" to "fixed" four months later did not, and no amount of prose disguises it. Making that visible in your own tooling is a mild form of accountability, and it is deliberate.

When the advisory is ready, it publishes to your Trust Center. That is where it gets interesting.

### Gated Advisories That Are Actually Gated

Advisories have three visibility states, and the middle one is the one nobody else gets right.

- **Private** never leaves your workspace, whatever its publication status.
- **Public** is readable by anyone once it is out of draft.
- **Gated** requires two things at once: a workspace-level grant, meaning the reader is a member or has an approved access request with an NDA signed, **and** a link to at least one product that reader can already reach.

That second condition is what makes gating per-advisory rather than per-workspace. A customer under NDA for your gateway product does not automatically get to read an embargoed advisory about a product they were never shown. And when an advisory touches several products, it only names the ones the reader is entitled to know about; the rest are counted, not named.

There is a smaller detail that matters more than it looks: a gated advisory a reader may not see returns a **404, not a 403**. A 403 confirms the advisory exists, and for something under embargo, the fact that it exists is exactly what you are protecting. Gated pages are also `noindex, nofollow`, because a crawler is nobody's NDA holder.

---

## The Trust Center, Rebuilt Around It

The Trust Center got a full redesign to carry all of this. The advisory index is modelled on how vendor advisory pages are actually read: a filter sidebar beside a dense table, where each advisory occupies a block whose severity, summary, and date span its per-product version rows. Version ranges render as the comparisons that answer the only question a reader has, "am I on an affected version": `>= 11.2.0, < 11.2.4-h20` against `>= 11.2.4-h20`. A product that is not affected simply reads `None` and `All`.

Filtering happens live, facet counts exclude their own filter so ticking a second severity widens the result rather than dead-ending it, and underneath it all is a plain form that works without JavaScript.

Everything picks up your workspace branding, with one deliberate exception. The severity scale is **not** brand-driven, because critical must never render green on a green-branded workspace, and the CVSS number is always printed next to its colour so severity never depends on colour alone.

Alongside the advisories, the Trust Center now carries persistent navigation on every public page, so a customer arriving from a search result or a link in an email has a route to the rest of your disclosures instead of a dead end.

---

## The CRA Questions Auditors Actually Ask

We have been building CRA support since [v26.1.0](/2026/04/02/announcing-sbomify-v26-1-0-the-one-where-we-switch-to-calver/), and [v26.2.0](/2026/05/13/announcing-sbomify-v26-2-0-the-one-that-signs-the-doc/) closed the Declaration of Conformity loop. This release is about the parts that have to be measurable rather than merely documented.

- **Patch SLA targets, and the five CRA KPIs.** You can now set how fast a vulnerability of each severity has to be fixed, defaulting to a defensible Critical 7 / High 30 / Medium 90 days so a workspace that never opens the setting still has a published policy. Once there is a target, the five KPIs become computable: mean time to triage, mean time to remediate, open criticals with their KEV split, patch SLA compliance, and VEX publication latency. Two judgement calls are worth knowing about. An open finding already past its SLA counts as a breach **now**, not when someone eventually closes it, because otherwise a workspace could hold a breach open forever and keep a perfect record. And a best-effort severity sits outside the percentage rather than counting as always met, because treating an unbounded target as satisfied flatters the number exactly where your policy is weakest.
- **Your EU Authorized Representative, on the DoC.** If you are placing a product on the EU market without an EU establishment, Article 22 makes an Authorized Representative mandatory, and Annex V expects their details on the accompanying documentation. The CRA wizard now captures the establishment determination and, where required, the representative's details and mandate, and the Declaration of Conformity renders them with the Article 25 statement. If a representative is required but missing, the document says so loudly rather than quietly omitting a mandatory section.
- **Evidence that survives the ten-year requirement.** Article 13(15) requires the compliance record kept for ten years after market placement, or the support period if that is longer. Export packages now pin that retention floor at creation, so a later change to the product cannot silently shorten the record you already exported.
- **End of life, handled as an obligation rather than a date field.** Products have carried end-of-support and end-of-life dates for a while, and nothing happened when they approached. Now you get a readiness check that surfaces every critical and high finding neither patched nor formally risk-accepted, a drafted EOL announcement that goes out through the same advisory channel your customers already watch, and the final release's SBOM and VEX pinned to a real versioned release rather than to a floating `latest` pointer that would keep moving after support ended. The announcement is deliberately left as a draft: an EOL notice is an irreversible public statement, so the system surfaces the obligation and a human publishes it.
- **A `security.txt` in the shape BSI TR-03183-3 wants.** Separate CSIRT contact and report-page slots in the correct order, an optional CSAF pointer, and an `Expires` field clamped to at most a year out. It shares one dataset with the CRA wizard, so answering the question in either place fills the other.

---

## Findings That Tell You the Truth

A vulnerability dashboard is only useful if you trust it. Several changes in this release exist because parts of it were quietly lying.

**Malicious packages are now their own class.** A compromised package is a completely different decision from a vulnerable one: you remove it today, you do not schedule a patch for next sprint. Both arrived through the same scanner and rendered identically, and worse, most malicious-package advisories carry no severity at all, so they fell through to a default of _medium_. A supply chain compromise reading as a considered middling judgement is worse than reading as unknown. They are now detected structurally and surfaced as their own category, applied at read time so every scan you have ever run reclassifies with no rescan.

**"Nothing scanned" no longer looks like "nothing found."** An empty result with a green tick is the single most dangerous thing a security tool can show you. A scan that recognised nothing, a scanner that errored out, and a spec version the scanner cannot read are now three distinct states, and none of them renders as a clean bill of health.

**Risk acceptance is a real state, with an owner and an expiry.** Previously the only way to say "we know, we are living with this" was to leave a finding marked exploitable forever, which reads as untriaged backlog. The new `risk_accepted` state requires all three of a business justification, a named risk owner, and an expiry date, because an acceptance without an expiry is indistinguishable from neglect. When the date passes, the acceptance resurfaces as drift rather than quietly holding.

Notably, this is **not** a VEX suppression. CycloneDX has no "accepted" analysis state, and writing `not_affected` would publish a false claim to everyone downstream: an accepted risk genuinely is exploitable, you are choosing to live with it. So the published document says exactly that, `exploitable` with a `will_not_fix` response, and the finding stays visible and counted in your own numbers.

Rounding out the triage work: EPSS scores and CVSS 4.0 are captured from both scanner paths, ENISA's EUVD exploited flag now sits alongside CISA KEV, advisory IDs link to the database that holds them, VEX justifications render in human wording instead of spec enum names, and a vulnerability lifecycle model gives you finding age and MTTR.

---

## Evidence You Can Hand Over

Auditors and procurement teams ask for tables. Until now the answer was "script something against the API."

There are now four CSV exports covering inventory, licenses, findings, and vulnerabilities, scoped to a workspace, product, release, or component. Two things about them are worth calling out. The counting matches what you see on screen, because the exports read the same latest-per-component data and apply live VEX suppressions, so the export can never disagree with the dashboard beside it. And an artifact that cannot be read surfaces as an explicit row rather than silently shrinking the parts list, because for an auditor a quietly incomplete export is far worse than an error.

Alongside those:

- **License risk categories** for SPDX identifiers, so a legal review can start from the licenses that need attention rather than from an alphabetical list of everything.
- **An OpenChain Telco SBOM Guide v1.1 conformance plugin**, checking the clauses the Guide actually mandates. If you supply into telco, this is the profile your customers will ask about.
- **SBOM freshness windows.** Components can now carry a freshness expectation, and an SBOM that has aged past it is flagged as stale. An SBOM from eighteen months ago is not evidence of anything.

---

## A New Look, and Less Clicking

This release also carries sbomify's new visual identity: a new logo and emblem, a palette built around the brand navy, Figtree throughout, and animated loaders that replace every ad-hoc spinner in the app. It runs all the way through to the login pages and transactional emails.

Underneath the paint, the app moved onto a single component library, which is why so much of the interface shifted at once. Settings is now one page per section with tabs across the top rather than one long scroll. Create flows are proper pages. There is one Danger Zone instead of several.

Two things that will save you real time:

- **The navbar search is now a navigation spotlight.** Hit it and jump to any product, component, or page, instead of hunting through the sidebar.
- **The CI/CD integration dialog is one command.** Copy, paste, run. Click to include a token and it mints one scoped to publishing only, with a **7-day TTL** and a name that tells you where it came from, so you are not pasting a long-lived credential into a terminal to get started. The token is minted on click rather than on open, because reading the command is not a decision to create a credential.

Workspace roles were also reworked. Admins are now near-owners, able to do everything an owner can except remove an owner or delete the workspace, rather than being defined by an arbitrary list of things they could not reach. Guest became a purely external Trust Center role, and a new **member** role covers day-to-day work. If you have been granting admin because guest was too little, that gap is now filled.

---

## Getting Started

If you are on the **hosted platform**, all of this is already live. The most useful ten minutes you can spend: open Settings and set your patch SLA targets, then look at the five KPIs against them. That number is the one a CRA auditor will eventually ask for, and it is better to see it now.

If you have vulnerabilities you are knowingly living with, move them to the new risk-accepted state with a real owner and expiry. It will make your open-critical count honest, and the expiry means the decision comes back for review instead of ageing into permanence.

For **self-hosted** deployments, pull `ghcr.io/sbomify/sbomify:v26.8.0` and update. There are additive migrations in this release; take a snapshot first as usual.

The [sbomify-action v26.8.0](/2026/08/25/announcing-sbomify-action-v26-8-0-the-one-that-went-on-a-diet/) release went out at the same time, and if you generate SBOMs in CI it is worth reading, because it fixes some quiet quality problems in the SBOMs themselves.

For the full technical detail, see the [v26.8.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.8.0).

As always, I would like to hear how this lands, particularly the advisory work. Publishing advisories is a workflow most vendors have built once, badly, in a CMS, and we would rather build the version you actually want. If something is missing for how your team discloses, open a support ticket from inside [the app](https://app.sbomify.com) and it will reach us.
