---
title: "How do I generate an SBOM?"
description: "Step-by-step guide to generating your first SBOM using sbomify-action, open-source tools, and CI/CD integration."
answer: "The easiest way is with sbomify-action, which generates, enriches, and uploads SBOMs from your lockfiles or Docker images in CI/CD. You can also use standalone tools like Syft or Trivy."
tldr: "The easiest way is with sbomify-action, which generates, enriches, and uploads SBOMs from your lockfiles or Docker images in CI/CD. You can also use standalone tools like Syft or Trivy."
weight: 60
keywords: [generate SBOM, create SBOM, SBOM tools, SBOM generation, how to SBOM, sbomify-action]
url: /faq/how-do-i-generate-an-sbom/
---

## Recommended: sbomify-action

The [sbomify-action](https://github.com/sbomify/sbomify-action) is a CI/CD tool that generates, augments, enriches, and uploads SBOMs from your lockfiles or Docker images. It works as a GitHub Action, Docker image, or pip package, and includes SBOM generators (Trivy, Syft, cdxgen) pre-installed.

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: requirements.txt
    OUTPUT_FILE: sbom.cdx.json
    ENRICH: true
```

sbomify-action supports Python, Node, Rust, Go, Ruby, Dart, C++, Docker images, and Yocto/OpenEmbedded builds. It outputs both CycloneDX and SPDX formats.

Beyond basic generation, sbomify-action can:

- **Enrich** SBOMs with metadata from package registries (PyPI, npm, crates.io, etc.)
- **Augment** with business metadata (supplier, authors, licenses, lifecycle phase)
- **Inject** additional packages not in lockfiles (vendored code, system libraries)
- **Upload** to sbomify for collaboration and vulnerability management
- **Attest** with GitHub's build provenance

It also works with [GitLab CI and Bitbucket Pipelines](https://github.com/sbomify/sbomify-action#other-cicd-platforms). See our [CI/CD integration guide](/guides/ci-cd/) for details.

### Using Docker directly

The sbomify-action Docker image can be used standalone, without any CI platform:

```bash
docker run --rm \
  -v $(pwd):/github/workspace \
  -w /github/workspace \
  -e LOCK_FILE=/github/workspace/requirements.txt \
  -e OUTPUT_FILE=/github/workspace/sbom.cdx.json \
  -e UPLOAD=false \
  -e ENRICH=true \
  sbomifyhub/sbomify-action
```

This is useful for local development, scripted workflows, or CI systems that don't have a native sbomify-action integration.

## Standalone tools

If you prefer standalone tools outside of CI/CD, **Syft** and **Trivy** are popular options:

```bash
# Using Syft
syft . -o cyclonedx-json > sbom.cdx.json

# Using Trivy
trivy fs . --format cyclonedx --output sbom.cdx.json
```

For language-specific generators, see our [language guides](/guides/) covering Python, JavaScript, Java, Go, Rust, Docker, and more.

## See it in action

Watch our FOSDEM 2026 talk for a real-world walkthrough of CRA-ready SBOM generation using sbomify-action:

{{< video-embed-native video_url="https://video.fosdem.org/2026/ud2208/UYTGWA-sbom-generation.av1.webm" title="CRA-Ready SBOMs: A Practical Blueprint for High-Quality Generation" description="A four-phase SBOM generation model addressing the EU's Cyber Resilience Act requirements, covering authoring, augmenting, enriching, and signing SBOMs to exceed minimal compliance standards." >}}

## Next steps

Once you have your SBOM, [upload it to sbomify](https://app.sbomify.com) to monitor for vulnerabilities, track compliance, and share it with customers through your [Trust Center](https://trust.sbomify.com/).
