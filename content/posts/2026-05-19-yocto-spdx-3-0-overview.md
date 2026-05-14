---
title: "SPDX 3.0 in Yocto: What Changed and Why It Matters"
description: "Part 3 of the Yocto SBOM series. SPDX 3.0 support arrived in Styhead (Yocto 5.1) with single-document JSON-LD output, first-class Build elements, native VEX support, and richer build provenance features."
author:
  display_name: Joshua Watt
categories:
  - guide
tags: [sbom, yocto, openembedded, spdx, spdx-3, json-ld, embedded-linux]
keywords: [yocto spdx 3.0, create-spdx-3.0 bbclass, spdx json-ld, yocto styhead spdx, build provenance sbom, spdx 3 vex]
tldr: "SPDX 3.0 support landed in Yocto Styhead (5.1) and is a major architectural leap: single-document JSON-LD output instead of tarballs, first-class Build elements with hasInput/hasOutput relationships, profile-based architecture, and native VEX support through the security profile. The trade-off is size — SBOMs can run 250 MB compressed and 2 GB uncompressed."
date: 2026-05-19
slug: yocto-spdx-3-0-overview
---

SPDX 3.0 support was added in the Styhead release (Yocto 5.1) and represents a significant architectural leap. The implementation lives in `create-spdx-3.0.bbclass` with supporting libraries in `meta/lib/oe/spdx30.py` (auto-generated SPDX 3.0 bindings) and `meta/lib/oe/sbom30.py` (SBOM construction utilities).

This is part 3 of a 5-part series on how Yocto generates SBOMs. [Part 1](/2026/05/05/yocto-sbom-deep-dive-introduction/) covered the high-level architecture and [Part 2](/2026/05/12/yocto-spdx-2-2-pipeline/) walked through the SPDX 2.2 pipeline.

## What Changed Architecturally

