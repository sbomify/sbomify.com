---

title: A primer on the SBOM lifecycle for SBOM producers
description: "Streamline your Software Bill of Materials (SBOM) workflow with our comprehensive guide. Learn about SBOM generation, collaboration, and analysis best practices, and discover how to automate distribution with sbomify."
---

The Software Bill of Materials (SBOM) lifecycle comprises three key stages: **Authoring**, **Distribution**, and **Analysis**.

<div class="mb-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "lifecycle" >}}
</div>

> **TL;DR:** If this workflow sounds overly complex, rest assured that sbomify automates the entire process for you. All you need is a few lines of YAML in your CI/CD pipeline using our [GitHub Action](/features/integrations/).

---

## Generation (a.k.a Authoring)

Newcomers to SBOMs often underestimate the complexities involved in creating a complete SBOM (also known as 'authoring'). There are many [SBOM generation tools](/resources/#generation) available, so it might seem like it's just a matter of running one of these tools and you're done.

While this _might_ suffice for internal SBOM needs when starting out, the reality is far more complicated if you need to meet industry requirements, such as the NTIA Minimum Elements. But don’t worry — we’re here to help.

To produce an SBOM that complies with standards like the NTIA Minimum Elements, it's helpful to view the process in four phases.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "generation" >}}
</div>

### 1. Generate

In the generation phase, you produce the actual SBOM. Generally speaking, there are two main ways to generate an SBOM: from **source** (e.g., using a lock file like `requirements.txt`) or during **build** (e.g., after installing dependencies from the lock file). Technically, you can also generate an SBOM during **run** time, but this approach is far less common.

To meet the NTIA Minimum Elements, we generally recommend generating the SBOM during the build process. Whether you capture all **transitive dependencies** from the source depends on the ecosystem. Modern package managers like **uv** and **Poetry** for Python capture these dependencies, as do build tools for modern languages like **Rust** and **Go**. However, generating from source without a lock file (or using an older package manager) likely won’t capture all **transitive dependencies**. This is why tools like GitHub's Dependency Graph often cannot produce NTIA-compliant SBOMs.

### 2. Augment

After generating your SBOM, you often need to _augment_ it with information that the generation tool likely missed. This may include details like:

- Who are you?
- What is the software’s license?
- What version of the software is this?
  - Depending on the generation tool, this might already be set, but you may need to override it.
- Who is supplying the software?
- How can I get in touch with you?

Many teams do this manually by merging a metadata SBOM file into the original SBOM, often using `jq`. While labor-intensive and error-prone, `jq` (and now [`jd`](https://github.com/josephburnett/jd)) remain the standard tools for this task.

_If you want to avoid this step, our agent automates the entire process for you._

### 3. Enrich

Next is the _enrichment_ phase. Depending on the tool used to generate the SBOM, this step might be optional. Some tools automatically enrich the SBOM, typically by calling out to a third-party service (like PyPI) during generation to gather component details, such as licensing data.

For example, [sbomify's GitHub Action](https://github.com/sbomify/github-action) (which can be used either with sbomify or in standalone mode) automatically augments your SBOM with identity data and enriches it with metadata from [ecosyste.ms](https://ecosyste.ms) to create the most complete SBOM possible — all within your CI pipeline before upload.

### 4. Signing / Attestation

If you're serious about supply chain security, consider adding cryptographic signing and attestation to your workflow. This process involves not only generating an SBOM in your CI/CD pipeline but also cryptographically signing it. The primary security advantage is the ability to verify the SBOM’s integrity and authenticity at any time, reducing the need to blindly trust the distribution platform (like sbomify).

You can read more about this in our [blog post on attestation](/2024/10/31/github-action-update-and-attestation/).

---

## Distribution (a.k.a Transportation)

Each stage of the SBOM lifecycle is crucial to maintaining transparency and security within the software supply chain. Yet, effective collaboration remains a significant challenge. SBOMs must be shared efficiently with internal teams and external stakeholders, such as customers and partners — a process often referred to as "Transportation." Unfortunately, many organizations still rely on outdated distribution methods. Conversations with CTOs and CISOs reveal that email remains the primary sharing tool, reminiscent of how software patches were distributed in the 1990s. As a result, SBOMs are often stored haphazardly on internal file shares, leading to labor-intensive processes, disorganized storage, and outdated information.

The limitations of these traditional sharing methods pose real risks to supply chain integrity. The [CISA SBOM Sharing Primer](https://www.cisa.gov/sites/default/files/2024-05/SBOM%20Sharing%20Primer.pdf) underscores the need for streamlined SBOM “Transport” to improve visibility and reduce risk. The document advocates for automated, standardized processes, cautioning that manual methods create inconsistencies and errors that could compromise the entire ecosystem.

This is where sbomify transforms the landscape. sbomify automates the distribution and collaboration process, integrating directly into the Continuous Integration/Continuous Deployment (CI/CD) workflow to eliminate manual distribution and ad-hoc storage. Instead of relying on scattered email chains and file shares, sbomify ensures that stakeholders always have access to accurate, up-to-date SBOM data. By automating the process, sbomify minimizes manual work and significantly enhances security, reducing the risk of circulating outdated or incorrect information. You can learn more about this in our [SBOM Hub & Trust Center](/features/trust-center/) feature page.

A frequently overlooked but essential step in the SBOM lifecycle is the creation of a consolidated [SBOM hierarchy](/features/sbom-hierarchy/), which is especially valuable in complex software architectures. Take a basic SaaS product, for instance: with an API service running in a Docker container and a JavaScript-based frontend, you’ll quickly accumulate multiple SBOMs—for the backend, the Docker environment, and the JavaScript libraries.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-hierarchy" >}}
</div>

In such setups, merging the JavaScript and backend SBOMs might be feasible, but backend and Docker SBOMs remain distinct (at least in CycloneDX format). To maintain clarity, you can create a parent SBOM that links these individual SBOMs. The consolidation process, whether in CycloneDX or SPDX, often requires either complex scripts or a custom tool. With sbomify, this is built-in.

_If this sounds complex, reach out, and we can automate SBOM hierarchy generation for you._

As the software industry increasingly recognizes the value of SBOMs for security and transparency, the need for efficient, automated collaboration tools becomes critical. Solutions like sbomify address this need by modernizing SBOM workflows and aligning with CISA’s best practices. For organizations aiming to streamline SBOM processes and bolster their cybersecurity, implementing a solution like sbomify is not just beneficial—it’s essential.

---

## Analysis

The final phase in the SBOM lifecycle is the analysis phase. Generally, teams have two primary goals for an SBOM:

- **Security Audit:** Identify all CVEs in a given SBOM.
- **License Audit:** Ensure all software in the SBOM complies with internal policies.

There are many tools available that focus on different problem spaces (many are listed [here](/resources/#analysis)). Two popular open-source tools for SBOM analysis are [Dependency Track](https://dependencytrack.org/) and [guac](https://github.com/guacsec/guac).

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "store-analyze-enrich" >}}
</div>

sbomify aims to be the [SBOM Hub](/features/trust-center/) that not only simplifies sharing SBOMs with stakeholders but also integrates with your existing toolset. For instance, sbomify integrates with [Dependency Track](/features/integrations/#dependency-track) and [OSV](/features/integrations/#osv) for analysis, enabling you to export SBOMs directly to your analysis tools.
