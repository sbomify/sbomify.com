---
title: "What is a security advisory?"
seo_title: "What Is a Security Advisory? Contents, Formats, Examples"
description: "What a security advisory is, what a good one contains, the machine-readable formats (CSAF, OSV, CycloneDX VEX), and how the EU Cyber Resilience Act turns publishing them into an obligation."
answer: "A security advisory is a vendor's public notice about a vulnerability in its own product: what is affected, how severe it is, which versions are fixed, and what customers should do. A good advisory names the CVE, gives a CVSS score and vector, lists affected and fixed version ranges per product, and keeps a dated timeline. Publishing one in a machine-readable format such as CSAF 2.0 lets customers' tooling consume it automatically."
tldr: "A security advisory is the vendor's own statement about a vulnerability in its product: affected versions, fixed versions, severity, and remediation. It differs from a CVE record, which describes the flaw, by telling your customers what it means for the product they run. Publish advisories in one predictable place, in a human-readable page and a machine-readable format like CSAF 2.0, and keep the timeline honest. Under the EU Cyber Resilience Act, disclosing fixed vulnerabilities is mandatory for products sold in the EU."
weight: 73
keywords: [security advisory, security advisories, security advisory page, vendor security advisory, product security advisory, CSAF, CSAF 2.0, security bulletin, CVE advisory, CRA vulnerability disclosure]
url: /faq/what-is-a-security-advisory/
---

## What is a security advisory?

A security advisory is a notice a vendor publishes about a vulnerability in its own product. It answers the questions a customer has when a new CVE appears in the news: _Am I affected? How bad is it? What version fixes it? What do I do until I can upgrade?_

Vendors call them different things, such as security bulletins, product security notices or PSIRT advisories, but the content is the same. Most software companies of any size keep an index of them on a security advisories page or in their [Trust Center](/faq/what-is-a-trust-center/).

## Security advisory vs CVE record

A CVE record and a security advisory are often confused, but they do different jobs:

|              | CVE record                         | Security advisory                                |
| ------------ | ---------------------------------- | ------------------------------------------------ |
| Published by | A CVE Numbering Authority (CNA)    | The vendor of the affected product               |
| Describes    | The flaw itself                    | What the flaw means for a specific product       |
| Versions     | The vulnerable upstream code       | Your affected and fixed product versions         |
| Audience     | Everyone, via the CVE List and NVD | Your customers                                   |
| Remediation  | Usually generic                    | Specific: upgrade path, workarounds, mitigations |

A single upstream CVE in a library such as OpenSSL can lead to dozens of vendor advisories, one from each product that ships the library. It can also lead to a [VEX](/faq/how-do-i-use-vex/) statement that says the product is _not_ affected, which is often what customers most want to hear.

## What should a security advisory contain?

A useful advisory contains at least:

- **Identifier**: your own advisory ID, plus every CVE (or GHSA, OSV) ID it covers
- **Summary**: one or two plain-language sentences on the issue and its impact
- **Severity**: a rating with its CVSS score _and_ vector, so readers can recompute it for their environment
- **Affected products and versions**: per product, as version ranges a reader can compare against what they run
- **Fixed versions**: the first version of each product that contains the fix
- **Remediation and workarounds**: what to do now, and what to do if you cannot upgrade yet
- **Timeline**: dated entries from first report to fix, updated as the investigation moves
- **Credits**: the researcher who reported it, if they want to be named
- **References**: links to the CVE record, patches and related advisories

Two details separate a good advisory from a bad one. Version ranges should answer "am I on an affected version?" directly, for example `>= 11.2.0, < 11.2.4` affected and `>= 11.2.4` fixed. Severity should never be shown only as a colour.

## Machine-readable advisory formats

A web page is read by humans. Enterprise customers increasingly ingest advisories automatically and match them against their asset inventory and SBOMs. The main formats are:

- **CSAF 2.0** (Common Security Advisory Framework): the OASIS standard for vendor advisories, with a `csaf_security_advisory` profile for advisories and a `csaf_vex` profile for VEX. It defines a discovery mechanism, `/.well-known/csaf/provider-metadata.json`, so aggregators can find every advisory you publish. Germany's BSI and US CISA both promote it.
- **OSV**: the format used by the OSV.dev database, popular for open source ecosystems.
- **CycloneDX VEX**: exploitability statements attached to a CycloneDX SBOM, suited to "affected / not affected" communication per component.

If you only pick one for product advisories, CSAF 2.0 is the format regulators and large buyers ask for.

## Are security advisories required?

For products sold in the EU, increasingly yes. The [EU Cyber Resilience Act](/compliance/eu-cra/) requires manufacturers, in Annex I Part II, to:

- publicly disclose information about fixed vulnerabilities once a security update is available, including a description, the affected products, the impact, the severity, and remediation guidance
- distribute security updates together with advisory messages telling users what to do
- run a coordinated vulnerability disclosure policy and publish a contact address for reports (see [vulnerability disclosure programs](/faq/what-is-a-vulnerability-disclosure-program/))

Separately, Article 14 requires actively exploited vulnerabilities to be reported to authorities through ENISA's [Single Reporting Platform](/2026/09/10/cra-single-reporting-platform-enisa-srp/) from 11 September 2026. The public advisory is what your customers see. The ENISA report is what regulators see.

## How to publish security advisories with sbomify

sbomify's [Security Advisories](/features/security-advisories/) module lets you write an advisory next to the SBOMs and vulnerability findings it is about, and publish it on your Trust Center:

- Author the summary, CVSS vector, affected and fixed version ranges per product, and a dated timeline
- Choose **Public**, **Gated** (only readers with access to the affected product, under NDA) or **Private** visibility
- Every public advisory is also served as a **CSAF 2.0** document, with `provider-metadata.json` and a ROLIE feed for automated discovery
- Your Trust Center's [security.txt](/faq/what-is-security-txt/) can point at the CSAF provider, so tools can go from your domain to your advisories without a human

See a live example on [trust.sbomify.com](https://trust.sbomify.com/).
