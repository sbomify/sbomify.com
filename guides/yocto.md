---
layout: page
permalink: /guides/yocto/
title: "SBOM Generation Guide for Yocto - Embedded Linux"
description: "Learn how to generate Software Bill of Materials for Yocto-based embedded Linux projects. Complete guide with SPDX output, bitbake integration, and quality analysis."
section: guides
---

## Source vs Build SBOMs

Yocto is unique among build systems because it builds everything from source. This means Yocto generates true **build SBOMs** that accurately represent every component compiled into your Linux distribution.

Unlike application-level SBOMs generated from lockfiles, Yocto's SBOMs capture:

- Every package built from source
- Complete file-level details including checksums
- Licensing information from the OpenEmbedded catalog
- Relationships between packages

This makes Yocto one of the most comprehensive SBOM solutions available for embedded Linux development.

## Yocto's Built-in SBOM Generation

Yocto has native SBOM support through the `create-spdx.bbclass`. It generates **SPDX 2.2** format SBOMs automatically during the build process.

### Enabling SBOM Generation

SBOM generation is typically enabled by default in modern Yocto releases. If not, add to your `local.conf`:

```bash
INHERIT += "create-spdx"
```

### Build and Extract SBOMs

After running `bitbake` to build your image:

```bash
# Build your image
bitbake core-image-minimal

# Find the SBOM archive in your deploy folder
ls tmp/deploy/images/*/
# Look for: [image-name].spdx.tar.zst

# Extract the SBOMs
mkdir sboms
tar --zstd -xvf tmp/deploy/images/*/*.spdx.tar.zst -C sboms/
```

### Understanding the Output

Yocto generates a separate SBOM for each package:

```bash
$ ls sboms/
avahi-daemon.spdx.json
base-files.spdx.json
base-passwd.spdx.json
bash.spdx.json
busybox.spdx.json
ca-certificates.spdx.json
index.json
...
```

The `index.json` file links all individual SBOMs together using SPDX document linking:

```json
{
  "documents": [
    {
      "documentNamespace": "http://spdx.org/spdxdocs/bash-0139ef99-...",
      "filename": "bash.spdx.json",
      "sha1": "e9353b8e26447ef425aa740060f57411420c817a"
    },
    ...
  ]
}
```

## SBOM Quality

Yocto produces high-quality SBOMs. Using [sbomqs](https://github.com/interlynk-io/sbomqs) to analyze the output:

```bash
$ sbomqs score bash.spdx.json
SBOM Quality by Interlynk Score: 7.0
```

Key quality attributes:

- ✅ Component names and versions
- ✅ Supplier information
- ✅ Unique identifiers
- ✅ Creation timestamps
- ✅ Valid SPDX licenses
- ✅ File-level checksums

## SBOM Structure

Each package SBOM includes detailed metadata:

```json
{
  "SPDXID": "SPDXRef-DOCUMENT",
  "creationInfo": {
    "created": "2025-02-18T21:58:47Z",
    "creators": [
      "Tool: OpenEmbedded Core create-spdx.bbclass",
      "Organization: OpenEmbedded ()"
    ],
    "licenseListVersion": "3.14"
  },
  "dataLicense": "CC0-1.0",
  "documentNamespace": "http://spdx.org/spdxdocs/bash-...",
  "files": [
    {
      "SPDXID": "SPDXRef-PackagedFile-bash-1",
      "checksums": [
        {"algorithm": "SHA1", "checksumValue": "..."},
        {"algorithm": "SHA256", "checksumValue": "..."}
      ],
      "fileName": "usr/bin/bash.bash",
      "fileTypes": ["BINARY"]
    }
  ]
}
```

## Working with Yocto SBOMs

### Merging SBOMs

Since Yocto generates per-package SBOMs, you may want to merge them for distribution:

```bash
# Using sbomasm from Interlynk
sbomasm assemble -i sboms/*.spdx.json -o combined-sbom.spdx.json

# Or use the index.json for document linking
```

### Converting to CycloneDX

If you need CycloneDX format:

```bash
# Using cyclonedx-cli
cyclonedx convert --input-file bash.spdx.json --output-file bash.cdx.json
```

### Quality Analysis

Analyze your SBOMs before distribution:

```bash
# Using sbomqs
sbomqs score *.spdx.json

# Using sbomaudit
sbomaudit -i combined-sbom.spdx.json
```

## Enrichment and Augmentation with sbomify

While Yocto generates high-quality SBOMs natively, you can use the [sbomify GitHub Action](https://github.com/sbomify/github-action/) to enrich and augment them further. The action accepts existing SBOMs via the `SBOM_FILE` input.

**Standalone (enrichment only, no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    SBOM_FILE: sboms/combined-sbom.spdx.json
    OUTPUT_FILE: enriched-sbom.cdx.json
    ENRICH: true
    UPLOAD: false
```

**With sbomify platform (enrichment + augmentation):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-yocto-image
    SBOM_FILE: sboms/combined-sbom.spdx.json
    OUTPUT_FILE: enriched-sbom.cdx.json
    ENRICH: true
    AUGMENT: true
```

This enriches the Yocto-generated SBOM with additional package metadata from public registries and optionally augments it with your business metadata (supplier, authors, licenses) from sbomify.

sbomify also supports [SBOM hierarchy]({{ site.url }}/features/sbom-hierarchy/) natively, replacing the need for `index.json` with a more flexible structure.

## CI/CD Integration

For automated SBOM generation in CI/CD:

```yaml
# GitLab CI example
build-image:
  stage: build
  script:
    - bitbake core-image-minimal
    - mkdir -p sboms
    - tar --zstd -xvf tmp/deploy/images/*/*.spdx.tar.zst -C sboms/
  artifacts:
    paths:
      - sboms/
```

```yaml
# GitHub Actions example
- name: Build Yocto image
  run: |
    source oe-init-build-env
    bitbake core-image-minimal

- name: Extract SBOMs
  run: |
    mkdir -p sboms
    tar --zstd -xvf tmp/deploy/images/*/*.spdx.tar.zst -C sboms/

- name: Upload SBOMs
  uses: actions/upload-artifact@v4
  with:
    name: yocto-sboms
    path: sboms/
```

## Best Practices

1. **Enable SBOM generation by default** - Add `create-spdx` to your distro configuration
2. **Archive SBOMs with releases** - Store SBOMs alongside your image artifacts
3. **Validate before distribution** - Use sbomqs to check SBOM quality
4. **Consider hierarchy** - Use sbomify's hierarchy support for complex products
5. **Track package updates** - Map components to track changes across releases
6. **Sign your SBOMs** - Add cryptographic signatures for authenticity

## Limitations

- **SPDX only** - Yocto generates SPDX 2.2 format only (no CycloneDX)
- **Per-package SBOMs** - May need merging for simpler distribution
- **No runtime dependencies** - Only captures build-time components

## Further Reading

Related blog posts:

- [Mastering SBOM Generation with Yocto]({{ site.url }}/2025/02/21/mastering-sbom-generation-with-yocto/) - Deep dive into Yocto's SPDX generation and quality analysis

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes tools for SBOM generation, distribution, and analysis.
