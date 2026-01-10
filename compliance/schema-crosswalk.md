---
layout: page
permalink: /compliance/schema-crosswalk/
title: "SBOM Schema Crosswalk: CycloneDX and SPDX Field Mappings"
description: "Complete field mapping reference for CycloneDX 1.7, SPDX 2.3, and SPDX 3.0. Authoritative crosswalk for SBOM properties across formats."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

This page maps SBOM properties to their specific field paths in CycloneDX, SPDX 2.3, and SPDX 3.0.

<div class="not-prose my-6 p-5 bg-[#201B4C] border border-[#37306B] rounded-xl">
  <p class="text-white mb-3"><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="inline-block px-5 py-2.5 bg-[#8A7DFF] hover:bg-[#7A6DE5] text-white rounded-full font-medium text-sm transition-all duration-200">Get in Touch</a>
</div>

**Note:** The CISA Framing document's published crosswalk table references CycloneDX v1.6. This page uses CycloneDX 1.7 schema paths, which are largely compatible but include some updates (e.g., tools object structure).

---

## Document-Level Metadata

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

---

## Component Identification

| Property           | CycloneDX 1.7                | SPDX 2.3                    | SPDX 3.0                             |
| ------------------ | ---------------------------- | --------------------------- | ------------------------------------ |
| Supplier Name      | `components[].supplier.name` | `packages[].supplier`       | Organization agent linked to element |
| Component Name     | `components[].name`          | `packages[].name`           | Element name field                   |
| Component Version  | `components[].version`       | `packages[].versionInfo`    | Element version field                |
| Package URL (purl) | `components[].purl`          | `packages[].externalRefs[]` | External identifier support          |
| CPE                | `components[].cpe`           | `packages[].externalRefs[]` | External identifier support          |
| Component Hash     | `components[].hashes[]`      | `packages[].checksums[]`    | Verification/checksum properties     |

---

## Relationships

| Property                | CycloneDX 1.7                                       | SPDX 2.3                       | SPDX 3.0                       |
| ----------------------- | --------------------------------------------------- | ------------------------------ | ------------------------------ |
| Dependency Relationship | `dependencies[].ref` + `dependencies[].dependsOn[]` | `relationships[]` (DEPENDS_ON) | Relationships between elements |

---

## Legal & Security

| Property | CycloneDX 1.7             | SPDX 2.3                                                     | SPDX 3.0                                 |
| -------- | ------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| License  | `components[].licenses[]` | `packages[].licenseDeclared` / `packages[].licenseConcluded` | Rich licensing model (profile-dependent) |

---

## Lifecycle Properties (FDA/CLE)

| Property            | CycloneDX 1.7               | SPDX 2.3                        | SPDX 3.0                    |
| ------------------- | --------------------------- | ------------------------------- | --------------------------- |
| Support Level       | `components[].properties[]` | `annotations` or `externalRefs` | Extension/property modeling |
| End-of-Support Date | `components[].properties[]` | `packages[].validUntilDate`     | Extension/property modeling |

**Note:** SPDX 2.3's `validUntilDate` field is defined as the "end of support period for the package from the supplier," making it the most appropriate mapping for FDA's end-of-support date requirement.

---

## Related Pages

- [CLE: Common Lifecycle Enumeration]({{ site.url }}/compliance/cle/) - Standard for machine-readable lifecycle events
- [CISA Framing Document]({{ site.url }}/compliance/cisa-framing/) - Authoritative source for baseline attribute definitions
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - US baseline for SBOM data fields

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
