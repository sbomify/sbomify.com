---
title: "What is an SBOM?"
description: "Learn what a Software Bill of Materials (SBOM) is, why it matters for supply chain security, and how it lists every component in your software."
answer: "An SBOM (Software Bill of Materials) is a machine-readable inventory of all components, libraries, and dependencies that make up a piece of software — like an ingredients list for your code."
weight: 10
keywords: [SBOM, Software Bill of Materials, what is SBOM, SBOM definition]
url: /faq/what-is-an-sbom/
---

## What does SBOM stand for?

SBOM stands for **Software Bill of Materials**. It is a formal, machine-readable document that lists every component included in a software product — open-source libraries, third-party packages, and their transitive dependencies.

Think of it like a nutrition label for software. Just as food labels tell you exactly what ingredients are inside, an SBOM tells you exactly what code is inside your application.

## Why do SBOMs matter?

Modern software is built from hundreds or thousands of open-source and third-party components. When a vulnerability is discovered in one of those components (like [Log4Shell](https://en.wikipedia.org/wiki/Log4Shell) in 2021), organizations need to quickly determine whether they are affected. Without an SBOM, this is a slow and error-prone process.

SBOMs help you:

- **Identify vulnerabilities** — Know immediately if a vulnerable component is in your software
- **Meet compliance requirements** — Regulations like the [EU Cyber Resilience Act](/compliance/eu-cra/) and [NTIA minimum elements](/compliance/ntia/) now require SBOMs
- **Build customer trust** — Share your software composition transparently via a [Trust Center](https://trust.sbomify.com/)
- **Manage license risk** — Understand which open-source licenses apply to your codebase

## What formats are SBOMs available in?

The two most widely adopted SBOM formats are:

- **[CycloneDX](https://cyclonedx.org/)** — A lightweight, security-focused format maintained by OWASP
- **[SPDX](https://spdx.dev/)** — An ISO/IEC standard (ISO/IEC 5962:2021) originally focused on license compliance

Both formats support JSON and XML representations. sbomify supports both CycloneDX and SPDX.

## How do I get started?

Generating your first SBOM is straightforward. Check out our [language-specific guides](/guides/) for step-by-step instructions covering Python, JavaScript, Java, Go, Rust, and more. Once you have an SBOM, you can upload it to [sbomify](https://app.sbomify.com) to manage, monitor, and share it.

For a deeper introduction, read our full [What is an SBOM?](/what-is-sbom/) page.
