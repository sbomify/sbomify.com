---

url: /sbomify-action/enrichment/
aliases:
  - /guides/sbomify-action/enrichment/
title: "Enrichment: Filling In Component Metadata"
description: "How the sbomify action enriches every component with licenses, suppliers, descriptions and hashes from package registries, distro license databases and lifecycle data."
keywords: ["SBOM enrichment", "SBOM license data", "package metadata", "component hash", "end of life data"]
section: sbomify-action
tldr: "Scanners find packages but leave licenses and suppliers empty. Enrichment queries package registries, pre-computed distro license databases and lifecycle data to fill those gaps, and pulls integrity hashes straight from your lockfile."
---

Turn it on with `ENRICH: true`. No account required.

## The problem it solves

Generators are built to detect dependencies, not to describe them. A typical scanner component looks like this:

```json
{
  "type": "library",
  "name": "django",
  "version": "5.1",
  "purl": "pkg:pypi/django@5.1"
}
```

Accurate, and nearly useless for compliance. After enrichment:

```json
{
  "type": "library",
  "name": "django",
  "version": "5.1",
  "purl": "pkg:pypi/django@5.1",
  "publisher": "Django Software Foundation",
  "description": "A high-level Python web framework...",
  "licenses": [{"expression": "BSD-3-Clause"}],
  "externalReferences": [
    {"type": "website", "url": "https://www.djangoproject.com/"},
    {"type": "vcs", "url": "https://github.com/django/django"},
    {"type": "distribution", "url": "https://pypi.org/project/Django/"}
  ]
}
```

## What gets added

| Field                 | Typical coverage                  |
| --------------------- | --------------------------------- |
| Supplier or publisher | High on major registries          |
| License               | High - most registries require it |
| Description           | High                              |
| Homepage              | Medium to high                    |
| Repository            | Medium to high                    |
| Download URL          | High                              |
| Issue tracker         | Medium                            |

Coverage varies by ecosystem. Popular packages on PyPI, npm and crates.io have excellent metadata. Obscure or private packages may gain nothing.

## Data sources

| Source         | Ecosystems                                                                 | Provides                                           |
| -------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| License DB     | Alpine, Wolfi, Debian, Ubuntu, Rocky, Alma, CentOS, Fedora, Amazon Linux   | License, description, supplier, homepage           |
| Lifecycle      | Python, PHP, Go, Rust, Django, Rails, Laravel, React, Vue, and OS packages | Release date, end of support, end of life          |
| PyPI           | Python                                                                     | License, author, homepage                          |
| crates.io      | Rust                                                                       | License, author, homepage, repository, description |
| pub.dev        | Dart                                                                       | License, author, homepage, repository              |
| Conan Center   | C and C++                                                                  | License, author, homepage, repository, description |
| Debian Sources | Debian                                                                     | Maintainer, description, homepage                  |
| deps.dev       | Python, npm, Maven, Go, Ruby, NuGet                                        | License, homepage, repository                      |
| ecosyste.ms    | All major ecosystems                                                       | License, description, maintainer                   |
| ClearlyDefined | Python, npm, Cargo, Maven, Ruby, NuGet, Go                                 | License, homepage, repository                      |
| Repology       | Linux distros                                                              | License, homepage                                  |

