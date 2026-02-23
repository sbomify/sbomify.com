---

title: "What Is a CBOM? The Cryptography Bill of Materials Explained"
description: "What is a CBOM? The Cryptography Bill of Materials inventories every cryptographic asset in your software — algorithms, keys, certificates, and protocols. Learn how CBOMs prepare organizations for the post-quantum transition."
categories:
  - education
tags: [cbom, cryptography, security, post-quantum]
tldr: "A CBOM (Cryptography Bill of Materials) is an inventory of every cryptographic asset in your software: algorithms, key lengths, certificates, and protocols. Defined by CycloneDX, CBOMs are essential for the post-quantum transition — you cannot migrate to quantum-resistant cryptography if you do not know what cryptography you are using today."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is a CBOM?"
    answer: "A CBOM (Cryptography Bill of Materials) is a structured inventory of all cryptographic assets used in a piece of software, including algorithms, key lengths, certificates, protocols, and their usage contexts. It is defined as a capability of the CycloneDX SBOM standard and enables organizations to identify cryptographic risks, plan quantum-resistant migrations, and maintain cryptographic agility."
  - question: "How is a CBOM different from an SBOM?"
    answer: "An SBOM inventories software components (libraries, packages, dependencies). A CBOM inventories cryptographic assets (algorithms, keys, certificates, protocols). They are complementary: an SBOM tells you what software you have, a CBOM tells you what cryptography that software uses. CycloneDX supports both in the same format."
  - question: "Why do I need a CBOM now?"
    answer: "Quantum computers capable of breaking RSA and elliptic curve cryptography are expected within the next decade. NIST finalized its first post-quantum cryptography standards (ML-KEM, ML-DSA, SLH-DSA) in August 2024. The migration will take years, and the first step is knowing what cryptography you use today. CBOMs provide that inventory."
  - question: "What is the harvest-now-decrypt-later threat?"
    answer: "Harvest-now-decrypt-later (HNDL) is a strategy where adversaries capture encrypted data today with the intention of decrypting it once quantum computers become available. Data with long-term confidentiality requirements (state secrets, medical records, financial data) is particularly at risk. CBOMs help identify which systems use vulnerable algorithms so migration can be prioritized."
  - question: "How do I generate a CBOM?"
    answer: "CycloneDX tools can generate CBOMs by analyzing codebases for cryptographic library usage, certificate stores, and protocol configurations. IBM's CBOM toolkit and Crypto Discovery tools provide automated scanning. For many organizations, the first CBOM is compiled manually by inventorying TLS configurations, key management systems, and cryptographic library dependencies."
date: 2024-04-10
slug: future-proofing-cybersecurity-with-the-cryptography-bill-of-materials-cbom
---

