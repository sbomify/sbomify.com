---
title: "What is security.txt?"
seo_title: "What Is security.txt? RFC 9116 Explained, With Example"
description: "What a security.txt file is, the RFC 9116 fields (Contact, Expires, Policy, CSAF and more), where to host it, an example, and how sbomify publishes one from your Trust Center."
answer: "security.txt is a plain-text file, defined in RFC 9116, served at /.well-known/security.txt. It tells security researchers how to report a vulnerability to you. Contact and Expires are required; optional fields include Policy, Encryption, Acknowledgments, Preferred-Languages, Canonical, Hiring, and CSAF, which points to your CSAF advisory feed."
tldr: "security.txt is a small text file at /.well-known/security.txt that tells researchers where to report vulnerabilities. RFC 9116 requires a Contact and an Expires field (keep Expires under a year out), and recommends a Policy link to your disclosure policy. The CSAF field lets automated tools find your machine-readable security advisories. sbomify can publish a security.txt from your Trust Center, including the CSAF pointer."
weight: 79
keywords: [security.txt, security txt file, RFC 9116, well-known security.txt, security.txt example, security.txt CSAF, vulnerability reporting contact, security contact]
url: /faq/what-is-security-txt/
---

## What is security.txt?

`security.txt` is a plain-text file that tells security researchers how to contact you about a vulnerability. It was standardised in 2022 as [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) and lives at a fixed path on your domain:

```text
https://example.com/.well-known/security.txt
```

It solves a simple problem. A researcher who finds a flaw in your product should not have to hunt through your website, LinkedIn and support portal to find someone who will take the report seriously.

## Example security.txt

```text
Contact: mailto:security@example.com
Contact: https://example.com/security/report
Expires: 2027-09-30T00:00:00.000Z
Encryption: https://example.com/pgp-key.txt
Preferred-Languages: en, de
Policy: https://example.com/security/disclosure-policy
Acknowledgments: https://example.com/security/hall-of-fame
Canonical: https://example.com/.well-known/security.txt
CSAF: https://example.com/.well-known/csaf/provider-metadata.json
```

## security.txt fields

| Field                 | Required | What it is for                                                                                                                               |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Contact`             | Yes      | Where to send reports: an email address, a URL or a phone number. Can repeat, in order of preference                                         |
| `Expires`             | Yes      | When the file should be considered stale. RFC 9116 recommends less than a year in the future                                                 |
| `Policy`              | No       | Link to your [vulnerability disclosure policy](/faq/what-is-a-vulnerability-disclosure-program/)                                             |
| `Encryption`          | No       | Link to a key for encrypted reports                                                                                                          |
| `Acknowledgments`     | No       | Link to a page crediting researchers                                                                                                         |
| `Preferred-Languages` | No       | Languages your team can handle reports in                                                                                                    |
| `Canonical`           | No       | The URL(s) where this file is meant to live, to detect copies                                                                                |
| `Hiring`              | No       | Link to security job openings                                                                                                                |
| `CSAF`                | No       | Link to your CSAF `provider-metadata.json`, so tools can find your machine-readable [security advisories](/faq/what-is-a-security-advisory/) |

The file can be signed with OpenPGP so readers can check it was not tampered with.

## Common mistakes

- **Letting it expire.** An expired `Expires` date tells readers the information may be wrong. Set a calendar reminder or generate the file automatically.
- **Wrong location.** It belongs at `/.well-known/security.txt`, served over HTTPS as `text/plain`. A copy at `/security.txt` is allowed for older readers, but the well-known path is the one that counts.
- **A contact nobody reads.** The address must reach the people who triage vulnerabilities, not a general support queue.
- **No policy.** A contact without a policy leaves the researcher guessing about safe harbour and timelines.

## Is security.txt required?

RFC 9116 itself is voluntary, but regulation is moving towards it. The [EU Cyber Resilience Act](/compliance/eu-cra/) requires manufacturers to provide a contact address for reporting vulnerabilities, and Germany's [BSI TR-03183](/compliance/bsi-tr-03183/) part 3 describes the vulnerability-reporting information it expects a manufacturer to publish, for which security.txt is the natural home. Many national CERTs and bug bounty platforms check for it automatically.

## Publishing security.txt with sbomify

If you run your [Trust Center](/features/trust-center/) on sbomify, you can switch on security.txt in **Settings > Trust Center**. sbomify serves it at `/.well-known/security.txt` on your Trust Center domain, keeps `Expires` within a year, and, if you publish [security advisories](/features/security-advisories/), adds the `CSAF` field pointing at your CSAF 2.0 provider metadata. See [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/) for the steps.
