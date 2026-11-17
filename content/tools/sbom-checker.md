---

title: "SBOM Checker and Validator"
seo_title: "Free SBOM Checker and Validator (CycloneDX, SPDX)"
layout: sbom-checker
lede: "A free online SBOM checker: validate a CycloneDX or SPDX SBOM against its official schema, then check it against the CISA 2026 and NTIA minimum elements and BSI TR-03183-2 for the EU Cyber Resilience Act. See what is missing and how to fix it."
description: "Free online SBOM checker and validator for CycloneDX and SPDX. View and check an SBOM against its schema, CISA 2026, NTIA and the EU CRA in your browser."
keywords: [SBOM checker, SBOM checker online, free SBOM checker, SBOM validator, NTIA SBOM validator, SBOM viewer, CycloneDX validator online, SPDX validator online, validate SBOM, CycloneDX validator, SPDX validator, SBOM quality, NTIA minimum elements checker, CISA minimum elements, CRA SBOM check, BSI TR-03183-2, SBOM compliance]
cta: false
# Card on the /tools/ landing page (layouts/tools/list.html).
card:
  icon: "seal-check"
  summary: "Drop in a CycloneDX or SPDX file and get a pass/fail report in seconds. Every gap comes with what is missing and how to fix it."
  button: "Check an SBOM"
  checks:
    - label: "CycloneDX and SPDX schema validation"
    - label: "CISA 2026 Minimum Elements"
      url: "/compliance/cisa-minimum-elements/"
    - label: "NTIA Minimum Elements"
      url: "/compliance/ntia-minimum-elements/"
    - label: "BSI TR-03183-2 for the EU Cyber Resilience Act"
      url: "/compliance/bsi-tr-03183/"
    - label: "External references and linked SBOMs, with hash checks"
# Structured data: WebApplication (layouts/partials/head.html).
app:
  name: "sbomify SBOM Checker"
  category: "DeveloperApplication"
  features:
    - "CycloneDX 1.2 to 1.7 and SPDX 2.2, 2.3 and 3.0 JSON schema validation"
    - "CISA 2026 and 2025 draft Minimum Elements checks"
    - "NTIA 2021 Minimum Elements checks"
    - "BSI TR-03183-2 (EU Cyber Resilience Act) checks"
    - "External reference and referenced SBOM checks with hash verification"
    - "Runs entirely in the browser; the SBOM is never uploaded"
# Structured data: FAQPage. Same questions and answers as the FAQ section in
# the body; keep the two in step.
faq:
  - question: "How do I validate an SBOM?"
    answer: "Drop a CycloneDX or SPDX JSON file onto the SBOM checker. It validates the document against the official schema for the version it declares, then checks it against the CISA 2026 and NTIA minimum elements and BSI TR-03183-2, and lists every gap with how to fix it."
  - question: "Is this an NTIA SBOM validator?"
    answer: "Yes. The checker validates an SBOM against the NTIA minimum elements (2021): supplier, component name, version, unique identifiers, dependency relationships, SBOM author and timestamp. It also checks the CISA 2026 elements that replaced them and BSI TR-03183-2 for the EU CRA."
  - question: "Can I use it as an SBOM viewer?"
    answer: "Partly. After a check it shows the SBOM's format and version, how many components and dependency links it has, every external reference it points to, and which components are missing which fields. It does not yet list every component for browsing."
  - question: "Is my SBOM uploaded anywhere?"
    answer: "No. The checker is a script that runs in your browser. The SBOM is read from your disk into the page and never sent to sbomify or anyone else. The only network requests are the reference checks you start yourself, which go to the URLs the SBOM lists."
  - question: "Which formats are supported?"
    answer: "JSON: CycloneDX 1.2 to 1.7, SPDX 2.2 and 2.3, and SPDX 3.0.0 and 3.0.1 (JSON-LD). Gzipped files are decompressed in the browser. For XML or SPDX tag-value, convert to JSON first with the CycloneDX CLI or the SPDX tools."
  - question: "Why does a valid SBOM fail the CRA check?"
    answer: "BSI TR-03183-2 asks for more than any minimum-elements list: CycloneDX 1.6 or later (or SPDX 3.0.1 or later), an email or URL for the SBOM creator and each component creator, a SHA-512 hash of each deployable component, and properties such as whether a component is executable or an archive. Most generators do not emit these on their own."
  - question: "Is passing every check the same as being compliant?"
    answer: "No. These checks score the SBOM document. Frameworks such as the CRA also ask about process: how often SBOMs are produced, how they are delivered and how vulnerabilities in what they list are handled. A complete SBOM is the start of that, not the whole of it."
