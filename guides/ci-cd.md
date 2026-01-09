---
layout: page
permalink: /guides/ci-cd/
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

Using the [sbomify GitHub Action](https://github.com/sbomify/github-action/):

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
          LOCK_FILE: 'package-lock.json'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true

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
    COMPONENT_ID: 'my-component'
    LOCK_FILE: 'package-lock.json'
    OUTPUT_FILE: 'sbom.cdx.json'
    AUGMENT: true
    ENRICH: true
    UPLOAD: true
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
          LOCK_FILE: 'package-lock.json'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true

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
          DOCKER_IMAGE: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          OUTPUT_FILE: 'container-sbom.cdx.json'
          ENRICH: true
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
  image: ghcr.io/sbomify/github-action:latest
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "package-lock.json"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
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
  image: ghcr.io/sbomify/github-action:latest
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "package-lock.json"
    OUTPUT_FILE: "gl-sbom-report.cdx.json"
    ENRICH: "true"
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
  image: ghcr.io/sbomify/github-action:latest
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  script:
    - /entrypoint.sh
  variables:
    DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    OUTPUT_FILE: "container-sbom.cdx.json"
    ENRICH: "true"
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
        image: ghcr.io/sbomify/github-action:latest
        script:
          - export LOCK_FILE="package-lock.json"
          - export OUTPUT_FILE="sbom.cdx.json"
          - export ENRICH="true"
          - /entrypoint.sh
        artifacts:
          - sbom.cdx.json
```

### Bitbucket with Upload

```yaml
pipelines:
  default:
    - step:
        name: Generate and Upload SBOM
        image: ghcr.io/sbomify/github-action:latest
        script:
          - export TOKEN="$SBOMIFY_TOKEN"
          - export COMPONENT_ID="my-component"
          - export LOCK_FILE="package-lock.json"
          - export OUTPUT_FILE="sbom.cdx.json"
          - export ENRICH="true"
          - export UPLOAD="true"
          - /entrypoint.sh
```

## Jenkins

### Jenkins Pipeline with SBOM

```groovy
pipeline {
    agent {
        docker {
            image 'ghcr.io/sbomify/github-action:latest'
        }
    }

    environment {
        LOCK_FILE = 'package-lock.json'
        OUTPUT_FILE = 'sbom.cdx.json'
        ENRICH = 'true'
    }

    stages {
        stage('Generate SBOM') {
            steps {
                sh '/entrypoint.sh'
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
                    docker.image('ghcr.io/sbomify/github-action:latest').inside {
                        sh '''
                            export COMPONENT_ID="my-component"
                            export LOCK_FILE="package-lock.json"
                            export OUTPUT_FILE="sbom.cdx.json"
                            export ENRICH="true"
                            export UPLOAD="true"
                            /entrypoint.sh
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
      - image: ghcr.io/sbomify/github-action:latest
    steps:
      - checkout
      - run:
          name: Generate SBOM
          environment:
            LOCK_FILE: package-lock.json
            OUTPUT_FILE: sbom.cdx.json
            ENRICH: "true"
          command: /entrypoint.sh
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
        -e ENRICH=true
        ghcr.io/sbomify/github-action:latest
        /entrypoint.sh

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
    LOCK_FILE: 'package-lock.json'
    OUTPUT_FILE: 'sbom.cdx.json'
    ENRICH: true

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
- [GitHub Action module with Attestation]({{ site.url }}/2024/10/31/github-action-update-and-attestation/) - SLSA build provenance attestation for SBOMs
- [sbomify GitHub Action v0.3.0: Now Faster and Compatible with GitLab!]({{ site.url }}/2024/11/12/gitlab-support/) - GitLab CI/CD support and performance improvements

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes tools for SBOM generation, distribution, and analysis across all supported languages.
