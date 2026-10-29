---
title: "How do I use the sbomify setup wizard?"
description: "The interactive setup wizard (sbomify-action wizard) scans your repository, creates your products and components, sets up OIDC trusted publishing, and writes a ready-to-commit GitHub Actions workflow."
answer: "Run 'sbomify-action wizard' from the root of your repository using the Docker image, which bundles everything the wizard needs. The interactive wizard scans your repo for lockfiles, signs you in to sbomify, lets you pick or create the product and components, registers OIDC trusted publishing, and writes a ready-to-commit .github/workflows/sboms.yml. Commit the file and your next push generates and uploads an SBOM."
tldr: "The setup wizard is the fastest way from zero to automated SBOMs. It is an interactive terminal UI that configures everything - products, components, OIDC trusted publishing, and the CI workflow file - so you never hand-write YAML or copy a token."
weight: 61
keywords: [sbomify setup wizard, sbomify-action init, SBOM onboarding, SBOM CI setup, generate SBOM quickly, sbomify getting started]
url: /faq/how-do-i-use-the-sbomify-setup-wizard/
---

## Starting in the app

In a new workspace, start with **Get started** in the sidebar. This in-app wizard asks three things once: who you are, where to report a vulnerability, and how you support your software.

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/onboarding_wizard.webm" title="Setting up a new sbomify workspace with the Get started wizard" description="Narrated screencast: fill in the Get started wizard, then connect a first repository with a coding agent prompt or the terminal wizard." upload_date="2026-10-28T00:00:00Z" >}}

1. **Your organization.** These details become your default contact profile
2. **Security promises.** Enter the address security researchers report vulnerabilities to, and optionally tick **Publish this email in my Trust Center's security.txt**. Set a default support period, and the maximum time to fix each severity. The recommended targets are 7 days for critical, 30 for high, and 90 for medium
3. Click **Save and continue**. The workspace is ready, and the checklist shows what was saved

Until your first artifact arrives, the dashboard shows **Set up your first repository**, with two ways in:

- **Coding agent.** Click **Create setup token**, and the token becomes part of a prompt for Claude Code, Cursor, or another coding agent. Click **Copy prompt** and paste it into your agent in the repository. It finds your lockfiles, creates the components, and adds an SBOM workflow, after you review the changes. The setup token expires after seven days, and you can revoke it in Settings.
- **Terminal.** Run the same setup wizard described below, with Docker or uv.

To come back to this page later, search for `connect a repository` (see [How do I search in sbomify?](/faq/how-do-i-search-in-sbomify/)). Commit and push the workflow, and your first SBOM lands in the workspace.

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

The `-it` flags are required because the wizard is interactive, and the volume mount is what lets it write the generated workflow back into your repo. If you prefer not to use Docker, you can also run `uvx sbomify-action wizard` (or `pipx run sbomify-action wizard`) directly (`sbomify-action init` is a backwards-compatible alias). Useful flags:

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
- [How do I upload an SBOM?](/faq/how-do-i-upload-an-sbom/) - upload by hand while you set up CI
- [How do I create an API token?](/faq/how-do-i-create-an-api-token/) - for CI systems other than GitHub Actions
