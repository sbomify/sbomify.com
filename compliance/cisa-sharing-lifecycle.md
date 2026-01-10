---
layout: page
permalink: /compliance/cisa-sharing-lifecycle/
title: "CISA SBOM Sharing Lifecycle Report (2023)"
description: "Guide to the CISA SBOM Sharing Lifecycle Report, covering discovery, access, and transport patterns for SBOM distribution across supply chains."
section: compliance
---

[← Back to Compliance Overview]({{ site.url }}/compliance/)

**Who it affects:** Organizations that distribute or retrieve SBOMs across supply chains (vendors, buyers, operators) that need practical patterns for discovery, access, and transport.

<div class="not-prose my-6 p-5 bg-[#201B4C] border border-[#37306B] rounded-xl">
  <p class="text-white mb-3"><strong>Need help with compliance?</strong> We can help you navigate your SBOM compliance journey.</p>
  <a href="https://app.sbomify.com/enterprise-contact/" class="inline-block px-5 py-2.5 bg-[#8A7DFF] hover:bg-[#7A6DE5] text-white rounded-full font-medium text-sm transition-all duration-200">Get in Touch</a>
</div>

---

## Overview

The [CISA SBOM Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf) focuses on operational aspects of SBOM distribution rather than adding new data fields. It defines the SBOM sharing lifecycle as three phases: **Discovery** (locating SBOMs), **Access** (authorization and retrieval), and **Transport** (delivery mechanisms).

This report does not prescribe additional SBOM properties but provides guidance on infrastructure and processes needed for effective SBOM sharing across the supply chain.

## The Three Phases

### 1. Discovery

How do consumers find out that an SBOM exists and where to get it?

- Discoverability mechanisms for locating SBOMs
- Metadata and pointers that indicate SBOM availability

### 2. Access

Who is allowed to retrieve the SBOM and how is authorization managed?

- Authorization and access control patterns
- Public vs. private SBOM distribution models
- Role-based access considerations

### 3. Transport

How are SBOMs physically delivered from producer to consumer?

- Repository portals and package registries
- APIs for SBOM retrieval
- Out-of-band delivery mechanisms (email, secure file transfer)
- Enrichment workflows where downstream consumers add information and re-share

## Key Concepts

- **Discoverability mechanisms** for locating SBOMs
- **Authorization and access control patterns** for managing who can retrieve SBOMs
- **Transport protocols and sharing patterns** (repository portals, APIs, out-of-band delivery)
- **Enrichment workflows** where downstream consumers add information and re-share

## Practical Applications

This report is valuable for:

- Organizations setting up SBOM distribution infrastructure
- Procurement teams defining SBOM delivery requirements in contracts
- Security teams designing SBOM ingestion workflows

## Related Frameworks

- [CISA Framing Document]({{ site.url }}/compliance/cisa-framing/) - Conceptual definitions
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) - What goes in the SBOM

## Official Source

- [CISA SBOM Sharing Lifecycle Report](https://www.cisa.gov/sites/default/files/2023-04/sbom-sharing-lifecycle-report_508.pdf)

---

**Disclaimer:** This page represents our interpretation of the referenced frameworks and standards. While we strive for accuracy, we may have made errors or omissions. This content is provided for informational purposes only and does not constitute legal advice. For compliance decisions, consult the official source documents and seek qualified legal counsel.

[← Back to Compliance Overview]({{ site.url }}/compliance/)
