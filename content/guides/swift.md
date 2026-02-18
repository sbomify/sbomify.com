---

url: /guides/swift/
title: "SBOM Generation Guide for Swift - Swift Package Manager"
description: "Learn how to generate Software Bill of Materials for Swift projects. Complete guide with Package.resolved examples, Xcode integration, and CycloneDX output."
section: guides
---

## Source vs Build SBOMs

Swift Package Manager (SPM) is Apple's official dependency manager for Swift projects. It provides good lockfile support through `Package.resolved`.

- **Source SBOMs** are generated from `Package.resolved`
- **Build SBOMs** can be generated from the built `.build` directory

For most Swift projects, generating from `Package.resolved` is preferred because it contains exact resolved versions with Git references.

## Lockfile Deep Dive

### Package.swift (Manifest)

The `Package.swift` file declares your dependencies:

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),
        .package(url: "https://github.com/vapor/vapor.git", from: "4.90.0")
    ],
    targets: [
        .executableTarget(
            name: "MyApp",
            dependencies: [
                "Alamofire",
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
                .product(name: "Vapor", package: "vapor")
            ]
        )
    ]
)
```

### Package.resolved (Lockfile)

The `Package.resolved` file contains resolved dependencies:

```json
{
  "pins" : [
    {
      "identity" : "alamofire",
      "kind" : "remoteSourceControl",
      "location" : "https://github.com/Alamofire/Alamofire.git",
      "state" : {
        "revision" : "f455c2975872ccd2d9c81594c658af65716e9b9a",
        "version" : "5.8.1"
      }
    },
    {
      "identity" : "swift-argument-parser",
      "kind" : "remoteSourceControl",
      "location" : "https://github.com/apple/swift-argument-parser.git",
      "state" : {
        "revision" : "c8ed701c513cf5c02baf09b3c5eb3e4a7e7920ca",
        "version" : "1.3.0"
      }
    },
    {
      "identity" : "vapor",
      "kind" : "remoteSourceControl",
      "location" : "https://github.com/vapor/vapor.git",
      "state" : {
        "revision" : "abc123...",
        "version" : "4.90.0"
      }
    }
  ],
  "version" : 2
}
```

Key information:

- **identity**: Package identifier (lowercase)
- **location**: Git repository URL
- **revision**: Exact Git commit hash
- **version**: Semantic version tag

### Xcode Project Location

In Xcode projects, `Package.resolved` is typically located at:

- **SPM projects**: Root directory
- **Xcode projects**: `MyProject.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- **Xcode workspaces**: `MyWorkspace.xcworkspace/xcshareddata/swiftpm/Package.resolved`

## Xcode Integration

### Adding Package.resolved to Version Control

For reproducible builds, commit `Package.resolved`:

```bash
# For Xcode projects
git add MyProject.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved

# For SPM projects
git add Package.resolved
```

### Resolving Dependencies

```bash
# Resolve and update Package.resolved
swift package resolve

# Update to latest versions within constraints
swift package update
```

## Binary Dependencies and XCFrameworks

Swift packages can include binary dependencies:

```swift
.binaryTarget(
    name: "MyFramework",
    url: "https://example.com/MyFramework-1.0.0.xcframework.zip",
    checksum: "abc123..."
)
```

Or local XCFrameworks:

```swift
.binaryTarget(
    name: "MyFramework",
    path: "Frameworks/MyFramework.xcframework"
)
```

**SBOM considerations:**

- Binary targets have checksums but limited metadata
- Local XCFrameworks need manual documentation
- Consider using `ADDITIONAL_PACKAGES` for binary dependencies

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For Swift, sbomify uses **cdxgen** or **Syft** under the hood.

**Standalone (no account needed):**

```yaml
- uses: sbomify/github-action@master
  env:
    LOCK_FILE: Package.resolved
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-swift-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/github-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: Package.resolved
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

For Xcode projects, use the full path to `Package.resolved`:

```yaml
LOCK_FILE: MyProject.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
```

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**cdxgen:**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -t swift -o sbom.cdx.json
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
    LOCK_FILE: Package.resolved
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## iOS/macOS App Considerations

### CocoaPods Integration

If your project also uses CocoaPods:

```yaml
- name: Generate Swift SBOM
  uses: sbomify/github-action@master
  env:
    LOCK_FILE: 'Package.resolved'
    OUTPUT_FILE: 'swift-sbom.cdx.json'

- name: Generate CocoaPods SBOM
  run: |
    # CocoaPods lockfile is Podfile.lock
    cdxgen -t cocoapods -o pods-sbom.cdx.json
```

### Carthage Integration

For projects using Carthage:

```bash
# Carthage resolved file
cat Cartfile.resolved
```

Generate separate SBOMs and merge them.

### System Frameworks

Apple system frameworks (UIKit, Foundation, etc.) are typically not included in SBOMs as they're part of the OS. However, you may want to document the minimum deployment target:

```yaml
env:
  ADDITIONAL_PACKAGES: "iOS-SDK:17.0,macOS-SDK:14.0"
```

## Best Practices

1. **Always commit Package.resolved** - Essential for reproducible builds
2. **Use exact version requirements carefully** - `from:` allows minor updates
3. **Pin to specific versions for releases** - Use `.exact()` for critical dependencies
4. **Document binary dependencies** - XCFrameworks need explicit tracking
5. **Run on macOS for accuracy** - Some tools work better with Xcode available
6. **Include platform information** - Document iOS/macOS version requirements

## Version Pinning Strategies

```swift
dependencies: [
    // Allows 5.8.0 up to next major version
    .package(url: "...", from: "5.8.0"),

    // Exact version only
    .package(url: "...", exact: "5.8.1"),

    // Version range
    .package(url: "...", "5.8.0"..<"6.0.0"),

    // Branch (not recommended for production)
    .package(url: "...", branch: "main"),

    // Specific commit
    .package(url: "...", revision: "abc123...")
]
```

For the most reproducible SBOMs, prefer `exact:` or specific revision pinning in production.

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes general SBOM utilities for generation, distribution, and analysis.
