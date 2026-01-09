---
layout: page
permalink: /guides/dotnet/
title: "SBOM Generation Guide for .NET - NuGet"
description: "Learn how to generate Software Bill of Materials for .NET and C# projects. Complete guide with packages.lock.json, PackageReference, and Microsoft SBOM Tool examples."
section: guides
---

## Source vs Build SBOMs

The .NET ecosystem has evolved significantly in its dependency management. Understanding the landscape is crucial for accurate SBOM generation:

- **Legacy:** `packages.config` (NuGet 2.x style)
- **Modern:** `PackageReference` in `.csproj` files
- **Recommended:** `packages.lock.json` for reproducible builds

For the most accurate SBOMs, generate from `packages.lock.json` which contains resolved transitive dependencies with exact versions.

## Lockfile Deep Dive

### Generating packages.lock.json

.NET doesn't create a lockfile by default. Enable it in your `.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
    <RestoreLockedMode Condition="'$(CI)' == 'true'">true</RestoreLockedMode>
  </PropertyGroup>
</Project>
```

Or via CLI:

```bash
dotnet restore --use-lock-file
```

### packages.lock.json Structure

The lockfile contains detailed dependency information:

```json
{
  "version": 2,
  "dependencies": {
    "net8.0": {
      "Microsoft.Extensions.Logging": {
        "type": "Direct",
        "requested": "[8.0.0, )",
        "resolved": "8.0.0",
        "contentHash": "h1:abc123...",
        "dependencies": {
          "Microsoft.Extensions.DependencyInjection.Abstractions": "8.0.0",
          "Microsoft.Extensions.Logging.Abstractions": "8.0.0"
        }
      },
      "Newtonsoft.Json": {
        "type": "Transitive",
        "resolved": "13.0.3",
        "contentHash": "def456..."
      }
    }
  }
}
```

Key fields:

- **type**: Direct or Transitive dependency
- **requested**: Version range from your `.csproj`
- **resolved**: Actual resolved version
- **contentHash**: Package integrity hash
- **dependencies**: Transitive dependencies

### PackageReference in .csproj

Without a lockfile, dependencies are declared in `.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.*" />
    <PackageReference Include="Serilog" Version="[3.0.0,4.0.0)" />
  </ItemGroup>
</Project>
```

**Warning:** Version ranges (like `13.0.*` or `[3.0.0,4.0.0)`) make reproducible SBOMs impossible without a lockfile.

## .NET Framework vs .NET Core vs .NET 5+

Different .NET versions handle dependencies differently:

| Version        | Package Format                      | Recommended SBOM Source |
| -------------- | ----------------------------------- | ----------------------- |
| .NET Framework | packages.config or PackageReference | packages.lock.json      |
| .NET Core      | PackageReference                    | packages.lock.json      |
| .NET 5+        | PackageReference                    | packages.lock.json      |

## Multi-Targeting

.NET projects can target multiple frameworks:

```xml
<PropertyGroup>
  <TargetFrameworks>net6.0;net8.0;netstandard2.1</TargetFrameworks>
</PropertyGroup>
```

Your `packages.lock.json` will contain separate dependency trees for each target:

```json
{
  "dependencies": {
    "net6.0": { /* dependencies */ },
    "net8.0": { /* dependencies */ },
    "netstandard2.1": { /* dependencies */ }
  }
}
```

Consider generating separate SBOMs for each target framework if they differ significantly.

## Generating an SBOM

### Using Microsoft SBOM Tool (Official)

Microsoft's official SBOM tool is designed for .NET:

```bash
# Install
dotnet tool install --global Microsoft.Sbom.DotNetTool

# Generate SBOM (SPDX format)
sbom-tool generate -b ./bin/Release -bc . -pn MyApp -pv 1.0.0 -ps MyCompany

