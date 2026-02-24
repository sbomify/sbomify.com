---
title: "How do I generate an SBOM?"
description: "Step-by-step guide to generating your first SBOM using open-source tools for Python, JavaScript, Java, Go, Docker, and more."
answer: "You can generate an SBOM using open-source tools like Syft, Trivy, or language-specific generators (pip-audit, npm sbom, etc.). Most tools produce CycloneDX or SPDX output from your project's dependency files."
tldr: "You can generate an SBOM using open-source tools like Syft, Trivy, or language-specific generators (pip-audit, npm sbom, etc.). Most tools produce CycloneDX or SPDX output from your project's dependency files."
weight: 60
keywords: [generate SBOM, create SBOM, SBOM tools, SBOM generation, how to SBOM]
url: /faq/how-do-i-generate-an-sbom/
---

## Quick start

The fastest way to generate an SBOM is with a multi-ecosystem tool like **Syft** or **Trivy**:

```bash
# Using Syft (supports most languages and containers)
syft . -o cyclonedx-json > sbom.cdx.json

# Using Trivy (also does vulnerability scanning)
trivy fs . --format cyclonedx --output sbom.cdx.json
```

Both tools auto-detect your project type and produce a valid CycloneDX or SPDX document.

## Language-specific tools

For more control, use tools built for your ecosystem:

| Language   | Tool             | Command                                            |
| ---------- | ---------------- | -------------------------------------------------- |
| Python     | CycloneDX Python | `cyclonedx-py requirements`                        |
| JavaScript | npm              | `npm sbom --sbom-format cyclonedx`                 |
| Java       | CycloneDX Maven  | `mvn org.cyclonedx:cyclonedx-maven-plugin:makeBom` |
| Go         | CycloneDX Go     | `cyclonedx-gomod app`                              |
| Rust       | cargo-cyclonedx  | `cargo cyclonedx`                                  |
| Docker     | Syft             | `syft your-image:tag -o cyclonedx-json`            |

See our complete [language guides](/guides/) for detailed instructions for each ecosystem, including Poetry, Gradle, pnpm, and more.

## Integrating into CI/CD

The best practice is to generate SBOMs automatically in your CI/CD pipeline so they stay up to date with every release. Our [CI/CD integration guide](/guides/ci-cd/) covers GitHub Actions, GitLab CI, and Bitbucket Pipelines.

You can then upload the generated SBOM to sbomify using the [sbomify GitHub Action](https://github.com/sbomify/github-action) or our API:

```bash
# Upload to sbomify via CLI
curl -X POST https://app.sbomify.com/api/v1/sboms/ \
  -H "Authorization: Token YOUR_API_TOKEN" \
  -F "file=@sbom.cdx.json"
```

## What's in the output?

A generated SBOM typically includes:

- **Component names and versions** — Every library and package
- **Package URLs (purl)** — Unique identifiers for each component
- **Licenses** — Declared licenses for each dependency
- **Dependency tree** — How components relate to each other
- **Hashes** — Integrity checksums for verification

## Next steps

Once you have your SBOM, [upload it to sbomify](https://app.sbomify.com) to monitor for vulnerabilities, track compliance, and share it with customers through your Trust Center.
