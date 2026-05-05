---
title: "How Yocto Generates SBOMs Behind the Scenes: A Deep Dive into SPDX 2.2 and SPDX 3.0"
description: "Yocto generates SBOMs during the build itself, not after. Part 1 of a 5-part series on how the Yocto Project builds SPDX 2.2 and SPDX 3.0 SBOMs from BitBake metadata, with first-class VEX support."
author:
  display_name: Joshua Watt
categories:
  - guide
tags: [sbom, yocto, openembedded, spdx, bitbake, embedded-linux]
keywords: [yocto sbom, yocto spdx, openembedded sbom, bitbake spdx, build-time sbom generation, embedded linux sbom]
tldr: "Most SBOM tools scan finished artifacts. Yocto's create-spdx class takes a different approach: it generates SBOMs during the build itself, with full access to BitBake's recipe metadata, source URIs, patches, and packaging information. This 5-part series walks through how the SPDX 2.2 and SPDX 3.0 pipelines work in OpenEmbedded-Core."
date: 2026-05-05
slug: yocto-sbom-deep-dive-introduction
---

If you are building embedded Linux products with the Yocto Project, you are sitting on one of the most mature and sophisticated SBOM generation pipelines in the industry, and you might not even know it. While most SBOM tools bolt onto your build system as an afterthought, Yocto's approach is fundamentally different: it generates SBOMs during the build itself, using the same metadata that drives compilation.

In this post, we will take a detailed look at exactly what happens when Yocto creates an SBOM, from the moment BitBake parses a recipe to the final JSON document sitting in your deploy directory. We will cover both the established SPDX 2.2 pipeline and the newer SPDX 3.0 implementation introduced in the Styhead release, examining the key BitBake classes, tasks, and data flows that make it all work. We will also dig into how VEX (Vulnerability Exploitability eXchange) data is generated and embedded in the SBOM output, which is one of the most practically useful features of the SPDX 3.0 implementation.

## The Foundation: Why Build-Time SBOM Generation Matters

Before we dig into the mechanics, it is worth understanding what differentiates Yocto's approach from more common post-build scanning tools.

Most SBOM generators work by analyzing a finished artifact, whether that means scanning a container image or inspecting a filesystem. These tools are essentially doing forensic analysis, trying to reconstruct what went into a build after the fact. While these tools have their advantages, especially in the case where the original build information is no longer present, a downside is that information is inevitably lost when a build system transforms source code into final artifacts. A scanner looking at a root filesystem may have no reliable way to determine exactly which version of a source tarball was fetched, which patches were applied, what configure flags were set, or which build dependencies were present.

Yocto's `create-spdx` class takes a fundamentally different approach. Because it runs as a part of the build system, it has access to all of BitBake's metadata: the recipe variables, the fetched source URIs, the applied patches, the license information extracted during `do_populate_lic`, and the exact list of files that were packaged. The SBOM is not reconstructed from artifacts; it is made from observations as a direct byproduct of the build.

The core question SBOMs are trying to answer is: can we trace the binary deliverables back to the source code that produced them? When your SBOM generator is embedded in the build system, it can be much easier to answer yes to this question.

## The High-Level Architecture

At a conceptual level, the Yocto SBOM pipeline works in two phases:

1. **Per-recipe SPDX generation**: As each recipe is built, additional BitBake tasks run that emit SPDX data describing that recipe: its source origins, license information, packages produced, and files contained.
2. **Image-level aggregation**: When an image recipe (like `core-image-minimal`) is built, all the per-recipe SPDX documents are collected and combined into a final deliverable that describes the complete image.

This two-phase approach maps naturally to how BitBake works. Each recipe is already an isolated unit of work with well-defined inputs and outputs. The SPDX tasks simply capture this information in a structured format before the image task merges everything together.

## Enabling SBOM Generation

In modern Yocto (Scarthgap and later), SPDX generation is enabled by default through `INHERIT_DISTRO`. The `create-spdx` class is inherited globally, meaning every recipe in your build automatically gets SPDX tasks added to its task graph and SPDX documents will be produced for images.

For older releases (pre-Scarthgap), you needed to explicitly opt in:

```bash
# In conf/local.conf
INHERIT += "create-spdx"
```

To disable it on a modern release:

```bash
INHERIT_DISTRO:remove = "create-spdx"
```

The class that actually gets inherited depends on which SPDX version you are targeting. In practice, there are two separate implementations:

- `create-spdx-2.2.bbclass` for producing SPDX 2.2 JSON
- `create-spdx-3.0.bbclass` for producing SPDX 3.0 JSON-LD

Both inherit a shared base class, `spdx-common.bbclass`, which contains logic common to both versions (like source archiving and shared variable definitions).

## Why This Matters Now

Regulatory pressure around software supply chain transparency is intensifying. The EU [Cyber Resilience Act](/cra/) requires SBOM documentation for products placed on the EU market. The U.S. Executive Order on Improving the Nation's Cybersecurity established SBOM requirements for software sold to federal agencies. Industry standards bodies and procurement teams are following suit.

In this environment, the quality of your SBOM matters. A post-build scanner that guesses at patch history is a different artifact than a build-integrated pipeline that recorded every source fetch, patch application, and package assembly as it happened.

Yocto's approach was designed for exactly this level of fidelity. The next posts in this series will go deeper into how it works: the SPDX 2.2 pipeline, the newer SPDX 3.0 implementation, and how vulnerability assessment data (VEX) gets embedded directly into your SBOM output.

---

**Series: How Yocto Generates SBOMs Behind the Scenes**

- Part 1: How Yocto Generates SBOMs Behind the Scenes _(this post)_
- Part 2: [A Deep Dive into Yocto's SPDX 2.2 Pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/)
- Part 3: [SPDX 3.0 in Yocto: What Changed and Why It Matters](/2026/05/19/yocto-spdx-3-0-overview/)
- Part 4: [VEX in the SBOM: How Yocto Embeds Vulnerability Assessments](/2026/05/26/yocto-vex-spdx-3-0/)
- Part 5: [Yocto SBOM in Production: Configuration, Tooling, and What's Still Missing](/2026/06/02/yocto-sbom-production-config/)
