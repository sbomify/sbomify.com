---

title: "Understanding the EU Cyber Resilience Act: SBOM Requirements and Compliance"
description: "What does the EU Cyber Resilience Act require? The CRA mandates SBOMs, vulnerability handling, and security updates for all products with digital elements sold in the EU. Learn the timeline, product categories, and how to prepare."
categories:
  - compliance
tags: [CRA, security, sbom, standards, eu]
tldr: "The EU Cyber Resilience Act (CRA) — adopted in October 2024 and enforceable from September 2027 — requires manufacturers of products with digital elements to provide SBOMs, handle vulnerabilities throughout the product lifecycle, report actively exploited vulnerabilities to ENISA within 24 hours, and deliver security updates for at least five years. It covers everything from consumer IoT devices to enterprise software."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the EU Cyber Resilience Act?"
    answer: "The EU Cyber Resilience Act (CRA) is EU legislation that establishes mandatory cybersecurity requirements for all products with digital elements placed on the EU market. Adopted in October 2024, it requires manufacturers to implement security by design, maintain SBOMs, handle vulnerabilities throughout the product lifecycle, and provide security updates for at least five years."
  - question: "When does the CRA take effect?"
    answer: "The CRA entered into force in December 2024. Vulnerability reporting obligations apply from September 2026. The full set of essential requirements, including SBOM obligations, becomes enforceable in September 2027. Manufacturers selling products in the EU should be preparing now."
  - question: "Does the CRA require SBOMs?"
    answer: "Yes. The CRA requires manufacturers to identify and document the components and dependencies of their products, including by drawing up an SBOM. The SBOM must cover at minimum the top-level dependencies of the product. Machine-readable formats are recommended, and the SBOM must be kept up to date throughout the product's support period."
  - question: "Does the CRA apply to open source software?"
    answer: "Non-commercial open-source development is exempt. However, open-source software stewards — organizations that systematically provide support for open-source products intended for commercial activities — have lighter obligations, including establishing a cybersecurity policy and cooperating with market surveillance authorities. Open-source software integrated into commercial products is covered through the manufacturer's obligations."
  - question: "What are the penalties for non-compliance?"
    answer: "The CRA provides for fines of up to 15 million euros or 2.5% of worldwide annual turnover (whichever is higher) for non-compliance with essential cybersecurity requirements. Non-compliance with other obligations can result in fines of up to 10 million euros or 2% of turnover."
date: 2024-07-10
slug: understanding-the-eu-cyber-resilience-act-the-role-of-sboms-in-enhancing-cybersecurity
---

In October 2024, the European Union adopted the **Cyber Resilience Act (CRA)** — the most ambitious cybersecurity product regulation ever enacted. For the first time, a major market is requiring that _all_ products with digital elements meet mandatory cybersecurity requirements, including the maintenance of Software Bills of Materials, vulnerability handling processes, and long-term security update commitments. The CRA affects every company that places software or connected hardware on the EU market, from consumer IoT device makers to enterprise software vendors.

For organizations already invested in [SBOM practices](/what-is-sbom/), the CRA validates what they have been building. For those that have not started, the compliance clock is now ticking. For a practitioner perspective on CRA compliance, see our [interview with EU CRA expert Sarah Fluchs](/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/).

## Timeline

The CRA's obligations phase in over a three-year transition period:

| Date               | Milestone                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **October 2024**   | CRA adopted by European Parliament and Council                                                                                            |
| **December 2024**  | CRA entered into force (published in Official Journal)                                                                                    |
| **September 2026** | Vulnerability reporting obligations apply — manufacturers must report actively exploited vulnerabilities to ENISA within 24 hours         |
| **September 2027** | Full essential requirements apply, including SBOM obligations, security by design, conformity assessment, and security update commitments |

Organizations should not wait until 2027. Building SBOM infrastructure, establishing vulnerability handling processes, and ensuring products meet security-by-design requirements takes time. Starting now provides a buffer for the organizational and technical changes required.

## What the CRA Covers

### Scope: Products with Digital Elements

