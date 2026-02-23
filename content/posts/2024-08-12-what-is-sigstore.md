---

title: "What Is Sigstore? Keyless Signing for the Software Supply Chain"
description: "What is Sigstore? The CNCF-graduated project makes cryptographic signing effortless with keyless signing via Fulcio, transparency logging via Rekor, and container signing via Cosign. Learn how Sigstore secures artifacts, SBOMs, and supply chains."
categories:
  - education
tags: [sigstore, security, signing, supply-chain]
tldr: "Sigstore eliminates the biggest barrier to software signing: key management. Using keyless signing, short-lived certificates, and a public transparency log, it lets developers sign and verify artifacts without managing long-lived keys. Sigstore is now a CNCF graduated project and powers signing for npm, PyPI, Kubernetes, and GitHub artifact attestations."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is Sigstore?"
    answer: "Sigstore is an open-source project that provides free, easy-to-use tools for cryptographically signing, verifying, and protecting software artifacts. Its keyless signing model eliminates the need for developers to manage long-lived cryptographic keys, making signing accessible to every project. Sigstore is a CNCF graduated project."
  - question: "What is keyless signing?"
    answer: "Keyless signing is Sigstore's approach to cryptographic signing that replaces long-lived keys with short-lived certificates tied to an identity (like a GitHub or Google account) via OpenID Connect. The certificate lives only long enough to create the signature, then expires. A transparency log (Rekor) records the signing event, providing permanent proof that the signature was valid at the time it was created."
  - question: "What are the main components of Sigstore?"
    answer: "Sigstore consists of three core services: Cosign (signs and verifies container images and other artifacts), Fulcio (a certificate authority that issues short-lived certificates based on OIDC identity), and Rekor (a transparency log that records all signing events in a tamper-evident ledger). Gitsign extends this to Git commit signing."
  - question: "How is Sigstore related to SLSA and in-toto?"
    answer: "Sigstore provides the signing infrastructure that SLSA and in-toto rely on. SLSA provenance attestations (which use the in-toto attestation format) are typically signed using Sigstore's keyless signing. GitHub artifact attestations, for example, use in-toto format signed via Sigstore's Fulcio and recorded in Rekor."
  - question: "Who uses Sigstore?"
    answer: "Sigstore is used by major package registries (npm, PyPI, Maven Central), container platforms (Kubernetes, Distroless), CI/CD systems (GitHub Actions, GitLab), and Linux distributions. GitHub's artifact attestation feature uses Sigstore under the hood."
date: 2024-08-12
slug: what-is-sigstore
---

