---

url: /sbomify-action/runtimes/bitbucket/
aliases:
  - /guides/sbomify-action/runtimes/bitbucket/
title: "SBOM Generation in Bitbucket Pipelines"
description: "Run the sbomify action in Bitbucket Pipelines using a Docker pipe, with caching, container scanning and automatic VCS detection."
keywords: ["Bitbucket Pipelines SBOM", "Bitbucket pipe", "CycloneDX Bitbucket"]
section: sbomify-action
tldr: "Run the container image as a Docker pipe. VCS information is detected automatically from Bitbucket's environment variables."
---

Bitbucket Pipelines runs the container image through its Docker pipe mechanism.

## Minimal example

```yaml
image: node:20

pipelines:
  default:
    - step:
        name: Build
        script:
          - npm ci
        artifacts:
          - node_modules/**

    - step:
        name: Generate SBOM
        script:
          - pipe: docker://ghcr.io/sbomify/sbomify-action:latest
            variables:
              LOCK_FILE: package-lock.json
              OUTPUT_FILE: sbom.cdx.json
              ENRICH: "true"
              UPLOAD: "false"
        artifacts:
          - sbom.cdx.json
```

Quote boolean values - pipe variables are strings.

## Uploading to sbomify

Bitbucket does not support OIDC trusted publishing yet, so use an API token stored as a secured repository variable.

```yaml
- step:
    name: Generate and upload SBOM
    script:
      - pipe: docker://ghcr.io/sbomify/sbomify-action:latest
        variables:
          TOKEN: $SBOMIFY_TOKEN
          COMPONENT_ID: your-component-id
          LOCK_FILE: package-lock.json
          AUGMENT: "true"
          ENRICH: "true"
```

Add `SBOMIFY_TOKEN` under Repository settings, Repository variables, and tick **Secured** so it is masked in logs.

## Versioning

Use `$BITBUCKET_TAG` for tagged releases and `$BITBUCKET_COMMIT` for rolling builds:

```yaml
variables:
  COMPONENT_NAME: my-app
  COMPONENT_VERSION: $BITBUCKET_TAG
```

A common pattern is a dedicated tag pipeline:

```yaml
pipelines:
  tags:
    'v*':
      - step:
          name: Release SBOM
          script:
            - pipe: docker://ghcr.io/sbomify/sbomify-action:latest
              variables:
                TOKEN: $SBOMIFY_TOKEN
                COMPONENT_ID: your-component-id
                LOCK_FILE: requirements.txt
                COMPONENT_VERSION: $BITBUCKET_TAG
                PRODUCT_RELEASE: '["your-product-id:$BITBUCKET_TAG"]'
                AUGMENT: "true"
                ENRICH: "true"
```

See [versioning SBOMs](/guides/how-to-version-sboms/).

## Caching

```yaml
pipelines:
  default:
    - step:
        name: Generate SBOM
        caches:
          - sbomify
        script:
          - pipe: docker://ghcr.io/sbomify/sbomify-action:latest
            variables:
              SBOMIFY_CACHE_DIR: "${BITBUCKET_CLONE_DIR}/.sbomify-cache/sbomify"
              SYFT_CACHE_DIR: "${BITBUCKET_CLONE_DIR}/.sbomify-cache/syft"
              GITHUB_TOKEN: $GITHUB_TOKEN
              LOCK_FILE: poetry.lock
              OUTPUT_FILE: sbom.cdx.json
              ENRICH: "true"
              UPLOAD: "false"

definitions:
  caches:
    sbomify: .sbomify-cache
```

`GITHUB_TOKEN` is worth setting even though you are not on GitHub. License databases are downloaded from GitHub Releases, and unauthenticated requests are capped at 60 per hour per IP - shared runners hit this regularly, and when they do enrichment degrades silently. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Container images

Enable the Docker service:

```yaml
- step:
    name: Container SBOM
    services:
      - docker
    script:
      - docker build -t my-app:$BITBUCKET_COMMIT .
      - pipe: docker://ghcr.io/sbomify/sbomify-action:latest
        variables:
          DOCKER_IMAGE: my-app:$BITBUCKET_COMMIT
          OUTPUT_FILE: container-sbom.cdx.json
          ENRICH: "true"
          UPLOAD: "false"
    artifacts:
      - container-sbom.cdx.json
```

## VCS detection

Automatic. Repository URL, commit SHA and branch or tag are read from `BITBUCKET_GIT_HTTP_ORIGIN`, `BITBUCKET_COMMIT`, `BITBUCKET_BRANCH` and `BITBUCKET_TAG`. Nothing to configure.

## Monorepos

```yaml
variables:
  WORKING_DIR: packages/my-app
  LOCK_FILE: package-lock.json
```

Or use parallel steps, one per component, each with its own `COMPONENT_ID`.

## Signing

Build provenance attestation is GitHub-specific. Sign with [cosign](/faq/how-do-i-sign-an-sbom/) instead - it works on any platform.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Publishing](/sbomify-action/publishing/) - tokens, releases, Dependency Track
- [Advanced](/sbomify-action/advanced/) - caching, audit trail, troubleshooting
