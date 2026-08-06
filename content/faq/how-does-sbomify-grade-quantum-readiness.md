---
title: "How does sbomify grade quantum readiness?"
description: "How sbomify classifies each cryptographic asset in a CBOM as quantum-safe, quantum-vulnerable, or needs-review, grounded in NIST guidance."
answer: "sbomify classifies every cryptographic asset by algorithm identity: standardized post-quantum algorithms (ML-KEM, ML-DSA, SLH-DSA) grade quantum-safe; anything Shor's algorithm breaks (RSA, ECDSA, ECDH, Diffie-Hellman, all elliptic curves) grades quantum-vulnerable; Grover-weakened or unfinalized algorithms (AES-128, Falcon, XMSS) grade needs-review. Each verdict carries its reasoning and a concrete FIPS 203/204/205 migration target."
tldr: "Identity-based grading grounded in NIST FIPS 203/204/205 and CNSA 2.0: PQC algorithms are safe, Shor-breakable public-key crypto is vulnerable, edge cases get flagged for review. AES-256 and SHA-256 are safe; AES-128 needs review; a declared nistQuantumSecurityLevel never overrides what the algorithm actually is."
weight: 88
keywords: [quantum readiness, post-quantum cryptography, PQC grading, ML-KEM, ML-DSA, SLH-DSA, quantum-vulnerable, CBOM analysis, CNSA 2.0]
url: /faq/how-does-sbomify-grade-quantum-readiness/
---

## The verdicts

Every asset in a CBOM gets one of four grades:

- **Quantum-safe**: NIST-standardized post-quantum algorithms (ML-KEM / FIPS 203, ML-DSA / FIPS 204, SLH-DSA / FIPS 205, including their pre-standardization names Kyber, Dilithium, and SPHINCS+), plus symmetric crypto and hashes at adequate strength (AES-192/256, ChaCha20, SHA-256 and up).
- **Quantum-vulnerable**: everything Shor's algorithm breaks: RSA, DSA, ECDSA, EdDSA, ECDH, X25519, Diffie-Hellman, and any elliptic-curve construction. The verdict includes a migration target: signatures point at ML-DSA or SLH-DSA, key establishment at ML-KEM.
- **Needs review**: Grover-weakened sizes (AES-128), classically broken primitives (MD5, SHA-1, DES, 3DES), and PQC candidates that are selected but not finalized (Falcon/FN-DSA, HQC) or stateful special-use schemes (XMSS, LMS).
- **Unknown**: the algorithm could not be identified; certificates and protocols without algorithm identity are marked not-assessed rather than guessed.

## How identification works

The classifier reads the asset's name, algorithm family, curve, parameter set, and OID, normalized against the CycloneDX 1.7 cryptography registry, so `secp256r1`, `prime256v1`, and `nist/P-256` all classify identically. A declared `nistQuantumSecurityLevel` never overrides algorithm identity; it only raises a data-quality flag when it contradicts the verdict, so a mislabeled CBOM cannot grade itself safe.

Component verdicts roll up to a workspace [cryptography dashboard](/features/cbom/) that ranks which algorithms to migrate first by how many components use them.
