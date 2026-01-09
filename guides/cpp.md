---
layout: page
permalink: /guides/cpp/
title: "SBOM Generation Guide for C/C++ - Conan"
description: "Learn how to generate Software Bill of Materials for C/C++ projects. Complete guide with conan.lock examples, vcpkg, and handling vendored dependencies."
section: guides
---

## The C/C++ Dependency Challenge

Unlike most modern language ecosystems, C/C++ doesn't have a single standard package manager. This creates unique challenges for SBOM generation:

- **Multiple package managers**: Conan, vcpkg, Hunter, CPM, and others
- **System libraries**: Dependencies installed via apt, yum, brew
- **Vendored code**: Source files copied directly into projects
- **Header-only libraries**: No binary artifacts to track
- **Manual dependency management**: Many projects still manage dependencies manually

This guide focuses on Conan as the most SBOM-friendly option, with guidance for other scenarios.

## Using Conan for SBOMs

[Conan](https://conan.io/) is the most mature C/C++ package manager for SBOM generation because it provides:

- A lockfile format (`conan.lock`)
- Version pinning and reproducible builds
- Package metadata from ConanCenter

### conan.lock Structure

Generate a lockfile:

```bash
conan lock create .
```

The `conan.lock` file contains dependency information:

```json
{
    "version": "0.5",
    "requires": [
        "openssl/3.2.0#abc123",
        "zlib/1.3.1#def456",
        "boost/1.84.0#ghi789"
    ],
    "build_requires": [],
    "python_requires": []
}
```

For Conan 2.x:

```json
{
    "version": "0.5",
    "requires": {
        "openssl/3.2.0": {
            "ref": "openssl/3.2.0#abc123...",
            "package_id": "xyz...",
            "requires": ["zlib/1.3.1"]
        }
    }
}
```

### conanfile.txt

Basic dependency declaration:

```ini
[requires]
boost/1.84.0
openssl/3.2.0
zlib/1.3.1

[generators]
CMakeDeps
CMakeToolchain
```

### conanfile.py

More advanced dependency management:

```python
from conan import ConanFile

class MyAppConan(ConanFile):
    name = "myapp"
    version = "1.0.0"

    requires = [
        "boost/1.84.0",
        "openssl/3.2.0",
        "zlib/1.3.1"
    ]

    def requirements(self):
        if self.settings.os == "Windows":
            self.requires("winsock/2.0")
```

## Generating an SBOM

### Using cdxgen with Conan

[cdxgen](https://github.com/CycloneDX/cdxgen) supports Conan projects:

```bash
# Install cdxgen
npm install -g @cyclonedx/cdxgen

# Generate SBOM from conan.lock
cdxgen -t cpp -o sbom.cdx.json
```

### Using Syft

[Syft](https://github.com/anchore/syft) supports Conan lockfiles:

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

### Using Conan's Built-in Export

Conan can export dependency information:

```bash
# Export dependency graph
conan graph info . --format=json > deps.json
```

Then convert to CycloneDX format using a script or tool.

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) supports Conan projects:

```yaml
---
name: Generate SBOM for C++ Project

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python (for Conan)
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Conan
        run: pip install conan

      - name: Create lockfile
        run: conan lock create .

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-cpp-component'
          LOCK_FILE: 'conan.lock'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true
          UPLOAD: true
```

## GitLab and Other CI/CD

For GitLab CI:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/github-action:latest
  stage: build
  before_script:
    - pip install conan
    - conan lock create .
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "conan.lock"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
  artifacts:
    paths:
      - sbom.cdx.json
```

## Alternative: vcpkg

[vcpkg](https://vcpkg.io/) is Microsoft's C/C++ package manager:

```json
// vcpkg.json (manifest mode)
{
    "name": "myapp",
    "version": "1.0.0",
    "dependencies": [
        "boost-asio",
        "openssl",
        "zlib"
    ]
}
```

vcpkg doesn't have native lockfile support, but you can use versioning:

```json
{
    "name": "myapp",
    "version": "1.0.0",
    "builtin-baseline": "abc123def456...",
    "dependencies": [
        {
            "name": "boost",
            "version>=": "1.84.0"
        }
    ]
}
```

For SBOM generation, export the installed packages:

```bash
vcpkg list --x-json > vcpkg-installed.json
```

## Handling System Libraries

System libraries installed via package managers aren't captured by C++ package managers:

```cmake
# CMakeLists.txt
find_package(OpenSSL REQUIRED)
find_package(ZLIB REQUIRED)
```

Document these using `ADDITIONAL_PACKAGES`:

```yaml
env:
  LOCK_FILE: 'conan.lock'
  ADDITIONAL_PACKAGES: "libssl-dev:3.0.2,zlib1g-dev:1.2.13"
```

Or create a manifest file for system dependencies:

```yaml
# system-deps.yml
- name: openssl
  version: "3.0.2"
  type: system
  package-manager: apt
- name: zlib
  version: "1.2.13"
  type: system
  package-manager: apt
```

## Vendored Dependencies

Many C/C++ projects vendor (copy) dependencies directly:

```
myproject/
├── src/
├── vendor/
│   ├── json/           # nlohmann/json
│   ├── spdlog/         # gabime/spdlog
│   └── catch2/         # catchorg/Catch2
└── CMakeLists.txt
```

For vendored code, you must manually document dependencies:

```yaml
env:
  ADDITIONAL_PACKAGES: "nlohmann-json:3.11.3,spdlog:1.12.0,catch2:3.5.0"
```

Or maintain a manifest:

```json
// vendored-deps.json
{
    "dependencies": [
        {
            "name": "nlohmann-json",
            "version": "3.11.3",
            "source": "https://github.com/nlohmann/json",
            "commit": "abc123"
        },
        {
            "name": "spdlog",
            "version": "1.12.0",
            "source": "https://github.com/gabime/spdlog"
        }
    ]
}
```

## CMake FetchContent

For projects using CMake's FetchContent:

```cmake
include(FetchContent)

FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json
    GIT_TAG v3.11.3
)

FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog
    GIT_TAG v1.12.0
)

