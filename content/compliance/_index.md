---

url: /compliance/
title: "The Ultimate SBOM Compliance Guide (2026)"
description: "Complete SBOM compliance guide covering NTIA minimum elements, CISA 2025 draft, NIST 800-53, NIST 800-171, EU Cyber Resilience Act (CRA), NIS2 Directive, UK Software Security Code of Practice, FDA medical device requirements, and PCI DSS 4.0. Includes CycloneDX and SPDX schema mappings."
tldr: "SBOM compliance requirements vary by jurisdiction and industry. In the US, Executive Order 14028 and NTIA minimum elements set the baseline; CISA's 2025 draft adds hash and license fields. In the EU, the Cyber Resilience Act legally requires SBOMs for digital products, while NIS2 mandates supply chain security. The UK's Software Security Code of Practice offers voluntary guidance. Use CycloneDX or SPDX format — both are widely accepted across all frameworks."
---

New to SBOMs? Start with [What is an SBOM?](/what-is-sbom/) to learn the basics, or explore our [SBOM generation guides](/guides/) for language-specific tutorials.

Software Bill of Materials (SBOM) compliance requirements are rapidly evolving across the United States and European Union. Whether you're navigating the **NTIA minimum elements**, preparing for the **EU Cyber Resilience Act (CRA)**, meeting **NIS2 Directive** obligations, or submitting medical devices to the **FDA**, this guide provides a comprehensive reference for SBOM requirements across all major frameworks.

<div class="cta-box">
  <p><strong>Feeling overwhelmed?</strong> If all these frameworks, acronyms, and requirements look like gibberish, you're not alone. SBOM compliance can be complex, but you don't have to figure it out on your own.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get Help With Compliance</a>
</div>

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

---

## Compliance Frameworks

### US Frameworks

- **[Executive Order 14028 (2021)](/compliance/eo-14028/)** - The binding US directive that kicked off federal SBOM adoption. _Updated:_ OMB Memorandum M-26-05 (January 2026) rescinded the mandatory attestation memos (M-22-18, M-23-16), shifting to an agency-led, risk-based approach. EO 14028 itself remains in effect.
  - _Who it affects:_ US federal agencies and software vendors selling to the government

- **[NTIA Minimum Elements (2021)](/compliance/ntia-minimum-elements/)** - The foundational US baseline for SBOM data fields
  - _Who it affects:_ Software producers selling into federal or critical-infrastructure supply chains. Referenced by FDA, CISA, and other frameworks as the baseline.

- **[CISA Minimum Elements (2025 Draft)](/compliance/cisa-minimum-elements/)** - Updated US guidance with new fields for hash, license, and generation context
  - _Who it affects:_ Organizations in US public-sector and critical-infrastructure contexts

- **[FDA Medical Device Guidance (2025)](/compliance/fda-medical-device/)** - Healthcare sector SBOM requirements with lifecycle properties
  - _Who it affects:_ Medical device manufacturers and their software suppliers

- **[NIST SP 800-53 Rev 5](/compliance/nist-800-53/)** - Federal security control catalog with supply chain risk management controls
  - _Who it affects:_ US federal agencies and organizations subject to FISMA

- **[NIST SP 800-171 Rev 3](/compliance/nist-800-171/)** - CUI protection requirements for nonfederal systems
  - _Who it affects:_ DoD contractors and organizations handling Controlled Unclassified Information (CUI)

### EU Frameworks

- **[EU Cyber Resilience Act (CRA)](/compliance/eu-cra/)** - Binding EU law requiring SBOMs for products with digital elements
  - _Who it affects:_ Manufacturers, importers, and distributors placing digital products on the EU market

- **[EU NIS2 Directive](/compliance/eu-nis2/)** - EU cybersecurity law for essential and important entities
  - _Who it affects:_ EU entities responsible for cybersecurity risk management and incident reporting

### UK Frameworks

- **[Software Security Code of Practice (UK, May 2025)](/compliance/uk-software-security-code-of-practice/)** - Voluntary UK government code setting baseline secure software development, supply chain resilience, and customer communication expectations
  - _Who it affects:_ Organisations that **develop and/or sell software to businesses or other organisations** (especially B2B/proprietary software vendors and SaaS)

### Industry Standards

- **[PCI DSS 4.0](/compliance/pci-dss/)** - Payment card industry software component inventory requirements
  - _Who it affects:_ Merchants and service providers handling cardholder data

### Reference Documents

- **[CISA Framing Document (3rd Edition)](/compliance/cisa-framing/)** - Baseline attribute definitions and format normalization
  - _Who it affects:_ SBOM producers/consumers needing shared terminology and format crosswalk

- **[CISA SBOM Sharing Lifecycle Report](/compliance/cisa-sharing-lifecycle/)** - Operational guidance for SBOM distribution
  - _Who it affects:_ Organizations distributing or retrieving SBOMs across supply chains

