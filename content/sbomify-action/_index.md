---

url: /sbomify-action/
aliases:
  - /guides/sbomify-action/
title: "sbomify Action: Generate Compliance-Grade SBOMs in Any CI Pipeline"
description: "Complete documentation for the sbomify action - a CLI shipped as a container that generates, augments and enriches SBOMs in GitHub Actions, GitLab CI, Bitbucket, Jenkins and any other pipeline."
keywords: ["sbomify action", "SBOM CI/CD", "SBOM automation", "CycloneDX", "SPDX", "GitHub Action SBOM", "GitLab SBOM"]
tldr: "sbomify-action is a CLI shipped as a container image that turns a lockfile into a compliance-grade SBOM inside your pipeline. It picks the right generator for your ecosystem, adds your business metadata, and enriches every component from package registries. It runs anywhere containers run - GitHub Actions is one runtime among several."
---

## What this is

`sbomify-action` is a **command-line tool shipped as a container image**. Point it at a lockfile, a Docker image or an existing SBOM, and it produces a complete, standards-ready SBOM in CycloneDX or SPDX format.

It ships as a GitHub Action, a container image and a Python package - but those are just delivery vehicles. The tool, its configuration and its behaviour are **identical on every runtime**. On anything other than GitHub Actions you pull the same container image and set the same environment variables. Learn it once, run it anywhere.

You do not need a sbomify account to use it. Generation, augmentation and enrichment all work standalone.

## Why not just run Trivy?

Because a scanner and an SBOM pipeline are different things.

A generator's job is **detection**. Trivy, Syft and cdxgen are all good at answering "what packages are in here?" - and they answer it with a name, a version and a PURL. Almost everything else is left empty: no supplier, no license, no description, no hashes. That is not a criticism of those tools; it is what they are built to do.

The problem is that the fields they leave empty are exactly the fields [NTIA](/compliance/ntia-minimum-elements/), [CISA](/compliance/cisa-minimum-elements/) and the [EU CRA](/compliance/eu-cra/) actually ask for. A raw scan is a dependency list. Compliance needs an SBOM.

`sbomify-action` wraps generation in three more steps:

<ul class="space-y-6">
{{< check-list-item title="Generate" description="Routes to the best generator for your ecosystem and falls back automatically if one fails. cyclonedx-py is the most accurate for Python, cargo-cyclonedx for Rust, cdxgen for Java and Gradle, Syft for container images. You never have to pick." >}}
{{< check-list-item title="Inject" description="Adds packages no lockfile knows about - vendored code, system libraries, binaries copied in during a Docker build." >}}
{{< check-list-item title="Augment" description="Adds your organisational metadata: supplier, authors, licenses, lifecycle phase, security contact, support dates. This is the information only you have." >}}
{{< check-list-item title="Enrich" description="Fills in per-component metadata from PyPI, crates.io, pub.dev, deps.dev, ecosyste.ms, Linux distro license databases and more - plus integrity hashes pulled straight from your lockfile." >}}
</ul>

The difference is measurable. On the seven fields the NTIA Minimum Elements require, a bare scanner typically populates a small fraction; the same SBOM after augmentation and enrichment populates all of them. See [how it works](/sbomify-action/how-it-works/) for the full pipeline, or our [comparison of SBOM generation tools](/2026/01/26/sbom-generation-tools-comparison/) for a look at the generators themselves.

## Generated in CI. Never touched again.

This is the part that matters most, and it is worth being precise about.

