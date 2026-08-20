---

title: "BSI TR-03183 Is Now Four Documents, and the CRA Clock Runs Out in Three Weeks"
description: "BSI published TR-03183-1 in version 1.0.0 on 31 July 2026, completing a four-part CRA guideline family. Here is what changed across TR-03183, the Commission's July 2026 guidance, and the ENISA Single Reporting Platform before 11 September."
keywords: "BSI TR-03183, TR-03183-1, TR-03183-3 security.txt, RFC 9116 CRA, CRA reporting 11 September 2026, Single Reporting Platform, EN 40000, CRA harmonised standards, BSI SBOM requirements, CRA compliance 2026"
categories:
  - compliance
tags: [sbom, cra, bsi, tr-03183, compliance, eu, vulnerability-reporting, csaf]
tldr: "For two years, BSI TR-03183 effectively meant Part 2, the SBOM specification. That is no longer true. BSI has since published Part 3 (vulnerability report intake, September 2025), Part H (Module H conformity via an ISO/IEC 27001 ISMS, May 2026), and now Part 1 in version 1.0.0 (general requirements with a machine-readable OSCAL control catalogue, 31 July 2026). Meanwhile the Commission issued its first CRA application guidance on 27 July 2026, ENISA published Single Reporting Platform instructions on 31 July, and no harmonised standard has been cited in the Official Journal yet. Reporting obligations bind on 11 September 2026."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the current version of BSI TR-03183-2?"
    answer: "Version 2.1.0, published on 20 August 2025. It remains the current SBOM specification as of August 2026; there is no version 2.2.0. It requires CycloneDX 1.6 or later, or SPDX 3.0.1 or later, in JSON or XML."
  - question: "What is new in BSI TR-03183-1 version 1.0.0?"
    answer: "Version 1.0.0 is the first stable release of a document that had been in draft since 2023, most recently v0.10.0 in October 2025. The genuinely new element is the Adaptable Risk-based Controls (ARC) framing, where each control is paired with risk scenarios describing affected assets, impact, and environment parameters. The machine-readable OSCAL control catalogue on GitHub and the Annex VII assessment report template were already present in the October 2025 draft. The guideline is explicitly non-binding and gives no presumption of conformity."
  - question: "Does BSI TR-03183 cover the CRA Article 14 reporting obligation?"
    answer: "Not directly. TR-03183-3 covers the intake side of vulnerability handling: publishing a security.txt per RFC 9116, running a coordinated vulnerability disclosure process, and issuing security advisories in OASIS CSAF v2.0. Outbound Article 14 notifications go to the ENISA Single Reporting Platform, which has its own registration process."
  - question: "What does BSI TR-03183-3 require in a security.txt file?"
    answer: "Section 4.2 requires the file at /.well-known/security.txt over HTTPS, and mandates a Canonical URI reachable without redirects, three Contact entries in order (PSIRT mailbox, CSIRT mailbox, then the URI of your incoming-report web page), OpenPGP Encryption keys for those contacts, Preferred-Languages including at least en, a Policy link to your CVD policy, an RFC 3339 Expires value no more than a year ahead and reviewed quarterly, and an OpenPGP digital signature per RFC 9580. A CSAF pointer to your provider-metadata.json and an Acknowledgments page are SHOULD-level. The file must also stay discoverable by web crawlers."
  - question: "Are CRA harmonised standards available yet?"
    answer: "No. The horizontal EN 40000 series and the vertical EN 50770 series are still in development, and no CRA harmonised standard has been cited in the Official Journal. Until one is, the Article 27 presumption of conformity is unavailable. A draft Commission amendment in July 2026 proposes moving the Type A and Type B delivery deadlines from 30 August 2026 to 31 October 2026, and Type C from 30 October to 31 December 2026, but the implementing decision has not been published, so those dates are not yet binding."
  - question: "What do I need to do before 11 September 2026?"
    answer: "Set up EU Login accounts for the ENISA Single Reporting Platform in advance and decide who your Primary and Secondary representatives are, because ENISA provides no submission API and a human will be filling in the form. Have SBOMs for every shipped version so you can answer which products contain an exploited component, and publish a security.txt and coordinated vulnerability disclosure policy so reports reach you in the first place."
