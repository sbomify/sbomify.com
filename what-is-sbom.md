---
layout: page
permalink: /what-is-sbom/
title: What is an SBOM?

---

### Understanding SBOMs and Supply Chain Transparency

A Software Bill of Materials (SBOM) is like an ingredients list for your software. It provides a comprehensive inventory of all the components, libraries, and modules that make up your application. Much like a bill of materials for a physical product, an SBOM details every element that contributes to the final build, offering critical visibility into the software's dependencies and relationships. This transparency is the foundation for managing risks, ensuring compliance, and maintaining the integrity of your software supply chain.

### Why SBOMs Matter

SBOMs are essential for three main reasons:

1. **Enhanced Security:** They allow organizations to quickly identify and mitigate vulnerabilities in specific components, enabling a proactive defense against cybersecurity threats.
2. **Regulatory Compliance:** They provide a clear, auditable record of software components, which is increasingly required for audits, certifications, and government contracts.
3. **Operational Efficiency:** They simplify the tracking and management of updates and patches, making maintenance more efficient.

### The Global Push for Transparency

Governments and regulatory bodies worldwide are recognizing the critical role of SBOMs.

#### United States: Executive Order 14028
In May 2021, the Biden administration issued an [Executive Order on Improving the Nation's Cybersecurity](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/). A key mandate of this order requires SBOMs for all software sold to the federal government, setting a new standard for transparency and trust in the US software supply chain.

#### European Union: Cyber Resilience Act (CRA)
On the other side of the pond, the EU is enforcing similar standards with the [Cyber Resilience Act]({{ site.url }}/2024/07/10/understanding-the-eu-cyber-resilience-act-the-role-of-sboms-in-enhancing-cybersecurity/). This landmark legislation mandates strict cybersecurity requirements for products with digital elements, placing SBOMs at the center of compliance for any company doing business in the EU.

#### Industry Standards: PCI DSS 4.0
It's not just governments driving this change. Major compliance frameworks are following suit. For example, [PCI DSS 4.0]({{ site.url }}/2025/01/07/how-sboms-can-help-you-achieve-pci-dss-4-compliance/) now emphasizes the need for rigorous software lifecycle management, making SBOMs a practical necessity for securing payment data. Most other compliance frameworks are expected to adopt similar requirements soon.

### Competing SBOM Formats

There are several formats in use today, but two have emerged as the industry standards:

1. **[CycloneDX](https://cyclonedx.org/)**: Developed by OWASP, this is a lightweight, security-focused standard designed specifically for application security and supply chain component analysis.
2. **[SPDX](https://spdx.dev/) (Software Package Data Exchange)**: Developed by the Linux Foundation, this is a well-established standard widely used in open-source communities for documenting licenses and metadata.

While there is no single "winner" yet, both formats represent a positive step toward a more transparent and secure software ecosystem.

### SBOM Deep Dive

If you want to do a deep dive into SBOMs, we recommend watching this interview with Allan Friedman (formerly CISA) on the podcast [Nerding Out with Viktor](https://vpetersson.com/podcast/).

<iframe width="560" height="315" src="https://www.youtube.com/embed/E77ohYZA2vo?si=dZbcMfdO10EafVVw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### In Summary

SBOMs are no longer optional; they are becoming a global standard for software transparency, security, and compliance. Driven by mandates like the US Executive Order and the EU Cyber Resilience Act, and reinforced by standards like PCI DSS 4.0, the ability to generate and manage SBOMs is essential for modern software organizations.