---

## Technical Resources

- **[Schema Crosswalk: CycloneDX and SPDX](/compliance/schema-crosswalk/)** - Complete field mappings for CycloneDX 1.7, SPDX 2.3, and SPDX 3.0

- **[CLE: Common Lifecycle Enumeration](/compliance/cle/)** - Standard for machine-readable component lifecycle events (EOL, EOS)

---

## Master Requirements Comparison

This table compares SBOM data field expectations across major frameworks. All frameworks assume machine-readable SBOMs in a commonly used format (e.g., CycloneDX, SPDX).

**Framework context:**

- **EO 14028** is a binding US Executive Order for federal agencies and influences procurement expectations for software suppliers
- **NTIA 2021** and **CISA 2025** are US guidance documents (not law)
- **NIST 800-53** is the federal security control catalog; **NIST 800-171** applies to nonfederal organizations handling CUI
- **CRA** and **NIS2** are binding EU legislation
- **FDA 2025** is guidance for medical device premarket submissions
- **PCI DSS 4.0** is an industry standard for payment card security
- **UK SSCoP 2025** is voluntary UK government guidance for software vendors

| Property                        | EO 14028 | NTIA 2021 | CISA 2025 | CRA | NIS2 | FDA 2025 | PCI DSS 4.0 | UK SSCoP 2025 |
| ------------------------------- | :------: | :-------: | :-------: | :-: | :--: | :------: | :---------: | :-----------: |
| **Document-Level Metadata**     |          |           |           |     |      |          |             |               |
| SBOM Author                     |    -     |     ✓     |     ✓     |  -  |  -   |    ✓     |      -      |       -       |
| Timestamp                       |    -     |     ✓     |     ✓     |  -  |  -   |    ✓     |      -      |       -       |
| Tool Name/Version               |    -     |     -     |     ✓     |  -  |  -   |    -     |      -      |       -       |
| Generation Context              |    -     |     -     |     ✓     |  -  |  -   |    -     |      -      |       -       |
| **Component Identification**    |          |           |           |     |      |          |             |               |
| Supplier / Software Producer    |    -     |     ✓     |     ✓     |  -  |  -   |    ✓     |      -      |       -       |
| Component Name                  |    -     |     ✓     |     ✓     |  -  |  ●   |    ✓     |      -      |       -       |
| Component Version               |    -     |     ✓     |     ✓     |  -  |  ●   |    ✓     |      -      |       -       |
| Unique Identifiers (purl/CPE)   |    -     |     ✓     |     ✓     |  -  |  -   |    ✓     |      -      |       -       |
| Component Hash                  |    -     |     -     |     ✓     |  -  |  -   |    -     |      -      |       -       |
| **Relationships**               |          |           |           |     |      |          |             |               |
| Dependency Relationship         |    ●     |     ✓     |     ✓     | ✓*  |  -   |    ✓     |      -      |       -       |
| **Legal**                       |          |           |           |     |      |          |             |               |
| License                         |    -     |     -     |     ✓     |  -  |  -   |    -     |      -      |       -       |
| **Lifecycle**                   |          |           |           |     |      |          |             |               |
| Support Level                   |    -     |     -     |     -     |  -  |  -   |    ✓     |      -      |      ✓‡       |
| End-of-Support Date             |    -     |     -     |     -     |  -  |  -   |    ✓     |      -      |      ✓‡       |
| **Process / Access**            |          |           |           |     |      |          |             |               |
| SBOM provision to purchasers    |    ✓     |     -     |     -     |  -  |  -   |    -     |      -      |       -       |
| SBOM production required        |    -     |     -     |     -     |  ✓  |  -   |    -     |     ✓†      |       -       |
| Authority access on request     |    -     |     -     |     -     |  ●  |  -   |    -     |      -      |       -       |
| User access location disclosure |    -     |     -     |     -     |  ●  |  -   |    -     |      -      |       -       |
| Supply chain security measures  |    ✓     |     -     |     -     |  -  |  ✓   |    -     |     ✓†      |      ✓‡       |
| Vulnerability handling process  |    ✓     |     -     |     -     |  -  |  ✓   |    -     |     ✓†      |      ✓‡       |

**Legend:**

- **✓** = Expected (NTIA/CISA minimum element, FDA recommended, EO 14028/NIS2 required)
- **✓*** = CRA requires at least top-level (direct) dependencies
- **✓†** = PCI DSS Req 6.3.2 (best practice until 31 Mar 2025, then required)
- **✓‡** = UK SSCoP voluntary guidance (not as SBOM fields, but as customer-facing expectations)
- **●** = Conditional or implied (EO 14028: SBOM must include "supply chain relationships"; CRA: where applicable; NIS2: for in-scope entities per Regulation 2024/2690)
- **-** = Not specified by this framework

