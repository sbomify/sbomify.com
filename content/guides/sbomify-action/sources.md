---

url: /guides/sbomify-action/sources/
title: "Input Sources: Lockfiles, Containers, Directories and Yocto"
description: "Every input the sbomify action accepts - 17 lockfile ecosystems, container images, directory scans, Chainguard SBOM reuse, Yocto builds, git submodules and manually declared packages."
keywords: ["SBOM lockfile support", "container SBOM", "Chainguard SBOM", "Yocto SBOM", "SOURCE_DIR", "SBOM formats"]
section: guides
tldr: "Point the action at a lockfile, a container image, a directory or an existing SBOM. It routes to the best generator for that ecosystem and falls back automatically. Prefer a lockfile wherever one exists."
---

Exactly one input source is required: `LOCK_FILE`, `SBOM_FILE`, `DOCKER_IMAGE` or `SOURCE_DIR`.

## Lockfiles

Set `LOCK_FILE` to the path of your lockfile. Seventeen ecosystems are supported.

| Language    | Recognised files                                                               |
| ----------- | ------------------------------------------------------------------------------ |
| Python      | `requirements.txt`, `poetry.lock`, `Pipfile.lock`, `uv.lock`, `pyproject.toml` |
| JavaScript  | `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock` |
| Java        | `pom.xml`, `build.gradle`, `build.gradle.kts`, `gradle.lockfile`               |
| Go          | `go.mod`, `go.sum`                                                             |
| Rust        | `Cargo.lock`                                                                   |
| Ruby        | `Gemfile.lock`                                                                 |
| PHP         | `composer.json`, `composer.lock`                                               |
| .NET and C# | `packages.lock.json`                                                           |
| Swift       | `Package.swift`, `Package.resolved`                                            |
| Dart        | `pubspec.lock`                                                                 |
| Elixir      | `mix.lock`                                                                     |
| Scala       | `build.sbt`                                                                    |
| C and C++   | `conan.lock`                                                                   |
| Terraform   | `.terraform.lock.hcl`                                                          |
| Haskell     | `stack.yaml.lock`, `stack.yaml`, `cabal.project.freeze`                        |
| Erlang      | `rebar.lock` (rebar3 projects)                                                 |
| Clojure     | `deps.edn`, `project.clj`                                                      |

For language-specific walkthroughs, see the [SBOM guides](/guides/).

### Manifests defer to lockfiles

Naming a _manifest_ that sits beside its lockfile reads the lockfile instead. `package.json` defers to `package-lock.json`, `pyproject.toml` to `poetry.lock`, `Package.swift` to `Package.resolved`.

This is deliberate: a manifest states version _ranges_, a lockfile states what was actually _resolved_. You get the more precise answer without having to know which file to point at.

### Which generator runs

Generators are registered with a priority. The highest-priority generator that supports your input runs first; if it fails or does not support the input, the next is tried automatically.

| Priority | Generator          | Ecosystems                                                                                                | Output formats                  |
| -------- | ------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 10       | `cyclonedx-py`     | Python                                                                                                    | CycloneDX 1.2-1.7               |
| 10       | `cargo-cyclonedx`  | Rust                                                                                                      | CycloneDX 1.3-1.5, SPDX 2.3     |
| 10       | `cyclonedx-gomod`  | Go                                                                                                        | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-maven`  | Java (`pom.xml`)                                                                                          | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-gradle` | Java (`build.gradle`, `build.gradle.kts`)                                                                 | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `cyclonedx-sbt`    | Scala (`build.sbt`)                                                                                       | CycloneDX 1.4-1.6, SPDX 2.3     |
| 10       | `gradle-lockfile`  | Java (`gradle.lockfile`), read directly with no Gradle run                                                | CycloneDX 1.2-1.7, SPDX 2.2-2.3 |
| 20       | `cdxgen`           | JavaScript, Ruby, Dart, C++, PHP, .NET, Elixir, Clojure, and Python, Go or Java where no native tool wins | CycloneDX 1.4-1.7               |
| 35       | Syft               | Swift, Terraform, Haskell, Erlang, container images, and SPDX wherever no native tool emits it            | CycloneDX 1.2-1.6, SPDX 2.2-2.3 |

The native generators at priority 10 resolve dependencies the way the ecosystem itself does, which is why they outrank the generic scanners. Several emit SPDX directly rather than leaving it to Syft.

In practice:

1. **Python** (`requirements.txt`, `poetry.lock`, `Pipfile.lock`) uses `cyclonedx-py`
2. **Rust** (`Cargo.lock`) uses `cargo-cyclonedx`
3. **Go** (`go.mod`, `go.sum`) uses `cyclonedx-gomod`
4. **Java** uses `cyclonedx-maven` for `pom.xml`, `cyclonedx-gradle` for Gradle build scripts, and reads `gradle.lockfile` directly
5. **Scala** (`build.sbt`) uses `cyclonedx-sbt`
6. **Everything else with a lockfile** uses `cdxgen`, then Syft
7. **Container images** use Syft, then `cdxgen`

