---
title: "How do products work in sbomify?"
description: "Understand sbomify's hierarchy of components, products, and releases for organizing and managing SBOMs across your software portfolio."
answer: "sbomify organizes SBOMs using a hierarchy: components hold individual SBOMs (usually one per repository), products group related components and represent what you sell or distribute, and releases version your products."
tldr: "sbomify organizes SBOMs using a hierarchy: components hold individual SBOMs (usually one per repository), products group related components and represent what you sell or distribute, and releases version your products."
weight: 75
keywords: [sbomify products, SBOM hierarchy, components, releases, SBOM management]
url: /faq/how-do-products-work-in-sbomify/
---

## The hierarchy

sbomify uses a tree-like structure to organize your SBOMs in a way that reflects how your software is actually built:

**Components → Products → Releases**

Unlike tools that flatten everything into a single SBOM file (losing critical context like where an affected component lives), sbomify leverages CycloneDX and SPDX to link multiple SBOMs into a nested structure.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-hierarchy" >}}
</div>

### Components

Components are the foundation. Each component usually maps to a single repository (e.g., a GitHub repository) and holds the actual SBOMs as well as compliance documents and other artifacts. SBOMs are uploaded to components and versioned here.

Note that the component SBOM version is different from the product version - a component may have many SBOM versions uploaded over time as its dependencies change, independent of product releases.

### Products

A product represents the thing you actually sell or distribute. A product groups one or more components directly. For example, a "Smart Thermostat" product might attach backend, IoT, and compliance components — Python SBOM, Node SBOM, Docker SBOM, Yocto SBOM, SOC 2 Type II, CE Certificate — all under the one product.

### Releases

A product can have releases. A release is a versioned snapshot that points to specific component SBOM versions. When you create a new release, your old SBOMs remain unchanged - giving you an accurate history of what was in each version.

Because sbomify uses linkage rather than copying, multiple products (or versions of a product) can reuse the same component SBOMs without duplication.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-releases" >}}
</div>

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/product_creation.webm" title="Creating components and products in sbomify" description="Walkthrough of setting up the sbomify hierarchy: creating components and attaching them to a product." >}}

## Sharing and exporting

You can export and share SBOMs at any level of the hierarchy - a single component or the entire product. This is useful when different stakeholders need different levels of detail. For example, an internal team might need just one component's SBOM, while a customer or auditor needs the full product SBOM.

Products and their SBOMs can be shared publicly through your [Trust Center](/faq/what-is-a-trust-center/) (available on Business and Enterprise plans).

## Further reading

- [SBOM Hierarchy feature page](/features/sbom-hierarchy/)
- [Share and Collaborate](/share-and-collaborate/)
- [Screenly case study](/case-studies/screenly/) - a real-world example of the hierarchy in production
