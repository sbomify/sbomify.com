---
layout: post
title: "Securing the Software Supply Chain with SLSA: What You Need to Know"
author:
  display_name: Cowboy Neil

---

## Abstract
In a world where software is integral to almost every aspect of life, securing the software supply chain is more critical than ever. The increasing complexity of software systems has given rise to sophisticated cyberattacks, particularly those targeting the software supply chain. To combat these threats, Google introduced **SLSA (Supply chain Levels for Software Artifacts)**—a framework that provides a structured approach to safeguarding software development and ensuring that software artifacts are secure and tamper-free throughout their lifecycle. Pronounced "salsa," SLSA is essential for defending against supply chain attacks, maintaining software integrity, providing transparency, encouraging best practices, and meeting compliance standards. Additionally, GitHub now supports artifact attestations, further enhancing the ability to establish and verify provenance within the SLSA framework.

## What is SLSA?

SLSA, which stands for Supply chain Levels for Software Artifacts, is a security framework designed to protect the integrity of software artifacts from the earliest stages of development through to deployment. Introduced by Google, SLSA offers a standardized approach to securing the software supply chain, addressing vulnerabilities that could otherwise be exploited by cybercriminals.

The framework is structured into four levels, each corresponding to a progressively higher degree of security maturity:

1. **SLSA Level 1: Basic Build Integrity**
   At this foundational level, organizations implement basic security practices, such as using version control systems (VCS) and documenting their build processes. This establishes a baseline for more advanced security measures.

2. **SLSA Level 2: Higher Build Integrity**
   Building on Level 1, this stage introduces stronger controls like using a dedicated build service to prevent unauthorized changes. The goal is to enhance the integrity of the software as it progresses through the development pipeline.

3. **SLSA Level 3: Provenance**
   Provenance is a key feature at this level, offering traceability and transparency regarding the origin of software artifacts. This level ensures that organizations can verify the entire history of their software, including who built it and how it was built. GitHub, one of the most widely used platforms for software development, now supports artifact attestations, enabling developers to create and verify attestations for software artifacts built using GitHub Actions. This capability allows organizations to seamlessly integrate provenance tracking into their development workflows, aligning with SLSA Level 3 requirements.

4. **SLSA Level 4: Hermetic Builds and Two-Person Review**
   The highest level of SLSA emphasizes maximum security with hermetic builds—completely isolated build environments—and a mandatory two-person review process. These practices help detect any issues before software deployment, ensuring the highest level of security.

## Why SLSA Matters

The importance of SLSA in today’s digital landscape cannot be overstated. As cyber threats continue to evolve, securing the software supply chain has become essential to preventing widespread damage and maintaining trust in digital systems. Here’s why SLSA is crucial:


1. **Defending Against Supply Chain Attacks**
   Supply chain attacks are a growing concern, with attackers targeting the software development process to introduce malicious code. SLSA helps organizations defend against these threats by implementing robust security measures at every stage of software development.

2. **Ensuring Software Integrity and Trust**
   SLSA ensures that software remains untampered throughout its lifecycle, which is critical for maintaining trust, especially in industries where security is paramount, such as healthcare, finance, and government.

3. **Providing Transparency with Provenance**
   The concept of provenance, introduced at SLSA Level 3, offers a clear record of the software’s origin and development history. With GitHub's support for artifact attestations, organizations can now generate and verify these attestations directly within their development workflows, ensuring that the software’s authenticity and history are transparent and verifiable.

4. **Encouraging Adoption of Best Practices**
   By following the SLSA framework, organizations naturally adopt industry best practices for software security. This strengthens their own systems and contributes to the overall security of the software ecosystem.

5. **Achieving Compliance and Regulatory Standards**
   With cybersecurity regulations becoming more stringent, adhering to SLSA can help organizations meet compliance requirements, avoiding legal consequences and demonstrating a commitment to security that can serve as a competitive advantage.

By adopting SLSA and leveraging tools like GitHub's artifact attestations, organizations can protect their software from threats, ensure its integrity, and contribute to a safer digital environment for all.
