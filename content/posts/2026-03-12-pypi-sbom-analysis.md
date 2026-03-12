---
title: "SBOM Adoption on PyPI Is at 1.58%. We Can Do Better."
description: "We scanned 15,021 of the most popular Python packages for PEP 770 SBOMs. Only 1.58% include one, and every single SBOM is CycloneDX. Here are the full results."
author:
  display_name: Viktor Petersson
date: 2026-03-12
slug: pypi-sbom-analysis
categories:
  - education
tags: [sbom, python, pep-770, cyclonedx, pypi, tea, transparency-exchange-api]
keywords: [pypi sbom adoption, python sbom analysis, pep 770 adoption, cyclonedx python, transparency exchange api]
tldr: "We analyzed 15k+ of the top Python packages on PyPI for SBOM adoption. Only 238 packages (1.58%) ship with SBOMs, all CycloneDX, zero SPDX. Most use older CycloneDX versions (1.4/1.5). We also found 37 invalid SBOMs, all traced to the same cargo-cyclonedx bug. The analysis was powered by PyPI-TEA, our open-source PEP 770 to TEA bridge."
---

This wasn't a research project. We were building [TEA](/2026/03/01/why-were-bullish-on-tea/) support into [sbomify-action](https://github.com/sbomify/sbomify-action) and wanted a way to pull in real SBOM data from a package ecosystem. We chose PyPI because [PEP 770](/2026/03/05/pep-770-sboms-in-python-packages/) gives it a standardized location for SBOMs, making it the ideal candidate.

## What is PyPI-TEA?

The result is [PyPI-TEA](https://github.com/sbomify/pypi-tea), a bridge between PyPI and the [Transparency Exchange API](https://transparency.dev/). You give it a PyPI [PURL](https://github.com/package-url/purl-spec), it fetches the corresponding wheel, checks the `.dist-info/sboms/` directory (per PEP 770), and returns the SBOM link and hash via the TEA API format. In practice, it acts as a caching proxy with data transformation: translating PyPI's package-embedded SBOMs into a format that any TEA-compatible client can consume. You can try it out on the [live instance](https://pypi.sbomify.com).

## How sbomify-action Uses It

When [sbomify-action](https://github.com/sbomify/sbomify-action) encounters a PyPI PURL in your dependency list, it queries PyPI-TEA. If a PEP 770 SBOM exists for that package, it's included as an external reference in the generated SBOM. You can follow the implementation in [this pull request](https://github.com/sbomify/sbomify-action/pull/186).

The vision is bigger than Python: do this for every binary package ecosystem, so you can traverse from a top-level SBOM all the way down to source-level SBOMs across every dependency.

## The Research

When we shared PyPI-TEA with [Seth Larson](https://www.linkedin.com/in/sethmlarson/) (the author of PEP 770), he asked if we had data on adoption. We didn't, but we had all the tooling to get it.

We pulled the [top PyPI packages list](https://hugovk.github.io/top-pypi-packages/) and analyzed the latest x86 wheels for the top 15,000 packages. A quick note on terminology: a _package_ is a project on PyPI (e.g. `cryptography`), while a _wheel_ is a specific build artifact for that package, often per platform and Python version. A single package can publish dozens of wheels per release. For each package, PyPI-TEA fetched the wheel, inspected the `.dist-info/sboms/` directory, validated any SBOMs found, and recorded the results.

Live stats are available at [pypi.sbomify.com/stats](https://pypi.sbomify.com/stats).

## Results

Here's the headline:

| Metric               | Count          | Percentage |
| -------------------- | -------------- | ---------- |
| Packages with SBOMs  | 238 / 15,021   | 1.58%      |
| Wheels with SBOMs    | 5,679 / 67,151 | 8.46%      |
| SBOM format          | CycloneDX JSON | 100%       |
| SPDX SBOMs found     | 0              | 0%         |
| CycloneDX 1.5 wheels | 1,194          |            |
| CycloneDX 1.4 wheels | 311            |            |
| CycloneDX 1.6 wheels | 1              |            |
| Valid SBOMs          | 1,469          | 97.5%      |
| Invalid SBOMs        | 37             | 2.5%       |

![PyPI SBOM adoption statistics](/assets/images/d2/pypi-sbom-stats.svg)

## Noteworthy Observations

- **Not a single SPDX SBOM was found.** Every SBOM across all 15,021 packages is CycloneDX JSON. Whether this reflects tooling maturity, community preference, or both, it's a striking result.
- **Most packages use older CycloneDX versions.** The overwhelming majority ship CycloneDX 1.4 or 1.5 SBOMs. The sole CycloneDX 1.6 SBOM comes from an sbomify package.
- **37 invalid SBOMs, all from the same bug.** Every invalid SBOM we found traces back to the same [cargo-cyclonedx bug](https://github.com/CycloneDX/cyclonedx-rust-cargo/issues/803). This is a known issue in the Rust CycloneDX tooling. The SBOMs fail schema validation but the underlying data is otherwise reasonable.
- **Wheel-level adoption is higher than package-level.** 8.46% of wheels have SBOMs vs. 1.58% of packages. This makes sense: packages that ship SBOMs tend to produce multiple platform-specific wheels, each containing its own SBOM.

## A Call to Arms for PyPI Package Maintainers

1.58% is not good enough. The Python ecosystem can do better, and the tooling is already there.

If you maintain a package on PyPI, adding a PEP 770 SBOM is less than 10 lines of configuration, runs in CI, and takes under 5 minutes. Our [PEP 770 guide](/2026/03/05/pep-770-sboms-in-python-packages/) walks through the entire process.

sbomify is here to help. [sbomify-action](https://github.com/sbomify/sbomify-action) generates and uploads SBOMs as part of your CI pipeline, and [sbomify](https://sbomify.com) is **free for open source projects**. Let's change these numbers together.
