---

url: /guides/ci-cd/
title: "SBOM Generation in CI/CD Pipelines - GitHub Actions, GitLab CI, Bitbucket"
description: "Learn how to automate SBOM generation in CI/CD pipelines. Complete guide with GitHub Actions, GitLab CI, Bitbucket Pipelines, and attestation examples."
section: guides
---

## Why Generate SBOMs in CI/CD?

Generating SBOMs in your CI/CD pipeline provides several advantages:

1. **Consistency** - Every build produces an SBOM with the same tools and configuration
2. **Automation** - No manual steps to forget
3. **Attestation** - Link SBOMs cryptographically to specific builds
4. **Compliance** - Automatically meet requirements like EO 14028
5. **Auditability** - Full traceability from source to deployed artifact

## GitHub Actions

### Basic SBOM Generation

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

```yaml
---
name: Generate SBOM

on:
  push:
    branches: [main]
  pull_request:

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: package-lock.json
          OUTPUT_FILE: sbom.cdx.json
          ENRICH: true
          UPLOAD: false

      - name: Upload SBOM as artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.cdx.json
```

### With sbomify Platform Upload

```yaml
- name: Generate and Upload SBOM
  uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

### GitHub Attestation (Recommended)

Use GitHub's built-in attestation for tamper-proof SBOMs:

```yaml
---
name: Build with SBOM Attestation

on:
  push:
    branches: [main]

permissions:
  contents: read
  id-token: write
  attestations: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build
        run: npm ci && npm run build

      - name: Generate SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: package-lock.json
          OUTPUT_FILE: sbom.cdx.json
          COMPONENT_NAME: my-app
          COMPONENT_VERSION: ${{ github.sha }}
          ENRICH: true
          UPLOAD: false

      - name: Attest SBOM
        uses: actions/attest-sbom@v1
        with:
          subject-path: './dist'
          sbom-path: './sbom.cdx.json'
```

### Docker Image with SBOM

```yaml
---
name: Build and Push Container with SBOM

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write
  attestations: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        id: build
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          sbom: true
          provenance: true

      - name: Generate additional SBOM
        uses: sbomify/github-action@master
        env:
          DOCKER_IMAGE: ghcr.io/${{ github.repository }}:${{ github.sha }}
          OUTPUT_FILE: container-sbom.cdx.json
          COMPONENT_NAME: ${{ github.repository }}
          COMPONENT_VERSION: ${{ github.sha }}
          ENRICH: true
          UPLOAD: false
```

## GitLab CI

### Basic GitLab SBOM Generation

```yaml
stages:
  - build
  - sbom

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

generate-sbom:
  stage: sbom
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-app
    COMPONENT_VERSION: $CI_COMMIT_TAG
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
    reports:
      cyclonedx: sbom.cdx.json
```

### GitLab with Dependency Scanning Integration

```yaml
include:
  - template: Security/Dependency-Scanning.gitlab-ci.yml

generate-sbom:
  stage: test
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: gl-sbom-report.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - gl-sbom-report.cdx.json
    reports:
      cyclonedx: gl-sbom-report.cdx.json
```

### GitLab Container Scanning with SBOM

```yaml
container-sbom:
  stage: sbom
  image: sbomifyhub/sbomify-action
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: "/certs"
    DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    OUTPUT_FILE: container-sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - container-sbom.cdx.json
```

## Bitbucket Pipelines

### Basic Bitbucket SBOM Generation

```yaml
image: node:20

