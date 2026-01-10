---
layout: page
permalink: /compliance/uk-software-security-code-of-practice/
title: "Software Security Code of Practice (UK, May 2025)"
description: "Guide to the UK Software Security Code of Practice, a voluntary government code for secure software development, supply chain resilience, and customer communication."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** Organisations that **develop and/or sell software to businesses or other organisations**, including standalone software, software services, and goods/services that contain software (most relevant for B2B proprietary software vendors and SaaS).

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The **Software Security Code of Practice (May 2025)** is a **voluntary** UK government code designed to help **software vendors and their customers** reduce the likelihood and impact of **software supply chain attacks** and improve software resilience. It sets out **14 principles** vendors are expected to implement as a consistent baseline across the market.

Unlike binding legislation such as the EU Cyber Resilience Act, this Code of Practice is voluntary guidance intended to establish industry norms and baseline expectations for software security in the UK market.

---

## What It Requires (SBOM-Relevant)

The Code does **not** mandate SBOMs by name or define SBOM field-level requirements, but it establishes SBOM-adjacent expectations:

| Requirement Area                 | Description                                                                                                                  | Status   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| Software composition awareness   | Vendors should understand composition and assess risks linked to ingestion and maintenance of third-party components         | Expected |
| Vulnerability disclosure         | Vendors should implement and publish a vulnerability disclosure process                                                      | Expected |
| Vulnerability management         | Vendors should have processes/documentation for detecting, prioritising, and managing vulnerabilities in software components | Expected |
| Customer lifecycle communication | Vendors should provide customers with support/maintenance level information                                                  | Expected |
| End-of-support notice            | Vendors should provide at least **1 year's notice** before the software is no longer supported/maintained                    | Expected |

---

## Key Principles

The Code establishes 14 principles across several areas:

### Secure Development

- Implement secure development practices throughout the software lifecycle
- Maintain awareness of software composition and third-party component risks

### Vulnerability Management

- Establish and publish a vulnerability disclosure process
- Implement processes for detecting, prioritising, and remediating vulnerabilities
- Provide timely security updates to customers

### Customer Communication

- Communicate support and maintenance levels clearly to customers
- Provide at least 1 year's notice before end of support/maintenance

### Supply Chain Resilience

- Assess and manage risks from third-party components
- Maintain documentation of software composition

---

## Relationship to SBOMs

While the Code does not explicitly require SBOMs, maintaining a Software Bill of Materials is a practical way to meet several of its expectations:

- **Composition awareness:** An SBOM provides the foundation for understanding what third-party components are in your software
- **Vulnerability management:** SBOMs enable efficient vulnerability tracking across your component inventory
- **Supply chain transparency:** SBOMs document the provenance and relationships of software components

Organisations already generating SBOMs for other compliance requirements (e.g., [EU CRA]({{ site.url }}/compliance/eu-cra/), [NTIA minimum elements]({{ site.url }}/compliance/ntia-minimum-elements/)) will find they are well-positioned to meet the Code's expectations.

---

## Related Frameworks

- [EU Cyber Resilience Act (CRA)]({{ site.url }}/compliance/eu-cra/) - Binding EU law with SBOM requirements
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - US baseline for SBOM data fields
- [CISA SBOM Sharing Lifecycle Report]({{ site.url }}/compliance/cisa-sharing-lifecycle/) - Operational guidance for SBOM distribution

---

## Official Source

- [Software Security Code of Practice (UK Government)](https://www.gov.uk/government/publications/software-security-code-of-practice)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
