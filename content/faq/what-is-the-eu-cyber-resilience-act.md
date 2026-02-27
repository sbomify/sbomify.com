---
title: "What is the EU Cyber Resilience Act (CRA)?"
description: "Understand the EU Cyber Resilience Act, its SBOM requirements, timeline, and how sbomify helps you achieve CRA compliance."
answer: "The EU Cyber Resilience Act (CRA) is a binding EU regulation requiring manufacturers of products with digital elements to provide SBOMs, handle vulnerabilities, and meet cybersecurity requirements throughout the product lifecycle."
tldr: "The EU Cyber Resilience Act (CRA) is a binding EU regulation requiring manufacturers of products with digital elements to provide SBOMs, handle vulnerabilities, and meet cybersecurity requirements throughout the product lifecycle."
weight: 50
keywords: [EU CRA, Cyber Resilience Act, CRA SBOM, EU SBOM compliance, CRA requirements]
url: /faq/what-is-the-eu-cyber-resilience-act/
---

## Overview

The **EU Cyber Resilience Act** (Regulation 2024/2847) is a binding EU regulation that establishes cybersecurity requirements for products with digital elements - essentially any hardware or software product sold in the EU market.

It was published in the Official Journal of the EU in November 2024, with a phased enforcement timeline through 2027.

## Key SBOM requirements

The CRA explicitly requires manufacturers to:

- **Produce a machine-readable SBOM** in a commonly used format (e.g., CycloneDX, SPDX) identifying components and dependencies in their products
- **Cover at least top-level dependencies** of the product
- **Document vulnerabilities** and provide timely security updates
- **Report actively exploited vulnerabilities** to ENISA within 24 hours
- **Maintain cybersecurity** throughout the product's expected lifetime

Germany's BSI has published [TR-03183-2](https://bsi.bund.de/dok/TR-03183-en), which provides concrete technical specifications for CRA-compliant SBOMs, including:

- **Format:** CycloneDX 1.6+ or SPDX 3.0.1+ in JSON or XML
- **Depth:** Recursive dependency resolution down to and including the first component outside the scope of delivery
- **Required fields per component:** Creator, name, version, filename, dependencies, licences (as SPDX identifiers), SHA-512 hash, and executable/archive/structured properties
- **No vulnerability data in SBOMs** - use CSAF or VEX instead

## Who does it apply to?

The CRA applies to:

- Software vendors selling products in the EU (including SaaS with on-premise components)
- Hardware manufacturers with embedded software
- Open-source projects distributed commercially (non-commercial open source has exemptions)

## Timeline

- **September 2026** - Vulnerability reporting obligations begin
- **September 2027** - Full compliance required for all products

## How sbomify helps

sbomify provides tooling to help you prepare for CRA compliance:

- Manage and monitor SBOMs across your product portfolio
- Track vulnerability status with automated scanning
- Share compliance artifacts through your [Trust Center](https://trust.sbomify.com/)
- CRA compliance plugin to assess your SBOM against CRA requirements

For the complete breakdown of CRA requirements and field mappings, see our detailed [EU CRA Compliance Guide](/compliance/eu-cra/).

## FOSDEM 2026: CRA-Ready SBOMs

For a practical walkthrough of CRA-ready SBOM generation, watch our FOSDEM 2026 talk:

{{< video-embed-native video_url="https://video.fosdem.org/2026/ud2208/UYTGWA-sbom-generation.av1.webm" title="CRA-Ready SBOMs: A Practical Blueprint for High-Quality Generation" description="A four-phase SBOM generation model addressing the EU's Cyber Resilience Act requirements, covering authoring, augmenting, enriching, and signing SBOMs to exceed minimal compliance standards." >}}
