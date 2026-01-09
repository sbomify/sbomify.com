---
layout: post
title: "CISA's Minimum Elements now in Draft"
description: "Analysis of CISA's 2025 draft SBOM Minimum Elements update, adding required hash, license, and tool provenance fields to succeed the 2021 NTIA guidance."
date: 2025-08-23 09:00:00 +0000
category: news
tags: [sbom, cisa, standards]
author:
  display_name: Viktor Petersson

---

[CISA](https://www.cisa.gov/sbom) has published a [public comment draft of updated SBOM Minimum Elements](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf). This draft is intended as successor guidance to the [NTIA Minimum Elements](https://www.ntia.gov/files/ntia/publications/sbom_minimum_elements_report.pdf) first issued on July 12, 2021. Comments are open until **October 3, 2025** ([Federal Register notice](https://www.federalregister.gov/documents/2025/08/22/2025-18532/notice-of-draft-software-bill-of-materials-sbom-minimum-elements-guidance)).

## What changed at a glance

**New required data fields**

- Component hash
- License
- Tool name used to generate the SBOM
- Generation context: pre-build, build-time, or post-build

**Renamed or clarified fields**

- _Supplier Name_ → _Software Producer_
- _Author of SBOM Data_ → _SBOM Author_
- _Other Unique Identifiers_ → _Software Identifiers_ (at least one required; examples include CPE, purl, OmniBOR, SWHID)
- _Version of the Component_ → _Component Version_ (file creation date allowed if no version)
- _Depth_ → _Coverage_ (requires comprehensive listing, including transitive dependencies and duplicates when metadata differs)
- _Accommodation of Mistakes_ → _Accommodation of Updates to SBOM Data_
- _Frequency_ and _Distribution and Delivery_ clarified
- Timestamp must follow ISO 8601
- SWID removed from Automation Support examples

**Removed**

- _Access Control_ as a standalone element (folded into Distribution and Delivery expectations for controlled sharing).

## Practical implications

- SBOMs now must include **hashes, licenses, and tool provenance**. This strengthens validation, license compliance, and reproducibility.
- **Coverage is stricter**. Transitive dependencies and duplicate instances are explicitly in scope.
- **Known Unknowns** must be flagged, with a distinction between unknown and intentionally redacted components, improving clarity during audits and incident response.

## How this relates to the 2021 NTIA Minimum Elements

The [NTIA document](https://www.ntia.gov/files/ntia/publications/sbom_minimum_elements_report.pdf) established the original baseline in 2021. CISA was tasked by [OMB M-22-18](https://www.whitehouse.gov/wp-content/uploads/2022/09/M-22-18.pdf) to produce successor guidance that reflects today’s SBOM maturity. This draft builds on and updates that baseline for federal use once finalized.

## Comment window

CISA is accepting public comments until **October 3, 2025**. You can review the [draft PDF](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf) and submit feedback through the [Federal Register notice](https://www.federalregister.gov/documents/2025/08/22/2025-18532/notice-of-draft-software-bill-of-materials-sbom-minimum-elements-guidance).
