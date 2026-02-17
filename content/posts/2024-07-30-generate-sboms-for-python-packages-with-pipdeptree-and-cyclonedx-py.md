---

title: How to Generate SBOMs for Python Packages with `pipdeptree` and `cyclonedx-py`
description: "Tutorial on generating CycloneDX SBOMs for Python projects using pipdeptree and cyclonedx-py, including transitive dependencies and best practices for pinning with hashes."
author:
  display_name: Viktor Petersson
date: '2024-07-30 09:00:35 +0200'
category: guide
tags: [sbom, python, cyclonedx, security]
comments: []
slug: generate-sboms-for-python-packages-with-pipdeptree-and-cyclonedx-py
---

Software Bill of Materials (SBOMs) are essential for ensuring transparency and security in software supply chains. This guide will show you how to use `pipdeptree` and `cyclonedx-py` to generate SBOMs for Python projects, including all transient dependencies. We'll also reference a comprehensive guide on generating SBOMs for Python packages using Docker and Django CMS.

## Why SBOMs Matter

SBOMs provide a detailed inventory of all components in a software project, helping with:

- **Security**: Identifying and fixing vulnerabilities.
- **Compliance**: Meeting legal and regulatory standards.
- **Maintenance**: Ensuring software stability.

See our article [What is an SBOM](/what-is-sbom/) for more details.

## Step-by-Step Guide to Generating SBOMs

### Using `pipdeptree` for Dependency Analysis

`pipdeptree` visualizes the dependency tree of installed Python packages, making it ideal for SBOM generation.

#### Installation

Install `pipdeptree` with pip:

```bash
pip install pipdeptree
```

#### Generate the Dependency Tree

Run this command to see the dependency tree and save it to a `requirements.txt` file:

```bash
pipdeptree --freeze > requirements.txt
```

This output includes all installed packages and their dependencies, providing the necessary data for a comprehensive SBOM.

### Exploding the SBOM

To fully capture all dependencies, including transient ones, it's essential to "explode" the SBOM. `pipdeptree` does this effectively by mapping out the entire dependency tree.

### Converting `pipdeptree` Output to CycloneDX Format

Once you have the dependency tree from `pipdeptree`, you can convert it to a CycloneDX SBOM using the CycloneDX-Python tool.

#### Installation

Install CycloneDX-Python with pip:

```bash
pip install cyclonedx-bom
```

#### Conversion Process

First, generate the dependency tree and save it to a file using the previous `pipdeptree` command. Then, convert this `requirements.txt` file to a CycloneDX SBOM:

```bash
$ cyclonedx-py \
    --requirements requirements.txt \
    --output sbom.json
```

This process ensures all dependencies, including transient ones, are captured in the SBOM.

### Best Practices for Managing Dependencies

Pinning all dependencies, ideally with hashes, enhances security and compliance, aligning with standards like the OpenSSF Scorecards.

#### Pinning Dependencies with Hashes

Specify versions and hashes in your `requirements.txt`:

```
package==version --hash=sha256:hash
```

This ensures you're using verified dependency versions, reducing the risk of vulnerabilities.

### Wrapping up

For a thorough walkthrough on generating SBOMs, check out our [comprehensive guide](/2024/05/27/comprehensive-guide-to-generating-and-understanding-sboms-with-docker-and-django-cms/). This resource covers generating SBOMs using Docker and Django CMS, with applicable insights for any Python project.

Generating SBOMs for Python packages, including all dependencies, is vital for security and compliance. Tools like `pipdeptree` and CycloneDX-Python make this process straightforward. By following best practices such as pinning dependencies with hashes, you can further secure your project.
