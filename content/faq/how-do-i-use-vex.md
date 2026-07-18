---
title: "How do I use VEX with sbomify?"
description: "Learn how Vulnerability Exploitability eXchange (VEX) lets you communicate which vulnerabilities actually affect your product, and how to upload, triage, and distribute VEX documents through sbomify."
answer: "A VEX document tells consumers which vulnerabilities in your SBOM are actually exploitable in your product and which are not. sbomify ingests CycloneDX VEX, OpenVEX, and CSAF 2.0 VEX, applies your statements to OSV and Dependency Track findings so noise is suppressed, and publishes the VEX alongside your SBOMs in your Trust Center. You can also triage vulnerabilities directly in sbomify and generate a VEX from your decisions."
tldr: "VEX is the companion to your SBOM that says \"this CVE is in our dependency tree but it does not actually affect our product, here is why.\" sbomify accepts VEX in CycloneDX, OpenVEX, and CSAF 2.0 formats, suppresses VEX'd findings in your vulnerability results, flags CISA KEV entries, and shares VEX next to SBOMs in the Trust Center."
weight: 67
keywords: [VEX, CycloneDX VEX, OpenVEX, CSAF VEX, vulnerability exploitability, SBOM VEX, vulnerability triage, CISA KEV, false positive, CRA VEX]
url: /faq/how-do-i-use-vex/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/vex_upload.webm" title="How VEX appears alongside an SBOM in sbomify" description="Screencast showing a CycloneDX VEX artifact rendered next to its SBOM on a sbomify component, with the colour-coded VEX and SBOM badges in the BOMs table." >}}

## The problem VEX solves

Run any modern vulnerability scanner against a real-world SBOM and you will get a list. A long list. Most of those CVEs do not actually affect your product:

- The vulnerable function is in a code path your application never calls.
- Your build configuration disables the vulnerable feature.
- You have already applied a backport patch but the version string still reports the original.
- The CVE applies to a different operating system or runtime than the one you ship.

Telling that signal-from-noise story by hand - in spreadsheets, GitHub issues, ticket comments - does not scale. Every customer who downloads your SBOM has to re-derive the same conclusions, and every conclusion is just one engineer's opinion attached to no machine-readable artifact.

**VEX (Vulnerability Exploitability eXchange)** is the standardized fix. It is a separate document that says, for each known vulnerability in your dependency tree, whether the vulnerability actually affects your product and why. Consumers feed your SBOM and your VEX into the same scanner together, and the scanner produces a triaged finding list instead of a raw one.

## What a VEX document looks like

sbomify ingests VEX in three formats, with automatic format detection: **CycloneDX VEX** (a CycloneDX BOM with `vulnerabilities[]` populated, JSON or XML), **OpenVEX** (the lightweight format used by vexctl and Chainguard), and **CSAF 2.0 VEX** (the OASIS standard used heavily by OS vendors like Red Hat and Cisco). See [What VEX formats does sbomify support?](/faq/what-vex-formats-does-sbomify-support/) for the format-by-format details.

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

sbomify treats a VEX document as a separate artifact attached to the same component as its SBOM. There is no separate "VEX component" - the relationship is artifact-to-component, the same as SBOMs. You can upload VEX in any supported format through the upload panel on the component page, via the API, or from CI.

### Via the API

