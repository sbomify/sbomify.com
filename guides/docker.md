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

| Base Image | Typical Package Count | Use Case |
|------------|----------------------|----------|
| `ubuntu:24.04` | ~100+ packages | General purpose |
| `debian:bookworm-slim` | ~80+ packages | Smaller general purpose |
| `alpine:3.19` | ~15 packages | Minimal Linux |
| `gcr.io/distroless/base` | ~2 packages | Ultra-minimal |
| `scratch` | 0 packages | Static binaries only |

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

### Using Trivy (Recommended)

[Trivy](https://github.com/aquasecurity/trivy) excels at container scanning:

```bash
# Scan a local image
trivy image --format cyclonedx --output sbom.cdx.json myapp:latest

# Scan from a registry
trivy image --format cyclonedx --output sbom.cdx.json docker.io/library/nginx:latest

# Include SPDX format
trivy image --format spdx-json --output sbom.spdx.json myapp:latest
```

### Using Syft

[Syft](https://github.com/anchore/syft) from Anchore provides detailed container SBOMs:

```bash
# Scan a local image
syft myapp:latest -o cyclonedx-json=sbom.cdx.json

# Scan from registry
syft registry:docker.io/library/nginx:latest -o cyclonedx-json=sbom.cdx.json

# Include file metadata
syft myapp:latest -o cyclonedx-json=sbom.cdx.json --catalogers all
```

### Using cdxgen

[cdxgen](https://github.com/CycloneDX/cdxgen) supports container images:

```bash
cdxgen -t docker myapp:latest -o sbom.cdx.json
```

### Using Docker Scout

Docker's built-in SBOM generation:

```bash
# Generate SBOM
docker scout sbom myapp:latest --format cyclonedx > sbom.cdx.json

# Or using Docker BuildKit
docker buildx build --sbom=true -t myapp:latest .
```

### Using Buildkit SBOM Attestations

Modern Docker builds can embed SBOMs as attestations:

```bash
# Build with SBOM attestation
docker buildx build \
  --sbom=true \
  --provenance=true \
  -t myapp:latest \
  --push \
  .
```

This stores the SBOM alongside the image in the registry.

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) supports container images:

```yaml
---
name: Generate SBOM for Docker Image

on:
  push:
    branches: [main]

jobs:
  build-and-sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-container'
          DOCKER_IMAGE: 'myapp:${{ github.sha }}'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true
          UPLOAD: true
```

For images in registries:

```yaml
env:
  DOCKER_IMAGE: 'ghcr.io/myorg/myapp:latest'
```

## GitLab and Other CI/CD

For GitLab CI:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/github-action:latest
  stage: build
  services:
    - docker:dind
  before_script:
    - docker build -t myapp:latest .
  script:
    - /entrypoint.sh
  variables:
    DOCKER_IMAGE: "myapp:latest"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
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
