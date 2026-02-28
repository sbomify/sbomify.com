---
title: "Are SBOMs required for Secure by Design?"
description: "Learn why SBOMs are a non-optional requirement for Secure by Design and Secure by Default practices, backed by CISA guidance, the EU CRA, and US Executive Orders."
answer: "Yes. SBOMs are a foundational requirement of Secure by Design. CISA, the EU Cyber Resilience Act, and US Executive Orders all mandate or strongly recommend SBOMs as essential to building and verifying secure software."
tldr: "Yes. SBOMs are a foundational requirement of Secure by Design. CISA, the EU Cyber Resilience Act, and US Executive Orders all mandate or strongly recommend SBOMs as essential to building and verifying secure software."
weight: 52
keywords: [Secure by Design SBOM, Secure by Default, CISA Secure by Design, SBOM requirement, software supply chain security]
url: /faq/are-sboms-required-for-secure-by-design/
---

## What is Secure by Design?

**Secure by Design** is a software development philosophy — championed by CISA and endorsed by 19+ international partner agencies — that shifts security responsibility from end users to technology manufacturers. It rests on three core principles:

1. **Take ownership of security outcomes** — manufacturers, not customers, bear responsibility for product security
2. **Embrace radical transparency** — openly share security information, including vulnerabilities and software composition
3. **Build organizational leadership commitment** — security is a board-level priority, not just an engineering concern

The goal is to make products secure out of the box, rather than relying on customers to layer on security after the fact. For a deeper dive, see our post on [CISA's Secure by Design initiative](/2024/07/24/embracing-cybersecurity-with-cisas-secure-by-design-initiative/).

## Why SBOMs are non-optional

SBOMs are not a nice-to-have under Secure by Design — they are foundational to multiple core principles:

- **Radical transparency requires component visibility** — you cannot be transparent about your product's security posture without knowing exactly what components are inside it. An SBOM is the mechanism that provides that visibility.
- **Vulnerability response depends on inventory** — when a critical vulnerability like Log4Shell or the XZ Utils backdoor is disclosed, SBOMs let you answer "are we affected?" in seconds rather than days.
- **Supply chain integrity** — SBOMs make every component and dependency traceable, helping detect tampering and ensuring the provenance of your software.
- **Compliance mandates it** — the [EU Cyber Resilience Act](/faq/what-is-the-eu-cyber-resilience-act/), US Executive Order 14028, and CISA's own guidance all require or strongly recommend SBOMs as part of Secure by Design practices.

## Regulatory mandates

Several major frameworks now connect Secure by Design directly to SBOM requirements:

- **CISA Secure by Design Pledge** — commits signatories to transparency practices that include providing SBOMs and participating in vulnerability disclosure programs
- **[EU Cyber Resilience Act (CRA)](/compliance/eu-cra/)** — makes Secure by Design a legal duty for products sold in the EU, with SBOM requirements fully enforceable by September 2027
- **US Executive Order 14028** — directs federal agencies to require SBOMs from software suppliers, with NIST's Secure Software Development Framework (SSDF) reinforcing this
- **DoD/Pentagon** — requires SBOMs in all new software contracts as of February 2025

For detailed compliance guidance, see our pages on [EU CRA compliance](/compliance/eu-cra/), [NTIA minimum elements](/compliance/ntia/), and [CISA framing](/compliance/cisa-framing/).

## How sbomify helps

sbomify provides the tooling to put Secure by Design into practice:

- **Generate and manage SBOMs** across your entire product portfolio using [sbomify-action](https://github.com/sbomify/sbomify-action)
- **Automated vulnerability scanning** against known CVEs so you can respond to disclosures immediately
- **Share compliance artifacts** with customers and auditors via your [Trust Center](https://trust.sbomify.com/)
- **Track compliance** against [NTIA](/compliance/ntia/), [CISA](/compliance/cisa-framing/), and [CRA](/compliance/eu-cra/) requirements with built-in compliance plugins

Get started for free at [app.sbomify.com](https://app.sbomify.com).
