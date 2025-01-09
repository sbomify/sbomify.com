---
layout: post
title: "Big update to our GitHub Action"
author:
  display_name: Viktor
categories: tools announcement sbom

---

In the last few weeks, we've worked hard on overhauling the [sbomify GitHub Action](https://github.com/sbomify/github-action/) based on customer feedback. The initial purpose of the GitHub Action module was merely to upload SBOMs to the sbomify platform. We've now broadened the scope to make it more powerful, with the goal of creating NTIA Minimum Elements compliant SBOMs directly in your CI/CD pipeline with minimal fuss.

As a refresher, the SBOM lifecycle looks like this:

![Lifecycle](/assets/images/site/lifecycle.svg)

Notice that there are three required steps in the Authoring phase:

* Generation
* Augmentation
* Enrichment

Thus, we've gone from being a simple upload tool to a complete SBOM Swiss Army knife, where we combine the best open-source tools in the industry to generate a complete SBOM. All you need to do is provide either an SBOM or a (supported) lockfile, and we take care of the rest.

This is what it looks like in your Actions YAML file:

```yaml
      - name: Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
          COMPONENT_ID: 'my-component-id'
          SBOM_FILE: 'sbom-file.json'
          AUGMENT: true
          ENRICH: true
```

We didn't stop there. You can also now use the action in stand-alone mode without sbomify to generate SBOMs:

```yaml
      - name: Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
          COMPONENT_ID: 'placeholder'
          LOCK_FILE: 'requirements.txt'
          AUGMENT: false
          ENRICH: true
          UPLOAD: false
          OUTPUT_FILE: 'my_sbom.cdx.json'
```

This will take the file `requirements.txt`, build an SBOM, then enrich the SBOM (using Parlay), and finally write the file `my_sbom.cdx.json` to disk.