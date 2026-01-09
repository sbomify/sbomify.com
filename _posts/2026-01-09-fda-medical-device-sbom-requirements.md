---
layout: post
title: "FDA Medical Device SBOM Requirements: What the New Cybersecurity Guidance Means for Manufacturers"
description: "Breakdown of the FDA's June 2025 guidance on medical device cybersecurity, explaining SBOM requirements, premarket submission expectations, and compliance strategies."
author:
  display_name: Viktor Petersson
category: compliance
tags: [sbom, fda, medical-devices, cybersecurity, compliance]
---

On June 27, 2025, the FDA issued updated guidance on **"Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions."** This document marks a significant step forward in how medical device manufacturers must approach software security and transparency. At the heart of these recommendations lies the [Software Bill of Materials (SBOM)]({{ site.url }}/what-is-sbom/) — now an essential element of premarket submissions for connected medical devices.

If you're a manufacturer preparing a 510(k), PMA, or other premarket submission, here's what you need to know about the FDA's SBOM expectations and how to prepare.

## What the Guidance Says About SBOMs

The FDA guidance recommends the inclusion of an SBOM under **Section V.A.4 (Software Bill of Materials)** as part of cybersecurity documentation in premarket submissions. Additionally, **Appendix 4** lists SBOM sections as recommended documentation when cybersecurity risk is relevant.

While the guidance language is technically **non-binding** ("contains nonbinding recommendations"), the practical reality is different:

- Under **Section 524B of the FD&C Act**, the FDA has authority over "cyber devices" — devices with software that can be vulnerable and are connected
- FDA may **refuse to accept premarket submissions** that do not provide adequate SBOM and related cybersecurity information
- Insufficient SBOM documentation can lead to **delays in review** or requests for resubmission

In practice, the SBOM has moved from "nice-to-have" to **essential cybersecurity documentation** for medical device submissions. This mirrors the broader global trend toward [mandatory SBOM requirements]({{ site.url }}/features/why-now/) across regulatory frameworks.

## SBOM Content Expectations

The FDA guidance does not prescribe a rigid SBOM format, but it aligns with broader government expectations for what SBOMs should contain:

### Complete Software Inventory

All software included in the device must be identified:

- Commercial software
- Open-source components
- Third-party libraries
- Off-the-shelf (OTS) components

### Machine-Readable Format

SBOMs should be provided in machine-readable formats consistent with NTIA minimum elements, such as:

- **SPDX** (Software Package Data Exchange)
- **CycloneDX**

### Standard Fields

For each component, include:

- Component name
- Version
- Supplier
- Unique identifiers (e.g., Package URL/purl, CPE)
- Dependencies
- SBOM creation metadata

### Support and Lifecycle Metadata

This is where FDA expectations go beyond a basic inventory:

- **Level of support** from the component supplier (active, legacy, or unsupported)
- **End-of-support and end-of-life dates** for each component

### Vulnerability Context

SBOMs should be supplemented with:

- A **known vulnerabilities assessment** for identified components
- **Controls or mitigation descriptions** explaining whether vulnerabilities are mitigated by design

This means SBOMs are expected to be part of a comprehensive **vulnerability and risk management package**, not just a flat inventory list.

## Lifecycle and Traceability Requirements

The FDA guidance ties SBOMs into broader cybersecurity documentation expectations throughout the device lifecycle:

### Secure Product Development and Traceability

- SBOMs must be **traceable to security architecture views** and threat models that FDA reviewers evaluate
- The documentation should demonstrate how software components affect device security risks

### Ongoing Updates

- SBOMs should be **updated to reflect changes** throughout software updates and the device lifecycle
- This is not a one-time snapshot — it's a living document
- Proper [SBOM versioning practices]({{ site.url }}/guides/how-to-version-sboms) are essential for maintaining traceability

### Integration with Other Documentation

In premarket submissions, SBOMs typically appear alongside:

- **Security Risk Management Reports** — showing how components affect device risks
- **Vulnerability Assessments** — outcomes derived from SBOM analysis
- **Software Support Information** — lifecycle and maintenance details
- **Labeling and Transparency Materials** — cybersecurity information for end users

## Practical Implications for Manufacturers

