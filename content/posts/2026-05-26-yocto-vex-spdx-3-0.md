---
title: "VEX in the SBOM: How Yocto Embeds Vulnerability Assessments with SPDX 3.0"
description: "Part 4 of the Yocto SBOM series. How vulnerability information flows from CVE_STATUS recipe metadata into VEX relationship elements in the final SPDX 3.0 SBOM, and the kernel-specific tooling that cuts CVE false positives by 70-80%."
author:
  display_name: Joshua Watt
categories:
  - guide
tags: [sbom, yocto, openembedded, spdx, spdx-3, vex, cve, vulnerability-management]
keywords: [yocto vex, spdx 3 vex, yocto cve, cve_status yocto, kernel cve false positives, vex sbom embedded]
tldr: "SPDX 3.0's security profile lets Yocto embed VEX assessments directly inside the SBOM. CVE data flows from CVE_STATUS recipe metadata, patch file scanning, and upstream version checks into VexFixedVulnAssessmentRelationship, VexAffectedVulnAssessmentRelationship, and VexNotAffectedVulnAssessmentRelationship elements. Kernel CVE noise is reduced 70-80% by cross-referencing the kernel CNA database with compiled source files."
date: 2026-05-26
slug: yocto-vex-spdx-3-0
---

VEX support is one of the most compelling reasons to adopt SPDX 3.0 for your Yocto builds. This post traces exactly how vulnerability information flows from recipe metadata into VEX statements in the final SBOM.

This is part 4 of a 5-part series on how Yocto generates SBOMs. Earlier parts covered the [overall architecture](/2026/05/05/yocto-sbom-deep-dive-introduction/), the [SPDX 2.2 pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/), and the [SPDX 3.0 implementation](/2026/05/19/yocto-spdx-3-0-overview/) that makes embedded VEX possible.

## The CVE Infrastructure That Feeds VEX

Before getting to the SPDX output, it helps to understand the CVE infrastructure that Yocto already maintains. The `cve-check` class and its associated tooling track CVEs using several key variables.

**`CVE_PRODUCT`** — Maps a recipe to its identifier in the CVE database. Defaults to `BPN` but can be overridden per recipe (for example, `tiff.bb` sets `CVE_PRODUCT = "libtiff"`).

**`CVE_VERSION`** — The version string used for CVE matching. Defaults to `PV`.

**`CVE_STATUS`** — A per-CVE variable flag that records the status of individual CVEs for a recipe. Each flag entry encodes a status mapping, a detail string, and an optional description:

```bash
CVE_STATUS[CVE-2023-50495] = "backported-patch: Fix applied in our layer"
CVE_STATUS[CVE-2022-12345] = "not-applicable-config: Feature not enabled in our build"
```

The `cve-check` class also automatically detects CVEs that have been fixed in the upstream version being used, marking them as `fixed-version`. Additionally, patched CVEs are detected by scanning the recipe's patch files — BitBake looks for CVE identifiers in patch filenames and headers (using the `CVE:` tag in patch metadata) and the `get_patched_cves()` function collects these automatically.

## How the SPDX 3.0 Class Processes CVE Data

During `do_create_spdx`, the SPDX 3.0 class performs the following steps to generate VEX data.

### Step 1: Check the VEX inclusion level

The `SPDX_INCLUDE_VEX` variable controls how much CVE data to include:

| Value                 | Behavior                                                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`                | Skip all VEX processing entirely. Useful if you do not care about vulnerability data in the SBOM and want faster builds.                                                                       |
| `current` _(default)_ | Only include VEX data for CVEs that are not already fixed by the upstream version. This is the recommended setting because it surfaces only the CVEs that are actually relevant to your build. |
| `all`                 | Include every known CVE, including those already fixed upstream. This generates significantly more data, particularly for the Linux kernel, which has thousands of historical CVEs.            |

### Step 2: Collect patched CVEs

The class calls `oe.cve_check.get_patched_cves(d)`, which scans the recipe's patch files for CVE references. Each patch file is checked for CVE identifiers in its filename and metadata. The result is a set of CVE IDs that have been addressed by patches applied in the recipe.

### Step 3: Decode CVE status

For each CVE, the class calls `oe.cve_check.decode_cve_status()` to extract the mapping (`Patched`, `Unpatched`, or `Ignored`), the detail string, and the description. For CVEs detected from patch files that do not have an explicit `CVE_STATUS` entry, the code falls back to a status of `Patched` with detail `fix-file-included`.

### Step 4: Create SPDX Vulnerability and VEX elements

For each CVE, the class creates a `security_Vulnerability` element with a unique SPDX ID based on the CVE identifier, and a VEX relationship element linking the vulnerability to the affected package:

```python
if status == "Patched":
    pkg_objset.new_vex_patched_relationship([spdx_cve._id], [spdx_package])
elif status == "Unpatched":
    pkg_objset.new_vex_unpatched_relationship([spdx_cve._id], [spdx_package])
