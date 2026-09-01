---

url: /compliance/cisa-minimum-elements/
title: "CISA 2026 SBOM Minimum Elements: All 23 Elements Listed"
description: "The 2026 Minimum Elements for a Software Bill of Materials, published 29 July 2026 by CISA with 17 partner agencies. Updates and replaces the NTIA 2021 baseline. Covers all 23 elements across SBOM Metadata, Component Data, and Practices and Processes, with the full change log from 2021."
---

[← Back to Compliance Overview](/compliance/)

**Who it affects:** Organizations that produce software, procure software, or operate software. The 2026 minimum elements apply to SBOMs for all software, including open source software, AI software, and SaaS.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The [2026 Minimum Elements for a Software Bill of Materials (SBOM)](https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom) was published on **29 July 2026** by the US Cybersecurity and Infrastructure Security Agency (CISA), together with the NSA, the FBI, and fifteen international partner agencies.

In CISA's own words, the document "updates and replaces the Minimum Elements for a Software Bill of Materials published by the National Telecommunications and Information Administration (NTIA)." The [NTIA 2021 minimum elements](/compliance/ntia-minimum-elements/) are no longer the operative US baseline.

**This is not a new compliance obligation.** The document is explicit: "The minimum elements do not create new requirements; they refine how organizations should generate and request SBOMs." Data management, storage practices, and precise encoding details are out of scope.

The 2026 update incorporates public feedback from the 2025 draft comment period. Relative to 2021 it adds **10 new elements**, substantially revises **8**, makes minor updates to **5**, and **removes 1**.

### Co-authoring organizations

CISA, NSA, FBI, ASD's ACSC (Australia), Cyber Centre (Canada), NÚKIB (Czechia), ANSSI (France), BSI (Germany), CERT-In (India), ACN (Italy), METI and NCO (Japan), NIS/NCSC (Netherlands and UK), KISA (South Korea), NCSC-NL, NCSC-NZ, NASK (Poland), and NBU (Slovakia).

## The 23 Elements

The minimum elements fall into three groups. **Data Fields** covers what goes in the SBOM document, split into SBOM Metadata and Component Data. **Practices and Processes** covers how organizations generate, share, and maintain SBOMs.

Only the Data Fields appear in the document's Appendix A table; Coverage and the other practices are elements too, but they are not data fields.

### SBOM Metadata (9 elements)

Information about the SBOM document itself.

| Element                  | Status       | Definition (CISA Appendix A)                                                                                                                                         |
| ------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SBOM Author              | Major update | The name of the entity that creates the SBOM data for the target component.                                                                                          |
| SBOM Author Signature    | **New**      | A digital signature attributable to the SBOM author.                                                                                                                 |
| SBOM Data Format Name    | **New**      | The name of the data format used to represent the SBOM data.                                                                                                         |
| SBOM Data Format Version | **New**      | Identifier designated by the SBOM data format to specify the version of the data format.                                                                             |
| SBOM Generation Context  | **New**      | The relative software lifecycle phase and data available at the time the SBOM author generated the SBOM.                                                             |
| SBOM Timestamp           | Minor update | Record of the date and time of the most recent update to the SBOM data.                                                                                              |
| SBOM Tool Name           | **New**      | The name of the tool used by the SBOM author to generate or amend the SBOM.                                                                                          |
| SBOM Tool Version        | **New**      | Identifier for the version of the tool identified in the SBOM Tool Name element.                                                                                     |
| SBOM Version             | **New**      | Identifier designated by the SBOM author to specify a change in the SBOM document from a previously identified version, or to indicate that it is the first version. |

Seven of the nine SBOM Metadata elements are new. If you generated SBOMs against the 2021 baseline, this is where most of the gap sits.

### Component Data (8 elements)

Information about each component in the software.

| Element                           | Status       | Definition (CISA Appendix A)                                                                                                                                             |
| --------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component Producer                | Major update | The name of an entity that creates, defines, and identifies components.                                                                                                  |
| Component Name                    | Minor update | The name assigned by the component producer to a software component.                                                                                                     |
| Component Version                 | Major update | Identifier used by the component producer to specify a change in a software component from a previously identified version, or to indicate that it is the first version. |
| Component Identifiers             | Major update | Identifiers used to identify a component or serve as a look-up key for relevant databases.                                                                               |
| Component Hash Value              | **New**      | The output generated from applying a cryptographic hash algorithm to an executable component artifact.                                                                   |
| Component Hash Algorithm          | **New**      | The cryptographic algorithm used to compute the Component Hash Value of the software component.                                                                          |
| Component License                 | **New**      | The identifiers for the licenses under which the software component is available.                                                                                        |
| Component Dependency Relationship | Minor update | The relationship between two components, where one component is necessary for the operation of the other.                                                                |