pipelines:
  default:
    - step:
        name: Build
        script:
          - npm ci
          - npm run build
        artifacts:
          - dist/**

    - step:
        name: Generate SBOM
        script:
          - pipe: docker://sbomifyhub/sbomify-action:latest
            variables:
              LOCK_FILE: package-lock.json
              OUTPUT_FILE: sbom.cdx.json
              COMPONENT_NAME: my-app
              COMPONENT_VERSION: $BITBUCKET_TAG
              UPLOAD: "false"
              ENRICH: "true"
        artifacts:
          - sbom.cdx.json
```

For rolling releases, use `$BITBUCKET_COMMIT` instead of `$BITBUCKET_TAG`. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

### Bitbucket with Upload

```yaml
pipelines:
  default:
    - step:
        name: Generate and Upload SBOM
        script:
          - pipe: docker://sbomifyhub/sbomify-action:latest
            variables:
              TOKEN: $SBOMIFY_TOKEN
              COMPONENT_ID: my-component
              LOCK_FILE: package-lock.json
              OUTPUT_FILE: sbom.cdx.json
              ENRICH: "true"
```

## Jenkins

### Jenkins Pipeline with SBOM

```groovy
pipeline {
    agent {
        docker {
            image 'sbomifyhub/sbomify-action'
        }
    }

    environment {
        LOCK_FILE = 'package-lock.json'
        OUTPUT_FILE = 'sbom.cdx.json'
        COMPONENT_NAME = 'my-app'
        COMPONENT_VERSION = "${env.GIT_TAG_NAME ?: env.GIT_COMMIT}"
        UPLOAD = 'false'
        ENRICH = 'true'
    }

    stages {
        stage('Generate SBOM') {
            steps {
                sh '/sbomify.sh'
            }
        }

        stage('Archive SBOM') {
            steps {
                archiveArtifacts artifacts: 'sbom.cdx.json'
            }
        }
    }
}
```

### Jenkins with Credentials

```groovy
pipeline {
    agent any

    stages {
        stage('Generate SBOM') {
            steps {
                withCredentials([string(credentialsId: 'sbomify-token', variable: 'TOKEN')]) {
                    docker.image('sbomifyhub/sbomify-action').inside {
                        sh '''
                            export COMPONENT_ID="my-component"
                            export LOCK_FILE="package-lock.json"
                            export OUTPUT_FILE="sbom.cdx.json"
                            export ENRICH="true"
                            export UPLOAD="true"
                            /sbomify.sh
                        '''
                    }
                }
            }
        }
    }
}
```

## CircleCI

### CircleCI SBOM Generation

```yaml
version: 2.1

jobs:
  generate-sbom:
    docker:
      - image: sbomifyhub/sbomify-action
    steps:
      - checkout
      - run:
          name: Generate SBOM
          environment:
            LOCK_FILE: package-lock.json
            OUTPUT_FILE: sbom.cdx.json
            COMPONENT_NAME: my-app
            COMPONENT_VERSION: << pipeline.git.tag >>
            UPLOAD: "false"
            ENRICH: "true"
          command: /sbomify.sh
      - store_artifacts:
          path: sbom.cdx.json

workflows:
  build-and-sbom:
    jobs:
      - generate-sbom
```

## Azure DevOps

### Azure Pipelines SBOM Generation

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - checkout: self

  - task: Docker@2
    displayName: 'Generate SBOM'
    inputs:
      command: 'run'
      arguments: |
        -v $(Build.SourcesDirectory):/workspace
        -w /workspace
        -e LOCK_FILE=package-lock.json
        -e OUTPUT_FILE=sbom.cdx.json
        -e COMPONENT_NAME=my-app
        -e COMPONENT_VERSION=$(Build.SourceVersion)
        -e UPLOAD=false
        -e ENRICH=true
        sbomifyhub/sbomify-action

  - publish: $(Build.SourcesDirectory)/sbom.cdx.json
    artifact: sbom
```

## Uploading to Dependency-Track

Integrate with OWASP Dependency-Track:

```yaml
# GitHub Actions example
- name: Generate SBOM
  uses: sbomify/github-action@master
  env:
    LOCK_FILE: package-lock.json
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true
    UPLOAD: false

- name: Upload to Dependency-Track
  run: |
    curl -X "POST" "https://dtrack.example.com/api/v1/bom" \
      -H "X-Api-Key: ${{ secrets.DTRACK_API_KEY }}" \
      -H "Content-Type: multipart/form-data" \
      -F "project=${{ secrets.DTRACK_PROJECT_UUID }}" \
      -F "bom=@sbom.cdx.json"
```

## Multiple Language Projects

For projects with multiple lockfiles:

```yaml
---
name: Generate Multiple SBOMs

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - name: frontend
            lock_file: frontend/package-lock.json
          - name: backend
            lock_file: backend/requirements.txt
          - name: api
            lock_file: api/go.mod
    steps:
      - uses: actions/checkout@v4

      - name: Generate SBOM for ${{ matrix.name }}
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: ${{ matrix.lock_file }}
          OUTPUT_FILE: 'sbom-${{ matrix.name }}.cdx.json'
          ENRICH: true

      - uses: actions/upload-artifact@v4
        with:
          name: sbom-${{ matrix.name }}
          path: sbom-${{ matrix.name }}.cdx.json
```

## Best Practices

1. **Generate on every build** - SBOMs should be artifacts of your CI/CD pipeline
2. **Store as build artifacts** - Keep SBOMs alongside your build outputs
3. **Use attestations** - Cryptographically link SBOMs to builds
4. **Version your SBOMs** - Include build numbers or commit hashes
5. **Fail on errors** - Don't ship if SBOM generation fails
6. **Scan immediately** - Integrate vulnerability scanning with SBOM generation
7. **Centralize storage** - Upload to platforms like sbomify for management

## Troubleshooting

### Common Issues

**SBOM generation fails in CI:**

- Ensure all dependencies are installed (`npm ci`, `pip install`, etc.)
- Check that lockfiles are committed to the repository

**Missing dependencies:**

- Use `--frozen-lockfile` or equivalent to ensure lockfile is respected
- Verify the correct lockfile path

**Authentication issues:**

- For private registries, configure credentials in CI secrets
- Use service accounts with minimal permissions

## Further Reading

Related blog posts:

- [GitHub Action module with Attestation](/2024/10/31/github-action-update-and-attestation/) - SLSA build provenance attestation for SBOMs
- [sbomify GitHub Action v0.3.0: Now Faster and Compatible with GitLab!](/2024/11/12/gitlab-support/) - GitLab CI/CD support and performance improvements

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes tools for SBOM generation, distribution, and analysis across all supported languages.
