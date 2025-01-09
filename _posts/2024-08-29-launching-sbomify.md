---
layout: post
title: "Introducing sbomify: Revolutionizing SBOM Management"
author:
  display_name: Viktor
categories: announcement sbom security

---

We’re excited to announce the launch of sbomify, a platform designed to transform how businesses manage and share Software Bill of Materials (SBOMs). Our journey to create sbomify began with a clear observation — many companies, particularly those in regulated industries, are struggling to keep up with the increasing demand for SBOMs. This need has only intensified with mandates like the US Executive Order 14028, the upcoming EU Cyber Resilience Act, and the CISA's [Secure by Design](https://www.cisa.gov/securebydesign) initiative, which calls for radical transparency in software development.

As the founder of [Screenly](https://www.screenly.io), I observed firsthand the growing challenges software vendors face when it comes to managing and sharing SBOMs. It became glaringly obvious that manually sending SBOMs to customers via email or storing them on internal file servers was completely unrealistic. The process was not only time-consuming but also prone to errors and delays, making it an inefficient way to ensure that customers had access to the most up-to-date information. This challenge is further emphasized in CISA’s [Sharing Primer on SBOMs](https://www.cisa.gov/sites/default/files/publications/Sharing-SBOMs-Primer-CISA-508.pdf), which highlights the importance of efficient and secure SBOM sharing practices.

Over the past year, I’ve also had numerous conversations with CTOs and CISOs across various industries about how they currently manage SBOMs. It became clear that most companies are still relying on manual processes to handle these critical documents. Whether it's through email, internal file shares, or other outdated methods, the consensus was that there had to be a better way—one that aligns with the dynamic nature of SBOMs in modern CI/CD environments.

This is where sbomify comes in.

sbomify automates the entire SBOM management process by integrating directly with your CI/CD pipeline. With each new release, the latest SBOM is automatically uploaded to sbomify, providing stakeholders with instant, real-time access. No more cumbersome email chains or dealing with outdated files — sbomify ensures your SBOMs are always up-to-date and easily accessible.

To understand how sbomify fits into the SBOM ecosystem, it’s essential to recognize the three key parts of the SBOM life cycle: [**generation, collaboration, and analysis**]({{ site.url }}/features/generate-collaborate-analyze/). sbomify focuses purely on the collaboration aspect, ensuring that once SBOMs are generated, they can be easily shared and accessed in real-time by all relevant stakeholders. We believe that efficient collaboration is the backbone of effective SBOM management, which is why we’ve built sbomify to excel in this area.

![SBOM hub](/assets/images/site/marketplace.svg)

However, we also recognize the importance of the other two components - generation and analysis. That’s why sbomify will be partnering and integrating with leading third-party providers who specialize in these areas. Our goal is to create a seamless experience where SBOMs can be generated, collaborated on, and analyzed, all through interconnected tools that work together to ensure comprehensive SBOM management.

We’re excited about the possibilities sbomify offers and would love to hear your thoughts or discuss how it can benefit your organization.

You can request early access up using [this form](https://docs.google.com/forms/d/e/1FAIpQLSe1-SCbmyPnhHxP1RHIYi4iKP2CLy6SXcqFOP1i7B8VHZJYkw/viewform?usp=sf_link).
