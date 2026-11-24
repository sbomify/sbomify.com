---
title: "HBOM Validator"
seo_title: "Free HBOM Validator (CycloneDX Hardware BOM)"
layout: sbom-checker
weight: 3
lede: "A free online HBOM validator: check a CycloneDX Hardware Bill of Materials against the official schema and for the fields that identify every part. Everything runs in your browser."
description: "Free online HBOM validator. Check a CycloneDX Hardware Bill of Materials against its schema and for required fields, in your browser."
keywords: [HBOM validator, HBOM checker, hardware bill of materials, validate HBOM, CycloneDX HBOM, HBOM schema, hardware supply chain]
cta: false
checker:
  kind: hbom
  formats: "CycloneDX 1.2–1.7 (JSON)"
  promise: "Schema plus the fields that identify each part"
  examples:
    - url: "/tools/hbom-checker/example.hbom.json"
      name: "example.hbom.json"
      label: "Try an HBOM example"
  ctaLead: "An HBOM is most useful when every hardware release has one, kept with the SBOMs for the firmware and software that run on it."
  ctaBody: "Upload HBOMs to sbomify alongside your SBOMs, keep one for every release you ship and share them with customers through your Trust Center."
# Card on the /tools/ landing page (layouts/tools/list.html).
card:
  icon: "cpu"
  summary: "Drop in a CycloneDX Hardware BOM and see whether it is valid and whether every device has a name, a manufacturer and a revision."
  button: "Validate an HBOM"
  checks:
    - label: "CycloneDX 1.2 to 1.7 schema validation"
    - label: "Device name, manufacturer and version or revision"
    - label: "Hardware identifiers (CPE, package URL or SWID)"
# Structured data: WebApplication (layouts/partials/head.html).
app:
  name: "sbomify HBOM Validator"
  category: "DeveloperApplication"
  features:
    - "CycloneDX 1.2 to 1.7 JSON schema validation"
    - "Required fields for every hardware device: name, manufacturer, version or revision"
    - "Hardware identifier check (CPE, package URL or SWID)"
    - "Runs entirely in the browser; the HBOM is never uploaded"
# Structured data: FAQPage. Same questions and answers as the FAQ section in
# the body; keep the two in step.
faq:
  - question: "How do I validate an HBOM?"
    answer: "Drop a CycloneDX JSON file onto the HBOM validator. It validates the document against the official CycloneDX schema for the version it declares, then checks that it lists hardware devices and that each one has a name, a manufacturer and a version or revision, and lists every gap with how to fix it."
  - question: "Which HBOM formats are supported?"
    answer: "CycloneDX 1.2 to 1.7 in JSON. Hardware is described as components of type device. SPDX has no hardware component type, so SPDX documents are not HBOMs."
  - question: "Is my HBOM uploaded anywhere?"
    answer: "No. The validator is a script that runs in your browser. The HBOM is read from your disk into the page and never sent to sbomify or anyone else."
---

## What the validator does

A Hardware Bill of Materials (HBOM) lists the physical parts of a product (boards, chips, modules and the parts they are built from) as CycloneDX components of type `device`, nested under the assembly they belong to. The validator reads the HBOM in your browser and runs two kinds of checks. Nothing is uploaded.

### Is it a valid CycloneDX document?

The document is validated against the official [CycloneDX](https://cyclonedx.org/capabilities/hbom/) JSON schema for the version it declares, 1.2 to 1.7. Schema errors come with their location in the document, for example `components[0] "SH-MB mainboard" → components[2] → manufacturer`.

### Does it have the required fields?

The schema requires only a type and a name for each component. To identify a part, and to match it against vulnerability, end-of-life and counterfeit data, each device needs more.

| Required (fails if missing)        | Field                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| Hardware components (the document) | At least one component of type `device`                 |
| Device name (every device)         | `name`, not blank                                       |
| Manufacturer (every device)        | `manufacturer.name` (CycloneDX 1.6+) or `supplier.name` |
| Version or revision (every device) | `version`: the model, hardware revision or part number  |

| Recommended (warning if missing)  | Field                              |
| --------------------------------- | ---------------------------------- |
| Unique identifier (every device)  | `cpe` (part `h`), `purl` or `swid` |
| Subject of the BOM (the document) | `metadata.component`               |
| Timestamp (the document)          | `metadata.timestamp`               |

Devices are found wherever they are in the document: in `components`, nested inside other components, or as `metadata.component`. Firmware and software components are counted but not checked here; check the SBOM for those with the [SBOM checker](/tools/sbom-checker/).

## Frequently asked questions

### How do I validate an HBOM?

Drop a CycloneDX JSON file onto the validator above. It validates the document against the official CycloneDX schema for the version it declares, then checks that it lists hardware devices and that each one has a name, a manufacturer and a version or revision, and lists every gap with how to fix it.

### Which HBOM formats are supported?

CycloneDX 1.2 to 1.7 in JSON. Hardware is described as components of type `device`. SPDX has no hardware component type, so SPDX documents are not HBOMs.

### Is my HBOM uploaded anywhere?

No. The validator is a script that runs in your browser. The HBOM is read from your disk into the page and never sent to sbomify or anyone else.
