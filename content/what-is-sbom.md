---
url: /what-is-sbom/
title: What is an SBOM?
description: "A Software Bill of Materials (SBOM) is a machine-readable inventory of every component in a piece of software. What goes in one, what the fields mean, how CycloneDX and SPDX differ, and what an SBOM cannot tell you."
tldr: "A Software Bill of Materials (SBOM) is a machine-readable inventory of every component, library, and dependency in your software. Think of it as an ingredients list for code. SBOMs are increasingly required by regulations like the EU Cyber Resilience Act and US Executive Order 14028, and are essential for vulnerability management, license compliance, and supply chain security."
faq:
  - question: "What does SBOM stand for?"
    answer: "SBOM stands for Software Bill of Materials. It is a machine-readable inventory of the components, libraries, and dependencies that make up a software product. The term borrows from manufacturing, where a bill of materials lists every part used to build a physical product."
  - question: "What is the meaning of SBOM?"
    answer: "An SBOM is a structured document listing every component in a piece of software - open source libraries, third-party packages, their versions, licences, and the relationships between them. It provides the transparency needed for vulnerability management, licence compliance, and supply chain security."
  - question: "How is SBOM pronounced?"
    answer: "Usually \"S-bomb\", rhyming with \"bomb\". Some say it letter by letter, \"S-B-O-M\". Both are understood."
  - question: "What format should an SBOM be in?"
    answer: "CycloneDX or SPDX, in JSON. Both are accepted by every major compliance framework, and CISA's 2026 minimum elements name both. Some regimes are stricter: BSI TR-03183-2, which governs EU CRA compliance in Germany, requires CycloneDX 1.6+ or SPDX 3.0.1+."
  - question: "Who is responsible for producing an SBOM?"
    answer: "Whoever produces the software. In practice generation is automated in CI, so it becomes an engineering responsibility rather than a compliance one - which is the right outcome, since only the build knows what actually went into the artifact."
  - question: "How often should an SBOM be regenerated?"
    answer: "Every release. CISA's Frequency element expects each software version or update to have an associated SBOM, and a new one when component details change or an error is corrected."
  - question: "Is an SBOM confidential?"
    answer: "That is your decision. An SBOM reveals your dependency graph, which some organisations treat as sensitive. Access controls may limit who receives it, but CISA's guidance is explicit that they should not prevent sharing with authorised parties, such as customers performing due diligence."
---

## What is an SBOM?

A **Software Bill of Materials (SBOM)** is a machine-readable inventory of every component, library, and dependency that makes up a piece of software. It records what each component is, which version is present, who produced it, and how the components relate to one another.

The analogy people reach for is the ingredients list on the back of a chocolate bar, and it holds up well enough: an SBOM tells you what is inside something you would otherwise have to take on trust. The analogy breaks down in one important way, though. A chocolate bar has perhaps fifteen ingredients. A modern web application routinely has **several thousand** components, most of which arrived indirectly, pulled in by something else you chose deliberately.

That is the actual problem an SBOM solves. Not "what did I install", which you already know, but "what is actually in the thing I am shipping", which almost nobody knows without generating one.

<div class="w-full max-w-2xl mx-auto">
  <img src="/assets/images/d2/what-is-sbom.svg" alt="What is an SBOM" class="w-full h-auto" width="1568" height="397">
</div>

## What is actually in an SBOM?

Most explanations stop at the definition. Here is the substance: an SBOM is a structured document with two layers of information — data about the document itself, and data about each component.

