---
layout: page
permalink: /guides/go/
title: "SBOM Generation Guide for Go - Go Modules"
description: "Learn how to generate Software Bill of Materials for Go projects. Complete guide with go.mod and go.sum examples, CycloneDX and SPDX output."
section: guides
---

## Source vs Build SBOMs

Go has one of the most straightforward dependency management systems thanks to Go Modules, introduced in Go 1.11. The distinction between source and build SBOMs in Go is important:

- **Source SBOMs** are generated from `go.mod` and `go.sum` files
- **Build SBOMs** are generated from the compiled binary using `go version -m`

Go's design philosophy of reproducible builds means these should be nearly identical, but there are edge cases (build tags, CGO dependencies) where they may differ.

## Lockfile Deep Dive

### go.mod

The `go.mod` file declares your module and its dependencies:

```go
module github.com/example/myapp

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/lib/pq v1.10.9
    go.uber.org/zap v1.26.0
)

require (
    // indirect dependencies
    github.com/bytedance/sonic v1.10.2 // indirect
    github.com/gabriel-vasile/mimetype v1.4.3 // indirect
)
```

**Key points:**

- Direct dependencies are listed under `require`
- Indirect dependencies are marked with `// indirect`
- The Go version specifies minimum language version

### go.sum

The `go.sum` file contains cryptographic checksums for each module version:

```
github.com/gin-gonic/gin v1.9.1 h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=
github.com/gin-gonic/gin v1.9.1/go.mod h1:hPrL7YrpYKXt5YId3A/Tnip5kqbEAP+KLuI3SUcPTeU=
github.com/lib/pq v1.10.9 h1:YXG7RB+JIjhP29X+OtkiDnYaXQwpS4JEWq7dtCCRUEw=
github.com/lib/pq v1.10.9/go.mod h1:AlVN5x4E4T544tWzH6hKfbfQvm3HdbOxrmggDNAPY9o=
```

Each entry has two lines:

1. Hash of the module contents (`h1:`)
2. Hash of the `go.mod` file

**Important:** Always commit both `go.mod` and `go.sum` to version control.

### The replace Directive

The `replace` directive allows you to substitute module paths:

```go
replace (
    github.com/old/module => github.com/new/module v1.0.0
    github.com/example/local => ../local-module
)
```

**SBOM implications:**

- Replaced modules should be reflected in the SBOM
- Local replacements (`../local-module`) won't have version information
- Some SBOM tools may not handle replacements correctly

### The exclude Directive

```go
exclude github.com/vulnerable/package v1.0.0
```

Excluded versions should not appear in your SBOM.

## Go's Reproducible Builds

Go excels at reproducible builds. The same source code with the same `go.mod`/`go.sum` produces the same binary. This means:

1. Source SBOMs from lockfiles should match build SBOMs from binaries
2. You can verify builds by comparing SBOMs
3. Signed attestations are meaningful

Extract dependency information from a compiled binary:

```bash
go version -m ./mybinary
```

Output:

```
./mybinary: go1.21.5
    path    github.com/example/myapp
    mod     github.com/example/myapp    (devel)
    dep     github.com/gin-gonic/gin    v1.9.1  h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=
    dep     github.com/lib/pq   v1.10.9 h1:YXG7RB+JIjhP29X+OtkiDnYaXQwpS4JEWq7dtCCRUEw=
```

## Vendoring

Go supports vendoring dependencies in a `vendor/` directory:

```bash
go mod vendor
```

This creates a `vendor/` directory with all dependencies. For SBOM generation:

- Vendored projects should generate the same SBOM as non-vendored
- Some tools analyze `vendor/` directly for additional accuracy
- The `vendor/modules.txt` file provides a manifest

## Private Modules

For private modules, ensure your SBOM tools can access them:

```bash
# Configure private module patterns
go env -w GOPRIVATE=github.com/mycompany/*

# Use .netrc for authentication
echo "machine github.com login USERNAME password TOKEN" >> ~/.netrc
```

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle]({{ site.url }}/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Go, sbomify uses **cdxgen** under the hood with fallback to Trivy and Syft.

**Standalone (no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    LOCK_FILE: go.mod
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-go-app
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
    LOCK_FILE: go.mod
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

The action supports both `go.mod` and `go.sum`.

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cdxgen:**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -t go -o sbom.cdx.json
```

**cyclonedx-gomod (Go-native):**

```bash
go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
cyclonedx-gomod mod -output sbom.cdx.json
```

**Trivy:**

```bash
trivy fs --format cyclonedx --output sbom.cdx.json .
```

**Syft:**

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: go.mod
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## CGO Dependencies

If your Go project uses CGO, you have additional considerations:

```go
// #cgo LDFLAGS: -lssl -lcrypto
// #include <openssl/ssl.h>
import "C"
```

CGO dependencies (system libraries) won't appear in `go.mod`. You may need to:

1. Document them manually using `ADDITIONAL_PACKAGES`
2. Use a tool that analyzes the binary's dynamic linking

```yaml
env:
  ADDITIONAL_PACKAGES: "openssl:1.1.1,libcrypto:1.1.1"
```

## Best Practices

1. **Always commit go.sum** - It contains the integrity hashes needed for verification
2. **Use specific versions** - Avoid pseudo-versions when possible
3. **Regularly run `go mod tidy`** - Keep dependencies clean
4. **Consider vendoring** - For reproducibility and offline builds
5. **Handle replace directives carefully** - Document local replacements
6. **Generate both source and binary SBOMs** - Compare for verification

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes additional Go-specific tools like CycloneDX Go and SPDX Golang libraries.
