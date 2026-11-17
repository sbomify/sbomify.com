---

title: "SBOM Checker"
seo_title: "Free SBOM Checker: Validate CycloneDX & SPDX for CISA, NTIA and the CRA | sbomify"
layout: sbom-checker
lede: "Check a CycloneDX or SPDX SBOM against its official schema, the CISA 2026 and NTIA minimum elements, and BSI TR-03183-2 for the EU Cyber Resilience Act. See what is missing and how to fix it."
description: "Free SBOM checker that runs in your browser. Validates CycloneDX and SPDX SBOMs against the official schema, CISA 2026 and NTIA minimum elements and BSI TR-03183-2 (EU CRA), checks external references, and explains how to fix every gap."
keywords: [SBOM checker, SBOM validator, CycloneDX validator, SPDX validator, NTIA minimum elements checker, CISA minimum elements, CRA SBOM check, BSI TR-03183-2, SBOM compliance]
cta: false
---

## What the checker does

The checker reads an SBOM in your browser and runs three kinds of checks. Nothing is uploaded: the file is read, validated and scored on your machine.

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

The checks are the same ones the sbomify platform runs on every SBOM uploaded to it, so the result here matches what you will see there. When an element fails, the checker says which components are affected and what to add to fix it. CISA's 2026 standard says an author who does not know a value should say so rather than leave it out; a value declared as unknown (`NOASSERTION` in SPDX) is shown as a warning, not a failure.

## Fixing what it finds

Most failures come from how the SBOM was generated, not from the software. Generators that read lockfiles know names, versions and package URLs, but rarely the supplier, the licence or the hash of what was shipped. The [sbomify GitHub Action](/sbomify-action/) generates the SBOM and then [augments](/sbomify-action/augmentation/) and [enriches](/sbomify-action/enrichment/) it with that data from package registries, which clears most of these gaps in one step. See the [generation guides](/guides/) for your language or build system.

## Frequently asked questions

### Is my SBOM uploaded anywhere?

No. The checker is a script that runs in your browser. The SBOM is read from your disk into the page and never sent to sbomify or anyone else. The only network requests are the reference checks you start yourself, which go to the URLs the SBOM lists.

### Which formats are supported?

JSON: CycloneDX 1.2 to 1.7, SPDX 2.2 and 2.3, and SPDX 3.0.0 and 3.0.1 (JSON-LD). Gzipped files (`.json.gz`) are decompressed in the browser. For XML or SPDX tag-value, convert to JSON first with the CycloneDX CLI or the SPDX tools.

### Why does a valid SBOM fail the CRA check?

BSI TR-03183-2 asks for more than any minimum-elements list: CycloneDX 1.6 or later (or SPDX 3.0.1 or later), an email or URL for the SBOM creator and each component creator, a SHA-512 hash of each deployable component, and properties such as whether a component is executable or an archive. Most generators do not emit these on their own. See [CRA SBOM requirements](/compliance/eu-cra/) for what the regulation itself says.

### Is passing every check the same as being compliant?

No. These checks score the SBOM document. Frameworks such as the CRA also ask about process: how often SBOMs are produced, how they are delivered and how vulnerabilities in what they list are handled. A complete SBOM is the start of that, not the whole of it.