---

## What the checker does

The checker is a free online SBOM validator and compliance checker in one, and works as a CycloneDX validator and an SPDX validator: it reads the SBOM in your browser and runs three kinds of checks. Nothing is uploaded: the file is read, validated and scored on your machine.

### Is it a valid SBOM?

The document is validated against the official JSON schema for the version it declares: [CycloneDX](https://cyclonedx.org/specification/overview/) 1.2 to 1.7, or [SPDX](https://spdx.dev/use/specifications/) 2.2, 2.3, 3.0.0 and 3.0.1. Schema errors come with their location in the document (for example `components[12] "lodash" → licenses[0]`), so you can find them without counting array indexes. A document that fails its schema is rejected by many tools that consume SBOMs, and data in the wrong place is invisible to every check that follows.

### Do its references resolve?

SBOMs point outside themselves: download locations, source repositories, websites, and other SBOMs. CycloneDX does this with `externalReferences`, SPDX 2 with `externalDocumentRefs`, `downloadLocation` and `homepage`, and SPDX 3 with `externalRef` and `import`. The checker lists every one and, when you ask it to, checks that each resolves. Where the SBOM declares a hash for a referenced file, the file is downloaded and the hash verified. Referenced SBOMs are fetched and checked too, two levels deep.

Your browser makes these requests itself, so browser security rules apply. A server that does not allow cross-origin reads can still be confirmed as reachable, but not whether it answered with an error page, and plain `http://` links cannot be requested from an `https` page at all. Both are reported as such rather than as broken.

### Does it meet the frameworks?

| Framework                                                                   | What it asks for                                                                                                                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CISA 2026 Minimum Elements](/compliance/cisa-minimum-elements/)            | The seventeen data fields of the July 2026 standard that replaced the NTIA elements, including component hashes, licences, SBOM author and generation context.                           |
| [BSI TR-03183-2](/compliance/bsi-tr-03183/) ([EU CRA](/compliance/eu-cra/)) | The German technical guideline that sets out what a CRA SBOM contains: CycloneDX 1.6+ or SPDX 3.0.1+, creator contact details, SHA-512 hashes, licences and component properties.        |
| [NTIA Minimum Elements (2021)](/compliance/ntia-minimum-elements/)          | The original seven: supplier, component name, version, unique identifiers, dependency relationships, SBOM author and timestamp. Still asked for by name in contracts and questionnaires. |
| [CISA 2025 Minimum Elements (draft)](/compliance/cisa-minimum-elements/)    | The August 2025 public comment draft, kept because some requirements pin it.                                                                                                             |

Each failed element links to the section of our guide that explains the requirement and to the [schema crosswalk](/compliance/schema-crosswalk/), which shows where the field goes in CycloneDX and SPDX. Frameworks that do not define SBOM fields themselves point to these elements: [EO 14028](/compliance/eo-14028/) defers to the NTIA elements, the [FDA medical device](/compliance/fda-medical-device/) guidance references them, and [NIS2](/compliance/eu-nis2/) guidance recommends them as the baseline. The [compliance guide](/compliance/) covers every framework.

The checks assess the published framework definitions. Results can differ from the sbomify platform as standards corrections are adopted. Signature authenticity remains unverified in this file-only checker; inline signature presence does not establish validity or author attribution. BSI descriptions whose logical, identified or full scope cannot be inferred are flagged for scope confirmation. When an element fails, the checker says which components are affected and what to add to fix it. CISA's 2026 standard says an author who does not know a value should say so rather than leave it out; a value declared as unknown (`NOASSERTION` in SPDX) is shown as a warning, not a failure.

## Fixing what it finds

Most failures come from how the SBOM was generated, not from the software. Generators that read lockfiles know names, versions and package URLs, but rarely who supplied a component, its licence or the hash of what was shipped. The [sbomify GitHub Action](/sbomify-action/) generates the SBOM and fills those gaps in two steps, and every failed element in the report links to the step that addresses it:

