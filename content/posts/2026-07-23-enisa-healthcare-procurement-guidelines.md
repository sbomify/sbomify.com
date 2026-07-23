---

title: "ENISA's New Healthcare Procurement Guidelines Ask for SBOMs Without Saying the Word"
description: "ENISA's July 2026 procurement guidelines for hospitals and healthcare providers require supply chain transparency, component listings, and vulnerability management. Here is how SBOMs satisfy them."
keywords: "ENISA healthcare procurement guidelines, hospital cybersecurity procurement, NIS2 healthcare, medical device SBOM, healthcare supply chain security"
categories:
  - compliance
tags: [sbom, enisa, healthcare, nis2, procurement, compliance, medical-devices]
tldr: "ENISA published updated procurement guidelines for the cybersecurity of hospitals and healthcare providers in July 2026. The document never uses the word SBOM, but its core supplier requirements (component transparency, open source component listings, vulnerability disclosure, patch evidence, and asset inventories) all describe what an SBOM program delivers. If you sell software or connected devices into EU healthcare, expect these requirements in tenders. If you buy for a hospital, ask for machine-readable SBOMs instead of PDFs."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What are the ENISA procurement guidelines for hospitals and healthcare providers?"
    answer: "Published in July 2026, they are ENISA's updated guidance for embedding cybersecurity into healthcare procurement. They define measures across three procurement phases (plan, source, manage), plus horizontal general measures, and include filterable checklists and three worked scenarios: radiology equipment, cloud services, and an off-the-shelf EHR system. They update ENISA's 2020 procurement guidelines and were called for by the European Commission's January 2025 action plan on the cybersecurity of hospitals and healthcare providers."
  - question: "Do the ENISA healthcare procurement guidelines require SBOMs?"
    answer: "Not by name. The document never uses the term SBOM, but several measures describe exactly what an SBOM provides: SOURCE-06 requires supplier transparency about third-party software and firmware components, PLAN-03 recommends that bidders provide a listing of the open-source components in the system, and MANAGE-01 requires contractual vulnerability disclosure and patching obligations. A machine-readable SBOM is the established, standards-based way to meet these requirements."
  - question: "Who do the ENISA healthcare procurement guidelines apply to?"
    answer: "The primary audience is hospitals and healthcare providers: CIOs, CISOs, IT teams, procurement officials, and even general practitioners. The guidelines also explicitly address suppliers, including medical device manufacturers and vendors of EHR systems, cloud services, and networking solutions, so they understand what healthcare buyers will demand. NIS2 obligations on health entities are the regulatory driver behind the guidance."
  - question: "How do the guidelines relate to NIS2, the CRA, and MDR/IVDR?"
    answer: "The measures are grounded in NIS2 (which imposes supply chain security and risk management obligations on essential and important health entities), the Medical Devices Regulation and In Vitro Diagnostic Medical Devices Regulation (which contain lifecycle cybersecurity requirements for devices), the GDPR, the European Health Data Space Regulation, and the Cyber Resilience Act. Notably, products covered by the MDR or IVDR are exempt from the CRA, but the procurement route means hospitals can still demand CRA-style transparency contractually."
date: 2026-07-23
slug: enisa-healthcare-procurement-guidelines
---

