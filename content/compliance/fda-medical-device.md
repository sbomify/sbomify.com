---

url: /compliance/fda-medical-device/
title: "FDA Medical Device SBOM Requirements (2025)"
description: "Guide to FDA cybersecurity guidance for medical devices, including SBOM requirements, support level, and end-of-support date expectations."
---

[← Back to Compliance Overview](/compliance/)

**Who it affects:** Medical device manufacturers preparing FDA premarket submissions (and their software suppliers) who must document cybersecurity, including SBOM expectations, for devices marketed in the US.

<div class="cta-box">
  <p><strong>Turn these requirements into a working process.</strong> See how sbomify handles SBOMs, vulnerability monitoring, VEX and advisories for every release you support.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button" data-cta-location="compliance_top" data-cta-label="Book a demo">Book a demo</a>
</div>

---

## Overview

The [FDA Cybersecurity in Medical Devices guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations-and-content-premarket-submissions) (June 2025) adds sector-specific SBOM expectations for medical device manufacturers. The guidance recommends providing a machine-readable SBOM consistent with the [minimum elements](/compliance/ntia-minimum-elements/) (also referred to as baseline attributes) identified in NTIA's _Framing Software Component Transparency_ (October 2021), plus additional lifecycle properties.

**Important:** This is FDA guidance, not a regulation. The document uses "should" language, meaning these are strong recommendations that FDA expects manufacturers to follow for premarket submissions, but they are not legally binding requirements in the same way as regulations.

## SBOM Requirements

| Field                            | Description                                                                   | Status              |
| -------------------------------- | ----------------------------------------------------------------------------- | ------------------- |
| Baseline attributes              | SBOM consistent with CISA Framing baseline attributes                         | FDA recommends      |
| Software Component Support Level | Current support status (e.g., full support, security-fixes-only, unsupported) | SBOM should include |
| End-of-Support Date              | Date when support for the component will end                                  | SBOM should include |

## Why Lifecycle Properties Matter

These lifecycle properties are critical for medical device security because:

- Medical devices have long operational lifetimes (often 10+ years)
- Healthcare organizations need to plan for component end-of-life
- Unsupported components represent elevated security risk

## Representing Lifecycle Data

For technical guidance on representing support level and end-of-support date in CycloneDX and SPDX, see:

- [Schema Crosswalk](/compliance/schema-crosswalk/) - Field mappings for lifecycle properties
- [CLE (Common Lifecycle Enumeration)](/compliance/cle/) - Standard for machine-readable lifecycle events

## Related Frameworks

- [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) - Baseline attributes referenced by FDA
- [CISA Framing Document](/compliance/cisa-framing/) - Source of baseline attribute definitions

## Score uploaded SBOMs against the FDA checklist

sbomify ships an **FDA Medical Device Cybersecurity (2025)** plugin that grades each uploaded SBOM against the FDA baseline attributes plus the support-level and end-of-support lifecycle properties. To enable it, open **Plugins** in the sidebar, tick **FDA Medical Device Cybersecurity (2025)**, and click **Save changes**. Every new SBOM upload then gets a compliance result:

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/plugin_enablement_fda-medical-device-2025.webm" title="Enabling the FDA Medical Device Cybersecurity plugin in sbomify" description="Narrated screencast: turn on the FDA Medical Device Cybersecurity (2025) check in sbomify so every new SBOM upload gets a compliance result." upload_date="2026-10-28T00:00:00Z" >}}

## Additional Resources

For more details, see our [FDA Medical Device SBOM Requirements guide](/2026/01/09/fda-medical-device-sbom-requirements/).

## Official Source

- [FDA Cybersecurity in Medical Devices Guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations-and-content-premarket-submissions)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
