---

url: /compliance/eu-cra/
title: "EU Cyber Resilience Act (CRA) SBOM Requirements"
description: "Complete guide to CRA SBOM requirements with the BSI TR-03183 family (Parts 1, 2, 3 and H). Covers format requirements, data fields, dependency depth, the September 2026 reporting deadline, harmonised standards status, and a compliance checklist."
keywords: [EU CRA SBOM, Cyber Resilience Act SBOM, CRA Annex I Part II, BSI TR-03183, CRA reporting obligations, Single Reporting Platform, EN 40000, CRA harmonised standards]
---

[← Back to Compliance Overview](/compliance/)

**Who it affects:** Manufacturers (and, depending on role, importers/distributors) placing "products with digital elements" on the EU market, plus their software/component supply chains.

<div class="cta-box">
  <p><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="cta-button">Get in Touch</a>
</div>

---

## What Changed Recently

This page is current as of **August 2026**. The CRA landscape has moved substantially since the regulation entered into force:

| Development                                                                                                                                                                             | Date             | Why it matters for SBOM                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Commission Implementing Regulation (EU) 2025/2392](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502392) - technical descriptions of important and critical products | 28 November 2025 | Determines your conformity assessment route, and therefore how much scrutiny your technical documentation (including the SBOM) gets |
| [BSI TR-03183-3](https://bsi.bund.de/dok/TR-03183-en) v1.0.0 - Vulnerability Reports and Notifications                                                                                  | September 2025   | The intake side of vulnerability handling: security.txt, CVD policy, CSAF advisories                                                |
| [BSI TR-03183-H](https://bsi.bund.de/dok/TR-03183-en) v1.1.0 - Conformity based on full quality assurance (Module H)                                                                    | 30 May 2026      | Lets manufacturers demonstrate CRA conformity through an ISO/IEC 27001 ISMS rather than per-product assessment                      |
| [Commission CRA guidance](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation) C(2026) 5252           | 27 July 2026     | 84 pages and 67 worked examples on scope, open source, support periods and reporting. Non-binding, but shapes enforcement           |
| [ENISA Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp) step-by-step instructions                        | 31 July 2026     | You need EU Login accounts and named representatives registered before the 24-hour clock can ever start                             |
| [BSI TR-03183-1](https://bsi.bund.de/dok/TR-03183-en) v1.0.0 - General requirements                                                                                                     | 31 July 2026     | First stable release of BSI's general CRA requirements guideline, after two years in draft                                          |

The single most important thing on that list is the one that is not a document: **reporting obligations bind from 11 September 2026**, and the [Single Reporting Platform](#reporting-obligations-from-11-september-2026) requires registration you cannot do retroactively.

---

## Overview

The [EU Cyber Resilience Act (CRA)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj) (Regulation EU 2024/2847) mandates cybersecurity requirements for products with digital elements, including an SBOM requirement. Unlike US guidance documents, the CRA is **binding law** in the EU.

This page covers:

- **CRA legal baseline** - what the regulation text requires
- **The BSI TR-03183 family** - Germany's Federal Office for Information Security (BSI) publishes a four-part [Technical Guideline](https://bsi.bund.de/dok/TR-03183-en) that is the most concrete public interpretation of CRA obligations, with Part 2 specifying SBOM format and content
- **Harmonised standards** - where the EN 40000 series stands, and why it does not yet give you a presumption of conformity

> **Terminology note:** In BSI TR-03183-2, RFC 2119 keywords (MUST, SHALL, SHOULD, etc.) are normative **only when written in ALL CAPS**. (BSI TR-03183-2, Section 2)

---

## CRA Timeline: Where Things Stand

The CRA applies in stages (Article 71):

| Date              | Milestone                                                                                                                            | Status   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 10 December 2024  | CRA entered into force                                                                                                               | Done     |
| 21 December 2025  | Implementing Regulation (EU) 2025/2392 (technical descriptions of important and critical products) entered into force                | Done     |
| 11 June 2026      | Rules on notified bodies and conformity assessment (Chapter IV, Articles 35-51) began to apply                                       | Done     |
| 27 July 2026      | Commission published its first set of CRA application guidance (C(2026) 5252)                                                        | Done     |
| 11 September 2026 | Reporting obligations for actively exploited vulnerabilities and severe incidents begin (Article 14)                                 | Upcoming |
| 31 October 2026   | Proposed deadline for the horizontal (Type A) and vulnerability-management (Type B) harmonised standards under mandate M/606         | Proposed |
| 11 December 2026  | Member States to "strive to ensure" a sufficient number of notified bodies in the Union (Article 35(2))                              | Upcoming |
| 31 December 2026  | Proposed deadline for product-specific (Type C) harmonised standards                                                                 | Proposed |
| 11 December 2027  | Full application: all essential requirements, including the SBOM obligation, become enforceable for products placed on the EU market | Upcoming |

The nearest deadline is the most consequential for SBOM practice: from **11 September 2026**, manufacturers must report actively exploited vulnerabilities and severe incidents. Meeting the reporting clock in practice depends on knowing what is in your products, which is exactly what an SBOM provides.

---

## Reporting Obligations from 11 September 2026

From 11 September 2026, manufacturers must notify actively exploited vulnerabilities and severe incidents affecting their products with digital elements. Notifications are submitted through the [CRA Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp) (SRP), operated by ENISA under Article 16, and are addressed to the CSIRT of the Member State where the manufacturer has its main establishment.

The deadlines are tight (Article 14):

| Deadline | Obligation                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| 24 hours | Early warning after becoming aware of an actively exploited vulnerability or severe incident |
| 72 hours | Full notification, including corrective or mitigating measures                               |
| 14 days  | Final vulnerability report, after a corrective measure is available                          |
| 1 month  | Final report for severe incidents, after the initial notification                            |

### What ENISA published in July 2026

ENISA released step-by-step SRP instructions on 31 July 2026. The practical takeaways:

- **Register in advance.** Representatives sign in through **EU Login**, and ENISA states that EU Login accounts can be created before the platform goes live. Validation of a representative is carried out by the coordinator CSIRT after first access to the platform, in parallel with the reporting process, so an unregistered manufacturer is not strictly locked out - but a 24-hour window is the wrong moment to be meeting the flow for the first time.
- **There is no reporting API at launch.** ENISA has stated that no submission API will be provided at this stage. You can automate your internal workflow right up to the point of submission, but a human will be typing into a browser at the end of it. That makes the quality of your internal triage data (which product, which version, which component) the rate-limiting factor.
- **The 24-hour early warning is deliberately thin.** Only the notification type and level, manufacturer or steward name, product, title, and (for incidents) whether unlawful or malicious acts are suspected. The 72-hour notification expands to the nature of the vulnerability, exploitation details, and corrective measures. The final report is the comprehensive one.

**The SBOM connection:** a 24-hour early-warning window leaves no time for manual component archaeology. When a vulnerability in a widely used library starts being exploited, you need to answer "which of our products and versions contain this component?" in minutes. That requires up-to-date, machine-readable SBOMs for every shipped version, matched continuously against vulnerability intelligence. Manufacturers who wait until December 2027 to build their SBOM pipeline will find the September 2026 reporting obligations hard to meet.

### Two clarifications from the Commission's July 2026 guidance

**Third-party components (paragraph 218).** Where your product contains an actively exploited vulnerability originating from a third-party component, you must notify it. But if you are aware that a third-party component contains a vulnerability and that vulnerability either (i) cannot be exploited in your product - the guidance's example is that the vulnerable code is not reachable - or (ii) has not been exploited in your product, it does not qualify as an actively exploited vulnerability contained in your product and is not subject to mandatory reporting by you. You may still notify voluntarily under Article 15, and the vulnerability handling requirements of Annex I Part II still apply, as does the duty to report it upstream to the component's maintainer under Article 13(6).

That is a VEX-shaped determination, and making it credibly under time pressure presupposes an SBOM you trust plus a reachability answer you can defend.

**No retroactive reporting (paragraph 217).** You do not have to report vulnerabilities whose active exploitation you were already aware of before 11 September 2026. But if you knew about a vulnerability before that date without knowing it was being exploited, and exploitation occurs or comes to your attention afterwards, it becomes reportable then.

Note that the guidance does **not** address SBOM format or content - the words "software bill of materials" and "SBOM" do not appear in it at all. For that, BSI TR-03183-2 remains the only detailed public reference.

---

## Penalties (Article 64)

Enforcement is national: Member States lay down the penalty rules, and market surveillance authorities or national courts impose the fines (Article 64(1), (7) and (8)). The administrative fine ceilings, however, are set EU-wide:

| Infringement                                                                                                                                                                                                  | Maximum administrative fine                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Non-compliance with the essential cybersecurity requirements (Annex I) or the manufacturer obligations in Articles 13 and 14, which include the SBOM duty and the reporting obligations above (Article 64(2)) | EUR 15,000,000 or, for an undertaking, up to 2.5% of total worldwide annual turnover for the preceding financial year, whichever is higher |
| Non-compliance with other operator obligations, including those of importers and distributors (Articles 18 to 23, 28, 30 to 32, 33(5), 39, 41, 47, 49 and 53) (Article 64(3))                                 | EUR 10,000,000 or up to 2% of total worldwide annual turnover, whichever is higher                                                         |
| Supplying incorrect, incomplete or misleading information to notified bodies and market surveillance authorities (Article 64(4))                                                                              | EUR 5,000,000 or up to 1% of total worldwide annual turnover, whichever is higher                                                          |

When setting the amount, authorities must take into account the nature, gravity and duration of the infringement, whether fines have already been applied for similar infringements, and the size and market share of the offender, with particular regard to microenterprises, SMEs and start-ups (Article 64(5)).

Article 64(10) carves out two derogations from the fines in paragraphs (3) to (9): manufacturers that qualify as microenterprises or small enterprises cannot be fined for missing the 24-hour early-warning deadlines in Article 14(2), point (a), or Article 14(4), point (a), and **open-source software stewards** cannot be fined under those paragraphs for any infringement of the Regulation.

**Timing:** the reporting obligations bind from 11 September 2026 and the essential requirements, including the SBOM obligation, from 11 December 2027 (Article 71). The fine ceilings above are the exposure once the corresponding obligation applies.

### Who enforces this in Germany

Germany is putting the BSI at the centre of CRA enforcement. The **CRA-Durchführungsgesetz** (Gesetz zur Durchführung der Cyberresilienz-Verordnung, [Bundestag Drucksache 21/6134](https://dserver.bundestag.de/btd/21/061/2106134.pdf) of 26 May 2026) amends the BSI Act (BSI-Gesetz) so that the BSI becomes "die zuständige nationale Marktüberwachungsbehörde" and "die notifizierende Behörde" under Regulation (EU) 2024/2847. The Bundestag held its first reading on 11 June 2026 and referred the bill to committee, with the Interior Committee in the lead; the Bundesrat raised no objections. The bill was still in the parliamentary process as of August 2026, so details may change, but the authority architecture is unlikely to.

This matters for how you read TR-03183: the authority writing the technical guideline is the same authority that will be knocking on the door.

---

## CRA Legal Baseline

### SBOM Requirement

Annex I, Part II(1) requires manufacturers to "identify and document vulnerabilities and components contained in products with digital elements, **including by drawing up a software bill of materials** in a commonly used and machine-readable format covering **at least the top-level dependencies** of the product."

| CRA Requirement        | Description                                             | Reference           |
| ---------------------- | ------------------------------------------------------- | ------------------- |
| Machine-readable SBOM  | SBOM must be in a machine-readable format               | Annex I, Part II(1) |
| Commonly used format   | Must use a commonly used format (e.g., CycloneDX, SPDX) | Annex I, Part II(1) |
| Top-level dependencies | Must include at least top-level (direct) dependencies   | Annex I, Part II(1) |

Top-level dependencies are the **legal floor**, not the target. Vulnerability triage under a 24-hour clock depends on transitive depth, and BSI TR-03183-2 requires considerably more (see [Scope and Dependency Depth](#scope-and-dependency-depth)).

### Technical Documentation and Authority Access

The SBOM is part of the technical documentation, and the technical documentation is what market surveillance authorities audit.

| Requirement                     | Description                                                                                                                                                                                                 | Reference             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| SBOM in technical documentation | The specification of vulnerability handling processes must include the SBOM, the CVD policy, evidence of a vulnerability contact address, and the secure update distribution design                         | Annex VII, point 2(b) |
| Authority access                | The SBOM must be produced further to a reasoned request from a market surveillance authority, where necessary to check compliance with Annex I                                                              | Annex VII, point 8    |
| Cooperation duty                | Manufacturers must supply all information and documentation demonstrating conformity upon reasoned request                                                                                                  | Article 13(22)        |
| Kept continuously updated       | Technical documentation must be drawn up before placing on the market and continuously updated, at least during the support period                                                                          | Article 31(2)         |
| Retention                       | Technical documentation must be kept at the disposal of market surveillance authorities for at least **10 years** after the product is placed on the market, or for the support period, whichever is longer | Article 13(13)        |

The retention and continuous-update duties together are the ones teams underestimate: you are not producing one SBOM, you are running an archive of per-version SBOMs that has to stay retrievable for a decade.

### User Disclosure (Optional)

Annex II, Part I, point 9: "If the manufacturer decides to make available the software bill of materials to the user, [provide] information on where the software bill of materials can be accessed."

| Requirement                | Description                                                 | Status              |
| -------------------------- | ----------------------------------------------------------- | ------------------- |
| User delivery              | Providing SBOM to end users                                 | Optional            |
| Access location disclosure | If SBOM is shared with users, must state where to access it | Required if sharing |

### Future Specifications, Standards, and Guidance

**Article 13(24)** empowers the European Commission, by means of implementing acts and taking into account European or international standards and best practices, to "specify the format and elements of the software bill of materials referred to in Part II, point (1), of Annex I." **No such implementing act has been adopted.** That is why BSI TR-03183-2 remains the most concrete technical interpretation available.

Related implementation work:

- **Commission guidance (27 July 2026):** the Commission approved the content of its first set of CRA application guidance as [C(2026) 5252 final](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation), an 84-page annex containing 67 numbered practical examples. It covers scope (including remote data processing and free and open-source software), what counts as a substantial modification, support periods, product classification, and reporting obligations. It is explicitly non-binding: only the Court of Justice can authoritatively interpret the CRA. It nevertheless steers market surveillance authorities and notified bodies toward a consistent reading. It says nothing about SBOM format or content.
- **Commission FAQ:** the Commission maintains a living [CRA implementation FAQ](https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act-implementation-frequently-asked-questions) covering scope questions, the open-source regime, support periods, and reporting obligations.
- **Product classification:** [Implementing Regulation (EU) 2025/2392](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502392) (adopted 28 November 2025, in force 21 December 2025) fills in the technical descriptions behind the Annex III "important" and Annex IV "critical" product categories, and clarifies that a product's **core functionality** drives classification rather than ancillary or embedded features. Classification determines the conformity assessment route, which determines whether a notified body reads your technical documentation.

---

## Harmonised Standards: Not Yet Available

CEN, CENELEC and ETSI [accepted the Commission's CRA standardisation request (M/606) on 3 April 2025](https://www.cencenelec.eu/news-events/news/2025/newsletter/ots-62-cra/). The Commission [describes M/606](https://digital-strategy.ec.europa.eu/en/policies/cra-standardisation) as covering a set of **41 standards**, horizontal and product-specific. The horizontal work is being developed by CEN-CLC/JTC 13 as the **EN 40000** series, with vertical, product-specific standards in the **EN 50770** series.

| Standard        | Scope                                                                             | Status (as of mid-2026)                                                                              |
| --------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| prEN 40000-1-1  | Vocabulary                                                                        | Public enquiry completed, under approval                                                             |
| prEN 40000-1-2  | Cyber resilience principles, risk management                                      | Public enquiry completed, under approval; not currently expected to be cited in the Official Journal |
| prEN 40000-1-3  | Vulnerability handling                                                            | Most advanced; the one horizontal part currently expected to be cited                                |
| prEN 40000-1-4  | Technical security controls                                                       | Not scheduled until autumn 2027                                                                      |
| prEN 50770-1..6 | Vertical OT products (firewalls, network management, VPN, routers/switches, SIEM) | In development, leaning on IEC 62443                                                                 |

Drafts are not public documents, so the status column above is drawn from CEN/CENELEC communications and public standardisation trackers rather than from the Official Journal. Treat it as directional. Two things follow from it that matter more than the standard numbers:

1. **No CRA harmonised standard has been cited in the Official Journal yet.** Until one is, the Article 27 presumption of conformity is not available to anyone. Everybody is currently demonstrating conformity by describing the solutions they adopted.
2. **The deadlines slipped.** In early July 2026 the Commission issued a draft amendment to M/606 pushing delivery back two months: Type A and Type B (vulnerability management) from 30 August 2026 to 31 October 2026, and Type C (product-specific) from 30 October 2026 to 31 December 2026. The implementing decision had not been published at the time of writing, so those dates remain proposed rather than binding.

BSI states plainly that TR-03183 "will be gradually developed further and replaced by the corresponding harmonised European standards as soon as they become available." Treat TR-03183 as the best available bridge, not the destination.

---

## The BSI TR-03183 Family

[BSI TR-03183](https://bsi.bund.de/dok/TR-03183-en) is no longer a single SBOM document. It is now a four-part family covering the CRA's manufacturer obligations end to end:

| Part                                                    | Version | Date           | What it covers                                                                                        |
| ------------------------------------------------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| **Part 1** - General requirements                       | 1.0.0   | 31 July 2026   | Risk-based selection of security controls for products with digital elements, with an OSCAL catalogue |
| **Part 2** - Software Bill of Materials (SBOM)          | 2.1.0   | 20 August 2025 | SBOM format, content, data fields, dependency depth, licences                                         |
| **Part 3** - Vulnerability Reports and Notifications    | 1.0.0   | September 2025 | Receiving vulnerability reports: security.txt, CVD policy, CSAF advisories                            |
| **Part H** - Conformity based on full quality assurance | 1.1.0   | 30 May 2026    | Demonstrating conformity via an ISO/IEC 27001 ISMS (Module H) instead of per-product assessment       |

> **Note on interpretations:** BSI TR-03183 remains the **first and most detailed technical interpretation** of CRA requirements published by an EU member state authority. Other EU countries may publish their own interpretations, which could differ. BSI is explicit that its guideline creates no obligations, gives no presumption of conformity, and does not describe the only way to meet the CRA's essential requirements.

### Part 1: General requirements (v1.0.0, July 2026)

Part 1 is not a new document, but 1.0.0 is its **first stable release**. It has been a living draft since 2023 (v0.9.0, then v0.10.0 in October 2025); the document carrying version 1.0.0 is dated 31 July 2026, and BSI [announced it on 5 August 2026](https://www.bsi.bund.de/DE/Service-Navi/Presse/Alle-Meldungen-News/Meldungen/2026/TR-03183_Einstiegshilfe_CRA_260805.html). It is aimed squarely at manufacturers who do not yet have mature secure-development and vulnerability-handling processes, and is positioned as an entry aid to the CRA for the "default" product class.

What it contains:

- **Adaptable Risk-based Controls (ARC)** - the framing that is genuinely new in 1.0.0. Each control is paired with one or more risk scenarios describing affected assets and impact, plus environment parameters (access restriction, interface restriction, user capabilities). You match your product's assets and environment against the scenarios to select controls, rather than applying a flat checklist. The underlying risk-scenario method was already present in v0.10.0; 1.0.0 names and structures it.
- **A machine-readable OSCAL control catalogue**, published at [github.com/tr-03183/tr-03183-1](https://github.com/tr-03183/tr-03183-1), with access and usage notes provided on request to BSI. This is not new in 1.0.0 either - the same repository was referenced in v0.10.0 - but it remains the most useful part for tooling. Expressing CRA controls in [OSCAL](https://pages.nist.gov/OSCAL/) makes filtering, custom catalogues, and structured assessment evidence practical.
- **An assessment report template** that mirrors Annex VII. Its required contents include the product identification, versions of hardware and software, and the **SBOM where applicable**, alongside the risk assessment, design documentation, selected controls, and vulnerability handling description.

In other words, the news is the release status rather than a wholesale change in content. If you evaluated the October 2025 draft, re-read it for the ARC structure rather than expecting a different document.

Part 1 restates the SBOM's home in the CRA: technical documentation under Article 31 must include a cybersecurity risk assessment and an SBOM. If you have been treating SBOM generation as a build-pipeline concern, Part 1 is a useful reminder that it is a documentation-of-conformity concern.

### Part 3: Vulnerability Reports and Notifications (v1.0.0, September 2025)

Part 3 covers the **intake** side of vulnerability handling, not the Article 14 outbound reporting to the SRP. It is the complement to the SBOM: Part 2 tells you what you shipped, Part 3 tells you how people tell you it is broken.

Concretely, it requires or specifies:

- A **`security.txt`** file per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html) on the manufacturer's website. Section 4.2 is prescriptive about its contents:

  | Field                 | Requirement | Detail (Section 4.2)                                                                              |
  | --------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
  | Location              | MUST        | `/.well-known/security.txt`, served over HTTPS, plain ASCII or UTF-8 (4.2.1)                      |
  | `Canonical`           | MUST        | Authoritative URI, reachable without redirects (4.2.2)                                            |
  | `Contact`             | MUST        | Three entries in order: PSIRT mailbox, CSIRT mailbox, URI of the incoming-report web page (4.2.3) |
  | `Encryption`          | MUST        | OpenPGP keys covering every listed contact (4.2.4)                                                |
  | `Preferred-Languages` | MUST        | At least `en` (4.2.6)                                                                             |
  | `Policy`              | MUST        | URI of the CVD policy page (4.2.7)                                                                |
  | `Expires`             | MUST        | RFC 3339, at most one year ahead, reviewed at least quarterly (4.2.9)                             |
  | Digital signature     | MUST        | OpenPGP signature per RFC 9580; key validity capped at five years (4.2.10)                        |
  | `CSAF`                | SHOULD      | URI of `provider-metadata.json`, prefixed with the `CSAF:` tag (4.2.8)                            |
  | `Acknowledgments`     | SHOULD      | URI of the researcher acknowledgements page (4.2.5)                                               |
  | Crawler visibility    | MUST        | Firewall and DDoS rules must not block automated discovery (4.2.11)                               |

- A dedicated **web page for incoming vulnerability reports**, including a web form, published contact options, and the CVD policy.
- A **CVD policy** covering the corresponding national CSIRT, assurances to reporters, a code of conduct, guaranteed response times, an anonymous reporting option, and how disclosure ends.
- Publication of security advisories on the manufacturer's website using **OASIS CSAF v2.0**, with BSI pointing at the open-source [CSAF Provider](https://github.com/gocsaf/csaf/blob/main/docs/csaf_provider.md) tooling.

The CSAF requirement is the same architectural decision as Part 2's ban on vulnerability data inside SBOMs, seen from the other end: static component inventory in the SBOM, dynamic vulnerability state in CSAF/VEX.

> **Publishing a `security.txt` with sbomify:** every sbomify [Trust Center](/faq/what-is-a-trust-center/) can serve an RFC 9116 `security.txt` at `/.well-known/security.txt`, populated from your workspace security contacts, covering `Canonical`, `Encryption`, `Preferred-Languages` and `Expires`. Enable it under **Settings > Trust Center**; the [CRA Compliance Wizard](/faq/how-do-i-use-cra-compliance/) reuses those values in its vulnerability-handling step. For full TR-03183-3 conformance you will additionally need the `Policy` link, the `CSAF` pointer, the PSIRT/CSIRT contact ordering, and an OpenPGP signature over the file.

### Part H: Module H conformity (v1.1.0, May 2026)

Article 32(1)(c) allows conformity assessment based on full quality assurance (Module H, Annex VIII). BSI opened a [commenting phase on TR-03183-H from 27 February to 31 March 2026](https://www.bsi.bund.de/DE/Service-Navi/Presse/Alle-Meldungen-News/Meldungen/2026/Kommentierungsphase_TR-03183-H_260227.html) and published v1.1.0 on 30 May 2026. Module H assesses the manufacturer's **processes** rather than each individual product, and TR-03183-H maps that onto an ISO/IEC 27001-compliant ISMS.

For SBOM programmes this is a meaningful lever: if your SBOM generation, storage, and distribution are auditable ISMS processes rather than per-release heroics, Module H lets that investment cover a whole product portfolio at once instead of being re-demonstrated product by product.

---

## BSI TR-03183-2: Concrete SBOM Requirements

[BSI TR-03183-2](https://bsi.bund.de/dok/TR-03183-en) **v2.1.0 (20 August 2025)** remains the current SBOM specification; there is no newer version as of August 2026. Key requirements follow. For the standalone summary, see our [BSI TR-03183-2 page](/compliance/bsi-tr-03183/).

### Compliance Versioning

To be compliant with the Technical Guideline, the **most recent version MUST be used** for generating SBOMs. Any earlier version MUST NOT be applied, except the immediately preceding one, which MAY be used for up to **six months** after a new version is issued. (Section 7)

Importantly for anyone worried about the 10-year retention duty: an SBOM that was compliant at its **delivery date remains compliant**, even after BSI publishes newer versions of the guideline. You do not have to regenerate your archive every time the TR moves. Consumers of SBOMs SHOULD be able to interpret versions that were compliant when delivered. (Section 7)

### Required Formats

SBOMs MUST be in JSON or XML format and follow one of these specifications:

| Format    | Minimum Version | Reference |
| --------- | --------------- | --------- |
| CycloneDX | 1.6 or higher   | Section 4 |
| SPDX      | 3.0.1 or higher | Section 4 |

Only officially released versions are compliant. (Section 4)

### Scope and Dependency Depth

BSI requires a **"delivery item SBOM"** - recursive dependency resolution MUST be performed on each path downward at least up to and including the **first component outside the scope of delivery**. That first external component must at least be **identified** (creator, name, version, other unique identifiers). (Section 5.1)

"Scope of delivery" means all software parts delivered with the product; parts acquired separately are not included. (Section 8.1.11)

This is materially deeper than the CRA's "at least the top-level dependencies" floor, and it is the gap most manufacturers discover late.

### Required Data Fields: SBOM Level

Each SBOM MUST contain (Table 2, Section 5.2.1):

| Data Field      | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| Creator of SBOM | Email address of the SBOM creator; if unavailable, a URL (homepage/project) |
| Timestamp       | Date and time of SBOM compilation (UTC recommended)                         |

### Required Data Fields: Each Component

For each component, the following MUST be provided (Table 3, Section 5.2.2):

| Data Field                   | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Component creator            | Email address or URL of the entity that created/maintains the component                      |
| Component name               | Name assigned by creator; if none, the actual filename                                       |
| Component version            | Version identifier (SemVer/CalVer recommended); if none, file modification date per RFC 3339 |
| Filename                     | Actual filename of the component (not file system path)                                      |
| Dependencies                 | Enumeration of direct dependencies; **completeness MUST be clearly indicated**               |
| Distribution licences        | SPDX licence identifier/expression for licences under which the component can be used        |
| Hash of deployable component | SHA-512 checksum of the deployed/deployable component                                        |
| Executable property          | "executable" or "non-executable"                                                             |
| Archive property             | "archive" or "no archive"                                                                    |
| Structured property          | "structured" or "unstructured" (if component has both, use "structured")                     |

### Additional Data Fields (Conditional)

These MUST be provided **if they exist** and fit the SBOM format (Tables 4-5, Sections 5.2.3-5.2.4):

**SBOM level:**

| Data Field | Description      |
| ---------- | ---------------- |
| SBOM-URI   | URI of this SBOM |

**Component level:**

| Data Field        | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Source code URI   | URI of the source code (repository URL or specific version) |
| Deployable URI    | URI pointing directly to the downloadable form              |
| Other unique IDs  | CPE, Package URL (purl), SWID, etc.                         |
| Original licences | Licence(s) assigned by the component creator                |

### Optional Data Fields

May be included if they exist (Table 6, Section 5.2.5):

| Data Field        | Description                                             |
| ----------------- | ------------------------------------------------------- |
| Effective licence | Licence under which the SBOM creator uses the component |
| Source code hash  | Checksum of source code (algorithm TBD by BSI)          |
| security.txt URL  | URL of the component creator's security.txt (RFC 9116)  |

That last one is where Part 2 and Part 3 meet: the security.txt Part 3 makes you publish is the same artefact your downstream consumers may record against your component in their SBOM.

### Licence Requirements

Licences MUST be referenced by **SPDX licence identifier or expression**. Licence text MUST NOT be used as a substitute for an identifier. (Section 6.1)

If no SPDX identifier exists, consult the [Scancode LicenseDB](https://scancode-licensedb.aboutcode.org/) using prefix `LicenseRef-scancode-[...]`. For truly unknown licences, use `LicenseRef-<entity>-[...]`. (Section 6.1)

### Vulnerability Information

**SBOMs MUST NOT contain vulnerability information.** SBOM data is static; vulnerability information is dynamic. Use **CSAF** or **VEX** for vulnerability communication instead. (Section 3.1, 8.1.14)

### One SBOM Per Version

A **separate SBOM MUST be generated for each software version**. If any component changes, a new software version MUST be assigned. (Section 3.1)

### Logical Components and BOM References

v2.1.0 introduced **logical components** - an abstraction level combining multiple components, for example an operating system, application, framework or container, used to preserve product-level structure that a flat component list would lose. Only a reduced set of data fields must be populated for them. (Sections 3.2.2, 5.2)

SBOMs of used components MAY be referenced instead of merged, if they are TR-03183-2 compliant. The SBOM provider is responsible for availability of referenced SBOMs. When referencing, the referencing SBOM MUST extract and include creator, name, and version from the referenced BOM. (Section 3.2.5, 5.1)

### Digital Signature

Ideally, SBOMs should be digitally signed so recipients can verify their authenticity. (Section 8.1.15)

---

## Practical Compliance Checklist

**Before 11 September 2026:**

1. **Get EU Login sorted for the ENISA Single Reporting Platform** - accounts created in advance, Primary and Secondary representatives named. There is no submission API, so make sure the humans who will submit have access.
2. **Stand up SBOM-driven vulnerability monitoring** so you can answer "which products and versions contain this component?" inside the 24-hour early-warning window.
3. **Publish a security.txt and CVD policy** per BSI TR-03183-3 and RFC 9116, and be ready to issue CSAF v2.0 advisories.

**Before 11 December 2027:**

4. **Generate an SBOM** for each software version as required by CRA Annex I, Part II(1).
5. **Use CycloneDX 1.6+ or SPDX 3.0.1+** in JSON or XML format.
6. **Cover the scope of delivery** plus recursive dependencies to the first external component (at minimum, identify that component) - deeper than the CRA's top-level floor.
7. **Indicate completeness** of dependency enumeration for each component.
8. **Include all required component fields**: creator, name, version, filename, dependencies, distribution licences, SHA-512 hash, executable/archive/structured properties.
9. **Use SPDX licence identifiers** - never use licence text as a substitute.
10. **Do not embed vulnerability information** - use CSAF/VEX instead.
11. **Digitally sign** the SBOM so recipients can verify authenticity (recommended).
12. **File the SBOM in your technical documentation** alongside the CVD policy, vulnerability contact address, and secure update design (Annex VII, point 2(b)).
13. **Keep it current and keep it for 10 years** - continuously updated during the support period (Article 31(2)), retained for 10 years or the support period, whichever is longer (Article 13(13)).
14. **Be prepared to provide** the SBOM to market surveillance authorities upon reasoned request (Annex VII, point 8).
15. **If sharing with users**, document where the SBOM can be accessed (Annex II, Part I, point 9).
16. **Check your product classification** against Implementing Regulation (EU) 2025/2392 - "important" or "critical" changes your conformity assessment route.

---

## Schema Mappings

BSI TR-03183-2 Section 8.2 provides detailed JSON mappings for CycloneDX 1.6 and SPDX 3.0.1.

For general CycloneDX and SPDX field mappings, see our [Schema Crosswalk](/compliance/schema-crosswalk/).

BSI maintains a CycloneDX property taxonomy for TR-03183-2 specific fields: [github.com/BSI-Bund/tr-03183-cyclonedx-property-taxonomy](https://github.com/BSI-Bund/tr-03183-cyclonedx-property-taxonomy)

---

## Related Frameworks

- [BSI TR-03183-2](/compliance/bsi-tr-03183/) - the SBOM specification in detail
- [EU NIS2 Directive](/compliance/eu-nis2/) - EU cybersecurity law for critical entities
- [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) - US baseline for SBOM content
- [CISA Framing Document](/compliance/cisa-framing/) - CISA guidance on SBOM attributes

---

## Official Sources

- [EU Cyber Resilience Act (Regulation 2024/2847)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [Commission Implementing Regulation (EU) 2025/2392](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502392) - technical descriptions of important and critical products
- [European Commission: CRA application guidance, C(2026) 5252 (27 July 2026)](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation)
- [European Commission: CRA Implementation factpage](https://digital-strategy.ec.europa.eu/en/factpages/cyber-resilience-act-implementation)
- [European Commission: CRA Reporting Obligations](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)
- [European Commission: CRA Implementation FAQ](https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act-implementation-frequently-asked-questions)
- [ENISA: CRA Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp)
- [BSI TR-03183: Cyber Resilience Requirements](https://bsi.bund.de/dok/TR-03183-en) - Parts 1 (v1.0.0), 2 (v2.1.0), 3 (v1.0.0) and H (v1.1.0)
- [BSI TR-03183-1 OSCAL controls](https://github.com/tr-03183/tr-03183-1)

---

**Disclaimer:** This page represents our interpretation of the EU Cyber Resilience Act and the BSI TR-03183 Technical Guideline family. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview](/compliance/)
