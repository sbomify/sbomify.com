---

url: /guides/sbomify-action/runtimes/azure-devops/
title: "SBOM Generation in Azure DevOps"
description: "Run the sbomify action in Azure Pipelines as a container job or Docker task, with variable groups, caching and manual VCS configuration."
keywords: ["Azure DevOps SBOM", "Azure Pipelines SBOM", "CycloneDX Azure"]
section: guides
tldr: "Run the container image as a container job, or invoke it with the Docker task. Set VCS details in sbomify.json, since Azure's variables are not auto-detected."
---

Azure Pipelines can run the container image either as a container job, which is cleaner, or through the Docker task.

## Container job

```yaml
trigger:
  - main

pool:
  vmImage: ubuntu-latest

container: ghcr.io/sbomify/sbomify-action

steps:
  - checkout: self

  - script: sbomify-action
    displayName: Generate SBOM
    env:
      LOCK_FILE: requirements.txt
      OUTPUT_FILE: sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"

  - publish: $(Build.SourcesDirectory)/sbom.cdx.json
    artifact: sbom
```

Every step in the job runs inside the container, so the working directory and mounted source are handled for you.

## Docker task

Useful when only one step needs the container:

```yaml
steps:
  - task: Docker@2
    displayName: Generate SBOM
    inputs:
      command: run
      arguments: >
        -v $(Build.SourcesDirectory):/github/workspace
        -w /github/workspace
        -e LOCK_FILE=requirements.txt
        -e OUTPUT_FILE=sbom.cdx.json
        -e ENRICH=true
        -e UPLOAD=false
        ghcr.io/sbomify/sbomify-action
```

## Uploading to sbomify

Store the token in a variable group backed by Azure Key Vault, or as a secret pipeline variable.

```yaml
variables:
  - group: sbomify

steps:
  - script: sbomify-action
    displayName: Generate and upload SBOM
    env:
      TOKEN: $(SBOMIFY_TOKEN)
      COMPONENT_ID: your-component-id
      LOCK_FILE: requirements.txt
      AUGMENT: "true"
      ENRICH: "true"
```

Secret variables are not exposed to the process environment automatically, so mapping it explicitly under `env:` as above is required.

Azure DevOps does not support OIDC trusted publishing - that is currently GitHub-only.

## Versioning

```yaml
env:
  COMPONENT_NAME: my-app
  COMPONENT_VERSION: $(Build.SourceVersion)
```

For tagged builds, `$(Build.SourceBranchName)` gives the tag when the trigger is a tag push. To tag a product release:

```yaml
- script: sbomify-action
  condition: startsWith(variables['Build.SourceBranch'], 'refs/tags/')
  env:
    TOKEN: $(SBOMIFY_TOKEN)
    COMPONENT_ID: your-component-id
    LOCK_FILE: requirements.txt
    COMPONENT_VERSION: $(Build.SourceBranchName)
    PRODUCT_RELEASE: '["your-product-id:$(Build.SourceBranchName)"]'
    AUGMENT: "true"
    ENRICH: "true"
```

## Caching

```yaml
steps:
  - task: Cache@2
    inputs:
      key: 'sbomify | "$(Agent.OS)"'
      path: $(Build.SourcesDirectory)/.sbomify-cache
    displayName: Cache sbomify data

  - script: sbomify-action
    env:
      SBOMIFY_CACHE_DIR: $(Build.SourcesDirectory)/.sbomify-cache/sbomify
      SYFT_CACHE_DIR: $(Build.SourcesDirectory)/.sbomify-cache/syft
      GITHUB_TOKEN: $(GITHUB_TOKEN)
      LOCK_FILE: requirements.txt
      OUTPUT_FILE: sbom.cdx.json
      ENRICH: "true"
      UPLOAD: "false"
```

Set `GITHUB_TOKEN` even though you are not on GitHub. License databases are downloaded from GitHub Releases whatever CI platform you use, and unauthenticated requests are capped at 60 per hour per IP - Microsoft-hosted agents share outbound addresses, so this limit is often already spent. When it is, enrichment degrades silently. See [license database rate limits](/guides/sbomify-action/enrichment/#license-database-rate-limits).

## VCS information

Azure DevOps does not expose repository details in the form the action auto-detects. Set them in `sbomify.json`, generated from the build variables:

```yaml
- script: |
    cat > sbomify.json <<EOF
    {
      "vcs_url": "$(Build.Repository.Uri)",
      "vcs_commit_sha": "$(Build.SourceVersion)",
      "vcs_ref": "$(Build.SourceBranchName)",
      "supplier": {"name": "My Company"},
      "lifecycle_phase": "build"
    }
    EOF
  displayName: Write SBOM metadata
```

Then set `AUGMENT: "true"`. See [augmentation](/guides/sbomify-action/augmentation/).

## Container images

```yaml
steps:
  - task: Docker@2
    inputs:
      command: build
      repository: my-app
      tags: $(Build.BuildId)

  - task: Docker@2
    displayName: Generate container SBOM
    inputs:
      command: run
      arguments: >
        -v /var/run/docker.sock:/var/run/docker.sock
        -v $(Build.SourcesDirectory):/github/workspace
        -w /github/workspace
        -e DOCKER_IMAGE=my-app:$(Build.BuildId)
        -e OUTPUT_FILE=container-sbom.cdx.json
        -e ENRICH=true
        -e UPLOAD=false
        ghcr.io/sbomify/sbomify-action
```

## Monorepos

```yaml
env:
  WORKING_DIR: packages/my-app
  LOCK_FILE: package-lock.json
```

For several components, use a matrix strategy with one entry per component.

## Signing

Build provenance attestation is GitHub-specific. Use [cosign](/faq/how-do-i-sign-an-sbom/), which works on any platform.

## Next steps

- [Configuration reference](/guides/sbomify-action/configuration/) - every option
- [Augmentation](/guides/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/guides/sbomify-action/advanced/) - caching, audit trail, troubleshooting