date: 2026-08-20
slug: bsi-tr-03183-four-parts-cra-update
---

If you built your [EU Cyber Resilience Act](/compliance/eu-cra/) plan around a single BSI document, it is out of date. Not because the SBOM requirements changed, but because BSI kept publishing.

For most of 2024 and 2025, "BSI TR-03183" was shorthand for Part 2, the SBOM specification. It was the only part anyone needed, and it was the most concrete public answer to the question the CRA leaves open: what does a compliant SBOM actually look like? Since then, BSI has filled in the rest of the picture. TR-03183 is now four documents covering the manufacturer's obligations end to end, and the newest of them landed three weeks ago.

That matters right now because **11 September 2026 is 22 days away**, and that is when CRA reporting obligations start biting.

## What BSI Published

Here is the current state of the family:

| Part                                                | Version | Date           | Scope                                                                                    |
| --------------------------------------------------- | ------- | -------------- | ---------------------------------------------------------------------------------------- |
| Part 1 - General requirements                       | 1.0.0   | 31 July 2026   | Risk-based control selection, with a machine-readable OSCAL control catalogue            |
| Part 2 - Software Bill of Materials (SBOM)          | 2.1.0   | 20 August 2025 | SBOM format, content, data fields, dependency depth, licences                            |
| Part 3 - Vulnerability Reports and Notifications    | 1.0.0   | September 2025 | Receiving vulnerability reports: security.txt, CVD policy, CSAF v2.0 advisories          |
| Part H - Conformity based on full quality assurance | 1.1.0   | 30 May 2026    | Demonstrating conformity through an ISO/IEC 27001 ISMS (Module H) instead of per-product |

Two housekeeping notes before the substance. First, **Part 2 has not changed**. Version 2.1.0 from August 2025 is still current, and if you see a file named `BSI-TR-03183-2_v2_2_0.pdf` on BSI's website, do not get excited: it sits in the archive section and contains the outdated version 1.1 document. There is no v2.2.0. Second, everything in this family is **explicitly non-binding**. Part 1 says so in its own words: it does not establish obligations on manufacturers and does not provide a presumption of conformity. BSI also states that TR-03183 will be replaced by harmonised European standards once those exist.

Non-binding is not the same as unimportant. Germany is making the BSI its CRA market surveillance authority, so the agency writing this guidance is the agency that will eventually be reviewing your technical file.

### Part 1: risk-based controls, in OSCAL

Part 1 reached version 1.0.0 on 31 July 2026, announced on 5 August. Its target audience is stated plainly: manufacturers who do not yet have structured security-by-design and vulnerability-handling processes. It is an on-ramp, aimed at the CRA's default product class.

Set expectations correctly, though: this is a **stable release, not a new document**. Part 1 has been a living draft since 2023, most recently as v0.10.0 in October 2025. If you diff the two, less has changed than the version jump suggests.

What is actually new in 1.0.0 is the framing BSI now calls **Adaptable Risk-based Controls (ARC)**. Rather than handing you a flat checklist, every control comes attached to one or more risk scenarios, each describing the affected assets and impact plus environment parameters: access restriction, interface restriction, user capabilities. You categorise your product's assets by confidentiality, integrity and availability impact, describe the environment each component operates in, and select controls where both the asset impact and the environment match. The underlying risk-scenario method was already in the October draft; 1.0.0 gives it a name and a workflow.

The part that should interest anyone building compliance tooling is not new but is easy to miss: BSI ships the control catalogue in **OSCAL**, NIST's Open Security Controls Assessment Language, at [github.com/tr-03183/tr-03183-1](https://github.com/tr-03183/tr-03183-1) with access details available on request. That repository was already referenced in v0.10.0. Machine-readable controls mean filtering by use case, building custom catalogues, and generating structured assessment evidence rather than another spreadsheet. It is the same instinct that drives machine-readable SBOMs, applied one level up.

