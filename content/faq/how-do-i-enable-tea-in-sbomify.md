---
title: "How do I enable the Transparency Exchange API (TEA) in sbomify?"
description: "Step-by-step guide to enabling the Transparency Exchange API (TEA) in sbomify for automated SBOM discovery and distribution."
answer: "You can enable TEA from your workspace settings. TEA requires a Business plan or higher."
tldr: "You can enable TEA from your workspace settings. TEA requires a Business plan or higher."
plan: "Business+"
weight: 72
keywords: [TEA, Transparency Exchange API, SBOM distribution, SBOM discovery, sbomify TEA, enable TEA]
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

TEA is available on the **Business** plan and above.

To enable it:

1. Navigate to your workspace **Settings**
2. Go to the **TEA** section
3. Toggle TEA on
4. Configure your TEA endpoint settings

Once enabled, your published SBOMs become discoverable via the TEA protocol, making it easy for customers and partners to access your transparency data automatically.
