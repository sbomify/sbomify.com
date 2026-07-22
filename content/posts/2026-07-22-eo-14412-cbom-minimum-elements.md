---

title: "EO 14412 and the Coming CBOM Minimum Elements"
description: "Executive Order 14412 is the first US federal document to name the CBOM, directing CISA and NIST to publish minimum-elements guidance by roughly March 2027. Here is what it says, what to expect, and how to get ready."
categories:
  - compliance
tags: [cbom, eo-14412, post-quantum, compliance, cryptography]
tldr: "Executive Order 14412 (June 22, 2026) directs CISA and NIST to publish minimum elements for a Cryptography Bill of Materials within 270 days, putting CBOMs on the same standardization path SBOMs took with the NTIA minimum elements in 2021. Federal deadlines follow: post-quantum key establishment on high-value assets by end of 2030, signatures by end of 2031. PCI DSS 12.3.3 already mandates cipher-suite and protocol inventories commercially. Start building your crypto inventory now."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is EO 14412?"
    answer: "Executive Order 14412 (June 22, 2026) is a US executive order on securing systems against advanced cryptographic attacks. It is the first US federal document to name the Cryptography Bill of Materials (CBOM), directing CISA and NIST to publish minimum-elements guidance for CBOMs within 270 days, and setting post-quantum migration deadlines for federal systems."
  - question: "When is the CBOM minimum-elements guidance due?"
    answer: "The executive order gives CISA and NIST 270 days from June 22, 2026, which lands around March 2027. The guidance is expected to define the minimum fields and structure a CBOM must carry, playing the same standardizing role for crypto inventories that the NTIA minimum elements played for SBOMs in 2021."
  - question: "What are the federal post-quantum deadlines?"
    answer: "Under EO 14412, federal high-value assets must run post-quantum key establishment by the end of 2030 and post-quantum digital signatures by the end of 2031, with FAR rules proposed to extend requirements to federal contractors. NSA CNSA 2.0 separately requires new national security system acquisitions to support post-quantum algorithms from January 1, 2027, with full transition by 2033."
  - question: "Does this affect commercial organizations?"
    answer: "Directly, through supply chains: FAR rules will flow federal requirements down to contractors, and every vendor selling into government will feel it. Independently, PCI DSS 4.x requirement 12.3.3 has required a documented, annually reviewed inventory of cipher suites and protocols in use since March 31, 2025, which is CBOM data by another name."
date: 2026-07-22
slug: eo-14412-cbom-minimum-elements

---

In 2021, the NTIA published the [minimum elements for an SBOM](/what-is-sbom/), and software bills of materials went from a niche practice to a procurement requirement in a few short years. On June 22, 2026, the same thing started happening to cryptography inventories: [Executive Order 14412](https://www.whitehouse.gov/presidential-actions/2026/06/securing-the-nation-against-advanced-cryptographic-attacks/) became the first US federal document to name the **CBOM (Cryptography Bill of Materials)**, and it put a deadline on defining one.

## What the executive order says

Three provisions matter for anyone who ships software:

1. **CBOM minimum elements.** CISA and NIST must publish minimum-elements guidance for Cryptography Bills of Materials within 270 days, which lands around **March 2027**. Expect it to define the fields a CBOM must carry: algorithms and their parameters, certificates, protocols, and enough context to assess quantum exposure.
2. **Federal post-quantum deadlines.** Federal high-value assets must run post-quantum key establishment by the **end of 2030** and post-quantum digital signatures by the **end of 2031**. You cannot plan either migration without knowing what cryptography you run today, which is exactly what the CBOM requirement exists to fix.
3. **Contractor flow-down.** FAR rules are to be proposed extending requirements to federal contractors. As with SBOMs after [EO 14028](/compliance/eo-14028/), the practical audience is not just agencies; it is everyone who sells to them.

This sits on top of deadlines that already exist. [NSA CNSA 2.0](https://media.defense.gov/2025/May/30/2003728741/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS.PDF) requires new national security system acquisitions to support post-quantum algorithms from January 1, 2027, with full transition by 2033. NIST's migration guidance ([NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd), still a draft) sketches the same trajectory for everyone else.

## The commercial mandate is already here

While federal guidance is being written, one commercial requirement is already enforceable: **PCI DSS 4.x requirement 12.3.3**, mandatory since March 31, 2025, requires a documented inventory of the cipher suites and protocols in use across the cardholder data environment, reviewed at least annually.

Read that requirement next to the CycloneDX CBOM specification and the overlap is complete: an inventory of protocols and cipher suites *is* CBOM data. Organizations producing CBOMs today can [export exactly that inventory as evidence](/features/cbom/), while everyone else assembles it by hand every assessment cycle.

## What minimum elements will likely contain

Nobody outside CISA and NIST knows the final shape, but the raw material is public. CycloneDX, the only major BOM format with cryptographic modeling, was standardized as [ECMA-424](https://cyclonedx.org/) (1st edition, June 2024, CycloneDX 1.6; 2nd edition, December 2025, CycloneDX 1.7). Its model covers:

- **Algorithms**: name, family, parameter set, curve, key size, mode, and the NIST security categories
- **Certificates**: subject, issuer, validity window, signature algorithm, lifecycle state
- **Protocols**: versions and negotiated cipher suites
- **Related material**: keys, tokens, and secrets, with references linking assets to the algorithms that secure them

CycloneDX 1.7 added a cryptography registry: canonical identifiers for roughly a hundred algorithm families and two hundred fifty named curves, so `prime256v1` and `nist/P-256` stop being two different answers to the same question. If the guidance names a machine-readable format, this is the obvious candidate; the NTIA minimum elements similarly leaned on the formats that already existed.

## How sbomify handles CBOMs today

We built [CBOM support](/features/cbom/) so the inventory exists before the mandate does:

- **Every lineage ingests**: CycloneDX 1.6, 1.7 with registry identifiers, and the legacy IBM CBOM 1.0 format from older scanners. Artifacts are stored unmodified; analysis is derived on read.
- **Post-quantum grading**: every asset classifies as quantum-safe, quantum-vulnerable, or needs-review, grounded in FIPS 203/204/205 and CNSA 2.0, with a concrete migration target per vulnerable asset.
- **Certificates and protocols**: live expiry countdowns, weak-suite flagging, and a one-click cipher-suite inventory export for PCI DSS 12.3.3.
- **Fleet view**: a workspace cryptography dashboard that ranks which algorithms to migrate first, by how many components use them.
- **Sharing**: crypto posture on your public [Trust Center](/features/trust-center/), and a merged release-level CBOM per product release.

When the minimum-elements guidance lands, we will ship an assessment that checks your CBOMs against it, the same way we [assess SBOMs against the NTIA minimum elements](/features/generate-collaborate-analyze/) today.

## Start now, not in March

The lesson from the SBOM cycle is that the organizations that started inventorying before the mandates spent the mandate years refining, while everyone else spent them scrambling. The first CBOM is the hard one; [generating it](/faq/which-tools-generate-cboms/) is a solved problem, and the deadlines behind the guidance (2030 and 2031 for federal systems, 2033 for CNSA 2.0) are close enough that harvest-now-decrypt-later adversaries are already counting on your delay.

Upload a CBOM to [sbomify](https://app.sbomify.com) and you will know your quantum exposure this afternoon.
