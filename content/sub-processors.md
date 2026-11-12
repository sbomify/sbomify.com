---

url: /legal/sub-processors/
title: Sub-processors
description: The third parties sbomify uses to process customer data, what each one receives and where it is processed
keywords: sbomify sub-processors, subprocessors, GDPR, UK GDPR, data processing, vendor due diligence
---

Last updated: November 12, 2026

When you use the sbomify platform, sbomify ltd acts as a data processor for the personal data and content you submit (see our [Terms of Service](/terms/) and [Privacy Policy](/privacy/)). To provide the service we use a small number of third parties that may process that data on our behalf. These are our sub-processors.

This page lists every one of them, what it does for us, the data it receives and where it processes it. A third party that never receives customer content or personal data, such as a package mirror or a public threat feed we only download from, is not a sub-processor and is not listed.

## Current sub-processors

| Sub-processor             | Purpose                                                                                                      | Data processed                                                                                                                                                                                                                             | Processing location                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| **Hetzner Online GmbH**   | Data centre hosting. The dedicated servers sbomify runs on, including the application, database and backups  | All data held in the platform's database and on its servers: account and workspace records, SBOM metadata, vulnerability results and backups of them                                                                                       | Helsinki, Finland (EU)                                         |
| **Cloudflare, Inc.**      | Edge network: DNS, TLS termination, DDoS protection, web application firewall and bot protection (Turnstile) | Full HTTP requests and responses to the service, including uploads and downloads, session cookies and API tokens, IP addresses and user agents                                                                                             | Global edge network, served from the location nearest the user |
| **Cloudflare, Inc.** (R2) | Object storage                                                                                               | SBOM files, uploaded compliance documents, and media such as logos and Trust Center assets. Encrypted at rest                                                                                                                              | Western Europe                                                 |
| **Stripe**                | Subscription billing and payments                                                                            | Workspace identifier, billing contact email, subscription plan and status. Card details are entered on Stripe-hosted pages and never reach sbomify                                                                                         | United States and EU                                           |
| **Mailjet SAS** (Sinch)   | Transactional email, and our newsletter for those who subscribe                                              | Recipient name and email address, and the content of the message: invitations, notifications, account and sign-in emails                                                                                                                   | EU                                                             |
| **PostHog, Inc.**         | Product analytics                                                                                            | Pseudonymous user or workspace identifier, page and feature interaction events, IP address and user agent. Email addresses are only ever sent as a one-way hash. No SBOM content. On sbomify.com, analytics run only after you accept them | United States                                                  |
| **Google LLC** (OSV.dev)  | Vulnerability matching against the Open Source Vulnerabilities database                                      | Package name, ecosystem, version and package URL of components being checked. Not the SBOM file, component relationships, or any user or workspace identifier                                                                              | Global                                                         |

## What stays in-house

Several parts of the platform that are often outsourced run on infrastructure sbomify operates itself, inside the hosting environment above, and are therefore not sub-processors:

- **Sign-in and identity.** Accounts are managed by our own identity provider.
- **Vulnerability scanning.** Complete SBOMs are analysed by a Dependency-Track instance we operate. The only SBOM-derived data that leaves our environment for scanning is the package list sent to OSV, described above.
- **Logs and error tracking.** Application and system logs, and error reports, stay on our own servers. We use no third-party logging, monitoring or error-tracking service.

Customer SBOM content is never used to train AI models, and is not sent to AI or LLM services.

## Services you choose to connect

Some features connect sbomify to an account you hold with another provider, such as signing in with Google or GitHub, publishing from your CI pipeline, or syncing controls from Vanta. Data exchanged with those services is exchanged at your direction and under your own agreement with that provider, so they are not sbomify's sub-processors.

## International transfers

Data at rest in our database is held in Finland, and SBOM files and uploaded documents are stored in Western Europe. Where a sub-processor processes personal data outside the UK or the EEA, as PostHog and Stripe can in the United States, the transfer is covered by appropriate safeguards under UK and EU data protection law, such as the UK International Data Transfer Addendum and the EU Standard Contractual Clauses.

## Changes to this list

Before we add or replace a sub-processor that will receive customer data, we review it and update this page first. Customers with a data processing agreement that requires advance notice of changes are notified in line with that agreement.

Questions about our sub-processors, or a request for more detail as part of a security review, can go to <privacy@sbomify.com>.
