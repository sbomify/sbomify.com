---
layout: page
permalink: /compliance/cle/
title: "CLE: Common Lifecycle Enumeration for SBOMs"
description: "Guide to CLE (ECMA-428), the standard for machine-readable component lifecycle events including end-of-life, end-of-support, and provenance changes."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

[CLE (ECMA-428)](https://ecma-international.org/publications-and-standards/standards/ecma-428/) is a standard for machine-readable component lifecycle events, including end-of-life (EOL), end-of-support (EOS), aliasing, and provenance changes.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## CLE vs. SBOM Lifecycle Phase

**Important distinction:** CycloneDX's `metadata.lifecycles[].phase` represents the SDLC context of when the SBOM was generated (build-time vs runtime, etc.). CLE addresses a different concept: the lifecycle status of individual components (whether they are supported, approaching EOL, etc.). These are complementary, not overlapping.

| Concept              | What it represents                             | Where it lives                    |
| -------------------- | ---------------------------------------------- | --------------------------------- |
| SBOM Lifecycle Phase | When/how the SBOM was generated (SDLC context) | `metadata.lifecycles[].phase`     |
| CLE Lifecycle Events | Support status of individual components        | `components[].properties[]` (CLE) |

---

## Representing CLE in CycloneDX

CycloneDX supports CLE-style lifecycle data without breaking schema compliance:

### 1. BOM Lifecycle Phase (SDLC Context)

Use `metadata.lifecycles[].phase` to indicate when/how the SBOM was captured:

- design
- pre-build
- build
- post-build
- operations
- discovery
- decommission

### 2. Component Lifecycle Events (CLE)

Use `components[].properties[]` with CLE-namespaced keys for per-component lifecycle status:

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

### 3. External Reference

Optionally link to authoritative CLE documents via `externalReferences[]`.

---

## Key Naming Convention

**Note on key naming:** The property keys shown above (`cle:eos`, `cle:eol`, `cle:supportLevel`) are illustrative examples. For interoperability, key naming should follow ECMA-428's data model or a published property taxonomy/namespace.

---

## FDA Requirements and CLE

This approach satisfies [FDA's lifecycle requirements]({{ site.url }}/compliance/fda-medical-device/) (support level and end-of-support date) while aligning with emerging standards.

---

## Related Pages

- [Schema Crosswalk]({{ site.url }}/compliance/schema-crosswalk/) - CycloneDX and SPDX field mappings
- [FDA Medical Device Guidance]({{ site.url }}/compliance/fda-medical-device/) - Healthcare sector lifecycle requirements

## Official Source

- [CLE Specification (ECMA-428)](https://ecma-international.org/publications-and-standards/standards/ecma-428/)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
