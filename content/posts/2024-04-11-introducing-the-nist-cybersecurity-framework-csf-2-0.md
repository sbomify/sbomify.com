---

title: "NIST Cybersecurity Framework (CSF) 2.0: What It Means for Software Supply Chain Security"
description: "A practical guide to NIST CSF 2.0, its six core functions including the new GOVERN function, and how SBOMs support CSF 2.0 implementation for supply chain risk management and vulnerability monitoring."
categories:
  - compliance
tags: [nist, csf, security, standards, compliance, sbom, supply-chain]
tldr: "NIST CSF 2.0, released February 2024, adds a sixth core function (GOVERN) and significantly expands supply chain risk management guidance. SBOMs directly support CSF 2.0 implementation across multiple functions: asset identification (IDENTIFY), data protection (PROTECT), continuous monitoring (DETECT), and supply chain governance (GOVERN). Organizations implementing CSF 2.0 should treat SBOM adoption as a foundational capability."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is NIST CSF 2.0?"
    answer: "NIST CSF 2.0 is the updated Cybersecurity Framework released by the National Institute of Standards and Technology in February 2024. It provides a taxonomy of high-level cybersecurity outcomes organized into six core functions: GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, and RECOVER. The framework is voluntary but widely adopted as a de facto standard for cybersecurity risk management across industries."
  - question: "What is new in CSF 2.0 compared to CSF 1.1?"
    answer: "The biggest change is the addition of GOVERN as a sixth core function, elevating cybersecurity governance to a top-level concern alongside technical controls. CSF 2.0 also significantly expands supply chain risk management (C-SCRM) guidance, broadens its target audience beyond critical infrastructure to all organizations, introduces Organizational Profiles and Tiers for maturity assessment, and provides more implementation guidance through Community Profiles and Quick Start Guides."
  - question: "How do SBOMs support NIST CSF 2.0 implementation?"
    answer: "SBOMs support multiple CSF 2.0 functions. Under IDENTIFY, SBOMs provide the software asset inventory needed for asset management (ID.AM). Under PROTECT, they enable license compliance and supply chain integrity checks. Under DETECT, continuous SBOM monitoring against vulnerability databases enables automated threat detection. Under GOVERN, SBOM policies and processes demonstrate supply chain risk management maturity."
  - question: "Is NIST CSF 2.0 mandatory?"
    answer: "CSF 2.0 is voluntary for private-sector organizations, but it is effectively mandatory for U.S. federal agencies. Many regulated industries (healthcare, finance, energy) use CSF as a baseline for their cybersecurity programs, and auditors frequently reference it. Additionally, compliance frameworks like CMMC and FedRAMP map to CSF, making it a practical requirement for organizations in those ecosystems."
  - question: "How does CSF 2.0 address supply chain risk?"
    answer: "CSF 2.0 integrates supply chain risk management throughout the framework rather than treating it as a separate concern. The GOVERN function includes explicit supply chain governance outcomes. The IDENTIFY function covers supply chain asset management. The PROTECT and DETECT functions address supply chain integrity and monitoring. This cross-cutting approach reflects the reality that supply chain risk touches every aspect of cybersecurity."
date: 2024-04-11
slug: introducing-the-nist-cybersecurity-framework-csf-2-0
---

In February 2024, the National Institute of Standards and Technology (NIST) released version 2.0 of the Cybersecurity Framework — the most significant update since the framework's original publication in 2014. CSF 2.0 reflects a decade of lessons learned from real-world cybersecurity incidents, supply chain attacks, and the growing recognition that cybersecurity governance is as important as technical controls.

For organizations building or consuming software, CSF 2.0 is particularly relevant because of its expanded treatment of supply chain risk management — and [SBOMs](/what-is-sbom/) are a foundational capability for meeting many of its outcomes.

## The Six Core Functions

CSF 2.0 organizes cybersecurity outcomes into six core functions. The most significant structural change from CSF 1.1 is the addition of GOVERN as a new top-level function.

### GOVERN (New in CSF 2.0)

The GOVERN function establishes and monitors the organization's cybersecurity risk management strategy, expectations, and policy. It elevates cybersecurity governance from a background concern to an explicit, measurable function — recognizing that cybersecurity decisions are fundamentally business decisions.

