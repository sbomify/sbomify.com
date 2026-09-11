---

url: /guides/
title: "How to Generate an SBOM: Tools and Guides (2026)"
description: "Complete SBOM generation guide: how to generate an SBOM from a lockfile, container image or build system, which SBOM generation tools to use for each ecosystem, and how to automate it in CI/CD. Covers Syft, cdxgen, native ecosystem tools and sbomify-action, in CycloneDX and SPDX."
tldr: "Generate an SBOM from your lockfile, not your installed environment – the lockfile is what pins exact versions and hashes. Pick a tool that understands your ecosystem: Syft and cdxgen cover the widest range, native generators like cyclonedx-py handle a single language, and sbomify-action selects the right one for you and enriches the result. Run it in CI on every build so the SBOM matches the artefact you shipped. Output CycloneDX or SPDX – both are accepted by every major compliance framework."
---

Step-by-step guides for generating SBOMs across every major programming language and platform. New to SBOMs? Start with [What is an SBOM?](/what-is-sbom/) for the basics, or jump straight to your ecosystem below.

Generating a Software Bill of Materials is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). It is also the step that determines the quality of everything downstream: a vulnerability scan, a compliance attestation, and a customer-facing [Trust Center](/features/trust-center/) are all only as good as the SBOM they are built from.

<div class="cta-box">
  <p><strong>Just want a working pipeline?</strong> The setup wizard scans your repository, finds your lockfiles, and writes a ready-to-commit CI workflow.</p>
  <a href="/faq/how-do-i-use-the-sbomify-setup-wizard/" class="cta-button">Run the Setup Wizard</a>
</div>

---

## How to Generate an SBOM

Every SBOM generation workflow comes down to four decisions.

### 1. Choose your source: lockfile, image, or build system

This is the decision that matters most, and the easiest one to get wrong.

- **From a lockfile (recommended)** – `uv.lock`, `poetry.lock`, `package-lock.json`, `pnpm-lock.yaml`, `Cargo.lock`, `go.sum`, `gradle.lockfile`, `Gemfile.lock`. A good lockfile already pins an exact version for every transitive dependency, and in most ecosystems a cryptographic hash too, which is precisely what an SBOM needs. In CycloneDX terminology this is a _pre-build_ or _source_ SBOM. Not every ecosystem has one — Maven has no traditional lockfile, since versions in `pom.xml` can be ranges or inherited from parent POMs, which the [Java guide](/guides/java/) covers.
- **From an installed environment** – reading what the package manager actually installed. Useful when there is no usable lockfile, but the output inherits whatever the environment happens to contain.
- **From a container image** – scans the image filesystem. Essential for containerised delivery, with an important caveat covered in the [Docker guide](/guides/docker/): image scanning sees packages installed by a package manager, and can miss binaries copied in during a multi-stage build.
- **From a build system** – embedded build systems emit their own manifests. See the [Yocto guide](/guides/yocto/).

The general rule: **the SBOM is only as good as the lockfile.** A `requirements.txt` with version ranges and no hashes cannot produce an accurate source SBOM, because the exact version is genuinely unknown until install time. If your SBOM quality is disappointing, fix the lockfile before blaming the tool.

### 2. Choose a generation tool

There is no single best SBOM tool — the right one depends on your ecosystem.

