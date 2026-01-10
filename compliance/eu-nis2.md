---
layout: page
permalink: /compliance/eu-nis2/
title: "EU NIS2 Directive SBOM Requirements"
description: "Understanding NIS2 Directive cybersecurity requirements and how SBOMs support supply chain security, asset management, and incident response."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** EU "essential" and "important" entities (and their management) responsible for cybersecurity risk management and incident reporting across their operations and supply chains.

<div class="not-prose my-6 p-5 bg-[#201B4C] border border-[#37306B] rounded-xl">
  <p class="text-white mb-3"><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="inline-block px-5 py-2.5 bg-[#8A7DFF] hover:bg-[#7A6DE5] text-white rounded-full font-medium text-sm transition-all duration-200">Get in Touch</a>
</div>

---

## Overview

The [NIS2 Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32022L2555) is the EU's baseline cybersecurity law for "essential" and "important" entities. Unlike the CRA, **NIS2 does not explicitly mandate SBOMs by name or define SBOM field-level requirements**. Instead, it mandates cybersecurity risk-management outcomes (supply chain security, secure acquisition/development, vulnerability handling, and asset management) that SBOMs are commonly used to evidence.

## What NIS2 Requires (SBOM-Relevant)

NIS2 requires risk-management measures including **supply chain security** and **security in acquisition, development and maintenance**, including **vulnerability handling and disclosure**, plus **asset management**. It also introduces strict incident reporting expectations (24h/72h timelines for significant incidents), which increases the operational need to rapidly determine whether a newly disclosed vulnerability affects your systems.

## NIS2 Implementing Rules Get Closer to "SBOM Language"

For certain NIS2 "relevant entities" (DNS, cloud, data centres, CDNs, managed services/MSSPs, online marketplaces/search engines/social networks, trust services), the [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R2690) specifies procurement and supply chain controls and explicitly requires **"information describing the hardware and software components used in the ICT services or ICT products"** as part of secure acquisition processes. This is effectively an "SBOM/HBOM or equivalent component inventory" expectation in procurement form.

| NIS2 Requirement                             | Description                                                                                                                        | Status                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Supply chain security                        | Security measures covering relationships with direct suppliers/service providers                                                   | Required                       |
| Secure acquisition, development, maintenance | Includes vulnerability handling and disclosure                                                                                     | Required                       |
| Asset management                             | Part of required cybersecurity risk-management measures                                                                            | Required                       |
| Incident reporting speed                     | Significant incident notification within 24h/72h timelines                                                                         | Required                       |
| Component information for acquired ICT       | "Information describing the hardware and software components used" (for in-scope entities under Implementing Regulation 2024/2690) | Required for in-scope entities |

## Practical SBOM Takeaways for NIS2

Even though NIS2 does not say "you must publish an SBOM", SBOMs are a practical way to operationalize and evidence NIS2 controls:

- **Procurement:** Request SBOM/HBOM (or equivalent component inventory) from suppliers, and require updates over the lifecycle
- **Vulnerability response:** Correlate SBOMs with vulnerability advisories to answer "are we affected?" within incident-reporting timelines
- **Supplier governance:** Tie SBOM delivery + vulnerability handling obligations into supplier contracts and reviews

## Key Takeaway

Since NIS2 does not define SBOM fields, align with [NTIA]({{ site.url }}/compliance/ntia-minimum-elements/)/[CISA]({{ site.url }}/compliance/cisa-minimum-elements/) minimum elements for component identity, version, supplier, identifiers, and dependency relationships. Treat that as your "NIS2-ready" SBOM baseline.

## Related Frameworks

- [EU Cyber Resilience Act]({{ site.url }}/compliance/eu-cra/) - EU law that explicitly requires SBOMs
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - Recommended baseline for SBOM content

## Official Sources

- [EU NIS2 Directive (Directive 2022/2555)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32022L2555)
- [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R2690)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
