---
title: "What is a PSIRT?"
seo_title: "What Is a PSIRT? Product Security Incident Response"
description: "What a Product Security Incident Response Team (PSIRT) does, how it differs from a CSIRT, the standards it follows, and the minimum a small vendor needs to run one."
answer: "A PSIRT (Product Security Incident Response Team) is the function inside a vendor that receives, triages, fixes and discloses vulnerabilities in the products the company sells. Unlike a CSIRT, which protects the company's own infrastructure, a PSIRT protects customers by publishing security advisories, coordinating with researchers and issuing fixes."
tldr: "A PSIRT handles vulnerabilities in the products you ship, while a CSIRT handles incidents in your own network. Its job is a loop: receive reports, triage, fix, disclose, learn. The FIRST PSIRT Services Framework and ISO/IEC 29147 and 30111 describe how to do it well. Even a two-person team can run one with a published disclosure policy, a security.txt, an SBOM-backed way to answer 'are we affected?', and a predictable place to publish advisories."
weight: 74
keywords: [PSIRT, what is PSIRT, product security incident response team, PSIRT process, PSIRT vs CSIRT, FIRST PSIRT Services Framework, ISO 29147, ISO 30111, product security, vulnerability handling]
url: /faq/what-is-a-psirt/
---

## What is a PSIRT?

A **PSIRT**, or Product Security Incident Response Team, is the team (or role) inside a vendor responsible for vulnerabilities in the products the company sells. When a researcher, customer or upstream project reports a flaw, the PSIRT owns it until customers have the information and the fix they need.

Large vendors such as Cisco, Fortinet and IBM run dedicated PSIRTs with public advisory portals. In a smaller company the PSIRT is often a few engineers and a security lead, but the responsibilities are the same.

## PSIRT vs CSIRT

The two are easy to confuse:

- A **CSIRT** (Computer Security Incident Response Team) protects the organisation's own systems: laptops, cloud accounts, networks. Its customers are internal.
- A **PSIRT** protects the people who _use your products_. Its output is security advisories, patches and VEX statements, and its customers are external.

Many companies have both, and they work together when an incident in your own infrastructure affects the product, as in a build system compromise.

## What does a PSIRT do?

The [FIRST PSIRT Services Framework](https://www.first.org/standards/frameworks/psirts/) groups the work into service areas. In practice it is a loop:

1. **Intake**: receive reports through a published channel, such as a [security.txt](/faq/what-is-security-txt/) contact, a web form or a bug bounty, under a [vulnerability disclosure policy](/faq/what-is-a-vulnerability-disclosure-program/)
2. **Triage**: reproduce the issue, score it (CVSS), and work out which products and versions are affected
3. **Remediation**: get a fix built, tested and released within your patch SLA
4. **Disclosure**: publish a [security advisory](/faq/what-is-a-security-advisory/), request or assign a CVE, notify customers, and report to regulators where required
5. **Learning**: track metrics such as time to triage and time to remediate, and fix the process that let the issue ship

The two ISO standards most PSIRTs reference are **ISO/IEC 29147** (vulnerability disclosure) and **ISO/IEC 30111** (vulnerability handling processes).

## Why every vendor now needs one

There are two reasons it is no longer optional:

- **CVE volume.** The number of published CVEs keeps setting records every year. Every one of them that touches a dependency you ship turns into a customer asking "are you affected?". Without a PSIRT process, those questions go to whichever engineer the account manager knows.
- **Regulation.** The [EU Cyber Resilience Act](/compliance/eu-cra/) makes vulnerability handling a legal obligation for products sold in the EU: a coordinated vulnerability disclosure policy, a reporting contact, public disclosure of fixed vulnerabilities, and from 11 September 2026, reporting actively exploited vulnerabilities to authorities within 24 hours.

## The minimum viable PSIRT

A small vendor does not need a large team. It needs:

- A **published disclosure policy** and a **contact** (security.txt at `/.well-known/security.txt`)
- **SBOMs for every release**, so "are we affected by CVE-X?" is a query, not an investigation
- A way to record **"not affected" decisions** as [VEX](/faq/how-do-i-use-vex/), so you only answer each question once
- A **patch SLA** per severity, and a way to measure it
- A predictable, public place to **publish advisories**, ideally also as machine-readable CSAF

sbomify covers the last four in one place: SBOM-based vulnerability scanning, VEX triage, patch SLA targets with the CRA KPIs, and [security advisories](/features/security-advisories/) published to your [Trust Center](/features/trust-center/) with a CSAF 2.0 feed and security.txt.
