---

url: /sbomify-action/quickstart/
aliases:
  - /guides/sbomify-action/quickstart/
title: "sbomify Action Quick Start"
description: "Get your first SBOM generated in minutes with the interactive setup wizard, or by writing the configuration by hand."
keywords: ["sbomify quick start", "SBOM setup wizard", "generate SBOM CI"]
section: sbomify-action
tldr: "Run the setup wizard from your repository root and it scans for lockfiles, signs you in, and writes a ready-to-commit workflow. If you would rather write the configuration yourself, four environment variables is the whole minimum."
---

There are two ways to get started: let the wizard configure everything, or write the configuration by hand. The wizard is the fastest path and produces a workflow you can read and edit afterwards.

## Option 1: the setup wizard

The wizard is an interactive terminal application. It scans your repository for lockfiles, signs you in to sbomify, creates the matching components, and writes a ready-to-commit GitHub Actions workflow.

Run it from the root of your repository:

```bash
docker run --rm -it \
  -v "$(pwd):/workspace" \
  ghcr.io/sbomify/sbomify-action \
  sbomify-action wizard
```

If you have [uv](https://docs.astral.sh/uv/) available and would rather not use Docker:

```bash
uvx sbomify-action wizard
```

Either way there is nothing else to install - whatever generator your project needs is downloaded on first use and cached. See [running locally](/sbomify-action/runtimes/local/).

### What it does

1. Scans your repository for supported lockfiles and lets you pick which to onboard.
2. Signs you in to sbomify and picks or creates the product and components.
3. Asks how you want releases tagged, how to authenticate, whether to enrich, which SBOM formats to emit, and whether to attest.
4. Writes `.github/workflows/sboms.yml`, plus `sbomify.json` if you opt into local augmentation.

### Options

| Option           | Description                                                                             |
| ---------------- | --------------------------------------------------------------------------------------- |
| `--token`        | sbomify API token. Falls back to `$SBOMIFY_TOKEN`, then `$TOKEN`.                       |
| `--api-base-url` | sbomify API base URL. Defaults to `https://app.sbomify.com`; override for self-hosted.  |
| `--repo-root`    | Repository root to scan. Defaults to the current directory.                             |
| `--output-dir`   | Where the workflow is written. Defaults to `.github/workflows`, and must resolve there. |
| `--dry-run`      | Walk through the wizard and preview the plan. Makes no API changes and writes no files. |
| `--debug`        | Dump debug logs after the wizard exits.                                                 |

### Things worth knowing

- The wizard is **interactive**, so the `-it` flags are required, and it refuses to launch on any environment it recognises as CI - `CI=true`, or a vendor marker such as `GITHUB_ACTIONS`, `GITLAB_CI` or `JENKINS_URL`. Run it on your machine and commit the result.
- The volume mount is what lets it write the generated workflow back into your repository. Without it, the wizard runs but produces nothing you keep.
- It only manages `.github/workflows/sboms.yml`, and marks files it generated with a header. It will never overwrite a workflow you wrote by hand.
- It pins the action to a specific commit SHA at generation time, which is the recommended practice.
- All components in one repository share a single release strategy, credential mode and format set. If you need them to differ, edit the generated workflow or write your own.
- The wizard currently emits **GitHub Actions** workflows only. On other runtimes, configure by hand - see the [runtime guides](/sbomify-action/runtimes/).
- `sbomify-action init` is a backwards-compatible alias for `wizard`.

## Option 2: configure it by hand

The minimum viable configuration is four environment variables. This generates a CycloneDX SBOM from a lockfile, enriches it from package registries, and writes it to disk without uploading anywhere:

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true
    UPLOAD: false
```

That is a complete, working setup. No account required.

Swap `requirements.txt` for whichever lockfile your project uses - [17 ecosystems are supported](/sbomify-action/sources/). For SPDX output, add `SBOM_FORMAT: spdx`.

On any runtime other than GitHub Actions, the same configuration is passed to the container image as environment variables:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

## Adding your own metadata

Enrichment fills in what public registries know. It cannot know who supplies your software, who authored it, or when support ends - that is [augmentation](/sbomify-action/augmentation/), and it needs input from you.

Create `sbomify.json` in your project root:

```json
{
  "lifecycle_phase": "build",
  "supplier": {
    "name": "My Company",
    "url": ["https://example.com"],
    "contacts": [{"name": "Support", "email": "support@example.com"}]
  },
  "authors": [
    {"name": "Jane Doe", "email": "jane@example.com"}
  ],
  "licenses": ["Apache-2.0"],
  "security_contact": "https://example.com/.well-known/security.txt"
}
```

Then set `AUGMENT: true`. No account needed for this either.

## Uploading to sbomify

To store SBOMs in sbomify, add a component ID and authenticate. On GitHub Actions, prefer [trusted publishing](/sbomify-action/publishing/#oidc-trusted-publishing) over a long-lived token:

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: sbomify/sbomify-action@master
        env:
          COMPONENT_ID: your-component-id
          LOCK_FILE: requirements.txt
          AUGMENT: true
          ENRICH: true
```

This requires a trusted publisher binding on the component first. See [publishing](/sbomify-action/publishing/) for the setup, and for the token-based alternative used on every other runtime.

## Checking the result

A successful run prints a summary table showing what was changed:

```text
┌─────────────────────┬───────┐
│ Metric              │ Value │
├─────────────────────┼───────┤
│ Overrides applied   │     3 │
│ Components enriched │    42 │
│ Sanitization fixes  │     5 │
└─────────────────────┴───────┘
```

It also writes `audit_trail.txt` next to your SBOM, listing every individual modification with a UTC timestamp and its source. That file is your evidence of what the pipeline did - see [the audit trail](/sbomify-action/advanced/#audit-trail).

If `Components enriched` is unexpectedly low, the most common cause is GitHub API rate limiting on the license database download. [Setting `GITHUB_TOKEN` fixes it](/sbomify-action/enrichment/#license-database-rate-limits).

## Next steps

- [How it works](/sbomify-action/how-it-works/) - what happens between input and output
- [Your runtime](/sbomify-action/runtimes/) - platform-specific setup
- [Configuration](/sbomify-action/configuration/) - every option
- [Advanced](/sbomify-action/advanced/) - attestation, caching, troubleshooting
