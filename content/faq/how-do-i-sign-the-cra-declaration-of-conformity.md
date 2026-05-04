---
title: "How do I sign the CRA Declaration of Conformity?"
description: "Walk through capturing the manufacturer signature for the EU CRA Declaration of Conformity inside sbomify — Annex V Section 8 Place / Name / Function, the on-screen signature pad, and how the signed DoC is rendered for export."
answer: "On Step 5 of the CRA Compliance Wizard, fill in the Place, Name, and Function fields, draw your signature on the canvas, and click Save. sbomify stores the four-field signature block per CRA Annex V Section 8 and embeds it as a PNG inside every regenerated Declaration of Conformity — markdown, PDF, and the public Trust Center copy."
tldr: "The CRA Declaration of Conformity (Article 28, Annex V) requires a manufacturer signature. sbomify captures it on Step 5 of the CRA wizard with three text fields and an on-screen signature pad, embeds it into the rendered DoC as a base64 PNG, and re-renders the document on demand so the signature lands inside both the Markdown and PDF copies inside the export bundle."
weight: 86
keywords: [CRA Declaration of Conformity, EU Cyber Resilience Act, Annex V signature, manufacturer signature, DoC signing, CRA wizard signature, declaration of conformity signature, CRA Article 28]
url: /faq/how-do-i-sign-the-cra-declaration-of-conformity/
---

## Why the DoC needs a signature

The EU Cyber Resilience Act ([Regulation (EU) 2024/2847](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)) requires every product within scope to ship with a Declaration of Conformity. Article 28 puts the obligation on the manufacturer; Annex V spells out exactly what the document has to contain. Item 8 — the four fields a notified body actually looks at to prove the document is binding — is the manufacturer signature block:

> _Signed for and on behalf of the manufacturer_
>
> - Place
> - Date
> - Name and function
> - Signature

Without those four pieces, the DoC is incomplete. Auditors do not accept "signed by sbomify on behalf of …" or a generic placeholder; the regulation expects an identifiable human inside the manufacturer's organisation to put their name to the document. sbomify captures all four directly inside the wizard so the same person who walked the assessment also signs the deliverable.

## Where the signature card lives

Open the CRA wizard for the product you are signing. The signature card is on the last step:

**CRA Compliance Wizard → Step 5 (Review & Export) → Sign the Declaration of Conformity**

The card sits between the Compliance Summary and the Export controls, so you cannot miss it on the way to clicking _Export Compliance Bundle_. It is the only manual step in the wizard that the platform cannot do for you — every other field on the DoC is derived from the workspace profile, the SBOM, or the answers you gave on Steps 1-4.

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/document_signatures.webm" title="Signing the CRA Declaration of Conformity in sbomify" description="Step-by-step screencast showing how to fill in Place / Name / Function, draw the manufacturer signature on the on-screen pad, save, and preview the signed Declaration of Conformity inside the CRA Compliance Wizard." >}}

## Filling the four fields

Each field maps directly to one of the Annex V Section 8 lines:

| Wizard field  | What to enter                                                                                                                                                                     | Annex V line |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Place**     | The city (and country) where the document is being signed — for example, _Berlin, Germany_.                                                                                       | Place        |
| **Name**      | The full legal name of the person signing on behalf of the manufacturer. This is the human who is accountable for the assessment, not the workspace owner if those are different. | Name         |
| **Function**  | The signer's role or title — _Lead Maintainer_, _Head of Engineering_, _CTO_. Pick the title the notified body will recognise as authoritative for the product.                   | Function     |
| **Signature** | The on-screen canvas captures a drawn signature with a mouse, trackpad, or touch device. The strokes are saved as a base64-encoded PNG.                                           | Signature    |

The Date is filled in automatically from the moment you save — there is no field for it because the wizard timestamps the save itself, which is what the regulator expects. All three text fields are capped at 255 characters and rejected if they are blank or whitespace.

## Drawing the signature

