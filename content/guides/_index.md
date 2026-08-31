---

url: /guides/
title: SBOM Guides
description: "Comprehensive guides for generating Software Bill of Materials across all major programming languages and platforms."
---

Step-by-step guides for generating SBOMs across all major programming languages and platforms. New to SBOMs? Start with [What is an SBOM?](/what-is-sbom/) to learn the basics. For a complete list of SBOM tools, see our [SBOM Resources](/resources/) page.

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
- [C/C++](/guides/cpp/) - Conan

## Platform Guides

- [Docker/Containers](/guides/docker/)
- [Terraform](/guides/terraform/)
- [Yocto](/guides/yocto/) - Embedded Linux
- [Raspberry Pi](/guides/raspberry-pi/) - rpi-image-gen
- [CI/CD Integration](/guides/ci-cd/) - Why SBOMs belong in your build pipeline

## The sbomify Action

The [sbomify action](/sbomify-action/) generates an SBOM from any of the lock files above, enriches it, and publishes it - in one step, on any CI platform.

- [Full documentation](/sbomify-action/) - complete reference for generating SBOMs in any pipeline
- [Quick start](/sbomify-action/quickstart/) - Setup wizard and your first run
- [Why SBOM quality matters](/sbomify-action/why/) - scanners versus pipelines, and signing at origin
- [Configuration reference](/sbomify-action/configuration/) - Every option
- [Runtimes](/sbomify-action/runtimes/) - GitHub Actions, GitLab CI, Bitbucket, Jenkins, CircleCI, Azure DevOps, TeamCity and more

## General Guides

- [How to Version SBOMs](/guides/how-to-version-sboms/)

## Additional Resources

Looking for more tools and resources? Check out our [SBOM Resources](/resources/) page for:

- SBOM generation tools (generic and language-specific)
- Assembly and enrichment tools
- Distribution and transportation solutions
- Analysis and vulnerability scanning tools
- Official SBOM documentation from CISA and NTIA
