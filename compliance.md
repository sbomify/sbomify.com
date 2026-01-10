---
layout: page
permalink: /compliance/
title: "The Ultimate SBOM Compliance Guide (2026)"
description: "Complete guide to SBOM compliance requirements across NTIA, CISA, EU CRA, and FDA frameworks with CycloneDX and SPDX schema mappings."
---

New to SBOMs? Start with [What is an SBOM?]({{ site.url }}/what-is-sbom/) to learn the basics.

Governments and industry bodies worldwide are converging on Software Bill of Materials (SBOM) requirements. This page provides a comprehensive reference for the major frameworks defining what SBOMs should contain, along with schema mappings to the two dominant formats: [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/).

---

## Frameworks Overview

### NTIA Minimum Elements (2021)

The [NTIA Minimum Elements for a Software Bill of Materials](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf) is the foundational baseline for SBOM guidance in the United States. Published in July 2021, it defines seven core data fields that every SBOM should contain, plus implementation practices for SBOM generation and sharing.

This document emerged from a multi-stakeholder process and represents the consensus "minimum viable SBOM" that balances utility with practicality. It remains the canonical reference point for US federal SBOM expectations.

**Note:** NTIA frames these as "minimum elements" (guidance), not legally binding requirements. However, they are widely adopted as the de facto standard.

| Data Field               | Description                                                                               | Status          |
| ------------------------ | ----------------------------------------------------------------------------------------- | --------------- |
| Supplier Name            | The name of the entity that creates, defines, and identifies components                   | Minimum element |
| Component Name           | Designation assigned to a unit of software defined by the original supplier               | Minimum element |
| Version                  | Identifier used by the supplier to specify a change in software                           | Minimum element |
| Other Unique Identifiers | Other identifiers used to identify a component or serve as a lookup key (e.g., purl, CPE) | Minimum element |
| Dependency Relationship  | Characterizing the relationship that an upstream component has to software                | Minimum element |
| Author of SBOM Data      | The name of the entity that creates the SBOM data                                         | Minimum element |
| Timestamp                | Record of the date and time of the SBOM data assembly                                     | Minimum element |

**Additional NTIA Practices:**

| Practice                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| Frequency               | SBOMs should be generated for each new release or update       |
| Depth                   | How deep dependency capture goes (direct vs transitive)        |
| Known Unknowns          | Explicitly identifying components that could not be enumerated |
| Distribution & Delivery | How SBOMs are made available to consumers                      |
| Access Control          | Roles and permissions for SBOM access                          |
| Accommodation of Errors | Process for handling mistakes in SBOM data                     |

---

### CISA Minimum Elements (2025 Draft)

The [CISA 2025 Minimum Elements for a Software Bill of Materials](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom) is an update to the 2021 NTIA guidance, reflecting tooling maturity and lessons learned from SBOM adoption.

**Important:** This is a public comment draft and is pre-decisional. It does not represent final US government policy. The draft explicitly states it **does not create new requirements** but rather updates prior guidance.

The 2025 draft introduces new data fields (Component Hash, License, Tool Name, Generation Context) and clarifies existing ones based on real-world implementation experience.

| Data Field              | Status             | Change from NTIA 2021                                 |
| ----------------------- | ------------------ | ----------------------------------------------------- |
| SBOM Author             | Minimum data field | Major update - clarified role                         |
| Software Producer       | Minimum data field | Major update - distinguished from author              |
| Component Name          | Minimum data field | Unchanged                                             |
| Component Version       | Minimum data field | Major update - version string handling                |
| Software Identifiers    | Minimum data field | Major update - purl/CPE guidance                      |
| Component Hash          | Minimum data field | **New** - integrity verification                      |
| License                 | Minimum data field | **New** - per-component licensing                     |
| Dependency Relationship | Minimum data field | Major update - relationship types                     |
| SBOM Generation Tool    | Minimum data field | **New** - tool name/version                           |
| Timestamp               | Minimum data field | Minor update - ISO 8601 clarity                       |
| Generation Context      | Minimum data field | **New** - SDLC phase and how/where SBOM was generated |

**Updated Practices:**

| Practice                 | Change from NTIA 2021                                     |
| ------------------------ | --------------------------------------------------------- |
| Coverage                 | Replaces "Depth" - includes horizontal + vertical breadth |
| Known Unknowns           | Clarified - distinguish unknown vs known-but-withheld     |
| Distribution & Delivery  | Access Control folded into this practice                  |
| Accommodation of Updates | Replaces "Accommodation of Errors"                        |

