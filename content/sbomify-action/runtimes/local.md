---

url: /sbomify-action/runtimes/local/
aliases:
  - /guides/sbomify-action/runtimes/local/
title: "Running the sbomify Action Locally"
description: "Generate SBOMs on your own machine with uvx, pipx or Docker - for trying things out, debugging a pipeline, or running the setup wizard."
keywords: ["uvx sbomify", "pipx sbomify", "local SBOM generation", "SBOM CLI"]
tldr: "Run it with uvx, pipx or Docker. Whatever generator your project needs is downloaded on first use and cached, so there is nothing to install either way."
---

Running locally is useful for trying the tool out, debugging a pipeline that behaves unexpectedly, generating a one-off SBOM, and running the [setup wizard](/sbomify-action/quickstart/) - which is interactive and deliberately refuses to run in CI.

For actual SBOM generation in a pipeline, use [your CI platform](/sbomify-action/runtimes/).

## Docker

Closest to what CI does, which makes it the best choice for reproducing a pipeline problem:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

Note that the container runs as root, so generated files will be root-owned on the host. Add `--user "$(id -u):$(id -g)"` if that is inconvenient.

## uvx

If you have [uv](https://docs.astral.sh/uv/), you can run the CLI without installing anything permanently:

```bash
uvx sbomify-action --lock-file requirements.txt --enrich --no-upload -o sbom.cdx.json
```

`uvx` downloads the package into a temporary environment, runs it, and leaves nothing behind. Ideal for a one-off.

The setup wizard works the same way:

```bash
uvx sbomify-action wizard
```

The license database generator is a separate entry point in the same package:

```bash
uvx --from sbomify-action sbomify-license-db --distro alpine --version 3.20 -o alpine-3.20.json.gz
```

## pipx

`pipx run` is the equivalent if you use pipx rather than uv:

```bash
pipx run sbomify-action --lock-file requirements.txt --enrich --no-upload -o sbom.cdx.json
```

```bash
pipx run sbomify-action wizard
```

Both `uvx` and `pipx run` keep the tool out of your global Python environment, which is what you want for something you invoke occasionally.

## The generators come down on first use

You do not need to install Syft or cdxgen yourself. The tool downloads the generators it needs on first use, verified against a pinned digest and cached under `~/.cache/sbomify/runtimes` (or wherever `SBOMIFY_TOOL_CACHE` points).

That means `uvx sbomify-action --lock-file Cargo.lock ...` gets you `cargo-cyclonedx`, not a Syft fallback, without any setup. The first run for a given ecosystem pays a download; later runs reuse the cache.

If you would rather use only what is already on your machine, opt out:

```bash
SBOMIFY_FETCH_RUNTIMES=0 uvx sbomify-action --lock-file requirements.txt --enrich --no-upload -o sbom.cdx.json
```

Be aware of what that trades away. Opting out does not make the tool fail when a native generator is missing - it falls back to whatever is installed, which is usually a worse answer, and the SBOM does not say so. If you set this flag, install the generators you care about:

| Tool                 | Install                                                                                  | Covers                                         |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `cyclonedx-py`       | Bundled as a dependency                                                                  | Python                                         |
| Syft                 | `brew install syft` or the [install guide](https://github.com/anchore/syft#installation) | Most ecosystems, container images, SPDX output |
| cdxgen               | `npm install -g @cyclonedx/cdxgen`                                                       | JavaScript, Ruby, PHP, .NET and more           |
| `cargo-cyclonedx`    | `cargo install cargo-cyclonedx`                                                          | Rust                                           |
| `crane` and `cosign` | `brew install crane cosign`                                                              | Chainguard image detection                     |

If a required tool is missing and fetching is disabled, the CLI tells you which one and how to install it.

## Environment variables work too

Every CLI flag has an environment variable equivalent, which is convenient in scripts:

```bash
export LOCK_FILE=requirements.txt
export OUTPUT_FILE=sbom.cdx.json
export ENRICH=true
export UPLOAD=false

uvx sbomify-action
```

Flags take precedence over environment variables. See the [configuration reference](/sbomify-action/configuration/#cli-flags).

## Uploading from your machine

```bash
export SBOMIFY_TOKEN="your-token"

uvx sbomify-action \
  --component-id your-component-id \
  --lock-file requirements.txt \
  --augment --enrich
```

OIDC trusted publishing is not available locally - it depends on a CI-issued identity token - so use an API token.

Be deliberate about uploading from a laptop. An SBOM generated locally reflects your machine rather than a clean build, and it cannot be attested. It is fine for experimenting; for anything you intend to distribute, generate it [in CI](/sbomify-action/why/#build-time-is-the-only-time) where it can be signed at origin.

## VCS information

Nothing is read from your checkout unless you ask for it. On CI, repository URL, commit SHA and ref are detected automatically; locally that is deliberately off, because the same lock file would otherwise produce a different SBOM depending on whether a remote happened to be configured, and an internal remote would be written into a document that often gets shared.

Opt in when you want it:

```bash
SBOMIFY_LOCAL_VCS=true uvx sbomify-action --lock-file requirements.txt --enrich
```

The values come from the checkout in your working directory: `origin` (or the first remote), `HEAD`, and the current branch or the exact tag when HEAD is detached.

Or state them yourself in `sbomify.json`, which takes priority either way:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

See [augmentation](/sbomify-action/augmentation/).

## Debugging a pipeline

When CI produces something you did not expect, reproduce it locally with the same image and the same variables:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  -e VERBOSE=true \
  ghcr.io/sbomify/sbomify-action
```

`VERBOSE=true` shows which generator ran, which enrichment sources answered, and where time went. Check `audit_trail.txt` afterwards for the full list of changes.

Two differences from CI worth keeping in mind: VCS detection is opt-in locally (`SBOMIFY_LOCAL_VCS=true`) where CI does it automatically, and enrichment coverage may differ if CI is hitting [GitHub API rate limits](/sbomify-action/enrichment/#license-database-rate-limits) that your machine is not.

## Next steps

- [Quick start](/sbomify-action/quickstart/) - the setup wizard
- [Configuration reference](/sbomify-action/configuration/) - every option
- [Your CI platform](/sbomify-action/runtimes/) - moving this into a pipeline