The CRA applies to **all products with digital elements** placed on the EU market. This includes:

- **Software** — standalone applications, operating systems, firmware, mobile apps
- **Connected hardware** — IoT devices, routers, smart home devices, industrial controllers
- **Components** — software libraries and hardware components intended for integration into other products

The CRA uses three product categories based on risk:

**Default category** — The majority of products. Manufacturers can self-assess compliance (no third-party audit required). Examples: photo editing software, smart speakers, hard drives.

**Important products (Class I)** — Products with a higher cybersecurity risk. Compliance requires either a harmonized standard or third-party assessment. Examples: password managers, VPNs, routers, operating systems.

**Important products (Class II)** — Higher-risk products requiring mandatory third-party conformity assessment. Examples: hypervisors, firewalls, tamper-resistant microcontrollers, industrial IoT gateways.

**Critical products** — The highest risk category. Requires European cybersecurity certification. Examples: hardware security modules, smart meter gateways, smartcard devices.

### Exemptions

The CRA does _not_ apply to:

- Products already covered by sector-specific EU regulations (medical devices, automotive, aviation)
- Non-commercial open-source software developed outside a commercial context
- Cloud services and SaaS (covered by NIS2 instead)

## Essential Cybersecurity Requirements

The CRA mandates a set of essential requirements that products must meet. The most consequential for software producers:

### Security by Design

Products must be designed and developed with security in mind from the outset:

- No known exploitable vulnerabilities at time of release
- Secure default configuration (no default passwords, minimum necessary privileges)
- Protection of data confidentiality and integrity
- Availability and resilience, including protection against denial of service

### SBOM Requirements

The CRA explicitly requires manufacturers to **identify and document components and dependencies**, including by drawing up a Software Bill of Materials. Key aspects:

- The SBOM must cover at minimum the top-level dependencies of the product
- Machine-readable format is recommended (e.g., [CycloneDX or SPDX](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/))
- The SBOM must be maintained and updated throughout the product's support period
- The SBOM is part of the technical documentation that must be available to market surveillance authorities

