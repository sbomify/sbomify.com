---

url: /compliance/ntia-minimum-elements/
aliases:
  - /compliance/ntia/
title: "NTIA Minimum Elements for SBOM (2021, Superseded)"
description: "The NTIA 2021 Minimum Elements for a Software Bill of Materials, the original US SBOM baseline, updated and replaced by the CISA 2026 Minimum Elements on 29 July 2026. Covers the original seven data fields and how each maps to its 2026 successor."
---

[← Back to Compliance Overview](/compliance/)

> **Superseded.** On 29 July 2026 CISA published the [2026 Minimum Elements for a Software Bill of Materials](/compliance/cisa-minimum-elements/), which "updates and replaces" this 2021 NTIA document. This page is kept as a historical reference and for mapping legacy SBOMs forward. **For current guidance, use the [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/).**

**Who it affects:** Software producers and suppliers (and their customers) who need a baseline SBOM structure, especially when selling into US federal or regulated/critical-infrastructure supply chains. Other frameworks like [FDA medical device guidance](/compliance/fda-medical-device/) and [CISA Framing](/compliance/cisa-framing/) reference these minimum elements as the baseline for SBOM content.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The [NTIA Minimum Elements for a Software Bill of Materials](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf) is the foundational baseline for SBOM guidance in the United States. Published in July 2021, it defines seven core data fields that every SBOM should contain, plus implementation practices for SBOM generation and sharing.

This document emerged from a multi-stakeholder process and represents the consensus "minimum viable SBOM" that balances utility with practicality. It remains the operative published baseline for US SBOM content: CISA's proposed successor has not been finalized, and other frameworks (such as [FDA medical device guidance](/compliance/fda-medical-device/)) continue to reference the NTIA elements.

**Note:** NTIA frames these as "minimum elements" (guidance), not legally binding requirements. However, they are widely adopted as the de facto standard.

## Status: Superseded by the CISA 2026 Minimum Elements

The 2021 minimum elements are the starting point of an evolving lineage, and several things have moved recently:

- **These elements were superseded on 29 July 2026.** CISA, with the NSA, FBI and fifteen international partner agencies, published the [2026 Minimum Elements for a Software Bill of Materials](/compliance/cisa-minimum-elements/), which in its own words "updates and replaces" this NTIA document. The 2026 version adds 10 new elements, substantially revises 8, makes minor updates to 5, and removes 1. **If you are building an SBOM practice today, work from the 2026 elements.**
- **The minimum elements concept has been extended to AI.** In May 2026, CISA and its G7 partners released [Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements), joint guidance applying SBOM-style transparency to AI systems, covering models, datasets, and their dependencies.
- **Federal procurement expectations became agency-led.** In January 2026, OMB memo [M-26-05](https://www.whitehouse.gov/wp-content/uploads/2026/01/M-26-05-Adopting-a-Risk-based-Approach-to-Software-and-Hardware-Security.pdf) rescinded the government-wide secure software attestation "common form" requirement from M-22-18 and M-23-16 in favor of risk-based, agency-defined assurance requirements. Agencies may still require SBOMs where they judge it appropriate, which makes the NTIA elements the natural baseline for those requests.

The practical consequence: the seven NTIA fields below remain a useful historical reference, and every one of them survives in some form in the 2026 elements. But they are no longer sufficient on their own. See [what changed](/compliance/cisa-minimum-elements/#what-changed-from-ntia-2021).

## Required Data Fields

| Data Field               | Description                                                                               | Status          |
| ------------------------ | ----------------------------------------------------------------------------------------- | --------------- |
| Supplier Name            | The name of the entity that creates, defines, and identifies components                   | Minimum element |
| Component Name           | Designation assigned to a unit of software defined by the original supplier               | Minimum element |
| Version                  | Identifier used by the supplier to specify a change in software                           | Minimum element |
| Other Unique Identifiers | Other identifiers used to identify a component or serve as a lookup key (e.g., purl, CPE) | Minimum element |
| Dependency Relationship  | Characterizing the relationship that an upstream component has to software                | Minimum element |
| Author of SBOM Data      | The name of the entity that creates the SBOM data                                         | Minimum element |
| Timestamp                | Record of the date and time of the SBOM data assembly                                     | Minimum element |

### How the 2021 fields map to 2026

Every 2021 data field survives into the [2026 minimum elements](/compliance/cisa-minimum-elements/), though four were renamed and one practice absorbed another.

| NTIA 2021 field          | CISA 2026 equivalent              | Change       |
| ------------------------ | --------------------------------- | ------------ |
| Supplier Name            | Component Producer                | Major update |
| Component Name           | Component Name                    | Minor update |
| Version                  | Component Version                 | Major update |
| Other Unique Identifiers | Component Identifiers             | Major update |
| Dependency Relationship  | Component Dependency Relationship | Minor update |
| Author of SBOM Data      | SBOM Author                       | Major update |
| Timestamp                | SBOM Timestamp                    | Minor update |

The 2026 version adds ten elements that have no 2021 equivalent, seven of which describe the SBOM document itself rather than its components: SBOM Author Signature, SBOM Data Format Name, SBOM Data Format Version, SBOM Generation Context, SBOM Tool Name, SBOM Tool Version, SBOM Version, plus Component Hash Value, Component Hash Algorithm, and Component License.

## Implementation Practices

Beyond the seven data fields, NTIA also defines implementation practices:

| Practice                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| Frequency               | SBOMs should be generated for each new release or update       |
| Depth                   | How deep dependency capture goes (direct vs transitive)        |
| Known Unknowns          | Explicitly identifying components that could not be enumerated |
| Distribution & Delivery | How SBOMs are made available to consumers                      |
| Access Control          | Roles and permissions for SBOM access                          |
| Accommodation of Errors | Process for handling mistakes in SBOM data                     |

## Schema Mappings

For CycloneDX and SPDX field mappings, see our [Schema Crosswalk](/compliance/schema-crosswalk/).

## Related Frameworks

- [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/) - The current US baseline, which updates and replaces NTIA 2021
- [Executive Order 14028](/compliance/eo-14028/) - The directive that led to NTIA minimum elements

## Official Sources

- [NTIA Minimum Elements for a Software Bill of Materials (2021)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)
- [Federal Register: Request for Comment on 2025 Minimum Elements for a Software Bill of Materials](https://www.federalregister.gov/documents/2025/08/22/2025-16147/request-for-comment-on-2025-minimum-elements-for-a-software-bill-of-materials)
- [CISA: Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements) (May 2026)
- [OMB Memorandum M-26-05: Adopting a Risk-based Approach to Software and Hardware Security](https://www.whitehouse.gov/wp-content/uploads/2026/01/M-26-05-Adopting-a-Risk-based-Approach-to-Software-and-Hardware-Security.pdf) (January 2026)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
