---
title: "How do I use CRA compliance in sbomify?"
description: "Practical walkthrough of the sbomify CRA Compliance Wizard: scope screening, the five wizard steps, what ends up in the export bundle, and how to sign it."
answer: "Open a Product, run the CRA scope screening to confirm the product is in CRA scope, then walk through the five-step wizard (Product Profile, SBOM Compliance, Security & Vulnerability, User Information, Review & Export). Export produces a single self-contained ZIP with your SBOMs, OSCAL assessment results, generated documents, and a SHA-256 manifest. Sign that ZIP with cosign on your side, upload the signature back to sbomify to have it verified and stored with the bundle, and you have a CRA compliance package ready for an auditor."
tldr: "The CRA Compliance Wizard is a five-step flow per Product. Step 1 captures classification, Step 2 reviews SBOM coverage against BSI TR-03183-2, Step 3 covers security controls and vulnerability handling, Step 4 covers user-facing information, Step 5 exports a hash-manifested ZIP with everything an auditor needs. Available on Business and Enterprise plans."
weight: 55
keywords: [CRA compliance, EU CRA wizard, CRA assessment, CRA bundle, BSI TR-03183-2, CRA export, CRA conformity, sbomify CRA]
url: /faq/how-do-i-use-cra-compliance/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/cra_compliance.webm" title="How to use the CRA Compliance Wizard in sbomify" description="Screencast walking through the sbomify CRA Compliance Wizard from scope screening through the five-step assessment to bundle export." upload_date="2026-04-29T15:39:44+05:00" >}}

## Plan availability

The CRA Compliance Wizard is available on the **Business** and **Enterprise** plans. Community workspaces can still check their SBOMs against BSI TR-03183-2 with the **BSI TR-03183-2 v2.1 (EU CRA SBOM)** plugin ([background](/faq/what-is-the-eu-cyber-resilience-act/)), but the structured assessment, OSCAL output, and ready-to-sign export bundle live on Business+.

## Where to start: scope screening

Not every product needs to file CRA conformity. Start from the **CRA Compliance** card on a Product page (**Start Scope Screening**), or from **Compliance** in the sidebar (**Start assessment**). Before the wizard opens, sbomify runs a short **scope screening** that asks the questions Article 2 and Article 3 of the [CRA](/compliance/eu-cra/) require you to answer:

- Does the product have a remote data connection?
- Is it strictly for own-use within the manufacturer?
- Is it a testing or pre-release version? (Testing versions stay in scope, but the wizard relaxes several requirements.)
- Is it covered by exempted EU legislation (medical devices, motor vehicles, civil aviation, marine equipment)?
- Is it a dual-use product with both civilian and defence applications? (These stay in scope when commercially available.)

If the screening finds the product is out of scope, sbomify records the determination (with a timestamp and the user who made it) and you do not need to fill in the wizard. Changes to the screening are written to the audit log. If anything changes later, a new feature adds a network connection, the product enters the EU market, you can re-run the screening from the same Product page.

## The five wizard steps

Once a product is in scope, the wizard walks through the assessment in five steps. You can leave and come back at any point; sbomify saves each step as you go.

### Step 1: Product Profile

Captures the classification and lifecycle data the CRA references throughout:

- **Product category**: Default, Class I, Class II, or Critical (CRA Annex III/IV)
- **Manufacturer**: legal name, email and address, read from your workspace **Parties** settings
- **Open-source steward status**: for the lighter obligations under Article 24
- **Radio Equipment Directive flags**: `is_radio_equipment`, `processes_personal_data`, `handles_financial_value`. These trigger the [EN 18031](/compliance/eu-cra/) harmonised standards when applicable.
- **Harmonised standard applied**: whether a harmonised standard has been applied (CRA Article 32(2); required for Class I products assessed under Module A)
- **Intended use, target EU markets, and support period**: the lifecycle envelope for vulnerability-handling obligations (a support period under five years needs a justification, per Article 13(8))
- **Conformity assessment procedure**: Module A (internal production control), Module B+C or Module H (notified body), or EUCC, limited to the procedures the category allows
- **EU establishment**: whether the manufacturer is established in the EU, and the details of an Authorised Representative if you have appointed one (Article 18)

These answers shape the rest of the assessment and the generated documents (for example, EN 18031 entries only appear on the Declaration of Conformity when the corresponding flags are set in Step 1).

### Step 2: SBOM Compliance

Reviews the SBOM coverage of every component attached to the product against [BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en), the technical specification the CRA points at.

For each component, sbomify shows:

- Whether an SBOM is present (BSI TR-03183-2 requires CycloneDX 1.6+ or SPDX 3.0.1+)
- The BSI status (pass, fail, pending) produced by the BSI TR-03183-2 plugin
- Inline guidance for any failing finding (for example, missing supplier name, missing licences, embedded vulnerability data)

If a finding is failing for a tooling reason that you cannot fix today (for example, a transitive dependency that does not publish a SHA-512 hash), you can record a **tooling-limitation waiver** with a justification. Waivers are tracked per finding and surface in the Step 5 review and the export manifest, so an auditor can see what was waived and why.

### Step 3: Security & Vulnerability

Three tabs:

