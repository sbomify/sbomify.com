---

url: /sbomify-action/how-it-works/
aliases:
  - /guides/sbomify-action/how-it-works/
title: "How the sbomify Action Works"
description: "The full sbomify-action pipeline, step by step: generation, package injection, transitive discovery, hash enrichment, augmentation, enrichment, validation and upload."
keywords: ["SBOM pipeline", "SBOM generation process", "SBOM enrichment", "transitive dependencies"]
section: sbomify-action
tldr: "One invocation runs an eight-stage pipeline: generate, inject, discover transitive dependencies, extract hashes, augment, enrich, validate, upload. Every stage records what it changed in the audit trail."
---

A single invocation runs a fixed pipeline. Understanding the stages makes the log output legible and explains where each field in your SBOM came from.

## The pipeline

```text
Input          LOCK_FILE, SBOM_FILE or DOCKER_IMAGE
  │
1 ├─ Generation .............. pick a generator, produce a base SBOM
  │
1b├─ Additional packages ..... inject PURLs the lockfile missed
  │
1.4├─ Transitive discovery ... find installed deps not in the lockfile
  │
1.5├─ Hash enrichment ........ pull integrity hashes from the lockfile
  │
2 ├─ Augmentation ............ add your organisational metadata
  │
3 ├─ Enrichment .............. add registry metadata per component
  │
4 ├─ Finalization ............ normalise, validate against schema
  │
5 ├─ Upload .................. sbomify, Dependency Track, or neither
  │
6 └─ Post-upload ............. tag product releases
```

## 1. Generation

One of `LOCK_FILE`, `SBOM_FILE`, `DOCKER_IMAGE` or `SOURCE_DIR` is required. If you pass `SBOM_FILE`, generation is skipped and your existing document is processed instead.

Generators are registered with a priority, and the highest-priority generator that supports your input wins. If it fails, the next one is tried automatically.

