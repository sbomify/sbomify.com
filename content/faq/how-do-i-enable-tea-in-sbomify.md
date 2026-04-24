---
title: "How do I enable the Transparency Exchange API (TEA) in sbomify?"
description: "Step-by-step guide to enabling the Transparency Exchange API (TEA) in sbomify for automated SBOM discovery and distribution."
answer: "Enable your Trust Center under Settings > Trust Center, configure and validate a custom domain, then toggle on TEA. TEA requires a Business plan or higher."
tldr: "Enable your Trust Center under Settings > Trust Center, configure and validate a custom domain, then toggle on TEA. TEA requires a Business plan or higher."
plan: "Business+"
weight: 72
keywords: [TEA, Transparency Exchange API, SBOM distribution, SBOM discovery, sbomify TEA, enable TEA, .well-known/tea]
url: /faq/how-do-i-enable-tea-in-sbomify/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/tea_enabling.webm" title="How to enable TEA in sbomify" description="Step-by-step screencast showing how to enable the Transparency Exchange API (TEA) in sbomify." >}}

## What is TEA?

The [Transparency Exchange API (TEA)](https://github.com/CycloneDX/transparency-exchange-api) is a standardized, format-agnostic API for automating software supply chain transparency. Developed within ECMA TC54, it provides a standard way for vendors and open-source projects to share transparency artifacts with downstream consumers.

TEA goes beyond just SBOMs. It supports sharing a range of artifact types:

- **SBOMs** - Software Bill of Materials
- **VEX/VDR** - Vulnerability exploitability and disclosure reports
- **CLE** - Common Lifecycle Enumeration (ECMA-428)
- **CDXA** - CycloneDX Attestations for standards compliance
- **HBOM, AI/ML-BOM, SaaSBOM, CBOM** - Hardware, AI/ML, SaaS, and Cryptography BOMs

Instead of manually exchanging files via email or portals, TEA lets consumers programmatically discover and retrieve artifacts for any product release using a standard API.

## Enabling TEA

TEA is available on the **Business** plan and above. It is delivered through your Trust Center, so the Trust Center must be enabled and reachable on a validated custom domain before TEA can be turned on.

To enable it:

1. Navigate to **Settings** and open the **Trust Center** tab
2. **Enable** the Trust Center
3. Set a **custom domain** (e.g. `trust.yourcompany.com`) and click **Save Domain**
4. Configure the CNAME record at your DNS provider so the domain points to sbomify, then wait for validation
5. Once the domain is validated, toggle **TEA** on

After TEA is enabled, sbomify exposes a discovery URL at `https://<your-custom-domain>/.well-known/tea`. Consumers can hit that endpoint to programmatically discover and pull your published SBOMs and other transparency artifacts.
