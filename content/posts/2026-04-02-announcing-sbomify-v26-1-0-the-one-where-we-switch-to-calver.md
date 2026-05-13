---
title: "Announcing sbomify v26.1.0: The One Where We Switch to CalVer"
description: "sbomify v26.1.0 introduces the CRA Compliance Wizard, switches to CalVer versioning, adds Trust Center subdomain routing, and brings full TEA v0.4.0 compatibility."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, calver, cra, tea, trust-center]
tldr: "sbomify v26.1.0 introduces the CRA Compliance Wizard so EU device manufacturers can start working through their Cyber Resilience Act readiness inside the product. It also switches to CalVer versioning, brings Trust Center subdomain routing for branded customer-facing pages, adds RFC 9116 security.txt support, and upgrades to TEA spec v0.4.0."
date: 2026-04-02
slug: announcing-sbomify-v26-1-0-the-one-where-we-switch-to-calver
---

If you have been following along, you may have noticed the version number just made a fairly dramatic jump, going from v0.27 straight to v26.1.0. That is not a typo. Starting with this release, sbomify is on [CalVer](https://calver.org/).

The short version: a version number should tell you something useful. With CalVer, every release encodes the year it shipped. The `26` is 2026. At a glance, you can tell whether the sbomify version you are running was cut this year, last year, or two years ago. For a security and compliance product, where currency of the software you are running is itself part of the trust signal, that feels like the right thing to optimise for.

That is the only "breaking change" in this release, and it only matters if you have automated version pins pointed at our images. Everything else is additive.

---

## The CRA Compliance Wizard

The headline feature of v26.1.0 is the new **CRA Compliance Wizard**, a guided workflow for assessing your readiness against the [EU Cyber Resilience Act](/compliance/eu-cra/).

The CRA starts biting in 2027, and the most common question we get from device manufacturers is some variation of *"how do I even know if my product is in scope, and what do I need to do about it?"* The wizard walks you through that, step by step:

1. **Scope screening.** Figure out whether your product is in scope for the CRA at all, and if so, whether it falls under the standard, important, or critical category.
2. **Fix guidance.** When the BSI plugin flags missing or malformed fields in your SBOM, the wizard tells you exactly which fields need attention and where, rather than just handing you a failed assessment.

This is the first half of a longer CRA workflow we have been building. The full Declaration of Conformity, with manufacturer signature and PDF export, lands in the very next release. But the scope screening and fix guidance are usable today, and they alone should save device teams a lot of late-night spec reading.

You can open the wizard from any product page.

---

## Trust Center on Your Own Subdomain

The Trust Center is where your customers go to find your SBOMs, compliance assessments, and security contact information. Until now, you could either keep it at `sbomify.com/<your-workspace>` or attach a custom domain. v26.1.0 adds a third option: you can serve it from a **subdomain of your own domain**, like `trust.example.com`.

Combined with custom-domain support, the Trust Center now feels like a native part of your own web presence rather than a third-party portal that happens to host your documents.

---

## RFC 9116 `security.txt`

[RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) is the standard for telling security researchers where to send a vulnerability disclosure. It lives at a well-known path on your domain, and most coordinated-disclosure tooling looks for it automatically.

With v26.1.0, every Trust Center page automatically serves a valid `security.txt` populated from your workspace's security contact details. Researchers who want to responsibly report an issue can now find out how, without having to dig through your website.

---

## Transparency Exchange API (TEA) v0.4.0

We have been contributors to the [Transparency Exchange API](https://github.com/CycloneDX/transparency-exchange-api) since it was a draft, and we shipped the first version of TEA support in v0.27 (["The One with TEA"](/2026/02/24/announcing-sbomify-v0-27-the-one-with-tea/)). The spec has continued to evolve since then, and v26.1.0 brings sbomify up to **TEA spec v0.4.0**.

For you, this mostly means three things:

- **Better release representation.** Components, releases, and the SBOMs attached to each release are now represented as separate concepts in your TEA endpoint, which matches how downstream consumers expect to find them.
- **Build-variant support.** The same release built for different architectures or operating systems can now be represented unambiguously.
- **Faster TEA endpoints.** Downstream consumers polling your TEA endpoint will see much lower latencies thanks to caching.

If you are publishing SBOMs to customers or partners via TEA, this release should land transparently. If you are consuming someone else's TEA endpoint, you will get richer data without changing anything on your end.

---

## A Broader Definition of "BOM"

We started with SBOMs. The industry is now also producing Hardware BOMs, AI-BOMs, ML-BOMs, and operations BOMs, and we expect more BOM types to follow. To stop bolting each one on as a separate feature, we have generalised the data model so all BOM types flow through the same workflows: the same plugins, the same Trust Center, the same TEA endpoints, the same lifecycle tracking.

Your existing SBOMs keep working without any change on your part. As we add support for new BOM formats over the next few quarters, they will slot in cleanly alongside what you already have.

---

## A Few Smaller Things

- **CycloneDX 1.7** uploads are now accepted, alongside all the older versions you were already using.
- **Plugins moved to the sidebar.** They were previously buried under Settings and people kept asking where they were. They are now one click from anywhere.
- **PostHog analytics** on the hosted platform, so we can see which features people actually reach for. Self-hosted operators can disable it.
- **Hardened production images.** Our production Docker images now use Chainguard's distroless Python base, which means a smaller attack surface for self-hosted deployments. Shoutout to [@nissessenap](https://github.com/nissessenap) for doing the legwork on this migration.
- **Better support for tricky network environments.** TLS with custom CA certificates and Redis password authentication are now fully supported for self-hosted deployments behind corporate proxies.

---

## Getting Started

If you are on the **hosted platform**, everything is already live, no action needed. The CRA Compliance Wizard is available from any product page. To switch your Trust Center over to a subdomain, head to **Settings → Trust Center**.

For **self-hosted** deployments, pull the new image and update. Take a database snapshot before you upgrade, as the BOM-model migration is irreversible.

For the full technical detail, including the complete list of bug fixes, dependency upgrades, and self-hosted infrastructure changes, see the [v26.1.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.1.0).

As always, I would love to hear your feedback. If anything about the CalVer change or the CRA Wizard is confusing, open a support ticket from inside [the app](https://app.sbomify.com) and the team will get back to you.