Part 1 also includes an assessment report template that mirrors CRA Annex VII. Its contents list is worth reading if you have been treating SBOM generation as a build-pipeline concern, because the SBOM appears there as documentation of conformity, sitting next to the risk assessment, the design documentation, and the vulnerability handling description.

(A small note for anyone citing the document: its cover page is dated 31.07.2026 while its changelog row reads 2025-07-31, and the copyright line still says 2023-2025. The press release announcing version 1.0.0 is dated 5 August 2026, so the 2026 reading is the right one.)

### Part 3: the other half of vulnerability handling

Part 3 covers something the SBOM conversation usually skips: how vulnerability reports reach you in the first place. It is the intake side, not the outbound Article 14 reporting side.

The centrepiece is a **`security.txt`** file per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html), and BSI does not leave it at "publish one." Section 4.2 is unusually prescriptive about the contents:

| Field                 | Requirement | What BSI asks for                                                                                             |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| Location              | MUST        | `/.well-known/security.txt`, over HTTPS, plain ASCII or UTF-8                                                 |
| `Canonical`           | MUST        | The authoritative URI, reachable without redirects                                                            |
| `Contact`             | MUST        | Three entries in order: your PSIRT mailbox, your CSIRT mailbox, then the URI of your incoming-report web page |
| `Encryption`          | MUST        | OpenPGP keys for every contact listed above                                                                   |
| `Preferred-Languages` | MUST        | At least `en`                                                                                                 |
| `Policy`              | MUST        | URI of your CVD policy page                                                                                   |
| `Expires`             | MUST        | RFC 3339, at most one year out, and reviewed at least quarterly                                               |
| Digital signature     | MUST        | OpenPGP-signed per RFC 9580, with key validity capped at five years                                           |
| `CSAF`                | SHOULD      | URI of your `provider-metadata.json`, prefixed with the `CSAF:` tag                                           |
| `Acknowledgments`     | SHOULD      | URI of your researcher acknowledgements page                                                                  |
| Crawler visibility    | MUST        | Firewall and DDoS rules must not block automated discovery                                                    |

Beyond the file itself, Part 3 requires a dedicated web page for incoming reports with a web form, and a coordinated vulnerability disclosure policy that names the corresponding national CSIRT, gives assurances to reporters, sets out a code of conduct, guarantees response times, offers an anonymous reporting option, and explains how the process ends.

And it requires security advisories published in **OASIS CSAF v2.0**, with BSI pointing at the open-source CSAF Provider tooling to generate them.

That last requirement is the same architectural decision as Part 2's rule that SBOMs **must not** contain vulnerability information, viewed from the other end. Static component inventory lives in the SBOM. Dynamic vulnerability state lives in CSAF or [VEX](/2026/02/01/sbom-scanning-vulnerability-detection/). BSI has now specified both halves, and they are designed to be read together: one of Part 2's optional component fields is the component creator's `security.txt` URL. Your SBOM tells a downstream consumer what is inside your product; your `security.txt` tells them where to shout when one of those components turns out to be broken.

If you are wondering whether a three-line `security.txt` clears this bar, check yours against the table. Most do not, and the two most commonly missing MUSTs are the `Policy` link and the OpenPGP signature.

### Part H: conformity through your ISMS

CRA Article 32 lets manufacturers choose their conformity assessment route, and one option is Module H, full quality assurance. Module H assesses the manufacturer's **processes** rather than each individual product. BSI ran a commenting phase on TR-03183-H from 27 February to 31 March 2026 and published version 1.1.0 on 30 May 2026, mapping Module H onto an ISO/IEC 27001-compliant ISMS.

For anyone running an SBOM programme, this is a quietly useful lever. If your SBOM generation, storage, signing and distribution exist as auditable ISMS processes rather than per-release improvisation, Module H lets that work cover an entire portfolio instead of being re-demonstrated product by product. Process maturity becomes the deliverable.

## What Else Moved

BSI was not the only one busy this summer.

