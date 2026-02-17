---

title: "Understanding Sigstore: Securing the Software Supply Chain"
description: "Introduction to Sigstore, the open-source project for cryptographic signing of software artifacts using Cosign, Rekor transparency logs, Fulcio CA, and Gitsign."
author:
  display_name: Cowboy Neil
category: education
tags: [sigstore, security, signing]
date: 2024-08-12
slug: what-is-sigstore
---

**Summary**: In an era where software supply chain attacks are becoming more common and sophisticated, [Sigstore](https://www.sigstore.dev/) represents a critical advancement in securing software development practices. By lowering the barriers to cryptographic signing and increasing the transparency of the signing process, Sigstore helps ensure that the software we all rely on is both secure and trustworthy. Whether you're a developer, a security professional, or a software user, the adoption of Sigstore has the potential to significantly enhance the integrity of the software ecosystem.

## What is Sigstore?

Sigstore is an open-source project that provides a set of tools and services for developers to cryptographically sign, verify, and protect their software artifacts. This includes container images, binaries, and source code, among other elements. The primary goal of Sigstore is to make signing software artifacts as easy and widely adopted as possible, thereby increasing the overall trust in the software supply chain.

Sigstore was born out of a collaboration between Google, Red Hat, Purdue University, and other key contributors in the open-source community. The project has quickly gained momentum due to its focus on addressing critical security concerns in modern software development practices.

## Why Sigstore Matters

The integrity of software artifacts is essential to prevent malicious code from infiltrating production systems. Traditionally, ensuring this integrity has involved complex processes of generating, managing, and distributing cryptographic keys for signing software. These processes, while effective, are often cumbersome, leading to low adoption rates and a general lack of cryptographic signing in many projects.

Sigstore simplifies this process by providing a transparent, community-driven solution that reduces the barriers to entry for signing software artifacts. This democratization of signing practices helps ensure that more software components are cryptographically verified, making it harder for attackers to introduce malicious code into the software supply chain.

## Key Components of Sigstore

Sigstore is comprised of several key components that work together to provide a secure and user-friendly signing experience:

1. **Cosign**: A command-line tool that enables developers to sign, verify, and store signatures for container images and other artifacts. Cosign leverages existing cloud-native technologies and integrates seamlessly with popular CI/CD pipelines, making it easy to incorporate signing into existing workflows.

2. **Rekor**: A transparency log service that records all signature and metadata information in a tamper-evident manner. Rekor acts as a public ledger, allowing anyone to verify the integrity of an artifact and its associated signature. This transparency log is critical for ensuring that signed artifacts cannot be altered without detection.

3. **Fulcio**: A certificate authority (CA) that issues short-lived certificates based on OpenID Connect (OIDC) identities. Fulcio enables developers to obtain cryptographic certificates without the need for complex key management, streamlining the process of signing artifacts.

4. **Gitsign**: A tool for signing Git commits and tags using Sigstore's infrastructure. Gitsign ensures that code changes can be traced back to their source, providing an additional layer of security for version control systems.

## How Sigstore Works

Sigstore's architecture is designed to be both secure and easy to use. When a developer signs an artifact using Cosign, the following steps typically occur:

1. **Obtain a Certificate**: The developer uses Fulcio to obtain a short-lived certificate, which is tied to their OIDC identity (such as a GitHub or Google account). This certificate is used to sign the artifact.

2. **Sign the Artifact**: The developer uses Cosign to create a signature for the artifact. This signature, along with the certificate, is then uploaded to Rekor's transparency log.

3. **Store and Verify**: The signed artifact, along with its signature and certificate, can be stored in a registry. Anyone can later verify the artifact by checking the signature against the information in Rekor's transparency log.

This process ensures that the integrity and origin of the software artifact can be independently verified by anyone, making it much harder for malicious actors to compromise the software supply chain.

## The Benefits of Sigstore

Sigstore offers several significant benefits to the software development community:

- **Enhanced Security**: By making cryptographic signing accessible and easy to use, Sigstore helps protect against supply chain attacks and other security threats.

- **Transparency**: The use of a public transparency log ensures that all signed artifacts are publicly auditable, increasing trust in the software supply chain.

- **Ease of Use**: Sigstore's integration with existing tools and workflows means that developers can adopt secure signing practices without significant changes to their processes.

- **Community-Driven**: As an open-source project, Sigstore benefits from the contributions and oversight of a broad community, ensuring that it remains responsive to the needs of developers and organizations.