Before [Sigstore](https://www.sigstore.dev/), signing a software artifact meant generating a GPG or PEM key pair, storing the private key securely, distributing the public key, rotating keys on a schedule, and revoking compromised keys. Most projects never bothered. The result: the vast majority of open-source software shipped unsigned, and consumers had no way to verify that a package came from who it claimed to come from.

Sigstore changed this by removing the hardest part of the problem — key management — entirely. Using short-lived certificates, identity-based signing, and a public transparency log, Sigstore makes it possible to sign and verify software artifacts without managing a single long-lived key. Launched in 2021 as a collaboration between Google, Red Hat, Purdue University, and Chainguard, Sigstore [graduated from the CNCF](https://www.cncf.io/projects/sigstore/) in 2022 and now underpins signing infrastructure for npm, PyPI, Kubernetes, and GitHub artifact attestations.

## How Sigstore Works: Keyless Signing

Sigstore's central innovation is **keyless signing** — a model where developers never see or manage cryptographic keys. Instead, signing is tied to an _identity_ (like a GitHub or Google account) through short-lived certificates. Here is the flow:

1. **Authenticate.** The developer proves their identity via OpenID Connect (OIDC), using an existing identity provider like GitHub, Google, or Microsoft.
2. **Get a certificate.** Sigstore's certificate authority, **Fulcio**, issues a short-lived X.509 certificate (valid for roughly 10 minutes) that binds the developer's verified identity to an ephemeral key pair.
3. **Sign the artifact.** The developer uses **Cosign** (or another signing client) to sign the artifact with the ephemeral private key.
4. **Log the event.** The signature, certificate, and artifact digest are recorded in **Rekor**, Sigstore's transparency log — a tamper-evident, append-only public ledger.
5. **Key expires.** The ephemeral private key is discarded. Because the signing event is permanently recorded in Rekor with a timestamp, anyone can later verify that the signature was valid at the time it was created, even though the certificate has long since expired.

This is what makes keyless signing possible: the transparency log replaces long-lived keys as the source of trust. Instead of trusting that a key has not been compromised over months or years, verifiers trust that the signing event was recorded in Rekor at a specific time, with a valid certificate, for a verified identity.

## Core Components

### Cosign

[Cosign](https://docs.sigstore.dev/cosign/signing/overview/) is the primary signing and verification tool. It supports:

- **Container images** — signs OCI images and stores signatures in OCI registries alongside the image
- **Blobs** — signs arbitrary files (binaries, archives, SBOMs)
- **[in-toto attestations](/2024/08/14/what-is-in-toto/)** — signs and verifies in-toto attestations, including SLSA provenance

Cosign integrates with CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins) and can verify signatures as part of admission control in Kubernetes clusters.

### Fulcio

[Fulcio](https://docs.sigstore.dev/fulcio/overview/) is Sigstore's certificate authority. It issues short-lived certificates (typically 10 minutes) after verifying the requester's identity via OIDC. Because certificates are short-lived, there is no need for certificate revocation lists or OCSP — the certificate simply expires before it can be meaningfully abused.

Fulcio supports identity providers including GitHub Actions (for workload identity in CI/CD), Google, Microsoft, and any OIDC-compliant provider. In CI/CD environments, the build system's workload identity is used automatically, requiring no human interaction.

### Rekor

[Rekor](https://docs.sigstore.dev/rekor/overview/) is the transparency log — an immutable, append-only ledger that records every signing event. Each entry includes the artifact digest, the signature, and the signing certificate. Rekor provides:

- **Tamper evidence** — any modification to the log is detectable through cryptographic proofs (Merkle tree inclusion proofs)
- **Timestamping** — each entry has a trusted timestamp, proving when the signature was created
- **Public auditability** — anyone can query Rekor to verify that a signature exists and when it was made

Rekor is what enables keyless signing to work: because the signing event is permanently recorded with a timestamp, the short-lived certificate does not need to remain valid for verification to succeed.

### Gitsign

[Gitsign](https://docs.sigstore.dev/gitsign/overview/) applies Sigstore's keyless signing to Git commits and tags. Instead of configuring GPG keys, developers authenticate via OIDC and sign commits with a short-lived certificate, with the signing event recorded in Rekor.

## Why Sigstore Matters

### The Key Management Problem

Traditional code signing requires generating a key pair, protecting the private key (often in an HSM or vault), distributing the public key (via a keyserver or out-of-band), rotating keys periodically, and revoking them when compromised. Each of these steps is a potential point of failure, and the operational burden means most projects skip signing entirely.

Sigstore eliminates every one of these steps. There are no long-lived keys to generate, store, rotate, or revoke. The developer's existing identity _is_ the credential, and the transparency log _is_ the distribution mechanism.

### Real-World Supply Chain Attacks

The attacks that Sigstore helps prevent are not theoretical:

- **[SolarWinds (2020)](https://en.wikipedia.org/wiki/2020_United_States_federal_government_data_breach)** — Attackers compromised the build system and injected malicious code into signed updates. If the build system had used identity-bound, transparency-logged signing, the anomalous signing identity would have been visible in the public log.
- **[codecov (2021)](https://about.codecov.io/security-update/)** — A modified bash uploader script was distributed for months. Transparency-logged signatures would have made the unauthorized modification detectable.
- **[XZ Utils (2024)](/2024/04/13/what-really-happened-to-xz/)** — A malicious contributor backdoored the build process. Sigstore's identity-based signing would tie every signed artifact to a specific verified identity, making it harder for a pseudonymous attacker to sign releases undetected.

### Adoption at Scale

Sigstore's impact is measured by who uses it:

- **npm** — All packages published to the npm registry include Sigstore-based provenance attestations, allowing users to verify that a package was built from a specific repository and commit.
- **PyPI** — Python package attestations use Sigstore to sign and verify distributions uploaded from trusted CI/CD publishers.
- **Maven Central** — The Sigstore Java client enables signing for JVM-based artifacts.
- **Kubernetes** — All Kubernetes release artifacts are signed with Sigstore, providing verifiable provenance for the most widely deployed container orchestrator.
- **GitHub artifact attestations** — GitHub's [attestation feature](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds) uses Sigstore for signing [in-toto attestations](/2024/08/14/what-is-in-toto/), including [SLSA](/2024/08/17/what-is-slsa/) provenance.
- **Distroless images** — Google's Distroless container images are signed with Cosign, allowing Kubernetes admission controllers to enforce signature verification.

## Sigstore and SBOMs

Sigstore provides the signing layer that gives [SBOMs](/what-is-sbom/) integrity and provenance. An unsigned SBOM is a claim — a signed SBOM is evidence.

- **Signing SBOMs** — Cosign can sign SBOM files (CycloneDX, SPDX) or attach signed SBOMs to container images. This proves who generated the SBOM and when.
- **SBOM attestations** — An SBOM can be wrapped in an [in-toto attestation](/2024/08/14/what-is-in-toto/) and signed via Sigstore, producing a verifiable, transparency-logged SBOM that consumers can independently validate.
- **Verification in pipelines** — Organizations consuming SBOMs can use `cosign verify-attestation` to confirm that the SBOM was generated by a trusted CI/CD identity before [scanning it for vulnerabilities](/2026/02/01/sbom-scanning-vulnerability-detection/).

For organizations using [sbomify](https://sbomify.com) for SBOM management, Sigstore-signed SBOMs provide assurance that the inventory data was generated by an authorized pipeline, not fabricated or modified after the fact.

## Getting Started with Sigstore

### Signing a Container Image

```bash
# Install cosign
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# Sign an image (keyless — opens browser for OIDC auth)
cosign sign my-registry.io/my-image:latest

# Verify the image
cosign verify my-registry.io/my-image:latest \
  --certificate-identity=user@example.com \
  --certificate-oidc-issuer=https://accounts.google.com
```

### Signing in CI/CD (GitHub Actions)

In GitHub Actions, Cosign uses the workflow's OIDC identity automatically — no browser interaction required:

```yaml
- uses: sigstore/cosign-installer@v3
- run: cosign sign my-registry.io/my-image:${{ github.sha }}
```

### Verifying Attestations

```bash
# Verify a SLSA provenance attestation
cosign verify-attestation my-registry.io/my-image:latest \
  --type slsaprovenance \
  --certificate-identity-regexp="https://github.com/my-org/*" \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

For more on attestation formats, see our guide on [in-toto](/2024/08/14/what-is-in-toto/).

## Sigstore in the Compliance Context

Sigstore supports compliance with emerging software supply chain regulations:

- **[Executive Order 14028](/compliance/eo-14028/)** requires software producers to attest to secure development practices and provide SBOMs. Sigstore provides the cryptographic signing infrastructure to make those attestations verifiable.
- **[SLSA requirements](/2024/08/17/what-is-slsa/)** — Sigstore is the default signing mechanism for SLSA provenance at all build levels. Achieving SLSA compliance typically involves Sigstore.
- **[EU CRA](/compliance/eu-cra/)** requires demonstrating supply chain security and vulnerability handling. Sigstore-signed artifacts and SBOMs provide auditable proof of integrity.
- **[NIST SP 800-53](/compliance/nist-800-53/) SI-7** (Software, Firmware, and Information Integrity) requires integrity verification mechanisms. Sigstore's signing and verification model directly addresses this control.

## Frequently Asked Questions

### What is Sigstore?

Sigstore is an open-source project that provides free, easy-to-use tools for cryptographically signing, verifying, and protecting software artifacts. Its keyless signing model eliminates the need for developers to manage long-lived cryptographic keys, making signing accessible to every project. Sigstore is a CNCF graduated project.

### What is keyless signing?

Keyless signing is Sigstore's approach to cryptographic signing that replaces long-lived keys with short-lived certificates tied to an identity (like a GitHub or Google account) via OpenID Connect. The certificate lives only long enough to create the signature, then expires. A transparency log (Rekor) records the signing event, providing permanent proof that the signature was valid at the time it was created.

### What are the main components of Sigstore?

Sigstore consists of three core services: [Cosign](https://docs.sigstore.dev/cosign/signing/overview/) (signs and verifies container images and other artifacts), [Fulcio](https://docs.sigstore.dev/fulcio/overview/) (a certificate authority that issues short-lived certificates based on OIDC identity), and [Rekor](https://docs.sigstore.dev/rekor/overview/) (a transparency log that records all signing events in a tamper-evident ledger). [Gitsign](https://docs.sigstore.dev/gitsign/overview/) extends this to Git commit signing.

### How is Sigstore related to SLSA and in-toto?

Sigstore provides the signing infrastructure that [SLSA](/2024/08/17/what-is-slsa/) and [in-toto](/2024/08/14/what-is-in-toto/) rely on. SLSA provenance attestations (which use the in-toto attestation format) are typically signed using Sigstore's keyless signing. GitHub artifact attestations, for example, use in-toto format signed via Sigstore's Fulcio and recorded in Rekor.

### Who uses Sigstore?

Sigstore is used by major package registries (npm, PyPI, Maven Central), container platforms (Kubernetes, Distroless), CI/CD systems (GitHub Actions, GitLab), and Linux distributions. GitHub's artifact attestation feature uses Sigstore under the hood.
