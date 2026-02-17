---

title: "SBOM Formats Compared: CycloneDX vs SPDX"
description: "A practical comparison of CycloneDX and SPDX SBOM formats covering history, governance, field differences, tooling, compliance preferences, and when to use which."
category: education
tags: [sbom, cyclonedx, spdx, formats]
tldr: "CycloneDX and SPDX are the two industry-standard SBOM formats. CycloneDX is security-focused with a compact model and native vulnerability support; SPDX is compliance-focused with deep license documentation. Most modern tools support both, and major compliance frameworks accept either."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What are the main SBOM formats?"
    answer: "The two industry-standard SBOM formats are CycloneDX (developed by OWASP, standardized as ECMA-424) and SPDX (developed by the Linux Foundation, standardized as ISO/IEC 5962:2021). Both support JSON and XML serialization, are accepted by major compliance frameworks, and have broad tooling support."
  - question: "What is the difference between CycloneDX and SPDX?"
    answer: "CycloneDX is a security-focused format with a compact, component-centric model and native support for vulnerability and VEX data. SPDX is a compliance-focused format with rich license documentation capabilities and support for file-level and snippet-level analysis. Both support purl, CPE, and hash-based component identification."
  - question: "Which SBOM format should I use?"
    answer: "If your primary concern is application security and vulnerability management, CycloneDX is often more straightforward. If license compliance is your primary driver, SPDX may be more appropriate. For EU CRA compliance via BSI TR-03183-2, you need CycloneDX 1.6+ or SPDX 3.0.1+ in JSON or XML format. Many organizations support both formats."
  - question: "Can I convert between CycloneDX and SPDX?"
    answer: "Yes. Tools like the CycloneDX CLI support conversion between formats. However, conversion may result in some data loss where one format supports fields that the other does not. For critical compliance use cases, it is better to generate natively in the required format."
  - question: "What is an SBOM example?"
    answer: "An SBOM is a machine-readable document listing every component in a software product, including names, versions, package identifiers (purl), licenses, and supplier information. Both CycloneDX and SPDX define JSON and XML representations for this data."
date: 2026-01-15
slug: sbom-formats-cyclonedx-vs-spdx
---

