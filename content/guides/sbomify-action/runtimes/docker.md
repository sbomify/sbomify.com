---

url: /guides/sbomify-action/runtimes/docker/
title: "SBOM Generation on Any Container Runner"
description: "Run the sbomify action with plain Docker or Podman on any CI platform - Drone, Woodpecker, TeamCity, Buildkite, Concourse - or from a shell script."
keywords: ["Docker SBOM", "Podman SBOM", "Drone CI SBOM", "Buildkite SBOM", "TeamCity SBOM"]
section: guides
tldr: "If your platform can run a container, it is supported. Mount your repository at /github/workspace, pass configuration as environment variables, and run the image."
---

The container image is the universal integration. Any platform that can run a container can run this, whether or not it has a dedicated page here.

## The pattern

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

Three things matter:

1. **Mount your repository.** `/github/workspace` is the conventional path, but any path works as long as `-w` matches.
2. **Set the working directory** with `-w` so relative lockfile paths resolve.
3. **Pass configuration as environment variables.** The image entrypoint is `sbomify-action`, so no command is needed.

Podman works identically - substitute `podman run`.

## Uploading

```bash
docker run --rm \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  -e TOKEN="$SBOMIFY_TOKEN" \
  -e COMPONENT_ID=your-component-id \
  -e LOCK_FILE=requirements.txt \
  -e AUGMENT=true \
  -e ENRICH=true \
  ghcr.io/sbomify/sbomify-action
```

Take the token from your platform's secret store rather than hardcoding it. Passing secrets with `-e` exposes them in the process list on the host; if that matters, use `--env-file` with a file mode of `0600`, or your container runtime's secret mechanism.

## Caching

Use a named volume so the license database survives between runs:

```bash
docker volume create sbomify-cache

docker run --rm \
  -v "$(pwd):/github/workspace" \
  -v sbomify-cache:/cache \
  -w /github/workspace \
  -e SBOMIFY_CACHE_DIR=/cache/sbomify \
  -e SYFT_CACHE_DIR=/cache/syft \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

`GITHUB_TOKEN` matters on every platform. License databases are downloaded from GitHub Releases, and unauthenticated requests are capped at 60 per hour per IP. When that is exceeded, enrichment degrades silently. See [license database rate limits](/guides/sbomify-action/enrichment/#license-database-rate-limits).

## Container images

Scanning an image needs access to a Docker daemon:

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  -e DOCKER_IMAGE=my-app:latest \
  -e OUTPUT_FILE=container-sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

Mounting the Docker socket gives the container control of the host daemon. Prefer a rootless or remote daemon where your platform supports it. Pulling from a registry rather than a local daemon avoids the socket entirely.

## VCS information

Outside GitHub Actions, GitLab CI and Bitbucket, repository details are not auto-detected. Set them in `sbomify.json`:

```json
{
  "vcs_url": "https://git.example.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main",
  "supplier": {"name": "My Company"},
  "lifecycle_phase": "build"
}
```

Generate it from whatever variables your platform provides, then set `AUGMENT=true`. See [augmentation](/guides/sbomify-action/augmentation/).

## Platform examples

The syntax differs; the substance does not.

**Drone CI and Woodpecker**

```yaml
steps:
  - name: generate-sbom
    image: ghcr.io/sbomify/sbomify-action
    commands:
      - sbomify-action
    environment:
      LOCK_FILE: requirements.txt
      OUTPUT_FILE: sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"
```

**Buildkite**

```yaml
steps:
  - label: "Generate SBOM"
    plugins:
      - docker#v5.11.0:
          image: "ghcr.io/sbomify/sbomify-action"
          workdir: /github/workspace
          environment:
            - LOCK_FILE=requirements.txt
            - OUTPUT_FILE=sbom.cdx.json
            - ENRICH=true
            - UPLOAD=false
```

**Concourse**

```yaml
jobs:
  - name: generate-sbom
    plan:
      - get: repo
      - task: sbom
        config:
          platform: linux
          image_resource:
            type: registry-image
            source: { repository: ghcr.io/sbomify/sbomify-action }
          inputs:
            - name: repo
          outputs:
            - name: sbom
          params:
            LOCK_FILE: repo/requirements.txt
            OUTPUT_FILE: sbom/sbom.cdx.json
            ENRICH: "true"
            UPLOAD: "false"
          run:
            path: sbomify-action
```

**TeamCity** - add a Docker Wrapper build feature to a command line step, set the image, and pass configuration as build parameters mapped to environment variables.

**A plain shell script** - the `docker run` invocation at the top of this page works in cron, a Makefile, or a deployment script.

## What is in the image

The image bundles everything needed, so nothing else has to be installed: Syft, cdxgen, `cyclonedx-py`, `cargo-cyclonedx`, `crane` and `cosign` for Chainguard detection, `conan` for C and C++ metadata, and `git`.

A couple of practical notes:

- **Java and Maven are installed on demand** the first time a Java or Scala project is processed, which keeps the image roughly 330 MB smaller. Expect a one-off package installation partway through those runs.
- **The container runs as root**, because it needs to write to the mounted workspace. Files it creates will be root-owned on the host unless you pass `--user`.

## Next steps

- [Configuration reference](/guides/sbomify-action/configuration/) - every option
- [Augmentation](/guides/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/guides/sbomify-action/advanced/) - caching, audit trail, troubleshooting
