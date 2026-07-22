---
title: "Which tools generate CBOMs?"
description: "Tools that generate a Cryptography Bill of Materials (CBOM): the sbomify GitHub Action with cdxgen, PQCA cbomkit, cbomkit-theia for containers, and commercial scanners."
answer: "The sbomify-action generates a CBOM in CI with cbom-generate: true (cdxgen crypto detection for Java and Python projects, JS/TS source, keystores, and certificates). PQCA's cbomkit scans Java and Python source, and cbomkit-theia scans container images for certificates and keys. Any tool that emits CycloneDX cryptographic assets works; sbomify ingests them all."
tldr: "Easiest: sbomify-action with cbom-generate: true. Deepest source analysis: PQCA cbomkit (Java/Python). Container images: cbomkit-theia. All emit CycloneDX, and sbomify ingests every CBOM lineage including legacy IBM CBOM 1.0 output."
weight: 89
keywords: [CBOM generation, cdxgen crypto, cbomkit, cbomkit-theia, sonar-cryptography, CBOM tools, generate CBOM, CycloneDX cryptographic asset]
url: /faq/which-tools-generate-cboms/
---

## In your CI pipeline (easiest)

The [sbomify-action](https://github.com/sbomify/sbomify-action) generates and uploads in one step:

```yaml
- uses: sbomify/sbomify-action@master
  with:
    cbom-generate: true
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: 'your-component-id'
    LOCK_FILE: 'pom.xml'
```

Under the hood this runs [cdxgen](https://github.com/cdxgen/cdxgen) with crypto detection: Java and Python projects, JavaScript/TypeScript source analysis, keystores, and certificates.

## Dedicated crypto scanners

- **[cbomkit](https://github.com/cbomkit)** (PQCA / Linux Foundation, formerly IBM): sonar-cryptography performs deep source analysis for Java and Python; the cbomkit GitHub action wraps it for CI. Pass its output through the sbomify-action with `bom-type: cbom`.
- **[cbomkit-theia](https://github.com/cbomkit/cbomkit-theia)**: scans container images and filesystems for certificates, keys, and crypto configuration.
- **Commercial scanners**: several vendors export CycloneDX CBOMs from source or binaries; anything emitting CycloneDX cryptographic assets uploads to sbomify verbatim.

## Already have crypto data in your SBOMs?

If your SBOM generator embeds cryptographic assets in ordinary SBOMs, sbomify derives the crypto inventory from those documents automatically; no separate CBOM needed. See [How do I upload a CBOM?](/faq/how-do-i-upload-a-cbom/) and the [CBOM feature page](/features/cbom/).
