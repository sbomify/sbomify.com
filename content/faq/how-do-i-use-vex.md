---
title: "How do I use VEX with sbomify?"
description: "Learn how Vulnerability Exploitability eXchange (VEX) lets you communicate which vulnerabilities actually affect your product, and how to upload and distribute VEX documents through sbomify."
answer: "A VEX document tells consumers which vulnerabilities in your SBOM are actually exploitable in your product and which are not. You generate a CycloneDX VEX file alongside your SBOM, upload it to the same component in sbomify, and your customers can download both from your Trust Center to make accurate risk decisions without re-running the scanner."
tldr: "VEX is the companion to your SBOM that says \"this CVE is in our dependency tree but it does not actually affect our product, here is why.\" sbomify stores VEX documents per component the same way it stores SBOMs, so consumers see both side-by-side in the Trust Center."
weight: 67
keywords: [VEX, CycloneDX VEX, vulnerability exploitability, SBOM VEX, CSAF VEX, vulnerability triage, false positive, CRA VEX]
url: /faq/how-do-i-use-vex/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/vex_upload.webm" title="How VEX appears alongside an SBOM in sbomify" description="Screencast showing a CycloneDX VEX artifact rendered next to its SBOM on a sbomify component, with the colour-coded VEX and SBOM badges in the BOMs table." >}}

## The problem VEX solves

Run any modern vulnerability scanner against a real-world SBOM and you will get a list. A long list. Most of those CVEs do not actually affect your product:

- The vulnerable function is in a code path your application never calls.
- Your build configuration disables the vulnerable feature.
- You have already applied a backport patch but the version string still reports the original.
- The CVE applies to a different operating system or runtime than the one you ship.

Telling that signal-from-noise story by hand - in spreadsheets, GitHub issues, ticket comments - does not scale. Every customer who downloads your SBOM has to re-derive the same conclusions, and every conclusion is just one engineer's opinion attached to no machine-readable artifact.

**VEX (Vulnerability Exploitability eXchange)** is the standardized fix. It is a separate document that says, for each known vulnerability in your dependency tree, whether the vulnerability actually affects your product and why. Consumers feed your SBOM and your VEX into the same scanner together, and the scanner produces a triaged finding list instead of a raw one.

## What a VEX document looks like

VEX is most commonly produced in **CycloneDX VEX format** (a CycloneDX BOM with `vulnerabilities[]` populated) or **CSAF VEX** (an OASIS standard JSON document). sbomify stores CycloneDX VEX today; CSAF can be uploaded as a regulatory document via the Document feature.

A minimal CycloneDX VEX statement looks like this:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "vulnerabilities": [
    {
      "id": "CVE-2024-12345",
      "source": { "name": "NVD" },
      "ratings": [{ "severity": "high" }],
      "affects": [{ "ref": "pkg:pypi/requests@2.32.3" }],
      "analysis": {
        "state": "not_affected",
        "justification": "code_not_reachable",
        "detail": "We use requests only for outbound HTTPS to a fixed allowlist of internal hosts. The vulnerable XML parser path is never exercised."
      }
    }
  ]
}
```

The `analysis.state` field is the heart of VEX. CycloneDX defines five states:

| State                 | When to use                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `not_affected`        | Vulnerability is present in the dependency tree but not exploitable in your product               |
| `affected`            | Vulnerability is present and your product is exposed - patch is in flight                         |
| `exploitable`         | Active exploitation is possible right now - alert your customers                                  |
| `under_investigation` | You are still triaging - publish to acknowledge but do not commit yet                             |
| `fixed`               | Vulnerability was present in an earlier release; the version your customer is using has the patch |

When you mark a finding `not_affected`, you must also provide a `justification` from the standard set: `code_not_present`, `code_not_reachable`, `requires_configuration`, `requires_dependency`, `requires_environment`, `protected_by_compiler`, `protected_at_runtime`, `protected_at_perimeter`, `protected_by_mitigating_control`. Free-form prose goes in `detail`.

This structure means a VEX statement is auditable: a regulator or a security team can ask "why did you mark this not_affected" and the JSON has the answer.

## VEX and the EU Cyber Resilience Act

[BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) - the technical specification the [CRA](/compliance/eu-cra/) points at - explicitly forbids embedding vulnerability data inside the SBOM itself (§3.1, §8.1.14). Vulnerability handling is the _job_ of VEX or [CSAF](https://oasis-open.github.io/csaf-documentation/), not of the SBOM.

In practice this means a CRA-compliant manufacturer publishes:

1. An **SBOM** describing the product's components (no vulnerability fields).
2. A **VEX** document (or CSAF) describing the current exploitability status of the CVEs that affect those components.
3. A **VDR** (Vulnerability Disclosure Report) summarizing the manufacturer's stance over time.

sbomify's CRA Compliance plugin checks for the SBOM/VEX split and flags SBOMs that smuggle vulnerability data inline as non-compliant.

## Uploading VEX to sbomify

sbomify treats a VEX document as a separate artifact attached to the same component as its SBOM. There is no separate "VEX component" - the relationship is artifact-to-component, the same as SBOMs.

### Via the API

Use the same artifact endpoint as a regular SBOM upload, with `bom_type=vex`:

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/artifact/cyclonedx/<component_id>?bom_type=vex" \
  -H "Authorization: Bearer ${SBOMIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "@my-product.vex.json"
```

