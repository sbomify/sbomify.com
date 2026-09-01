---

url: /sbomify-action/runtimes/docker/
aliases:
  - /guides/sbomify-action/runtimes/docker/
title: "SBOM Generation on Any Container Runner"
description: "Run the sbomify action with plain Docker or Podman on any CI platform - Drone, Woodpecker, TeamCity, Buildkite, Concourse - or from a shell script."
keywords: ["Docker SBOM", "Podman SBOM", "Drone CI SBOM", "Buildkite SBOM", "TeamCity SBOM"]
section: sbomify-action
tldr: "If your platform can run a container, it is supported. Mount your repository at /workspace, pass configuration as environment variables, and run the image."
---

The container image is the universal integration. Any platform that can run a container can run this, whether or not it has a dedicated page here.

## The pattern

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

Two things matter:

1. **Mount your repository at `/workspace`.** That is the image's working directory, so no `-w` is needed. Any other mount point works as long as `-w` points at it - including an existing `-v "$(pwd):/github/workspace" -w /github/workspace`, which keeps working unchanged. Keep the mount and the `-w` in step: output paths resolve against the working directory, so a mount without a matching `-w` leaves your SBOM inside the container.
2. **Pass configuration as environment variables.** The image entrypoint is `sbomify-action`, so no command is needed.

Podman works identically - substitute `podman run`.

## Uploading

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
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
  -v "$(pwd):/workspace" \
  -v sbomify-cache:/cache \
  -e SBOMIFY_CACHE_DIR=/cache/sbomify \
  -e SYFT_CACHE_DIR=/cache/syft \
  -e SBOMIFY_TOOL_CACHE=/cache/runtimes \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

`GITHUB_TOKEN` matters on every platform. License databases are downloaded from GitHub Releases, and unauthenticated requests are capped at 60 per hour per IP. When that is exceeded, enrichment degrades silently. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Container images

Scanning an image needs access to a Docker daemon:

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):/workspace" \
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

Generate it from whatever variables your platform provides, then set `AUGMENT=true`. See [augmentation](/sbomify-action/augmentation/).

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
          workdir: /workspace
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

**TeamCity** has [its own page](/sbomify-action/runtimes/teamcity/).

**A plain shell script** - the `docker run` invocation at the top of this page works in cron, a Makefile, or a deployment script.

## VCS detection

Repository URL, commit SHA and branch are detected from the git checkout you mounted, so a plain `docker run` on any CI system records provenance without configuration. It needs the `.git` directory inside the mount - `-v "$(pwd):/workspace"` from a repository root gives you that - and a remote on the repository.

One thing to know: the action treats a run as CI when the environment sets `CI=true` or a vendor variable it recognises (`JENKINS_URL`, `CIRCLECI`, `TF_BUILD`, `BUILDKITE`, `DRONE`, `TRAVIS`, `APPVEYOR`, `CODEBUILD_BUILD_ID`). Nearly every CI system sets one of those. If yours does not - a cron job or a shell script on a build box, say - pass `-e CI=true`, or `-e SBOMIFY_LOCAL_VCS=true` to get the same detection without claiming to be CI. Otherwise the run counts as local, where reading the checkout is opt-in.

`sbomify.json` overrides whatever is detected. See [augmentation](/sbomify-action/augmentation/#automatic-vcs-detection).

## What is in the image

The image is deliberately small: Python, the sbomify CLI (which brings `cyclonedx-py` with it), `conan` for C and C++ metadata, and `git`.

Everything else - Syft, cdxgen, the JVM toolchain, Go, Rust, PHP, .NET, `crane` and `cosign` - is **downloaded on first use**, verified against a digest pinned at build time, and cached. You do not install anything; the tool fetches exactly the versions it was tested against.

Two practical consequences:

- **Cache the runtimes** or every run re-downloads them. Point `SBOMIFY_TOOL_CACHE` at a volume, as in the caching example above. See [tool runtimes](/sbomify-action/advanced/#tool-runtimes).
- **Air-gapped runners need `SBOMIFY_FETCH_RUNTIMES=0`**, plus whatever generators you need preinstalled. Without them the run falls back to a lesser generator rather than failing, so check the output.

The container runs as root, because it needs to write to the mounted workspace. Files it creates will be root-owned on the host unless you pass `--user`.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Augmentation](/sbomify-action/augmentation/) - your business metadata, and overriding detected VCS details
- [Advanced](/sbomify-action/advanced/) - caching, audit trail, troubleshooting
