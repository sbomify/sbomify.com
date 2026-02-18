---

url: /compliance/eu-cra/
title: "EU Cyber Resilience Act (CRA) SBOM Requirements"
description: "Complete guide to CRA SBOM requirements with BSI TR-03183-2 technical specifications. Covers format requirements, data fields, dependency depth, and compliance checklist."
section: compliance
---

[← Back to Compliance Overview](/compliance/)

**Who it affects:** Manufacturers (and, depending on role, importers/distributors) placing "products with digital elements" on the EU market, plus their software/component supply chains.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## Overview

The [EU Cyber Resilience Act (CRA)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj) (Regulation EU 2024/2847) mandates cybersecurity requirements for products with digital elements, including an SBOM requirement. Unlike US guidance documents, the CRA is **binding law** in the EU.

This page covers:

- **CRA legal baseline** - What the regulation text requires
- **BSI TR-03183-2** - Germany's Federal Office for Information Security (BSI) provides a [Technical Guideline](https://bsi.bund.de/dok/TR-03183-en) specifying concrete SBOM format and content requirements as a detailed interpretation of CRA obligations

> **Terminology note:** In BSI TR-03183-2, RFC 2119 keywords (MUST, SHALL, SHOULD, etc.) are normative **only when written in ALL CAPS**. (BSI TR-03183-2, Section 2)

---

## CRA Legal Baseline

### SBOM Requirement

Annex I, Part II(1) requires manufacturers to "identify and document vulnerabilities and components contained in products with digital elements, **including by drawing up a software bill of materials** in a commonly used and machine-readable format covering **at least the top-level dependencies** of the product."

| CRA Requirement        | Description                                             | Reference           |
| ---------------------- | ------------------------------------------------------- | ------------------- |
| Machine-readable SBOM  | SBOM must be in a machine-readable format               | Annex I, Part II(1) |
| Commonly used format   | Must use a commonly used format (e.g., CycloneDX, SPDX) | Annex I, Part II(1) |
| Top-level dependencies | Must include at least top-level (direct) dependencies   | Annex I, Part II(1) |

### Authority Access

The CRA requires the SBOM as part of technical documentation. Market surveillance authorities may request this documentation upon a reasoned request to assess conformity.

| Requirement      | Description                                                       | Reference           |
| ---------------- | ----------------------------------------------------------------- | ------------------- |
| SBOM production  | Required as part of vulnerability handling                        | Annex I, Part II(1) |
| Authority access | Producible to market surveillance authorities on reasoned request | Article 52          |

### User Disclosure (Optional)

Annex II, Part I, point 9: "If the manufacturer decides to make available the software bill of materials to the user, [provide] information on where the software bill of materials can be accessed."

| Requirement                | Description                                                 | Status              |
| -------------------------- | ----------------------------------------------------------- | ------------------- |
| User delivery              | Providing SBOM to end users                                 | Optional            |
| Access location disclosure | If SBOM is shared with users, must state where to access it | Required if sharing |

### Future Specifications

The CRA empowers the European Commission to "specify the format and elements of the software bill of materials" via implementing acts (Annex I, Part II(1)).

---

## BSI TR-03183-2: Concrete SBOM Requirements

[BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) (v2.1.0, August 2025) from Germany's Federal Office for Information Security provides detailed technical specifications for CRA-compliant SBOMs. Key requirements follow.

> **Note on interpretations:** BSI TR-03183-2 represents the **first published technical interpretation** of CRA SBOM requirements by an EU member state authority. Other EU countries may publish their own interpretations, which could differ in specific requirements. As additional national interpretations emerge, we will update this page to reflect the evolving compliance landscape.

### Compliance Versioning

To be compliant with the Technical Guideline, the **most recent version MUST be used**. The immediately preceding version MAY be used for up to **six months** after a new version is issued. (Section 7)

### Required Formats

SBOMs MUST be in JSON or XML format and follow one of these specifications:

| Format    | Minimum Version | Reference |
| --------- | --------------- | --------- |
| CycloneDX | 1.6 or higher   | Section 4 |
| SPDX      | 3.0.1 or higher | Section 4 |

Only officially released versions are compliant. (Section 4)

### Scope and Dependency Depth

BSI requires a **"delivery item SBOM"** - recursive dependency resolution MUST be performed on each path downward at least up to and including the **first component outside the scope of delivery**. That first external component must at least be **identified** (creator, name, version, other unique identifiers). (Section 5.1)

"Scope of delivery" means all software parts delivered with the product; parts acquired separately are not included. (Section 8.1.11)

### Required Data Fields: SBOM Level

Each SBOM MUST contain (Table 2, Section 5.2.1):

| Data Field      | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| Creator of SBOM | Email address of the SBOM creator; if unavailable, a URL (homepage/project) |
| Timestamp       | Date and time of SBOM compilation (UTC recommended)                         |

### Required Data Fields: Each Component

For each component, the following MUST be provided (Table 3, Section 5.2.2):

