---
title: "Can I convert between CycloneDX and SPDX?"
description: "Why converting between CycloneDX and SPDX SBOM formats is problematic and what to do instead."
answer: "Not reliably. CycloneDX and SPDX have different data models, so converting between them inevitably loses context. The best approach is to generate natively in the format you need."
tldr: "Not reliably. CycloneDX and SPDX have different data models, so converting between them inevitably loses context. The best approach is to generate natively in the format you need."
weight: 35
keywords: [CycloneDX, SPDX, SBOM conversion, SBOM format, convert SBOM, CycloneDX to SPDX, SPDX to CycloneDX]
url: /faq/can-i-convert-between-cyclonedx-and-spdx/
---

## The short answer

You can technically run a conversion tool, but you will almost certainly lose data in the process. CycloneDX and SPDX are not different encodings of the same information - they are fundamentally different data models with different concepts, fields, and relationships.

## Why conversion loses context

Each format has fields and structures the other does not:

- **CycloneDX** has concepts like services, vulnerabilities (VEX), formulation, licensing expressions on components, lifecycle phases, and attestations that have no direct SPDX equivalent
- **SPDX** has concepts like document-level relationships, file-level analysis, snippet tracking, and annotation types that have no direct CycloneDX equivalent
- Even fields that look similar (like licensing) use different structures and semantics between the two formats

A round-trip conversion (CycloneDX -> SPDX -> CycloneDX) will not give you back what you started with. Data that doesn't map cleanly is either dropped silently or shoehorned into fields where it doesn't belong.

## What to do instead

Generate natively in the format you need. [sbomify-action](https://github.com/sbomify/sbomify-action) supports both formats out of the box:

```yaml
# CycloneDX (default)
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true

# SPDX
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.spdx.json
    SBOM_FORMAT: spdx
    ENRICH: true
```

If a customer or regulation requires a specific format, generate in that format from the start rather than converting after the fact.

## Further reading

- [What SBOM formats does sbomify support?](/faq/what-sbom-formats-does-sbomify-support/)
- [Schema Crosswalk](/compliance/schema-crosswalk/) - how fields map (and don't map) across CycloneDX and SPDX
