---

title: "FDA Medical Device SBOM Requirements: What the New Cybersecurity Guidance Means for Manufacturers"
description: "Breakdown of the FDA's June 2025 guidance on medical device cybersecurity, explaining SBOM requirements, premarket submission expectations, and compliance strategies."
author:
  display_name: Viktor Petersson
category: compliance
tags: [sbom, fda, medical-devices, cybersecurity, compliance]
date: 2026-01-09
slug: fda-medical-device-sbom-requirements
---

On June 27, 2025, the FDA issued updated guidance on **"Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions."** This document marks a significant step forward in how medical device manufacturers must approach software security and transparency. At the heart of these recommendations lies the [Software Bill of Materials (SBOM)](/what-is-sbom/) — now an essential element of premarket submissions for connected medical devices.

If you're a manufacturer preparing a 510(k), PMA, or other premarket submission, here's what you need to know about the FDA's SBOM expectations and how to prepare.

## What the Guidance Says About SBOMs

The FDA guidance recommends the inclusion of an SBOM under **Section V.A.4 (Software Bill of Materials)** as part of cybersecurity documentation in premarket submissions. Additionally, **Appendix 4** lists SBOM sections as recommended documentation when cybersecurity risk is relevant.

While the guidance language is technically **non-binding** ("contains nonbinding recommendations"), the practical reality is different:

- Under **Section 524B of the FD&C Act**, the FDA has authority over "cyber devices" — devices with software that can be vulnerable and are connected
- FDA may **refuse to accept premarket submissions** that do not provide adequate SBOM and related cybersecurity information
- Insufficient SBOM documentation can lead to **delays in review** or requests for resubmission

In practice, the SBOM has moved from "nice-to-have" to **essential cybersecurity documentation** for medical device submissions. This mirrors the broader global trend toward [mandatory SBOM requirements](/features/why-now/) across regulatory frameworks.

## SBOM Content Expectations

The FDA guidance does not define SBOM fields directly. Instead, it explicitly references the **[NTIA Minimum Elements for a Software Bill of Materials](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)** as the baseline expectation for SBOM content in premarket submissions.

