---
layout: page
permalink: /guides/how-to-version-sboms
title: How to version SBOMs
---

## Introduction

Depending on the type of software you are producing, versioning may or may not be straightforward. The gold standard for versioning is [Semantic Versioning](https://semver.org/). This approach works well for software that is released on a steady cadence (e.g., every month or even every few days). However, this model doesn't work as effectively for software delivered as a service, or anything with rolling releases. Many tech companies deploy new versions to production numerous times per day, and in this case, using a Semantic Versioning model creates a lot of friction.

Since SBOMs are directly related to software releases, the way you version and/or deploy your software will determine how you version your SBOM.

Both CycloneDX and SPDX recognize that the way you version your software is highly customized, and neither enforces any specific versioning scheme. Instead, they treat version identifiers as a text string. For clarity, when we discuss versioning, we are referring to the top-level component version.

## Best Practices

One of the most authoritative documents on versioning SBOMs is CISA's [Framing Software Component Transparency: Establishing a Common Software Bill of Materials (SBOM)](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf). The document states the following about versioning:

_"The Version is a supplier-defined identifier that specifies an update change in the software from a previously identified version. This Attribute helps to further identify a Component and should be separate from the Component Name. As there is a wide range of versioning schemes in use, recording what is provided from the Supplier accurately is the primary goal. Semantic versioning is preferred._

_If the Component does not have a unique semantic version available to declare, make sure that a cryptographic hash is provided for the Component. Be aware that this will not indicate the relative release of the Component to its predecessors and successors. As a minimum expectation, declare the version string as provided by the Supplier."_

In short, they recommend using Semantic Versioning whenever possible. If you are creating your SBOMs in GitHub, you are likely using [git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging) to manage releases. As such, you can leverage these for SBOM versioning automatically. For instance, if you are using our [GitHub Actions Module](https://github.com/sbomify/github-action), you can set `SBOM_VERSION` to {% raw %}`${{ github.ref_name }}`{% endraw %}, which will then automatically populate the corresponding version you created.

However, if you are not using Semantic Versioning, the document advises using a "cryptographic hash." Assuming your source code lives in a `git` repository, you can automatically derive a hash from there. If you are not using GitHub, you can use `git rev-parse HEAD` to get this. If you are using GitHub Actions (perhaps together with our GitHub Actions Module), you can then use {% raw %}`${{ github.sha }}`{% endraw %} as a shorthand for this.

## When to Release SBOMs

The timing largely depends on when you are releasing your software. For instance, if you are using git tags for releases, this is likely when you want to trigger SBOM generation.

If you are using rolling releases, you may want to limit SBOM generation to production deployments. How you do this will vary greatly depending on your internal organization. In some cases, production corresponds to a specific git branch, while in other organizations, you "promote" what is in your staging environment to production.

Regardless of whether this is a merge from one branch to another or a build/release promotion, this is the point at which you want to generate the SBOM.

## Conclusion

If you're building SBOMs, please consider leveraging Semantic Versioning and git tags. This approach will help ensure that your SBOM is accurate and reproducible.
