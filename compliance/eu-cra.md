---
layout: page
permalink: /compliance/eu-cra/
title: "EU Cyber Resilience Act (CRA) SBOM Requirements"
description: "Complete guide to SBOM requirements under the EU Cyber Resilience Act, including format requirements, dependency coverage, and authority access obligations."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** Manufacturers (and, depending on role, importers/distributors) placing "products with digital elements" on the EU market, plus their software/component supply chains.

<div class="not-prose my-6 p-5 bg-[#201B4C] border border-[#37306B] rounded-xl">
  <p class="text-white mb-3"><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="inline-block px-5 py-2.5 bg-[#8A7DFF] hover:bg-[#7A6DE5] text-white rounded-full font-medium text-sm transition-all duration-200">Get in Touch</a>
</div>

---

## Overview

The [EU Cyber Resilience Act](https://eur-lex.europa.eu/eli/reg/2024/2847/oj) (Regulation EU 2024/2847) is European law mandating cybersecurity requirements for products with digital elements. Unlike NTIA/CISA guidance, the CRA is **binding law** in the EU.

While the CRA does not enumerate specific SBOM fields (author, timestamp, supplier name, etc.), it **does explicitly require an SBOM** with specific format and scope requirements.

For a deeper dive into CRA compliance, see our post [CRA Explained: What the Cyber Resilience Act Means for Device Manufacturers]({{ site.url }}/blog/cra-explained-cyber-resilience-act-for-device-manufacturers/).

## What the CRA Requires

**Annex I, Part II(1)** mandates that manufacturers must "identify and document vulnerabilities and components contained in products with digital elements, **including by drawing up a software bill of materials** in a commonly used and machine-readable format covering **at least the top-level dependencies** of the product."

| CRA Requirement         | Description                                             | Status   |
| ----------------------- | ------------------------------------------------------- | -------- |
| Machine-readable SBOM   | SBOM must be in a machine-readable format               | Required |
| Commonly used format    | Must use a commonly used format (e.g., CycloneDX, SPDX) | Required |
| Top-level dependencies  | Must include at least top-level (direct) dependencies   | Required |
| Component documentation | SBOM must reflect components contained in the product   | Required |

## Technical Documentation and Authority Access

The CRA requires drawing up an SBOM (Annex I, Part II(1)). Authorities can request the information and documentation needed to demonstrate conformity upon a reasoned request; in practice this includes the SBOM.

| CRA Requirement  | Description                                                                        | Status                         |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| SBOM production  | Required as part of vulnerability handling (Annex I, Part II(1))                   | Required                       |
| Authority access | Producible to market surveillance authorities upon reasoned request for conformity | Required upon reasoned request |

## User Disclosure (Optional)

**Annex II, Part I, point 9** states: "If the manufacturer decides to make available the software bill of materials to the user, [provide] information on where the software bill of materials can be accessed."

| CRA Requirement            | Description                                                 | Status              |
| -------------------------- | ----------------------------------------------------------- | ------------------- |
| User delivery              | Providing SBOM to end users                                 | Optional            |
| Access location disclosure | If SBOM is shared with users, must state where to access it | Required if sharing |

## Future Specifications

The CRA explicitly empowers the European Commission to "specify the format and elements of the software bill of materials" via implementing acts. This means specific field-level requirements (similar to NTIA/CISA minimum elements) may be added in the future through delegated legislation.

## Key Takeaway

The CRA requires an SBOM covering at least top-level dependencies in a machine-readable, commonly used format. Organizations should align with [NTIA]({{ site.url }}/compliance/ntia-minimum-elements/)/[CISA]({{ site.url }}/compliance/cisa-minimum-elements/) minimum elements to ensure their SBOMs satisfy both US and EU expectations.

## Schema Mappings

For CycloneDX and SPDX field mappings, see our [Schema Crosswalk]({{ site.url }}/compliance/schema-crosswalk/).

## Related Frameworks

- [EU NIS2 Directive]({{ site.url }}/compliance/eu-nis2/) - EU cybersecurity law for critical entities
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - Recommended baseline for SBOM content

## Official Source

- [EU Cyber Resilience Act (Regulation 2024/2847)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
