---
url: /sbom-examples/
title: "SBOM Examples: Real CycloneDX and SPDX Files, Annotated"
description: "Real SBOM examples in CycloneDX and SPDX, annotated field by field, with the same software shown in both formats. Includes live SBOMs you can download and check against the NTIA minimum elements."
keywords: [sbom example, sbom examples, cyclonedx example, spdx example, sbom format example, sample sbom, sbom json example]
faq:
  - question: "What does an SBOM look like?"
    answer: "An SBOM is a structured data file, normally JSON, not a document meant to be read by a person. It has a header describing the SBOM itself (who produced it, with which tool, and when) and a list of components, each with at least a name, a version, a supplier, and a unique identifier such as a Package URL. The two industry-standard formats are CycloneDX, an OWASP project standardized as ECMA-424, and SPDX, a Linux Foundation project standardized as ISO/IEC 5962:2021."
  - question: "What is a minimal valid CycloneDX SBOM?"
    answer: "A CycloneDX document is valid with only bomFormat, specVersion and version. In practice a useful SBOM also carries a serialNumber, a metadata block with a timestamp, the tool that produced it and the component it describes, and a components array. A file that validates against the schema is not automatically a useful SBOM: the NTIA minimum elements require supplier name, component name, version, other unique identifiers, dependency relationships, SBOM author and timestamp."
  - question: "Is CycloneDX or SPDX better for SBOM examples?"
    answer: "Neither is better; they describe the same facts with different vocabulary. CycloneDX uses components, purl and metadata.tools, while SPDX uses packages, externalRefs and creationInfo.creators. Both are accepted by the major compliance frameworks. Pick whichever your toolchain and your customers already use, and convert between them when asked, rather than maintaining both by hand."
  - question: "Where can I download a real SBOM example?"
    answer: "sbomify publishes the SBOMs for its own product on its public Trust Center, in both CycloneDX and SPDX, so you can inspect a genuine production SBOM rather than a hand-written snippet. The CycloneDX project also maintains a repository of example BOMs covering a range of ecosystems and edge cases."
  - question: "How many components should an SBOM contain?"
    answer: "There is no target number. It depends entirely on what the SBOM describes and how deep the tool looked. A single library may have a handful of dependencies while a container image routinely has several hundred operating system packages. What matters is that the depth is honest: the NTIA minimum elements ask you to declare known unknowns rather than silently omit components you could not enumerate."
---

Most SBOM articles describe the idea and stop. This page shows the files. Every example below is either taken from a real, published SBOM you can download yourself, or is a minimal document reduced to the fields that matter, and each one is annotated so you can see what each field is for.

If you want the concept first, start with [what an SBOM is](/what-is-sbom/) and come back.

## The shape of an SBOM

Whatever the format, an SBOM has two halves:

1. **A header about the SBOM itself.** Who produced it, with which tool, when, and what software it describes. This is the part people forget, and it is the part auditors ask about first.
2. **A list of components.** Each with a name, a version, a supplier and, ideally, a unique identifier and a license.

The formats disagree only on vocabulary. CycloneDX calls them `components`; SPDX calls them `packages`.

## A minimal CycloneDX example

This is close to the smallest document that is still a useful SBOM. CycloneDX will validate with only `bomFormat`, `specVersion` and `version`, but a document without a timestamp, a producer or a subject tells a consumer nothing.

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:6a6df004-b6c9-4f38-9b5a-1f0c2f1c4d3e",
  "version": 1,
  "metadata": {
    "timestamp": "2026-07-30T13:45:53Z",
    "tools": [
      {
        "vendor": "sbomify, ltd",
        "name": "sbomify",
        "version": "26.7.1"
      }
    ],
    "component": {
      "type": "application",
      "name": "sbomify",
      "version": "26.7.1"
    }
  },
  "components": []
}
```

Reading it field by field:

| Field                      | What it is for                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `bomFormat`, `specVersion` | Identifies the document as CycloneDX and pins the schema version. A consumer needs both before it can parse anything else. |
| `serialNumber`             | A UUID URN unique to this document. Together with `version` it lets you tell a re-issued SBOM from a different one.        |
| `version`                  | The revision of _this_ SBOM, not of the software. Bump it when you republish an SBOM for the same build.                   |
| `metadata.timestamp`       | When the SBOM was assembled. One of the NTIA minimum elements.                                                             |
| `metadata.tools`           | What produced the SBOM. The other half of the "author of SBOM data" element.                                               |
| `metadata.component`       | The subject: the thing this SBOM is _about_. Without it, a consumer has a list of parts and no idea what they add up to.   |
| `components`               | The inventory. Empty here; populated below.                                                                                |

## The same document in SPDX

SPDX describes the same facts with different names. This is the SPDX 2.3 equivalent of the header above.

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "sbomify",
  "documentNamespace": "https://sbomify.com/spdxdocs/sbomify-26.7.1",
  "creationInfo": {
    "created": "2026-07-30T13:45:53Z",
    "creators": [
      "Organization: sbomify, ltd",
      "Tool: sbomify-26.7.1"
    ]
  },
  "packages": [],
  "relationships": []
}
```