- **Security checklist**: an OSCAL control catalogue built from CRA Annex I (Part I essential requirements, risk-based, and Part II vulnerability handling, always mandatory). Each control accepts a status of _satisfied_, _not satisfied_, or _not applicable_, plus a free-text justification. The state is stored as OSCAL Assessment Results, not free-form prose, so it is machine-readable in the export.
- **Vulnerability handling**: whether your [Trust Center](/faq/what-is-a-trust-center/) serves a `security.txt` (with a link to set it up if not), plus the maximum number of days you take to acknowledge a vulnerability report.
- **Incident reporting**: the CSIRT country and contact email you would notify, whether you are registered with the ENISA Single Reporting Platform (live from 2026-09-11, see the [CRA guide](/compliance/eu-cra/)), and your incident response plan URL and notes.

### Step 4: User Information

The end-user-facing information CRA Article 13 and Annex II require: support contact, update frequency and delivery method, secure-decommissioning instructions, data-deletion guidance. The wizard ships product-type templates (web app, embedded, library, IoT, etc.) that pre-fill sensible defaults you can edit in place.

### Step 5: Review & Export

The final step shows a single-page summary of every answer, the BSI findings, the waivers you recorded, and the documents that will be included. It also captures the Declaration of Conformity signatory (place, name, function and a drawn signature), which you can preview or download as a PDF. Two outcomes:

- **Mark Assessment Complete**: flips the assessment to `complete`.
- **Export compliance bundle**: produces the export ZIP described below. Export is enabled once every step is done and every control is answered.

## What is in the export bundle

A single CRA bundle is one ZIP with the following structure:

- `oscal/catalog.json`, the OSCAL catalogue the assessment was run against
- `oscal/assessment-results.json`, your OSCAL Assessment Results (every control, status, and justification)
- `documents/vulnerability-disclosure-policy.md`
- `documents/risk-assessment.md`
- `documents/user-instructions.md`
- `documents/secure-decommissioning.md`
- `declaration-of-conformity.md`, the EU Declaration of Conformity (with EN 18031 entries where applicable)
- `security.txt`, an RFC 9116 file for your security contacts
- `article-14/README_REPORTING.md`, Article 14 / Article 16 reporting deadlines, ENISA SRP entry points, and which template to use for early-warning, vulnerability-notification, and final reports, plus those three templates
- `sboms/<component-slug>-<id>.cdx.json` (or `.spdx.json`), the latest SBOM for each component in the product, named so it is easy to diff between exports
- `metadata/harmonised-standards.json`, embedded snapshot of the CRA harmonised-standards reference, so the bundle is self-contained
- `metadata/manifest.json`, every file in the bundle with its SHA-256 digest, the assessment id, the product, the manufacturer, the conformity procedure, and the format version
- `metadata/manifest.sha256`, the manifest's own digest, so a verifier can confirm the manifest itself has not been altered
- `metadata/INTEGRITY.md`, verification instructions for an auditor or notified body

Every generated Markdown document also ships with a PDF copy beside it. The manifest is what makes the bundle auditable: a single SHA-256 against `metadata/manifest.sha256` proves the entire ZIP is intact, and per-file digests in `manifest.json` let a reviewer spot-check any individual artifact.

## Signing the bundle

sbomify produces the bundle but keeps no signing key, so it does not sign it for you. Signing is a single operator step you run after export with cosign 3 or later, the same machinery you would use to [sign an SBOM](/faq/how-do-i-sign-an-sbom/), pointed at the ZIP. It signs keyless, as you through your browser or as a CI workflow:

```bash
cosign sign-blob cra-bundle.zip --bundle cra-bundle.zip.sigstore.json
```

Back in Step 5, upload the `.sigstore.json` file with the identity you signed as (your email or the CI workflow URI) and the issuer you signed in through. sbomify verifies the signature against that identity, stores it beside the ZIP, and shows who signed it, when, and the `cosign verify-blob` command anyone with the ZIP and the signature can run. Distribute the signature with the ZIP, so your customers and auditors can verify the bundle has not been altered between export and review.

## Stale documents and assessments

The CRA is a continuous obligation. When something a generated document depends on changes (product details, a new SBOM upload, manufacturer or security contacts, or your wizard answers), sbomify flags the affected documents as **stale**, and **Refresh stale documents** in Step 5 regenerates them before your next export. If you re-run the scope screening and the product falls out of CRA scope, the assessment itself is marked **stale** and locked against edits until you re-scope it or delete it. Exported bundles still contain a timestamp and the assessment id, so a stale flag in the UI does not invalidate previously distributed bundles; it just tells you the next export will produce different content.

## Article 14 reports

Separately from the wizard, the **Reports** tab under **Compliance** tracks Article 14 notifications for an actively exploited vulnerability or a severe incident. Start one from a security advisory with a known exploited vulnerability, or with **New incident report**. sbomify lays each stage (early warning, notification, final report) out the way ENISA's Single Reporting Platform asks for it, tracks the 24-hour, 72-hour and final-report deadlines, and keeps a record of what you filed. ENISA's platform has no API, so you submit each stage in its portal and record the filing in sbomify. Reports are available on every plan, because Article 14 applies to every manufacturer.

## Further reading

- [What is the EU Cyber Resilience Act?](/faq/what-is-the-eu-cyber-resilience-act/) - the regulatory background
- [EU Cyber Resilience Act compliance guide](/compliance/eu-cra/) - field-level CRA reference
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) - same mechanics apply to signing the CRA bundle
- [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/) - how the BSI SBOM/VEX split is enforced in Step 2
- [Schema Crosswalk](/compliance/schema-crosswalk/) - field mappings for CycloneDX 1.7, SPDX 2.3, and SPDX 3.0
- [BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) - the technical specification the wizard assesses against
