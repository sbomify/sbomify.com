---
title: "PEP 770: SBOMs Are Now a First-Class Citizen in Python Packages"
description: "Python's PEP 770 standardizes shipping SBOMs inside packages via .dist-info/sboms/. Here's what it means and how we adopted it in two projects with minimal effort."
author:
  display_name: Viktor Petersson
date: 2026-03-05
slug: pep-770-sboms-in-python-packages
categories:
  - education
tags: [sbom, python, pep-770, cyclonedx, spdx, pypi, hatchling]
keywords: [pep 770, python sbom, dist-info sboms, hatchling sbom-files, software bill of materials python]
tldr: "PEP 770 standardizes shipping SBOMs inside Python wheels in .dist-info/sboms/. Authored by Seth Larson and accepted in April 2025, it's format-agnostic and works with existing tools like hatchling. We adopted it in py-libtea and sbomify-action with minimal changes to each project. The adoption is straightforward -- if you ship Python packages, there's little reason not to adopt PEP 770 today."
---

Python now has an official standard for shipping [SBOMs](/what-is-sbom/) inside packages. [PEP 770](https://peps.python.org/pep-0770/), authored by [Seth Larson](https://www.linkedin.com/in/sethmlarson/) (Python Security Developer-in-Residence at the Python Software Foundation) and accepted in April 2025, reserves a dedicated directory inside Python packages for SBOM files. It's a small change with big implications for supply chain transparency in the Python ecosystem.

## What PEP 770 Does

The core idea is simple: PEP 770 reserves a `.dist-info/sboms/` directory in Python wheels and installed packages. Any SBOM files placed there travel with the package, so when someone runs `pip install`, they get the SBOM automatically.

Here's what a wheel looks like with PEP 770:

```
my_package-1.0.0.dist-info/
  METADATA
  RECORD
  sboms/
    my_package.cdx.json
```

A few things worth highlighting:

- **Format-agnostic.** CycloneDX, SPDX, or any future format all work. The spec doesn't prescribe what goes inside the SBOM files.
- **No core metadata version change needed.** PEP 770 works with existing Python packaging infrastructure. There's nothing to upgrade on the consumer side.
- **Build backend support already exists.** [Hatchling](https://hatch.pypa.io/) (>= 1.28.0) supports it natively via the `sbom-files` configuration option. Other build backends are expected to follow.

The [packaging specification](https://packaging.python.org/en/latest/specifications/binary-distribution-format/#the-dist-info-sboms-directory) has the full details.

## The Elephant in the Room: Ecosystem Fragmentation

PEP 770 is great news for Python, but it also highlights a broader problem: every ecosystem is solving SBOM distribution independently, and the mechanisms are completely different.

| Ecosystem            | Discovery Mechanism | How It Works                                                                                                                                                                      |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Docker/OCI**       | OCI Referrers API   | SBOM stored as a separate OCI artifact linked to an image via the `/v2/.../referrers/<digest>` endpoint. Cryptographic verification via Cosign attestations (in-toto + Sigstore). |
| **Cosign/Sigstore**  | Signed attestations | `cosign attest` wraps the SBOM in an in-toto attestation with a signature. The older `cosign attach sbom` (unsigned) is deprecated. Stored in the OCI registry.                   |
| **Python (PEP 770)** | `.dist-info/sboms/` | SBOM files embedded directly inside the wheel archive. Travels with the package, so consumers get it on `pip install`.                                                            |
| **Maven/Java**       | Artifact classifier | The CycloneDX plugin attaches the SBOM as a sibling artifact with a `-cyclonedx` classifier. Fetched separately from Maven Central.                                               |
| **npm/Node.js**      | No standard         | `npm sbom` generates an SBOM locally from the lockfile. There is no registry-level SBOM attachment. Consumers generate their own.                                                 |
| **Rust/Cargo**       | Fragmented          | Multiple competing approaches: `cargo-sbom` (file), `cargo-auditable` (binary metadata), Cargo native `[sbom]` config (experimental). No unified standard.                        |

Each approach makes sense within its own ecosystem's packaging model. But if you're a consumer dealing with Docker images, PyPI packages, and Maven JARs, you need three completely different mechanisms to discover SBOMs.

There are also important differences in trust models. Only the Docker/Cosign approach provides cryptographic verification of SBOM authenticity. The rest rely on trust-by-proximity: you trust the SBOM because it came from the same place as the package. And npm and Rust don't even have settled standards yet.

This is exactly where protocols like [TEA](/2026/03/01/why-were-bullish-on-tea/) and platforms like sbomify aim to help. They provide a unified discovery and sharing layer regardless of how the SBOM was originally shipped. Ecosystem-specific standards like PEP 770 are still a net win, though. Having a per-ecosystem standard is far better than having no standard at all, and a universal layer can aggregate across them.

## How We Adopted PEP 770

We adopted PEP 770 in two projects, and it was remarkably straightforward.

### The pyproject.toml Change

If you're using hatchling as your build backend, the configuration change is minimal:

```toml
[tool.hatch.build.targets.wheel]
sbom-files = ["my_package.cdx.json"]
```

That's it. That single line tells hatchling to include the specified SBOM file in the `.dist-info/sboms/` directory when building the wheel.

### The Placeholder SBOM Pattern

Rather than generating the SBOM at build time from scratch, we use a placeholder pattern. A minimal CycloneDX SBOM is committed to the repository:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "metadata": {
    "component": {
      "type": "library",
      "name": "my-package",
      "version": "0.0.0-placeholder"
    }
  },
  "components": []
}
```

This placeholder is just a skeleton. It passes validation but doesn't contain real dependency data.

### CI Integration

In CI, the flow looks like this:

1. The placeholder SBOM is checked out with the code
2. [sbomify-action](https://github.com/sbomify/sbomify-action) enriches it with actual dependency information
3. The wheel is built (with hatchling picking up the now-enriched SBOM)
4. The wheel is published to PyPI

The enrichment step replaces the placeholder version and populates the `components` array with real dependency data. By the time the wheel is built, the SBOM accurately reflects what's inside the package.

## See It in Action

Here are the actual pull requests:

- [py-libtea PR #8](https://github.com/sbomify/py-libtea/pull/8)
- [sbomify-action PR #185](https://github.com/sbomify/sbomify-action/pull/185)

Each PR touched just three files. No new dependencies. No complex build system modifications.

## Getting Started

If you ship Python packages, here's the quick checklist:

1. **Use hatchling >= 1.28.0** (or check if your build backend supports PEP 770)
2. **Add `sbom-files` to `pyproject.toml`** to include your SBOM in the wheel
3. **Create a placeholder SBOM** (CycloneDX or SPDX) and commit it to your repo
4. **Enrich in CI** before building the wheel, so the SBOM reflects actual dependencies
5. **Verify the wheel** contains `.dist-info/sboms/` (unzip the `.whl` file and check)

For a deeper dive into SBOM generation for Python projects, check out our [Python SBOM guide](/guides/python/) and our [blog post on generating SBOMs with pipdeptree and CycloneDX](/2024/07/30/generate-sboms-for-python-packages-with-pipdeptree-and-cyclonedx-py/).

## Wrapping Up

PEP 770 is a milestone for Python supply chain transparency. It's the kind of standard that succeeds because it's simple, practical, and works with existing tools. [Seth Larson](https://www.linkedin.com/in/sethmlarson/) and the Python packaging community deserve real credit for getting this right.

If you maintain Python packages, there's very little reason not to adopt PEP 770 today. As we showed, it works with existing CI pipelines and requires only trivial changes to your build configuration. The Python ecosystem now has a clear, standardized way to ship SBOMs, and the barrier to adoption is about as low as it gets.