In July 2026, the European Union Agency for Cybersecurity (ENISA) published its updated [Procurement guidelines for the cybersecurity of hospitals and healthcare providers](https://www.enisa.europa.eu/sites/default/files/2026-07/Procurement%20guidelines%20for%20the%20cybersecurity%20of%20hospitals%20and%20healthcare%20providers.pdf). The document is a deliverable of the European Commission's January 2025 action plan on healthcare cybersecurity and replaces ENISA's 2020 procurement guidance.

Here is the part that caught our eye: across 69 pages of procurement measures, checklists, and worked scenarios, the word "SBOM" never appears. And yet the guidelines repeatedly ask hospitals to demand exactly what a [Software Bill of Materials](/what-is-sbom/) provides. If you build software or connected devices for the European healthcare market, this document tells you what your next tender is going to ask for. Let's walk through it.

## Why Healthcare Procurement, and Why Now

The numbers ENISA cites explain the urgency. There are over 500,000 types of medical devices and in vitro diagnostics on the EU market, and the European medical technology market was valued at roughly EUR 160 billion in 2023. Meanwhile, the ENISA Threat Landscape 2024 found that the health sector accounts for 8% of total ransomware incidents, making it one of the most targeted sectors. ENISA attributes this exposure to legacy systems, limited security budgets, and the complexity of healthcare supply chains. Only 27% of healthcare organisations have a dedicated ransomware defence programme.

Regulation has been catching up. The [NIS2 Directive](/compliance/eu-nis2/) classifies health entities as essential or important entities and imposes supply chain security obligations that flow directly into how hospitals buy technology. Procurement is where those obligations become real: it is the moment a hospital can demand security evidence from a supplier and write consequences into a contract.

The guidelines organize their measures into three procurement phases (plan, source, manage) plus a set of horizontal general measures, and they close with filterable checklists and three worked scenarios: buying radiology equipment in a large hospital, buying cloud services for a private medical centre, and buying an off-the-shelf EHR system as a general practitioner.

## The SBOM-Shaped Hole in the Document

Read the supplier-facing measures and a pattern emerges. Several of them describe component transparency, which is precisely the problem SBOMs were created to solve.

**SOURCE-06: Supply chain cybersecurity transparency.** This measure requires suppliers "to maintain transparency and accountability regarding third-party software and firmware components used in their IT and operational technology environments," explicitly including AI-related components and dependencies. ENISA calls this transparency "critical to identifying and mitigating supply chain risks effectively." That is a functional description of an SBOM: a structured inventory of the third-party components inside a product.

**PLAN-03: Supply chain security policy.** The implementation guidance says suppliers should commit to keeping libraries and dependencies patched, and adds: "If possible, it would be best if bidders can provide a listing of the open-source components in the system and require adherence to relevant EU regulations like the CRA for security and documentation." A listing of the open-source components in the system is an SBOM. The only question is whether it arrives as a spreadsheet someone typed up or as a standard, machine-readable document.

**MANAGE-01: Vulnerability disclosure and patch management obligations.** Suppliers must maintain a formal process for receiving vulnerability reports, analysing root causes, and shipping patches without undue delay. Buyers are told to require "evidence of patching and updating activities" and to monitor security advisories for all open source components in the solution. You cannot monitor advisories for components you cannot enumerate. Continuous vulnerability monitoring presupposes a component inventory, and [SBOM scanning](/2026/02/01/sbom-scanning-vulnerability-detection/) is how that works in practice.

**MANAGE-02 and GENERAL-04.** Hospitals must maintain an accurate, up-to-date inventory of their entire technology infrastructure and must "identify, assess and remediate known vulnerabilities" in collaboration with suppliers. An asset inventory tells you which systems you own. Component-level transparency from suppliers tells you what is inside those systems. When the next Log4Shell-class vulnerability lands, the second inventory is the one that answers "are we affected?"

So while the document never says SBOM, a supplier that maintains SBOMs for its products and a hospital that collects and monitors them will satisfy these measures almost mechanically. A supplier that does not will be answering these tender questions with prose and promises.

## The Regulatory Web Behind It

The guidelines are explicit about their legal grounding, and the interplay is worth understanding.

- **NIS2** obliges health entities to manage supply chain risk, which is the direct driver for these procurement measures.
- **MDR and IVDR** impose lifecycle cybersecurity requirements on medical devices, from pre-market approval to post-market vigilance.
- **The [Cyber Resilience Act](/compliance/eu-cra/)** requires SBOMs for products with digital elements, but products covered by the MDR or IVDR are exempt from the CRA.

That last point matters. A medical device manufacturer might conclude that the CRA's SBOM mandate does not apply to them. Technically correct. But the procurement route closes the gap: ENISA is telling hospitals to demand CRA-style component transparency contractually, whatever the product's regulatory classification. PLAN-03 even name-checks the CRA as the bar for security and documentation. The regulatory exemption does not survive contact with a well-written tender.

Manufacturers selling into the US market will find this familiar. The FDA already [expects SBOMs in premarket submissions](/2026/01/09/fda-medical-device-sbom-requirements/) for cyber devices under Section 524B of the FD&C Act. A device maker that has built SBOM generation into its development lifecycle for FDA purposes is most of the way to answering an ENISA-aligned European tender.

## What This Means If You Sell Into EU Healthcare

Expect tenders influenced by these guidelines to ask for:

1. **A component listing for your product.** Provide it as a machine-readable SBOM in [CycloneDX or SPDX](/2026/01/15/sbom-formats-cyclonedx-vs-spdx/), not a PDF appendix. The buyer's security team can actually use a standard format, and it signals maturity.
2. **Evidence of a secure development lifecycle.** SOURCE-05 requires security by design, cryptographically authenticated updates, and verified software authenticity. SBOM generation in CI/CD is part of demonstrating this.
3. **A vulnerability disclosure and patching commitment with teeth.** The guidelines suggest contracts should treat failure to remediate known vulnerabilities within a reasonable time frame as a breach of agreement. You will want your own continuous monitoring so the hospital is not the one telling you about CVEs in your product.
4. **Patch evidence over the product lifetime.** Patch logs, reports, and change records. An SBOM per release gives both sides a precise record of what changed.

## What This Means If You Buy For a Hospital

The guidelines hand procurement teams a checklist, and Annex B makes it filterable by procurement type. Our advice on top of it:

- **Ask for SBOMs by name and by format.** "A listing of open-source components" invites a Word document. "A CycloneDX or SPDX SBOM meeting the [CISA minimum elements](/compliance/cisa-minimum-elements/)" invites something your tooling can ingest.
- **Collect SBOMs somewhere you can query.** An SBOM in a contract annex is compliance theatre. An SBOM in a platform that continuously matches components against vulnerability databases is a security control. GENERAL-04 and MANAGE-01 effectively require the latter.
- **Make SBOM delivery a lifecycle obligation, not a one-time deliverable.** Products change with every update. Require a fresh SBOM per release, tied to the patching evidence the guidelines already tell you to demand.

## How sbomify Helps

This is the workflow sbomify was built for. Suppliers can generate SBOMs automatically in CI/CD with the [sbomify GitHub Action](https://github.com/sbomify/github-action), organize them by product and release, and share them with customers through a portal instead of email attachments. Healthcare buyers get continuous vulnerability monitoring of every collected SBOM, so the component inventory ENISA asks for stays live instead of going stale in a filing cabinet.

The pattern behind these guidelines is bigger than healthcare: regulators and buyers everywhere are converging on the same demand, namely that software suppliers know and disclose what is inside their products. ENISA did not need to write the word SBOM for that to be the answer.
