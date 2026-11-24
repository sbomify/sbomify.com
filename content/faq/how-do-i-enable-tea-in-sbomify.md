---
title: "How do I enable the Transparency Exchange API (TEA) in sbomify?"
description: "Step-by-step guide to enabling the Transparency Exchange API (TEA) in sbomify for automated SBOM discovery and distribution."
answer: "Enable your Trust Center under Settings > Trust Center, make sure it is reachable on a validated custom domain, then toggle on Transparency Exchange API (TEA) in the Sharing section. TEA requires a Business plan or higher."
tldr: "Enable your Trust Center under Settings > Trust Center, make sure it is reachable on a validated custom domain, then toggle on Transparency Exchange API (TEA) in the Sharing section. TEA requires a Business plan or higher."
plan: "Business+"
weight: 72
keywords: [TEA, Transparency Exchange API, SBOM distribution, SBOM discovery, sbomify TEA, enable TEA, .well-known/tea]
url: /faq/how-do-i-enable-tea-in-sbomify/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/tea_enabling.webm" title="How to enable TEA in sbomify" description="Step-by-step screencast showing how to enable the Transparency Exchange API (TEA) in sbomify." upload_date="2026-02-26T19:24:17Z" >}}

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

TEA is available on the **Business** plan and above. It is delivered through your Trust Center, so the Trust Center must be enabled, and TEA discovery only answers on a validated custom domain (or, where your sbomify instance offers one, your Trust Center subdomain). The feature is currently in beta.

To enable it:

1. Navigate to **Settings** and open the **Trust Center** tab
2. **Enable** the Trust Center
3. In the **Custom domain** section, enter your domain (e.g. `trust.yourcompany.com`) and click **Save domain**
4. Add the two CNAME records shown (one for the domain, one for automatic SSL certificates) at your DNS provider, then wait for the status to show **Verified**
5. In the **Sharing** section, toggle **Transparency Exchange API (TEA)** on

After TEA is enabled, the settings page shows the **TEA discovery endpoint**, `https://<your-custom-domain>/.well-known/tea`. Consumers can hit that endpoint to programmatically discover and pull your published SBOMs and other transparency artifacts.