**The Commission approved its first CRA application guidance on 27 July 2026** (C(2026) 5252 final). The annex runs to 84 pages with 67 numbered practical examples, and works through the questions manufacturers actually ask: what counts as a product with digital elements, when free and open-source software falls in scope, what makes a modification substantial, how support periods work, and how reporting obligations apply. It is non-binding, and only the Court of Justice can authoritatively interpret the CRA, but it will shape how market surveillance authorities and notified bodies read the regulation.

Worth setting expectations: the words "SBOM" and "software bill of materials" do not appear anywhere in those 84 pages. If you were hoping the Commission would finally pin down SBOM format and content, this is not that document, and Article 13(24) implementing acts still have not arrived.

Two paragraphs in it _are_ directly relevant to anyone triaging component vulnerabilities:

**Paragraph 218 — third-party components.** If your product contains an actively exploited vulnerability originating from a third-party component, you must report it. But where you know a component carries a vulnerability that either (i) cannot be exploited in your product (the guidance's own example: the vulnerable code is not reachable) or (ii) has not been exploited in your product, it is not an actively exploited vulnerability _contained in your product_, and mandatory reporting does not bite. You can still notify voluntarily under Article 15, you still owe the Annex I Part II vulnerability handling duties, and you still have to report it upstream to the component's maintainer under Article 13(6).

Read that again as an engineering requirement: the Commission has made "is the vulnerable code reachable in our product?" a question with a legal consequence. That is a VEX-shaped determination sitting directly on top of your SBOM.

**Paragraph 217 — no retroactive reporting.** Vulnerabilities you already knew were being exploited before 11 September 2026 do not need reporting. But if you knew about a vulnerability before that date without knowing it was exploited, and exploitation happens or surfaces afterwards, the clock starts then. Your pre-September backlog is not a safe harbour.

**ENISA published step-by-step Single Reporting Platform instructions on 31 July 2026.** Three details deserve attention:

1. **Registration happens through EU Login**, with a nominated Primary and Secondary representative. ENISA says EU Login accounts can be created in advance, and that a representative's validation by the coordinator CSIRT happens after first access, in parallel with reporting. So being unregistered will not formally block you — but a 24-hour early-warning window is not when you want to be discovering the flow.
2. **There is no reporting API at launch.** ENISA's own FAQ states that "no Application Programming Interfaces will be provided at this stage." You can automate your internal workflow right up to submission, but a human types the final form into a browser. That makes the quality of your internal triage data the rate-limiting factor, not your integration work.
3. **The 24-hour early warning is deliberately minimal**: notification type and level, manufacturer or steward name, product, title, and whether malicious acts are suspected. The 72-hour notification adds the nature of the vulnerability, exploitation details and corrective measures. Minimal does not mean easy, because "product" means knowing which of your products and versions are affected.

**Harmonised standards are still not there.** The horizontal EN 40000 series (vocabulary, cyber resilience principles, vulnerability handling, technical security controls) and the vertical EN 50770 series for OT products are in development, but **no CRA harmonised standard has been cited in the Official Journal**. Until one is, nobody gets the Article 27 presumption of conformity, and everyone demonstrates conformity by describing the solutions they adopted. A draft Commission amendment in early July 2026 proposes pushing the delivery deadlines back two months — Type A and Type B to 31 October 2026, Type C to 31 December 2026 — but the implementing decision has not been published, so those dates are proposed rather than binding. Reporting from standardisation trackers suggests only the vulnerability handling part, prEN 40000-1-3, is currently expected to be cited at all; drafts are not public, so treat that as directional.

**Product classification is settled, though.** [Implementing Regulation (EU) 2025/2392](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502392), adopted on 28 November 2025 and in force since 21 December 2025, provides the technical descriptions behind the CRA's "important" and "critical" product categories, and confirms that a product's core functionality drives classification rather than ancillary or embedded features. Classification determines your conformity assessment route, which determines who reads your technical documentation and how closely.

## What This Actually Changes for SBOM Practice

The SBOM requirements did not move. TR-03183-2 v2.1.0 still asks for CycloneDX 1.6+ or SPDX 3.0.1+ in JSON or XML, still requires recursion down each dependency path to the first component outside your scope of delivery, still requires SHA-512 hashes and SPDX licence identifiers and a completeness indicator on dependency enumeration, and still forbids vulnerability data inside the document. If you were compliant in 2025, you are compliant now.

What changed is the surrounding scaffolding, and it points in one direction: **the SBOM is documentation of conformity, not a build artefact**.

Three consequences worth internalising:

- **Retention is a decade.** CRA Article 13(13) requires technical documentation to stay at the disposal of market surveillance authorities for at least 10 years after the product is placed on the market, or for the support period, whichever is longer. Article 31(2) requires it to be continuously updated during the support period. Combine that with TR-03183-2's rule of one SBOM per software version, and you are not producing an SBOM, you are running a queryable archive.
- **Top-level dependencies are a floor, not a target.** The CRA text asks for "at least the top-level dependencies." BSI asks for considerably more, and the September reporting clock asks for more still. When an exploited CVE lands in a transitive dependency, the legal minimum will not answer the question you are being asked in 24 hours.
- **Intake and outbound are separate problems.** Part 3 makes sure researchers can reach you. The SRP makes sure you can reach the CSIRT. The SBOM sits in the middle, converting "there is a bug in library X" into "these seven product versions are affected, and in four of them the code is not reachable." Neither BSI nor ENISA will do that step for you.

## The Three-Week Checklist

If you sell products with digital elements into the EU, here is what needs to be true before 11 September:

1. **Get EU Login sorted for the ENISA Single Reporting Platform.** Accounts created, Primary and Secondary representatives named, done now rather than under pressure. There is no API, so make sure the people who will actually submit have working access.
2. **Know what is in your shipped versions.** SBOMs for every version currently in the field, stored somewhere you can query in minutes rather than reconstruct in days. This is the whole ball game for a 24-hour deadline.
3. **Publish a security.txt and a CVD policy.** Per TR-03183-3 and RFC 9116. If reports cannot reach you, your 24-hour clock starts late and you find out from someone else.
4. **Be able to produce CSAF advisories.** Not strictly required by Article 14, but it is where BSI is pointing, and Article 14(8) already expects you to inform users "where appropriate in a structured, machine-readable format that is easily automatically processable."
5. **Check your classification** against Implementing Regulation (EU) 2025/2392 before you assume self-assessment is available to you.

Everything else on the CRA list can wait for December 2027. These five cannot.

## How sbomify Helps

sbomify generates SBOMs automatically in CI/CD with the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action), keeps one per product version in a queryable archive rather than a folder of attachments, and continuously matches components against vulnerability data so "which of our releases contain this?" is a query instead of a project. Our **BSI TR-03183-2 v2.1.0 plugin** grades each uploaded SBOM against the format, SBOM-level and component-level requirements and shows you the gaps before an authority does.