FetchContent_MakeAvailable(json spdlog)
```

These dependencies aren't automatically captured. Extract them from CMakeLists.txt or use a wrapper script to generate metadata.

## Best Practices

1. **Use Conan when possible** - It provides the best SBOM support
2. **Generate lockfiles** - Always use `conan lock create` for reproducibility
3. **Document system libraries** - Use ADDITIONAL_PACKAGES for apt/yum dependencies
4. **Track vendored code** - Maintain a manifest for copied source files
5. **Consider container SBOMs** - For complete visibility, generate SBOMs from your Docker image
6. **Automate in CI** - Generate SBOMs alongside your build

## Complete Example

For a comprehensive C++ SBOM covering all dependency types:

```yaml
---
name: Complete C++ SBOM

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libssl-dev zlib1g-dev

      - name: Set up Conan
        run: |
          pip install conan
          conan lock create .

      - name: Generate SBOM
        uses: sbomify/github-action@master
        env:
          LOCK_FILE: 'conan.lock'
          OUTPUT_FILE: 'sbom.cdx.json'
          ADDITIONAL_PACKAGES: "libssl-dev:3.0.2,zlib1g-dev:1.2.13,nlohmann-json:3.11.3"
          ENRICH: true
```

## Further Reading

For more details on C/C++ SBOM generation, see these blog posts by [Chris Swan]({{ site.url }}/authors/cswan/):

- [The C conundrum - generating SBOMs when there's no lockfile]({{ site.url }}/2024/11/18/c-conundrum/) - Explores the challenges of generating SBOMs for C/C++ projects, reviewing cmake-sbom, Conan, cve-bin-tool, and CISA working group efforts
- [Using Conan for C SBOMs]({{ site.url }}/2025/09/04/conan/) - How to use the Conan package manager to generate SBOMs for C and C++ projects

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes general SBOM utilities for generation, distribution, and analysis.