The pad is a standard HTML5 canvas wrapped in the [`signature_pad`](https://github.com/szimek/signature_pad) library. It accepts mouse, touch, and pen input on every modern browser. A few practical notes:

- **Use a real signing surface.** A trackpad with a finger works in a pinch, but a mouse or stylus produces a recognisable signature. The notified body sees the rendered PNG, not the raw stroke data, so the canvas is essentially a sketchpad.
- **Clear and re-draw freely.** The _Clear_ button resets the canvas to blank without changing any of the saved state. You can re-draw as many times as you like before saving.
- **Sign once per session.** The signature is bound to the assessment, not the user account. If a different person needs to sign, they should be logged in as themselves so the audit trail records the right `signed_by` user.
- **No eIDAS qualification.** The pad captures a _digitally captured_ signature — a faithful recording of what you drew, hashed and bound to your sbomify session. It is not an [eIDAS-qualified electronic signature](https://digital-strategy.ec.europa.eu/en/policies/electronic-identification). For most CRA filings the captured signature is enough; if your specific notified body requires QES, sign the rendered DoC PDF downstream with a qualified provider before submitting.

## Saving and what happens next

When you click _Save signature_ the wizard does three things in one transaction:

1. **Stores the four fields** on the assessment row — Place, Name, Function, plus the PNG payload as a `data:image/png;base64,…` URL.
2. **Stamps the signing user.** The audit log records who signed and when, so a re-sign by a different operator does not silently overwrite the prior record.
3. **Marks the existing Declaration of Conformity as stale.** The DoC document is not auto-regenerated — sbomify treats a signature change as a deliberate legal act. The next time you click _Generate Declaration of Conformity_ (or _Refresh Stale Documents_), the new signature is embedded inside the rendered DoC.

A _Last signed …_ badge appears next to the Save button immediately after the round-trip. If you re-open the wizard later, the same badge is there and the canvas is pre-loaded with the previous signature so you can confirm it before regenerating the DoC.

## Embedding the signature in the rendered DoC

The CRA bundle export in sbomify ships every compliance document as both Markdown (the source of truth that a hash verification can pin) and PDF (the human-readable copy a notified body actually files). The signature block lands in both:

- **Markdown** — Annex V Section 8 renders as a four-bullet list. The signature line embeds the PNG directly: `**Signature:** ![Signature](data:image/png;base64,iVBORw0K...)`. Any markdown reader that handles inline image data URLs (the public Trust Center reader and most viewers) renders it inline.
- **PDF** — the [WeasyPrint](/faq/how-do-i-use-cra-compliance/) rendering pipeline picks up the same data URL and reproduces the signature as an `<img>` capped at 80 px tall so it sits inline with the rest of the field block, not stretched to canvas resolution.

The four text fields render as plain Markdown bullets in both copies. Either format alone is enough to satisfy Annex V; the bundle ships both so you can choose which one to file based on the notified body's intake format.

## Previewing before exporting

The _Preview Declaration of Conformity_ button on Step 5 opens a modal that renders the DoC live from the current state — the same Markdown the export bundle will ship, rendered with the same image handling. Use it to confirm the signature looks right (legible, sized appropriately, not running off the canvas) before regenerating the document or exporting the bundle.

If you only need the signed DoC and not the full CRA bundle, click _Download Declaration of Conformity (PDF)_ on the same card. That endpoint streams the rendered PDF straight to your browser with `Content-Disposition: attachment` so it lands in Downloads as `declaration-of-conformity.pdf`. It is the same WeasyPrint render the bundle uses, just standalone.

## Re-signing

If the assessment changes after signing — a new SBOM, an updated harmonised standard, a different conformity procedure — the existing DoC turns stale automatically. Re-sign by:

1. Opening Step 5 of the wizard.
2. Editing any of Place / Name / Function (or leaving them as-is).
3. Clearing and re-drawing the signature canvas if the signing person has changed.
4. Clicking _Save signature_.
5. Clicking _Generate Declaration of Conformity_ (or _Refresh Stale Documents_) to embed the new signature in the rendered DoC.

The previous signature stays on file as immutable history; the audit log records every re-sign with timestamp and user. Re-running the export bundle picks up the freshly signed DoC automatically.

## Where the signature is _not_ required

Two related places people sometimes confuse with the DoC signature:

- **SBOM signatures** — these are cryptographic detached signatures (cosign, GPG, X.509) that prove an SBOM has not been tampered with in transit. They live on the SBOM record, not the DoC. See [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) for the producer-side workflow.
- **Bundle signatures** — the entire CRA export ZIP can be signed downstream with `cosign sign-blob` or `gpg --detach-sign` for a stronger whole-package provenance guarantee. The bundle's `metadata/INTEGRITY.md` walks consumers through verifying it. Bundle signing is intentionally outside sbomify so it stays under your direct control.

The DoC manufacturer signature handled inside the wizard is the _legal_ signature that makes the Declaration of Conformity binding under CRA Article 28. The cryptographic signatures above are _technical_ signatures that bind specific files to a known identity. A complete filing usually carries both — the DoC says _who_ declares conformity, the cryptographic signatures prove _which exact bytes_ the consumer received.

## Further reading

- [How do I use CRA Compliance?](/faq/how-do-i-use-cra-compliance/) — full walkthrough of the five-step wizard.
- [What is the EU Cyber Resilience Act?](/faq/what-is-the-eu-cyber-resilience-act/) — regulation primer.
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) — cryptographic signing for SBOMs (different scope).
- [Regulation (EU) 2024/2847, Article 28](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng#art_28) — declaration of conformity obligation.
- [Regulation (EU) 2024/2847, Annex V](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng#anx_V) — DoC content requirements (Section 8 = signature block).
