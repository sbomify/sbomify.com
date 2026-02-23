---

title: "Big update to our GitHub Action"
description: "Major overhaul of sbomify GitHub Action transforming it from a simple upload tool to a complete SBOM Swiss Army knife with generation, augmentation, and enrichment."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, github-actions]
date: 2024-10-04
slug: github-action-update
---

In the last few weeks, we've worked hard on overhauling the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) based on customer feedback. The initial purpose of the GitHub Action module was merely to upload SBOMs to the sbomify platform. We've now broadened the scope to make it more powerful, with the goal of creating NTIA Minimum Elements compliant SBOMs directly in your CI/CD pipeline with minimal fuss.

As a refresher, the SBOM lifecycle looks like this:

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "lifecycle" >}}
</div>

Notice that there are three required steps in the Authoring phase:

- Generation
- Augmentation
- Enrichment

Thus, we've gone from being a simple upload tool to a complete SBOM Swiss Army knife, where we combine the best open-source tools in the industry to generate a complete SBOM. All you need to do is provide either an SBOM or a (supported) lockfile, and we take care of the rest.

This is what it looks like in your Actions YAML file:

```yaml
- name: Upload SBOM
  uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: 'my-component-id'
    SBOM_FILE: 'sbom-file.json'
    COMPONENT_NAME: 'my-app'
    COMPONENT_VERSION: ${{ github.ref_name }}
    AUGMENT: true
    ENRICH: true
```

We didn't stop there. You can also now use the action in stand-alone mode without sbomify to generate SBOMs:

```yaml
- name: Generate SBOM
  uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: 'requirements.txt'
    COMPONENT_NAME: 'my-python-app'
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
    OUTPUT_FILE: 'my_sbom.cdx.json'
```

This will take the file `requirements.txt`, build an SBOM, then enrich the SBOM (using Ecosyste.ms), and finally write the file `my_sbom.cdx.json` to disk.

For more details on using the GitHub Action and other CI/CD integrations, see our [integrations page](/features/integrations/).