Key outcomes include:

- **Organizational context** — Understanding the organization's mission, stakeholder expectations, and legal/regulatory requirements
- **Risk management strategy** — Establishing risk tolerance, priorities, and resource allocation
- **Supply chain risk management** — Policies and processes for managing cybersecurity risk in the supply chain
- **Roles and responsibilities** — Clear accountability for cybersecurity outcomes

The explicit inclusion of supply chain risk management in GOVERN signals that NIST considers it a governance-level concern, not just a technical one.

### IDENTIFY

The IDENTIFY function focuses on understanding the organization's assets, business environment, and risk exposure. For software supply chain security, this means knowing what software you use, what components it contains, and what risks those components introduce.

Key categories:

- **Asset Management (ID.AM)** — Inventorying hardware, software, data, and services
- **Risk Assessment (ID.RA)** — Understanding threats, vulnerabilities, and their potential impact
- **Improvement (ID.IM)** — Continuous assessment and refinement of cybersecurity practices

### PROTECT

The PROTECT function implements safeguards to ensure delivery of services. In the supply chain context, this includes ensuring software integrity, managing access controls, and maintaining secure configurations.

### DETECT

The DETECT function defines activities to identify cybersecurity events in a timely manner. For software supply chains, this means continuous monitoring of components for newly disclosed vulnerabilities.

### RESPOND

The RESPOND function covers activities to take action on detected cybersecurity incidents — including communication, analysis, mitigation, and improvements based on lessons learned.

### RECOVER

The RECOVER function focuses on restoring capabilities impaired by a cybersecurity incident — including recovery planning, improvements, and communications.

## CSF 2.0 Components

Beyond the six functions, CSF 2.0 provides structural tools for implementation:

### Organizational Profiles

Profiles help organizations articulate their current cybersecurity posture ("Current Profile") and their target state ("Target Profile"). The gap between the two drives prioritized improvements. This is particularly useful for organizations beginning their supply chain security journey — the Current Profile honestly assesses what's in place, while the Target Profile defines what "good" looks like.

### Tiers

CSF 2.0 defines four tiers of cybersecurity risk management maturity:

1. **Partial** — Ad hoc, reactive practices with limited awareness of supply chain risk
2. **Risk Informed** — Risk management processes are in place but may not be organization-wide
3. **Repeatable** — Formal policies and procedures consistently applied, including supply chain risk management
4. **Adaptive** — Continuous improvement based on lessons learned and predictive indicators

Organizations should use tiers honestly — most organizations starting their SBOM journey are at Tier 1 or 2, and that's a legitimate starting point.

### Community Profiles and Quick Start Guides

