---

url: /sbomify-action/runtimes/travis/
title: "SBOM Generation in Travis CI"
description: "Run the sbomify action in Travis CI with the container image, including caching, encrypted tokens and VCS detection from the job environment."
keywords: ["Travis CI SBOM", "Travis CI CycloneDX", "SBOM pipeline"]
tldr: "Run the container image with docker run from a job that has the docker service enabled. The repository URL comes from the checkout and the commit and branch from Travis's own variables - forward them into the container with -e."
---

Travis CI jobs run on a virtual machine rather than inside a container of your choosing, so the integration is a plain `docker run` from the job with the `docker` service enabled.

## Minimal example

```yaml
language: minimal

services:
  - docker

script:
  - |
    docker run --rm \
      -v "$TRAVIS_BUILD_DIR:/workspace" \
      -e TRAVIS -e TRAVIS_COMMIT -e TRAVIS_BRANCH \
      -e TRAVIS_TAG -e TRAVIS_PULL_REQUEST_BRANCH \
      -e LOCK_FILE=requirements.txt \
      -e OUTPUT_FILE=sbom.cdx.json \
      -e ENRICH=true \
      -e UPLOAD=false \
      ghcr.io/sbomify/sbomify-action
```

The bare `-e TRAVIS` form forwards the variable's value from the job into the container. That part matters: the job runs on the VM, and `docker run` passes nothing through unless you ask it to. Without those five the container sees no Travis environment at all, is treated as a local run, and records no repository details - see [VCS information](#vcs-information).

## Uploading to sbomify

Define `TOKEN` as an encrypted environment variable in the repository settings, or with `travis encrypt`, and forward it the same way:

```yaml
script:
  - |
    docker run --rm \
      -v "$TRAVIS_BUILD_DIR:/workspace" \
      -e TRAVIS -e TRAVIS_COMMIT -e TRAVIS_BRANCH \
      -e TRAVIS_TAG -e TRAVIS_PULL_REQUEST_BRANCH \
      -e TOKEN \
      -e COMPONENT_ID=your-component-id \
      -e LOCK_FILE=requirements.txt \
      -e AUGMENT=true \
      -e ENRICH=true \
      ghcr.io/sbomify/sbomify-action
```

Leave "Display value in build log" off, and keep the variable out of pull request builds unless you need it there - Travis withholds encrypted variables from forked pull requests by default, which is the behaviour you want.

Travis CI does not support OIDC trusted publishing; that is currently GitHub-only.

## Caching

Travis restores declared directories between builds, so point the tool caches at one of them and mount it into the container:

```yaml
cache:
  directories:
    - $HOME/.sbomify-cache

script:
  - |
    docker run --rm \
      -v "$TRAVIS_BUILD_DIR:/workspace" \
      -v "$HOME/.sbomify-cache:/cache" \
      -e TRAVIS -e TRAVIS_COMMIT -e TRAVIS_BRANCH \
      -e TRAVIS_TAG -e TRAVIS_PULL_REQUEST_BRANCH \
      -e SBOMIFY_CACHE_DIR=/cache/sbomify \
      -e SYFT_CACHE_DIR=/cache/syft \
      -e SBOMIFY_TOOL_CACHE=/cache/runtimes \
      -e LOCK_FILE=poetry.lock \
      -e ENRICH=true \
      -e UPLOAD=false \
      ghcr.io/sbomify/sbomify-action
```

Forward `GITHUB_TOKEN` as well. License databases come from GitHub Releases whatever CI you are on, and unauthenticated requests are capped at 60 per hour per IP - when that limit is hit, enrichment degrades silently rather than failing. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Versioning

Use the tag when there is one and fall back to the commit:

```yaml
script:
  - |
    docker run --rm \
      -v "$TRAVIS_BUILD_DIR:/workspace" \
      -e TRAVIS -e TRAVIS_COMMIT -e TRAVIS_BRANCH \
      -e TRAVIS_TAG -e TRAVIS_PULL_REQUEST_BRANCH \
      -e COMPONENT_NAME=my-app \
      -e COMPONENT_VERSION="${TRAVIS_TAG:-$TRAVIS_COMMIT}" \
      -e LOCK_FILE=requirements.txt \
      ghcr.io/sbomify/sbomify-action
```