| Failing element                                               | What fixes it                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Component supplier or producer, licences                      | [Enrichment](/sbomify-action/enrichment/#what-gets-added), from package registries and distro licence databases           |
| Component hashes                                              | [Enrichment](/sbomify-action/enrichment/#integrity-hashes), from the hashes in your lockfile                              |
| Source and download URLs                                      | [Enrichment](/sbomify-action/enrichment/#what-gets-added)                                                                 |
| Missing transitive dependencies                               | [Enrichment](/sbomify-action/enrichment/#transitive-dependency-discovery)                                                 |
| SBOM author and creator contact, your own supplier            | [Augmentation](/sbomify-action/augmentation/#the-config-file), from `sbomify.json` in your repository                     |
| Generation context (lifecycle phase)                          | [Augmentation](/sbomify-action/augmentation/#valid-values), `lifecycle_phase`                                             |
| Tool, timestamp, serial number, names, versions, package URLs | [Generation](/sbomify-action/how-it-works/#1-generation) and [finalization](/sbomify-action/how-it-works/#4-finalization) |
| Format version (BSI TR-03183-2 asks for CycloneDX 1.6+)       | [`SPEC_VERSION`](/sbomify-action/configuration/#output)                                                                   |
| Signature                                                     | [Attestation in CI](/sbomify-action/advanced/#attestation)                                                                |

Augmentation covers what only you know about your own software; enrichment covers what is public about your dependencies. [The augmentation guide](/sbomify-action/augmentation/#augmentation-vs-enrichment) explains the split. The BSI component properties (filename, executable, archive, structured) are not filled automatically; the [schema crosswalk](/compliance/schema-crosswalk/#bsi-tr-03183-2-component-properties) shows where they go. See the [generation guides](/guides/) for your language or build system.

## Frequently asked questions

### How do I validate an SBOM?

Drop a CycloneDX or SPDX JSON file onto the checker above. It validates the document against the official schema for the version it declares, then checks it against the CISA 2026 and NTIA minimum elements and BSI TR-03183-2, and lists every gap with how to fix it. For validation in CI, the [sbomify GitHub Action](/sbomify-action/how-it-works/#4-finalization) validates every SBOM it writes against the same schemas.

### Is this an NTIA SBOM validator?

Yes. The checker validates an SBOM against the [NTIA minimum elements](/compliance/ntia-minimum-elements/) (2021): supplier, component name, version, unique identifiers, dependency relationships, SBOM author and timestamp. It also checks the [CISA 2026 elements](/compliance/cisa-minimum-elements/) that replaced them and [BSI TR-03183-2](/compliance/bsi-tr-03183/) for the EU CRA.

### Can I use it as an SBOM viewer?

Partly. After a check it shows the SBOM's format and version, how many components and dependency links it has, every external reference it points to, and which components are missing which fields. It does not yet list every component for browsing.

### Is my SBOM uploaded anywhere?

No. The checker is a script that runs in your browser. The SBOM is read from your disk into the page and never sent to sbomify or anyone else. The only network requests are the reference checks you start yourself, which go to the URLs the SBOM lists.

### Which formats are supported?

JSON: CycloneDX 1.2 to 1.7, SPDX 2.2 and 2.3, and SPDX 3.0.0 and 3.0.1 (JSON-LD). Gzipped files (`.json.gz`) are decompressed in the browser. For XML or SPDX tag-value, convert to JSON first with the CycloneDX CLI or the SPDX tools.

### Why does a valid SBOM fail the CRA check?

BSI TR-03183-2 asks for more than any minimum-elements list: CycloneDX 1.6 or later (or SPDX 3.0.1 or later), an email or URL for the SBOM creator and each component creator, a SHA-512 hash of each deployable component, and properties such as whether a component is executable or an archive. Most generators do not emit these on their own. See [CRA SBOM requirements](/compliance/eu-cra/) for what the regulation itself says.

### Is passing every check the same as being compliant?

No. These checks score the SBOM document. Frameworks such as the CRA also ask about process: how often SBOMs are produced, how they are delivered and how vulnerabilities in what they list are handled. A complete SBOM is the start of that, not the whole of it.