Everything `sbomify-action` does happens **inside your pipeline, at build time** - the one moment when the full build context actually exists. Every modification it makes is written to an [audit trail](/sbomify-action/advanced/#audit-trail) with UTC timestamps, so you can see exactly what was added and where it came from. You can then sign or attest the result **at origin**, before it goes anywhere.

**sbomify never modifies an artifact you upload.** The bytes that arrive are the bytes that are stored and later served. No server-side enrichment, no normalisation, no "improvement".

That is a deliberate design decision, and it exists to close a specific gap. If a platform rewrites your SBOM after ingestion, you have no way to audit what changed. Removing a vulnerable component and tidying up metadata are the same operation from the outside: a write you cannot inspect. At that point "this SBOM has no known vulnerabilities" stops being something you can verify and becomes something you have to take on faith - and an inconvenient CVE disappearing looks exactly like housekeeping.

Signing at origin collapses that ambiguity. Either the bytes still match what your pipeline produced and signed, or they do not. Anyone can check, including an auditor who does not trust either of us.

It also has a practical consequence: because the artifact is never altered, **the signature stays valid**. Platforms that modify after ingestion either invalidate your signature or re-sign with their own key - which breaks the chain of custody and moves the trust anchor from you to them.

> **One clarification, so this is not overstated.** This guarantee covers artifacts you _upload_. sbomify does create genuinely new artifacts on your behalf - aggregate product-level SBOMs, VEX and VDR documents, derived compliance reports. Those are new creations, clearly distinguished from your uploads, not edits to them. If you distribute them with the same guarantees, sign them yourself.

Related: [how to sign an SBOM](/faq/how-do-i-sign-an-sbom/) and [OIDC trusted publishing](/faq/how-do-i-set-up-oidc-trusted-publishing/).

## Runtime support

The core tool behaves identically everywhere. What differs is how you invoke it, how you authenticate, and how much the runtime tells it about your build.

| Runtime                                                    | Integration     | Auth          | VCS auto-detect | Wizard             | Attestation |
| ---------------------------------------------------------- | --------------- | ------------- | --------------- | ------------------ | ----------- |
| [GitHub Actions](/sbomify-action/runtimes/github-actions/) | Native action   | OIDC or token | Yes             | Generates workflow | Yes         |
| [GitLab CI](/sbomify-action/runtimes/gitlab-ci/)           | Container image | Token         | Yes             | No                 | No          |
| [Bitbucket](/sbomify-action/runtimes/bitbucket/)           | Container image | Token         | Yes             | No                 | No          |
| [Jenkins](/sbomify-action/runtimes/jenkins/)               | Container image | Token         | Manual          | No                 | No          |
| [CircleCI](/sbomify-action/runtimes/circleci/)             | Container image | Token         | Manual          | No                 | No          |
| [Azure DevOps](/sbomify-action/runtimes/azure-devops/)     | Container image | Token         | Manual          | No                 | No          |
| [Any container runner](/sbomify-action/runtimes/docker/)   | Container image | Token         | Manual          | No                 | No          |
| [TeamCity](/sbomify-action/runtimes/teamcity/)             | Container image | Token         | Git roots       | No                 | No          |
| [Local machine](/sbomify-action/runtimes/local/)           | `uvx` or `pipx` | Token         | Manual          | Yes                | No          |

**Manual** means the runtime does not expose enough environment information for automatic detection, so you set `vcs_url`, `vcs_commit_sha` and `vcs_ref` in [`sbomify.json`](/sbomify-action/augmentation/) instead. Everything else works the same.

**Git roots** means TeamCity, which is VCS-agnostic: detection runs only when the repository URL positively identifies Git, and stays silent otherwise rather than recording a Subversion revision as if it were a commit. See [TeamCity](/sbomify-action/runtimes/teamcity/#vcs-information).

OIDC trusted publishing and build provenance attestation are GitHub-only today because they depend on GitHub-issued identity tokens. Support for other runtimes will follow as those platforms expose equivalent primitives.

## Documentation

**Start here**

- [Quick start](/sbomify-action/quickstart/) - the setup wizard, and your first pipeline run
- [Why SBOM quality matters](/sbomify-action/why/) - the long-form case, and how the output maps to NTIA, CISA and CRA
- [How it works](/sbomify-action/how-it-works/) - the full pipeline, step by step

**Reference**

- [Configuration](/sbomify-action/configuration/) - every input, environment variable and CLI flag
- [Input sources](/sbomify-action/sources/) - lockfiles, container images, Yocto, additional packages
- [Augmentation](/sbomify-action/augmentation/) - your business metadata via `sbomify.json`
- [Enrichment](/sbomify-action/enrichment/) - registry metadata, license databases, lifecycle data, hashes
- [Publishing](/sbomify-action/publishing/) - uploading, releases, Dependency Track
- [Advanced](/sbomify-action/advanced/) - attestation, audit trail, caching, telemetry, troubleshooting

**Per-runtime guides**

- [All runtimes](/sbomify-action/runtimes/) - pick your CI platform

## Where the code lives

| Channel                  | Location                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Source and GitHub Action | [`sbomify/sbomify-action`](https://github.com/sbomify/sbomify-action) |
| Container image          | `ghcr.io/sbomify/sbomify-action`                                      |
| Python package           | [`sbomify-action`](https://pypi.org/project/sbomify-action/)          |

There is one source repository and one image. Every runtime other than GitHub Actions pulls that image directly - there is no separate integration to install or keep in sync.

The project is Apache-2.0 licensed. Security issues go to <security@sbomify.com>.
