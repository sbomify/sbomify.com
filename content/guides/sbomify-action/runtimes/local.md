---

url: /guides/sbomify-action/runtimes/local/
title: "Running the sbomify Action Locally"
description: "Generate SBOMs on your own machine with uvx, pipx or Docker - for trying things out, debugging a pipeline, or running the setup wizard."
keywords: ["uvx sbomify", "pipx sbomify", "local SBOM generation", "SBOM CLI"]
section: guides
tldr: "Docker is the easiest way to run locally because it bundles the generators. With uvx or pipx you get the CLI instantly but must install the generators yourself."
---

Running locally is useful for trying the tool out, debugging a pipeline that behaves unexpectedly, generating a one-off SBOM, and running the [setup wizard](/guides/sbomify-action/quickstart/) - which is interactive and deliberately refuses to run in CI.

For actual SBOM generation in a pipeline, use [your CI platform](/guides/sbomify-action/runtimes/).

## Docker (recommended)

The container image bundles every generator, so there is nothing else to install:

```bash
docker run --rm \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

This is the closest match to what your CI will do, which makes it the right choice for reproducing a pipeline problem.

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

## You still need the generators

**This is the catch with `uvx` and `pipx`.** They install the sbomify CLI, not the tools that actually produce SBOMs. Without at least one generator you will get `No generator found for input`.

| Tool              | Install                                                                                  | Covers                                         |
| ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `cyclonedx-py`    | Bundled as a dependency                                                                  | Python                                         |
| Syft              | `brew install syft` or the [install guide](https://github.com/anchore/syft#installation) | Most ecosystems, container images, SPDX output |
| cdxgen            | `npm install -g @cyclonedx/cdxgen`                                                       | Most ecosystems, best Java support             |
| `cargo-cyclonedx` | `cargo install cargo-cyclonedx`                                                          | Rust                                           |
| `crane`           | `brew install crane`                                                                     | Chainguard image detection                     |
| `cosign`          | `brew install cosign`                                                                    | Chainguard SBOM retrieval                      |

Python works out of the box, since `cyclonedx-py` comes along as a dependency. Everything else needs Syft or cdxgen installed separately.

If a required tool is missing, the CLI tells you which one and how to install it.

This is why Docker is the recommended local option - it sidesteps the whole question.

## Environment variables work too

Every CLI flag has an environment variable equivalent, which is convenient in scripts:

```bash
export LOCK_FILE=requirements.txt
export OUTPUT_FILE=sbom.cdx.json
export ENRICH=true
export UPLOAD=false

uvx sbomify-action
```

Flags take precedence over environment variables. See the [configuration reference](/guides/sbomify-action/configuration/#cli-flags).

## Uploading from your machine

```bash
export SBOMIFY_TOKEN="your-token"

uvx sbomify-action \
  --component-id your-component-id \
  --lock-file requirements.txt \
  --augment --enrich
```

OIDC trusted publishing is not available locally - it depends on a CI-issued identity token - so use an API token.

Be deliberate about uploading from a laptop. An SBOM generated locally reflects your machine rather than a clean build, and it cannot be attested. It is fine for experimenting; for anything you intend to distribute, generate it [in CI](/guides/sbomify-action/why/#build-time-is-the-only-time) where it can be signed at origin.

## VCS information

Nothing is auto-detected locally. Set the values in `sbomify.json` if you need them:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

See [augmentation](/guides/sbomify-action/augmentation/).

## Debugging a pipeline

When CI produces something you did not expect, reproduce it locally with the same image and the same variables:

```bash
docker run --rm \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  -e VERBOSE=true \
  ghcr.io/sbomify/sbomify-action
```

`VERBOSE=true` shows which generator ran, which enrichment sources answered, and where time went. Check `audit_trail.txt` afterwards for the full list of changes.

Two differences from CI worth keeping in mind: VCS auto-detection will not fire locally, and enrichment coverage may differ if CI is hitting [GitHub API rate limits](/guides/sbomify-action/enrichment/#license-database-rate-limits) that your machine is not.

## Next steps

- [Quick start](/guides/sbomify-action/quickstart/) - the setup wizard
- [Configuration reference](/guides/sbomify-action/configuration/) - every option
- [Your CI platform](/guides/sbomify-action/runtimes/) - moving this into a pipeline
