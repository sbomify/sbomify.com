---
title: "How do I achieve NTIA/CISA minimum elements compliance?"
description: "Guide to meeting NTIA and CISA SBOM minimum elements requirements using sbomify-action's augmentation feature and sbomify's central profile management."
answer: "Use sbomify-action's augmentation feature to automatically add required metadata like supplier info, authors, licenses, and lifecycle phase to your SBOMs - either via a local config file or centrally managed profiles in sbomify."
tldr: "Use sbomify-action's augmentation feature to automatically add required metadata like supplier info, authors, licenses, and lifecycle phase to your SBOMs - either via a local config file or centrally managed profiles in sbomify."
weight: 85
keywords: [NTIA compliance, CISA minimum elements, SBOM compliance, SBOM augmentation, supplier metadata, sbomify-action]
url: /faq/how-do-i-achieve-ntia-cisa-compliance/
---

## The problem

Most SBOM generation tools produce SBOMs that are missing key fields required by the [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) and [CISA 2025 Minimum Elements](/compliance/cisa-minimum-elements/). Specifically, generated SBOMs typically lack:

- **Supplier name** - the organization that supplies the component
- **Authors** - who created the SBOM data
- **Licenses** - per-component license information
- **Lifecycle phase** - the SDLC phase where the SBOM was generated (CISA 2025)

It is possible to achieve NTIA/CISA compliance using other tools, but it typically requires chaining together multiple tools and manually injecting data into the generated SBOM. sbomify-action is a toolkit that automates this process and provides best-effort quality improvements to your SBOMs in a single step.

## Option 1: Local config file

You can provide augmentation metadata via a `sbomify.json` file in your project root. This works without a sbomify account:

```json
{
  "lifecycle_phase": "build",
  "supplier": {
    "name": "Your Company",
    "url": "https://yourcompany.com"
  },
  "authors": [
    {
      "name": "Your Team",
      "email": "engineering@yourcompany.com"
    }
  ],
  "licenses": ["Apache-2.0"]
}
```

Then enable augmentation in your CI pipeline:

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
    UPLOAD: false
```

This is ideal for individual projects or teams that want to manage metadata per-repository.

## Option 2: Central profile management in sbomify

For organizations managing many components, sbomify provides centrally managed augmentation profiles. Instead of maintaining `sbomify.json` files in every repository, you configure the metadata once in sbomify and it gets applied automatically during augmentation.

### Creating a profile

Navigate to your workspace settings to create an augmentation profile with your organization's supplier info, authors, licenses, and other metadata:

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/profile_editing.webm" title="Creating an augmentation profile in sbomify" description="Walkthrough of creating a centrally managed augmentation profile in sbomify for NTIA/CISA compliance." >}}

### Using profiles

Once you have a profile, there are two ways to apply it:

- **Default profile** - Set a profile as the workspace default, and it will be used for all components in that workspace during augmentation
- **Per-component profile** - Manually select a specific profile on individual components for cases where different components need different metadata

Then in your CI pipeline, simply enable augmentation with a sbomify account:

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    AUGMENT: true
    ENRICH: true
```

sbomify-action will fetch the profile metadata from sbomify and apply it to the generated SBOM automatically.

## What gets added

Augmentation addresses specific NTIA and CISA minimum element fields:

| Field | NTIA 2021 | CISA 2025 |
| --- | --- | --- |
| Supplier Name | Required | Required |
| Author of SBOM Data | Required | Required |
| License | - | Required (new) |
| Generation Context | - | Required (new) |

For the full list of supported augmentation fields, see the [sbomify-action documentation](https://github.com/sbomify/sbomify-action#augmentation-vs-enrichment).

## Further reading

- [Compliance overview](/compliance/) - all frameworks and standards sbomify supports
- [NTIA Minimum Elements guide](/compliance/ntia-minimum-elements/)
- [CISA 2025 Minimum Elements guide](/compliance/cisa-minimum-elements/)
- [EU Cyber Resilience Act guide](/compliance/eu-cra/)
- [Schema Crosswalk](/compliance/schema-crosswalk/) - how fields map across CycloneDX and SPDX
- [sbomify-action augmentation reference](https://github.com/sbomify/sbomify-action#augmentation-config-file)
