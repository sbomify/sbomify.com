---
title: "How do I upload a CBOM to sbomify?"
description: "Upload a Cryptography Bill of Materials (CBOM) to sbomify via the API, the CI/CD action, or the web UI, and let auto-detection tag it correctly."
answer: "Upload a CBOM exactly like an SBOM: through the API, the sbomify-action in CI, or the web UI. sbomify auto-detects CycloneDX documents whose components are cryptographic assets and tags them cbom; for a mixed document (software components plus crypto assets), set bom_type=cbom explicitly or let it run both the SBOM and crypto pipelines side by side."
tldr: "Same upload paths as SBOMs. Pure CBOMs are auto-detected; mixed documents keep their SBOM analyses and gain a crypto inventory on top. All CBOM lineages work: CycloneDX 1.6, 1.7, and legacy IBM CBOM 1.0."
weight: 87
keywords: [CBOM upload, cryptography bill of materials, CycloneDX CBOM, crypto inventory, bom_type cbom, CBOM API]
url: /faq/how-do-i-upload-a-cbom/
---

## Three ways in

1. **API**: `POST /api/v1/sboms/artifact/cyclonedx/{component_id}` with the CBOM as the request body, exactly like an SBOM upload. Add `?bom_type=cbom` to tag it explicitly.
2. **CI/CD**: the [sbomify-action](https://github.com/sbomify/sbomify-action) uploads a pre-generated CBOM verbatim with `bom-type: cbom`, or generates one for you with `cbom-generate: true`.
3. **Web UI**: upload the file on the component page like any other artifact.

## What auto-detection does

A CycloneDX document whose components are all cryptographic assets is a pure CBOM and gets tagged `cbom` automatically. A software SBOM that carries some crypto assets keeps `bom_type=sbom` so it retains NTIA checks and vulnerability scanning, and the crypto inventory, post-quantum grading, and posture card run on it anyway. You lose nothing either way.

## Which formats work

Every CBOM lineage in circulation: CycloneDX 1.6 (what most scanners emit today), CycloneDX 1.7 with cryptography-registry identifiers, and the legacy IBM CBOM 1.0 format from older cbomkit and sonar-cryptography releases. The stored bytes are never modified; every analysis is derived on read.

See the [CBOM feature page](/features/cbom/) for what happens after upload.
