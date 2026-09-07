---

url: /sbomify-action/runtimes/circleci/
aliases:
  - /guides/sbomify-action/runtimes/circleci/
title: "SBOM Generation in CircleCI"
description: "Run the sbomify action in CircleCI using the container image as a Docker executor, with caching, contexts and automatic VCS detection from the job environment."
keywords: ["CircleCI SBOM", "CircleCI CycloneDX", "SBOM pipeline"]
tldr: "Use the container image as the Docker executor and run sbomify-action. Repository, commit and branch are read from CircleCI's own job variables, with the checkout as the fallback; sbomify.json overrides them."
---

CircleCI runs the container image as a Docker executor.

## Minimal example

```yaml
version: 2.1

jobs:
  generate-sbom:
    docker:
      - image: ghcr.io/sbomify/sbomify-action
    environment:
      LOCK_FILE: requirements.txt
      OUTPUT_FILE: sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"
    steps:
      - checkout
      - run:
          name: Generate SBOM
          command: sbomify-action
      - store_artifacts:
          path: sbom.cdx.json

workflows:
  build-and-sbom:
    jobs:
      - generate-sbom
```

> If you have an older config calling `/sbomify.sh`, update it. That entrypoint no longer exists; the command is `sbomify-action`.

## Uploading to sbomify

Put the token in a CircleCI context rather than a project environment variable, so access can be restricted to specific security groups.

```yaml
jobs:
  generate-sbom:
    docker:
      - image: ghcr.io/sbomify/sbomify-action
    environment:
      COMPONENT_ID: your-component-id
      LOCK_FILE: requirements.txt
      AUGMENT: "true"
      ENRICH: "true"
    steps:
      - checkout
      - run: sbomify-action

workflows:
  build-and-sbom:
    jobs:
      - generate-sbom:
          context: sbomify
```

Define `TOKEN` in the `sbomify` context. CircleCI does not support OIDC trusted publishing - that is currently GitHub-only.

## Caching

```yaml
jobs:
  generate-sbom:
    docker:
      - image: ghcr.io/sbomify/sbomify-action
    environment:
      SBOMIFY_CACHE_DIR: /home/circleci/project/.sbomify-cache/sbomify
      SYFT_CACHE_DIR: /home/circleci/project/.sbomify-cache/syft
      LOCK_FILE: poetry.lock
      OUTPUT_FILE: sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"
    steps:
      - checkout
      - restore_cache:
          keys:
            - sbomify-cache-v1
      - run: sbomify-action
      - save_cache:
          key: sbomify-cache-v1
          paths:
            - .sbomify-cache
      - store_artifacts:
          path: sbom.cdx.json
```

Set `GITHUB_TOKEN` in your context as well. License databases are downloaded from GitHub Releases regardless of CI platform, and unauthenticated requests are capped at 60 per hour per IP. When that limit is hit, enrichment degrades silently rather than failing. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Versioning

```yaml
environment:
  COMPONENT_NAME: my-app
  COMPONENT_VERSION: << pipeline.git.tag >>
```

Use `<< pipeline.git.revision >>` for untagged builds. To tag a product release on tagged builds only:

```yaml
workflows:
  release:
    jobs:
      - generate-sbom:
          context: sbomify
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

## VCS information

Repository URL, commit SHA and branch or tag are detected automatically, read from the variables CircleCI sets in the job. Nothing to configure.

Detection landed after `v26.8.0`, so it is present on `master` and in any release tagged since. Older tags read the git checkout instead, which is still the fallback described below.

| Field         | Read from                                       |
| ------------- | ----------------------------------------------- |
| Repository    | `CIRCLE_REPOSITORY_URL`                         |
| Commit        | `CIRCLE_SHA1`                                   |
| Branch or tag | `CIRCLE_BRANCH`, or `CIRCLE_TAG` on a tag build |

`CIRCLE_REPOSITORY_URL` is the clone URL, which is SSH for most projects; it is normalised to a browsable URL. A commit link is added for github.com, gitlab.com and bitbucket.org, plus self-hosted GitHub and GitLab. Anything else gets the repository URL and the SHA without a link rather than a guessed one that 404s.

**Why the environment rather than `git`.** `checkout` leaves a detached HEAD, so the checkout can name a tag that happens to point at the commit but never the branch a build was triggered for. `CIRCLE_BRANCH` knows it.

**No URL is guessed from the project slug.** `CIRCLE_PROJECT_USERNAME` and `CIRCLE_PROJECT_REPONAME` name the owner and the repository but not the host, and CircleCI serves GitHub, Bitbucket and GitLab projects alike. A URL built from that pair would look plausible while pointing at the wrong forge, so it is not built.

### Falling back to the checkout

A job that never runs the `checkout` step - one building from a workspace attachment, say - gets no `CIRCLE_REPOSITORY_URL`. The action then reads the git checkout in the working directory, the behaviour CircleCI had before it became a platform of its own. That needs the `.git` directory to be present and the repository to have a remote; if neither path yields a repository URL, nothing is emitted rather than a partial claim.

CircleCI's default `working_directory` is the literal string `~/project`, and that unexpanded string is exactly what `CIRCLE_WORKING_DIRECTORY` contains. The action expands it before using it, so the fallback works on the default configuration rather than silently finding no repository.

### Overriding

Set the fields in `sbomify.json` when you want something other than what the job reports - an internal mirror rewritten to its public URL, for example:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

`sbomify.json` wins over detection. Writing `CIRCLE_REPOSITORY_URL`, `CIRCLE_SHA1` and `CIRCLE_BRANCH` into it from an earlier step is no longer necessary - those are exactly what the action reads for itself. Set `AUGMENT: "true"` when you are supplying other metadata alongside it. See [augmentation](/sbomify-action/augmentation/).

## Container images

Add `setup_remote_docker`:

```yaml
jobs:
  container-sbom:
    docker:
      - image: ghcr.io/sbomify/sbomify-action
    environment:
      DOCKER_IMAGE: my-app:latest
      OUTPUT_FILE: container-sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"
    steps:
      - checkout
      - setup_remote_docker
      - run: docker build -t my-app:latest .
      - run: sbomify-action
      - store_artifacts:
          path: container-sbom.cdx.json
```

## Monorepos

```yaml
environment:
  WORKING_DIR: packages/my-app
  LOCK_FILE: package-lock.json
```

For several components, use a job matrix with a parameter per component.

## Signing

Build provenance attestation is GitHub-specific. Use [cosign](/faq/how-do-i-sign-an-sbom/) instead.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Augmentation](/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/sbomify-action/advanced/) - caching, audit trail, troubleshooting
