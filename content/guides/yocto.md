---

url: /guides/yocto/
title: "SBOM Generation Guide for Yocto - Embedded Linux"
description: "Learn how to generate Software Bill of Materials for Yocto-based embedded Linux projects. Complete guide covering SPDX 2.2 and SPDX 3.0.1 with bitbake integration."
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

## Identifying Your Yocto Release

Your Yocto release determines which SPDX versions are available. Starting with **scarthgap (Yocto 5.0, LTS)**, you can generate SPDX 3.0.1 documents alongside the existing SPDX 2.2 support.

| Release                         | Default SPDX  | bbclass           | Output                         |
| ------------------------------- | ------------- | ----------------- | ------------------------------ |
| Honister (3.4) to pre-scarthgap | 2.2           | `create-spdx`     | Per-package SBOMs + index.json |
| Scarthgap (5.0)+                | 2.2 (default) | `create-spdx`     | Per-package SBOMs + index.json |
| Scarthgap with 3.0              | 3.0.1         | `create-spdx-3.0` | Single consolidated SBOM       |

**Note:** SBOM support was first introduced in Yocto 3.4 (Honister). Releases before Honister do not have built-in SPDX generation.

To check your release and current SPDX version:

```bash
# Check your Yocto release
grep DISTRO_CODENAME meta-poky/conf/distro/poky.conf
```

```bash
# Check the active SPDX version
bitbake -e core-image-base | grep "^SPDX_VERSION="
```

