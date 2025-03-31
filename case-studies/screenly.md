---
layout: page
title: "Screenly Case Study: Simplifying SBOM Management with sbomify"
description: "Screenly is a secure digital signage platform and this is how sbomify helped secure their SBOM supply chain."
permalink: /case-studies/screenly
---

![Screenly logo](/assets/images/site/screenly_dark.svg){: .w-[200px] .mb-8}

## About Screenly

Screenly delivers secure digital signage solutions trusted by Fortune 500 companies and financial institutions. They focus on providing reliable and secure platforms that meet the needs of security-conscious organizations.

## The Challenge

Over the past year, Screenly noticed a growing demand from customers for Software Bill of Materials (SBOMs). Clients wanted transparency into the components that make up Screenly's digital signage solutions. Committed to meeting these needs — and as part of their pledge in joining CISA's Secure by Design program — they set out to provide comprehensive SBOMs.

However, they quickly encountered a significant hurdle: instead of managing a single SBOM, Screenly had dozens across their product line. Each component — be it backend services, frontend applications, or device firmware — had its own SBOM with its own release schedule. Grouping and managing these multiple SBOMs became a complex and time-consuming task.

Their challenges included:

- **Automated SBOM Generation**: They needed to automatically generate SBOMs within their CI/CD pipeline for all services and firmware components.
- **Effective Distribution**: Sharing SBOMs with external stakeholders in a way that ensured they always had the latest versions was essential.
- **Logical Grouping**: Creating a clear structure that represented their entire product suite, accommodating different release cadences, was challenging.
- **Meeting Compliance Standards**: Existing tools often produced incomplete SBOMs that didn't meet NTIA's minimum elements, requiring extra steps to enrich them with vendor and licensing data.
- **SBOM Attestation**: Screenly wanted to ensure the authenticity and integrity of their SBOMs by attesting them, adding another layer of security and trust.

## Solution with sbomify

Partnering with **sbomify** helped Screenly overcome these challenges:

- **Adoption of sbomify GitHub Action Module**: Screenly integrated the sbomify GitHub Action module into their CI/CD pipeline. This allowed for automated SBOM generation across all components directly within their existing workflow.
- **Streamlined SBOM Management**: sbomify enabled them to group and manage their multiple SBOMs effectively. They created a logical hierarchy that mirrored how their products are built and maintained, simplifying management despite varying release schedules.

![Screenly's SBOM hierarchy in sbomify](/assets/images/site/screenly-hierarchy.svg)
_Partial diagram of Screenly's SBOM hierarchy in sbomify_

- **Automated Generation with GitHub Actions**: By leveraging the sbomify GitHub Action, every build automatically produced an up-to-date SBOM without manual effort. This seamless integration ensured consistency and saved valuable time.
- **Efficient Distribution**: sbomify's distribution features allowed Screenly to share SBOMs with stakeholders easily. Stakeholders always had access to the latest versions, aligning with best practices highlighted in CISA's SBOM Sharing Primer.
- **Compliance Made Easy**: sbomify helped them augment their SBOMs with necessary vendor and licensing information, ensuring compliance with NTIA's minimum elements without additional busywork.
- **SBOM Attestation via GitHub Actions**: They used sbomify's integration with GitHub Actions to automatically attest all their SBOMs. This provided cryptographic proof of authenticity and integrity, enhancing trust with customers and stakeholders.

## The Results

- **Enhanced Transparency**: Customers now have clear insights into the software components of Screenly's solutions, building greater trust.
- **Improved Security**: Adhering to industry best practices and NTIA guidelines strengthened their security posture.
- **Operational Efficiency**: Automation reduced manual efforts in SBOM management, allowing their team to focus on core development.
- **Simplified Management**: Managing multiple SBOMs across different components and release schedules became straightforward.
- **Verified Authenticity**: SBOM attestation via GitHub Actions ensured the integrity of their SBOMs, giving stakeholders added confidence.
- **Better Collaboration**: Efficient distribution and clear structuring of SBOMs improved stakeholder collaboration.

## Conclusion

By teaming up with sbomify, Screenly transformed how they handle SBOMs. They overcame the complexities of managing multiple SBOMs, automated their processes using the sbomify GitHub Action module, ensured compliance, and added a layer of security with SBOM attestation — all while enhancing transparency for their customers.

Screenly is dedicated to providing secure and reliable digital signage solutions. With sbomify, they have taken a significant step forward in fulfilling that commitment, reinforcing their position as a trusted partner for security-conscious organizations.