| Data Field                   | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Component creator            | Email address or URL of the entity that created/maintains the component                      |
| Component name               | Name assigned by creator; if none, the actual filename                                       |
| Component version            | Version identifier (SemVer/CalVer recommended); if none, file modification date per RFC 3339 |
| Filename                     | Actual filename of the component (not file system path)                                      |
| Dependencies                 | Enumeration of direct dependencies; **completeness MUST be clearly indicated**               |
| Distribution licences        | SPDX licence identifier/expression for licences under which the component can be used        |
| Hash of deployable component | SHA-512 checksum of the deployed/deployable component                                        |
| Executable property          | "executable" or "non-executable"                                                             |
| Archive property             | "archive" or "no archive"                                                                    |
| Structured property          | "structured" or "unstructured" (if component has both, use "structured")                     |

### Additional Data Fields (Conditional)

These MUST be provided **if they exist** and fit the SBOM format (Tables 4-5, Sections 5.2.3-5.2.4):

**SBOM level:**

| Data Field | Description      |
| ---------- | ---------------- |
| SBOM-URI   | URI of this SBOM |

**Component level:**

| Data Field        | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Source code URI   | URI of the source code (repository URL or specific version) |
| Deployable URI    | URI pointing directly to the downloadable form              |
| Other unique IDs  | CPE, Package URL (purl), SWID, etc.                         |
| Original licences | Licence(s) assigned by the component creator                |

### Optional Data Fields

May be included if they exist (Table 6, Section 5.2.5):

| Data Field        | Description                                             |
| ----------------- | ------------------------------------------------------- |
| Effective licence | Licence under which the SBOM creator uses the component |
| Source code hash  | Checksum of source code (algorithm TBD by BSI)          |
| security.txt URL  | URL of the component creator's security.txt (RFC 9116)  |

### Licence Requirements

Licences MUST be referenced by **SPDX licence identifier or expression**. Licence text MUST NOT be used as a substitute for an identifier. (Section 6.1)

If no SPDX identifier exists, consult the [Scancode LicenseDB](https://scancode-licensedb.aboutcode.org/) using prefix `LicenseRef-scancode-[...]`. For truly unknown licences, use `LicenseRef-<entity>-[...]`. (Section 6.1)

### Vulnerability Information

**SBOMs MUST NOT contain vulnerability information.** SBOM data is static; vulnerability information is dynamic. Use **CSAF** or **VEX** for vulnerability communication instead. (Section 3.1, 8.1.14)

### One SBOM Per Version

A **separate SBOM MUST be generated for each software version**. If any component changes, a new software version MUST be assigned. (Section 3.1)

### BOM References

SBOMs of used components MAY be referenced instead of merged, if they are TR-03183-2 compliant. The SBOM provider is responsible for availability of referenced SBOMs. When referencing, the referencing SBOM MUST extract and include creator, name, and version from the referenced BOM. (Section 3.2.5, 5.1)

---

## Practical Compliance Checklist

1. **Generate an SBOM** for each software version as required by CRA Annex I, Part II(1)
2. **Use CycloneDX 1.6+ or SPDX 3.0.1+** in JSON or XML format
3. **Cover the scope of delivery** plus recursive dependencies to the first external component (at minimum, identify that component)
4. **Indicate completeness** of dependency enumeration for each component
5. **Include all required component fields**: creator, name, version, filename, dependencies, distribution licences, SHA-512 hash, executable/archive/structured properties
6. **Use SPDX licence identifiers** - never use licence text as a substitute
7. **Do not embed vulnerability information** - use CSAF/VEX instead
8. **Digitally sign** the SBOM so recipients can verify authenticity (recommended)
9. **Be prepared to provide** the SBOM to market surveillance authorities upon request
10. **If sharing with users**, document where the SBOM can be accessed

---

## Schema Mappings

BSI TR-03183-2 Section 8.2 provides detailed JSON mappings for CycloneDX 1.6 and SPDX 3.0.1.

For general CycloneDX and SPDX field mappings, see our [Schema Crosswalk](/compliance/schema-crosswalk/).

BSI maintains a CycloneDX property taxonomy for TR-03183-2 specific fields: [github.com/BSI-Bund/tr-03183-cyclonedx-property-taxonomy](https://github.com/BSI-Bund/tr-03183-cyclonedx-property-taxonomy)

---

## Related Frameworks

- [EU NIS2 Directive](/compliance/eu-nis2/) - EU cybersecurity law for critical entities
- [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) - US baseline for SBOM content
- [CISA Framing Document](/compliance/cisa-framing/) - CISA guidance on SBOM attributes

---

## Official Sources

- [EU Cyber Resilience Act (Regulation 2024/2847)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [BSI TR-03183-2: Software Bill of Materials (SBOM)](https://bsi.bund.de/dok/TR-03183-en) - v2.1.0, August 2025

---

**Disclaimer:** This page represents our interpretation of the EU Cyber Resilience Act and BSI TR-03183-2. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
