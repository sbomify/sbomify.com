---

url: /guides/sbomify-action/why/
title: "Why SBOM Quality Matters: Scanners vs. Pipelines"
description: "Why a raw scanner output is not a compliance-grade SBOM, and why generating and signing in CI - with no server-side modification afterwards - is what makes an SBOM verifiable."
keywords: ["SBOM quality", "NTIA minimum elements", "CISA SBOM", "SBOM chain of custody", "SBOM signing"]
section: guides
tldr: "A scanner detects packages; it does not produce a compliance-grade SBOM. The missing fields - supplier, license, hashes, lifecycle - are exactly the ones regulators ask for. Generating and signing in CI, then never modifying the artifact, is what makes the result verifiable rather than merely plausible."
---

## The gap between a dependency list and an SBOM

Run any scanner over a project and you get something like this:

```json
{
  "type": "library",
  "name": "django",
  "version": "5.1",
  "purl": "pkg:pypi/django@5.1"
}
```

That is a correct and useful answer to "what is installed here?". It is not an SBOM that will survive a procurement review.

Here is the same component after augmentation and enrichment:

```json
{
  "type": "library",
  "name": "django",
  "version": "5.1",
  "purl": "pkg:pypi/django@5.1",
  "publisher": "Django Software Foundation",
  "description": "A high-level Python web framework...",
  "licenses": [{"expression": "BSD-3-Clause"}],
  "externalReferences": [
    {"type": "website", "url": "https://www.djangoproject.com/"},
    {"type": "vcs", "url": "https://github.com/django/django"},
    {"type": "distribution", "url": "https://pypi.org/project/Django/"}
  ]
}
```

The difference is not cosmetic. Without a license field you cannot run license compliance. Without a supplier you cannot answer "who do I contact about this?". Without a hash you cannot prove the component you shipped is the component you scanned.

## What the regulations actually require