For organizations already generating SBOMs in CI/CD pipelines and managing them through platforms like [sbomify](https://sbomify.com), CRA SBOM compliance is largely a matter of formalizing existing practices. For those starting from scratch, see our [guide to demystifying SBOMs](/2024/04/03/demystifying-sboms-the-backbone-of-modern-software-security/) and [SBOM generation guides](/guides/).

### Vulnerability Handling

Manufacturers must establish and maintain vulnerability handling processes throughout the product's support period:

- **Coordinated vulnerability disclosure (CVD)** — A documented process for receiving and handling vulnerability reports from external researchers
- **Security updates** — Free security patches delivered without undue delay for the entire support period (minimum five years from market placement)
- **Vulnerability monitoring** — Active monitoring for vulnerabilities in product components, including third-party and open-source dependencies

This is where SBOMs and [vulnerability scanning](/2026/02/01/sbom-scanning-vulnerability-detection/) become essential. Monitoring for newly disclosed [CVEs](/2025/12/18/cve-vulnerability-explained/) — especially those in the [CISA KEV catalog](/2025/12/30/what-is-kev-cisa-known-exploited-vulnerabilities/) — requires knowing exactly what components are in your product. An SBOM provides that inventory; vulnerability scanning tools provide the monitoring.

### Vulnerability Reporting

Starting September 2026, manufacturers must report:

- **Actively exploited vulnerabilities** — to ENISA (the EU Agency for Cybersecurity) within **24 hours** of becoming aware, with a full report within 72 hours
- **Severe incidents** — to ENISA and affected users without undue delay

This reporting obligation applies even to vulnerabilities in third-party components used in the product. Maintaining current SBOMs is the practical prerequisite for meeting this requirement — you cannot report a vulnerability in a component you do not know you use.

## Open Source and the CRA

The CRA's treatment of open source has been one of the most debated aspects of the legislation.

**Non-commercial open source is exempt.** Open-source software developed and distributed without commercial intent falls outside the CRA's scope. Individual developers contributing to open-source projects on a voluntary basis are not manufacturers under the CRA.

**Open-source software stewards** — organizations like the Apache Software Foundation, the Eclipse Foundation, or the Linux Foundation that systematically support open-source products used in commercial contexts — have lighter obligations. They must establish a cybersecurity policy, cooperate with market surveillance authorities, and document vulnerabilities, but they do not bear the full conformity assessment obligations of manufacturers.

**Manufacturers remain responsible** for the open-source components they integrate into their commercial products. If a manufacturer ships a product containing an open-source library with a known vulnerability, the manufacturer — not the open-source project — bears the CRA compliance obligation.

## Implementing CRA Compliance

### Step 1: Inventory Your Products

Identify all products with digital elements that you place on the EU market. Classify each into the appropriate risk category (default, important, critical).

### Step 2: Establish SBOM Practices

Generate SBOMs for all covered products. Integrate SBOM generation into your CI/CD pipeline using tools like the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/), Syft, or Trivy so SBOMs are produced at every build and kept current. Use [sbomify](https://sbomify.com) to manage, monitor, and share SBOMs across your product portfolio.

### Step 3: Build Vulnerability Handling Processes

Establish a coordinated vulnerability disclosure process. Set up [continuous vulnerability monitoring](/2026/02/01/sbom-scanning-vulnerability-detection/) against your SBOMs. Prepare the internal workflow for the 24-hour reporting obligation starting September 2026.

### Step 4: Ensure Security by Design

Review products against the CRA's essential requirements. Address default passwords, unnecessary network exposure, and other common security anti-patterns. Document your secure development lifecycle.

### Step 5: Prepare Technical Documentation

The CRA requires technical documentation including risk assessments, SBOM, design and development documentation, conformity assessment records, and EU declaration of conformity. Begin compiling this documentation now.

## CRA and Other Frameworks

The CRA intersects with several existing compliance frameworks:

- **[Executive Order 14028](/compliance/eo-14028/)** — U.S. federal SBOM requirements are complementary; organizations meeting EO 14028 requirements are well-positioned for CRA compliance
- **[CISA minimum elements](/compliance/cisa-minimum-elements/)** — The CISA SBOM minimum elements align with CRA SBOM expectations
- **NIS2 Directive** — Covers operators of essential and important services (overlaps with CRA for some product categories)
- **[SLSA](/2024/08/17/what-is-slsa/)** and [in-toto](/2024/08/14/what-is-in-toto/) — Build provenance and supply chain integrity frameworks that support CRA's security-by-design requirements
- **CE marking** — Products meeting CRA requirements will carry the CE marking for cybersecurity

## Frequently Asked Questions

### What is the EU Cyber Resilience Act?

The EU Cyber Resilience Act (CRA) is EU legislation that establishes mandatory cybersecurity requirements for all products with digital elements placed on the EU market. Adopted in October 2024, it requires manufacturers to implement security by design, maintain [SBOMs](/what-is-sbom/), handle vulnerabilities throughout the product lifecycle, and provide security updates for at least five years.

### When does the CRA take effect?

The CRA entered into force in December 2024. Vulnerability reporting obligations apply from September 2026. The full set of essential requirements, including SBOM obligations, becomes enforceable in September 2027. Manufacturers selling products in the EU should be preparing now.

### Does the CRA require SBOMs?

Yes. The CRA requires manufacturers to identify and document the components and dependencies of their products, including by drawing up a Software Bill of Materials. The SBOM must cover at minimum the top-level dependencies. Machine-readable formats ([CycloneDX, SPDX](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/)) are recommended.

### Does the CRA apply to open source software?

Non-commercial open-source development is exempt. However, open-source software stewards have lighter obligations, including establishing a cybersecurity policy and cooperating with market surveillance authorities. Open-source software integrated into commercial products is covered through the manufacturer's obligations.

### What are the penalties for non-compliance?

The CRA provides for fines of up to 15 million euros or 2.5% of worldwide annual turnover (whichever is higher) for non-compliance with essential cybersecurity requirements. Non-compliance with other obligations can result in fines of up to 10 million euros or 2% of turnover.