NIST provides supplementary resources including Community Profiles (pre-built profiles for specific sectors or use cases) and Quick Start Guides for organizations new to the framework. These resources are available on the [NIST CSF website](https://www.nist.gov/cyberframework).

## How SBOMs Support CSF 2.0 Implementation

SBOMs are not mentioned as a standalone requirement in CSF 2.0, but they directly support outcomes across multiple functions. Organizations implementing CSF 2.0 should consider SBOM adoption as a foundational capability.

### GOVERN: Supply Chain Risk Management Policy

The GOVERN function expects organizations to have policies and processes for managing supply chain risk. Implementing SBOM requirements — for both internally developed software and vendor-provided software — is a concrete, auditable way to demonstrate supply chain governance.

Specific actions:

- Establish a policy requiring SBOM generation for all internally developed software
- Include SBOM requirements in vendor procurement contracts
- Define acceptable license policies and vulnerability response SLAs
- Use a management platform like [sbomify](https://sbomify.com) to enforce these policies consistently

### IDENTIFY: Software Asset Management

The IDENTIFY function's Asset Management category (ID.AM) requires organizations to inventory their assets, including software. SBOMs provide the most granular and accurate form of software asset inventory available — down to the individual library version and its transitive dependencies.

Without SBOMs, software asset management typically stops at the application level ("we use Product X version Y"). With SBOMs, asset management extends to "Product X version Y contains 847 open source components, including Log4j 2.17.1 and OpenSSL 3.0.8." This granularity is exactly what vulnerability response requires.

sbomify's [SBOM hierarchy](/features/sbom-hierarchy/) maps this to organizational structure: products contain projects, projects contain components. This aligns naturally with CSF 2.0's emphasis on understanding organizational context.

### PROTECT: Supply Chain Integrity

The PROTECT function includes safeguards for data security and platform integrity. In the supply chain context, this means verifying that software components are authentic and haven't been tampered with.

SBOM attestation provides cryptographic verification of integrity and provenance. On GitHub Actions, the `attest-build-provenance` action creates SLSA build provenance attestations for SBOMs generated by the sbomify action, allowing recipients to verify that the SBOM was produced by a legitimate CI/CD pipeline — not manually assembled or modified after the fact.

### DETECT: Continuous Vulnerability Monitoring

The DETECT function's Continuous Monitoring category is where SBOMs deliver perhaps their most tangible value. By ingesting SBOMs into a management platform and continuously cross-referencing components against vulnerability databases, organizations implement automated detection of newly disclosed vulnerabilities.

With sbomify, this works as follows:

1. SBOMs are generated in CI/CD and ingested into the platform
2. Every component is continuously checked against Google OSV and other vulnerability databases
3. When a new vulnerability is disclosed that affects a component in your inventory, you're alerted automatically
4. The SBOM hierarchy tells you exactly which products and services are affected

This transforms vulnerability response from "search every application to see if we're affected" to "check the alert to see which products contain the affected component." For more on this workflow, see our guide on [SBOM scanning for vulnerability detection](/2026/02/01/sbom-scanning-vulnerability-detection/).

### RESPOND and RECOVER: Incident Context

During incident response, SBOMs provide the context needed for rapid triage. When a zero-day vulnerability is disclosed, the first question is always "are we affected?" With SBOMs managed in sbomify, the answer is immediate — and the SBOM hierarchy tells you exactly which services need attention.

This aligns with CSF 2.0's emphasis on rapid, informed response and the ability to recover quickly from cybersecurity events.

## CSF 2.0 and Other Regulatory Frameworks

CSF 2.0 is designed to be complementary to other frameworks and regulations:

- **[Executive Order 14028](/compliance/eo-14028/)** — Directly references NIST guidelines and SBOM requirements
- **[EU Cyber Resilience Act](/compliance/eu-cra/)** — Aligns with CSF 2.0's supply chain risk management outcomes
- **[PCI DSS 4.0](/compliance/pci-dss/)** — Maps to CSF 2.0 categories for organizations in the payment card industry
- **CMMC** — The Cybersecurity Maturity Model Certification builds on NIST 800-171, which aligns with CSF categories
- **ISO 27001** — CSF 2.0 Organizational Profiles can be aligned with ISO 27001 controls

For organizations subject to multiple frameworks, CSF 2.0 serves as a unifying structure — implement once, map to many. For a broader view of the [compliance landscape](/compliance/), see our compliance hub.

## Getting Started with CSF 2.0 and SBOMs

For organizations adopting CSF 2.0 and integrating SBOMs:

1. **Assess your current state** — Create a CSF 2.0 Current Profile. Be honest about where your supply chain risk management practices stand today.
2. **Define your target** — Determine what tier and profile you're targeting, and which outcomes are highest priority.
3. **Start with IDENTIFY** — You can't protect, detect, or govern what you don't know about. Add SBOM generation to your CI/CD pipelines using the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) and build your software asset inventory.
4. **Enable DETECT** — Ingest SBOMs into [sbomify](https://sbomify.com) and enable continuous vulnerability monitoring.
5. **Formalize GOVERN** — Establish SBOM policies, procurement requirements, and vulnerability response SLAs.
6. **Iterate** — CSF 2.0 is explicitly designed for continuous improvement. Start where you are and build capability over time.

For more on the role of SBOMs in cybersecurity programs, see our guide on [the role of SBOMs in cybersecurity](/2026/02/08/sbom-cybersecurity-role/).

For the full CSF 2.0 documentation and supplementary resources, visit [NIST's official website](https://www.nist.gov/cyberframework).