The [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) define seven required data fields. [CISA's 2025 guidance](/compliance/cisa-minimum-elements/) extends them. The [EU Cyber Resilience Act](/compliance/eu-cra/) leans on both.

| Required element            | Where it comes from                           |
| --------------------------- | --------------------------------------------- |
| Supplier name               | Augmentation (yours) or enrichment (registry) |
| Component name              | Generator                                     |
| Version                     | Generator                                     |
| Other unique identifiers    | Generator (PURL)                              |
| Dependency relationship     | Generator                                     |
| Author of SBOM data         | Augmentation                                  |
| Timestamp                   | Generator                                     |
| Component hash (CISA 2025)  | Hash enrichment from your lockfile            |
| License                     | Enrichment                                    |
| Lifecycle and support dates | Augmentation and CLE enrichment               |

A generator supplies roughly the middle of that table. The top and bottom - the parts that describe _your organisation_ and _the wider ecosystem_ - are not information a scanner has access to. One of them only you know; the other lives in package registries.

This is the whole argument for treating SBOM generation as a pipeline rather than a single command.

## Why not just pick the best scanner?

Because there isn't one.

| Ecosystem                          | Most accurate generator |
| ---------------------------------- | ----------------------- |
| Python                             | `cyclonedx-py`          |
| Rust                               | `cargo-cyclonedx`       |
| Go                                 | `cyclonedx-gomod`       |
| Java (Maven)                       | `cyclonedx-maven`       |
| Java (Gradle)                      | `cyclonedx-gradle`      |
| Scala                              | `cyclonedx-sbt`         |
| JavaScript, Ruby, PHP, .NET        | `cdxgen`                |
| Container images, Swift, Terraform | Syft                    |

Native tools understand their ecosystem's resolution rules; generic scanners guess from files on disk. `sbomify-action` routes each input to the best available generator and falls back automatically if one fails or does not support the input, so you get the right tool without having to maintain that knowledge yourself. See [input sources](/guides/sbomify-action/sources/) for the full routing table.

There is a second, quieter benefit: abstracting over generators means you are not exposed when one of them has a problem. When [Trivy shipped compromised releases in March 2026](/2026/03/26/trivy-compromise-hardening-sbomify-action/), removing it was a configuration change, not a migration.

For a broader look at the generators themselves, see our [comparison of SBOM generation tools](/2026/01/26/sbom-generation-tools-comparison/).

## Build time is the only time

An SBOM describes what went into a build. The moment that information is complete and unambiguous is **during the build** - when the lockfile, the resolved dependency tree, the commit SHA, the branch and the build environment all exist together.

Afterwards, you are reconstructing. Scanning a released artifact tells you what can be detected from the outside, which is not the same as what went in. Vendored code, statically linked libraries and files copied between Docker build stages are routinely invisible.

Generating in CI also means the SBOM can be **signed where it was made**, tied to the identity of the pipeline that produced it. That is what turns an SBOM from a document into evidence.

## The part most platforms get wrong

Here is the question worth asking any SBOM vendor: **after I upload an SBOM, do you change it?**

Many platforms do. They enrich, normalise formats, deduplicate components, "improve" metadata. It sounds helpful. It quietly destroys the thing that made the SBOM trustworthy.

Consider what a server-side write actually looks like from the outside. A platform that removes a vulnerable component and a platform that tidies up inconsistent metadata are performing the same operation: modifying bytes you cannot inspect. You have no way to distinguish them. Once that is possible, "this product has no known vulnerabilities" is no longer a verifiable statement - it is a claim resting on the vendor's word, and an inconvenient CVE quietly disappearing is indistinguishable from routine housekeeping.

There is a mechanical problem too. If a platform modifies a signed SBOM, **the signature no longer validates**. The platform's options are to break your signature or to re-sign with its own key. Re-signing moves the trust anchor from you to the vendor and breaks the chain of custody: an auditor is now verifying the platform's assertion, not your build.

**sbomify never modifies an artifact you upload.** The bytes received are the bytes stored and the bytes served. No enrichment, no normalisation, no transformation of any kind. The authoritative copy of your SBOM lives in your pipeline; sbomify is a distribution and analysis layer over it, not an editor of it.

That constraint is what makes the guarantee useful:

- Your signature keeps validating, indefinitely.
- What an auditor downloads is byte-for-byte what your pipeline produced.
- Anyone can verify it independently, without trusting sbomify at all.
- Every change made to the SBOM was made in CI, by you, and is listed in the [audit trail](/guides/sbomify-action/advanced/#audit-trail).

### Analysis without modification

Not modifying artifacts does not mean doing nothing with them. sbomify analyses SBOMs and produces **separate** output: vulnerability scan results, compliance assessments against NTIA, CISA, CRA and other frameworks, and attestation verification. All of it reads the artifact and writes findings alongside it. None of it touches the artifact.

### One clarification

This guarantee covers artifacts you _upload_. sbomify does create new artifacts on your behalf where you ask it to - aggregate product-level SBOMs assembled from component SBOMs, VEX and VDR documents generated from scan results, derived compliance reports. Those are new creations, clearly distinct from your uploads, not edits to them. If you distribute them with the same guarantees you apply to your own artifacts, sign them yourself.

## Putting it together

1. **Generate in CI**, where the build context exists, using the right generator for each ecosystem.
2. **Augment** with the organisational metadata only you have.
3. **Enrich** with registry metadata and integrity hashes.
4. **Sign at origin**, before the artifact leaves your pipeline.
5. **Upload** to a platform that will not touch it.

Steps 1 to 3 are what [`sbomify-action`](/guides/sbomify-action/) does in a single step. Step 4 is [attestation](/guides/sbomify-action/advanced/#attestation) or [signing](/faq/how-do-i-sign-an-sbom/). Step 5 is a design guarantee, not a feature.

Ready to start? Head to the [quick start](/guides/sbomify-action/quickstart/).