On the Part 3 side, every [Trust Center](/faq/what-is-a-trust-center/) can publish an RFC 9116 `security.txt` at `/.well-known/security.txt`, populated from your workspace security contacts, with `Canonical`, `Encryption`, `Preferred-Languages` and `Expires` filled in for you. Toggle it on in **Settings > Trust Center**; ours is live at [trust.sbomify.com](https://trust.sbomify.com/.well-known/security.txt). Our [CRA Compliance Wizard](/faq/how-do-i-use-cra-compliance/) then reuses those values in its vulnerability-handling step rather than asking you to retype them, and tracks your ENISA SRP registration status alongside them. If you are chasing full TR-03183-3 conformance, the fields you will still need to add yourself are the `Policy` link to your CVD policy, the `CSAF` pointer to your `provider-metadata.json`, the full PSIRT/CSIRT contact ordering, and the OpenPGP signature over the file.

The trajectory here is not subtle. Regulators started by asking whether you have an SBOM. They have moved on to asking how fast you can use one. BSI just published three more documents describing the machinery around that question, and in three weeks the first part of it stops being advisory.

Further reading: our [EU CRA compliance guide](/compliance/eu-cra/), the [BSI TR-03183-2 summary](/compliance/bsi-tr-03183/), and [the CRA explained for device manufacturers](/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/).
