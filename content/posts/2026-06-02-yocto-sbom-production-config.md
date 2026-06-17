---
title: "Yocto SBOM in Production: Configuration, Tooling, and What's Still Missing"
description: "Part 5 of the Yocto SBOM series. A recommended production configuration, standalone CLI tooling for working with SPDX 3.0 documents (spdx3query, spdx3merge, spdx3validate), and the gaps that still need filling — like layer information and kernel config mapping."
author:
  display_name: Joshua Watt
categories:
  - guide
tags: [sbom, yocto, openembedded, spdx, spdx-3, production, tooling]
keywords: [yocto sbom production config, spdx3query, spdx3merge, spdx3validate, yocto sbom tooling, cyclonedx yocto]
tldr: "A recommended Yocto production SBOM configuration that enables source traceability, package supplier info, and current-only VEX. SPDX 3.0 has standalone tooling — spdx3query, spdx3merge, spdx3validate — installable via pip. OE-Core only generates SPDX (CycloneDX comes from external layers). Layer information and kernel config mapping are still gaps in the SBOM today."
date: 2026-06-02
slug: yocto-sbom-production-config
---

This is the final post in a 5-part series on how Yocto generates SBOMs. Earlier parts walked through the [overall architecture](/2026/05/05/yocto-sbom-deep-dive-introduction/), the [SPDX 2.2 pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/), the [SPDX 3.0 implementation](/2026/05/19/yocto-spdx-3-0-overview/), and [how VEX data gets embedded](/2026/05/26/yocto-vex-spdx-3-0/). This post pulls everything together with a production-ready configuration, the tooling I have written for working with SPDX 3.0 documents, and a frank look at what is still missing.

## A Recommended Production Configuration

```bash
# In your distro conf or local.conf

# Enable human-readable output (useful for debugging)
SPDX_PRETTY = "1"

# Include source file information for deep traceability
SPDX_INCLUDE_SOURCES = "1"

# Archive packaged files alongside the SBOM
SPDX_ARCHIVE_PACKAGED = "1"

# Set proper namespacing for distributed documents
SPDX_NAMESPACE_PREFIX = "https://spdx.mycompany.com"
SPDX_UUID_NAMESPACE = "my-product-v2"

# Set package supplier information
SPDX_PACKAGE_SUPPLIER_name = "My Company"
SPDX_PACKAGE_SUPPLIER_type = "organization"

# VEX: include only currently relevant CVEs (this is the default)
SPDX_INCLUDE_VEX = "current"
```

## Choosing Between SPDX 2.2 and 3.0

```bash
# For SPDX 2.2 (if 3.0 is default)
INHERIT:remove = "create-spdx"
INHERIT += "create-spdx-2.2"

# For SPDX 3.0 (if 2.2 is default)
INHERIT:remove = "create-spdx"
INHERIT += "create-spdx-3.0"
```

SPDX 2.2 has broader tooling support today, while SPDX 3.0 offers richer data and a more future-proof format. For vulnerability management specifically, SPDX 3.0's native VEX support is a significant advantage, since you no longer need a separate file and separate correlation step to connect your vulnerability assessments to your SBOM.

There are no plans to backport SPDX 3.0 support to older Yocto releases. The implementation is invasive and touches many parts of the build system.

## Useful Tools

I have written several standalone tools for working with SPDX 3.0 documents.

**`spdx3query`** — An interactive browser for navigating and querying SPDX 3.0 documents. You can do things like "show me all downstream packages affected by a file with this SHA-1 hash."

**`spdx3merge`** — Merges multiple SPDX 3.0 documents together. It implements the same merging algorithm that Yocto uses internally.

**`spdx3validate`** — Validates both the JSON schema structure and the RDF semantics of an SPDX 3.0 document.

All of these are installable via `pip` and work as standalone command-line tools. Part of the reason I wrote them was to demonstrate that simple, standalone SBOM tools are possible. A lot of SBOM tooling these days is big websites with front-ends and databases, and I just do not want to spin up all of that just to look at a document.

## No CycloneDX in OE-Core

It is worth noting that there are no plans to support CycloneDX in OE-Core. We only generate SPDX from the core build system. There are external layers (like one from Savoir-faire Linux) that generate CycloneDX if you need that format, but the core project focuses on SPDX.

## What Is Not in the SBOM Yet

**Layer information.** The Yocto layers and their Git revisions that contributed to the build are not currently recorded in the SBOM. This would be valuable, and it is not impossible to add, but it is surprisingly difficult to capture reliably. Someone would need to sit down and really think about the best way to do that.

**Kernel configuration mapping.** Some vulnerability scanners use kernel configuration options (`CONFIG_*`) to filter CVE false positives. Standard SPDX does not capture this directly, though SPDX 3.0's extensibility model could potentially be used for it. The `improve_kernel_cve_report.py` script handles this at analysis time using SPDX source data, but the kernel config itself is not embedded as structured SBOM data.

---

**Series: How Yocto Generates SBOMs Behind the Scenes**

- Part 1: [How Yocto Generates SBOMs Behind the Scenes](/2026/05/05/yocto-sbom-deep-dive-introduction/)
- Part 2: [A Deep Dive into Yocto's SPDX 2.2 Pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/)
- Part 3: [SPDX 3.0 in Yocto: What Changed and Why It Matters](/2026/05/19/yocto-spdx-3-0-overview/)
- Part 4: [VEX in the SBOM: How Yocto Embeds Vulnerability Assessments](/2026/05/26/yocto-vex-spdx-3-0/)
- Part 5: Yocto SBOM in Production: Configuration, Tooling, and What's Still Missing _(this post)_