# Output in CycloneDX format
sbom-tool generate -b ./bin/Release -bc . -pn MyApp -pv 1.0.0 -ps MyCompany -m cyclonedx
```

### Using cdxgen

[cdxgen](https://github.com/CycloneDX/cdxgen) has strong .NET support:

```bash
# Install cdxgen
npm install -g @cyclonedx/cdxgen

# Generate SBOM
cdxgen -t dotnet -o sbom.cdx.json

# Include all project files
cdxgen -t dotnet -o sbom.cdx.json --include-subprojects
```

### Using CycloneDX .NET Tool

Official CycloneDX tool for .NET:

```bash
# Install
dotnet tool install --global CycloneDX

# Generate from solution
dotnet CycloneDX MySolution.sln -o sbom.cdx.json -j

# Generate from project
dotnet CycloneDX MyProject.csproj -o sbom.cdx.json -j

# Include dev dependencies
dotnet CycloneDX MySolution.sln -o sbom.cdx.json -j -d
```

### Using Trivy

[Trivy](https://github.com/aquasecurity/trivy) supports .NET projects:

```bash
# Generate CycloneDX SBOM
trivy fs --format cyclonedx --output sbom.cdx.json .

# Generate SPDX SBOM
trivy fs --format spdx-json --output sbom.spdx.json .
```

### Using Syft

[Syft](https://github.com/anchore/syft) supports NuGet packages:

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) supports .NET projects:

```yaml
---
name: Generate SBOM for .NET Project

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'

      - name: Restore with lockfile
        run: dotnet restore --use-lock-file

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-dotnet-component'
          LOCK_FILE: 'packages.lock.json'
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
    - apt-get update && apt-get install -y dotnet-sdk-8.0
    - dotnet restore --use-lock-file
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "packages.lock.json"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
  artifacts:
    paths:
      - sbom.cdx.json
```

## Azure DevOps Integration

For Azure Pipelines:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: UseDotNet@2
    inputs:
      version: '8.0.x'

  - script: dotnet restore --use-lock-file
    displayName: 'Restore dependencies'

  - script: |
      dotnet tool install --global CycloneDX
      dotnet CycloneDX *.sln -o sbom.cdx.json -j
    displayName: 'Generate SBOM'

  - publish: sbom.cdx.json
    artifact: sbom
```

## Handling NuGet Sources

For projects using private NuGet feeds:

```xml
<!-- nuget.config -->
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="private-feed" value="https://pkgs.dev.azure.com/myorg/_packaging/myfeed/nuget/v3/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <private-feed>
      <add key="Username" value="PAT" />
      <add key="ClearTextPassword" value="%NUGET_TOKEN%" />
    </private-feed>
  </packageSourceCredentials>
</configuration>
```

Ensure your CI environment has access to all NuGet sources for accurate SBOM generation.

## Best Practices

1. **Always use lockfiles** - Enable `RestorePackagesWithLockFile` for reproducible builds
2. **Pin exact versions** - Avoid floating versions in production
3. **Use locked mode in CI** - Set `RestoreLockedMode` to `true` in CI builds
4. **Separate runtime and dev dependencies** - Consider excluding test packages from SBOMs
5. **Include framework dependencies** - Don't forget the .NET runtime itself
6. **Document private packages** - Ensure metadata is available for internal NuGet packages

## Common Issues

### Missing Transitive Dependencies

If your SBOM is missing transitive dependencies:

1. Ensure you're using `packages.lock.json`
2. Run `dotnet restore --force-evaluate` to regenerate the lockfile

### Framework-Specific Dependencies

Different target frameworks may have different dependencies. Choose the target framework most relevant to your deployment:

```bash
# Generate for specific framework
dotnet CycloneDX MyProject.csproj -o sbom.cdx.json -j -f net8.0
```

### Self-Contained Deployments

For self-contained deployments that include the .NET runtime:

```bash
dotnet publish -c Release -r linux-x64 --self-contained true
```

Consider generating an SBOM that includes runtime components using Microsoft SBOM Tool on the published output.

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes additional .NET-specific tools like CycloneDX .NET library and Microsoft SBOM Tool.
