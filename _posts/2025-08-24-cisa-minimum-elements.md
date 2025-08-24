---
layout: post
title: "CISA's Minimum Elements now in Draft"
date: 2025-08-23 09:00:00 +0000
categories: announcement update
author:
  display_name: Viktor

---
# CISA releases draft update to SBOM Minimum Elements

[CISA](https://www.cisa.gov/sbom) has published a [public comment draft of updated SBOM Minimum Elements](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf). This draft is intended as successor guidance to the [NTIA Minimum Elements](https://www.ntia.gov/files/ntia/publications/sbom_minimum_elements_report.pdf) first issued on July 12, 2021. Comments are open until **October 3, 2025** ([Federal Register notice](https://www.federalregister.gov/documents/2025/08/22/2025-18532/notice-of-draft-software-bill-of-materials-sbom-minimum-elements-guidance)).

## What changed at a glance

**New required data fields**
- Component hash
- License
- Tool name used to generate the SBOM
- Generation context: pre-build, build-time, or post-build

**Renamed or clarified fields**
- *Supplier Name* → *Software Producer*
- *Author of SBOM Data* → *SBOM Author*
- *Other Unique Identifiers* → *Software Identifiers* (at least one required; examples include CPE, purl, OmniBOR, SWHID)
- *Version of the Component* → *Component Version* (file creation date allowed if no version)
- *Depth* → *Coverage* (requires comprehensive listing, including transitive dependencies and duplicates when metadata differs)
- *Accommodation of Mistakes* → *Accommodation of Updates to SBOM Data*
- *Frequency* and *Distribution and Delivery* clarified
- Timestamp must follow ISO 8601
- SWID removed from Automation Support examples

**Removed**
- *Access Control* as a standalone element (folded into Distribution and Delivery expectations for controlled sharing).

## Practical implications

- SBOMs now must include **hashes, licenses, and tool provenance**. This strengthens validation, license compliance, and reproducibility.
- **Coverage is stricter**. Transitive dependencies and duplicate instances are explicitly in scope.
- **Known Unknowns** must be flagged, with a distinction between unknown and intentionally redacted components, improving clarity during audits and incident response.

## How this relates to the 2021 NTIA Minimum Elements

The [NTIA document](https://www.ntia.gov/files/ntia/publications/sbom_minimum_elements_report.pdf) established the original baseline in 2021. CISA was tasked by [OMB M-22-18](https://www.whitehouse.gov/wp-content/uploads/2022/09/M-22-18.pdf) to produce successor guidance that reflects today’s SBOM maturity. This draft builds on and updates that baseline for federal use once finalized.

## Comment window

CISA is accepting public comments until **October 3, 2025**. You can review the [draft PDF](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf) and submit feedback through the [Federal Register notice](https://www.federalregister.gov/documents/2025/08/22/2025-18532/notice-of-draft-software-bill-of-materials-sbom-minimum-elements-guidance).
