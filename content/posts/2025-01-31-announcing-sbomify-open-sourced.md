---

title: "sbomify Goes Open Source: A New Chapter in SBOM Management"
description: "sbomify is now open source under Apache 2.0 plus Common Clause. Learn about our hierarchical SBOM approach, CycloneDX support, and Project Koala integration plans."
date: 2025-01-31 09:00:00 +0000
category: announcement
tags: [sbom, open-source]
author:
  display_name: Viktor Petersson
slug: announcing-sbomify-open-sourced
---

I am thrilled to share that **sbomify** is now officially **open source**! As of today, you can find our project on [GitHub](https://github.com/sbomify/sbomify). This decision is a leap forward in our mission to promote transparency, collaboration, and innovation in Software Bill of Materials (SBOM) management.

## Why Now?

The timing of our open-source release couldn't be more fitting. As the founder of sbomify and co-chair of a CISA Working Group on SBOM Reference Implementation, I've gained unique insights into the industry's needs. The working group is entering its final phase, developing a comprehensive white paper that will shape the future of SBOM practices.

With the EU's Cyber Resilience Act (CRA) on the horizon, organizations are facing increasing pressure to adopt robust SBOM practices. This regulatory shift makes the need for accessible, enterprise-grade SBOM tooling more urgent than ever. By open-sourcing sbomify in alignment with these emerging recommendations and regulatory requirements, our team hopes to empower organizations and individuals to adopt more robust and transparent SBOM practices, sooner rather than later.

## Hierarchical SBOMs: Product, Project, & Components

One of sbomify's standout features is the **hierarchical approach** to structuring SBOMs. This wasn't a theoretical design choice -- it emerged directly from our experience implementing SBOMs in real-world enterprise environments. We learned that instead of a one-size-fits-all model, organizations need a flexible, layered approach to effectively manage their software supply chain. That's why we've designed sbomify to organize SBOM data across three logical levels:

- **Product**: The overarching entity -- think a product line or service offering.
- **Project**: The specific application or module within that product line.
- **Components**: The libraries, frameworks, and resources that power each project.

[Learn more about our SBOM hierarchy approach here.](https://sbomify.com/features/sbom-hierarchy/)

By embracing this organized structure, you gain clearer insights into which components belong where, making it easier to assess impact, manage updates, and streamline compliance.

## Focusing on Standards: CycloneDX & (Eventually) SPDX

Our immediate goal is to be fully compliant with **CycloneDX**, and while we're not yet 100% aligned with **SPDX**, we are actively working towards it. Standardized formats are critical to ensuring consistent, dependable SBOM data. We believe that by supporting both CycloneDX and SPDX, sbomify will better serve the entire community, from open-source maintainers to enterprise security teams.

## Looking Ahead: Project Koala & TEA

In addition to existing SBOM standards, we're committed to supporting [Project Koala](https://github.com/CycloneDX/transparency-exchange-api/) and the **Transparency Exchange API (TEA)**. These emerging initiatives aim to standardize how security and compliance data is exchanged. By integrating Koala and TEA capabilities into sbomify, we're helping lay the groundwork for a more unified and transparent ecosystem -- where all parties can confidently share, verify, and build upon each other's work.

## Open Source at Heart

Releasing sbomify under an _Apache 2.0 license plus Common Clause_ reflects our desire to foster open collaboration while preventing unauthorized monetization. I want to extend special thanks to **OSS Capital** for their work on the [Common Clause](https://commonsclause.com/) which makes it easier to ensure that sbomify remains free for everyone to run, self-host, and adapt within their organizations.

## Join Us

<a href="https://github.com/sbomify/sbomify"><img src="https://img.shields.io/static/v1?label=&message=Star%20on%20GitHub&color=white&logo=github&logoColor=black" alt="Star sbomify on GitHub" width="200" height="28"></a>

Here are some ways you can get involved:

1. **Explore sbomify**: Check out our [GitHub repository](https://github.com/sbomify/sbomify) to install and run sbomify locally.
2. **Contribute**: Whether you have suggestions for improvements, want to report issues, or can offer code contributions, we'd love your help shaping sbomify's roadmap.
3. **Spread the Word**: Share this announcement with your network to help us grow a vibrant community around open SBOM management.

Your feedback, ideas, and enthusiasm will help refine sbomify into an indispensable tool for anyone looking to streamline their SBOM processes. Our team can't wait to see what we'll build together as we embrace the principles of open source, transparency, and shared innovation.

**Thank you for being a part of this journey -- let's make SBOM management easier, more secure, and more collaborative than ever before!**
