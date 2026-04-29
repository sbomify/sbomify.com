---
title: "How do I use CRA compliance in sbomify?"
description: "Practical walkthrough of the sbomify CRA Compliance Wizard — scope screening, the five wizard steps, what ends up in the export bundle, and how to sign it."
answer: "Open a Product, run the CRA scope screening to confirm the product is in CRA scope, then walk through the five-step wizard (Product Profile, SBOM Compliance, Security & Vulnerability, User Information, Review & Export). Export produces a single self-contained ZIP with your SBOMs, OSCAL assessment results, generated documents, and a SHA-256 manifest — sign that ZIP with cosign on your side and you have a CRA compliance package ready for an auditor."
tldr: "The CRA Compliance Wizard is a five-step flow per Product. Step 1 captures classification, Step 2 reviews SBOM coverage against BSI TR-03183-2, Step 3 covers security controls and vulnerability handling, Step 4 covers user-facing information, Step 5 exports a hash-manifested ZIP with everything an auditor needs. Available on Business and Enterprise plans."
weight: 55
keywords: [CRA compliance, EU CRA wizard, CRA assessment, CRA bundle, BSI TR-03183-2, CRA export, CRA conformity, sbomify CRA]
url: /faq/how-do-i-use-cra-compliance/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/cra_compliance.webm" title="How to use the CRA Compliance Wizard in sbomify" description="Screencast walking through the sbomify CRA Compliance Wizard from scope screening through the five-step assessment to bundle export." >}}

## Plan availability

The CRA Compliance Wizard is available on the **Business** and **Enterprise** plans. Community workspaces can still produce CRA-quality SBOMs via the [CRA Compliance plugin](/faq/what-is-the-eu-cyber-resilience-act/), but the structured assessment, OSCAL output, and ready-to-sign export bundle live on Business+.

## Where to start: scope screening

Not every product needs to file CRA conformity. Before the wizard opens, sbomify runs a short **scope screening** that asks the questions Article 2 and Article 3 of the [CRA](/compliance/eu-cra/) require you to answer:

- Does the product have a remote data connection?
- Is it strictly for own-use within the manufacturer?
- Is it a testing or pre-production version?
- Is it covered by other Union legislation that already imposes equivalent requirements?
- Is it a dual-use item subject to export control?

If the screening finds the product is out of scope, sbomify records the determination (with a timestamp and the user who made it) and you do not need to fill in the wizard. The screening result itself is part of the audit trail and is included in the export bundle. If anything changes later — a new feature adds a network connection, the product enters the EU market — you can re-run the screening from the same Product page.

## The five wizard steps

Once a product is in scope, the wizard walks through the assessment in five steps. You can leave and come back at any point; sbomify saves each step as you go.

### Step 1: Product Profile

Captures the classification and lifecycle data the CRA references throughout:

- **Product category** — Default, Class I, Class II, or Critical (CRA Annex III/IV)
- **Open-source steward status** — for the lighter obligations under Article 24
- **Radio Equipment Directive flags** — `is_radio_equipment`, `processes_personal_data`, `handles_financial_value`. These trigger the [EN 18031](/compliance/eu-cra/) harmonised standards when applicable.
- **Harmonised standards applied** — which CRA-aligned standards (BSI TR-03183-2, EN 18031-1/2/3, etc.) the product claims conformity against
- **Intended use, target EU markets, and support period** — the lifecycle envelope for vulnerability-handling obligations
- **Conformity assessment procedure** — self-assessment, internal control, or notified body involvement, depending on category

This is the only step that determines which downstream steps apply (for example, EN 18031 sections only render when the corresponding flags are set in Step 1).

### Step 2: SBOM Compliance

Reviews the SBOM coverage of every component attached to the product against [BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) — the technical specification the CRA points at.

For each component, sbomify shows:

- Whether an SBOM is present and which format (CycloneDX 1.6+ or SPDX 3.0.1+)
- The BSI assessment findings produced by the CRA Compliance plugin
- Inline guidance for any failing finding (for example, missing supplier name, missing licences, embedded vulnerability data)

If a finding is failing for a tooling reason that you cannot fix today (for example, a transitive dependency that does not publish a SHA-512 hash), you can record a **tooling-limitation waiver** with a justification. Waivers are tracked per finding and surface in the Step 5 review and the export manifest, so an auditor can see what was waived and why.

### Step 3: Security & Vulnerability

Three tabs, mapping to CRA Annex I Part II:

- **Security checklist** — an OSCAL-driven control list (the [BSI OSCAL profile](/compliance/eu-cra/) by default). Each control accepts a status of _satisfied_, _not satisfied_, or _not applicable_, plus a free-text justification. The state is stored as OSCAL Assessment Results, not free-form prose, so it is machine-readable in the export.
- **Vulnerability handling** — VDP URL, acknowledgement timeline (default 90 days), incident response plan URL. If your workspace has a [Trust Center](/faq/what-is-a-trust-center/) with `security.txt` configured, sbomify reuses those values rather than asking again.
- **Incident reporting** — CSIRT contact, ENISA Single Reporting Platform registration status (the [SRP](/compliance/eu-cra/) goes live 2026-09-11; the wizard tracks readiness today).

### Step 4: User Information

The end-user-facing information CRA Article 13 and Annex II require: support contact, update frequency and delivery method, secure-decommissioning instructions, data-deletion guidance. The wizard ships product-type templates (web app, embedded, library, IoT, etc.) that pre-fill sensible defaults you can edit in place.

### Step 5: Review & Export

The final step shows a single-page summary of every answer, the BSI findings, the waivers you recorded, and the documents that will be included. Two outcomes:

- **Mark complete** — flips the assessment to `complete`. Re-running the wizard (for example after an SBOM change) marks the assessment `stale` and surfaces a banner so you know the export no longer reflects the current state.
- **Generate compliance bundle** — produces the export ZIP described below.

## What is in the export bundle

A single CRA bundle is one ZIP with the following structure:

- `oscal/catalog.json` — the OSCAL catalogue the assessment was run against
- `oscal/assessment-results.json` — your OSCAL Assessment Results (every control, status, and justification)
- `documents/vulnerability-disclosure-policy.md`
- `documents/risk-assessment.md`
- `documents/user-instructions.md`
- `documents/secure-decommissioning.md`
- `documents/declaration-of-conformity.md` (EU DoC, plus EN 18031 DoC where applicable)
- `article-14/README_REPORTING.md` — Article 14 / Article 16 reporting deadlines, ENISA SRP entry points, and which template to use for early-warning, vulnerability-notification, and final reports
- `sboms/<component-slug>-<id>.json` — the latest SBOM for each component in the product, named so it is easy to diff between exports
- `metadata/harmonised-standards.json` — embedded snapshot of the CRA harmonised-standards reference, so the bundle is self-contained
- `metadata/manifest.json` — every file in the bundle with its SHA-256 digest, the assessment id, the product, the manufacturer, the conformity procedure, and the format version
- `metadata/manifest.sha256` — the manifest's own digest, so a verifier can confirm the manifest itself has not been altered
- `metadata/INTEGRITY.md` — verification instructions for an auditor or notified body

The manifest is what makes the bundle auditable: a single SHA-256 against `metadata/manifest.sha256` proves the entire ZIP is intact, and per-file digests in `manifest.json` let a reviewer spot-check any individual artifact.

## Signing the bundle

sbomify produces the bundle but does not sign it in the application. Signing is a single operator step you run after export — the same machinery you would use to [sign an SBOM](/faq/how-do-i-sign-an-sbom/), pointed at the ZIP:

```bash
cosign sign-blob \
  --bundle cra-bundle.cosign.bundle \
  cra-bundle.zip
```

In CI, use `actions/attest-build-provenance` against the downloaded ZIP and store the signature alongside the bundle. Whichever approach you take, distribute the signature with the ZIP — your customers and auditors can then verify the bundle has not been altered between export and review.

## Stale assessments

The CRA is a continuous obligation. If a component changes after you marked an assessment complete — a new dependency appears, an SBOM is re-uploaded, a control is updated — sbomify flags the assessment as **stale** and prompts you to re-run the affected steps. Exported bundles still contain a timestamp and the assessment id, so a stale flag in the UI does not invalidate previously distributed bundles; it just tells you the next export will produce different content.

## Further reading

- [What is the EU Cyber Resilience Act?](/faq/what-is-the-eu-cyber-resilience-act/) - the regulatory background
- [EU Cyber Resilience Act compliance guide](/compliance/eu-cra/) - field-level CRA reference
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) - same mechanics apply to signing the CRA bundle
- [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/) - how the BSI SBOM/VEX split is enforced in Step 2
- [Schema Crosswalk](/compliance/schema-crosswalk/) - field mappings for CycloneDX 1.7, SPDX 2.3, and SPDX 3.0
- [BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) - the technical specification the wizard assesses against
