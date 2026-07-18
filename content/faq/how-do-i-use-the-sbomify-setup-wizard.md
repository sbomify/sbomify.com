---
title: "How do I use the sbomify setup wizard?"
description: "The interactive setup wizard (sbomify-action wizard) scans your repository, creates your products and components, sets up OIDC trusted publishing, and writes a ready-to-commit GitHub Actions workflow."
answer: "Run 'sbomify-action wizard' from the root of your repository using the Docker image, which bundles everything the wizard needs. The interactive wizard scans your repo for lockfiles, signs you in to sbomify, lets you pick or create the product and components, registers OIDC trusted publishing, and writes a ready-to-commit .github/workflows/sboms.yml. Commit the file and your next push generates and uploads an SBOM."
tldr: "The setup wizard is the fastest way from zero to automated SBOMs. It is an interactive terminal UI that configures everything - products, components, OIDC trusted publishing, and the CI workflow file - so you never hand-write YAML or copy a token."
weight: 61
keywords: [sbomify setup wizard, sbomify-action init, SBOM onboarding, SBOM CI setup, generate SBOM quickly, sbomify getting started]
url: /faq/how-do-i-use-the-sbomify-setup-wizard/
---

## What the wizard does

The setup wizard is an interactive terminal UI built into [sbomify-action](https://github.com/sbomify/sbomify-action). It is the recommended way to onboard a repository, because it automates every step that used to be manual:

1. **Scans your repository** for lockfiles across all supported ecosystems (Python, JavaScript, Java, Go, Rust, and more) and proposes one component per lockfile it finds.
2. **Signs you in to sbomify** so it can work against your workspace.
3. **Picks or creates the product and components** your SBOMs will belong to.
4. **Lets you choose your options**: release strategy, SBOM format, enrichment, and attestation.
5. **Registers OIDC trusted publishing** for each component, so your workflow needs no long-lived token secret. See [How do I set up OIDC trusted publishing?](/faq/how-do-i-set-up-oidc-trusted-publishing/) for how that works.
6. **Writes a ready-to-commit `.github/workflows/sboms.yml`** (and an optional `sbomify.json` for business metadata), pinned to the latest sbomify-action release.

Commit the generated workflow file and your next push generates, enriches, and uploads an SBOM.

## Running it

Run the wizard from the root of your repository with the Docker image. The image bundles every tool the wizard needs, so there is nothing else to install:

```bash
docker run --rm -it \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  ghcr.io/sbomify/sbomify-action \
  sbomify-action wizard
```

The `-it` flags are required because the wizard is interactive, and the volume mount is what lets it write the generated workflow back into your repo. If you prefer not to use Docker, you can also `pip install sbomify-action` and run `sbomify-action wizard` directly (`sbomify-action init` is a backwards-compatible alias). Useful flags:

- `--dry-run` - preview the full plan without making API changes or writing files
- `--repo-root <path>` - point at a repository other than the current directory
- `--output-dir <path>` - where the workflow is written (must resolve to `.github/workflows`)

The wizard is designed for interactive use and refuses to run inside CI. It also will not overwrite a hand-authored `sboms.yml`; it only manages workflows it generated. In CI, you run the workflow file the wizard produced.

## When to configure things manually instead

The wizard targets GitHub Actions. If you use GitLab CI, Bitbucket Pipelines, or another CI system, use the Docker image or pip package directly - see our [integrations page](/features/integrations/) and [CI/CD guide](/guides/ci-cd/) for ready-to-use templates. Everything the wizard configures can also be set up by hand: components in the [sbomify app](https://app.sbomify.com), workflow YAML from the templates.

## Further reading

- [How do I generate an SBOM?](/faq/how-do-i-generate-an-sbom/) - the broader generation options
- [How do I set up OIDC trusted publishing?](/faq/how-do-i-set-up-oidc-trusted-publishing/) - tokenless uploads explained
- [Zero to Hero](/zero-to-hero/) - the full onboarding walkthrough