| Priority | Generator          | Ecosystems                                                                                 | Output                          |
| -------- | ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------- |
| 10       | `cyclonedx-py`     | Python                                                                                     | CycloneDX 1.2-1.7               |
| 10       | `cargo-cyclonedx`  | Rust                                                                                       | CycloneDX 1.3-1.5, SPDX 2.3     |
| 10       | `cyclonedx-gomod`  | Go                                                                                         | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-maven`  | Java (`pom.xml`)                                                                           | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-gradle` | Java (Gradle build scripts)                                                                | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-sbt`    | Scala                                                                                      | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `gradle-lockfile`  | Java (`gradle.lockfile`), read directly                                                    | CycloneDX 1.2-1.7, SPDX 2.2-2.3 |
| 20       | `cdxgen`           | JavaScript, Ruby, Dart, C++, PHP, .NET, Elixir, Clojure, and elsewhere no native tool wins | CycloneDX 1.4-1.7               |
| 35       | Syft               | Swift, Terraform, Haskell, Erlang, container images, directory scans                       | CycloneDX 1.2-1.6, SPDX 2.2-2.3 |

Native tools rank above generic scanners because they resolve dependencies the way the ecosystem itself does. Several emit SPDX directly rather than deferring to Syft. See [input sources](/sbomify-action/sources/) for the full routing logic.

Apart from `cyclonedx-py`, which ships with the CLI, the generators are not baked into the image - they are fetched on first use, digest-pinned and cached. See [tool runtimes](/sbomify-action/advanced/#tool-runtimes).

> Trivy was removed from the tool set after [compromised releases were published in March 2026](/2026/03/26/trivy-compromise-hardening-sbomify-action/). The remaining generators cover every supported ecosystem.

## 1b. Additional package injection

Packages that no lockfile knows about are injected here: vendored code, system libraries, binaries copied in during a Docker build. They come from `additional_packages.txt`, `ADDITIONAL_PACKAGES_FILE` or the inline `ADDITIONAL_PACKAGES` variable, and are merged and deduplicated.

Injected packages flow through every subsequent stage exactly like generated ones - they get augmented, enriched and validated the same way. See [input sources](/sbomify-action/sources/#additional-packages).

## 1.4. Transitive dependency discovery

Some lockfiles record only direct dependencies. This stage inspects the installed environment to find transitive dependencies the generator missed, and adds them.

Currently this covers Python via `pipdeptree`. Discovered PURLs are logged - on GitHub Actions they appear in a collapsible group.

**This stage only works if your dependencies are actually installed.** If you generate an SBOM without running `pip install` first, there is nothing to inspect, and you will see:

```text
No transitive dependencies discovered (packages may not be installed, or all deps are direct)
```

That message is informational. The stage never fails a build.

## 1.5. Hash enrichment

Integrity hashes are extracted from your lockfile and attached to the matching components. This is a local operation - no network involved - and existing hashes are never overwritten.

Supported lockfiles:

| Ecosystem  | Lockfiles                                          |
| ---------- | -------------------------------------------------- |
| Python     | `poetry.lock`, `Pipfile.lock`, `uv.lock`           |
| JavaScript | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Rust       | `Cargo.lock`                                       |
| Dart       | `pubspec.lock`                                     |

This matters for compliance: component hashes are a [CISA 2025](/compliance/cisa-minimum-elements/) expectation, and they are what lets someone verify that the component you documented is the component you shipped. Most scanners do not populate them.

## 2. Augmentation

Adds organisational metadata - supplier, authors, licenses, lifecycle phase, security contact, support dates - and VCS information detected from the CI environment.

Sources are consulted in priority order, and **local values always win**:

1. `sbomify.json` in your project root. No account needed.
2. The sbomify API, using metadata configured on your component. Requires an account.
3. CI environment providers, which contribute repository URL, commit SHA and branch automatically on GitHub Actions, GitLab CI and Bitbucket.

By default augmentation only fills empty fields. Set `OVERRIDE_SBOM_METADATA=true` to make it overwrite values the generator already produced.

Full field reference: [augmentation](/sbomify-action/augmentation/).

## 3. Enrichment

Queries package registries to fill in per-component metadata: license, supplier, description, homepage, repository, download and issue-tracker URLs.

Sources are tried in priority order per ecosystem, stopping at the first that answers. Native registries such as PyPI and crates.io rank above aggregators such as deps.dev and ecosyste.ms, which rank above fallbacks such as Repology. Linux distro packages are served from pre-computed license databases.

This is the only stage that requires network access, and the only one that makes runs non-deterministic - registry data changes over time, so the same input can produce slightly different output on different days.

Full source list, coverage expectations and limitations: [enrichment](/sbomify-action/enrichment/).

## 4. Finalization

PURLs are normalised, URLs validated, and stub components added where references would otherwise dangle. The result is validated against the CycloneDX or SPDX JSON schema before it is written. An SBOM that fails schema validation is not emitted.

`OUTPUT_FILE` is written here, along with `audit_trail.txt` beside it.

## 5. Upload

Skipped entirely when `UPLOAD=false`, which is the right setting if you only want a file on disk.

Destinations are set with `UPLOAD_DESTINATIONS` and can be combined:

- **sbomify** - the default. Requires `COMPONENT_ID` plus either a token or OIDC trusted publishing.
- **Dependency Track** - configured with `DTRACK_*` variables. CycloneDX only.

See [publishing](/sbomify-action/publishing/).

## 6. Post-upload

If `PRODUCT_RELEASE` is set, the uploaded SBOM is tagged against one or more product releases. Releases are created if they do not exist. A failure here logs a warning but does not fail the build, since the SBOM has already been stored.

## What gets recorded

Every stage writes to the audit trail. The summary table at the end of a run shows counts by category, and `audit_trail.txt` lists each individual change with a UTC timestamp and its source:

```text
## Enrichment
[2026-01-18T12:34:57Z] ENRICHMENT pkg:pypi/requests@2.31.0 license ADDED (source: pypi)
[2026-01-18T12:34:57Z] ENRICHMENT pkg:pypi/requests@2.31.0 description ADDED (source: pypi)
```

This is what makes the pipeline auditable: every field that is not straight from the generator is traceable to the stage and source that added it. Once you sign the output, that record is fixed - and because [sbomify never modifies uploaded artifacts](/sbomify-action/why/#the-part-most-platforms-get-wrong), it stays fixed.

See [the audit trail](/sbomify-action/advanced/#audit-trail) for the full format.
