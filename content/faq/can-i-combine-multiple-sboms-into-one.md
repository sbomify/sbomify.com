---
title: "Can I combine multiple SBOMs into one?"
description: "Why merging multiple SBOMs into a single file loses context, and how to link them together instead using sbomify's hierarchy."
answer: "You can technically merge SBOMs, but it should generally be avoided because you lose the ability to tell where a particular component comes from. Use sbomify's hierarchy to link multiple SBOMs together instead."
tldr: "You can technically merge SBOMs, but it should generally be avoided because you lose the ability to tell where a particular component comes from. Use sbomify's hierarchy to link multiple SBOMs together instead."
weight: 36
keywords: [merge SBOMs, combine SBOMs, SBOM merging, multiple SBOMs, SBOM hierarchy, SBOM deduplication]
url: /faq/can-i-combine-multiple-sboms-into-one/
---

## The short answer

You can, but you probably shouldn't. Merging multiple SBOMs into a single flat file loses important context about where components come from.

## Why merging is problematic

Consider a product with a Python backend and a Node frontend, each with its own SBOM. If you merge them into one file:

- **Origin is lost** - you can no longer tell whether a dependency belongs to the backend or the frontend
- **Deduplication destroys information** - if both SBOMs contain `pkg:pypi/requests@2.31.0`, a naive merge deduplicates it into one entry, but maybe only the backend actually uses it
- **Vulnerability triage becomes harder** - when a CVE hits a component, you need to know which service is affected, not just that the component exists somewhere in your product
- **Versioning breaks down** - your backend and frontend ship on different release cadences, but a merged SBOM has a single version

## What about SPDX 3 and CycloneDX 2?

The next generation of both formats (SPDX 3.0 and CycloneDX 2.0) do support linking multiple documents together without losing context. They allow referencing external SBOM documents while preserving the relationship between components and their source. However, this is significantly more complex than simply concatenating files, and tooling support is still maturing.

## Our recommendation: link, don't merge

Instead of merging SBOMs, use sbomify's [hierarchy](/faq/how-do-products-work-in-sbomify/) to link them together:

- Each repository gets its own **component** with its own SBOM
- Components are grouped into **projects** (e.g. "Backend", "Frontend")
- Projects roll up into **products** (e.g. "My App")
- **Releases** snapshot specific SBOM versions across the product

This preserves full context - you always know which component a dependency belongs to, which project it's part of, and which product release it shipped in. Customers and auditors can drill down to any level of detail, and you can share the full product SBOM or individual component SBOMs as needed.

## Further reading

- [How do products work in sbomify?](/faq/how-do-products-work-in-sbomify/) - the full hierarchy explained
- [SBOM Hierarchy feature page](/features/sbom-hierarchy/)
