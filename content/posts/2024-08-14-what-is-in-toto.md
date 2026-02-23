---

title: "What Is in-toto? Securing the Software Supply Chain End to End"
description: "What is in-toto? The CNCF-graduated framework uses layouts, signed link metadata, and end-to-end verification to cryptographically prove every build step happened as intended. Learn how it underpins SLSA, GitHub attestations, and SBOM integrity."
categories:
  - education
tags: [in-toto, security, supply-chain, attestation]
tldr: "in-toto is a framework that cryptographically verifies every step of your software supply chain — from source commit to deployed artifact. Developed at NYU's Secure Systems Lab, it is now a CNCF graduated project whose attestation format underpins SLSA provenance, GitHub artifact attestations, and sigstore signing."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is in-toto?"
    answer: "in-toto is an open-source framework for securing the software supply chain. It provides a system of layouts, signed link metadata, and end-to-end verification to ensure that every step in building and delivering software happened exactly as intended, with no unauthorized modifications. It is a CNCF graduated project."
  - question: "What is the in-toto attestation framework?"
    answer: "The in-toto attestation framework defines a standard envelope format for supply chain metadata. It wraps a typed predicate (such as SLSA provenance, vulnerability scan results, or SBOM data) inside a signed envelope, providing a universal format for making and verifying claims about software artifacts."
  - question: "How is in-toto related to SLSA?"
    answer: "SLSA (Supply chain Levels for Software Artifacts) builds directly on in-toto. SLSA provenance attestations use the in-toto attestation format, and SLSA's verification model is an extension of in-toto's end-to-end verification concept. in-toto provides the technical foundation; SLSA provides a maturity framework on top of it."
  - question: "Is in-toto a CNCF project?"
    answer: "Yes. in-toto joined the Cloud Native Computing Foundation (CNCF) as a sandbox project in 2019 and graduated in 2023. It is one of only a few supply chain security projects to reach CNCF graduated status, alongside sigstore and The Update Framework (TUF)."
  - question: "How does in-toto relate to SBOMs?"
    answer: "in-toto attestations can carry SBOM data as a predicate type, providing a signed, verifiable wrapper around SBOM content. This means you can not only generate an SBOM but also cryptographically prove who generated it, when, and from which source materials — adding integrity and provenance to your SBOM."
date: 2024-08-14
slug: what-is-in-toto
---

