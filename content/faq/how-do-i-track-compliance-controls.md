---
title: "How do I track compliance controls in sbomify?"
description: "Activate a compliance framework such as SOC 2, ISO 27001 or NIST in sbomify, set control statuses for the workspace, override them per product, and show active frameworks on your Trust Center."
answer: "Open Settings, then the Controls tab, and activate a framework such as SOC 2 Type II. Its controls are grouped by category. Set a whole category at once, or a single control. Every product inherits these statuses as its defaults, and each product's Compliance tab lets you override a control where that product differs. Active frameworks also show on your Trust Center."
tldr: "Controls are set once for the workspace and inherited by every product, with per-product overrides where needed. Active frameworks appear on your Trust Center with how much of each is in place."
weight: 56
keywords: [compliance controls, SOC 2, ISO 27001, NIST, compliance frameworks, control status, product override, OSCAL catalog, Trust Center compliance]
url: /faq/how-do-i-track-compliance-controls/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/compliance_controls.webm" title="How to track compliance controls in sbomify" description="Narrated screencast: activate SOC 2 Type II on the Controls tab, set statuses by category and by control, override a control on one product, and see the framework on the Trust Center." upload_date="2026-10-28T00:00:00Z" >}}

## Setting workspace defaults

1. Open **Settings** and go to the **Controls** tab. It lists the frameworks you can work to, such as SOC 2, ISO 27001, and NIST
2. Click **Activate** on the framework you want, for example **SOC 2 Type II**
3. Its controls are grouped by category. Open a category and use **Set this category to** to set every control in it at once
4. Or set a single control with its status menu: **Compliant**, **Partial**, **Not Implemented**, or **Not Applicable**

Every product inherits these statuses as its defaults.

If your framework is not listed, click **Import catalog** to add one in OSCAL JSON format, from a file or a public URL.

## Overriding a control for one product

Each product has a **Compliance** tab under **Product details**, with the same checklist, starting from the workspace defaults. Change a control where this product differs, and it is marked as a **Product override**.

## On your Trust Center

Active frameworks also show on your [Trust Center](/faq/how-do-i-set-up-a-trust-center/), with how much of each is in place.

## Further reading

- [How do I use CRA compliance in sbomify?](/faq/how-do-i-use-cra-compliance/) - the CRA assessment, which works per product
- [How do I upload compliance documents?](/faq/how-do-i-upload-compliance-documents/) - attach the SOC 2 report or ISO certificate itself
- [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/) - where active frameworks are shown