ClearlyDefined is queried through [clearly-cached](https://github.com/sbomify/clearly-cached), a caching front end run at `https://clearly-cached.sbomify.com`. It retries the transient upstream failures that would otherwise be recorded as "this package has no licence", and returns a roughly 0.4 KB projection instead of a definition that can run to 190 KB. Point `SBOMIFY_CLEARLY_CACHED_URL` at your own instance if you prefer. If the service is unreachable or failing, enrichment stops consulting it for the rest of the run and continues with the other sources.

### Priority order

Sources are tried in order and stop at the first that answers. Native registries rank above aggregators, which rank above general fallbacks.

| Ecosystem           | Primary        | Fallbacks                             |
| ------------------- | -------------- | ------------------------------------- |
| Python              | PyPI           | deps.dev, ecosyste.ms, ClearlyDefined |
| JavaScript          | deps.dev       | ecosyste.ms, ClearlyDefined           |
| Rust                | crates.io      | deps.dev, ecosyste.ms, ClearlyDefined |
| Go                  | deps.dev       | ecosyste.ms, ClearlyDefined           |
| Ruby                | deps.dev       | ecosyste.ms, ClearlyDefined           |
| Java and Maven      | deps.dev       | ecosyste.ms, ClearlyDefined           |
| NuGet               | deps.dev       | ecosyste.ms, ClearlyDefined           |
| Dart                | pub.dev        | ecosyste.ms                           |
| C and C++           | Conan Center   | ecosyste.ms                           |
| Debian              | Debian Sources | Repology, ecosyste.ms                 |
| Other Linux distros | License DB     | Repology, ecosyste.ms                 |

## Linux distro license databases

Container SBOMs are mostly operating system packages, and those are exactly the packages public aggregators handle worst. Pre-computed license databases are built from official distro sources - Alpine's APKINDEX, Debian and Ubuntu apt repositories, RPM repositories - and normalised into validated SPDX license expressions.

| Distro       | Versions            |
| ------------ | ------------------- |
| Alpine       | 3.13 - 3.21         |
| Wolfi        | rolling             |
| Debian       | 11, 12, 13          |
| Ubuntu       | 20.04, 22.04, 24.04 |
| Rocky Linux  | 8, 9                |
| AlmaLinux    | 8, 9                |
| CentOS       | Stream 8, Stream 9  |
| Fedora       | 39 - 42             |
| Amazon Linux | 2, 2023             |

They are regenerated on every release, downloaded on demand, and cached locally at `~/.cache/sbomify/license-db` (or wherever `SBOMIFY_CACHE_DIR` points). Expect 20-50 MB.

### License database rate limits

Databases are downloaded from GitHub Releases. Unauthenticated requests are limited to **60 per hour per IP address**, and shared CI runners frequently have that budget already spent by someone else.

When the limit is hit, **enrichment degrades silently**. You get an SBOM with fewer licenses populated, and no error to tell you why.

The fix is to pass a token, which raises the limit to 5,000 per hour:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This applies on **every runtime**, not just GitHub Actions - it is GitHub's API being called regardless of where you run. On GitLab, Jenkins or anywhere else, set `GITHUB_TOKEN` (or `GH_TOKEN`) to any GitHub personal access token with public read scope.

If enrichment coverage looks lower than expected, check this first.

## Lifecycle data

Components are annotated with [Common Lifecycle Enumeration](/compliance/cle/) dates - general availability, end of support, end of life - so downstream tools can flag software running on unsupported foundations.

**Operating systems**: Debian 10-12, Ubuntu 20.04/22.04/24.04, Alpine 3.13-3.21, Rocky 8-9, AlmaLinux 8-9, CentOS Stream 8-9, Fedora 39-42, Amazon Linux 2 and 2023.

**Runtimes and frameworks**:

| Package | Tracked versions | Matched on       |
| ------- | ---------------- | ---------------- |
| Python  | 2.7, 3.10 - 3.14 | Any package type |
| PHP     | 7.4, 8.0 - 8.5   | Any package type |
| Go      | 1.22 - 1.25      | Any package type |
| Rust    | 1.90 - 1.92      | Any package type |
| Django  | 4.2, 5.2, 6.0    | PyPI only        |
| Rails   | 7.0 - 8.1        | RubyGems only    |
| Laravel | 10 - 13          | Composer only    |
| React   | 17 - 19          | npm only         |
| Vue     | 2, 3             | npm only         |

Version cycles are derived from the full version, so `3.12.7` matches the `3.12` cycle. Dates are written as CycloneDX properties:

```json
{
  "type": "operating-system",
  "name": "debian",
  "version": "12.12",
  "properties": [
    {"name": "cdx:lifecycle:milestone:generalAvailability", "value": "2023-06-10"},
    {"name": "cdx:lifecycle:milestone:endOfSupport", "value": "2026-06-11"},
    {"name": "cdx:lifecycle:milestone:endOfLife", "value": "2028-06-30"}
  ]
}
```

Note that ordinary distro packages - curl, nginx, openssl - do not receive lifecycle data. Only the operating system itself and the tracked runtimes and frameworks above do.

## Integrity hashes

Hashes are extracted directly from your lockfile and attached to matching components. This runs locally with no network access, and never overwrites hashes that are already present.

| Ecosystem  | Lockfiles                                          |
| ---------- | -------------------------------------------------- |
| Python     | `poetry.lock`, `Pipfile.lock`, `uv.lock`           |
| JavaScript | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Rust       | `Cargo.lock`                                       |
| Dart       | `pubspec.lock`                                     |

Component hashes are a [CISA 2025](/compliance/cisa-minimum-elements/) expectation, and most generators do not populate them. They are what lets someone verify that the component you documented is the component you shipped - the same property that makes the whole [chain of custody](/sbomify-action/why/#the-part-most-platforms-get-wrong) work at the component level rather than just the document level.

## Transitive dependency discovery

Some lockfiles record only direct dependencies. Where possible, the installed environment is inspected to find transitive dependencies the generator missed, and they are added to the SBOM.

This currently covers Python via `pipdeptree`. Discovered packages are logged, and on GitHub Actions appear in a collapsible group.

It only works if the dependencies are actually installed. If you generate an SBOM in a clean checkout without installing anything first, you will see:

```text
No transitive dependencies discovered (packages may not be installed, or all deps are direct)
```

That is informational, not an error, and it never fails a build. To get the most out of it, install your dependencies before generating.

## Limitations

Worth knowing before you rely on it:

- **Network access is required.** Enrichment calls external APIs, so it is not suitable for air-gapped builds. Generation and augmentation still work offline; run with `ENRICH: false`, and set `SBOMIFY_FETCH_RUNTIMES=0` so the [tool runtimes](/sbomify-action/advanced/#tool-runtimes) are not fetched either.
- **Responses are cached** on disk between runs. Disable with `SBOMIFY_ENRICHMENT_CACHE=0`, or change the lifetime with `SBOMIFY_ENRICHMENT_CACHE_TTL`.
- **Rate limits apply.** Very large dependency trees, in the region of a thousand packages or more, may enrich slowly. Caching and backoff help, but the ceiling is real.
- **It is best effort.** Private packages, vendored code and obscure libraries are not in any public registry, so nothing will be found for them. Declare what you know about those through [augmentation](/sbomify-action/augmentation/) instead.
- **Results are not deterministic.** Registry data changes over time, so the same input can produce slightly different output on different days. This is the trade-off for richer data. Every value that was added is recorded in the [audit trail](/sbomify-action/advanced/#audit-trail) along with the source it came from, so any given SBOM remains fully explainable even though it is not reproducible byte-for-byte.

## Caching

Persisting the cache between runs is worth doing - it avoids re-downloading license databases on every build. See [caching](/sbomify-action/advanced/#caching) for per-runtime recipes.
