---
layout: page
permalink: /guides/elixir/
title: "SBOM Generation Guide for Elixir - Mix"
description: "Learn how to generate Software Bill of Materials for Elixir projects. Complete guide with mix.lock examples, Hex packages, and umbrella applications."
section: guides
---

## Source vs Build SBOMs

Elixir's Mix build tool provides excellent dependency management through `mix.lock`. This makes source SBOM generation reliable.

- **Source SBOMs** are generated from `mix.lock`
- **Build SBOMs** can analyze compiled dependencies in `deps/` and `_build/`

For most Elixir projects, generating from `mix.lock` is preferred because it contains exact versions and content hashes from Hex.pm.

## Lockfile Deep Dive

### mix.exs (Manifest)

The `mix.exs` file declares your dependencies:

```elixir
defmodule MyApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :my_app,
      version: "1.0.0",
      elixir: "~> 1.16",
      deps: deps()
    ]
  end

  defp deps do
    [
      {:phoenix, "~> 1.7"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_sql, "~> 3.10"},
      {:postgrex, ">= 0.0.0"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.5"},

      # Dev/test dependencies
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false}
    ]
  end
end
```

### mix.lock

The `mix.lock` file contains resolved dependencies:

```elixir
%{
  "castore": {:hex, :castore, "1.0.4", "sha256hash...", [:mix], [], "hexpm", "checksum..."},
  "cowboy": {:hex, :cowboy, "2.10.0", "sha256hash...", [:make, :rebar3], [
    {:cowlib, "2.12.1", [hex: :cowlib, repo: "hexpm", optional: false]},
    {:ranch, "1.8.0", [hex: :ranch, repo: "hexpm", optional: false]}
  ], "hexpm", "checksum..."},
  "ecto": {:hex, :ecto, "3.11.1", "sha256hash...", [:mix], [
    {:decimal, "~> 2.0", [hex: :decimal, repo: "hexpm", optional: false]},
    {:jason, "~> 1.0", [hex: :jason, repo: "hexpm", optional: true]},
    {:telemetry, "~> 0.4 or ~> 1.0", [hex: :telemetry, repo: "hexpm", optional: false]}
  ], "hexpm", "checksum..."},
  "phoenix": {:hex, :phoenix, "1.7.10", "sha256hash...", [:mix], [
    {:castore, ">= 0.0.0", [hex: :castore, repo: "hexpm", optional: false]},
    {:jason, "~> 1.0", [hex: :jason, repo: "hexpm", optional: true]},
    {:phoenix_pubsub, "~> 2.1", [hex: :phoenix_pubsub, repo: "hexpm", optional: false]},
    {:phoenix_template, "~> 1.0", [hex: :phoenix_template, repo: "hexpm", optional: false]},
    {:plug, "~> 1.14", [hex: :plug, repo: "hexpm", optional: false]},
    {:plug_cowboy, "~> 2.6", [hex: :plug_cowboy, repo: "hexpm", optional: true]}
  ], "hexpm", "checksum..."},
}
```

Key information:

- **Package format**: `{:hex, :package_name, "version", "hash", build_tools, dependencies, "hexpm", "checksum"}`
- **Checksum**: SHA-256 hash for integrity verification
- **Dependencies**: Nested dependency specifications

## Hex Package Manager

Hex.pm is Elixir's package repository, similar to npm or RubyGems:

```bash
# Get dependencies
mix deps.get

# Update dependencies
mix deps.update --all

# Check for outdated packages
mix hex.outdated
```

## Umbrella Applications

Elixir umbrella projects contain multiple applications:

```
my_umbrella/
├── mix.exs
├── mix.lock           # Shared lockfile
├── apps/
│   ├── core/
│   │   ├── mix.exs
│   │   └── lib/
│   ├── web/
│   │   ├── mix.exs
│   │   └── lib/
│   └── worker/
│       ├── mix.exs
│       └── lib/
```

The root `mix.lock` contains dependencies for all applications.

### Umbrella mix.exs

```elixir
defmodule MyUmbrella.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "1.0.0",
      deps: deps()
    ]
  end

  defp deps do
    []  # Shared deps can go here
  end
end
```

## Development Dependencies

Elixir clearly separates dev/test dependencies:

```elixir
defp deps do
  [
    # Runtime dependencies
    {:phoenix, "~> 1.7"},

    # Dev only
    {:phoenix_live_reload, "~> 1.2", only: :dev},

    # Dev and test
    {:credo, "~> 1.7", only: [:dev, :test], runtime: false},

    # Test only
    {:mock, "~> 0.3.0", only: :test}
  ]
end
```

For production SBOMs, filter out `:dev` and `:test` dependencies.

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle]({{ site.url }}/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Elixir, sbomify uses **cdxgen** or **Syft** under the hood.

**Standalone (no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    LOCK_FILE: mix.lock
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-elixir-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide]({{ site.url }}/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: mix.lock
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cdxgen:**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -t elixir -o sbom.cdx.json
```

**Syft:**

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

**sbom (Elixir-native):**

```elixir
# Add to mix.exs
{:sbom, "~> 0.8", only: :dev, runtime: false}
```

```bash
mix sbom.cyclonedx
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: mix.lock
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## Handling Special Cases

### Git Dependencies

Dependencies from Git:

```elixir
{:my_dep, git: "https://github.com/example/my_dep.git", tag: "v1.0.0"}
```

In `mix.lock`:

```elixir
"my_dep": {:git, "https://github.com/example/my_dep.git", "abc123...", [tag: "v1.0.0"]}
```

### Path Dependencies

Local dependencies:

```elixir
{:shared, path: "../shared"}
```

These won't have Hex metadata and need manual documentation.

### Private Hex Repositories

For private Hex repos:

```elixir
{:private_dep, "~> 1.0", organization: "myorg"}
```

Configure authentication:

```bash
mix hex.organization auth myorg
```

### Override Dependencies

Forcing specific versions:

```elixir
defp deps do
  [
    {:phoenix, "~> 1.7"},
    {:plug, "~> 1.14", override: true}  # Force version
  ]
end
```

Overrides affect the final dependency tree captured in `mix.lock`.

## Native Dependencies (NIFs)

Elixir packages may include Native Implemented Functions (NIFs):

```elixir
{:rustler, "~> 0.30"},  # Rust NIFs
{:bcrypt_elixir, "~> 3.0"}  # C NIFs
```

These have native code dependencies not captured in `mix.lock`. Document them:

```yaml
env:
  ADDITIONAL_PACKAGES: "openssl:3.0,rust:1.75"
```

## Best Practices

1. **Always commit mix.lock** - Essential for reproducible builds
2. **Use exact versions for releases** - Pin versions in production
3. **Separate dev dependencies** - Use `only: :dev` and `only: :test`
4. **Check for vulnerabilities** - Use `mix hex.audit`
5. **Document NIFs** - Track native dependencies separately
6. **Update regularly** - Use `mix hex.outdated` to track updates

## Security Integration

```bash
# Audit dependencies for vulnerabilities
mix hex.audit

# Generate SBOM and audit in CI
mix deps.get
mix hex.audit --format json > audit.json
```

```yaml
- name: Security audit
  run: mix hex.audit

- name: Generate SBOM
  uses: sbomify/github-action@master
  env:
    LOCK_FILE: 'mix.lock'
    OUTPUT_FILE: 'sbom.cdx.json'
```

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes general SBOM utilities for generation, distribution, and analysis.
