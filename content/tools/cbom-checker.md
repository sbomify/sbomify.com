---
title: "CBOM Validator"
seo_title: "Free CBOM Validator (CycloneDX Cryptography BOM)"
layout: sbom-checker
weight: 2
lede: "A free online CBOM validator: check a CycloneDX Cryptography Bill of Materials against the official schema and for the fields every cryptographic asset needs. Everything runs in your browser."
description: "Free online CBOM validator. Check a CycloneDX 1.6 or 1.7 Cryptography Bill of Materials against its schema and for required fields, in your browser."
keywords: [CBOM validator, CBOM checker, cryptography bill of materials, validate CBOM, CycloneDX CBOM, CBOM schema, cryptographic asset inventory, post-quantum readiness]
cta: false
checker:
  kind: cbom
  formats: "CycloneDX 1.6 and 1.7 (JSON)"
  promise: "Schema plus the fields each cryptographic asset needs"
  examples:
    - url: "/tools/cbom-checker/example.cbom.json"
      name: "example.cbom.json"
      label: "Try a CBOM example"
  ctaLead: "A CBOM is most useful when every release has one and you can see which algorithms in it are on borrowed time."
  ctaBody: "Upload a CBOM to sbomify and get a browsable inventory of your cryptographic assets, each graded against NIST post-quantum guidance, next to the SBOMs for the same release. Share it with customers through your Trust Center."
# Card on the /tools/ landing page (layouts/tools/list.html).
card:
  icon: "key"
  summary: "Drop in a CycloneDX Cryptography BOM and see whether it is valid and whether every algorithm, certificate, protocol and key carries the fields that identify it."
  button: "Validate a CBOM"
  checks:
    - label: "CycloneDX 1.6 and 1.7 schema validation"
    - label: "Cryptographic asset types and their required properties"
    - label: "References between assets resolve"
# Structured data: WebApplication (layouts/partials/head.html).
app:
  name: "sbomify CBOM Validator"
  category: "DeveloperApplication"
  features:
    - "CycloneDX 1.6 and 1.7 JSON schema validation"
    - "Required fields for algorithms, certificates, protocols and related crypto material"
    - "Checks that references between cryptographic assets resolve"
    - "Runs entirely in the browser; the CBOM is never uploaded"
# Structured data: FAQPage. Same questions and answers as the FAQ section in
# the body; keep the two in step.
faq:
  - question: "How do I validate a CBOM?"
    answer: "Drop a CycloneDX JSON file onto the CBOM validator. It validates the document against the official CycloneDX schema for the version it declares, then checks that it lists cryptographic assets and that each one has the fields that say what it is, and lists every gap with how to fix it."
  - question: "Which CBOM versions are supported?"
    answer: "CycloneDX 1.6 and 1.7 in JSON, the versions that define the cryptographic-asset component type. Earlier pre-standard CBOMs (component type crypto-asset on CycloneDX 1.4) are recognised and flagged, so you know to regenerate them."
  - question: "Is my CBOM uploaded anywhere?"
    answer: "No. The validator is a script that runs in your browser. The CBOM is read from your disk into the page and never sent to sbomify or anyone else."
  - question: "Does it tell me whether my cryptography is quantum-safe?"
    answer: "No. The validator checks that the CBOM is well formed and complete enough to assess. Grading each algorithm against NIST post-quantum guidance is what sbomify does when you upload the CBOM."
---

## What the validator does

A [Cryptography Bill of Materials](/2024/04/10/future-proofing-cybersecurity-with-the-cryptography-bill-of-materials-cbom/) (CBOM) lists the algorithms, certificates, protocols and keys a product uses, as CycloneDX components of type `cryptographic-asset`. The validator reads the CBOM in your browser and runs two kinds of checks. Nothing is uploaded.

### Is it a valid CycloneDX document?

The document is validated against the official [CycloneDX](https://cyclonedx.org/capabilities/cbom/) JSON schema for the version it declares. Cryptographic assets are part of CycloneDX from version 1.6, so a CBOM should declare 1.6 or 1.7. Schema errors come with their location in the document, for example `components[3] "AES-256-GCM" → cryptoProperties`.

### Does it have the required fields?

The schema requires only that each cryptographic asset says which kind it is. Without the properties below, a reader, or a post-quantum readiness check, cannot tell one asset from another.

| Required (fails if missing)                              | Field                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CycloneDX 1.6 or later (the document)                    | `specVersion`                                                                                                            |
| Cryptographic assets (the document)                      | At least one component of type `cryptographic-asset`                                                                     |
| Asset type (every cryptographic asset)                   | `cryptoProperties.assetType`                                                                                             |
| Algorithm primitive (algorithms)                         | `algorithmProperties.primitive`                                                                                          |
| Certificate subject and issuer (certificates)            | `certificateProperties.subjectName` and `issuerName`                                                                     |
| Protocol type (protocols)                                | `protocolProperties.type`                                                                                                |
| Crypto material type (keys and other material)           | `relatedCryptoMaterialProperties.type`                                                                                   |
| References between assets (assets that reference others) | Every `signatureAlgorithmRef`, `algorithmRef`, `cryptoRefArray` and cipher suite entry names a `bom-ref` in the document |

| Recommended (warning if missing)            | Field                                |
| ------------------------------------------- | ------------------------------------ |
| Algorithm OID (algorithms)                  | `cryptoProperties.oid`               |
| Certificate validity (certificates)         | `notValidBefore` and `notValidAfter` |
| Asset reference (every cryptographic asset) | `bom-ref`                            |
| Subject of the BOM (the document)           | `metadata.component`                 |
| Timestamp (the document)                    | `metadata.timestamp`                 |

A component counts as a cryptographic asset when its type is `cryptographic-asset` or it carries `cryptoProperties`, which is how sbomify recognises CBOM content on upload. A software SBOM with a few cryptographic assets in it can be checked here too.

## Frequently asked questions

### How do I validate a CBOM?

Drop a CycloneDX JSON file onto the validator above. It validates the document against the official CycloneDX schema for the version it declares, then checks that it lists cryptographic assets and that each one has the fields that say what it is, and lists every gap with how to fix it.

### Which CBOM versions are supported?

CycloneDX 1.6 and 1.7 in JSON, the versions that define the `cryptographic-asset` component type. Earlier pre-standard CBOMs (component type `crypto-asset` on CycloneDX 1.4) are recognised and flagged, so you know to regenerate them.

### Is my CBOM uploaded anywhere?

No. The validator is a script that runs in your browser. The CBOM is read from your disk into the page and never sent to sbomify or anyone else.

### Does it tell me whether my cryptography is quantum-safe?

No. The validator checks that the CBOM is well formed and complete enough to assess. Grading each algorithm against NIST post-quantum guidance is what [sbomify does when you upload the CBOM](/2026/07/07/announcing-sbomify-v26-7-0-the-one-that-gets-quantum-ready/).