This distinction matters: the FDA is effectively saying "provide an SBOM that meets the NTIA minimum elements" — not "provide an SBOM with these FDA-defined fields." This approach mirrors how other regulators (including the EU's Cyber Resilience Act) reference SBOMs indirectly via standards bodies, allowing requirements to evolve without requiring agencies to reissue guidance.

### NTIA Minimum Elements

The NTIA baseline defines what every SBOM should contain. For each software component:

- **Supplier name** — who supplied the component
- **Component name** — the name of the component
- **Version** — the version identifier
- **Unique identifier** — such as Package URL (purl) or CPE
- **Dependency relationship** — how components relate to each other
- **Author of SBOM data** — who created the SBOM
- **Timestamp** — when the SBOM was created

### Machine-Readable Formats

SBOMs should be provided in machine-readable formats that support the NTIA minimum elements:

- **SPDX** (Software Package Data Exchange)
- **CycloneDX**

Both formats are widely accepted and can represent the required NTIA data fields.

### Complete Software Inventory

All software included in the device must be identified:

- Commercial software
- Open-source components
- Third-party libraries
- Off-the-shelf (OTS) components

### Support and Lifecycle Metadata

Beyond the NTIA baseline, FDA expects additional context for medical device submissions:

- **Level of support** from the component supplier (active, legacy, or unsupported)
- **End-of-support and end-of-life dates** for each component

### Vulnerability Context

SBOMs should be supplemented with:

- A **known vulnerabilities assessment** for identified components
- **Controls or mitigation descriptions** explaining whether vulnerabilities are mitigated by design

This means SBOMs are expected to be part of a comprehensive **vulnerability and risk management package**, not just a flat inventory list.

## Lifecycle and Traceability Requirements

The FDA guidance ties SBOMs into broader cybersecurity documentation expectations throughout the device lifecycle. Understanding the full [SBOM lifecycle](/features/generate-collaborate-analyze/) — from generation through distribution and analysis — is critical for FDA compliance:

### Secure Product Development and Traceability

- SBOMs must be **traceable to security architecture views** and threat models that FDA reviewers evaluate
- The documentation should demonstrate how software components affect device security risks

### Ongoing Updates

- SBOMs should be **updated to reflect changes** throughout software updates and the device lifecycle
- This is not a one-time snapshot — it's a living document
- Proper [SBOM versioning practices](/guides/how-to-version-sboms) are essential for maintaining traceability

### Integration with Other Documentation

In premarket submissions, SBOMs typically appear alongside:

- **Security Risk Management Reports** — showing how components affect device risks
- **Vulnerability Assessments** — outcomes derived from SBOM analysis
- **Software Support Information** — lifecycle and maintenance details
- **Labeling and Transparency Materials** — cybersecurity information for end users

### Why CI/CD Integration Is Essential

Given the FDA's emphasis on traceability and ongoing updates, **manual SBOM generation is not sustainable** for medical device compliance. Every software build should automatically generate an SBOM that:

- Captures the exact components at the moment of build
- Is cryptographically linked to that specific release
- Can be traced back to source code and build artifacts
- Is automatically stored and versioned for audit trails

Integrating SBOM generation into your CI/CD pipeline ensures that every release — whether it's a major version update or a security patch — has accurate, reproducible documentation. This is particularly important for medical devices where you may need to answer FDA questions about software composition years after the initial submission.

### Distribution and Transparency

The FDA expects manufacturers to share cybersecurity information with stakeholders, including healthcare providers and end users. This means having a reliable system for distributing SBOMs to:

- FDA reviewers during premarket submissions
- Auditors during compliance assessments
- Healthcare organizations evaluating your devices
- Security researchers conducting vulnerability assessments

Email and shared drives don't scale for this — you need a dedicated [SBOM hub and Trust Center](/features/trust-center/) that provides controlled access to current and historical SBOMs.

## Practical Implications for Manufacturers

If you're preparing a premarket submission (510(k), PMA, De Novo), here's what the FDA expects in practice:

### SBOM Compliance Checklist

1. **NTIA Minimum Elements** — Ensure your SBOM includes all required fields (supplier, component name, version, unique identifier, dependencies, author, timestamp)
2. **Machine-readable format** — Use SPDX or CycloneDX
3. **Inventory completeness** — Cover all software elements in your device
4. **Support and lifecycle metadata** — Document support status and EOL dates for each component
5. **Known vulnerability assessment** — Tie vulnerabilities back to risk controls
6. **Traceability and architecture linkage** — Connect SBOMs to documentation and risk models
7. **Ongoing maintenance strategy** — Plan for SBOM updates through the device's life

### Consequences of Non-Compliance

Noncompliance or insufficient SBOM information can result in:

- **Refuse-to-accept decisions** at the submission stage
- **Delays in review** requiring resubmission with complete SBOM and analysis

The message is clear: get your SBOM documentation right the first time.

## How sbomify Helps with FDA Compliance

Medical devices often have long lifecycles — sometimes 10-15 years or more. Managing SBOMs across that timespan, through multiple software updates and component changes, requires purpose-built tooling that automates the entire [SBOM lifecycle](/features/generate-collaborate-analyze/).

[sbomify]() provides the infrastructure medical device manufacturers need:

### Automated CI/CD Integration

This is the foundation of FDA-compliant SBOM management. sbomify integrates directly into your build pipeline:

- **[Generate SBOMs automatically](/features/generate-collaborate-analyze/)** during every build — no manual steps
- **Augment and enrich** SBOMs with supplier information, licensing, and metadata required by NTIA minimum elements
- **Cryptographic signing and attestation** for verifiable integrity
- Upload to sbomify with our [GitHub Action](https://github.com/sbomify/github-action) and [GitLab modules](/2024/11/12/gitlab-support/)
- Every release automatically documented and stored for regulatory review

By automating generation in CI/CD, you ensure that SBOMs are always accurate, reproducible, and traceable to specific builds — exactly what the FDA expects.

### Trust Center for Regulatory Distribution

Email and file shares don't meet FDA expectations for professional cybersecurity documentation. sbomify's [Trust Center](/features/trust-center/) gives you:

- A **branded portal** for sharing SBOMs with FDA reviewers, auditors, and healthcare organizations
- **Controlled access** — determine who can see which products and versions
- **Always current** — stakeholders access live data, not stale email attachments
- **Audit trail** — track who accessed what and when
- Professional presentation that demonstrates your commitment to transparency

### SBOM Lifecycle Management

- Archive and track SBOMs across product versions and releases
- Maintain full version history for regulatory audits spanning years
- Support long-lived medical devices with complete historical records

### Centralized SBOM Hub

- Manage SBOMs for multiple device products in one platform
- Standardize generation and storage across engineering teams
- Aggregate component-level SBOMs into product-level views with our [SBOM hierarchy](/features/sbom-hierarchy/) feature — essential for complex medical devices with multiple software subsystems

### Continuous Vulnerability Monitoring

- Integrate with [Google OSV and Dependency Track](/features/integrations/) for ongoing vulnerability detection
- Monitor archived SBOMs for newly discovered CVEs
- Track vulnerability status even for devices shipped years ago — critical for the FDA's post-market cybersecurity expectations

## Conclusion

The FDA's June 2025 cybersecurity guidance makes it clear: SBOMs are no longer optional for medical device manufacturers. They're a critical component of premarket submissions and ongoing compliance. The guidance sets clear expectations for SBOM content, format, and lifecycle management — and the FDA is prepared to refuse submissions that don't meet these standards.

Getting ahead of these requirements isn't just about regulatory compliance — it's about building more secure devices and maintaining trust with healthcare providers and patients.

[Get started with sbomify](https://app.sbomify.com) and build FDA-ready SBOM documentation into your medical device development process.

## Resources

### Official Documentation

- [FDA Guidance: Cybersecurity in Medical Devices (PDF)](https://www.fda.gov/media/119933/download)
- [NTIA Minimum Elements for a Software Bill of Materials (PDF)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)

### Learn More About SBOMs

- [What is an SBOM?](/what-is-sbom/)
- [The SBOM Lifecycle: Generation, Distribution, and Analysis](/features/generate-collaborate-analyze/)
- [How to Version SBOMs](/guides/how-to-version-sboms)
- [The Growing Importance of SBOMs in Cybersecurity Compliance](/features/why-now/)

### Related Compliance Frameworks

- [Understanding the EU Cyber Resilience Act](/2024/07/10/understanding-the-eu-cyber-resilience-act-the-role-of-sboms-in-enhancing-cybersecurity/)
- [How SBOMs Help with PCI DSS 4.0 Compliance](/2025/01/07/how-sboms-can-help-you-achieve-pci-dss-4-compliance/)
- [CRA Explained: What the Cyber Resilience Act Means for Device Manufacturers](/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/)

### sbomify Features

- [SBOM Hierarchy](/features/sbom-hierarchy/)
- [Integrations](/features/integrations/)
- [Trust Center](/features/trust-center/)
