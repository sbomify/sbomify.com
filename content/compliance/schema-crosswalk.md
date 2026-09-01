---

url: /compliance/schema-crosswalk/
title: "SBOM Schema Crosswalk: CycloneDX and SPDX Field Mappings"
description: "Field mapping reference for the CISA 2026 SBOM Minimum Elements across CycloneDX 1.6/1.7, SPDX 2.3 and SPDX 3.0, plus a general crosswalk for SBOM properties across formats."
---

[← Back to Compliance Overview](/compliance/)

This page maps the [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/), and SBOM properties generally, to their specific field paths in CycloneDX, SPDX 2.3, and SPDX 3.0.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

**Note:** The CISA Framing document's published crosswalk table references CycloneDX v1.6. This page uses CycloneDX 1.7 schema paths, which are largely compatible but include some updates (e.g., tools object structure).

**BSI TR-03183-2 Note:** For EU CRA compliance via BSI TR-03183-2, SBOMs MUST use **CycloneDX 1.6+** or **SPDX 3.0.1+** in JSON or XML format. See the [EU CRA page](/compliance/eu-cra/) for full requirements.

---

## CISA 2026 Minimum Elements: Format Mappings

The [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/) define 23 elements, of which 17 are data fields. The tables below map each data field to its representation in SPDX and CycloneDX.

**Provenance:** element names and definitions are quoted from the [CISA 2026 Minimum Elements](https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom) (29 July 2026). The format mappings come from an OpenSSF working document produced with the SPDX and CycloneDX communities. That mapping work is in progress and should be treated as community guidance rather than a ratified standard — verify against the format specifications before relying on it for conformance.

As CISA notes, the correspondence is not one-to-one: "Each Data Fields element need not correlate directly with a particular data field in an SBOM data format, and an implemented data field may satisfy one or more of the minimum elements."

### Component Data

| CISA 2026 Element                 | SPDX 2.3                                      | SPDX 3.0                                                | CycloneDX 1.6                               | CycloneDX 1.7 |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ------------- |
| Component Producer                | `packages[].originator`                       | `Package.originatedBy`                                  | `manufacturer.name` or `authors[].name`     | Same          |
| Component Name                    | `packages[].name`                             | `Package.name`                                          | `components[].name`                         | Same          |
| Component Version                 | `packages[].versionInfo`                      | `Package.packageVersion`                                | `components[].version`                      | Same          |
| Component Identifiers             | `packages[].externalRefs[]` incl. SWID/gitoid | `packageURL`; `externalIdentifier`; `contentIdentifier` | `cpe`, `purl`, `swid`, `omniborId`, `swhid` | Same          |
| Component Hash Value              | `packages[].checksums[].checksumValue`        | `Hash.hashValue`                                        | `components[].hashes[].content`             | Same          |
| Component Hash Algorithm          | `packages[].checksums[].algorithm`            | `Hash.algorithm`                                        | `components[].hashes[].alg`                 | Same          |
| Component License                 | `packages[].licenseDeclared`                  | `hasDeclaredLicense`                                    | `licenses[]`; `acknowledgement=declared`    | Same          |
| Component Dependency Relationship | `relationships[]` (`DEPENDS_ON`)              | `Relationship: dependsOn`                               | `dependencies[].ref` / `dependsOn[]`        | Same          |

### SBOM Metadata

| CISA 2026 Element        | SPDX 2.3                             | SPDX 3.0                                | CycloneDX 1.6                                    | CycloneDX 1.7       |
| ------------------------ | ------------------------------------ | --------------------------------------- | ------------------------------------------------ | ------------------- |
| SBOM Author              | `creationInfo.creators[]` Person/Org | `creationInfo.createdBy` → `Agent.name` | `metadata.manufacturer.name` or `authors[].name` | Same                |
| SBOM Author Signature    | External signed envelope             | External signed envelope                | `signature` (JSF)                                | `signature` (JSF)   |
| SBOM Data Format Name    | `spdxVersion = "SPDX-2.3"`           | `creationInfo.specVersion = "3.0.1"`    | `bomFormat` + media type                         | Same                |
| SBOM Data Format Version | `spdxVersion`                        | `creationInfo.specVersion`              | `specVersion = 1.6`                              | `specVersion = 1.7` |
| SBOM Generation Context  | `creationInfo.comment`               | `Software/Sbom.sbomType`                | `metadata.lifecycles[].phase`                    | Same                |
| SBOM Timestamp           | `creationInfo.created`               | `creationInfo.created`                  | `metadata.timestamp`                             | Same                |
| SBOM Tool Name           | `creationInfo.creators[]` Tool entry | `createdUsing` → `Tool.name`            | `metadata.tools.components[].name`               | Same                |
| SBOM Tool Version        | Parsed from `creators[]` Tool entry  | `Tool` → versioned Package              | `metadata.tools.components[].version`            | Same                |
| SBOM Version             | `documentNamespace`                  | `SBOM-SPDXIdentifier`                   | `version` + `serialNumber`                       | Same                |

