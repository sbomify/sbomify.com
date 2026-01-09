---
layout: page
permalink: /guides/terraform/
title: "SBOM Generation Guide for Terraform - Infrastructure as Code"
description: "Learn how to generate Software Bill of Materials for Terraform projects. Complete guide with .terraform.lock.hcl examples, provider dependencies, and security considerations."
section: guides
---

## Why SBOMs for Terraform?

Terraform manages infrastructure as code, and its providers are software components with their own supply chain risks:

- **Provider supply chain attacks**: Malicious providers could compromise infrastructure
- **Compliance requirements**: Track what software manages your infrastructure
- **Vulnerability management**: Providers may have security vulnerabilities
- **Audit trails**: Document exactly what versions were used for deployments

## Source vs Build SBOMs

Terraform's dependency management centers around providers:

- **Source SBOMs** are generated from `.terraform.lock.hcl`
- **Build SBOMs** can analyze the downloaded providers in `.terraform/providers/`

The lockfile approach is preferred as it contains cryptographic hashes for integrity verification.

## Lockfile Deep Dive

### .terraform.lock.hcl

The `.terraform.lock.hcl` file is created when you run `terraform init`:

```hcl
# This file is maintained automatically by "terraform init".
# Manual edits may be lost in future updates.

provider "registry.terraform.io/hashicorp/aws" {
  version     = "5.31.0"
  constraints = "~> 5.0"
  hashes = [
    "h1:abc123...",
    "zh:def456...",
    "zh:ghi789...",
  ]
}

provider "registry.terraform.io/hashicorp/random" {
  version = "3.6.0"
  hashes = [
    "h1:xyz123...",
    "zh:abc456...",
  ]
}

provider "registry.terraform.io/hashicorp/kubernetes" {
  version     = "2.25.0"
  constraints = ">= 2.0.0"
  hashes = [
    "h1:hash123...",
  ]
}
```

Key information:

- **provider address**: Full provider path (registry/namespace/name)
- **version**: Exact resolved version
- **constraints**: Version constraints from configuration
- **hashes**: Multiple hash formats for integrity verification

### Provider Version Constraints

In your Terraform configuration:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.0, < 3.0.0"
    }
  }
}
```

### Hash Formats

The lockfile contains multiple hash types:

```hcl
hashes = [
  "h1:...",    # Hash of provider package (zip file)
  "zh:...",   # Hash of provider binary contents
]
```

The `zh:` hashes provide cross-platform verification.

## Provider Versioning and Hashes

### Updating the Lockfile

```bash
# Initialize and create/update lockfile
terraform init

# Upgrade providers within constraints
terraform init -upgrade

# Add platform-specific hashes
terraform providers lock \
  -platform=linux_amd64 \
  -platform=darwin_amd64 \
  -platform=darwin_arm64
```

### Multi-Platform Support

For teams using different operating systems:

```bash
terraform providers lock \
  -platform=linux_amd64 \
  -platform=linux_arm64 \
  -platform=darwin_amd64 \
  -platform=darwin_arm64 \
  -platform=windows_amd64
```

This ensures the lockfile has hashes for all platforms.

## Module Dependencies

Terraform modules are another type of dependency:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.4.0"

  # ... configuration
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.21.0"

  # ... configuration
}
```

**Important:** Module versions are tracked in configuration, not in the lockfile. For complete SBOMs, you need to extract module references from your `.tf` files.

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle]({{ site.url }}/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Terraform, sbomify uses **Syft** under the hood.

**Standalone (no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    LOCK_FILE: .terraform.lock.hcl
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-terraform-infra
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide]({{ site.url }}/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: .terraform.lock.hcl
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**Syft:**

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

Syft is currently the only widely-available open source tool that supports generating SBOMs from Terraform lockfiles. Trivy supports Terraform for IaC misconfiguration scanning but not for SBOM generation from `.terraform.lock.hcl`.

When using Syft directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  before_script:
    - terraform init
  variables:
    LOCK_FILE: .terraform.lock.hcl
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## Terraform Cloud/Enterprise

For Terraform Cloud workspaces:

```yaml
jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          cli_config_credentials_token: ${{ secrets.TF_API_TOKEN }}

      - name: Initialize
        run: terraform init

      - name: Generate SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: '.terraform.lock.hcl'
          OUTPUT_FILE: 'sbom.cdx.json'
```

## Supply Chain Security for IaC

### Provider Verification

Terraform verifies provider signatures:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.31.0"
    }
  }
}
```

Providers from the official registry are signed by HashiCorp or the provider maintainer.

### Private Provider Registries

For organizations using private registries:

```hcl
terraform {
  required_providers {
    internal = {
      source  = "registry.example.com/myorg/internal"
      version = "1.0.0"
    }
  }
}
```

These providers appear in the lockfile with the custom registry path.

### Mirroring Providers

For air-gapped environments:

```bash
# Create a provider mirror
terraform providers mirror /path/to/mirror

# Use the mirror
# In .terraformrc or terraform.rc:
provider_installation {
  filesystem_mirror {
    path    = "/path/to/mirror"
    include = ["registry.terraform.io/*/*"]
  }
}
```

Document mirrored providers in your SBOM metadata.

## Handling Modules in SBOMs

Since modules aren't in the lockfile, extract them separately:

```bash
# List modules
terraform providers

# Or parse from configuration
grep -r "source\s*=" *.tf | grep "module"
```

Add module information using `ADDITIONAL_PACKAGES`:

```yaml
env:
  ADDITIONAL_PACKAGES: "terraform-aws-modules/vpc/aws:5.4.0,terraform-aws-modules/eks/aws:19.21.0"
```

## Complete Terraform SBOM Workflow

```yaml
---
name: Complete Terraform SBOM

on:
  push:
    branches: [main]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3

      - name: Initialize Terraform
        run: terraform init

      - name: Validate configuration
        run: terraform validate

      - name: Generate provider SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: '.terraform.lock.hcl'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true

      - name: Security scan
        run: |
          # Use checkov, tfsec, or similar
          pip install checkov
          checkov -d . --output-file checkov-results.json

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: terraform-security
          path: |
            sbom.cdx.json
            checkov-results.json
```

## Best Practices

1. **Always commit .terraform.lock.hcl** - Essential for reproducible infrastructure
2. **Add multi-platform hashes** - Support all team platforms
3. **Pin provider versions** - Use exact versions in production
4. **Track modules separately** - Document module versions in your SBOM
5. **Use private registries** - Consider mirroring for security-sensitive environments
6. **Combine with security scanning** - Use tools like checkov, tfsec alongside SBOMs

## Security Considerations

Terraform providers have elevated privileges:

- They create/modify cloud infrastructure
- They may store credentials
- They make API calls to cloud providers

Your SBOM helps track:

- Which providers are in use
- What versions are deployed
- When updates are available
- Known vulnerabilities in providers

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes general SBOM utilities for generation, distribution, and analysis.
