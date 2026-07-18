---
title: "How do I set up OIDC trusted publishing?"
description: "OIDC trusted publishing lets GitHub Actions upload SBOMs to sbomify without any long-lived token secret, using short-lived OpenID Connect tokens instead."
answer: "Add a trusted publisher binding to your component in the sbomify app (Component Settings, Trusted Publishers), then grant your GitHub Actions workflow 'permissions: id-token: write' and drop the TOKEN secret. sbomify-action detects the OIDC environment automatically, exchanges GitHub's OIDC token for a short-lived sbomify token, and uploads. No secrets to create, rotate, or leak."
tldr: "Trusted publishing replaces long-lived API tokens with short-lived OpenID Connect tokens minted by GitHub for each workflow run. Bind your repository to a component once in the sbomify UI, add 'id-token: write' to your workflow, and uploads just work - no token secret anywhere."
weight: 62
keywords: [OIDC trusted publishing, tokenless SBOM upload, GitHub Actions OIDC, sbomify trusted publisher, keyless publishing, id-token write]
url: /faq/how-do-i-set-up-oidc-trusted-publishing/
---

## What trusted publishing is

Long-lived API tokens are a liability: they live in secret stores, they leak, and they need rotating (sbomify personal access tokens expire after 90 days by default for exactly this reason). Trusted publishing, the same model PyPI uses, removes them entirely for CI uploads.

Instead of a stored secret, GitHub Actions mints a short-lived OpenID Connect (OIDC) token for each workflow run that cryptographically proves which repository and workflow is running. sbomify verifies that token and exchanges it for a sbomify access token that is valid for about 15 minutes and scoped to the one component the repository is bound to. When the run ends, there is nothing left to steal.

## Setting it up

### 1. Create the trusted publisher binding

In the [sbomify app](https://app.sbomify.com), open your component's settings and add a **Trusted Publisher** with your GitHub organization and repository. Private repositories are supported. To defeat repository resurrection attacks, sbomify pins the immutable GitHub repository and owner IDs, not just the names.

If you onboard with the [setup wizard](/faq/how-do-i-use-the-sbomify-setup-wizard/), this step happens automatically.

### 2. Update your workflow

Grant the OIDC permission and remove the `TOKEN` secret:

```yaml
permissions:
  id-token: write

steps:
  - name: Upload SBOM
    uses: sbomify/sbomify-action@master
    env:
      COMPONENT_ID: 'my-component-id'
      LOCK_FILE: 'requirements.txt'
      AUGMENT: true
      ENRICH: true
      UPLOAD: true
```

That is the whole setup. sbomify-action auto-detects the OIDC environment when no `TOKEN` is set. If both are present, `TOKEN` takes precedence. Self-hosted sbomify instances can override the token audience with the `oidc-audience` input (default `sbomify.com`).

## Scope and limits

- The exchanged token is scoped to the component bound to the repository. A compromised workflow cannot touch the rest of your workspace.
- OIDC trusted publishing currently works in **GitHub Actions**. On GitLab CI, Bitbucket Pipelines, and other CI systems, keep using a token via the `TOKEN` environment variable.
- Uploads, augmentation, and release tagging all work over the exchanged token.

## Further reading

- [How do I use the sbomify setup wizard?](/faq/how-do-i-use-the-sbomify-setup-wizard/) - registers trusted publishing for you
- [How do I generate an SBOM?](/faq/how-do-i-generate-an-sbom/) - the generation pipeline the upload belongs to
- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) - complementary provenance for the SBOM itself
