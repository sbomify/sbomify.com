---
layout: page
permalink: /resources/
title: SBOM Resources
description: "Discover the full SBOM life cycle: Generation, Distribution, and Analysis. Explore tools, benchmarks, and resources for creating, sharing, and utilizing Software Bills of Materials."
---

New to SBOMs? Start with [What is an SBOM?]({{ site.url }}/what-is-sbom/) to learn the basics.

The SBOM life cycle can be broken down into three phases: [generation, distribution, and analysis]({{ site.url }}/features/generate-collaborate-analyze/). The structure below aligns with the life cycle.

![Lifecycle](/assets/images/d2/lifecycle.svg)

There's also a GitHub repository called [sbom-benchmarks](https://github.com/sbomify/sbom-benchmarks) that sets to benchmark the various tools (from the Generation phase) against each other, along with providing examples how they are used.

For step-by-step guides on generating SBOMs for specific languages and platforms, see our comprehensive [SBOM Guides]({{ site.url }}/guides/).

---

## Video Resources

- Introduction to SBOMs: [sbomify at Ubuntu Engineering Sprint](https://www.youtube.com/watch?v=5mlR1lPz1no)
- Interview with the creator of CycloneDX: [SBOMs, CycloneDX, and Software Security with Steve Springett](https://vpetersson.com/podcast/S01E22.html)
- Interview with "the father of SBOMs": [SBOMs and Cybersecurity: A Deep Dive with Allan Friedman](https://vpetersson.com/podcast/S01E16.html)
- [A deep dive into the SBOM format SPDX](https://vpetersson.com/podcast/S02E01.html) with Kate Stewart from the Linux Foundation and Gary O'Neall, a long-time SPDX contributor, about the evolution of SPDX and its role in software transparency
- CRA deep dive with a member of the EU Commission's CRA expert group: [CRA Explained: What the Cyber Resilience Act Means for Device Manufacturers with Sarah Fluchs](https://vpetersson.com/podcast/S02E21.html)

---

## Generation / Authoring

The SBOM generation phase, also known as authoring, is where you create an SBOM from a source. There are various strategies for generating SBOMs, but this phase generally involves taking a set of inputs (such as a dependency file) and generating an SBOM in either the [CycloneDX](https://cyclonedx.org/) or [SPDX](https://spdx.dev/) format.

### Generic

Tools that spans multiple formats and languages.

- [sbomify GitHub Action](https://github.com/sbomify/github-action/) from sbomify
- [Snyk](https://github.com/snyk/cli) from Snyk
- [Syft](https://github.com/anchore/syft) from Anchore
- [Trivy](https://github.com/aquasecurity/trivy) from Aqua

### Specific

Language or format-specific tools.

#### Docker / Containers

See guide [SBOM Generation Guide for Docker and Containers]({{ site.url }}/guides/docker/) for more details.

You can see how they compare side-by-side in the [sbom-benchmark](https://github.com/sbomify/sbom-benchmarks/tree/master/docker) repository.

- [bom](https://github.com/kubernetes-sigs/bom) from The Linux Foundation
- [Tern](https://github.com/tern-tools/tern)

#### Python

See guide [The ultimate SBOM guide for Python]({{ site.url }}/guides/python/) for more language specific details.

You can see how they compare side-by-side in the [sbom-benchmark](https://github.com/sbomify/sbom-benchmarks/tree/master/python) repository.

- [CycloneDX Python](https://github.com/CycloneDX/cyclonedx-python) from CycloneDX
- [sbom4python](https://github.com/anthonyharrison/sbom4python) from Anthony Harrison
- [SPDX Python](https://github.com/spdx/tools-python) from SPDX

#### Rust

See guide [SBOM Generation Guide for Rust - Cargo]({{ site.url }}/guides/rust/) for more language specific details.

- [CycloneDX Rust](https://github.com/CycloneDX/cyclonedx-rust-cargo) from CycloneDX
- [sbom-rs](https://github.com/psastras/sbom-rs) from Paul Sastrasinh
- [sbom4rust](https://github.com/anthonyharrison/sbom4rust) from Anthony Harrison

#### Go

See guide [SBOM Generation Guide for Go - Go Modules]({{ site.url }}/guides/go/) for more language specific details.

- [CycloneDX Go](https://github.com/CycloneDX/cyclonedx-gomod) from CycloneDX
- [SPDX Golang](https://github.com/spdx/tools-golang) from SPDX

#### .NET

See guide [SBOM Generation Guide for .NET - NuGet]({{ site.url }}/guides/dotnet/) for more language specific details.

- [CycloneDX .NET](https://github.com/CycloneDX/cyclonedx-dotnet-library) from CycloneDX
- [SBOM Tool](https://github.com/microsoft/sbom-tool) from Microsoft

#### Java

See guide [SBOM Generation Guide for Java - Maven, Gradle]({{ site.url }}/guides/java/) for more language specific details.

- [CycloneDX Java](https://github.com/CycloneDX/cyclonedx-core-java) from CycloneDX
- [SPDX Java](https://github.com/spdx/Spdx-Java-Library) from SPDX

#### JavaScript

See guide [SBOM Generation Guide for JavaScript - npm, yarn, pnpm, Bun]({{ site.url }}/guides/javascript/) for more language specific details.

- [CycloneDX JavaScript](https://github.com/CycloneDX/cyclonedx-javascript-library)
- [Retire.js](https://github.com/RetireJS/retire.js) from RetireJS
- [sbom4js](https://github.com/anthonyharrison/sbom4js) from Anthony Harrison

#### Ruby

See guide [SBOM Generation Guide for Ruby - Bundler]({{ site.url }}/guides/ruby/) for more language specific details.

- [CycloneDX Ruby](https://github.com/CycloneDX/cyclonedx-ruby-gem) from CycloneDX

#### PHP

See guide [SBOM Generation Guide for PHP - Composer]({{ site.url }}/guides/php/) for more language specific details.

- [CycloneDX PHP Composer](https://github.com/CycloneDX/cyclonedx-php-composer) from CycloneDX

#### Swift

See guide [SBOM Generation Guide for Swift - Swift Package Manager]({{ site.url }}/guides/swift/) for more language specific details.

#### Dart / Flutter

See guide [SBOM Generation Guide for Dart and Flutter - pub]({{ site.url }}/guides/dart/) for more language specific details.

#### Elixir

See guide [SBOM Generation Guide for Elixir - Mix]({{ site.url }}/guides/elixir/) for more language specific details.

#### Scala

See guide [SBOM Generation Guide for Scala - sbt]({{ site.url }}/guides/scala/) for more language specific details.

#### C/C++

See guide [SBOM Generation Guide for C/C++ - Conan]({{ site.url }}/guides/cpp/) for more language specific details.

Related blog posts by [Chris Swan]({{ site.url }}/authors/cswan/):

- [The C conundrum - generating SBOMs when there's no lockfile]({{ site.url }}/2024/11/18/c-conundrum/)
- [Using Conan for C SBOMs]({{ site.url }}/2025/09/04/conan/)

#### Terraform

See guide [SBOM Generation Guide for Terraform - Infrastructure as Code]({{ site.url }}/guides/terraform/) for more language specific details.

#### Yocto

See guide [SBOM Generation Guide for Yocto - Embedded Linux]({{ site.url }}/guides/yocto/) for more details.

Related blog posts:

- [Mastering SBOM Generation with Yocto]({{ site.url }}/2025/02/21/mastering-sbom-generation-with-yocto/)

#### Raspberry Pi

See guide [SBOM Generation Guide for Raspberry Pi - rpi-image-gen]({{ site.url }}/guides/raspberry-pi/) for more details.

Related blog posts:

- [Unpacking Raspberry Pi's Built-In SBOM Magic]({{ site.url }}/2025/04/17/unpacking-raspberry-pi-s-built-in-sbom-magic/)

#### Others

- [Hoppr](https://hoppr.dev/) from Lockheed Martin Corporation
- [OSS Review Toolkit](https://github.com/oss-review-toolkit/ort) (ORT)
- [protobom](https://github.com/protobom/protobom)

### Assembly and Enrichment

- [CycloneDX Editor/Validator](https://github.com/Festo-se/cyclonedx-editor-validator/) from Festo
- [jq](https://github.com/jqlang/jq) is commonly used for assembly
- [Parlay](https://github.com/snyk/parlay) from Snyk
- [sbomasm](https://github.com/interlynk-io/sbomasm) from Interlynk
- [sbomaudit](https://github.com/anthonyharrison/sbomaudit) from Anthony Harrison

---

## Distribution / Transportation

The distribution phase, also known as Transportation, focuses on how you share the SBOM with internal and external stakeholders.

- [sbomify]({{ site.url }})
- [Project Koala](https://github.com/CycloneDX/transparency-exchange-api) (a.k.a. Transparency Exchange API) from CycloneDX

---

## Analysis

The analysis phase involves how you use the SBOM, typically for compliance or security purposes. Mature organizations may use multiple tools or services for different purposes.

- [bomber](https://github.com/devops-kung-fu/bomber) from DKFM
- [bomshell](https://github.com/puerco/bomshell) from Adolfo García Veytia (a.k.a. Puerco)
- [Cybellum](https://cybellum.com/) from Cybellum
- [Dependency Track](https://dependencytrack.org/) from OWASP
- [Eclipse SW360](https://github.com/eclipse-sw360/sw360)
- [Grype](https://github.com/anchore/grype) from Anchore
- [GUAC](https://guac.sh) from OpenSSF
- [Helm](https://www.medcrypt.com/solutions/helm) from Medcrypt
- [NTIA Conformance Checker](https://github.com/spdx/ntia-conformance-checker) from SPDX
- [Open Source Vulnerabilities](https://osv.dev/) (OSV) from Google
- [SBOM Observer](https://sbom.observer/) from Bitfront
- [sbomaudit](https://github.com/anthonyharrison/sbomaudit) from Anthony Harrison
- [sbommerge](https://github.com/anthonyharrison/sbommerge) from Anthony Harrison
- [sbomqs](https://github.com/interlynk-io/sbomqs) from Interlynk
- [SecObserve](https://github.com/SecObserve/SecObserve) from Stefan Fleckenstein

---

## Other SBOM resources

- CISA's [SBOM Sharing Primer](https://www.cisa.gov/sites/default/files/2024-05/SBOM%20Sharing%20Primer.pdf)
- CISA's [Software Bill of Materials (SBOM) Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf)
- CISA's [Framing Software Component Transparency: Establishing a Common Software Bill of Materials (SBOM)](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf) (3rd Edition)
- NTIA's [The Minimum Elements For a Software Bill of Materials (SBOM)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf) (2021)
- CISA's [2025 Minimum Elements for a Software Bill of Materials (SBOM)](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom) (Public Comment Draft, updates the 2021 NTIA guidance)

<div class="mt-16 flex justify-center">
  <a href="https://github.com/sbomify/sbomify.com/blob/master/resources.md" class="inline-flex items-center gap-2 !text-gray-500 hover:!text-gray-900 transition-colors !no-underline text-sm font-medium">
    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
    <span>Edit this page on GitHub</span>
  </a>
</div>