If you're preparing a premarket submission (510(k), PMA, De Novo), here's what the FDA expects in practice:

### SBOM Compliance Checklist

1. **Inventory completeness** — Cover all software elements in your device
2. **Machine-readable format** — Use SPDX or CycloneDX consistent with NTIA baseline
3. **Support and lifecycle metadata** — Document support status and EOL dates for each component
4. **Known vulnerability assessment** — Tie vulnerabilities back to risk controls
5. **Traceability and architecture linkage** — Connect SBOMs to documentation and risk models
6. **Ongoing maintenance strategy** — Plan for SBOM updates through the device's life

### Consequences of Non-Compliance

Noncompliance or insufficient SBOM information can result in:

- **Refuse-to-accept decisions** at the submission stage
- **Delays in review** requiring resubmission with complete SBOM and analysis

The message is clear: get your SBOM documentation right the first time.

## How sbomify Helps with FDA Compliance

Medical devices often have long lifecycles — sometimes 10-15 years or more. Managing SBOMs across that timespan, through multiple software updates and component changes, requires purpose-built tooling.

[sbomify]({{ site.url }}) provides the infrastructure medical device manufacturers need:

### SBOM Lifecycle Management

- Archive and track SBOMs across product versions and releases
- Maintain full version history for regulatory audits
- Support long-lived devices with historical SBOM records

### Centralized SBOM Hub

- Manage SBOMs for multiple device products in one platform
- Standardize SBOM generation and storage across teams
- Aggregate component-level SBOMs into product-level views with our [SBOM hierarchy]({{ site.url }}/features/sbom-hierarchy/) feature

### Vulnerability Monitoring

- Integrate with [Google OSV and Dependency Track]({{ site.url }}/features/integrations/) for continuous vulnerability monitoring
- Monitor archived SBOMs for newly discovered vulnerabilities
- Track vulnerability status even for devices shipped years ago

### Trust Center

- Share SBOMs with auditors, regulators, and customers through a branded [Trust Center]({{ site.url }}/features/trust-center/) portal
- Control access and visibility for different stakeholders
- Demonstrate transparency and compliance

### CI/CD Integration

- [Generate SBOMs automatically]({{ site.url }}/features/generate-collaborate-analyze/) in your build pipeline
- Upload SBOMs to sbomify with our GitHub Action and GitLab modules
- Ensure every release has up-to-date SBOM documentation

## Conclusion

The FDA's June 2025 cybersecurity guidance makes it clear: SBOMs are no longer optional for medical device manufacturers. They're a critical component of premarket submissions and ongoing compliance. The guidance sets clear expectations for SBOM content, format, and lifecycle management — and the FDA is prepared to refuse submissions that don't meet these standards.

Getting ahead of these requirements isn't just about regulatory compliance — it's about building more secure devices and maintaining trust with healthcare providers and patients.

[Get started with sbomify](https://app.sbomify.com) and build FDA-ready SBOM documentation into your medical device development process.

## Resources

### Official Documentation

- [FDA Guidance: Cybersecurity in Medical Devices (PDF)](https://www.fda.gov/media/119933/download)

### Learn More About SBOMs

- [What is an SBOM?]({{ site.url }}/what-is-sbom/)
- [How to Version SBOMs]({{ site.url }}/guides/how-to-version-sboms)
- [The Growing Importance of SBOMs in Cybersecurity Compliance]({{ site.url }}/features/why-now/)

### Related Compliance Frameworks

- [Understanding the EU Cyber Resilience Act]({{ site.url }}/2024/07/10/understanding-the-eu-cyber-resilience-act-the-role-of-sboms-in-enhancing-cybersecurity/)
- [How SBOMs Help with PCI DSS 4.0 Compliance]({{ site.url }}/2025/01/07/how-sboms-can-help-you-achieve-pci-dss-4-compliance/)
- [CRA Explained: What the Cyber Resilience Act Means for Device Manufacturers]({{ site.url }}/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/)

### sbomify Features

- [SBOM Hierarchy]({{ site.url }}/features/sbom-hierarchy/)
- [Integrations]({{ site.url }}/features/integrations/)
- [Trust Center]({{ site.url }}/features/trust-center/)
