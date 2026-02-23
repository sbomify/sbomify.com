---

url: /guides/python/
title: "SBOM Generation Guide for Python - UV, Poetry, Pipenv"
description: "Learn how to generate Software Bill of Materials for Python projects. Complete guide with uv.lock, poetry.lock, and Pipfile.lock examples."
section: guides
---

## Source vs Build SBOMs

Before we dive into the actual guide, let's start by talking about SBOM generation. Generally speaking, an SBOM is either built from source (also known as 'pre-build' in CycloneDX terminology) or built after installation. When we talk about source SBOMs, we normally refer to generating an SBOM from a lockfile, and for built SBOMs, we look at what has been installed by the package manager. These might seem interchangeable, and the output might be identical. However, this really boils down to the quality of the lockfile, so let's dive into this with some examples.

## Lockfile Example

Modern Python package managers like [UV](https://docs.astral.sh/uv/) and [Poetry](https://python-poetry.org/) automatically generate complete lockfiles with all transitive dependencies and cryptographic hashes. This makes them ideal for SBOM generation.

### Why Migrate Away from requirements.txt?

If you're still using `requirements.txt` with `pip`, consider migrating to UV or Poetry. The traditional `requirements.txt` approach has several limitations that affect SBOM quality:

- **Missing transitive dependencies**: A `requirements.txt` often only lists direct dependencies. Flask might be listed, but its dependencies (Werkzeug, Jinja2, etc.) are missing unless you manually run `pip freeze`.
- **No hashes by default**: Adding cryptographic hashes requires extra tooling like pip-tools, and even then, SBOM tools have inconsistent support for this format.
- **Version ranges cause ambiguity**: Expressions like `flask>=3.0.0` make it impossible to generate accurate source/pre-build SBOMs since the exact version is unknown.

UV and Poetry solve all of these issues automatically.

For a Flask-based Python server, your `pyproject.toml` would declare:

```toml
[project]
dependencies = ["flask>=3.0.3"]
```

Running `uv lock` generates a `uv.lock` file that captures Flask and all its dependencies with exact versions and hashes—ready for accurate SBOM generation.

Similarly, with Poetry, running `poetry lock` generates a `poetry.lock` file with the same completeness.

The key point is that the SBOM is directly correlated to the quality of the lockfile. UV and Poetry solve this by automatically:

- Capturing all transitive dependencies
- Including cryptographic hashes
- Using precise version pinning

### Hashes Are Included Automatically

UV and Poetry automatically add cryptographic hashes to all packages in their lockfiles. This is required for NTIA Minimum Elements compliance—no extra tooling needed.

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

![Lifecycle](/assets/images/d2/lifecycle.svg)

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Python, sbomify uses **cyclonedx-py** under the hood as it provides the most accurate results for Python lockfiles, including proper hash support.

**Standalone (no account needed):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: uv.lock
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-python-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: uv.lock
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

The action supports all Python lockfiles: `uv.lock`, `poetry.lock`, `Pipfile.lock`, and `pyproject.toml`.

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cyclonedx-py (Python-native, recommended for manual use):**

```bash
pip install cyclonedx-bom
cyclonedx-py environment --output-format json -o sbom.cdx.json
```

This is the same tool sbomify uses under the hood. It reads from your installed environment and properly handles hashes.

**Trivy:**

```bash
trivy fs --format cyclonedx --output sbom.cdx.json .
```

**cdxgen:**

```bash
cdxgen -o sbom.cdx.json
```

When using these tools directly, you'll need to handle enrichment and augmentation separately. See our [Resources page](/resources/#python) for more Python SBOM tools.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: uv.lock
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
```

## Further Reading

Related blog posts:

- [How to Generate SBOMs for Python Packages with pipdeptree and cyclonedx-py](/2024/07/30/generate-sboms-for-python-packages-with-pipdeptree-and-cyclonedx-py/) - Tutorial on generating CycloneDX SBOMs including transitive dependencies and best practices for pinning with hashes

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes additional Python-specific tools like CycloneDX Python, sbom4python, and SPDX Python libraries.