### Notes on the mappings

**SBOM Author Signature has no native SPDX representation.** In SPDX 2.2 through 3.0 it requires an external signed envelope. SPDX 3.1 (candidate) introduces `Artifact` plus an external signature. CycloneDX has supported JSF signatures since 1.5, and CycloneDX 2.0 (candidate) moves to a list of JSS signature objects.

**Component Producer moved in CycloneDX 1.6.** In 1.5 it maps to `components[].author` with a property where needed; from 1.6 onward `manufacturer.name` or `authors[].name` is the better fit. CycloneDX 2.0 (candidate) replaces both with `components[].parties[]`.

**Component Producer is not the same as `supplier`.** The older crosswalk below maps NTIA's "Supplier Name" to `components[].supplier.name`. The OpenSSF mapping for CISA 2026's Component Producer uses `manufacturer`/`authors` instead, reflecting that Component Producer means the entity that _originated_ the software rather than the one that supplied it. If you populate only `supplier`, review whether it carries the meaning the 2026 element expects.

**Component License in CycloneDX should be explicit about acknowledgement.** The mapping specifies `acknowledgement=declared`, distinguishing a declared licence from a concluded one.

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
- **SBOM Generation Context** (per CISA 2026) is "the relative software lifecycle phase and data available at the time the SBOM author generated the SBOM." For complete representation, you may also use `metadata.tools` (to express tooling) and `metadata.properties[]` (for additional context).

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

## BSI TR-03183-2 Component Properties

BSI TR-03183-2 requires additional component properties not covered by standard SBOM fields. These use the [BSI CycloneDX property taxonomy](https://github.com/BSI-Bund/tr-03183-cyclonedx-property-taxonomy) for CycloneDX and `software_additionalPurpose` for SPDX.

| Property                | CycloneDX 1.6+                                                               | SPDX 3.0.1                                                                                |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Filename                | `components[].properties[name="bsi:component:filename"]`                     | `software_File.name` via `hasDistributionArtifact` relationship                           |
| Executable property     | `components[].properties[name="bsi:component:executable"]`                   | Add `executable` to `software_additionalPurpose` list                                     |
| Archive property        | `components[].properties[name="bsi:component:archive"]`                      | Add `archive` to `software_additionalPurpose` list                                        |
| Structured property     | `components[].properties[name="bsi:component:structured"]`                   | Add `container` (structured) or `firmware` (unstructured) to `software_additionalPurpose` |
| Effective licence       | `components[].properties[name="bsi:component:effectiveLicense"]`             | Custom relationship with `relationshipType: other` and `comment: hasEffectiveLicense`     |
| Hash (deployable)       | `components[].externalReferences[type="distribution"].hashes[alg="SHA-512"]` | `software_File.verifiedUsing` via `hasDistributionArtifact` relationship                  |
| Dependency completeness | `compositions[].aggregate` (complete/incomplete/unknown)                     | `Relationship.completeness` (complete/incomplete/noAssertion)                             |

**Notes:**

- BSI requires **SHA-512** specifically for the deployable component hash
- The BSI property taxonomy uses the `bsi:` namespace prefix for CycloneDX properties
- For detailed JSON examples, see [BSI TR-03183-2 Section 8.2](https://bsi.bund.de/dok/TR-03183-en)

---

## Related Pages

- [EU CRA Requirements](/compliance/eu-cra/) - CRA SBOM requirements with BSI TR-03183-2 specifications
- [CLE: Common Lifecycle Enumeration](/compliance/cle/) - Standard for machine-readable lifecycle events
- [CISA Framing Document](/compliance/cisa-framing/) - Authoritative source for baseline attribute definitions
- [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) - US baseline for SBOM data fields

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
