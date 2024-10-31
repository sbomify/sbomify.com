---
layout: page
title: A primer on the SBOM lifecycle for SBOM producers
description: "Streamline your Software Bill of Materials (SBOM) workflow with our comprehensive guide. Learn about SBOM generation, collaboration, and analysis best practices, and discover how to automate distribution with sbomify."
---

The Software Bill of Materials (SBOM) life cycle comprises three key stages: Authoring, Distribution, and Analysis.

![Lifecycle](/assets/images/site/lifecycle.svg)

## Generation (a.k.a Authoring)

Newcomers to SBOMs unfortunately often underestimate the complexities involved in creating a complete SBOM (also known as 'authoring'). There are many [SBOM generation tools]({{ site.url }}/resources/#generation) available, so it might seem like it's just a matter of running one of these tools and you're done.

While this *might* suffice for your internal SBOM needs when starting out, the reality is far more complicated if you need to meet industry requirements, such as the NTIA Minimum Elements. But don’t worry — we’re here to help.

To produce an SBOM that complies with standards like the NTIA Minimum Elements, it's helpful to think of the process as having four phases.

![Generation Phases](/assets/images/site/generation.svg)

### 1. Generate

The generation phase is when you produce the actual SBOM. Generally speaking, there are two ways to generate an SBOM: you can do it from **source** (e.g., from a lock file, such as `requirements.txt`) or during **build** (e.g., after you’ve installed everything from the lock file). To meet the NTIA Minimum Elements, you really need to generate the SBOM during the build process. If you generate it from the source, you won’t capture all **transitive dependencies** from the source code. This is why tools like GitHub's Dependency Graph can't produce NTIA-compliant SBOMs.

### 2. Augment

Once you’ve generated your SBOM, you’ll need to *augment* it with information that the SBOM generation tool likely didn’t capture. This may include details like:

* Who are you?
* What is the software’s license?
* What version of the software is this?
  * Depending on the generation tool, this might already be set, but you may want to override it.
* Who is supplying the software?
* How can I get in touch with you?

Many people do this manually by merging a metadata SBOM file into the original SBOM (often using `jq`). This approach is labor-intensive and prone to error, but `jq` (and now [`jd`](https://github.com/josephburnett/jd)) tend to be what people are using.

*If you want to avoid this step, get in touch with us and we can automate the entire process for you.*

### 3. Enrich

Next comes the *enrichment* phase. Depending on the tool you used to generate the SBOM, this step may or may not be necessary. Some tools will automatically enrich the SBOM, typically by calling out to a third-party service (like PyPI)  during the generation phase to gather more information about all components, such as licensing data, and include it in the SBOM.

### 4. Signing / Attestation

If you're serious about supply chain security, consider adding cryptographic signing and attestation to your SBOM generation workflow. This process involves not only generating an SBOM in your CI/CD pipeline but also cryptographically signing it. The primary security advantage is that it allows you to verify the SBOM’s integrity and authenticity at any time, meaning that you don't need to trust the SBOM distribution platform (like sbomify).

You can read more about this in our [blog post on attestation]({{ site.url }}/2024/10/31/github-action-update-and-attestation/).

## Distribution (a.k.a Transportation)

Each stage of the SBOM lifecycle is crucial to maintaining transparency and security within the software supply chain. Yet, effective collaboration on SBOMs remains a significant challenge. SBOMs must be shared efficiently with internal teams and external stakeholders, such as customers and partners — a process often referred to as "Transportation." Unfortunately, many organizations still rely on outdated methods for SBOM distribution. Conversations with CTOs and CISOs reveal that email remains the primary sharing tool, reminiscent of how software patches were distributed in the 1990s. As a result, SBOMs are often stored haphazardly on internal file shares, leading to labor-intensive processes, disorganized storage, and outdated information that can introduce risks.

The limitations of these traditional SBOM sharing methods pose real risks to supply chain integrity. The [CISA SBOM Sharing Primer](https://www.cisa.gov/sites/default/files/2024-05/SBOM%20Sharing%20Primer.pdf) underscores the need for streamlined SBOM “Transport” to improve visibility and reduce risk. The document advocates for automated, standardized processes, cautioning that manual methods create inconsistencies and errors that could compromise the entire ecosystem.

This is where sbomify transforms the SBOM landscape. sbomify automates the distribution and collaboration process, integrating directly into the Continuous Integration/Continuous Deployment (CI/CD) workflow to remove the need for manual distribution and ad-hoc storage. Instead of relying on scattered email chains and file shares, sbomify ensures that stakeholders always have access to accurate, up-to-date SBOM data. By automating the process, sbomify not only minimizes manual work but significantly enhances security, reducing the risk of circulating outdated or incorrect information.

A frequently overlooked yet essential step in the SBOM lifecycle is the creation of a consolidated [SBOM hierarchy]({{ site.url }}//features/sbom-hierarchy/), especially valuable in complex software architectures. Take a basic SaaS product, for instance: with an API service running in a Docker container and a JavaScript-based frontend, you’ll quickly accumulate multiple SBOMs—for the backend, the Docker environment, and the JavaScript libraries.

In such setups, combining the JavaScript and backend SBOMs may be feasible, but backend and Docker SBOMs remain distinct (at least in CycloneDX format). To maintain clarity, you can create a parent SBOM that links these individual SBOMs. The consolidation process, whether in CycloneDX or SPDX, often requires either complex scripts or a custom tool. With sbomify, this is built-in.

*If this sounds complex, reach out, and we can automate SBOM hierarchy generation for you.*

As the software industry increasingly recognizes the value of SBOMs for security and transparency, the need for efficient, automated collaboration tools becomes critical. Solutions like sbomify address this need by modernizing SBOM workflows and aligning with CISA’s best practices. For organizations aiming to streamline SBOM processes and bolster their cybersecurity, implementing a solution like sbomify is not just beneficial - it’s essential.

## Analysis

The final phase in the SBOM life cycle is the analysis phase. Generally, people want to do one of two things with an SBOM:

* Security Audit: Identify all CVEs in a given SBOM
* License Audit: Ensure all software in the SBOM complies with internal policies

There are many tools available on the market that focus on different problem spaces (many of them listed [here]({{ site.url }}/resources/#analysis)). Two popular open-source tools for SBOM analysis are [Dependency Track](https://dependencytrack.org/) and [guac](https://github.com/guacsec/guac).

At sbomify, we aim to be the [SBOM hub]({{ site.url }}/features/sbom-hub/) that not only allows you to easily share SBOMs with stakeholders, but also integrates with the tools you use, enabling you to export your SBOMs directly to your analysis tools from sbomify.