The clearest published specification of what belongs in one is [CISA's 2026 Minimum Elements](/compliance/cisa-minimum-elements/), which defines 17 data fields.

### Component-level fields

For every component in the software:

| Field                        | What it records                                       |
| ---------------------------- | ----------------------------------------------------- |
| **Component Name**           | The name the producer assigned to the component       |
| **Component Version**        | Which version is present                              |
| **Component Producer**       | The entity that created and identified the component  |
| **Component Identifiers**    | Machine-readable lookup keys, typically a PURL or CPE |
| **Component Hash Value**     | A cryptographic digest of the actual artifact         |
| **Component Hash Algorithm** | Which algorithm produced that digest                  |
| **Component License**        | The licence the component is available under          |
| **Dependency Relationship**  | Which components depend on which others               |

### Document-level fields

About the SBOM itself:

| Field                             | What it records                                 |
| --------------------------------- | ----------------------------------------------- |
| **SBOM Author**                   | Who created the SBOM data                       |
| **SBOM Author Signature**         | A digital signature attributable to that author |
| **SBOM Timestamp**                | When the data was last updated                  |
| **SBOM Tool Name and Version**    | What generated it                               |
| **SBOM Generation Context**       | Which lifecycle phase it was captured in        |
| **SBOM Data Format Name/Version** | Which format and version the file uses          |
| **SBOM Version**                  | Which revision of this SBOM this is             |

The document-level fields are the ones people forget, and they are the reason two SBOMs of the same software can disagree. An SBOM generated from source at build time and one generated by scanning a finished container image will produce different answers, and **SBOM Generation Context** is the field that tells you which you are holding.

If you would rather read the files than read about them, our [annotated SBOM examples](/sbom-examples/) show the same software in both CycloneDX and SPDX, field by field.

## Why SBOMs matter

### Vulnerability response

This is the use case that drives adoption. When a serious vulnerability lands in a widely used library, the question every organisation has to answer within hours is: **are we affected?**

Without an SBOM, answering that means engineers grepping through repositories and lockfiles, and the answer arrives in days and is not trustworthy. With SBOMs, it is a query. The value is not that an SBOM finds the vulnerability — a scanner does that — but that it tells you _where you have the component_, across every product and version you ship.

### Licence obligations

Every open source component carries a licence, and some carry obligations that attach to how you distribute your software. Copyleft licences in particular can require you to make source available. Discovering a GPL component in a proprietary product at audit time is considerably worse than discovering it at build time. The **Component License** field exists for this.

### Regulatory requirements

SBOMs have moved from good practice to legal requirement in several jurisdictions. The [EU Cyber Resilience Act](/compliance/eu-cra/) makes them binding for products with digital elements sold in the EU. In the US, [Executive Order 14028](/compliance/eo-14028/) and [CISA's minimum elements](/compliance/cisa-minimum-elements/) set expectations for federal procurement, and the [FDA](/compliance/fda-medical-device/) requires them for medical devices.

For the full picture — which frameworks apply to you, what each requires, and how the fields map — see the [SBOM Compliance Guide](/compliance/).

### Supplier due diligence

If you buy software, an SBOM lets you assess what you are taking on before you deploy it, rather than discovering it during an incident.

## CycloneDX and SPDX

Two formats matter in practice, and CISA's 2026 guidance names both:

**[CycloneDX](https://cyclonedx.org/)** comes from OWASP and is standardised as ECMA-424. It was designed for application security use cases, and its structure reflects that — vulnerability and exploitability data are first-class.

**[SPDX](https://spdx.dev/)** comes from the Linux Foundation and is standardised as ISO/IEC 5962. It grew out of licence compliance work and remains especially strong there, with a well-developed licence expression syntax.

Both are machine-readable, both are actively maintained, and both are accepted by every major compliance framework. You do not need to pick a winner; you need to pick the one your tooling and your customers expect, and be able to produce the other when asked. Our [detailed comparison](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/) covers where they genuinely differ.

## What an SBOM cannot tell you

Understanding the limits matters as much as understanding the definition, and this is where most introductions leave people with a false impression.

**An SBOM is not a vulnerability report.** It lists components. Determining which of those components have known vulnerabilities is a separate step, performed by scanning the SBOM against a vulnerability database. The SBOM is the input, not the output.

**A component with a vulnerability is not necessarily exploitable.** The vulnerable function may never be called. This gap is what [VEX](/faq/how-do-i-use-vex/) exists to close — it lets a producer state that a listed vulnerability does not affect the product, and why.

**An SBOM is only as complete as the process that generated it.** Tools that read package manifests will not see a binary copied into a container image during the build. This is why [generating an SBOM by scanning a finished container image](/guides/docker/) captures the system packages accurately and can miss your application entirely.

**An SBOM describes one version.** Every build produces a different artifact and needs its own SBOM. A single SBOM attached to a product generically, rather than to a specific release, is of limited use.

**An unsigned SBOM asserts nothing about its own integrity.** Anyone can generate a document claiming to describe your software. The **SBOM Author Signature** field is what turns an inventory into evidence.

## Where SBOMs come from

An SBOM has a lifecycle, and the parts after generation are where most organisations struggle.

1. **Generation** — produced during the build, when the dependency graph is authoritative. Our [language guides](/guides/) cover Python, JavaScript, Java, Go, Rust, C/C++, and a dozen others.
2. **Enrichment** — raw generator output is frequently missing licences, supplier names and hashes. These are precisely the fields regulators ask for.
3. **Distribution** — the SBOM has to reach the people who need it, whether that is a customer, an auditor, or your own security team.
4. **Analysis** — scanning against vulnerability data, checking licence obligations, and comparing versions over time.

The generation step is well served by open source tooling. The later steps are where the [SBOM lifecycle](/features/generate-collaborate-analyze/) tends to break down.

## Frequently Asked Questions

### What does SBOM stand for?

SBOM stands for **Software Bill of Materials**. It is a machine-readable inventory of the components, libraries, and dependencies that make up a software product. The term borrows from manufacturing, where a bill of materials lists every part used to build a physical product.

### What is the meaning of SBOM?

An SBOM is a structured document listing every component in a piece of software — open source libraries, third-party packages, their versions, licences, and the relationships between them. It provides the transparency needed for vulnerability management, licence compliance, and supply chain security.

### How is SBOM pronounced?

Usually "**S-bomb**", rhyming with "bomb". Some say it letter by letter, "S-B-O-M". Both are understood.

### What format should an SBOM be in?

[CycloneDX](https://cyclonedx.org/) or [SPDX](https://spdx.dev/), in JSON. Both are accepted by every major compliance framework, and CISA's 2026 minimum elements name both. Some regimes are stricter: BSI TR-03183-2, which governs [EU CRA](/compliance/eu-cra/) compliance in Germany, requires CycloneDX 1.6+ or SPDX 3.0.1+.

### Who is responsible for producing an SBOM?

Whoever produces the software. In practice generation is automated in CI, so it becomes an engineering responsibility rather than a compliance one — which is the right outcome, since only the build knows what actually went into the artifact.

### How often should an SBOM be regenerated?

Every release. CISA's Frequency element expects each software version or update to have an associated SBOM, and a new one when component details change or an error is corrected.

### Is an SBOM confidential?

That is your decision. An SBOM reveals your dependency graph, which some organisations treat as sensitive. Access controls may limit who receives it, but CISA's guidance is explicit that they should not prevent sharing with authorised parties, such as customers performing due diligence.

## Next steps

- **[Generate your first SBOM](/guides/)** — step-by-step guides for 15+ languages and platforms
- **[See real SBOMs](/sbom-examples/)** — the same software annotated in CycloneDX and SPDX
- **[Compliance requirements](/compliance/)** — which frameworks apply to you and what each demands
- **[SBOM formats compared](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/)** — CycloneDX and SPDX in detail
- **[What is a dependency?](/2026/01/29/what-is-a-dependency-in-software/)** — the components SBOMs document

## Going deeper

For a longer discussion of where SBOMs came from and where they are going, this interview with Allan Friedman, formerly of CISA, is the best single source:

{{< video-embed video_id="E77ohYZA2vo" title="SBOM Deep Dive with Allan Friedman" description="An in-depth discussion about SBOMs with Allan Friedman, formerly of CISA." upload_date="2024-07-29T07:37:01-07:00" >}}
