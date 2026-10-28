---
title: "How do I enable the Transparency Exchange API (TEA) in sbomify?"
description: "Step-by-step guide to enabling the Transparency Exchange API (TEA) in sbomify for automated SBOM discovery and distribution."
answer: "Turn on your Trust Center under Settings > Trust Center and add a custom domain. Once the domain is verified, switch on Transparency Exchange API (TEA) in the Sharing section. TEA requires a Business plan or higher."
tldr: "Turn on your Trust Center under Settings > Trust Center and add a custom domain. Once the domain is verified, switch on Transparency Exchange API (TEA) in the Sharing section. TEA requires a Business plan or higher."
plan: "Business+"
weight: 72
keywords: [TEA, Transparency Exchange API, SBOM distribution, SBOM discovery, sbomify TEA, enable TEA, .well-known/tea]
url: /faq/how-do-i-enable-tea-in-sbomify/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/tea_enabling.webm" title="How to enable TEA in sbomify" description="Narrated screencast: switch on the Trust Center, verify a custom domain, turn on the Transparency Exchange API, and copy the discovery endpoint." upload_date="2026-10-28T00:00:00Z" >}}

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

1. Open **Settings** and go to the **Trust Center** tab
2. Switch on **Enable Trust Center**
3. Under **Custom domain**, enter your domain (for example `trust.yourcompany.com`) and click **Save domain**
4. Add the DNS records shown with your DNS provider. sbomify verifies the domain automatically, and its status changes to **Verified**
5. In the **Sharing** section, switch on **Transparency Exchange API (TEA)**

After TEA is enabled, the **TEA discovery endpoint** appears under the toggle, ready to copy. It lives at `https://<your-custom-domain>/.well-known/tea`. Consumers can hit that endpoint to programmatically discover and pull your published SBOMs and other transparency artifacts. A TEA client follows it to your public products, and from there to each release and its artifacts. TEA support in sbomify is in beta.
