---
title: "What is a CBOM and how does sbomify support it?"
description: "A Cryptography Bill of Materials (CBOM) inventories the cryptographic assets in your software. sbomify auto-detects CBOMs, builds a crypto inventory, and assesses post-quantum readiness."
answer: "A CBOM (Cryptography Bill of Materials) is a CycloneDX BOM that inventories cryptographic assets: algorithms, keys, certificates, and protocols. sbomify auto-detects CBOM content on upload, renders a crypto-asset inventory, runs a post-quantum cryptography (PQC) readiness assessment against NIST guidance, and publishes CBOMs on your public release pages next to your SBOMs."
tldr: "A CBOM is the cryptographic sibling of an SBOM: it lists the algorithms, keys, certificates, and protocols your software uses. sbomify ingests and auto-classifies CBOMs, shows a crypto inventory with a post-quantum readiness view, and shares them through your Trust Center."
weight: 68
keywords: [CBOM, Cryptography Bill of Materials, crypto inventory, post-quantum cryptography, PQC readiness, quantum-safe, CycloneDX CBOM]
url: /faq/what-is-a-cbom/
---

## What a CBOM is

A **Cryptography Bill of Materials (CBOM)** is a [CycloneDX](https://cyclonedx.org/capabilities/cbom/) BOM whose components include cryptographic assets: the algorithms, keys, certificates, protocols, and crypto libraries your software uses. Where an SBOM answers "what packages are in this product," a CBOM answers "what cryptography does this product depend on."

That question is becoming urgent. Migrating to post-quantum cryptography starts with knowing where the quantum-vulnerable algorithms (RSA, ECDSA, classic Diffie-Hellman) live in your stack, and regulators are moving in the same direction: crypto agility features in NIST's post-quantum guidance and in EU CRA discussions alike. You cannot migrate what you have not inventoried.

## What sbomify does with CBOMs

- **Auto-detection.** Upload a CycloneDX document containing cryptographic assets and sbomify automatically classifies it as a CBOM, no special flag needed. You can also be explicit with `BOM_TYPE: cbom` in [sbomify-action](https://github.com/sbomify/sbomify-action), which uploads the document verbatim.
- **Crypto-asset inventory.** The document detail page renders an inventory of the cryptographic assets found: algorithms, key sizes, certificates, and protocols.
- **Post-quantum readiness.** The PQC readiness assessment plugin classifies each asset against NIST guidance and gives your component a post-quantum posture view, so you can see at a glance which algorithms are quantum-vulnerable and where.
- **Trust Center distribution.** CBOMs appear on your public release pages next to SBOMs and VEX, with the same access controls, and are exposed through the [Transparency Exchange API](/faq/how-do-i-enable-tea-in-sbomify/) as a supported artifact type.

## How do I generate a CBOM?

CBOM generation tools are still an emerging space. [cbomkit](https://github.com/PQCA/cbomkit) and IBM's CBOM tooling can scan source code for cryptographic usage, and CycloneDX 1.6+ has first-class support for cryptographic asset types. However you produce it, sbomify handles storage, classification, analysis, and distribution:

```yaml
- name: Upload CBOM
  uses: sbomify/sbomify-action@master
  env:
    COMPONENT_ID: 'my-component-id'
    SBOM_FILE: 'my-product.cbom.json'
    BOM_TYPE: cbom
    UPLOAD: true
```

## Further reading

- [What SBOM formats does sbomify support?](/faq/what-sbom-formats-does-sbomify-support/) - formats and BOM types overview
- [How do I enable TEA in sbomify?](/faq/how-do-i-enable-tea-in-sbomify/) - programmatic artifact discovery, CBOMs included
- [sbomify goes quantum-ready](/2026/07/07/announcing-sbomify-v26-7-0-the-one-that-gets-quantum-ready/) - the release announcement with more background
