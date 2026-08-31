---

url: /sbomify-action/runtimes/circleci/
aliases:
  - /guides/sbomify-action/runtimes/circleci/
title: "SBOM Generation in CircleCI"
description: "Run the sbomify action in CircleCI using the container image as a Docker executor, with caching, contexts and manual VCS configuration."
keywords: ["CircleCI SBOM", "CircleCI CycloneDX", "SBOM pipeline"]
section: sbomify-action
tldr: "Use the container image as the Docker executor and run sbomify-action. Set VCS details in sbomify.json, since CircleCI's variables are not auto-detected."
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

CircleCI does not expose repository details in the form the action auto-detects, so set them in `sbomify.json`:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

To fill these from the build, write the file in a step first:

```yaml
- run:
    name: Write SBOM metadata
    command: |
      cat > sbomify.json <<EOF
      {
        "vcs_url": "${CIRCLE_REPOSITORY_URL}",
        "vcs_commit_sha": "${CIRCLE_SHA1}",
        "vcs_ref": "${CIRCLE_BRANCH:-$CIRCLE_TAG}",
        "supplier": {"name": "My Company"},
        "lifecycle_phase": "build"
      }
      EOF
```

Then set `AUGMENT: "true"`. See [augmentation](/sbomify-action/augmentation/).

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
