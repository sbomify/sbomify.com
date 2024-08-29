---
layout: page
permalink: /resources/
title: SBOM Resources

---

The SBOM life cycle can be broken down into three phases: [generation, collaboration, and analysis]({{ site.url }}/features/generate-collaborate-analyze/). The structure below aligns with the life cycle.

## Generation

The generation phase is where you create an SBOM from a source. There are various strategies for generating SBOMs, but this phase generally involves taking a set of inputs (such as a dependency file) and generating an SBOM in either the [CycloneDX](https://cyclonedx.org/) or [SPDX](https://spdx.dev/) format.

### Generic

A collection of tools that spans multiple formats and languages:

* [Trivy](https://github.com/aquasecurity/trivy) from Aqua
* [Syft](https://github.com/anchore/syft) from Anchore

### Specific

Language or format-specific tools:

#### Docker / Containers

* [Tern](https://github.com/tern-tools/tern)
* [bom](https://github.com/kubernetes-sigs/bom) from the Linux Foundation

#### Python

* [CycloneDX Python](https://github.com/CycloneDX/cyclonedx-python) from CycloneDX
* [sbom4python](https://github.com/anthonyharrison/sbom4python) from Anthony Harrison
* [SPDX Python](https://github.com/spdx/tools-python) from SPDX

#### Rust

* [CycloneDX Rust](https://github.com/CycloneDX/cyclonedx-rust-cargo) from CycloneDX
* [sbom-rs](https://github.com/psastras/sbom-rs) from Paul Sastrasinh
* [sbom4rust](https://github.com/anthonyharrison/sbom4rust) from Anthony Harrison

#### Go

* [CycloneDX Go](https://github.com/CycloneDX/cyclonedx-gomod) from CycloneDX
* [SPDX Golang](https://github.com/spdx/tools-golang) from SPDX

#### .NET

* [CycloneDX .NET](https://github.com/CycloneDX/cyclonedx-dotnet-library) from CycloneDX
* [SBOM Tool](https://github.com/microsoft/sbom-tool) from Microsoft

#### Java

* [CycloneDX Java](https://github.com/CycloneDX/cyclonedx-core-java) from CycloneDX
* [SPDX Java](https://github.com/spdx/Spdx-Java-Library) from SPDX

#### JavaScript

* [CycloneDX JavaScript](https://github.com/CycloneDX/cyclonedx-javascript-library)
* [Retire.js](https://github.com/RetireJS/retire.js) from RetireJS
* [sbom4js](https://github.com/anthonyharrison/sbom4js) from Anthony Harrison

#### Others

* [protobom](https://github.com/protobom/protobom)
* [Hoppr](https://hoppr.dev/) by Lockheed Martin Corporation

### Assembly and Enrichment

* [Parlay](https://github.com/snyk/parlay) from Snyk
* [jq](https://github.com/jqlang/jq) is commonly used for assembly
* [sbomasm](https://github.com/interlynk-io/sbomasm) from Interlynk
* [sbomaudit](https://github.com/anthonyharrison/sbomaudit) from Anthony Harrison

## Collaboration

The collaboration phase focuses on how you share the SBOM with internal and external stakeholders.

* [sbomify]({{ site.url }})
* [Project Koala](https://github.com/CycloneDX/transparency-exchange-api) (a.k.a. Transparency Exchange API) from CycloneDX

## Analysis

The analysis phase involves how you use the SBOM, typically for compliance or security purposes. Mature organizations may use multiple tools or services for different purposes.

* [Dependency Track](https://dependencytrack.org/) by OWASP
* [GUAC](https://github.com/guacsec/guac) from Kusari
* [sbomaudit](https://github.com/anthonyharrison/sbomaudit) from Anthony Harrison
* [sbommerge](https://github.com/anthonyharrison/sbommerge) from Anthony Harrison
* [sbomqs](https://github.com/interlynk-io/sbomqs) from Interlynk

[Edit me on GitHub](https://github.com/sbomify/sbomify.com/blob/master/resources.md)