Organizations know what software libraries they depend on — or at least they _should_, if they maintain [SBOMs](/what-is-sbom/). But ask most organizations what cryptographic algorithms they use, what key lengths protect their data, or which certificates expire next month, and the answer is usually silence. This blind spot is about to become critical: NIST finalized its first [post-quantum cryptography standards](https://csrc.nist.gov/projects/post-quantum-cryptography) in August 2024, starting a migration that will touch every system that uses public-key cryptography. You cannot migrate what you cannot see.

A **CBOM (Cryptography Bill of Materials)** is the answer. Defined as a capability of the [CycloneDX](https://cyclonedx.org/capabilities/cbom/) standard, a CBOM is a structured inventory of every cryptographic asset in your software: algorithms, key lengths, certificates, protocols, and their usage contexts. Just as an SBOM makes your software composition visible, a CBOM makes your cryptographic posture visible — and visibility is the prerequisite for action.

## What Is Inside a CBOM?

A CBOM catalogs cryptographic assets across several categories:

### Algorithms and Parameters

- **Algorithm name** — The specific cryptographic algorithm (e.g., AES-256-GCM, RSA-2048, SHA-384, ECDSA P-256)
- **Key length** — The size of cryptographic keys in use
- **Mode of operation** — How the algorithm is applied (e.g., CBC, GCM, CTR for block ciphers)
- **Usage context** — What the algorithm protects (data at rest, data in transit, authentication, digital signatures)

### Certificates

- **Certificate authority** — Who issued the certificate
- **Subject and issuer** — What entity the certificate identifies
- **Validity period** — Expiration dates for proactive renewal
- **Signature algorithm** — The algorithm used to sign the certificate (critical for quantum readiness)

### Protocols

- **Protocol version** — TLS 1.2, TLS 1.3, SSH, IPsec, etc.
- **Cipher suites** — The specific combination of algorithms negotiated for each connection
- **Deprecated configurations** — Protocols or cipher suites that are no longer considered secure (e.g., TLS 1.0, RC4, 3DES)

### Key Management

- **Key storage locations** — HSMs, key vaults, file-based stores
- **Key rotation policies** — How often keys are rotated and by what mechanism
- **Key lifecycle state** — Active, expired, revoked, or compromised

## Why CBOMs Matter Now

### The Post-Quantum Transition

In August 2024, NIST published three finalized post-quantum cryptography standards:

- **[FIPS 203 (ML-KEM)](https://csrc.nist.gov/pubs/fips/203/final)** — Module-Lattice-Based Key-Encapsulation Mechanism, replacing key exchange mechanisms like ECDH
- **[FIPS 204 (ML-DSA)](https://csrc.nist.gov/pubs/fips/204/final)** — Module-Lattice-Based Digital Signature Algorithm, replacing signature schemes like RSA and ECDSA
- **[FIPS 205 (SLH-DSA)](https://csrc.nist.gov/pubs/fips/205/final)** — Stateless Hash-Based Digital Signature Algorithm, providing an alternative signature scheme based on different mathematical assumptions

These standards mark the beginning of the largest cryptographic migration in computing history. Every system that uses RSA, ECDSA, ECDH, or other public-key algorithms vulnerable to quantum attack will need to transition to post-quantum alternatives. NIST's guidance calls for beginning migration immediately, with a target of deprecating vulnerable algorithms by 2035.

The scale of this migration is staggering. It affects TLS configurations, code signing, certificate authorities, VPNs, database encryption, API authentication, and every other system that relies on public-key cryptography. Without a CBOM, organizations have no systematic way to identify what needs to change.

### Harvest-Now, Decrypt-Later

The most urgent reason to act now — even before quantum computers can break current encryption — is the **harvest-now, decrypt-later (HNDL)** threat. Nation-state adversaries and sophisticated attackers are already capturing encrypted network traffic and storing it, with the expectation that future quantum computers will be able to decrypt it.

Data with long-term confidentiality requirements is particularly at risk:

- Government classified information
- Medical records (HIPAA mandates decades of retention)
- Financial transactions and trade secrets
- Intellectual property and research data

For this data, the threat window is not "when quantum computers arrive" — it is _now_. A CBOM helps identify which systems handle long-lived sensitive data and which cryptographic algorithms protect it, enabling prioritized migration to quantum-resistant alternatives.

### Cryptographic Agility

Even outside the quantum context, organizations regularly need to retire compromised or deprecated algorithms. SHA-1, MD5, RC4, DES, and TLS 1.0/1.1 have all been deprecated over the past decade, and each deprecation required organizations to find and update every system using the affected algorithm. Without a CBOM, this is an ad-hoc, error-prone process.

**Cryptographic agility** — the ability to quickly swap out cryptographic algorithms across your infrastructure — depends on knowing exactly what is deployed where. A CBOM provides this foundation.

## CBOMs and SBOMs

CBOMs and [SBOMs](/what-is-sbom/) are complementary inventories that address different dimensions of software transparency.

| | SBOM | CBOM |
| --- | --- | --- |
| **Inventories** | Software components (libraries, packages) | Cryptographic assets (algorithms, keys, certificates) |
| **Primary use case** | Vulnerability management, license compliance | Cryptographic risk assessment, quantum migration |
| **Format** | [SPDX, CycloneDX](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/) | CycloneDX |
| **Answers** | "What's in my software?" | "What crypto does my software use?" |

CycloneDX supports both in the same document. An organization generating CycloneDX SBOMs can extend them to include cryptographic asset data, producing a unified inventory that covers both component composition and cryptographic posture.

For organizations managing SBOMs with [sbomify](https://sbomify.com), adding CBOM data to the same CycloneDX documents means cryptographic assets become part of the same management, monitoring, and sharing workflow already in place for software components.

## Generating a CBOM

### Automated Discovery

Several tools support automated cryptographic asset discovery:

- **[CycloneDX CBOM tools](https://cyclonedx.org/capabilities/cbom/)** — Generate CycloneDX-formatted CBOMs by analyzing dependencies and configurations
- **IBM Quantum Safe tools** — Scan codebases and running systems for cryptographic usage patterns
- **Certificate inventory tools** — Tools like `certbot`, `openssl`, and cloud provider APIs can enumerate certificates across infrastructure

### Manual Inventory

For many organizations, the first CBOM begins as a manual inventory:

1. **TLS configurations** — Audit web servers, load balancers, and API gateways for supported protocol versions and cipher suites
2. **Certificate stores** — Enumerate all certificates, their issuers, expiration dates, and signature algorithms
3. **Key management systems** — Inventory HSMs, cloud KMS services (AWS KMS, Azure Key Vault, GCP Cloud KMS), and application-level key stores
4. **Cryptographic library dependencies** — Check your SBOM for libraries like OpenSSL, BoringSSL, libsodium, Bouncy Castle, and their configured algorithms
5. **Data-at-rest encryption** — Document database encryption, disk encryption, and backup encryption configurations

### Ongoing Maintenance

Like SBOMs, CBOMs should be treated as living documents. Certificate expirations, algorithm deprecations, and new deployments all require CBOM updates. Integrate CBOM generation into your CI/CD pipeline alongside SBOM generation for continuous visibility.

## The Regulatory Landscape

Cryptographic transparency is gaining regulatory attention:

- **NSA CNSA 2.0** — The Commercial National Security Algorithm Suite 2.0 sets timelines for U.S. national security systems to transition to quantum-resistant algorithms, starting in 2025
- **[Executive Order 14028](/compliance/eo-14028/)** and subsequent White House memoranda on quantum computing direct federal agencies to inventory cryptographic systems and develop migration plans
- **[EU Cyber Resilience Act](/compliance/eu-cra/)** requires products with digital elements to implement "appropriate" cryptographic protection — documenting that cryptography via CBOMs supports compliance
- **PCI DSS 4.0** requires inventories of cryptographic algorithms and key management practices for payment card environments

Organizations that proactively build CBOMs will be ahead of the compliance curve as these requirements mature.

## Frequently Asked Questions

### What is a CBOM?

A CBOM (Cryptography Bill of Materials) is a structured inventory of all cryptographic assets used in a piece of software, including algorithms, key lengths, certificates, protocols, and their usage contexts. It is defined as a capability of the [CycloneDX](https://cyclonedx.org/capabilities/cbom/) SBOM standard and enables organizations to identify cryptographic risks, plan quantum-resistant migrations, and maintain cryptographic agility.

### How is a CBOM different from an SBOM?

An [SBOM](/what-is-sbom/) inventories software components (libraries, packages, dependencies). A CBOM inventories cryptographic assets (algorithms, keys, certificates, protocols). They are complementary: an SBOM tells you what software you have, a CBOM tells you what cryptography that software uses. CycloneDX supports both in the same format.

### Why do I need a CBOM now?

Quantum computers capable of breaking RSA and elliptic curve cryptography are expected within the next decade. NIST finalized its first post-quantum cryptography standards (ML-KEM, ML-DSA, SLH-DSA) in August 2024. The migration will take years, and the first step is knowing what cryptography you use today. CBOMs provide that inventory.

### What is the harvest-now-decrypt-later threat?

Harvest-now-decrypt-later (HNDL) is a strategy where adversaries capture encrypted data today with the intention of decrypting it once quantum computers become available. Data with long-term confidentiality requirements (state secrets, medical records, financial data) is particularly at risk. CBOMs help identify which systems use vulnerable algorithms so migration can be prioritized.

### How do I generate a CBOM?

[CycloneDX tools](https://cyclonedx.org/capabilities/cbom/) can generate CBOMs by analyzing codebases for cryptographic library usage, certificate stores, and protocol configurations. IBM's Quantum Safe toolkit provides automated scanning. For many organizations, the first CBOM is compiled manually by inventorying TLS configurations, key management systems, and cryptographic library dependencies.