An SBOM format defines the structure, fields, and serialization of a [Software Bill of Materials](/what-is-sbom/). Two formats have emerged as industry standards: [CycloneDX](https://cyclonedx.org/), developed by OWASP, and [SPDX](https://spdx.dev/) (Software Package Data Exchange), developed by the Linux Foundation. Both are actively maintained, widely supported by tooling, and accepted by major compliance frameworks. Understanding their differences helps organizations choose the right format for their use case — or, as is increasingly common, support both.

## A Brief History

### SPDX

SPDX originated in 2010 as a Linux Foundation project focused on standardizing how open source license information is communicated. Its roots in license compliance shaped the format's design: SPDX has always included rich fields for license expressions, copyright text, and file-level attribution.

SPDX 2.0 was released in 2015. The later SPDX 2.2.1 became an [ISO/IEC standard (5962:2021)](https://www.iso.org/standard/81870.html) in 2021. SPDX 2.3, the current widely-deployed version, added support for additional relationship types and improved package identification.

[SPDX 3.0](https://spdx.github.io/spdx-spec/v3.0.1/), released in 2024, is a significant redesign. It introduces a profile-based architecture where the core specification defines common elements and optional profiles (Security, Licensing, Build, AI, Dataset) extend the model for specific use cases. This makes SPDX 3.0 more flexible but also more complex than previous versions.

### CycloneDX

CycloneDX was created in 2017 by [OWASP](https://owasp.org/) with a different starting point: application security. The format was designed specifically to support software supply chain security use cases including vulnerability tracking, dependency analysis, and component integrity verification.

CycloneDX has evolved rapidly through regular releases. [CycloneDX 1.6](https://cyclonedx.org/docs/1.6/) (2024) added attestation and cryptography bill of materials support. [CycloneDX 1.7](https://cyclonedx.org/docs/1.7/) (2025) added patent and intellectual property metadata, citations for data provenance, enhanced cryptographic transparency capabilities, and expanded formulations scope.

CycloneDX is an [Ecma International standard (ECMA-424)](https://ecma-international.org/publications-and-standards/standards/ecma-424/) as of 2024.

## Governance and Community

| Aspect              | CycloneDX                                                        | SPDX                                                     |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| **Governing body**  | [OWASP Foundation](https://owasp.org/)                           | [Linux Foundation](https://www.linuxfoundation.org/)     |
| **Standards body**  | [Ecma International](https://ecma-international.org/) (ECMA-424) | [ISO/IEC](https://www.iso.org/) (5962:2021)              |
| **Primary focus**   | Application security and supply chain risk                       | License compliance and software transparency             |
| **Release cadence** | Frequent (roughly annual major versions)                         | Less frequent (major versions every 2-3 years)           |
| **Current version** | 1.7 (2025)                                                       | 3.0.1 (2024), with 2.3 still widely deployed             |
| **Serialization**   | JSON, XML, Protocol Buffers                                      | JSON, XML, RDF, Tag-Value (SPDX 2.3); JSON-LD (SPDX 3.0) |

Both formats are open standards with active communities, public specification repositories, and contributor-friendly governance.

## Key Structural Differences

### Document Model

**CycloneDX** uses a flat, component-centric model. An SBOM is a document containing metadata and a list of components. Dependencies are expressed separately through a `dependencies` array that maps component references to their dependents. This separation keeps the component list clean and the dependency graph explicit.

**SPDX 2.3** uses a package-and-relationship model. Packages are listed individually, and `relationships` entries describe how they relate (e.g., `DEPENDS_ON`, `CONTAINS`, `BUILD_TOOL_OF`). SPDX supports a wider set of relationship types than CycloneDX.

**SPDX 3.0** moves to an element-based model with a linked-data approach. Elements (packages, files, snippets, etc.) are connected through relationships and can reference external documents. This is more powerful for complex use cases but adds modeling complexity.

### Component Identification

Both formats support Package URL ([purl](https://github.com/package-url/purl-spec)) and [CPE](https://nvd.nist.gov/products/cpe) for component identification. Purl is the preferred identifier in both ecosystems as it is more precise for software packages.

| Identifier   | CycloneDX                    | SPDX 2.3                    | SPDX 3.0                             |
| ------------ | ---------------------------- | --------------------------- | ------------------------------------ |
| **purl**     | `components[].purl`          | `packages[].externalRefs[]` | External identifier                  |
| **CPE**      | `components[].cpe`           | `packages[].externalRefs[]` | External identifier                  |
| **Hash**     | `components[].hashes[]`      | `packages[].checksums[]`    | Verification properties              |
| **Supplier** | `components[].supplier.name` | `packages[].supplier`       | Organization agent linked to element |

For a complete field-by-field mapping, see our [SBOM Schema Crosswalk](/compliance/schema-crosswalk/).

### License Data

SPDX has historically been stronger for license documentation, reflecting its origins. SPDX defines the [SPDX License List](https://spdx.org/licenses/) — the standard set of license identifiers (e.g., `MIT`, `Apache-2.0`, `GPL-3.0-only`) used across the industry, including by CycloneDX.

CycloneDX supports license data through `components[].licenses[]`, which can reference SPDX license identifiers or include full license text. Both formats support SPDX license expressions (compound expressions like `MIT OR Apache-2.0`).

### Vulnerability Data

**CycloneDX** includes a dedicated `vulnerabilities` array at the document level, allowing SBOMs to carry vulnerability information alongside component data. This is useful for creating Vulnerability Exploitability eXchange (VEX) documents and for attaching vulnerability assessments directly to SBOMs.

**SPDX 2.3** does not have a native vulnerability data structure. Vulnerability information must be conveyed through external references or separate documents.

**SPDX 3.0** introduces a Security profile that adds vulnerability and VEX support, closing this gap.

### Lifecycle and Build Data

**CycloneDX 1.7** includes `metadata.lifecycles[].phase` to indicate when the SBOM was generated (design, pre-build, build, post-build, operations, discovery, decommission). This aligns with the [CISA SBOM types taxonomy](https://www.cisa.gov/resources-tools/resources/types-software-bill-materials-sbom).

**SPDX 3.0** supports build information through its Build profile, which can document build system, build commands, and build environment details.

## SBOM Format Examples

A minimal SBOM documenting a single component in each format:

### CycloneDX (JSON)

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "version": 1,
  "metadata": {
    "timestamp": "2026-01-15T12:00:00Z",
    "component": {
      "type": "application",
      "name": "my-application",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21",
      "licenses": [{ "license": { "id": "MIT" } }]
    }
  ]
}
```

### SPDX 2.3 (JSON)

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "my-application",
  "documentNamespace": "https://example.com/my-application-1.0.0",
  "creationInfo": {
    "created": "2026-01-15T12:00:00Z",
    "creators": ["Tool: example-tool-1.0"]
  },
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-lodash",
      "name": "lodash",
      "versionInfo": "4.17.21",
      "downloadLocation": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "licenseConcluded": "MIT",
      "externalRefs": [
        {
          "referenceCategory": "PACKAGE-MANAGER",
          "referenceType": "purl",
          "referenceLocator": "pkg:npm/lodash@4.17.21"
        }
      ]
    }
  ]
}
```

Both formats express the same information — a component named `lodash` at version `4.17.21`, licensed under MIT. CycloneDX uses a more compact syntax; SPDX 2.3 requires additional fields like `downloadLocation`, `SPDXID`, and `documentNamespace`.

## Compliance Framework Preferences

Different regulatory frameworks have varying levels of format preference.

| Framework                                                           | Format Preference                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Executive Order 14028](/compliance/eo-14028/) (US)                 | Format-agnostic; both accepted                             |
| [CISA Minimum Elements](/compliance/cisa-minimum-elements/)         | Format-agnostic; references both                           |
| [EU Cyber Resilience Act](/compliance/eu-cra/) (via BSI TR-03183-2) | CycloneDX 1.6+ or SPDX 3.0.1+, JSON or XML format required |
| [NTIA Minimum Elements](/compliance/ntia-minimum-elements/)         | Format-agnostic; both satisfy minimum element requirements |
| [FDA Medical Device](/compliance/fda-medical-device/)               | SPDX and CycloneDX both referenced in FDA guidance         |
| [NIST SP 800-53](/compliance/nist-800-53/)                          | Format-agnostic; focuses on controls, not format           |
| [NIST SP 800-171](/compliance/nist-800-171/)                        | Format-agnostic; focuses on CUI protection requirements    |

The EU CRA's implementing guidance (BSI TR-03183-2) is the most prescriptive, requiring specific minimum versions of each format. Most other frameworks are deliberately format-neutral.

## Tooling Ecosystem

Both formats have broad tooling support. Most modern SBOM tools support both formats, either natively or through conversion.

### Generation Tools

| Tool                                                               | CycloneDX | SPDX | Notes                                                     |
| ------------------------------------------------------------------ | --------- | ---- | --------------------------------------------------------- |
| [sbomify GitHub Action](https://github.com/sbomify/github-action/) | Yes       | Yes  | Generation + enrichment + augmentation, CI/CD integration |
| [Syft](https://github.com/anchore/syft)                            | Yes       | Yes  | Multi-ecosystem, container support                        |
| [Trivy](https://github.com/aquasecurity/trivy)                     | Yes       | Yes  | Vulnerability scanning + SBOM generation                  |
| [cdxgen](https://github.com/CycloneDX/cdxgen)                      | Yes       | No   | CycloneDX-native, broad language support                  |
| [Microsoft SBOM Tool](https://github.com/microsoft/sbom-tool)      | No        | Yes  | SPDX-native, CI/CD integration                            |

### Analysis and Management Tools

| Tool                                                   | CycloneDX | SPDX | Notes                                               |
| ------------------------------------------------------ | --------- | ---- | --------------------------------------------------- |
| [sbomify](https://sbomify.com)                         | Yes       | Yes  | Integrated management, monitoring, and distribution |
| [Grype](https://github.com/anchore/grype)              | Yes       | Yes  | CLI vulnerability scanner                           |
| [OWASP Dependency-Track](https://dependencytrack.org/) | Yes       | Yes  | Standalone monitoring platform                      |
| [OSV-Scanner](https://google.github.io/osv-scanner/)   | Yes       | Yes  | Google's vulnerability scanner                      |

For a comprehensive tool listing organized by lifecycle phase, see our [SBOM resources page](/resources/). For tool comparison and benchmarks, see the [sbom-benchmarks repository](https://github.com/sbomify/sbom-benchmarks).

## When to Use Which Format

There is no single "winner" between CycloneDX and SPDX. The right choice depends on your primary use case:

**Choose CycloneDX when:**

- Your primary concern is application security and vulnerability management
- You need to include vulnerability or VEX data directly in the SBOM
- You are targeting EU CRA compliance and prefer the more compact format
- Your toolchain already uses CycloneDX-native tools like cdxgen
- You want a simpler document model with fewer required fields

**Choose SPDX when:**

- License compliance is your primary driver
- You need detailed file-level analysis (SPDX supports file and snippet elements)
- You are working in ecosystems that have standardized on SPDX (e.g., some automotive and embedded Linux communities)
- You need ISO/IEC standard status (ISO/IEC 5962:2021)
- You are working with SPDX 3.0 profiles for specialized use cases (AI, Build, Dataset)

**Support both when:**

- You distribute software to diverse customers with different format preferences
- Your compliance obligations span multiple frameworks with different preferences
- You use tools like Syft or Trivy that generate both formats from a single scan

Many organizations generate SBOMs in both formats or convert between them using tools like the [CycloneDX CLI](https://github.com/CycloneDX/cyclonedx-cli). The formats are converging in capability, and the practical differences are narrowing with each release.

## Frequently Asked Questions

### What are the main SBOM formats?

The two industry-standard SBOM formats are CycloneDX (developed by OWASP, standardized as ECMA-424) and SPDX (developed by the Linux Foundation, standardized as ISO/IEC 5962:2021). Both support JSON and XML serialization, are accepted by major compliance frameworks, and have broad tooling support. CycloneDX originated in application security; SPDX originated in license compliance.

### What is the difference between CycloneDX and SPDX?

CycloneDX is a security-focused format with a compact, component-centric model and native support for vulnerability and VEX data. SPDX is a compliance-focused format with rich license documentation capabilities and support for file-level and snippet-level analysis. CycloneDX has a simpler document structure; SPDX (especially 3.0) offers a more flexible element-based model with profiles for specialized use cases. Both support purl, CPE, and hash-based component identification.

### Which SBOM format should I use?

If your primary concern is application security and vulnerability management, CycloneDX is often the more straightforward choice. If license compliance is your primary driver, SPDX's deeper license support may be more appropriate. For EU CRA compliance via BSI TR-03183-2, you need CycloneDX 1.6+ or SPDX 3.0.1+ in JSON or XML format. Many organizations support both formats, as most modern tools can generate either.

### Can I convert between CycloneDX and SPDX?

Yes. Tools like the CycloneDX CLI support conversion between formats. However, conversion may result in some data loss where one format supports fields that the other does not. For critical compliance use cases, it is better to generate natively in the required format rather than converting.

### What is an SBOM example?

An SBOM is a machine-readable document listing every component in a software product, including names, versions, package identifiers (purl), licenses, and supplier information. See the CycloneDX and SPDX JSON examples in this article for minimal working examples. For real-world SBOMs with hundreds of components, see the [sbom-benchmarks repository](https://github.com/sbomify/sbom-benchmarks).