The most immediately visible difference is the output format: SPDX 3.0 uses JSON-LD (JSON for Linked Data) instead of plain JSON. This makes the documents RDF-compliant, meaning you can load them into any RDF tooling (like Python's `rdflib`) for sophisticated graph queries. The JSON-LD output also conforms to a strict JSON schema, so you do not necessarily need RDF tooling; simpler JSON parsers work just fine for most use cases.

But the deeper changes are structural.

**Single-document output.** Unlike SPDX 2.2's tarball of separate documents, the SPDX 3.0 implementation produces a single JSON-LD document that describes the entire image. This is possible because SPDX 3.0 uses global unique IDs for all objects, which makes the merging algorithm much simpler since it never has to worry about name collisions. The class builds up per-recipe SPDX data during the build, then merges everything into one cohesive document at image time.

**First-class Build objects.** SPDX 2.2 had no concept of a "build." The `create-spdx-2.2` class shoehorned build information into package descriptions. SPDX 3.0 introduces `Build` as a first-class element, with proper `hasInput` and `hasOutput` relationships. This means you can express that a specific build took in some source files as input and produced some packages as output.

**Profile-based architecture.** SPDX 3.0 documents declare which profiles they conform to. The Yocto implementation generates documents conforming to: `core`, `build`, `software`, `simpleLicensing`, and `security`.

**Native VEX support.** This is arguably the biggest win for security-conscious teams. SPDX 3.0 natively supports VEX information through its security profile, meaning CVE data and vulnerability assessments live inside the SBOM rather than in a separate file.

## New Variables and Configuration

```bash
SPDX_VERSION = "3.0.0"
SPDX_PROFILES ?= "core build software simpleLicensing security"

# Build provenance
SPDX_INCLUDE_BUILD_VARIABLES ??= "0"
SPDX_INCLUDE_BITBAKE_PARENT_BUILD ??= "0"
SPDX_INCLUDE_TIMESTAMPS ?= "0"

# VEX control
SPDX_INCLUDE_VEX ??= "current"

# Identity and namespacing
SPDX_UUID_NAMESPACE ??= "sbom.openembedded.org"
SPDX_NAMESPACE_PREFIX ??= "http://spdx.org/spdxdocs"
```

Most of the new variables control build provenance features that are disabled by default because they make the output non-reproducible (build timestamps, variable dumps, and so on). The VEX variable, however, is on by default (set to `current`), which is a deliberate choice to make vulnerability information available out of the box.

## SPDX 3.0 Task Flow

**`spdx30_build_started_handler`** — A BitBake event handler (not a task) that fires at the beginning of the build. If `SPDX_INCLUDE_BITBAKE_PARENT_BUILD` is set, it creates a `Build` element representing the overall BitBake invocation and writes it to `bitbake.spdx.json` in the deploy directory. This is the parent build that individual recipe builds can reference.

**`do_create_spdx`** — Similar in purpose to its SPDX 2.2 counterpart, but the output format and data model are very different. It creates an `ObjSet` (object set), a `software_Package` element for the recipe, a `Build` element representing the recipe's build, links source files as `hasInput` relationships on the `Build`, links produced packages as `hasOutput` relationships on the `Build`, adds license information using the `simpleLicensing` profile, and processes CVE data to create VEX relationship elements. The per-recipe data is written as individual JSON-LD files to the deploy directory.

**`do_create_package_spdx`** — This task replaces `do_create_runtime_spdx` from SPDX 2.2 and creates SPDX data for each individual package, including file-level detail for packaged files with checksums and runtime dependencies.

**`do_create_image_spdx` / `do_create_image_sbom`** — The image-level task merges all per-recipe JSON-LD documents into a single output file. The merging algorithm loads the image recipe's own SPDX data, then for each package included in the image loads its SPDX document and its recipe's SPDX document, merges all objects into a single object set deduplicating by SPDX ID, and serializes the merged object set as a single JSON-LD document. The result is a single `IMAGE-MACHINE.spdx.json` file in `tmp/deploy/images/MACHINE/`.

## Build Provenance Features in SPDX 3.0

**Build Variables** (`SPDX_INCLUDE_BUILD_VARIABLES = "1"`) — Captures every BitBake variable visible during the SPDX task and attaches it to the `Build` element. This is a lot of data, but it means you can determine exactly how a recipe was configured just from the SBOM.

**Nested Builds** (`SPDX_INCLUDE_BITBAKE_PARENT_BUILD = "1"`) — Creates a hierarchy of `Build` elements. The top-level `Build` represents the BitBake invocation, and each recipe's `Build` is linked to it via `ancestorOf`. This is particularly useful for tracking shared state (sstate): you can see which recipes were rebuilt in a given BitBake run versus pulled from cache.

**Agent Tracking:**

```bash
SPDX_INVOKED_BY_name = "GitHub Actions"
SPDX_INVOKED_BY_type = "software"
SPDX_ON_BEHALF_OF_name = "Jane Developer"
SPDX_ON_BEHALF_OF_type = "person"
SPDX_ON_BEHALF_OF_id_email = "jane@example.com"
```

This records that your CI system ran the build on behalf of a specific person. The idea here is that GitHub Actions is the software agent that mechanically ran BitBake, but it was triggered by a pull request or tag made by a specific user.

**Build Host Linking** (`SPDX_BUILD_HOST`) — If you have an SBOM for the host system you are building on, you can link it into the generated documents using the `hasHost` relationship. This gives you a deep supply chain that extends from the build environment itself down through your target image.

**Package Supplier:**

```bash
SPDX_PACKAGE_SUPPLIER_name = "Acme Corporation"
SPDX_PACKAGE_SUPPLIER_type = "organization"
```

All of these provenance features are disabled by default because it is not feasible for the core project to guess the correct values that should be provided. If desired, you should enable the ones relevant to your compliance requirements.

## The Supporting Libraries

**`oe/spdx30.py`** — Auto-generated SPDX 3.0 Python bindings, roughly 6,000 lines of code. These are generated by the `shacl2code` tool from the official SPDX 3.0 RDF model. This means the Yocto implementation automatically stays in sync with the SPDX specification, and other tools can use these same bindings to manipulate SPDX 3.0 documents. `shacl2code` can also generate C++ and Go bindings and is available as a standalone project.

**`oe/sbom30.py`** — SPDX 3.0 SBOM assembly utilities, including the document merging algorithm and convenience methods for creating VEX relationships.

## The Size Question

A compressed SPDX 3.0 document for a standard Styhead distro can be around 250 MB compressed and roughly 2 GB uncompressed. This is largely because the single-document approach includes everything in one place rather than splitting it across many smaller files.

It is easy to generate SPDX 3.0 output that is larger than the deliverable it describes, because compilers are very good at compressing source code into smaller binaries. The SBOM that describes a 50 MB root filesystem might be 500 MB of structured data.

If you are generating a new SBOM with every release build (as you should be for traceability and compliance), you need a storage strategy for these large files.

## Switching Between Versions

```bash
# For SPDX 2.2 (if 3.0 is default)
INHERIT:remove = "create-spdx"
INHERIT += "create-spdx-2.2"

# For SPDX 3.0 (if 2.2 is default)
INHERIT:remove = "create-spdx"
INHERIT += "create-spdx-3.0"
```

SPDX 2.2 has broader tooling support today, while SPDX 3.0 offers richer data and a more future-proof format. However, due to demand, SPDX 3.0 was backported to the Yocto 5.0 (styhead) LTS release, and thus should be available to more users. Additionally, starting with the Yocto 6.0 (wrynose) LTS release, SPDX 2.2 support has been removed so SPDX 3.0 is the only option.

---

**Series: How Yocto Generates SBOMs Behind the Scenes**

- Part 1: [How Yocto Generates SBOMs Behind the Scenes](/2026/05/05/yocto-sbom-deep-dive-introduction/)
- Part 2: [A Deep Dive into Yocto's SPDX 2.2 Pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/)
- Part 3: SPDX 3.0 in Yocto: What Changed and Why It Matters _(this post)_
- Part 4: VEX in the SBOM: How Yocto Embeds Vulnerability Assessments _(coming soon)_
- Part 5: Yocto SBOM in Production: Configuration, Tooling, and What's Still Missing _(coming soon)_