A successful upload returns the new artifact's id. The component detail page now lists the VEX alongside the SBOM, and the Trust Center exposes it under the same component.

VEX uploads are CycloneDX-only today - the unified BOM-as-VEX model is a CycloneDX feature. SPDX users who need to publish exploitability data should use [CSAF VEX](https://oasis-open.github.io/csaf-documentation/) and upload it via sbomify's [compliance documents](/faq/how-do-i-upload-compliance-documents/) feature instead.

### Via CI

In your existing sbomify-action workflow, generate the VEX after the SBOM and post it to the same component:

```yaml
- name: Generate SBOM
  uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: ${{ vars.SBOMIFY_COMPONENT_ID }}
    LOCK_FILE: 'requirements.txt'
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: true

- name: Generate VEX
  run: ./scripts/produce-vex.sh sbom.cdx.json > vex.cdx.json

- name: Upload VEX to sbomify
  run: |
    curl -fsS -X POST \
      "https://app.sbomify.com/api/v1/sboms/artifact/cyclonedx/${{ vars.SBOMIFY_COMPONENT_ID }}?bom_type=vex" \
      -H "Authorization: Bearer ${{ secrets.SBOMIFY_TOKEN }}" \
      -H "Content-Type: application/json" \
      --data-binary "@vex.cdx.json"
```

The shape of `produce-vex.sh` is up to you - tools like [Dependency-Track's VEX export](https://docs.dependencytrack.org/usage/vex/), [vexctl](https://github.com/openvex/vexctl), or your own triage workflow can produce the input.

## Producing VEX statements without a manual triage

VEX statements should be produced by the people closest to the code, but the wiring does not have to be artisanal. Two practical patterns:

- **Triage-then-export.** Use Dependency-Track or a similar vulnerability database as the system of record. Mark findings as `Not Affected`, `False Positive`, or `Exploitable` with justification through the UI, then export the analysis as CycloneDX VEX. The exported file becomes the artifact you upload to sbomify on every release.
- **Source-controlled VEX.** Keep a `vex/` directory in the same repo that produces the SBOM, with one CycloneDX VEX statement per CVE you have triaged. The CI pipeline merges the per-CVE files into a single VEX document and uploads it alongside the SBOM. Pull requests on `vex/` carry the audit trail.

Either way, the result is the same: when a customer downloads your SBOM, the VEX is right next to it, machine-readable, and dated.

## Signing your VEX

A VEX is a security-relevant claim about your product. Sign it with the same machinery you use to [sign your SBOM](/faq/how-do-i-sign-an-sbom/) - typically `actions/attest-build-provenance` against the VEX file path - so consumers can verify the VEX came from your CI pipeline and was not modified in transit. Without a signature, a VEX is only as trustworthy as the channel that delivered it.

## What sbomify does with VEX

Today, sbomify stores and distributes VEX:

- **Per-component listing.** The component detail page shows VEX artifacts alongside SBOMs.
- **Trust Center exposure.** Customers downloading from your Trust Center see and can fetch the VEX with the same access controls as the SBOM.
- **Audit trail.** Every VEX upload is logged the same way as an SBOM upload, with content hash, timestamp, and uploader identity.

VEX-aware filtering of the OSV and Dependency-Track scanner results - automatically suppressing `not_affected` findings on the SBOM detail page - is on the roadmap. Until that lands, sbomify is the durable, audit-friendly storage and distribution layer for your VEX, and the scanner UIs continue to show the raw findings.

## Further reading

- [EU Cyber Resilience Act compliance guide](/compliance/eu-cra/) - the regulatory framing for SBOM/VEX separation
- [What is the EU Cyber Resilience Act?](/faq/what-is-the-eu-cyber-resilience-act/) - the higher-level FAQ
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) - sign your VEX the same way
- [How do I enable vulnerability scanning?](/faq/how-do-i-enable-vulnerability-scanning/) - the scanner output your VEX is responsive to
- [Schema crosswalk](/compliance/schema-crosswalk/) - how vulnerability data maps across CycloneDX, SPDX, CSAF, and VEX
- [CycloneDX VEX use case](https://cyclonedx.org/use-cases/#vulnerability-exploitability) - the upstream spec
- [OpenVEX](https://github.com/openvex/spec) - a lightweight VEX format that converts to CycloneDX
- [CSAF VEX](https://oasis-open.github.io/csaf-documentation/) - the OASIS standard, used heavily in the OS-vendor ecosystem
