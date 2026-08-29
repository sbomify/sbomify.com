---

url: /guides/sbomify-action/runtimes/gitlab-ci/
title: "SBOM Generation in GitLab CI"
description: "Run the sbomify action in GitLab CI using the container image, with caching, dependency scanning integration and self-managed instance support."
keywords: ["GitLab CI SBOM", "GitLab dependency scanning", "CycloneDX GitLab", "SBOM pipeline"]
section: guides
tldr: "Use ghcr.io/sbomify/sbomify-action as the job image and run sbomify-action. VCS information is detected automatically, including on self-managed instances."
---

GitLab CI runs the container image directly as the job image. Configuration goes in `variables:`, and the command is `sbomify-action`.

## Minimal example

```yaml
generate-sbom:
  stage: test
  image: ghcr.io/sbomify/sbomify-action
  variables:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: "true"
    UPLOAD: "false"
  script:
    - sbomify-action
  artifacts:
    paths:
      - sbom.cdx.json
```

Boolean values must be quoted - GitLab CI variables are strings.

> If you have an older pipeline calling `/sbomify.sh`, update it. That entrypoint no longer exists; the command is `sbomify-action`.

## Feeding GitLab's dependency scanning

GitLab natively understands CycloneDX reports, so the SBOM can populate the dependency list in the UI:

```yaml
generate-sbom:
  stage: test
  image: ghcr.io/sbomify/sbomify-action
  variables:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: gl-sbom-report.cdx.json
    ENRICH: "true"
    UPLOAD: "false"
  script:
    - sbomify-action
  artifacts:
    reports:
      cyclonedx: gl-sbom-report.cdx.json
```

Because the SBOM is enriched, the dependency list shows licenses and suppliers that a plain scan would leave blank.

## Uploading to sbomify

GitLab CI does not support OIDC trusted publishing yet, so use an API token stored as a masked, protected CI/CD variable.

```yaml
generate-sbom:
  stage: test
  image: ghcr.io/sbomify/sbomify-action
  variables:
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    AUGMENT: "true"
    ENRICH: "true"
  script:
    - sbomify-action
```

Set `TOKEN` under Settings, CI/CD, Variables. Mark it **Masked** so it is hidden in job logs, and **Protected** if only protected branches should upload.

## Caching

```yaml
generate-sbom:
  image: ghcr.io/sbomify/sbomify-action
  cache:
    key: sbomify-cache
    paths:
      - .sbomify-cache/
  variables:
    SBOMIFY_CACHE_DIR: "${CI_PROJECT_DIR}/.sbomify-cache/sbomify"
    SYFT_CACHE_DIR: "${CI_PROJECT_DIR}/.sbomify-cache/syft"
    LOCK_FILE: poetry.lock
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: "true"
    UPLOAD: "false"
  script:
    - sbomify-action
```

**Set `GITHUB_TOKEN` as well.** License databases are downloaded from GitHub Releases regardless of which CI platform you use, and unauthenticated requests are capped at 60 per hour per IP - a limit shared runners routinely hit. When it is exceeded, enrichment degrades silently. Any GitHub token with public read scope will do. See [license database rate limits](/guides/sbomify-action/enrichment/#license-database-rate-limits).

## Container images

Scanning an image needs a Docker daemon:

```yaml
container-sbom:
  stage: test
  image: ghcr.io/sbomify/sbomify-action
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: "/certs"
    DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    OUTPUT_FILE: container-sbom.cdx.json
    ENRICH: "true"
    UPLOAD: "false"
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    - docker pull "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  script:
    - sbomify-action
  artifacts:
    paths:
      - container-sbom.cdx.json
```

## Tagging releases

```yaml
release-sbom:
  stage: deploy
  image: ghcr.io/sbomify/sbomify-action
  rules:
    - if: $CI_COMMIT_TAG
  variables:
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    COMPONENT_VERSION: "$CI_COMMIT_TAG"
    PRODUCT_RELEASE: '["your-product-id:$CI_COMMIT_TAG"]'
    AUGMENT: "true"
    ENRICH: "true"
  script:
    - sbomify-action
```

## VCS detection

Automatic. Project URL, commit SHA and ref name are read from `CI_PROJECT_URL`, `CI_COMMIT_SHA` and `CI_COMMIT_REF_NAME`, and **self-managed instances are supported** - the server URL is taken from `CI_SERVER_URL` rather than assumed.

To override, for example when your external URL differs from the internal one, set `vcs_url` in [`sbomify.json`](/guides/sbomify-action/augmentation/).

## Monorepos

```yaml
variables:
  WORKING_DIR: packages/my-app
  LOCK_FILE: package-lock.json
```

Or run several jobs with a matrix:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/sbomify-action
  parallel:
    matrix:
      - NAME: frontend
        LOCK_FILE: frontend/package-lock.json
      - NAME: backend
        LOCK_FILE: backend/requirements.txt
  variables:
    OUTPUT_FILE: "sbom-$NAME.cdx.json"
    ENRICH: "true"
    UPLOAD: "false"
  script:
    - sbomify-action
  artifacts:
    paths:
      - "sbom-$NAME.cdx.json"
```

## Signing

Build provenance attestation is GitHub-specific. On GitLab, sign with [cosign](/faq/how-do-i-sign-an-sbom/), which works anywhere and supports keyless signing via GitLab's OIDC provider.

## Next steps

- [Configuration reference](/guides/sbomify-action/configuration/) - every option
- [Publishing](/guides/sbomify-action/publishing/) - tokens, releases, Dependency Track
- [Advanced](/guides/sbomify-action/advanced/) - caching, audit trail, troubleshooting
