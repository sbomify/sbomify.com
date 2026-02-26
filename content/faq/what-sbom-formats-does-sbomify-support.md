---
title: "What SBOM formats does sbomify support?"
description: "sbomify supports CycloneDX and SPDX SBOM formats in JSON, with automatic validation and schema compliance checking."
answer: "sbomify supports both CycloneDX and SPDX - the two industry-standard SBOM formats - in JSON representation, with automatic validation against official schemas."
tldr: "sbomify supports both CycloneDX and SPDX - the two industry-standard SBOM formats - in JSON representation, with automatic validation against official schemas."
weight: 30
keywords: [SBOM formats, CycloneDX, SPDX, sbomify formats, SBOM standard]
url: /faq/what-sbom-formats-does-sbomify-support/
---

## Supported formats

sbomify supports the two major SBOM standards:

### CycloneDX

[CycloneDX](https://cyclonedx.org/) is an OWASP project designed specifically for security use cases. It is lightweight, easy to generate, and widely supported by tooling.

- **Versions supported:** CycloneDX 1.6, 1.7
- **Representations:** JSON
- **Strengths:** Security-focused, supports VEX (Vulnerability Exploitability eXchange), extensive tooling ecosystem

### SPDX

[SPDX](https://spdx.dev/) (Software Package Data Exchange) is an ISO/IEC international standard (5962:2021) with deep roots in license compliance.

- **Versions supported:** SPDX 2.3, 3.0
- **Representations:** JSON
- **Strengths:** ISO standard, strong license compliance support, widely used in automotive and enterprise

## Automatic validation

When you upload an SBOM to sbomify, it is automatically validated against the official schema for its format and version. This helps catch malformed documents before they enter your pipeline.

## Which format should I choose?

Both formats are well supported and meet regulatory requirements. Some considerations:

- **CycloneDX** is generally easier to get started with and has stronger security tooling (VEX, VDR)
- **SPDX** may be preferred if your industry or customers specifically require an ISO standard

Most SBOM generation tools support both formats. See our [language guides](/guides/) for tool-specific instructions.

## Can I convert between formats?

We strongly recommend against converting between CycloneDX and SPDX. The two formats have different data models, and conversion is inherently lossy - fields, relationships, and metadata will be dropped or misrepresented in the process. The resulting SBOM may look valid but will be incomplete or inaccurate.

Instead, generate your SBOMs natively in the format you need. Some tools like Syft and Trivy support both formats, but many generators only output one. Check our [Resources page](/resources/) for a list of SBOM generation tools and their supported formats.
