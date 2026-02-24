---
title: "What SBOM formats does sbomify support?"
description: "sbomify supports CycloneDX and SPDX SBOM formats in JSON and XML, with automatic validation and schema compliance checking."
answer: "sbomify supports both CycloneDX and SPDX — the two industry-standard SBOM formats — in JSON and XML representations, with automatic validation against official schemas."
tldr: "sbomify supports both CycloneDX and SPDX — the two industry-standard SBOM formats — in JSON and XML representations, with automatic validation against official schemas."
weight: 30
keywords: [SBOM formats, CycloneDX, SPDX, sbomify formats, SBOM standard]
url: /faq/what-sbom-formats-does-sbomify-support/
---

## Supported formats

sbomify supports the two major SBOM standards:

### CycloneDX

[CycloneDX](https://cyclonedx.org/) is an OWASP project designed specifically for security use cases. It is lightweight, easy to generate, and widely supported by tooling.

- **Versions supported:** CycloneDX 1.4, 1.5, 1.6
- **Representations:** JSON, XML
- **Strengths:** Security-focused, supports VEX (Vulnerability Exploitability eXchange), extensive tooling ecosystem

### SPDX

[SPDX](https://spdx.dev/) (Software Package Data Exchange) is an ISO/IEC international standard (5962:2021) with deep roots in license compliance.

- **Versions supported:** SPDX 2.3
- **Representations:** JSON, XML, tag-value
- **Strengths:** ISO standard, strong license compliance support, widely used in automotive and enterprise

## Automatic validation

When you upload an SBOM to sbomify, it is automatically validated against the official schema for its format and version. This helps catch malformed documents before they enter your pipeline.

## Which format should I choose?

Both formats are well supported and meet regulatory requirements. Some considerations:

- **CycloneDX** is generally easier to get started with and has stronger security tooling (VEX, VDR)
- **SPDX** may be preferred if your industry or customers specifically require an ISO standard

Most SBOM generation tools support both formats. See our [language guides](/guides/) for tool-specific instructions.

## Converting between formats

If you need to convert between CycloneDX and SPDX, tools like [CycloneDX CLI](https://github.com/CycloneDX/cyclonedx-cli) and [cdx2spdx](https://github.com/CycloneDX/cyclonedx-cli) can help. Keep in mind that some fields may not map perfectly between formats due to differences in their data models.
