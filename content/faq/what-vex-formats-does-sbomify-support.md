---
title: "What VEX formats does sbomify support?"
description: "sbomify natively ingests VEX documents in CycloneDX VEX (JSON and XML), OpenVEX, and CSAF 2.0 VEX formats, with automatic format detection."
answer: "sbomify ingests VEX in three formats: CycloneDX VEX (JSON and XML), OpenVEX (the format used by vexctl and Chainguard), and CSAF 2.0 VEX (the OASIS standard used by vendors like Red Hat and Cisco). The format is detected automatically on upload, and statements are applied to your OSV and Dependency Track findings."
tldr: "CycloneDX VEX (JSON and XML), OpenVEX, and CSAF 2.0 VEX are all natively supported, with automatic format detection. Upload through the component page, the API, or CI with BOM_TYPE: vex."
weight: 66
keywords: [VEX formats, CycloneDX VEX, OpenVEX, CSAF VEX, CSAF 2.0, VEX support, vexctl, upload VEX]
url: /faq/what-vex-formats-does-sbomify-support/
---

## Supported formats

sbomify ingests VEX documents in the three formats that matter in practice, and detects which one you uploaded automatically:

| Format            | Typical producers                                                    | Notes                                                                |
| ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **CycloneDX VEX** | Dependency-Track exports, CycloneDX tooling, sbomify's own triage    | JSON and XML accepted; the richest format, with five analysis states |
| **OpenVEX**       | [vexctl](https://github.com/openvex/vexctl), Chainguard tooling      | Lightweight JSON-LD format from the OpenVEX project                  |
| **CSAF 2.0 VEX**  | OS and hardware vendor advisories (Red Hat, Cisco, SUSE, and others) | The OASIS standard for machine-readable security advisories          |

One nuance worth knowing: `not_affected` statements suppress findings from all three formats, while the `false_positive` analysis state is specific to CycloneDX.

## How to upload

- **In the app.** Use the upload panel on the component page. VEX artifacts are listed next to SBOMs with their own badge.
- **Via the API.** CycloneDX VEX goes to the CycloneDX artifact endpoint with `bom_type=vex`; OpenVEX and CSAF documents go to the format-agnostic `/api/v1/sboms/artifact/vex/` endpoint, which detects the format for you.
- **From CI.** Set `BOM_TYPE: vex` in your [sbomify-action](https://github.com/sbomify/sbomify-action) step. The document is uploaded verbatim, byte for byte, with no modification.

## What happens after upload

Your VEX statements are applied to existing OSV and Dependency Track scan results, suppressing findings you have marked as not affected. Each release exposes a merged VEX download on both the internal release page and the public Trust Center release page.

For the full workflow, including in-app triage, CISA KEV flags, and generating VEX from your own triage decisions, see [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/).

## Further reading

- [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/) - the complete VEX workflow
- [What SBOM formats does sbomify support?](/faq/what-sbom-formats-does-sbomify-support/) - the SBOM side of the house
- [Schema crosswalk](/compliance/schema-crosswalk/) - how vulnerability data maps across CycloneDX, SPDX, CSAF, and VEX