> Trivy was removed from the tool set after [compromised releases were published in March 2026](/2026/03/26/trivy-compromise-hardening-sbomify-action/). The remaining generators cover every supported ecosystem.

### Where the generators come from

The generators are not baked into the container image. They are downloaded on first use, verified against a pinned digest, and cached - see [tool runtimes](/guides/sbomify-action/advanced/#tool-runtimes). This is why the image is small and why the same tool selection works identically under `uvx`.

## Container images

Set `DOCKER_IMAGE` instead of `LOCK_FILE`:

```yaml
env:
  DOCKER_IMAGE: my-app:latest
  OUTPUT_FILE: sbom.cdx.json
  ENRICH: true
  UPLOAD: false
```

The image must be pullable from the environment the action runs in. When the input is a container image, the lifecycle phase is automatically recorded as `post-build`.

### Chainguard images

If `DOCKER_IMAGE` points at a [Chainguard](https://www.chainguard.dev/) image, or an image built `FROM` one, the SBOM published by Chainguard is used instead of scanning. That produces a more accurate result, because it comes from the image publisher rather than from inference.

Detection works two ways, and needs no configuration:

1. **Direct Chainguard images** (`cgr.dev/chainguard/...`) are identified by reference and verified against the image config.
2. **Images built from Chainguard bases** are identified by parsing the BuildKit SLSA provenance attestations embedded in the image.

**Important limitation.** A Chainguard SBOM covers the packages in the Chainguard base image and nothing else. Your application binary, anything brought in with `COPY` or `ADD`, and artifacts pulled from other build stages with `COPY --from=...` will not appear. Declare those explicitly:

```yaml
env:
  DOCKER_IMAGE: my-org/my-app:latest
  ADDITIONAL_PACKAGES: "pkg:golang/github.com/my-org/my-app@1.2.3"
  OUTPUT_FILE: sbom.cdx.json
  UPLOAD: false
```

Chainguard detection needs `crane` and `cosign`, which are fetched automatically like the other tools.

## Directory scanning

`SOURCE_DIR` scans a whole tree with Syft rather than reading a manifest. **Treat it as a last resort** - point the action at a lockfile wherever one exists.

The two are different claims. A lockfile is the dependency graph its ecosystem _resolved_: every transitive dependency, at the exact version that would be installed, whether or not it is present on this machine. A directory is whatever happens to be _on disk_, catalogued by whatever Syft recognises. In practice a directory scan:

- **misses what is not installed** - dev and optional dependencies, anything pruned from a production install, anything the build has not fetched yet
- **misses what Syft does not recognise** - an unsupported ecosystem, a vendored tree with no manifest, a statically linked binary carrying no build metadata - and it does not tell you
- **reports whatever else is lying around** - build caches, test fixtures, a stale `node_modules`, a second copy of a toolchain
- **varies with the machine** - the same commit scanned on a different runner, or at a different point in the build, can produce a different SBOM

None of that is Syft doing badly. It is the difference between reading a declaration and inspecting a filesystem.

Use `SOURCE_DIR` for what no lockfile can describe: an unpacked release archive, a vendored dependency tree, a build output.

```yaml
env:
  SOURCE_DIR: dist/
  OUTPUT_FILE: sbom.cdx.json
  ENRICH: true
  UPLOAD: false
```

If a lockfile exists and you use `SOURCE_DIR` anyway, you are choosing a less complete and less reproducible SBOM.

## Existing SBOMs

Set `SBOM_FILE` to process a document you already have. Generation is skipped and the file goes straight into augmentation and enrichment. This is how you enrich an SBOM produced by another tool, or turn one you were handed into something compliance-ready.

## Git submodules

`SUBMODULE_PATH` treats the component as a git submodule pinned at that path. The pin is resolved to a version - an exact version tag if one matches, otherwise the short commit SHA - and the component's existing SBOM at that version is attached if one exists. If not, the SBOM is generated and uploaded.

This keeps a product SBOM pointing at the exact submodule revision your build used, without regenerating an SBOM that has already been published.

Requires `LOCK_FILE` and the `sbomify` upload destination.

## Additional packages

Lockfiles do not know about vendored code, system libraries, statically linked dependencies or binaries copied into a container. Declare those as [PURLs](https://github.com/package-url/purl-spec).

Injected packages flow through augmentation and enrichment exactly like generated ones.

### A file in your repository

If `additional_packages.txt` exists in the working directory it is picked up automatically:

```text
# Runtime dependencies not in the lockfile
pkg:pypi/requests@2.31.0
pkg:npm/lodash@4.17.21

# System libraries
pkg:deb/debian/openssl@3.0.11
```

One PURL per line. Lines starting with `#` are comments, and blank lines are ignored.

Use `ADDITIONAL_PACKAGES_FILE` for a different path.

### Inline

```yaml
env:
  LOCK_FILE: requirements.txt
  ADDITIONAL_PACKAGES: "pkg:pypi/requests@2.31.0,pkg:npm/lodash@4.17.21"
```

Comma or newline separated. If both a file and inline packages are supplied, they are merged and deduplicated.

### Building the list during the build

Because the convention file is read at run time, earlier steps can append to it:

```yaml
- name: Record the application binary
  run: echo "pkg:golang/github.com/my-org/my-app@1.2.3" >> additional_packages.txt

- uses: sbomify/sbomify-action@v26.8.0
  env:
    LOCK_FILE: go.mod
    # picked up automatically
```

### No lockfile at all

Set `LOCK_FILE: none` (or `SBOM_FILE: none`) to build an SBOM containing only the packages you declare:

```yaml
env:
  LOCK_FILE: none
  ADDITIONAL_PACKAGES: "pkg:pypi/requests@2.31.0,pkg:deb/debian/openssl@3.0.11"
  OUTPUT_FILE: sbom.cdx.json
  UPLOAD: false
```

At least one additional package must be configured, or there is nothing to put in the document.

## Yocto and OpenEmbedded

Yocto builds emit their own SPDX documents, so they get a dedicated subcommand rather than the normal pipeline. It extracts the archive, discovers the per-package SBOMs, creates the matching components in sbomify, uploads each one, and tags them all against a product release.

```bash
sbomify-action --token "$SBOMIFY_TOKEN" \
  yocto tmp/deploy/images/qemux86-64/core-image-base.rootfs.spdx.tar.zst \
  --release "my-product:1.0.0" \
  --enrich
```

| Option                      | Required | Description                                                            |
| --------------------------- | -------- | ---------------------------------------------------------------------- |
| archive path                | Yes      | Path to a `.spdx.tar.zst` or `.tar.gz` archive.                        |
| `--token`                   | Yes      | sbomify API token. Pass before the `yocto` subcommand, or set `TOKEN`. |
| `--release`                 | Yes      | Product release, as `product_id:version`.                              |
| `--augment`, `--no-augment` | No       | Run augmentation per SBOM. Off by default.                             |
| `--enrich`, `--no-enrich`   | No       | Run enrichment per SBOM. Off by default.                               |
| `--visibility`              | No       | Visibility for created components: `public`, `private` or `gated`.     |
| `--max-packages`            | No       | Cap how many package SBOMs are processed. Useful for testing.          |
| `--component-id`            | No       | Target component for SPDX 3 single-file uploads.                       |
| `--dry-run`                 | No       | Show what would happen without calling the API.                        |
| `--verbose`                 | No       | Verbose logging.                                                       |

Documents named `recipe-*` and `runtime-*` are skipped, since they describe build inputs rather than shipped packages. The archive is normally found at `tmp/deploy/images/{machine}/` in your build output.

See the [Yocto guide](/guides/yocto/) for the wider workflow.

## Output formats

| Format                     | Generate | Process |
| -------------------------- | -------- | ------- |
| CycloneDX 1.2 - 1.7 (JSON) | Yes      | Yes     |
| SPDX 2.2 and 2.3 (JSON)    | Yes      | Yes     |
| SPDX 3.0.1 (JSON-LD)       | No       | Yes     |

Set the format with `SBOM_FORMAT` and the version with `SPEC_VERSION`.

- **CycloneDX** is the default and emits 1.6 unless you ask for something else. The list starts at 1.2 because CycloneDX only gained a JSON representation in that version.
- **SPDX** is emitted natively where the ecosystem's own tool can (Maven, Gradle, sbt, Go, Cargo), and by Syft everywhere else. The default is 2.3; select 2.2 with `SPEC_VERSION=2.2`.
- **SPDX 3.0.1** cannot be generated - no generator emits it, and asking for it fails with `No generator found for input`. It is fully supported as _input_: pass an existing 3.0.1 document via `SBOM_FILE` and it will be parsed, augmented, enriched and written back as 3.0.1.

Every generated SBOM is validated against its JSON schema before it is written. A document that fails validation is not emitted.

## Non-SBOM artifacts

`BOM_TYPE` lets you upload related artifacts through the same tooling: `vex`, `cbom` or `hbom`. These are uploaded verbatim to sbomify - augmentation, enrichment, overrides and package injection are all skipped, and Dependency Track and product releases are rejected.

External VEX documents are detected by content: OpenVEX by its `@context`, and CSAF VEX by `document.category`. CycloneDX documents containing cryptographic assets are classified as `cbom` automatically. See [how VEX works in sbomify](/faq/how-do-i-use-vex/).