To upload on tagged builds only, guard the stage with `if: tag IS present`.

## VCS information

Repository URL, commit SHA and branch or tag are detected automatically. Detection landed after `v26.8.0`, so it is present on `master` and in any release tagged since.

| Field         | Read from                                                             |
| ------------- | --------------------------------------------------------------------- |
| Repository    | The git checkout (`git remote`)                                       |
| Commit        | `TRAVIS_COMMIT`, falling back to the checkout                         |
| Branch or tag | `TRAVIS_TAG`, then `TRAVIS_PULL_REQUEST_BRANCH`, then `TRAVIS_BRANCH` |

Travis is the one platform here whose repository URL comes from the checkout rather than the vendor, and that is deliberate. Travis publishes only `TRAVIS_REPO_SLUG`, an `owner/repo` pair with no host attached, and it serves GitHub, Bitbucket, GitLab and Assembla projects alike. Turning that pair into a URL means guessing the forge, and a link that lands on the wrong host is worse than no link at all. The remote in the checkout says which host without guessing.

The commit and the ref come from the job because the checkout cannot answer them properly: Travis clones with `--branch` and then checks out the commit, leaving a detached HEAD that can name a tag and nothing else. `TRAVIS_TAG` comes first because on a tag build `TRAVIS_BRANCH` repeats the tag name rather than naming a branch. `TRAVIS_PULL_REQUEST_BRANCH` comes before `TRAVIS_BRANCH` because on a pull request build `TRAVIS_BRANCH` is the branch being merged _into_, while the source branch is the one this build actually built.

A commit link is added for github.com, gitlab.com and bitbucket.org, plus self-hosted GitHub and GitLab. Anything else gets the repository URL and the SHA without a link rather than a guessed one that 404s.

### Two things have to be true

- **The `.git` directory has to be inside the mount.** `-v "$TRAVIS_BUILD_DIR:/workspace"` from the build directory gives you that; a mount of only your lockfile does not. Without a repository URL nothing is emitted, since Travis publishes none of its own to fall back on.
- **The Travis variables have to be forwarded.** A `docker run` with no `-e TRAVIS` is not recognisably a Travis job from inside the container, so it counts as a local run - where reading the checkout is opt-in and off by default. Forward `TRAVIS` at minimum; forward `TRAVIS_COMMIT`, `TRAVIS_BRANCH`, `TRAVIS_TAG` and `TRAVIS_PULL_REQUEST_BRANCH` to get the ref the job was triggered for rather than whatever the detached HEAD can name.

### Overriding

Set the fields in `sbomify.json` when you want something other than the remote recorded - an internal mirror rewritten to its public URL, for example:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

`sbomify.json` wins over detection. Set `AUGMENT=true` when you are supplying other metadata alongside it. See [augmentation](/sbomify-action/augmentation/).

## Container images

The Docker daemon is already there once the `docker` service is enabled, so build the image first and point the action at it:

```yaml
services:
  - docker

script:
  - docker build -t my-app:latest .
  - |
    docker run --rm \
      -v "$TRAVIS_BUILD_DIR:/workspace" \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -e TRAVIS -e TRAVIS_COMMIT -e TRAVIS_BRANCH \
      -e TRAVIS_TAG -e TRAVIS_PULL_REQUEST_BRANCH \
      -e DOCKER_IMAGE=my-app:latest \
      -e OUTPUT_FILE=container-sbom.cdx.json \
      -e ENRICH=true \
      -e UPLOAD=false \
      ghcr.io/sbomify/sbomify-action
```

Mounting the Docker socket grants the container control of the host daemon. On a throwaway Travis VM that is a smaller concern than on a long-lived agent, but it is worth knowing.

## Monorepos

```yaml
-e WORKING_DIR=packages/my-app
-e LOCK_FILE=package-lock.json
```

For several components, use a build matrix with one `COMPONENT_ID` per entry.

## Signing

Build provenance attestation is GitHub-specific. Use [cosign](/faq/how-do-i-sign-an-sbom/), which runs anywhere.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Augmentation](/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/sbomify-action/advanced/) - caching, audit trail, troubleshooting
