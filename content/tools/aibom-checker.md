---
title: "AIBOM Validator"
seo_title: "Free AIBOM Validator (CycloneDX and SPDX 3 AI BOM)"
layout: sbom-checker
weight: 4
lede: "A free online AIBOM validator: check an AI Bill of Materials in CycloneDX or SPDX 3 against the official schema and for the fields every model and dataset needs. Everything runs in your browser."
description: "Free online AIBOM validator. Check a CycloneDX or SPDX 3 AI Bill of Materials against its schema and for required model and dataset fields, in your browser."
keywords: [AIBOM validator, AI BOM validator, AI bill of materials, validate AIBOM, ML-BOM, CycloneDX ML-BOM, SPDX 3 AI profile, model card, AI supply chain]
cta: false
checker:
  kind: aibom
  formats: "CycloneDX 1.5–1.7 and SPDX 3.0 (JSON)"
  promise: "Schema plus the fields each model and dataset needs"
  examples:
    - url: "/tools/aibom-checker/example.aibom.cdx.json"
      name: "example.aibom.cdx.json"
      label: "Try a CycloneDX example"
    - url: "/tools/aibom-checker/example.aibom.spdx.json"
      name: "example.aibom.spdx.json"
      label: "Try an SPDX 3 example"
  ctaLead: "An AIBOM is most useful when every release has one, kept with the SBOMs for the software around the model."
  ctaBody: "Upload AIBOMs to sbomify alongside your SBOMs, keep one for every release you ship and share them with customers through your Trust Center."
# Card on the /tools/ landing page (layouts/tools/list.html).
card:
  icon: "brain"
  summary: "Drop in a CycloneDX ML-BOM or an SPDX 3 AI BOM and see whether it is valid and whether every model and dataset carries the fields that identify it."
  button: "Validate an AIBOM"
  checks:
    - label: "CycloneDX 1.5 to 1.7 and SPDX 3.0 schema validation"
    - label: "Model supplier, version and model card"
    - label: "SPDX 3 AI and Dataset profile mandatory properties"
# Structured data: WebApplication (layouts/partials/head.html).
app:
  name: "sbomify AIBOM Validator"
  category: "DeveloperApplication"
  features:
    - "CycloneDX 1.5 to 1.7 and SPDX 3.0.0 and 3.0.1 JSON schema validation"
    - "Required fields for machine learning models: supplier, version and model card"
    - "SPDX 3 AI and Dataset profile mandatory properties"
    - "Training data and licence recommendations"
    - "Runs entirely in the browser; the AIBOM is never uploaded"
# Structured data: FAQPage. Same questions and answers as the FAQ section in
# the body; keep the two in step.
faq:
  - question: "How do I validate an AIBOM?"
    answer: "Drop a CycloneDX or SPDX 3 JSON file onto the AIBOM validator. It validates the document against the official schema for the version it declares, then checks that it describes at least one AI model and that each model and dataset has the fields its format requires, and lists every gap with how to fix it."
  - question: "Which AIBOM formats are supported?"
    answer: "CycloneDX 1.5, 1.6 and 1.7 (machine-learning-model components with a modelCard, sometimes called an ML-BOM), and SPDX 3.0.0 and 3.0.1 with the AI and Dataset profiles, in JSON. SPDX 2 has no way to describe a model."
  - question: "Is my AIBOM uploaded anywhere?"
    answer: "No. The validator is a script that runs in your browser. The AIBOM is read from your disk into the page and never sent to sbomify or anyone else."
---

## What the validator does

An AI Bill of Materials (AIBOM) describes the AI models in a product and the data they were trained on: who supplied each model, which version it is, what it does and under which licence it may be used. The validator reads the AIBOM in your browser and runs two kinds of checks. Nothing is uploaded.

### Is it a valid document?

The document is validated against the official JSON schema for the version it declares: [CycloneDX](https://cyclonedx.org/capabilities/mlbom/) 1.5 to 1.7, or [SPDX](https://spdx.dev/use/specifications/) 3.0.0 and 3.0.1. Schema errors come with their location in the document, for example `components[0] "example-ticket-classifier" → modelCard`.

### Does it have the required fields?

**CycloneDX** describes a model as a component of type `machine-learning-model` with a `modelCard`, and training data as components of type `data`. The schema requires only a type and a name.

| Required (fails if missing)           | Field                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| CycloneDX 1.5 or later (the document) | `specVersion`                                           |
| AI models (the document)              | At least one component of type `machine-learning-model` |
| Model supplier (every model)          | `supplier.name`, `manufacturer.name` or `authors`       |
| Model version (every model)           | `version`                                               |
| Model card (every model)              | `modelCard`                                             |

| Recommended (warning if missing)  | Field                                |
| --------------------------------- | ------------------------------------ |
| Model task (every model)          | `modelCard.modelParameters.task`     |
| Training data (every model)       | `modelCard.modelParameters.datasets` |
| Model licence (every model)       | `licenses`                           |
| Subject of the BOM (the document) | `metadata.component`                 |
| Timestamp (the document)          | `metadata.timestamp`                 |

**SPDX 3** describes a model as an `ai_AIPackage` and a dataset as a `dataset_DatasetPackage`. The AI and Dataset profiles make several properties mandatory that the JSON schema leaves optional; the validator checks them.

| Required (fails if missing)                                 | Field                                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| AI models (the document)                                    | At least one `ai_AIPackage`                                                                                               |
| AI profile properties (every `ai_AIPackage`)                | `suppliedBy`, `releaseTime`, `software_packageVersion`, `software_downloadLocation`, `software_primaryPurpose`            |
| Dataset profile properties (every `dataset_DatasetPackage`) | `originatedBy`, `releaseTime`, `builtTime`, `software_downloadLocation`, `software_primaryPurpose`, `dataset_datasetType` |

| Recommended (warning if missing)     | Field                                                        |
| ------------------------------------ | ------------------------------------------------------------ |
| Training data (every `ai_AIPackage`) | A `trainedOn` or `testedOn` relationship                     |
| Model licence (every `ai_AIPackage`) | A `hasDeclaredLicense` or `hasConcludedLicense` relationship |

## Frequently asked questions

### How do I validate an AIBOM?

Drop a CycloneDX or SPDX 3 JSON file onto the validator above. It validates the document against the official schema for the version it declares, then checks that it describes at least one AI model and that each model and dataset has the fields its format requires, and lists every gap with how to fix it.

### Which AIBOM formats are supported?

CycloneDX 1.5, 1.6 and 1.7 (`machine-learning-model` components with a `modelCard`, sometimes called an ML-BOM), and SPDX 3.0.0 and 3.0.1 with the AI and Dataset profiles, in JSON. SPDX 2 has no way to describe a model.

### Is my AIBOM uploaded anywhere?

No. The validator is a script that runs in your browser. The AIBOM is read from your disk into the page and never sent to sbomify or anyone else.
