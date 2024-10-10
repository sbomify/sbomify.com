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

### 4. Consolidate

This final step is often overlooked: [SBOM hierarchy]({{ site.url }}//features/sbom-hierarchy/). This step can be skipped and done in the Distribution instead if you're using a platform like sbomify.

In the case of a basic SaaS product, your architecture might include an API service running inside a Docker container and a frontend built with a JavaScript framework. Now, you already have three SBOMs: one for the backend, one for the Docker container, and one for the JavaScript libraries.

While you could theoretically merge the JavaScript SBOM with the backend SBOM, you cannot combine the backend and Docker container SBOMs, as they are different of SBOMs (at least in CycloneDX).

To resolve this, you need to create a parent SBOM that links all three SBOMs together (using `externalReferences` in CycloneDX). Whether you use CycloneDX or SPDX, the process will differ. In most cases, this step requires a custom application or, at the very least, complex scripting.

*If you're looking to simplify this step, get in touch, and we can automatically generate the SBOM hierarchy for you.*

## Distribution (a.k.a Transportation)

While each of these stages is critical for maintaining transparency and security in the software supply chain, collaboration is often challenging. SBOMs need to be shared effectively with both internal teams and external stakeholders, including customers and partners. This is sometimes referred to as 'Transportation' as well. Unfortunately, current SBOM distribution practices are often outdated and inefficient. After speaking with CTOs and Chief Security Architects (CSAs), we found that many organizations still rely on email to share SBOMs — a method reminiscent of how software patches were distributed in the 1990s. These SBOMs are then often stored ad-hoc on internal file shares, leading to issues such as unnecessary manual labor, disorganized storage, and the risk of using outdated data.

The inefficiencies of traditional SBOM collaboration methods are more than just inconvenient — they pose significant risks to the integrity and security of the software supply chain. As highlighted in the [CISA SBOM Sharing Primer](https://www.cisa.gov/sites/default/files/2024-05/SBOM%20Sharing%20Primer.pdf), effective SBOM sharing (called 'Transport' in the document) is crucial for enhancing visibility and managing risk. The document outlines best practices for SBOM sharing and emphasizes the need for standardized, automated processes. It also warns against relying on manual methods, which can lead to inconsistencies and errors that compromise the entire software ecosystem. The current state of SBOM collaboration in many organizations is far from the ideal outlined by CISA, highlighting a pressing need for better tools and workflows.

This is where sbomify comes in. sbomify automates the collaboration aspect of the SBOM life cycle, ensuring SBOMs are shared seamlessly and securely. By integrating directly into the Continuous Integration/Continuous Deployment (CI/CD) workflow, sbomify eliminates the need for manual SBOM distribution and ad-hoc storage solutions. Instead of relying on email chains and scattered file shares, organizations can use sbomify to automate the sharing process, ensuring all stakeholders have access to the most up-to-date and accurate SBOM data. This not only reduces labor but also enhances security by minimizing the risk of outdated or incorrect information being circulated.

The importance of automating SBOM collaboration cannot be overstated. As the software industry increasingly recognizes the value of SBOMs for transparency and security, the need for efficient and secure collaboration tools becomes paramount. Solutions like sbomify address these needs directly, providing a modern approach that aligns with CISA’s best practices. For organizations looking to streamline their SBOM processes and enhance their cybersecurity posture, adopting an automated, integrated solution like sbomify is not just a smart choice—it’s essential.

## Analysis

The final phase in the SBOM life cycle is the analysis phase. Generally, people want to do one of two things with an SBOM:

* Security Audit: Identify all CVEs in a given SBOM
* License Audit: Ensure all software in the SBOM complies with internal policies

There are many tools available on the market that focus on different problem spaces (many of them listed [here]({{ site.url }}/resources/#analysis)). Two popular open-source tools for SBOM analysis are [Dependency Track](https://dependencytrack.org/) and [guac](https://github.com/guacsec/guac).

At sbomify, we aim to be the [SBOM hub]({{ site.url }}/features/sbom-hub/) that not only allows you to easily share SBOMs with stakeholders, but also integrates with the tools you use, enabling you to export your SBOMs directly to your analysis tools from sbomify.