| Tool                                              | Best for                  | Notes                                                                                                                                                                      |
| ------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Native ecosystem tools**                        | A single language         | `cyclonedx-py`, `cyclonedx-maven-plugin` and similar read their own lockfile format directly. Which tool fits which ecosystem is covered per-language in the guides below. |
| **[Syft](https://github.com/anchore/syft)**       | Breadth, container images | Handles many ecosystems and image formats from one binary.                                                                                                                 |
| **[cdxgen](https://github.com/CycloneDX/cdxgen)** | Breadth, monorepos        | Wide language coverage, CycloneDX-native.                                                                                                                                  |
| **[sbomify-action](/sbomify-action/)**            | CI/CD, and not choosing   | Bundles the above, selects the right generator for your ecosystem, then enriches and publishes the result in one step.                                                     |

A note on tool safety: we [no longer consider Trivy safe](/2026/03/26/trivy-compromise-hardening-sbomify-action/) following two successful supply chain attacks in March 2026, and have removed it from sbomify-action. SBOM tooling sits inside your build pipeline with access to your source and often your registry credentials — it deserves the same scrutiny as any other dependency.

### 3. Choose a format: CycloneDX or SPDX

Both are mature, both are accepted by every major compliance framework, and you do not need to pick a side permanently — see [converting between CycloneDX and SPDX](/faq/can-i-convert-between-cyclonedx-and-spdx/) and [which formats sbomify supports](/faq/what-sbom-formats-does-sbomify-support/). If you have no existing constraint, either is a safe default; the guides below use CycloneDX output in their examples.

### 4. Automate it in CI

An SBOM generated by hand is out of date the moment the next commit lands. Generate one on every build, from the same lockfile that produced the artefact, and attach it to the release. The [CI/CD integration guide](/guides/ci-cd/) covers why this belongs in the pipeline rather than in a quarterly checklist, and [runtimes](/sbomify-action/runtimes/) covers GitHub Actions, GitLab CI, Bitbucket, Jenkins, CircleCI, Travis CI, Azure DevOps and TeamCity.

Generation is also the right moment to [sign the SBOM](/faq/how-do-i-sign-an-sbom/), while you still have build-time provenance to sign with.

---

## Language Guides

- [Python](/guides/python/) - pip, Poetry, Pipenv, uv
- [JavaScript](/guides/javascript/) - npm, yarn, pnpm, Bun
- [Java](/guides/java/) - Maven, Gradle
- [Go (Golang)](/guides/go/) - Go Modules
- [Rust](/guides/rust/) - Cargo
- [Ruby](/guides/ruby/) - Bundler
- [PHP](/guides/php/) - Composer
- [.NET/C#](/guides/dotnet/) - NuGet
- [Swift](/guides/swift/) - Swift Package Manager
- [Dart/Flutter](/guides/dart/) - pub
- [Elixir](/guides/elixir/) - Mix
- [Scala](/guides/scala/) - sbt
- [C/C++](/guides/cpp/) - Conan, vcpkg

## Platform Guides

- [Docker and containers](/guides/docker/) - image SBOMs, multi-stage builds, distroless images
- [Terraform](/guides/terraform/)
- [Yocto](/guides/yocto/) - Embedded Linux
- [Raspberry Pi](/guides/raspberry-pi/) - rpi-image-gen
- [CI/CD Integration](/guides/ci-cd/) - Why SBOMs belong in your build pipeline

## General Guides

- [How to Version SBOMs](/guides/how-to-version-sboms/)

---

## The sbomify Action

The [sbomify action](/sbomify-action/) generates an SBOM from any of the lock files above, enriches it, and publishes it - in one step, on any CI platform. It covers 17 ecosystems plus Docker images, directory scans and Yocto builds, and outputs both CycloneDX and SPDX.

- [Full documentation](/sbomify-action/) - complete reference for generating SBOMs in any pipeline
- [Quick start](/sbomify-action/quickstart/) - Setup wizard and your first run
- [Why SBOM quality matters](/sbomify-action/why/) - scanners versus pipelines, and signing at origin
- [Configuration reference](/sbomify-action/configuration/) - Every option
- [Runtimes](/sbomify-action/runtimes/) - GitHub Actions, GitLab CI, Bitbucket, Jenkins, CircleCI, Travis CI, Azure DevOps, TeamCity and more

---

## After Generation

A generated SBOM is an input, not a deliverable. What usually follows:

- **Enrichment** - filling in licence, supplier and metadata the lockfile does not carry. See [enrichment](/sbomify-action/enrichment/) and [augmentation](/sbomify-action/augmentation/).
- **Vulnerability monitoring** - continuously, as new CVEs are published against components you already shipped.
- **Compliance** - mapping the SBOM to whichever framework applies to you. The [SBOM compliance guide](/compliance/) covers the CISA minimum elements, the [EU Cyber Resilience Act](/compliance/eu-cra/), [BSI TR-03183-2](/compliance/bsi-tr-03183/), NIS2, FDA and PCI DSS.
- **Distribution** - sharing with customers and auditors without emailing JSON around. See [share and collaborate](/share-and-collaborate/).

Worked examples of complete SBOMs are in [SBOM examples](/sbom-examples/), and [Zero to Hero](/zero-to-hero/) walks the whole path end to end.

## Additional Resources

Looking for more tools and resources? Check out our [SBOM Resources](/resources/) page for:

- SBOM generation tools (generic and language-specific)
- Assembly and enrichment tools
- Distribution and transportation solutions
- Analysis and vulnerability scanning tools
- Official SBOM documentation from CISA and NTIA