elif status == "Ignored":
    spdx_vex = pkg_objset.new_vex_ignored_relationship(
        [spdx_cve._id], [spdx_package]
    )
```

These correspond to the SPDX 3.0 security profile's `VexVulnAssessmentRelationship` subtypes:

| Status      | SPDX 3.0 Type                              | Meaning                                                     |
| ----------- | ------------------------------------------ | ----------------------------------------------------------- |
| `Patched`   | `VexFixedVulnAssessmentRelationship`       | The vulnerability has been patched in this package          |
| `Unpatched` | `VexAffectedVulnAssessmentRelationship`    | The vulnerability is unpatched and this package is affected |
| `Ignored`   | `VexNotAffectedVulnAssessmentRelationship` | The vulnerability was evaluated and determined not to apply |

Each VEX relationship carries the detail string and the human-readable description, giving downstream consumers the context they need to understand why a CVE has a particular status.

## The Kernel: A Special Case for VEX

The Linux kernel deserves special mention because it is by far the largest source of CVEs in any embedded Linux system. The kernel has its own CVE numbering authority (CNA), and the volume of CVEs is enormous.

Yocto has a dedicated script, `improve_kernel_cve_report.py`, that enriches kernel CVE data using two techniques.

It cross-references the Linux kernel CNA's vulnerability database (from `git.kernel.org`) to determine which CVEs affect specific kernel versions. And if SPDX source information is available (via `SPDX_INCLUDE_SOURCES` or `SPDX_INCLUDE_COMPILED_SOURCES`), it can check which source files were actually compiled into the kernel binary. A CVE that affects `drivers/mtd/nand/spi/core.c` is irrelevant if that file was never compiled due to kernel configuration. This technique alone can reduce kernel CVE false positives by 70–80%.

To use this with the SPDX-based approach, you need to enable DWARF4 debug information in the kernel so BitBake can extract the list of compiled source files:

```bash
KERNEL_EXTRA_FEATURES:append = " features/debug/debug-kernel.scc"
```

The output of this script feeds back into the CVE status data, which in turn flows into the VEX elements in the SPDX 3.0 output. This creates a tight loop where kernel configuration directly influences the vulnerability assessment in the SBOM.

## VEX in Practice: What Shows Up in the Output

In the final SPDX 3.0 document, a patched CVE might appear as:

```json
{
  "@type": "security_VexFixedVulnAssessmentRelationship",
  "security_vexVersion": "...",
  "from": "urn:spdx:...:vulnerability-CVE-2023-50495",
  "to": ["urn:spdx:...:package-ncurses"],
  "relationshipType": "fixedIn",
  "security_assessedElement": "urn:spdx:...:package-ncurses"
}
```

And the corresponding vulnerability element:

```json
{
  "@type": "security_Vulnerability",
  "@id": "urn:spdx:...:vulnerability-CVE-2023-50495",
  "name": "CVE-2023-50495",
  "externalIdentifier": [{
    "externalIdentifierType": "cve",
    "identifier": "CVE-2023-50495"
  }]
}
```

This means that any tool capable of reading SPDX 3.0 can extract a complete picture of which CVEs affect your image, which have been patched, and which have been assessed and dismissed — all from a single document.

## Contrast: VEX in SPDX 2.2 vs. SPDX 3.0

With SPDX 2.2, you get an SBOM that describes your software components, but vulnerability information must live elsewhere. You would typically run `cve-check` separately to produce a `cve-summary.json` file, and then correlate the two documents manually or with external tooling. There is no standard mechanism to embed VEX assessments in the SBOM itself.

With SPDX 3.0, vulnerability assessments are first-class citizens in the SBOM. The security profile provides typed elements for vulnerabilities and VEX relationships, and the Yocto implementation populates these automatically from the same `CVE_STATUS` data that `cve-check` uses. The result is a single document that answers both "what is in my image?" and "which CVEs affect it, and what is their status?"

For teams subject to regulatory requirements like the [EU Cyber Resilience Act](/cra/), having integrated VEX data in the SBOM significantly simplifies compliance workflows.

---

**Series: How Yocto Generates SBOMs Behind the Scenes**

- Part 1: [How Yocto Generates SBOMs Behind the Scenes](/2026/05/05/yocto-sbom-deep-dive-introduction/)
- Part 2: [A Deep Dive into Yocto's SPDX 2.2 Pipeline](/2026/05/12/yocto-spdx-2-2-pipeline/)
- Part 3: [SPDX 3.0 in Yocto: What Changed and Why It Matters](/2026/05/19/yocto-spdx-3-0-overview/)
- Part 4: VEX in the SBOM: How Yocto Embeds Vulnerability Assessments _(this post)_
- Part 5: [Yocto SBOM in Production: Configuration, Tooling, and What's Still Missing](/2026/06/02/yocto-sbom-production-config/)
