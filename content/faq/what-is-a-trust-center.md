---
title: "What is a Trust Center?"
seo_title: "What Is a Trust Center? Examples and How to Build One"
description: "What a Trust Center is, what it should contain, compliance vs product security trust centers, how it replaces security questionnaires, and how to build one with sbomify."
answer: "A Trust Center is a public-facing page where organizations share security artifacts like SBOMs, compliance documents, security advisories, and attestations with customers and partners - building transparency and trust."
tldr: "A Trust Center (also called a trust portal or security trust center) is one URL where customers find your security and compliance evidence instead of emailing you for it. Compliance-focused trust centers hold SOC 2 reports and policies. Product security trust centers also publish SBOMs, VEX, security advisories and a vulnerability disclosure policy, which is what customers ask for when a new CVE lands and what the EU Cyber Resilience Act expects."
weight: 70
keywords: [Trust Center, what is a trust center, trust portal, security trust center, trust center examples, trust center vs security questionnaire, security artifacts, SBOM sharing, sbomify Trust Center, software transparency]
url: /faq/what-is-a-trust-center/
---

## What is a Trust Center?

A Trust Center is a dedicated page where your organization publicly shares security and compliance information about your company and your products. Instead of handling security questionnaires, SBOM requests and "are you affected by this CVE?" emails one at a time, you provide a single URL where customers, partners and auditors can find everything they need.

You will also see it called a **trust portal**, **security portal**, or **security trust center**. They are the same idea. They usually live on a subdomain such as `trust.example.com`.

## What goes in a Trust Center?

A complete Trust Center typically includes:

- **Certifications and audit reports**: SOC 2, ISO 27001, penetration test summaries, often gated behind an NDA
- **Policies**: security, privacy, data processing and subprocessors
- **SBOMs**: a current [Software Bill of Materials](/what-is-sbom/) for each product release
- **VEX statements**: which known vulnerabilities do and do not affect your product ([how VEX works](/faq/how-do-i-use-vex/))
- **Security advisories**: your public notices about vulnerabilities in your products, with affected and fixed versions ([what is a security advisory?](/faq/what-is-a-security-advisory/))
- **Vulnerability disclosure policy and security.txt**: how researchers report issues to you ([VDP](/faq/what-is-a-vulnerability-disclosure-program/), [security.txt](/faq/what-is-security-txt/))
- **Compliance status**: which frameworks and regulations each product meets, such as a CRA Declaration of Conformity

## Compliance trust centers vs product security trust centers

There are two broad kinds of Trust Center, and many organizations need both:

|                 | Compliance trust center                                          | Product security trust center                                  |
| --------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Answers         | "Is this vendor run securely?"                                   | "Is this product secure, and am I affected?"                   |
| Typical content | SOC 2, ISO 27001, policies, questionnaire answers                | SBOMs, VEX, security advisories, CSAF feeds, disclosure policy |
| Updated         | When an audit or policy changes                                  | With every release and every new CVE                           |
| Main audience   | Procurement and GRC teams                                        | Security teams, PSIRTs, regulators                             |
| Typical tools   | GRC platforms such as Vanta, Drata (SafeBase), Conveyor, Whistic | sbomify                                                        |

Compliance trust centers are mostly about the company. Product security trust centers are about the software it ships. As CVE volumes keep climbing and regulation such as the [EU Cyber Resilience Act](/compliance/eu-cra/) makes vulnerability disclosure mandatory, customers increasingly expect the second kind as well.

## Trust Center vs security questionnaires

Security questionnaires are the traditional way buyers vet vendors: a spreadsheet of a few hundred questions, answered by hand for each deal. A Trust Center does not remove them entirely, but it changes the dynamic:

- **Self-service first**: buyers find most answers before they send a questionnaire
- **Evidence, not assertions**: an SBOM or an advisory history is more convincing than a "Yes" in a cell
- **Always current**: questionnaire answers go stale; a Trust Center fed from your CI pipeline does not
- **One answer, many readers**: the same page serves every customer, partner and auditor

## Trust Center examples

Most large software and cloud vendors now run a Trust Center, typically at `trust.<company>.com`. Looking at a few shows the range: some are a list of compliance badges with a "request access" button, others include product-level security advisories and downloadable SBOMs.

sbomify's own Trust Center at [trust.sbomify.com](https://trust.sbomify.com/) is an example of the product security kind: SBOMs per release, VEX, compliance documents and the security contact, generated from the same pipeline that builds the software.

## Why does it matter?

Enterprise buyers and regulated industries increasingly require evidence of security practices during procurement. A Trust Center:

- **Reduces friction**: customers self-serve instead of sending questionnaires
- **Scales trust**: one page serves all customers, partners, and auditors
- **Answers the CVE question fast**: when a new vulnerability makes headlines, customers check your advisories and VEX instead of opening a ticket
- **Demonstrates maturity**: shows you take supply chain security seriously
- **Meets compliance requirements**: the CRA requires vulnerability disclosure and transparency about software composition

## sbomify's Trust Center

sbomify includes a built-in [Trust Center](/features/trust-center/) that automatically publishes your SBOMs, VEX, compliance documents and [security advisories](/features/security-advisories/). A public Trust Center is included on the free Community plan; a custom domain and private components come with Business and Enterprise ([pricing](/pricing/)).

Key features:

- **Automatic updates**: when you upload a new SBOM from CI, your Trust Center reflects it immediately
- **Custom domain**: map your Trust Center to your own domain (e.g., trust.yourcompany.com)
- **Granular access**: choose which components and advisories are public, gated behind an NDA, or private
- **Security advisories with CSAF 2.0**: publish advisories for people and machines
- **security.txt**: an RFC 9116 contact file served from your Trust Center domain
- **Compliance badges**: show which standards your products meet

## Getting started

1. [Sign up for sbomify](https://app.sbomify.com)
2. Upload your SBOMs, or generate them in CI with the [sbomify GitHub Action](/sbomify-action/quickstart/)
3. Configure your Trust Center settings ([step-by-step guide](/faq/how-do-i-set-up-a-trust-center/))
4. Optionally map it to your own domain
5. Share the URL with customers

No additional hosting is required. sbomify handles everything.