The mapping is close to one-to-one:

| CycloneDX            | SPDX                    | Notes                                                                              |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `specVersion`        | `spdxVersion`           | Schema version.                                                                    |
| `serialNumber`       | `documentNamespace`     | SPDX uses a URI rather than a UUID URN.                                            |
| `metadata.timestamp` | `creationInfo.created`  | Same field, different spelling.                                                    |
| `metadata.tools`     | `creationInfo.creators` | SPDX puts organisation and tool in one list, prefixed `Organization:` and `Tool:`. |
| `components`         | `packages`              | The inventory.                                                                     |
| implicit nesting     | `relationships`         | CycloneDX can nest components; SPDX always states relationships explicitly.        |

`dataLicense` is an SPDX quirk with no CycloneDX equivalent: it is the license of _the SBOM document itself_, and the spec requires `CC0-1.0`.

For the differences that go beyond naming, governance, license depth, native vulnerability support, and which compliance frameworks expect which, see our [comparison of the two formats](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/).

## A real component entry

An empty `components` array is not much of an example. This entry is taken verbatim from an SBOM generated against the `alpine:3.18` container image, and it is what a well-formed component actually looks like:

```json
{
  "bom-ref": "pkg:apk/alpine/alpine-baselayout-data@3.4.3-r1?arch=x86_64&distro=3.18.12",
  "type": "library",
  "name": "alpine-baselayout-data",
  "version": "3.4.3-r1",
  "supplier": {
    "name": "Natanael Copa <ncopa@alpinelinux.org>"
  },
  "hashes": [
    {
      "alg": "SHA-1",
      "content": "602007ee374ed96f35e9bf39b1487d67c6afe027"
    }
  ],
  "licenses": [
    {
      "license": {
        "id": "GPL-2.0-only"
      }
    }
  ],
  "purl": "pkg:apk/alpine/alpine-baselayout-data@3.4.3-r1?arch=x86_64&distro=3.18.12"
}
```

Three things are worth pointing out.

**The `purl` is the identifier that matters.** A [Package URL](https://github.com/package-url/purl-spec) encodes ecosystem, namespace, name, version and qualifiers in one string, which is what makes automated vulnerability matching possible. `pkg:apk/alpine/...` says this is an Alpine `apk` package; a Python dependency would read `pkg:pypi/requests@2.32.3`. Name and version alone are ambiguous across ecosystems.

**The license is an SPDX identifier, not free text.** `GPL-2.0-only` is a value from the [SPDX license list](https://spdx.org/licenses/). Writing `"GPLv2"` instead is the single most common way to make a license field useless to automation.

**`supplier` is a minimum element and is usually missing.** Most generators leave it out because the upstream package metadata does not carry it. If you are producing SBOMs for customers, this is the field to check first.

## Checking an example against the minimum elements

A file that validates against the schema is not automatically a _good_ SBOM. The US baseline is the [NTIA minimum elements](/compliance/ntia-minimum-elements/), published in 2021 and still the operative published baseline, with [CISA's 2025 update](/compliance/cisa-minimum-elements/) currently a public comment draft.

Against that baseline, the component above scores:

| Minimum element          | In the example?                                       |
| ------------------------ | ----------------------------------------------------- |
| Supplier name            | Yes, `supplier.name`                                  |
| Component name           | Yes, `name`                                           |
| Version                  | Yes, `version`                                        |
| Other unique identifiers | Yes, `purl`                                           |
| Dependency relationship  | Only at document level, via nesting or `dependencies` |
| Author of SBOM data      | In the header, `metadata.tools`                       |
| Timestamp                | In the header, `metadata.timestamp`                   |

Note that two of the seven elements live in the header, not in the component. An SBOM that is nothing but a component list cannot meet the baseline no matter how good the entries are.

## Live SBOMs you can download

Hand-written snippets are tidy in a way that real SBOMs are not. sbomify publishes the SBOMs for its own product, in both formats, on its [public Trust Center](https://trust.sbomify.com/product/sbomify/), including the product-level SBOM that references the SBOMs of each underlying component rather than flattening everything into one list.

Two other sources worth knowing, both from the projects that maintain the specifications themselves:

- The [CycloneDX BOM examples repository](https://github.com/CycloneDX/bom-examples), maintained by the OWASP CycloneDX project, covering SBOM, VEX, VDR and CBOM documents.
- The [SPDX specification](https://spdx.dev/use/specifications/), maintained by the Linux Foundation, whose annexes include worked examples in each supported serialisation.

For background on why these documents are being asked for, [CISA's SBOM resources](https://www.cisa.gov/sbom) and the [OpenSSF](https://openssf.org/) guidance are the primary references, and [ENISA](https://www.enisa.europa.eu/) covers the European position.

## Generating your own

Reading examples only gets you so far. Every ecosystem has a different route from lockfile to SBOM, and our [language guides](/guides/) cover them one by one, from `uv.lock` and `Cargo.lock` through to container images.

The short version: generate from a lockfile where you can, enrich the result so the supplier and license fields are actually populated, and publish it somewhere your customers can find it without emailing you.

{{< cta-ready title="Ready to publish your own SBOMs?" >}}