See the [Yocto scarthgap documentation](https://docs.yoctoproject.org/scarthgap/) for full release details.

## Yocto's Built-in SBOM Generation

Yocto has native SBOM support through dedicated bbclasses that generate SPDX format SBOMs automatically during the build process.

### Enabling SBOM Generation

#### SPDX 2.2 (Default)

SBOM generation is typically enabled by default in modern Yocto releases. If not, add to your `local.conf`:

```bash
INHERIT += "create-spdx"
```

#### SPDX 3.0.1 (Scarthgap and Later)

To switch to SPDX 3.0.1 on scarthgap or later, update your `local.conf`:

```bash
INHERIT:remove = "create-spdx"
INHERIT += "create-spdx-3.0"
```

This replaces the default `create-spdx` class with the new `create-spdx-3.0` class, which produces a single consolidated SBOM instead of per-package files.

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

#### SPDX 2.2

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

**Note:** A full Yocto image can contain hundreds or even thousands of packages, each producing its own SBOM file. Be mindful of this when planning storage and tooling around SPDX 2.2 output.

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

#### SPDX 3.0.1

With `create-spdx-3.0`, Yocto produces a single consolidated SBOM containing all packages in one document. There is no `index.json` — everything is in a single file:

```bash
$ ls sboms/
core-image-minimal.spdx.json
```

This is a significant simplification over the per-package approach in SPDX 2.2.

**Note:** Because everything is consolidated into a single file, SPDX 3.0.1 output is large. A `core-image-minimal` build produces roughly 260 MB of uncompressed JSON-LD. Keep this in mind when choosing tools and storage, as some may struggle with files of this size.

## SBOM Structure

### SPDX 2.2

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

### SPDX 3.0.1

SPDX 3.0.1 uses a different top-level structure with a `@graph` array containing all elements in a single document:

```json
{
  "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
  "@graph": [
    {
      "type": "SpdxDocument",
      "spdxId": "SPDXRef-DOCUMENT",
      "creationInfo": {
        "created": "2025-02-18T21:58:47Z",
        "createdBy": ["Tool: OpenEmbedded Core create-spdx-3.0.bbclass"],
        "specVersion": "3.0.1"
      }
    },
    {
      "type": "software_Package",
      "spdxId": "SPDXRef-Package-bash",
      "name": "bash",
      "software_packageVersion": "5.2.21"
    }
  ]
}
```

All packages, files, and relationships are consolidated into the single `@graph` array instead of being spread across separate documents.

## CI/CD Integration

The SBOM output format depends on your SPDX version. SPDX 2.2 produces a `.spdx.tar.zst` archive containing per-package SBOMs. SPDX 3.0.1 produces a single `.spdx.json` file. Both are written to `tmp/deploy/images/MACHINE/`.

#### SPDX 2.2

```yaml
# GitHub Actions example
- name: Build Yocto image
  run: |
    source oe-init-build-env
    bitbake core-image-minimal

- name: Upload SBOMs
  uses: actions/upload-artifact@v4
  with:
    name: yocto-sboms
    path: tmp/deploy/images/*/*.spdx.tar.zst
```

#### SPDX 3.0.1

```yaml
# GitHub Actions example
- name: Build Yocto image
  run: |
    source oe-init-build-env
    bitbake core-image-minimal

- name: Upload SBOMs
  uses: actions/upload-artifact@v4
  with:
    name: yocto-sboms
    path: tmp/deploy/images/*/*.spdx.json
```

## Release Management with sbomify

You've generated your SBOMs. Now what? Regulations like the [EU Cyber Resilience Act](/compliance/eu-cra/) require manufacturers to tag SBOMs to specific product releases and retain them for up to 5 years. This means you need a system for release management and long-term storage, not just generation.

[sbomify-action](https://github.com/sbomify/sbomify-action) has built-in Yocto support that handles this. It detects the SPDX version automatically, uploads SBOMs, and creates tagged releases. It works in CI/CD pipelines or standalone.

### SPDX 2.2 (tar.zst archive)

Point sbomify-action at the `.spdx.tar.zst` archive directly, no need to extract it first:

```bash
sbomify-action --token $SBOMIFY_TOKEN \
  --augment --enrich \
  yocto tmp/deploy/images/qemux86-64/core-image-base.rootfs.spdx.tar.zst \
  --release "my-product:1.0.0"
```

### SPDX 3.0.1 (single JSON file)

For SPDX 3.0.1, point it at the consolidated `.spdx.json` file. Since this is a single document, you also need to specify a `--component-id` to map it to a component in sbomify:

```bash
sbomify-action --token $SBOMIFY_TOKEN \
  --augment --enrich \
  yocto tmp/deploy/images/qemux86-64/core-image-minimal.spdx.json \
  --component-id "my-component-id" \
  --release "my-product:1.0.0"
```

### What happens under the hood

- **SPDX 2.2:** sbomify-action extracts the archive, uploads each per-package SBOM, and creates a release tagging them all together.
- **SPDX 3.0.1:** sbomify-action uploads the single consolidated SBOM and creates a release.

In both cases, the release in sbomify ties the SBOMs to a specific product version, giving you a complete audit trail.

### Enriching your SBOMs

You can pass `--augment` and `--enrich` flags to enhance your SBOMs with additional metadata. If you've configured an augmentation profile in sbomify, metadata from the profile is automatically merged during upload. See [How do I achieve NTIA/CISA compliance?](/faq/how-do-i-achieve-ntia-cisa-compliance/) for details on setting up profiles.

Got questions? [Get in touch](https://app.sbomify.com/enterprise-contact/).

## Best Practices

1. **Enable SBOM generation by default** - Add `create-spdx` (or `create-spdx-3.0` on scarthgap+) to your distro configuration
2. **Prefer SPDX 3.0.1 on scarthgap and later** - The consolidated output simplifies distribution and eliminates the need for merging
3. **Archive SBOMs with releases** - Store SBOMs alongside your image artifacts
4. **Consider hierarchy** - Use sbomify's [hierarchy support](/features/sbom-hierarchy/) to organize per-package SBOMs, especially with SPDX 2.2
5. **Track package updates** - Map components to track changes across releases
6. **[Sign your SBOMs](/faq/how-do-i-sign-an-sbom/)** - Add cryptographic signatures for authenticity

## Limitations

- **SPDX only** - Yocto generates SPDX format only (no native CycloneDX)
- **Per-package SBOMs (SPDX 2.2)** - May need merging for simpler distribution (resolved in SPDX 3.0.1)
- **No runtime dependencies** - Only captures build-time components
- **Large SPDX 3.0.1 documents** - The consolidated single-file output can reach 260 MB or more for full images, which may cause issues with some tools and storage systems
- **SPDX 3.0 tooling maturity** - Some downstream tools may not yet fully support SPDX 3.0.1; verify your toolchain before switching

## Frequently Asked Questions

### What is the difference between SPDX 2.2 and SPDX 3.0?

SPDX 2.2 uses a flat JSON structure where tools like Yocto generate a separate `.spdx.json` file per package, linked together by an `index.json` and bundled in a `.spdx.tar.zst` archive. SPDX 3.0 replaces this with a graph-based JSON-LD model using a single `@graph` array, consolidating everything into one file.

SPDX 3.0 also introduces a profile system that extends the spec beyond software to cover security, build information, and AI/ML metadata. The trade-off is file size: a single SPDX 3.0.1 document can exceed 260 MB for a full Yocto image, and tooling support is still maturing.

If your build system supports SPDX 3.0 (Yocto scarthgap or later), it simplifies distribution by producing a single file instead of hundreds. If downstream tooling compatibility is a concern, SPDX 2.2 remains a safe choice. See [Exploring the New SPDX 3.0](/2024/04/28/exploring-the-new-spdx-3-0-a-game-changer-for-sboms/) for more details.

### Can I use CycloneDX with Yocto?

No. Yocto only supports SPDX format natively and there is no built-in CycloneDX generation. Converting SPDX output to CycloneDX is not recommended either, as the two formats have different data models and conversion inevitably loses context. See [Can I convert between CycloneDX and SPDX?](/faq/can-i-convert-between-cyclonedx-and-spdx/) for a detailed explanation of why format conversion is problematic.

## Further Reading

Related blog posts:

- [Mastering SBOM Generation with Yocto](/2025/02/21/mastering-sbom-generation-with-yocto/) - Deep dive into Yocto's SPDX generation and quality analysis
- [Exploring the New SPDX 3.0](/2024/04/28/exploring-the-new-spdx-3-0-a-game-changer-for-sboms/) - Overview of what SPDX 3.0 brings to the table
- [What's New in SPDX 3: Enhanced Referencing](/2024/07/22/whats-new-in-spdx-3-enhanced-referencing-capabilities/) - Deep dive into SPDX 3.0 referencing capabilities

Additional resources:

- [Yocto scarthgap documentation](https://docs.yoctoproject.org/scarthgap/)

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes tools for SBOM generation, distribution, and analysis.
