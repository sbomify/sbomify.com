---
layout: page
permalink: /compliance/pci-dss/
title: "PCI DSS 4.0 SBOM and Software Inventory Requirements"
description: "Guide to PCI DSS 4.0 software component inventory requirements, including Requirement 6.3.2 for bespoke software and third-party dependencies."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** Any merchant or service provider whose environment includes systems/processes that store, process, or transmit cardholder data or sensitive authentication data, plus systems that are connected to those systems or that could impact their security.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The Payment Card Industry Data Security Standard (PCI DSS) is a security standard for protecting payment card account data. The current version is **PCI DSS v4.0.1** (June 2024).

PCI DSS does **not** mandate SBOMs by name or prescribe SBOM fields/schemas, but it _does_ create SBOM-adjacent requirements around software/component inventories and third-party dependencies.

## Scope

PCI DSS scope covers:

- The **Cardholder Data Environment (CDE)** - systems that store, process, or transmit cardholder data
- Systems with **unrestricted connectivity** to the CDE
- Systems that could **impact** cardholder data or sensitive authentication data security

"System components" in scope explicitly include **software**, with examples including applications, software, and software components, including SaaS and bespoke/custom software.

## SBOM-Relevant Requirements

| PCI DSS Requirement (v4.0.1)                                           | What It Requires                                                                                                                                                                                                                            | Status                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **6.3.2 Software component inventory (custom + embedded third-party)** | Maintain an **inventory of bespoke/custom software and third-party software components incorporated into bespoke/custom software** to support **vulnerability and patch management** (and validate inventory coverage).                     | **Best practice until 31 Mar 2025**, then required |
| **6.4.3 Payment page script inventory + integrity**                    | For payment pages, maintain an **inventory of all scripts** (with justification) and implement methods to confirm each script is **authorized** and to assure **integrity**.                                                                | Required (where applicable)                        |
| **12.8 Third-party service provider (TPSP) inventory**                 | Maintain a **list of TPSPs** with which account data is shared or that could affect account data security, including a description of services. Examples include payment gateways/processors and providers that manage in-scope components. | Required                                           |

## Requirement 6.3.2 in Detail

**Requirement 6.3.2** is the most SBOM-relevant requirement in PCI DSS. It explicitly requires:

- An inventory of **bespoke and custom software**
- An inventory of **third-party software components incorporated into bespoke/custom software**
- The purpose is to facilitate **vulnerability and patch management**

This is effectively an SBOM requirement for custom software, though PCI DSS does not prescribe a specific format (CycloneDX, SPDX, etc.).

**Timeline:** This requirement is a best practice until March 31, 2025, after which it becomes mandatory.

## Payment Page Script Inventory (6.4.3)

For e-commerce payment pages, **Requirement 6.4.3** requires:

- An inventory of all scripts loaded on payment pages
- Justification for each script's presence
- Authorization controls for scripts
- Integrity verification mechanisms

This addresses the risk of Magecart-style attacks where malicious scripts are injected into payment pages.

## Assessment Approach

PCI DSS v4.x supports two assessment approaches:

- **Defined Approach** - Follow the specific requirements as written
- **Customized Approach** - Meet the security objective through alternative controls

This affects how you evidence compliance with inventory requirements.

## Practical SBOM Recommendations

To satisfy PCI DSS inventory requirements:

1. **Generate SBOMs for custom/bespoke software** in your cardholder data environment
2. **Include third-party dependencies** in your SBOMs (this is what 6.3.2 explicitly requires)
3. **Maintain script inventories** for payment pages with justification and integrity controls
4. **Use SBOMs for vulnerability correlation** to support patch management processes
5. **Align with [NTIA minimum elements]({{ site.url }}/compliance/ntia-minimum-elements/)** for SBOM content

## Key Takeaway

While PCI DSS doesn't mandate SBOMs by name, **Requirement 6.3.2 effectively requires an SBOM** for bespoke/custom software (including embedded third-party components). Organizations should treat their software component inventory as an SBOM and follow established SBOM practices.

## Related Frameworks

- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - Recommended baseline for SBOM content
- [CISA Framing Document]({{ site.url }}/compliance/cisa-framing/) - Terminology and format guidance

## Official Source

- [PCI DSS v4.0.1 (June 2024)](https://www.pcisecuritystandards.org/document_library/)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