When the [XZ Utils backdoor](/2024/04/13/what-really-happened-to-xz/) was discovered in March 2024, it revealed how a malicious contributor could spend years infiltrating an open-source project to inject a supply chain compromise. The attack succeeded because there was no cryptographic verification that the build steps producing the XZ binary matched the intended, authorized process. This is precisely the problem that **[in-toto](https://in-toto.io/)** was designed to solve.

in-toto is a framework for securing the _entire_ software supply chain — from source commit to deployed artifact — by cryptographically recording and verifying every step along the way. Originally developed at New York University's [Secure Systems Lab](https://ssl.engineering.nyu.edu/) by Professor Justin Cappos and Santiago Torres-Arias, in-toto has grown from an academic research project into a [CNCF graduated project](https://www.cncf.io/projects/in-toto/) and the foundation of the modern software supply chain security ecosystem. The name comes from the Latin phrase meaning "in total" or "completely," reflecting its end-to-end approach.

## How in-toto Works

in-toto establishes a cryptographic chain of trust across every step in a software supply chain. It does this through three core concepts: layouts, link metadata, and verification.

### Layouts: The Blueprint

A layout is a signed document that defines the _intended_ supply chain. It specifies:

- **The steps** involved in producing the software (e.g., clone source, run tests, compile, package)
- **Who is authorized** to perform each step (identified by cryptographic keys)
- **What materials and products** each step should consume and produce (e.g., the compile step takes source files as input and produces a binary as output)
- **Inspection rules** that must hold true across steps (e.g., the files that leave one step must be the same files that enter the next)

The layout is signed by the project owner — the authority who defines what the supply chain _should_ look like. Think of it as a security policy for your build pipeline, expressed in a machine-verifiable format.

### Link Metadata: The Evidence

As each step in the layout is executed, the entity performing it generates _link metadata_ — a signed record containing:

- The **command** that was run
- The **materials** (input files and their cryptographic hashes) consumed by the step
- The **products** (output files and their cryptographic hashes) produced by the step
- The **cryptographic signature** of the authorized functionary who performed the step

Each link is signed by the functionary's private key, creating tamper-evident proof that the step was performed by an authorized party and that the inputs and outputs are exactly what was recorded.

### Verification: The Guarantee

Once all steps are complete, in-toto verification checks the entire chain:

1. The layout signature is valid and from a trusted project owner
2. Every step defined in the layout has corresponding signed link metadata
3. Each link was signed by an authorized functionary for that step
4. The material/product relationships between steps are consistent — the products of one step match the materials of the next
5. All inspection rules pass

If any check fails — a step was skipped, an unauthorized party performed a step, or files were modified between steps — verification fails and the artifact is rejected. This is what makes in-toto an _end-to-end_ verification system: it does not just check individual steps in isolation, but verifies the integrity of the entire pipeline.

## The in-toto Attestation Framework

Beyond the original layout/link model, the in-toto project developed the **[in-toto attestation framework](https://github.com/in-toto/attestation)** — a more general-purpose format for making signed, verifiable claims about software artifacts. This framework has become the de facto standard for supply chain metadata across the industry.

An in-toto attestation consists of:

- **An envelope** — a signed wrapper (using [DSSE](https://github.com/secure-systems-lab/dsse), the Dead Simple Signing Envelope) that provides authentication
- **A subject** — the artifact(s) the attestation refers to, identified by cryptographic digest
- **A predicate** — a typed payload containing the actual claim

The predicate type system is what makes the framework so versatile. Different predicate types include:

- **[SLSA Provenance](/2024/08/17/what-is-slsa/)** — records how an artifact was built, including source, builder, and build parameters
- **SBOM** — wraps a CycloneDX or SPDX [SBOM](/what-is-sbom/) in a signed attestation, providing provenance and integrity
- **Vulnerability scan results** — attests to the findings of a security scan
- **Code review** — records that a human reviewed the code before it was built

This predicate-based architecture means the in-toto attestation format can carry _any_ type of supply chain metadata in a standardized, signable envelope.

## Why in-toto Matters

### Preventing Supply Chain Attacks

The core value of in-toto is that it makes supply chain tampering detectable. Consider how common supply chain attacks work:

- **A build system is compromised** and injects malicious code during compilation. in-toto verification detects that the products of the build step do not match the expected transformation of the source materials.
- **An unauthorized actor pushes a release.** in-toto verification fails because the release step was not signed by an authorized functionary.
- **A dependency is swapped** between the resolve and build steps. in-toto's material/product matching across steps detects the inconsistency.

Without in-toto, these attacks can go undetected because each individual step _appears_ to have succeeded. in-toto's end-to-end verification catches tampering that step-level checks miss.

### The XZ Utils Lesson

The [XZ Utils backdoor (CVE-2024-3094)](/2024/04/13/what-really-happened-to-xz/) is a textbook case for why in-toto matters. The attacker modified the build process to inject a backdoor that only appeared in the distributed tarballs, not in the git source. A supply chain secured with in-toto would have required the build step to be performed by an authorized functionary using the exact source materials from the repository, and verification would have caught the discrepancy between the source and the tarball.

## Real-World Adoption

in-toto and its attestation format have been widely adopted across the software supply chain ecosystem.

**CNCF Graduated Project** — in-toto [graduated from the CNCF](https://www.cncf.io/projects/in-toto/) in 2023, joining a small set of projects that have achieved this level of maturity and adoption. It is part of the CNCF's supply chain security ecosystem alongside [sigstore](/2024/08/12/what-is-sigstore/) and [The Update Framework (TUF)](https://theupdateframework.io/).

**SLSA Framework** — [SLSA (Supply chain Levels for Software Artifacts)](/2024/08/17/what-is-slsa/) uses the in-toto attestation format for all its provenance attestations. When a SLSA-compliant build system generates provenance, it produces an in-toto attestation.

**GitHub Artifact Attestations** — GitHub's [artifact attestation](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds) feature uses in-toto attestations signed via [sigstore](/2024/08/12/what-is-sigstore/) to establish provenance for artifacts built with GitHub Actions. Every time you see SLSA provenance on a GitHub release, it is an in-toto attestation under the hood.

**Kubernetes** — The Kubernetes project generates SLSA Level 3 provenance for its releases using in-toto attestations, allowing users to verify that official Kubernetes binaries were built from the expected source by authorized infrastructure.

**Datadog** — Datadog integrated in-toto into its CI/CD pipelines to provide end-to-end verification of its Agent software, ensuring that the binaries delivered to customers match the intended build process.

## in-toto and SBOMs

in-toto and [SBOMs](/what-is-sbom/) are complementary. An SBOM tells you _what_ is in your software. in-toto tells you _how_ it got there and _who_ was responsible for each step.

The intersection is practical:

- **SBOMs as attestation predicates** — An in-toto attestation can wrap an SBOM as its predicate, producing a signed, verifiable SBOM. This proves not only what components are in the software, but also who generated the SBOM and from what source materials.
- **Build provenance for SBOM accuracy** — in-toto provenance attestations record the exact build inputs and process, which is precisely the information needed to generate an accurate SBOM. Build-time SBOMs generated alongside in-toto link metadata can be trusted to reflect the actual build.
- **Continuous verification** — When [monitoring SBOMs for vulnerabilities](/2026/02/01/sbom-scanning-vulnerability-detection/), in-toto attestations provide assurance that the SBOM was not tampered with after generation.

For organizations managing SBOMs with a platform like [sbomify](https://sbomify.com), in-toto attestations add a layer of integrity: you can verify that the SBOM was generated by an authorized CI/CD pipeline from the correct source, not fabricated or modified after the fact.

## Getting Started with in-toto

The in-toto project provides implementations in multiple languages:

- **[in-toto-python](https://github.com/in-toto/in-toto)** — The reference implementation, installable via `pip install in-toto`
- **[in-toto-golang](https://github.com/in-toto/in-toto-golang)** — Go implementation, used by many cloud-native tools
- **[in-toto-java](https://github.com/in-toto/in-toto-java)** — Java implementation for JVM-based build systems
- **[in-toto-rs](https://github.com/in-toto/in-toto-rs)** — Rust implementation

For most organizations, the fastest path to adopting in-toto is through tools that already use it:

1. **Enable SLSA provenance** in your CI/CD system. GitHub Actions, Google Cloud Build, and other platforms support SLSA provenance generation, which produces in-toto attestations automatically.
2. **Verify attestations** on artifacts you consume. Tools like `cosign verify-attestation` ([sigstore](/2024/08/12/what-is-sigstore/)) and `gh attestation verify` (GitHub CLI) check in-toto attestations.
3. **Generate signed SBOMs** by wrapping your SBOM output in an in-toto attestation using your CI/CD signing infrastructure.

For deeper control — such as defining custom layouts with specific functionary keys and step-level verification — the in-toto Python or Go libraries provide the full layout/link/verify workflow. The [in-toto documentation](https://in-toto.readthedocs.io/) includes step-by-step tutorials.

## in-toto in the Compliance Context

in-toto aligns with emerging supply chain security requirements:

- **[Executive Order 14028](/compliance/eo-14028/)** directs federal agencies to enhance software supply chain security, including provenance and integrity verification — core capabilities of in-toto.
- **[NIST SSDF (SP 800-218)](https://csrc.nist.gov/publications/detail/sp/800-218/final)** recommends protecting all forms of code from unauthorized access and tampering. in-toto's cryptographic verification of build steps directly addresses this requirement.
- **[SLSA requirements](/2024/08/17/what-is-slsa/)** — Organizations pursuing SLSA compliance are inherently using in-toto attestation formats for provenance.
- **[EU CRA](/compliance/eu-cra/)** requires vulnerability handling and supply chain security processes. in-toto provides the verification mechanism to demonstrate that software was built through an authorized, untampered pipeline.

## Frequently Asked Questions

### What is in-toto?

in-toto is an open-source framework for securing the software supply chain. It provides a system of layouts, signed link metadata, and end-to-end verification to ensure that every step in building and delivering software happened exactly as intended, with no unauthorized modifications. It is a CNCF graduated project.

### What is the in-toto attestation framework?

The in-toto attestation framework defines a standard envelope format for supply chain metadata. It wraps a typed predicate (such as SLSA provenance, vulnerability scan results, or SBOM data) inside a signed envelope, providing a universal format for making and verifying claims about software artifacts.

### How is in-toto related to SLSA?

[SLSA](/2024/08/17/what-is-slsa/) (Supply chain Levels for Software Artifacts) builds directly on in-toto. SLSA provenance attestations use the in-toto attestation format, and SLSA's verification model is an extension of in-toto's end-to-end verification concept. in-toto provides the technical foundation; SLSA provides a maturity framework on top of it.

### Is in-toto a CNCF project?

Yes. in-toto joined the Cloud Native Computing Foundation (CNCF) as a sandbox project in 2019 and graduated in 2023. It is one of only a few supply chain security projects to reach CNCF graduated status, alongside [sigstore](/2024/08/12/what-is-sigstore/) and The Update Framework (TUF).

### How does in-toto relate to SBOMs?

in-toto attestations can carry SBOM data as a predicate type, providing a signed, verifiable wrapper around [SBOM](/what-is-sbom/) content. This means you can not only generate an SBOM but also cryptographically prove who generated it, when, and from which source materials — adding integrity and provenance to your SBOM.
