---

url: /compliance/ntia-minimum-elements/
aliases:
  - /compliance/ntia/
title: "NTIA Minimum Elements for SBOM (2021)"
description: "Complete guide to the NTIA Minimum Elements for a Software Bill of Materials, the foundational US baseline for SBOM data fields, and where the baseline stands today: CISA's 2025 update, AI SBOM guidance, and OMB M-26-05."
section: compliance
---

[← Back to Compliance Overview](/compliance/)

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

## Where the Baseline Stands Today

The 2021 minimum elements are the starting point of an evolving lineage, and several things have moved recently:

- **CISA's 2025 update is still a draft.** CISA published the [2025 Minimum Elements for an SBOM](/compliance/cisa-minimum-elements/) as a public comment draft, with the [comment period closing on 3 October 2025](https://www.federalregister.gov/documents/2025/08/22/2025-16147/request-for-comment-on-2025-minimum-elements-for-a-software-bill-of-materials). A final version has not been published, so the 2021 NTIA elements remain the operative baseline while the draft signals where US guidance is heading (new fields such as component hash, license, generation tool, and generation context).
- **The minimum elements concept has been extended to AI.** In May 2026, CISA and its G7 partners released [Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements), joint guidance applying SBOM-style transparency to AI systems, covering models, datasets, and their dependencies.
- **Federal procurement expectations became agency-led.** In January 2026, OMB memo [M-26-05](https://www.whitehouse.gov/wp-content/uploads/2026/01/M-26-05-Adopting-a-Risk-based-Approach-to-Software-and-Hardware-Security.pdf) rescinded the government-wide secure software attestation "common form" requirement from M-22-18 and M-23-16 in favor of risk-based, agency-defined assurance requirements. Agencies may still require SBOMs where they judge it appropriate, which makes the NTIA elements the natural baseline for those requests.

The practical consequence: if you build your SBOM practice on the seven NTIA fields today and track the CISA 2025 draft's additions, you are well positioned for both current requests and the successor guidance.

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

- [CISA 2025 Minimum Elements](/compliance/cisa-minimum-elements/) - Updated guidance that expands on NTIA 2021
- [Executive Order 14028](/compliance/eo-14028/) - The directive that led to NTIA minimum elements

## Official Sources

- [NTIA Minimum Elements for a Software Bill of Materials (2021)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)
- [Federal Register: Request for Comment on 2025 Minimum Elements for a Software Bill of Materials](https://www.federalregister.gov/documents/2025/08/22/2025-16147/request-for-comment-on-2025-minimum-elements-for-a-software-bill-of-materials)
- [CISA: Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements) (May 2026)
- [OMB Memorandum M-26-05: Adopting a Risk-based Approach to Software and Hardware Security](https://www.whitehouse.gov/wp-content/uploads/2026/01/M-26-05-Adopting-a-Risk-based-Approach-to-Software-and-Hardware-Security.pdf) (January 2026)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
