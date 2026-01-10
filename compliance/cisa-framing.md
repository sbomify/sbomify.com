---
layout: page
permalink: /compliance/cisa-framing/
title: "CISA Framing Software Component Transparency (3rd Edition)"
description: "Guide to the CISA Framing document, the authoritative source for SBOM baseline attributes and CycloneDX/SPDX schema crosswalk."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** SBOM producers and consumers who need shared terminology and a consistent crosswalk between SBOM formats (CycloneDX/SPDX) for policy, tooling, and interoperability.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The [CISA Framing Software Component Transparency](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf) document provides conceptual definitions and serves as the normalization layer across SBOM formats. It defines "Baseline Attributes" and provides the authoritative crosswalk between CycloneDX and SPDX (including SPDX 3.0).

## Key Terminology

The Framing document establishes shared terminology for SBOM discussions:

- **Author** - The source of the descriptive metadata (not the author of the software itself)
- **Dependency** - The relationship between two components, including types: static, dynamic, remote, provided, direct, transitive

## Baseline Attributes

The Framing document defines baseline attributes that should be present in every SBOM. These align closely with the [NTIA minimum elements]({{ site.url }}/compliance/ntia-minimum-elements/) but provide additional context and cross-format mappings.

## Why This Document Matters

The Framing document is particularly useful as:

1. **The canonical source for schema field mappings** - See our [Schema Crosswalk]({{ site.url }}/compliance/schema-crosswalk/)
2. **A normalization layer** - Enables consistent interpretation across CycloneDX and SPDX
3. **The reference for other frameworks** - FDA and other guidance documents point to the Framing document for baseline attributes

## Related Frameworks

- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - The original baseline guidance
- [CISA 2025 Minimum Elements]({{ site.url }}/compliance/cisa-minimum-elements/) - Updated guidance
- [Schema Crosswalk]({{ site.url }}/compliance/schema-crosswalk/) - CycloneDX and SPDX field mappings

## Official Source

- [CISA Framing Software Component Transparency (3rd Edition)](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