Note that the hash is **two** elements, not one: the digest and the algorithm used to produce it.

### Practices and Processes (6 elements)

| Element                                    | Status       | What the document says                                                                                                |
| ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Accommodation of Updates to SBOM Data      | Major update | Organizations should accommodate updates including corrections; SBOM authors should correct errors promptly.          |
| Coverage                                   | Major update | All components including transitive dependencies. **There is no minimum depth.**                                      |
| Distribution and Delivery                  | Minor update | SBOMs available promptly to those who need them. Access controls must not prevent sharing between authorized parties. |
| Explicitly Identifying Unknown Information | Major update | State whether missing information is unknown to the author or is being withheld.                                      |
| Frequency                                  | Minor update | Each software version or update should have an associated SBOM.                                                       |
| Machine-Processable Data                   | Major update | SPDX and CycloneDX are named as the two widely used formats.                                                          |

## What Changed From NTIA 2021

### The 10 new elements

SBOM Author Signature · SBOM Data Format Name · SBOM Data Format Version · SBOM Generation Context · SBOM Tool Name · SBOM Tool Version · SBOM Version · Component Hash Value · Component Hash Algorithm · Component License

### The 8 major updates

Several are renames, and the old name is what you will recognise from 2021:

| 2021 name                 | 2026 name                                  |
| ------------------------- | ------------------------------------------ |
| Author of SBOM Data       | SBOM Author                                |
| Supplier Name             | Component Producer                         |
| Version of the Component  | Component Version                          |
| Other Identifiers         | Component Identifiers                      |
| Depth                     | Coverage                                   |
| Known Unknowns            | Explicitly Identifying Unknown Information |
| Accommodation of Mistakes | Accommodation of Updates to SBOM Data      |
| Automation Support        | Machine-Processable Data                   |

### The 5 minor updates

SBOM Timestamp · Component Name · Component Dependency Relationship · Distribution and Delivery · Frequency

### The 1 removal

**Access Control** is removed as a standalone element. Access control considerations are now folded into Distribution and Delivery.

## Details Worth Catching

These are the specifics most likely to trip up an existing SBOM pipeline.

**Timestamps should follow RFC 9557**, not a generic ISO 8601 profile. Each version of an SBOM gets a new timestamp.

**Component Identifiers requires at least one identifier**, but does not mandate a specific scheme. The document says the field _should_ use common identifiers "such as Common Platform Enumeration (CPE) and Package-URL (PURL)". It also permits UUIDs, organization-specific identifiers, commit hashes, and intrinsic identifiers such as OmniBOR and SWHID. If there are multiple identifiers, include all of them.

**Coverage has no minimum depth.** An SBOM should cover all components including transitive dependencies. Where multiple instances of a component differ in metadata, each instance should be listed separately. Linking to other SBOM documents can satisfy Coverage, provided the recipient has access to all linked SBOMs.

**SWID Tags are gone** from the list of data formats. The Machine-Processable Data element names only SPDX and CycloneDX.

**Component Producer needs a fallback.** Where provenance is unknown, the document expects an explicit designation indicating unknown provenance rather than an empty field.

**Withholding is not the same as unknown.** If a field is absent, the author should say which it is, and should have a process for recipients to ask about redacted security-related information. An SBOM may be considered incomplete if essential component data is withheld.

## Scope

The 2026 minimum elements apply to SBOMs for all software, including open source software, AI software, and SaaS. The document notes that more complex systems such as AI or SaaS may need additional elements to be transparent, but that those additional elements are out of scope here. Separate joint guidance, _Software Bill of Materials for AI – Minimum Elements_, was released by CISA and G7 partners in May 2026.

## Schema Mappings

For CycloneDX and SPDX field mappings, see our [Schema Crosswalk](/compliance/schema-crosswalk/).

## Related Frameworks

- [NTIA Minimum Elements (2021)](/compliance/ntia-minimum-elements/) - The superseded baseline this replaces
- [CISA Framing Document](/compliance/cisa-framing/) - Conceptual definitions and format crosswalk
- [EU Cyber Resilience Act](/compliance/eu-cra/) - EU SBOM requirements, where BSI is also a co-author of this document

## Official Source

- [2026 Minimum Elements for a Software Bill of Materials (SBOM)](https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom) - CISA, 29 July 2026

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
