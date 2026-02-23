---

title: "GitHub Action module with Attestation"
description: "New features in sbomify's GitHub Action including Dart lockfile support, Docker image SBOMs, NTIA enrichment, and SLSA build provenance attestation."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, github-actions, docker, attestation]
date: 2024-10-31
slug: github-action-update-and-attestation
---

Over the last few weeks, we've made some significant updates to our [GitHub Actions module](https://github.com/sbomify/sbomify-action). Since our last update, we've added a few new features.

## Changelog

- Support for Dart lockfiles
- Support for Docker images (system packages only)
- Full support for [Enrichment and Augmentation](https://sbomify.com/features/generate-collaborate-analyze/), meaning we can automatically complete your SBOMs to make them NTIA Minimum Elements compatible
- Documentation on how to use attestation with the GitHub Actions module (more on that below)
- Bumped versions of various sub-components
- Various bug fixes

## Using Attestation

Thanks to recent improvements by GitHub, generating an attestation is now very straightforward. Behind the scenes, the GitHub Actions module [attest-build-provenance](https://github.com/actions/attest-build-provenance) will automatically generate a [SLSA build provenance](https://slsa.dev/spec/v1.0/provenance) predicate using the [in-toto](https://github.com/in-toto/attestation/tree/main/spec/v1) format. All you need to do is instruct our GitHub Actions module to write the SBOM to disk, and then point the attestation tool to this file — voila! You now have a cryptographically signed attestation of your SBOM.

At sbomify, we are big fans of dogfooding our own product, so we've adopted this exact flow in the SBOM we generate for our GitHub Actions module itself, as you can see [here](https://github.com/sbomify/sbomify-action/blob/master/.github/workflows/sbomify.yaml).

The job looks something like this:

```yaml
[...]
      - name: Upload SBOM
        uses: sbomify/sbomify-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'Gu9wem8mkX'
          LOCK_FILE: 'poetry.lock'
          COMPONENT_NAME: 'sbomify-github-action'
          COMPONENT_VERSION: ${{ github.ref_name }}
          AUGMENT: true
          ENRICH: true
          UPLOAD: true
          OUTPUT_FILE: github-action.cdx.json

      - name: Attest
        uses: actions/attest-build-provenance@v1
        with:
          subject-path: '${{ github.workspace }}/github-action.cdx.json'
```

For more details on using the GitHub Action and other CI/CD integrations, see our [integrations page](/features/integrations/).

What’s great about this is that it removes the need to trust sbomify directly. You can verify the SBOM independently as follows:

- Download the latest SBOM from the GitHub Action [sbomify public page](https://app.sbomify.com/component/Gu9wem8mkX)
- Install the GitHub CLI if you don't already have it

With this done, you can verify the file against GitHub:

```bash
$ gh attestation verify path/to/downloaded-sbom.json --owner sbomify
Loaded digest sha256:aeee57eeb5b34e0f70ace59bfc2328e3332062523796837eb37883eb805cd8f9 for file:///path/to/downloaded-sbom.json
Loaded 1 attestation from GitHub API
✓ Verification succeeded!

sha256:aeee57eeb5b34e0f70ace59bfc2328e3332062523796837eb37883eb805cd8f9 was attested by:
REPO                   PREDICATE_TYPE                  WORKFLOW
sbomify/sbomify-action  https://slsa.dev/provenance/v1  .github/workflows/sbomify.yaml@refs/tags/v0.1.1
```

And just like that! We can independently verify that sbomify (or any other intermediary) did not tamper with the SBOM in transit.
