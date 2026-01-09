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

### Using cdxgen

[cdxgen](https://github.com/CycloneDX/cdxgen) has excellent Go support:

```bash
# Install cdxgen
npm install -g @cyclonedx/cdxgen

# Generate SBOM
cdxgen -t go -o sbom.cdx.json

# Include deep analysis
cdxgen -t go --deep -o sbom.cdx.json
```

### Using Trivy

[Trivy](https://github.com/aquasecurity/trivy) can scan Go projects and binaries:

```bash
# From source
trivy fs --format cyclonedx --output sbom.cdx.json .

# From binary
trivy rootfs --format cyclonedx --output sbom.cdx.json ./mybinary
```

### Using Syft

[Syft](https://github.com/anchore/syft) supports Go modules and binaries:

```bash
# From source
syft . -o cyclonedx-json=sbom.cdx.json

# From binary
syft ./mybinary -o cyclonedx-json=sbom.cdx.json
```

### Using cyclonedx-gomod

The official CycloneDX Go tool:

```bash
go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest

# Generate SBOM from go.mod
cyclonedx-gomod mod -output sbom.cdx.json

# Generate SBOM from binary
cyclonedx-gomod bin -output sbom.cdx.json ./mybinary
```

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) handles Go projects:

```yaml
---
name: Generate SBOM for Go Project

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-go-component'
          LOCK_FILE: 'go.mod'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true
          UPLOAD: true
```

For projects using `go.sum`:

```yaml
env:
  LOCK_FILE: 'go.sum'
```

## GitLab and Other CI/CD

For GitLab CI:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/github-action:latest
  stage: build
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "go.mod"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
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
