---

url: /sbomify-action/
title: "sbomify Action: Generate SBOMs in your CI/CD pipeline"
description: "Generate Software Bills of Materials from your lockfiles, container images and source directories. 14 ecosystems, CycloneDX and SPDX, free and open source."
---

The sbomify Action generates a Software Bill of Materials as part of your build,
from what your build actually resolved. It runs as a GitHub Action, a Docker
image, or a Python package, and it is [open source on
GitHub](https://github.com/sbomify/sbomify-action).

```yaml
- uses: sbomify/sbomify-action@master
  env:
    COMPONENT_ID: your-component-id
    LOCK_FILE: poetry.lock
```

That is the whole integration. The SBOM is generated, enriched, and published to
your [trust center](/features/trust-center/).

## Native tooling, not a generic scanner

Point the action at a lock file and it uses that ecosystem's own tooling,
because a native resolver knows things a generic scanner has to infer. Maven
resolves a Maven project. Cargo resolves a Rust one. The result describes the
dependency graph your build produced, not a best guess at it.

| Ecosystem                         | Lock files                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------ |
| [Python](/guides/python/)         | `requirements.txt`, `poetry.lock`, `Pipfile.lock`, `uv.lock`, `pyproject.toml` |
| [JavaScript](/guides/javascript/) | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, `package.json` |
| [Java](/guides/java/)             | `pom.xml`, `build.gradle`, `build.gradle.kts`, `gradle.lockfile`               |
| [Go](/guides/go/)                 | `go.mod`, `go.sum`                                                             |
| [Rust](/guides/rust/)             | `Cargo.lock`                                                                   |
| [Ruby](/guides/ruby/)             | `Gemfile.lock`                                                                 |
| [PHP](/guides/php/)               | `composer.json`, `composer.lock`                                               |
| [.NET](/guides/dotnet/)           | `packages.lock.json`                                                           |
| [Swift](/guides/swift/)           | `Package.swift`, `Package.resolved`                                            |
| [Dart](/guides/dart/)             | `pubspec.lock`                                                                 |
| [Elixir](/guides/elixir/)         | `mix.lock`                                                                     |
| [Scala](/guides/scala/)           | `build.sbt`                                                                    |
| [C++](/guides/cpp/)               | `conan.lock`                                                                   |
| [Terraform](/guides/terraform/)   | `.terraform.lock.hcl`                                                          |

[Container images](/guides/docker/) and source directories are supported too, so
you can describe a built artifact as well as the source it came from. Output is
CycloneDX or SPDX, whichever your customers ask for.

## Enriched before it leaves your pipeline

A list of names and versions is not much use to the person who receives it. The
action fills in licence, supplier and lifecycle metadata from package registries,
and adds your own organisational metadata, so what arrives is a document someone
can act on.

Dependencies that no lock file mentions can be declared explicitly. Vendored
code, system libraries and runtime dependencies get listed alongside everything
else rather than quietly going missing.

## No long lived tokens in CI

Publishing uses OIDC trusted publishing, so your pipeline authenticates with a
short lived token minted for that run. There is no API key to store as a secret,
rotate, or leak in a log.

Build provenance is attested with GitHub Artifact Attestations, so the SBOM you
publish can be traced back to the workflow run that produced it.

## Where the SBOM goes

Publish to your sbomify [trust center](/features/trust-center/), send it to
Dependency-Track, or write it to a file and handle it yourself. Most teams do the
first, so that every release carries its own SBOM and customers can find it
without asking.

## Beyond GitHub

The same tool runs anywhere. Use the Docker image in GitLab CI or Bitbucket
Pipelines, or install it from PyPI and run it locally. See the [CI/CD
guide](/guides/ci-cd/) for configuration in each environment, and the
[Yocto](/guides/yocto/) and [Raspberry Pi](/guides/raspberry-pi/) guides for
embedded builds.

## Get started

The [zero to hero guide](/zero-to-hero/) walks through a first SBOM end to end.
For the full set of configuration options, see the [action on
GitHub](https://github.com/sbomify/sbomify-action).
