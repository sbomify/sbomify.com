---
layout: page
permalink: /guides/raspberry-pi/
title: "SBOM Generation Guide for Raspberry Pi - rpi-image-gen"
description: "Learn how to generate Software Bill of Materials for Raspberry Pi custom images using rpi-image-gen. Complete guide with SPDX output and quality analysis."
section: guides
---

## Source vs Build SBOMs

The Raspberry Pi Foundation's [rpi-image-gen](https://github.com/raspberrypi/rpi-image-gen) tool generates **build SBOMs** automatically when creating custom Raspberry Pi images. Every image built with rpi-image-gen includes an SPDX SBOM out of the box.

This is a significant advancement for embedded device manufacturers who need to provide SBOMs for compliance with regulations like the EU Cyber Resilience Act or US Executive Order 14028.

## rpi-image-gen Overview

rpi-image-gen is a flexible image builder designed for developers and device makers who need custom Raspberry Pi images. Unlike the older [pi-gen](https://github.com/RPi-Distro/pi-gen) tool used for official Raspberry Pi OS builds, rpi-image-gen is optimized for bespoke images.

### Requirements

- Run on Raspberry Pi OS (Raspbian) for best compatibility
- Running on plain Debian or Ubuntu may cause architecture mismatches

### Building an Image

```bash
# Clone the repository
git clone https://github.com/raspberrypi/rpi-image-gen.git
cd rpi-image-gen

# Install dependencies
sudo ./install_deps.sh

# Build a minimal Debian 12 image for 64-bit devices
./build.sh
```

## SBOM Generation

rpi-image-gen generates SPDX SBOMs automatically during the build process. No additional configuration is required.

### Locating the SBOM

After the build completes, find the SBOM in the output directory:

```bash
ls output/
# Look for: [image-name].sbom.spdx.json
```

### SBOM Quality

The generated SBOMs achieve high quality scores. Using [sbomqs](https://github.com/interlynk-io/sbomqs):

```bash
$ sbomqs score output/*.sbom.spdx.json
SBOM Quality by Interlynk Score: 7.8
```

Key quality attributes:

- ✅ Component names and versions
- ✅ Supplier information
- ✅ Package identifiers (PURLs)
- ✅ Valid SPDX licenses
- ✅ Creation timestamps

## SBOM Structure

The generated SPDX SBOM includes comprehensive package information:

```json
{
  "spdxVersion": "SPDX-2.3",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "raspberry-pi-image",
  "creationInfo": {
    "created": "2025-04-17T10:00:00Z",
    "creators": ["Tool: rpi-image-gen"]
  },
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-apt",
      "name": "apt",
      "versionInfo": "2.6.1",
      "supplier": "Organization: Debian",
      "downloadLocation": "https://packages.debian.org/...",
      "licenseConcluded": "GPL-2.0-or-later"
    }
  ]
}
```

## Working with the SBOM

### Converting to CycloneDX

If you need CycloneDX format:

```bash
# Using cyclonedx-cli
cyclonedx convert \
  --input-file output/image.sbom.spdx.json \
  --output-file image.cdx.json
```

### Quality Analysis

Validate your SBOM before distribution:

```bash
# Using sbomqs
sbomqs score output/*.sbom.spdx.json

# Using NTIA conformance checker
ntia-conformance-check output/*.sbom.spdx.json
```

### Enrichment

Add additional metadata using sbomify:

```bash
# Enrich with package registry metadata
sbomify enrich --input output/*.sbom.spdx.json --output enriched.spdx.json
```

## CI/CD Integration

Automate image builds with SBOM generation:

```yaml
# GitHub Actions example
- name: Build Raspberry Pi image
  run: |
    cd rpi-image-gen
    ./build.sh

- name: Upload SBOM
  uses: actions/upload-artifact@v4
  with:
    name: raspberry-pi-sbom
    path: output/*.sbom.spdx.json
```

```yaml
# GitLab CI example
build-image:
  stage: build
  tags:
    - raspberry-pi
  script:
    - cd rpi-image-gen
    - ./build.sh
  artifacts:
    paths:
      - output/*.sbom.spdx.json
```

## Enrichment and Augmentation with sbomify

While rpi-image-gen generates SBOMs natively, you can use the [sbomify GitHub Action](https://github.com/sbomify/github-action/) to enrich and augment them further. The action accepts existing SBOMs via the `SBOM_FILE` input.

**Standalone (enrichment only, no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    SBOM_FILE: output/image.sbom.spdx.json
    OUTPUT_FILE: enriched-sbom.cdx.json
    ENRICH: true
    UPLOAD: false
```

**With sbomify platform (enrichment + augmentation):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
    COMPONENT_ID: my-raspberry-pi-image
    SBOM_FILE: output/image.sbom.spdx.json
    OUTPUT_FILE: enriched-sbom.cdx.json
    ENRICH: true
    AUGMENT: true
```

This enriches the rpi-image-gen SBOM with additional package metadata from public registries and optionally augments it with your business metadata (supplier, authors, licenses) from sbomify.

Use sbomify for complete SBOM lifecycle management:

1. **Upload** - Upload the enriched SBOM to sbomify
2. **Augment** - Add vendor and supplier information
3. **Distribute** - Share with customers and stakeholders
4. **Monitor** - Track vulnerabilities across releases

## Best Practices

1. **Build on Raspberry Pi OS** - Ensures architecture compatibility
2. **Archive SBOMs with releases** - Store alongside image files
3. **Validate before distribution** - Check quality with sbomqs
4. **Sign your SBOMs** - Add cryptographic signatures
5. **Version your images** - Track SBOM changes across releases
6. **Enrich metadata** - Add supplier and contact information

## Limitations

- **SPDX only** - rpi-image-gen generates SPDX format (no CycloneDX)
- **Debian packages** - Captures Debian/Raspbian packages only
- **Build environment** - Best run on Raspberry Pi OS

## Further Reading

Related blog posts:

- [Unpacking Raspberry Pi's Built-In SBOM Magic]({{ site.url }}/2025/04/17/unpacking-raspberry-pi-s-built-in-sbom-magic/) - How rpi-image-gen generates SBOMs for Raspberry Pi images

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes tools for SBOM generation, distribution, and analysis.
