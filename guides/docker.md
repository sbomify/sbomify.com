---
layout: page
permalink: /guides/docker/
title: "SBOM Generation Guide for Docker and Containers"
description: "Learn how to generate Software Bill of Materials for Docker images and containers. Complete guide with multi-stage builds, distroless images, and attestation examples."
section: guides
---

## Source vs Build SBOMs

Container SBOMs are fundamentally different from source code SBOMs. A container image includes:

- **Base image packages** - OS-level packages from Debian, Alpine, etc.
- **Application dependencies** - Your app's runtime dependencies
- **Build artifacts** - Compiled binaries, static files
- **System libraries** - Shared libraries your application links against

This means container SBOMs are primarily **build SBOMs** - they represent what's actually in the image, not what was declared in source files.

## Understanding Container Layers

Docker images consist of layers, each representing filesystem changes:

```dockerfile
FROM python:3.12-slim          # Layer 1: Base image (many packages)
WORKDIR /app                   # Layer 2: Metadata change
COPY requirements.txt .        # Layer 3: Add file
RUN pip install -r requirements.txt  # Layer 4: Install packages
COPY . .                       # Layer 5: Add application
CMD ["python", "app.py"]       # Layer 6: Metadata
```

SBOM tools analyze all layers to build a complete picture of the image contents.

## Base Image Selection

Your base image significantly impacts your SBOM:

| Base Image               | Typical Package Count | Use Case                |
| ------------------------ | --------------------- | ----------------------- |
| `ubuntu:24.04`           | ~100+ packages        | General purpose         |
| `debian:bookworm-slim`   | ~80+ packages         | Smaller general purpose |
| `alpine:3.19`            | ~15 packages          | Minimal Linux           |
| `gcr.io/distroless/base` | ~2 packages           | Ultra-minimal           |
| `scratch`                | 0 packages            | Static binaries only    |

### Distroless Images

Google's distroless images contain only your application and its runtime dependencies:

```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server

# Runtime stage
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /
CMD ["/server"]
```

Distroless SBOMs are much simpler but still include:

- Base distroless packages (glibc, etc.)
- Your application binary
- Any files you COPY into the image

## Multi-Stage Builds

Multi-stage builds separate build-time dependencies from runtime:

```dockerfile
# Stage 1: Build (not in final image)
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime (this is what gets scanned)
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Important:** SBOMs should be generated from the **final stage only**, not intermediate build stages.

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle]({{ site.url }}/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Docker images, sbomify uses **cdxgen** under the hood with fallback to Trivy and Syft. Use `DOCKER_IMAGE` instead of `LOCK_FILE`.

**Standalone (no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    DOCKER_IMAGE: ghcr.io/myorg/myapp:${%raw%}{{ github.sha }}{%endraw%}
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: myapp
    COMPONENT_VERSION: ${%raw%}{{ github.ref_name }}{%endraw%}
    ENRICH: true
    UPLOAD: false
```

The `DOCKER_IMAGE` references the image built in a previous step (typically tagged with the commit SHA), while `COMPONENT_VERSION` uses the git tag for semantic versioning. See our [SBOM versioning guide]({{ site.url }}/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
    COMPONENT_ID: my-component-id
    DOCKER_IMAGE: myapp:latest
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

For images in registries:

```yaml
DOCKER_IMAGE: ghcr.io/myorg/myapp:latest
```

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**Trivy:**

```bash
trivy image --format cyclonedx --output sbom.cdx.json myapp:latest
```

**Syft:**

```bash
syft myapp:latest -o cyclonedx-json=sbom.cdx.json
```

**cdxgen:**

```bash
cdxgen -t docker myapp:latest -o sbom.cdx.json
```

**Docker Scout:**

```bash
docker scout sbom myapp:latest --format cyclonedx > sbom.cdx.json
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  services:
    - docker:dind
  before_script:
    - docker build -t myapp:latest .
  variables:
    DOCKER_IMAGE: myapp:latest
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## Signing and Attestation

### Using Sigstore/Cosign

Sign your container images and attach SBOMs as attestations:

```bash
# Sign the image
cosign sign --key cosign.key myapp:latest

# Attach SBOM as attestation
cosign attest --key cosign.key --predicate sbom.cdx.json --type cyclonedx myapp:latest

# Verify attestation
cosign verify-attestation --key cosign.pub myapp:latest
```

### GitHub Container Registry Attestations

GitHub Actions can automatically generate and attach attestations:

```yaml
- name: Build and push with attestations
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/myorg/myapp:latest
    sbom: true
    provenance: true
```

## Combining Application and Container SBOMs

For complete visibility, combine your application SBOM with the container SBOM:

1. **Application SBOM** - From your lockfile (package-lock.json, go.mod, etc.)
2. **Container SBOM** - From the built image

```yaml
jobs:
  sbom:
    steps:
      - name: Generate Application SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: 'package-lock.json'
          OUTPUT_FILE: 'app-sbom.cdx.json'

      - name: Build and push image
        run: docker build -t myapp:latest --push .

      - name: Generate Container SBOM
        uses: sbomify/github-action@master
        env:
          DOCKER_IMAGE: 'myapp:latest'
          OUTPUT_FILE: 'container-sbom.cdx.json'
```

## Best Practices

1. **Use minimal base images** - Smaller images mean smaller attack surface and simpler SBOMs
2. **Multi-stage builds** - Keep build tools out of production images
3. **Pin base image digests** - Use `FROM nginx@sha256:...` for reproducibility
4. **Generate SBOMs in CI** - Automate SBOM generation on every build
5. **Attach as attestations** - Store SBOMs with the image in your registry
6. **Sign everything** - Use Cosign or Notary for image and attestation signing
7. **Scan before shipping** - Use SBOM-based vulnerability scanning in your pipeline

## Common Issues

### Missing Application Dependencies

If your container SBOM is missing application-level dependencies, the scanner may not recognize your package manager files. Ensure:

- Lockfiles are present in the final image
- Or generate a separate application SBOM before containerizing

### Large SBOMs from Base Images

If your SBOM is too large, consider:

- Using slimmer base images
- Using distroless images
- Filtering the SBOM to focus on your application dependencies

### Layer Caching Issues

When using BuildKit caching, ensure SBOM generation sees the final image state:

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
# ... rest of Dockerfile
```

## Further Reading

Related blog posts:

- [How to generate an SBOM from a Docker container]({{ site.url }}/2024/09/20/how-to-generate-an-sbom-from-a-container/) - Guide to using Syft, Trivy, and Docker Desktop, including best practices for separating container from application SBOMs
- [GitHub Action module with Attestation]({{ site.url }}/2024/10/31/github-action-update-and-attestation/) - SLSA build provenance attestation for Docker images

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes additional container-specific tools like bom from the Linux Foundation and Tern.
