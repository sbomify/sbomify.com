---
layout: page
permalink: /compliance/cisa-minimum-elements/
title: "CISA Minimum Elements for SBOM (2025 Draft)"
description: "Guide to the CISA 2025 Minimum Elements for SBOM, the updated US guidance with new fields for component hash, license, and generation context."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** Organizations that generate, share, or consume SBOMs in US public-sector and critical-infrastructure contexts, especially software producers responding to customer/procurement SBOM requests.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The [CISA 2025 Minimum Elements for a Software Bill of Materials](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom) is an update to the 2021 NTIA guidance, reflecting tooling maturity and lessons learned from SBOM adoption.

**Important:** This is a public comment draft and is pre-decisional. It does not represent final US government policy. The draft explicitly states it **does not create new requirements** but rather updates prior guidance.

The 2025 draft introduces new data fields (Component Hash, License, Tool Name, Generation Context) and clarifies existing ones based on real-world implementation experience.

## Data Fields

| Data Field              | Status             | Change from NTIA 2021                                 |
| ----------------------- | ------------------ | ----------------------------------------------------- |
| SBOM Author             | Minimum data field | Major update - clarified role                         |
| Software Producer       | Minimum data field | Major update - distinguished from author              |
| Component Name          | Minimum data field | Unchanged                                             |
| Component Version       | Minimum data field | Major update - version string handling                |
| Software Identifiers    | Minimum data field | Major update - purl/CPE guidance                      |
| Component Hash          | Minimum data field | **New** - integrity verification                      |
| License                 | Minimum data field | **New** - per-component licensing                     |
| Dependency Relationship | Minimum data field | Major update - relationship types                     |
| SBOM Generation Tool    | Minimum data field | **New** - tool name/version                           |
| Timestamp               | Minimum data field | Minor update - ISO 8601 clarity                       |
| Generation Context      | Minimum data field | **New** - SDLC phase and how/where SBOM was generated |

## New Fields Explained

### Component Hash

Cryptographic hash of the component for integrity verification. Enables consumers to verify they have the exact component referenced in the SBOM.

### License

Per-component license information. Critical for open source compliance and understanding legal obligations.

### SBOM Generation Tool

The tool (name and version) used to generate the SBOM. Helps with troubleshooting and understanding SBOM quality.

### Generation Context

Information about the SDLC phase and context ("how and where") the SBOM was generated. Helps consumers understand the SBOM's completeness and accuracy.

## Updated Practices

| Practice                 | Change from NTIA 2021                                     |
| ------------------------ | --------------------------------------------------------- |
| Coverage                 | Replaces "Depth" - includes horizontal + vertical breadth |
| Known Unknowns           | Clarified - distinguish unknown vs known-but-withheld     |
| Distribution & Delivery  | Access Control folded into this practice                  |
| Accommodation of Updates | Replaces "Accommodation of Errors"                        |

## Schema Mappings

For CycloneDX and SPDX field mappings, see our [Schema Crosswalk]({{ site.url }}/compliance/schema-crosswalk/).

## Related Frameworks

- [NTIA Minimum Elements (2021)]({{ site.url }}/compliance/ntia-minimum-elements/) - The original guidance this updates
- [CISA Framing Document]({{ site.url }}/compliance/cisa-framing/) - Conceptual definitions and format crosswalk

## Official Source

- [CISA 2025 Minimum Elements (Public Comment Draft)](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
