---
title: "How do I achieve NTIA/CISA minimum elements compliance?"
description: "Guide to meeting NTIA and CISA SBOM minimum elements requirements using sbomify-action's augmentation feature and sbomify's centrally managed parties."
answer: "Use sbomify-action's augmentation feature to automatically add required metadata like supplier info, authors, licenses, and lifecycle phase to your SBOMs - either via a local config file or centrally managed parties in sbomify."
tldr: "Use sbomify-action's augmentation feature to automatically add required metadata like supplier info, authors, licenses, and lifecycle phase to your SBOMs - either via a local config file or centrally managed parties in sbomify."
weight: 85
keywords: [NTIA compliance, CISA minimum elements, SBOM compliance, SBOM augmentation, supplier metadata, sbomify-action]
url: /faq/how-do-i-achieve-ntia-cisa-compliance/
---

## The problem

Most SBOM generation tools produce SBOMs that are missing key fields required by the [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/), which replaced the [NTIA 2021 Minimum Elements](/compliance/ntia-minimum-elements/) on 29 July 2026. Specifically, generated SBOMs typically lack:

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

## Option 2: Central party management in sbomify

For organizations managing many components, sbomify provides centrally managed **Parties**. Instead of maintaining `sbomify.json` files in every repository, you configure the supplier, author, and contact metadata once in sbomify and it gets applied automatically during augmentation.

### Creating a party

A party holds your supplier, manufacturer, and security contacts. You add one once and reuse it across your components.

1. Open **Settings** and go to the **Parties** tab, then click **Add party**
2. Give the party a name. Tick **Set as default** if it should apply to new components
3. Click **Add entity**. An entity is an organization, with manufacturer, supplier, or author roles, plus its address and website. The address and website fill in the supplier details on your components
4. Every entity needs at least one contact person. Click **Add contact** and tick the roles each person covers (author, security, technical). The security contact is who receives vulnerability reports
5. Click **Done** to close the entity. The summary shows its roles and contacts
6. Click **Create party**

The party is saved, and if you made it the default, new components pick up these contacts automatically.

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/profile_editing.webm" title="Setting up a party in sbomify" description="Narrated screencast: create a party in the Parties tab of Settings, with a manufacturer and supplier entity, contact people and their roles, and make it the workspace default." upload_date="2026-10-28T00:00:00Z" >}}

### Using parties

Once you have a party, there are two ways to apply it:

- **Default party** - Mark a party as the workspace default, and it will be used for components in that workspace during augmentation
- **Per-component party** - Select a specific party in an individual component's metadata for cases where different components need different metadata

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

sbomify-action will fetch the party metadata from sbomify and apply it to the generated SBOM automatically.

## Score uploaded SBOMs against the NTIA checklist

sbomify ships a built-in **NTIA Minimum Elements (2021)** plugin that grades every uploaded SBOM against the seven required fields and surfaces the result on the SBOM detail page. To enable it, open **Plugins** in the sidebar, tick **NTIA Minimum Elements (2021)**, and click **Save changes**:

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/plugin_enablement_ntia-minimum-elements-2021.webm" title="Enabling the NTIA Minimum Elements plugin in sbomify" description="Narrated screencast: turn on the NTIA Minimum Elements (2021) check so every new SBOM upload gets a compliance result." upload_date="2026-10-28T00:00:00Z" >}}

## What gets added

Augmentation addresses specific NTIA and CISA minimum element fields:

| Field               | NTIA 2021 | CISA 2025      |
| ------------------- | --------- | -------------- |
| Supplier Name       | Required  | Required       |
| Author of SBOM Data | Required  | Required       |
| License             | -         | Required (new) |
| Generation Context  | -         | Required (new) |

For the full list of supported augmentation fields, see the [sbomify-action documentation](https://github.com/sbomify/sbomify-action#augmentation-vs-enrichment).

## Further reading

- [Compliance overview](/compliance/) - all frameworks and standards sbomify supports
- [NTIA Minimum Elements guide](/compliance/ntia-minimum-elements/)
- [CISA 2026 Minimum Elements guide](/compliance/cisa-minimum-elements/)
- [EU Cyber Resilience Act guide](/compliance/eu-cra/)
- [Schema Crosswalk](/compliance/schema-crosswalk/) - how fields map across CycloneDX and SPDX
- [sbomify-action augmentation reference](https://github.com/sbomify/sbomify-action#augmentation-config-file)