For CycloneDX VEX, use the same artifact endpoint as a regular SBOM upload, with `bom_type=vex`:

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/artifact/cyclonedx/<component_id>?bom_type=vex" \
  -H "Authorization: Bearer ${SBOMIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "@my-product.vex.json"
```

OpenVEX and CSAF 2.0 VEX documents go to the format-agnostic VEX endpoint, where the format is detected automatically:

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/artifact/vex/<component_id>" \
  -H "Authorization: Bearer ${SBOMIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "@my-product.openvex.json"
```

A successful upload returns the new artifact's id. The component detail page now lists the VEX alongside the SBOM, and the Trust Center exposes it under the same component.

### Via CI

In your existing [sbomify-action](https://github.com/sbomify/sbomify-action) workflow, upload a pre-authored VEX with `BOM_TYPE: vex`. The document is uploaded verbatim, byte for byte, with format detection on the server side. With [OIDC trusted publishing](/faq/how-do-i-set-up-oidc-trusted-publishing/) you do not even need a token secret:

```yaml
permissions:
  id-token: write

steps:
  - name: Generate VEX
    run: ./scripts/produce-vex.sh sbom.cdx.json > vex.cdx.json

  - name: Upload VEX to sbomify
    uses: sbomify/sbomify-action@master
    env:
      COMPONENT_ID: ${{ vars.SBOMIFY_COMPONENT_ID }}
      SBOM_FILE: vex.cdx.json
      BOM_TYPE: vex
      UPLOAD: true
```

If your CI platform does not support OIDC, set `TOKEN: ${{ secrets.SBOMIFY_TOKEN }}` instead. The shape of `produce-vex.sh` is up to you - tools like [Dependency-Track's VEX export](https://docs.dependencytrack.org/usage/vex/), [vexctl](https://github.com/openvex/vexctl), or your own triage workflow can produce the input.

## Triaging vulnerabilities in sbomify

You do not have to author VEX by hand or in an external tool. sbomify has an in-app triage workflow:

- **In-app triage.** Review scanner findings on the vulnerability dashboard, record `not_affected` decisions with justifications, apply bulk decisions across CVEs, and preview the effect with a dry run before committing.
- **CISA KEV flags.** Findings that appear in the CISA Known Exploited Vulnerabilities catalog are flagged so you triage the vulnerabilities that attackers actually use first.
- **Self-VEX generation.** sbomify generates a CycloneDX VEX from your triage decisions, complete with CISA tracking fields (serial number and statement timestamps), so your published VEX always matches your ledger.
- **Dependency Track sync.** If Dependency Track is your triage system of record, sbomify syncs your DT analysis decisions in as VEX and pins them to the matching releases.

Alternatively, keep a source-controlled `vex/` directory in the same repo that produces the SBOM, merge the per-CVE statements in CI, and upload the result alongside the SBOM. Pull requests on `vex/` carry the audit trail.

## Signing your VEX

A VEX is a security-relevant claim about your product. Sign it with the same machinery you use to [sign your SBOM](/faq/how-do-i-sign-an-sbom/) - typically `actions/attest-build-provenance` against the VEX file path - so consumers can verify the VEX came from your CI pipeline and was not modified in transit. Without a signature, a VEX is only as trustworthy as the channel that delivered it.

## What sbomify does with VEX

- **Scanner suppression.** Findings covered by a `not_affected` VEX statement are suppressed in your OSV and Dependency Track results, so the dashboard shows your triaged exposure instead of raw scanner noise. Uploading a new VEX re-applies it to existing scans automatically.
- **Per-component listing.** The component detail page shows VEX artifacts alongside SBOMs, with distinct badges.
- **Release-level VEX.** Each release exposes a merged VEX download, on both the internal release page and the public Trust Center release page, next to the release SBOM.
- **Trust Center exposure.** Customers downloading from your Trust Center see and can fetch the VEX with the same access controls as the SBOM, and the release vulnerability posture card reflects your VEX-applied status.
- **Audit trail.** Every VEX upload is logged the same way as an SBOM upload, with content hash, timestamp, and uploader identity.

## Further reading

- [What VEX formats does sbomify support?](/faq/what-vex-formats-does-sbomify-support/) - CycloneDX VEX, OpenVEX, and CSAF 2.0 in detail
- [EU Cyber Resilience Act compliance guide](/compliance/eu-cra/) - the regulatory framing for SBOM/VEX separation
- [What is the EU Cyber Resilience Act?](/faq/what-is-the-eu-cyber-resilience-act/) - the higher-level FAQ
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) - sign your VEX the same way
- [How do I enable vulnerability scanning?](/faq/how-do-i-enable-vulnerability-scanning/) - the scanner output your VEX is responsive to
- [Schema crosswalk](/compliance/schema-crosswalk/) - how vulnerability data maps across CycloneDX, SPDX, CSAF, and VEX
- [CycloneDX VEX use case](https://cyclonedx.org/use-cases/#vulnerability-exploitability) - the upstream spec
- [OpenVEX](https://github.com/openvex/spec) - a lightweight VEX format, natively supported by sbomify
- [CSAF VEX](https://oasis-open.github.io/csaf-documentation/) - the OASIS standard, used heavily in the OS-vendor ecosystem
