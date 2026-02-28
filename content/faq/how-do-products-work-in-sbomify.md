---
title: "How do products work in sbomify?"
description: "Understand sbomify's hierarchy of components, projects, products, and releases for organizing and managing SBOMs across your software portfolio."
answer: "sbomify organizes SBOMs using a hierarchy: components hold individual SBOMs (usually one per repository), projects group related components, products represent what you sell or distribute, and releases version your products."
tldr: "sbomify organizes SBOMs using a hierarchy: components hold individual SBOMs (usually one per repository), projects group related components, products represent what you sell or distribute, and releases version your products."
weight: 75
keywords: [sbomify products, SBOM hierarchy, components, projects, releases, SBOM management]
url: /faq/how-do-products-work-in-sbomify/
---

## The hierarchy

sbomify uses a tree-like structure to organize your SBOMs in a way that reflects how your software is actually built:

**Components → Projects → Products → Releases**

Unlike tools that flatten everything into a single SBOM file (losing critical context like where an affected component lives), sbomify leverages CycloneDX and SPDX to link multiple SBOMs into a nested structure.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-hierarchy" >}}
</div>

### Components

Components are the foundation. Each component usually maps to a single repository (e.g., a GitHub repository) and holds the actual SBOMs as well as compliance documents and other artifacts. SBOMs are uploaded to components and versioned here.

Note that the component SBOM version is different from the product version - a component may have many SBOM versions uploaded over time as its dependencies change, independent of product releases.

### Projects

Projects are logical groupings of one or more components. For example, a "Backend" project might contain a Python SBOM, a Node SBOM, and a Docker SBOM - all the components that make up that service.

### Products

A product represents the thing you actually sell or distribute. A product contains one or more projects. For example, a "Smart Thermostat" product might have a "Backend" project and an "IoT Device" project.

### Releases

A product can have releases. A release is a versioned snapshot that points to specific component SBOM versions. When you create a new release, your old SBOMs remain unchanged - giving you an accurate history of what was in each version.

Because sbomify uses linkage rather than copying, multiple products (or versions of a product) can reuse the same component SBOMs without duplication.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-releases" >}}
</div>

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/product_creation.webm" title="Creating components, projects, and products in sbomify" description="Walkthrough of setting up the sbomify hierarchy: creating components, grouping them into projects, and assembling a product." >}}

## Sharing and exporting

You can export and share SBOMs at any level of the hierarchy - a single component, a project, or the entire product. This is useful when different stakeholders need different levels of detail. For example, an internal team might need just one component's SBOM, while a customer or auditor needs the full product SBOM.

Products and their SBOMs can be shared publicly through your [Trust Center](/faq/what-is-a-trust-center/) (available on Business and Enterprise plans).

## Further reading

- [SBOM Hierarchy feature page](/features/sbom-hierarchy/)
- [Share and Collaborate](/share-and-collaborate/)
- [Screenly case study](/case-studies/screenly/) - a real-world example of the hierarchy in production