**Important notes:**

- EO 14028 requires SBOM provision in federal procurement but defers field-level requirements to NTIA minimum elements. Note: OMB M-26-05 (January 2026) rescinded the mandatory attestation memos (M-22-18, M-23-16), making vendor attestations optional and shifting to agency-led risk-based assurance. EO 14028's core SBOM and supply chain provisions remain in effect
- NTIA 2021 and CISA 2025 define "minimum elements" as guidance, not legal requirements
- NTIA 2021 discusses license information as a key SBOM use case and useful content, but it is not listed among the minimum SBOM data fields
- CISA 2025 is a public comment draft and explicitly does not create new requirements
- FDA uses "should" language (recommendations for premarket submissions)
- CRA is binding law but does not specify individual data fields beyond dependency scope
- NIS2 does not mandate SBOMs by name, but the implementing regulation (2024/2690) requires "information describing the hardware and software components used" for in-scope entities
- PCI DSS 4.0 requires software component inventories for bespoke/custom software (Req 6.3.2) to facilitate vulnerability and patch management
- UK SSCoP 2025 is voluntary guidance; it does not mandate SBOMs by name but expects software composition awareness, vulnerability management, and customer lifecycle communication

---

## Frequently Asked Questions

### What is SBOM compliance?

SBOM compliance refers to meeting the requirements set by various government regulations and industry standards for creating, maintaining, and sharing Software Bills of Materials. Key frameworks include the US [NTIA minimum elements](/compliance/ntia-minimum-elements/), the EU [Cyber Resilience Act](/compliance/eu-cra/), and sector-specific requirements like [FDA medical device guidance](/compliance/fda-medical-device/).

### Is an SBOM legally required?

It depends on your jurisdiction and industry. In the EU, the [Cyber Resilience Act](/compliance/eu-cra/) legally requires SBOMs for products with digital elements. In the US, SBOMs are required for software sold to the federal government (per [Executive Order 14028](/compliance/eo-14028/)) and recommended for [FDA medical device submissions](/compliance/fda-medical-device/). The [NIS2 Directive](/compliance/eu-nis2/) requires supply chain security measures that SBOMs help evidence.

### What format should my SBOM be in?

Both [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/) are widely accepted. The EU CRA requires a "commonly used and machine-readable format," and both formats qualify. See our [schema crosswalk](/compliance/schema-crosswalk/) for field mappings between formats.

### What are the minimum SBOM fields required?

The [NTIA minimum elements](/compliance/ntia-minimum-elements/) define seven baseline fields: Supplier Name, Component Name, Version, Unique Identifiers, Dependency Relationship, SBOM Author, and Timestamp. The [CISA 2025 draft](/compliance/cisa-minimum-elements/) adds Component Hash, License, Tool Name, and Generation Context.

### How do I generate an SBOM?

See our comprehensive [SBOM generation guides](/guides/) covering Python, JavaScript, Java, Go, Rust, and 10+ other languages and platforms. For a list of tools, visit our [SBOM resources page](/resources/).

---

## Additional Resources

**Official Source Documents:**

- [Executive Order 14028 – Improving the Nation's Cybersecurity (2021)](https://www.gsa.gov/technology/government-it-initiatives/cybersecurity/executive-order-14028)
- [NTIA Minimum Elements for a Software Bill of Materials (2021)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)
- [CISA 2025 Minimum Elements (Public Comment Draft)](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom)
- [CISA Framing Software Component Transparency (3rd Edition)](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf)
- [CISA SBOM Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf)
- [EU Cyber Resilience Act (Regulation 2024/2847)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [EU NIS2 Directive (Directive 2022/2555)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32022L2555)
- [PCI DSS v4.0.1 (June 2024)](https://www.pcisecuritystandards.org/document_library/)
- [NIST SP 800-53 Rev 5 (September 2020, updated December 2024)](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [NIST SP 800-171 Rev 3 (May 2024)](https://csrc.nist.gov/pubs/sp/800/171/r3/final)
- [Software Security Code of Practice (UK Government, May 2025)](https://www.gov.uk/government/publications/software-security-code-of-practice)
- [CLE Specification (ECMA-428)](https://ecma-international.org/publications-and-standards/standards/ecma-428/)

**Related sbomify Resources:**

- [What is an SBOM?](/what-is-sbom/) - Introduction to Software Bills of Materials
- [SBOM Generation Guides](/guides/) - Language and platform-specific tutorials
- [SBOM Resources & Tools](/resources/) - Comprehensive tool directory

<div class="mt-16 flex justify-center">
  <a href="https://github.com/sbomify/sbomify.com/blob/master/compliance.md" class="inline-flex items-center gap-2 !text-gray-500 hover:!text-gray-900 transition-colors !no-underline text-sm font-medium">
    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
    <span>Edit this page on GitHub</span>
  </a>
</div>