---

### EU Cyber Resilience Act (CRA)

The [EU Cyber Resilience Act](https://eur-lex.europa.eu/eli/reg/2024/2847/oj) (Regulation EU 2024/2847) is European law mandating cybersecurity requirements for products with digital elements. Unlike NTIA/CISA guidance, the CRA is **binding law** in the EU.

While the CRA does not enumerate specific SBOM fields (author, timestamp, supplier name, etc.), it **does explicitly require an SBOM** with specific format and scope requirements.

#### What the CRA requires

**Annex I, Part II(1)** mandates that manufacturers must "identify and document vulnerabilities and components contained in products with digital elements, **including by drawing up a software bill of materials** in a commonly used and machine-readable format covering **at least the top-level dependencies** of the product."

| CRA Requirement         | Description                                             | Status   |
| ----------------------- | ------------------------------------------------------- | -------- |
| Machine-readable SBOM   | SBOM must be in a machine-readable format               | Required |
| Commonly used format    | Must use a commonly used format (e.g., CycloneDX, SPDX) | Required |
| Top-level dependencies  | Must include at least top-level (direct) dependencies   | Required |
| Component documentation | SBOM must reflect components contained in the product   | Required |

#### Technical documentation and authority access

The CRA requires drawing up an SBOM (Annex I, Part II(1)). Authorities can request the information and documentation needed to demonstrate conformity upon a reasoned request; in practice this includes the SBOM.

| CRA Requirement  | Description                                                                        | Status                         |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| SBOM production  | Required as part of vulnerability handling (Annex I, Part II(1))                   | Required                       |
| Authority access | Producible to market surveillance authorities upon reasoned request for conformity | Required upon reasoned request |

#### User disclosure (optional)

**Annex II, Part I, point 9** states: "If the manufacturer decides to make available the software bill of materials to the user, [provide] information on where the software bill of materials can be accessed."

| CRA Requirement            | Description                                                 | Status              |
| -------------------------- | ----------------------------------------------------------- | ------------------- |
| User delivery              | Providing SBOM to end users                                 | Optional            |
| Access location disclosure | If SBOM is shared with users, must state where to access it | Required if sharing |

#### Future specifications

The CRA explicitly empowers the European Commission to "specify the format and elements of the software bill of materials" via implementing acts. This means specific field-level requirements (similar to NTIA/CISA minimum elements) may be added in the future through delegated legislation.

**Key takeaway:** The CRA requires an SBOM covering at least top-level dependencies in a machine-readable, commonly used format. Organizations should align with NTIA/CISA minimum elements to ensure their SBOMs satisfy both US and EU expectations.

For more on CRA implications, see our [CRA deep dive podcast episode]({{ site.url }}/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/).

---

### EU NIS2 Directive (Directive (EU) 2022/2555)

The [NIS2 Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32022L2555) is the EU's baseline cybersecurity law for "essential" and "important" entities. Unlike the CRA, **NIS2 does not explicitly mandate SBOMs by name or define SBOM field-level requirements**. Instead, it mandates cybersecurity risk-management outcomes (supply chain security, secure acquisition/development, vulnerability handling, and asset management) that SBOMs are commonly used to evidence.

#### What NIS2 requires (SBOM-relevant)

NIS2 requires risk-management measures including **supply chain security** and **security in acquisition, development and maintenance**, including **vulnerability handling and disclosure**, plus **asset management**. It also introduces strict incident reporting expectations (24h/72h timelines for significant incidents), which increases the operational need to rapidly determine whether a newly disclosed vulnerability affects your systems.

#### NIS2 implementing rules get closer to "SBOM language"

For certain NIS2 "relevant entities" (DNS, cloud, data centres, CDNs, managed services/MSSPs, online marketplaces/search engines/social networks, trust services), the [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R2690) specifies procurement and supply chain controls and explicitly requires **"information describing the hardware and software components used in the ICT services or ICT products"** as part of secure acquisition processes. This is effectively an "SBOM/HBOM or equivalent component inventory" expectation in procurement form.

| NIS2 Requirement                             | Description                                                                                                                        | Status                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Supply chain security                        | Security measures covering relationships with direct suppliers/service providers                                                   | Required                       |
| Secure acquisition, development, maintenance | Includes vulnerability handling and disclosure                                                                                     | Required                       |
| Asset management                             | Part of required cybersecurity risk-management measures                                                                            | Required                       |
| Incident reporting speed                     | Significant incident notification within 24h/72h timelines                                                                         | Required                       |
| Component information for acquired ICT       | "Information describing the hardware and software components used" (for in-scope entities under Implementing Regulation 2024/2690) | Required for in-scope entities |

#### Practical SBOM takeaways for NIS2

Even though NIS2 does not say "you must publish an SBOM", SBOMs are a practical way to operationalize and evidence NIS2 controls:

- **Procurement:** Request SBOM/HBOM (or equivalent component inventory) from suppliers, and require updates over the lifecycle
- **Vulnerability response:** Correlate SBOMs with vulnerability advisories to answer "are we affected?" within incident-reporting timelines
- **Supplier governance:** Tie SBOM delivery + vulnerability handling obligations into supplier contracts and reviews

**Key takeaway:** Since NIS2 does not define SBOM fields, align with NTIA/CISA minimum elements for component identity, version, supplier, identifiers, and dependency relationships. Treat that as your "NIS2-ready" SBOM baseline.

---

### FDA Medical Device Guidance (2025)

The [FDA Cybersecurity in Medical Devices guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations-and-content-premarket-submissions) (June 2025) adds sector-specific SBOM expectations for medical device manufacturers. The guidance recommends providing a machine-readable SBOM consistent with the [minimum elements](#ntia-minimum-elements-2021) (also referred to as baseline attributes) identified in NTIA's _Framing Software Component Transparency_ (October 2021), plus additional lifecycle properties.

**Important:** This is FDA guidance, not a regulation. The document uses "should" language, meaning these are strong recommendations that FDA expects manufacturers to follow for premarket submissions, but they are not legally binding requirements in the same way as regulations.

| Field                            | Description                                                                   | Status              |
| -------------------------------- | ----------------------------------------------------------------------------- | ------------------- |
| Baseline attributes              | SBOM consistent with CISA Framing baseline attributes                         | FDA recommends      |
| Software Component Support Level | Current support status (e.g., full support, security-fixes-only, unsupported) | SBOM should include |
| End-of-Support Date              | Date when support for the component will end                                  | SBOM should include |

These lifecycle properties are critical for medical device security because:

- Medical devices have long operational lifetimes (often 10+ years)
- Healthcare organizations need to plan for component end-of-life
- Unsupported components represent elevated security risk

For more details, see our [FDA Medical Device SBOM Requirements guide]({{ site.url }}/2026/01/09/fda-medical-device-sbom-requirements/).

---

### CISA Framing Document (3rd Edition, 2024)

The [CISA Framing Software Component Transparency](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf) document provides conceptual definitions and serves as the normalization layer across SBOM formats. It defines "Baseline Attributes" and provides the authoritative crosswalk between CycloneDX and SPDX (including SPDX 3.0).

Key terminology from the Framing document:

- **Author** - The source of the descriptive metadata (not the author of the software itself)
- **Dependency** - The relationship between two components, including types: static, dynamic, remote, provided, direct, transitive

The Framing document is particularly useful as the canonical source for schema field mappings referenced throughout this page.

---

### CISA SBOM Sharing Lifecycle Report (2023)

The [CISA SBOM Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf) focuses on operational aspects of SBOM distribution rather than adding new data fields. It defines the SBOM sharing lifecycle as three phases: **Discovery** (locating SBOMs), **Access** (authorization and retrieval), and **Transport** (delivery mechanisms).

This report does not prescribe additional SBOM properties but provides guidance on infrastructure and processes needed for effective SBOM sharing across the supply chain. Key concepts include:

- Discoverability mechanisms for locating SBOMs
- Authorization and access control patterns
- Transport protocols and sharing patterns (repository portals, APIs, out-of-band delivery)
- Enrichment workflows where downstream consumers add information and re-share

---

## Master Requirements Comparison

This table compares SBOM data field expectations across major frameworks. All frameworks assume machine-readable SBOMs in a commonly used format (e.g., CycloneDX, SPDX).

**Framework context:**

- **NTIA 2021** and **CISA 2025** are US guidance documents (not law)
- **CRA** and **NIS2** are binding EU legislation
- **FDA 2025** is guidance for medical device premarket submissions

| Property                        | NTIA 2021 | CISA 2025 | CRA | NIS2 | FDA 2025 |
| ------------------------------- | :-------: | :-------: | :-: | :--: | :------: |
| **Document-Level Metadata**     |           |           |     |      |          |
| SBOM Author                     |     ✓     |     ✓     |  -  |  -   |    ✓     |
| Timestamp                       |     ✓     |     ✓     |  -  |  -   |    ✓     |
| Tool Name/Version               |     -     |     ✓     |  -  |  -   |    -     |
| Generation Context              |     -     |     ✓     |  -  |  -   |    -     |
| **Component Identification**    |           |           |     |      |          |
| Supplier / Software Producer    |     ✓     |     ✓     |  -  |  -   |    ✓     |
| Component Name                  |     ✓     |     ✓     |  -  |  ●   |    ✓     |
| Component Version               |     ✓     |     ✓     |  -  |  ●   |    ✓     |
| Unique Identifiers (purl/CPE)   |     ✓     |     ✓     |  -  |  -   |    ✓     |
| Component Hash                  |     -     |     ✓     |  -  |  -   |    -     |
| **Relationships**               |           |           |     |      |          |
| Dependency Relationship         |     ✓     |     ✓     | ✓*  |  -   |    ✓     |
| **Legal**                       |           |           |     |      |          |
| License                         |     -     |     ✓     |  -  |  -   |    -     |
| **Lifecycle**                   |           |           |     |      |          |
| Support Level                   |     -     |     -     |  -  |  -   |    ✓     |
| End-of-Support Date             |     -     |     -     |  -  |  -   |    ✓     |
| **Process / Access**            |           |           |     |      |          |
| SBOM production required        |     -     |     -     |  ✓  |  -   |    -     |
| Authority access on request     |     -     |     -     |  ●  |  -   |    -     |
| User access location disclosure |     -     |     -     |  ●  |  -   |    -     |
| Supply chain security measures  |     -     |     -     |  -  |  ✓   |    -     |
| Vulnerability handling process  |     -     |     -     |  -  |  ✓   |    -     |

**Legend:**

- **✓** = Expected (NTIA/CISA minimum element, FDA recommended, or NIS2 required)
- **✓*** = CRA requires at least top-level (direct) dependencies
- **●** = Conditional obligation (CRA: where applicable; NIS2: for in-scope entities per Regulation 2024/2690)
- **-** = Not specified by this framework

**Important notes:**

- NTIA 2021 and CISA 2025 define "minimum elements" as guidance, not legal requirements
- CISA 2025 is a public comment draft and explicitly does not create new requirements
- FDA uses "should" language (recommendations for premarket submissions)
- CRA is binding law but does not specify individual data fields beyond dependency scope
- NIS2 does not mandate SBOMs by name, but the implementing regulation (2024/2690) requires "information describing the hardware and software components used" for in-scope entities

---

## Schema Crosswalk: CycloneDX and SPDX

This section maps SBOM properties to their specific field paths in CycloneDX, SPDX 2.3, and SPDX 3.0.

**Note:** The CISA Framing document's published crosswalk table references CycloneDX v1.6. This page uses CycloneDX 1.7 schema paths, which are largely compatible but include some updates (e.g., tools object structure).

### Document-Level Metadata

| Property           | CycloneDX 1.7                                                    | SPDX 2.3                                    | SPDX 3.0                     |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| SBOM Author        | `metadata.authors[]`                                             | `creationInfo.creators[]`                   | `creationInfo.createdBy`     |
| Timestamp          | `metadata.timestamp`                                             | `creationInfo.created`                      | `creationInfo.created`       |
| Tool Name/Version  | `metadata.tools.components[]` and/or `metadata.tools.services[]` | `creationInfo.creators[]` (tool identifier) | `creationInfo.createdUsing`  |
| Generation Context | `metadata.lifecycles[].phase`                                    | `CreatorComment` or `DocumentComment`       | Profile-dependent properties |

**Notes:**

- The CISA Framing crosswalk maps "SBOM Author Name" to `metadata.authors` (CycloneDX v1.6). CycloneDX 1.7 additionally provides `metadata.manufacturer` for organizational authorship if needed.
- In CycloneDX 1.7, `metadata.tools` is an object containing `components` and/or `services` arrays. The legacy array format is deprecated.
- The `metadata.lifecycles[].phase` field captures the stage(s) in which data in the BOM was captured (design, pre-build, build, post-build, operations, discovery, decommission).
- **Generation Context** (per CISA 2025) includes both SDLC phase and context about "how and where" the SBOM was generated. For complete representation, you may also use `metadata.tools` (to express tooling) and `metadata.properties[]` (for additional context).

### Component Identification

| Property           | CycloneDX 1.7                | SPDX 2.3                    | SPDX 3.0                             |
| ------------------ | ---------------------------- | --------------------------- | ------------------------------------ |
| Supplier Name      | `components[].supplier.name` | `packages[].supplier`       | Organization agent linked to element |
| Component Name     | `components[].name`          | `packages[].name`           | Element name field                   |
| Component Version  | `components[].version`       | `packages[].versionInfo`    | Element version field                |
| Package URL (purl) | `components[].purl`          | `packages[].externalRefs[]` | External identifier support          |
| CPE                | `components[].cpe`           | `packages[].externalRefs[]` | External identifier support          |
| Component Hash     | `components[].hashes[]`      | `packages[].checksums[]`    | Verification/checksum properties     |

### Relationships

| Property                | CycloneDX 1.7                                       | SPDX 2.3                       | SPDX 3.0                       |
| ----------------------- | --------------------------------------------------- | ------------------------------ | ------------------------------ |
| Dependency Relationship | `dependencies[].ref` + `dependencies[].dependsOn[]` | `relationships[]` (DEPENDS_ON) | Relationships between elements |

### Legal & Security

| Property | CycloneDX 1.7             | SPDX 2.3                                                     | SPDX 3.0                                 |
| -------- | ------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| License  | `components[].licenses[]` | `packages[].licenseDeclared` / `packages[].licenseConcluded` | Rich licensing model (profile-dependent) |

### Lifecycle Properties (FDA/CLE)

| Property            | CycloneDX 1.7               | SPDX 2.3                        | SPDX 3.0                    |
| ------------------- | --------------------------- | ------------------------------- | --------------------------- |
| Support Level       | `components[].properties[]` | `annotations` or `externalRefs` | Extension/property modeling |
| End-of-Support Date | `components[].properties[]` | `packages[].validUntilDate`     | Extension/property modeling |

**Note:** SPDX 2.3's `validUntilDate` field is defined as the "end of support period for the package from the supplier," making it the most appropriate mapping for FDA's end-of-support date requirement.

---

## CLE: Common Lifecycle Enumeration

[CLE (ECMA-428)](https://ecma-international.org/publications-and-standards/standards/ecma-428/) is a standard for machine-readable component lifecycle events, including end-of-life (EOL), end-of-support (EOS), aliasing, and provenance changes.

**Important distinction:** CycloneDX's `metadata.lifecycles[].phase` represents the SDLC context of when the SBOM was generated (build-time vs runtime, etc.). CLE addresses a different concept: the lifecycle status of individual components (whether they are supported, approaching EOL, etc.). These are complementary, not overlapping.

### Representing CLE in CycloneDX

CycloneDX supports CLE-style lifecycle data without breaking schema compliance:

1. **BOM lifecycle phase (SDLC context)** - Use `metadata.lifecycles[].phase` to indicate when/how the SBOM was captured (design, pre-build, build, post-build, operations, discovery, decommission)

2. **Component lifecycle events (CLE)** - Use `components[].properties[]` with CLE-namespaced keys for per-component lifecycle status:

```json
{
  "components": [{
    "name": "example-library",
    "version": "1.2.3",
    "properties": [
      { "name": "cle:eos", "value": "2027-06-30" },
      { "name": "cle:eol", "value": "2028-12-31" },
      { "name": "cle:supportLevel", "value": "security-fixes-only" }
    ]
  }]
}
```

3. **External reference** - Optionally link to authoritative CLE documents via `externalReferences[]`

**Note on key naming:** The property keys shown above (`cle:eos`, `cle:eol`, `cle:supportLevel`) are illustrative examples. For interoperability, key naming should follow ECMA-428's data model or a published property taxonomy/namespace.

This approach satisfies FDA's lifecycle requirements while aligning with emerging standards.

---

## Additional Resources

- [NTIA Minimum Elements for a Software Bill of Materials (2021)](https://www.ntia.gov/sites/default/files/publications/sbom_minimum_elements_report_0.pdf)
- [CISA 2025 Minimum Elements (Public Comment Draft)](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom)
- [CISA Framing Software Component Transparency (3rd Edition)](https://www.cisa.gov/sites/default/files/2024-10/SBOM%20Framing%20Software%20Component%20Transparency%202024.pdf)
- [CISA SBOM Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf)
- [EU Cyber Resilience Act (Regulation 2024/2847)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [CLE Specification (ECMA-428)](https://ecma-international.org/publications-and-standards/standards/ecma-428/)

<div class="mt-16 flex justify-center">
  <a href="https://github.com/sbomify/sbomify.com/blob/master/compliance.md" class="inline-flex items-center gap-2 !text-gray-500 hover:!text-gray-900 transition-colors !no-underline text-sm font-medium">
    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
    <span>Edit this page on GitHub</span>
  </a>
</div>
