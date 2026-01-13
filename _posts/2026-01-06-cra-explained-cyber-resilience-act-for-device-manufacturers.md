---
layout: post
title: "CRA Explained: What the Cyber Resilience Act Means for Device Manufacturers"
description: "Podcast episode with EU CRA expert Sarah Fluchs explaining SBOM requirements, the 5-year support mandate, and vulnerability management for device manufacturers."
author:
  display_name: Viktor Petersson
category: podcast
tags: [CRA, compliance, security, sbom]
---

The EU Cyber Resilience Act (CRA) is transforming how device manufacturers approach cybersecurity. To break down what this means in practice, Viktor sat down with Sarah Fluchs on the Nerding Out with Viktor podcast.

Sarah isn't just any commentator on the CRA - she serves on the **EU Commission's CRA expert group**, giving her first-hand involvement in shaping this landmark regulation. With a PhD in security-by-design and years of experience in OT (Operational Technology) cybersecurity, she brings a rare blend of technical depth and policy insight.

{% include components/video-embed.html
video_id="e9_bpsJKOL0"
title="CRA Explained: Cyber Resilience Act for Device Manufacturers"
description="Podcast episode with EU CRA expert Sarah Fluchs explaining SBOM requirements, the 5-year support mandate, and vulnerability management for device manufacturers."
%}

## SBOMs Are Non-Negotiable for CRA Compliance

Sarah is emphatic: **SBOMs are critical for CRA compliance**. The regulation requires manufacturers to maintain full visibility into their software supply chain, and SBOMs are the mechanism to achieve this.

But generating quality SBOMs is only half the battle. The real challenge lies in managing them over time - tracking versions, maintaining audit trails, and making software components traceable across complex supply chains. For manufacturers of long-lifecycle hardware, this represents a fundamental operational shift.

This is exactly where proper tooling becomes essential. A platform like [sbomify]({{ site.url }}) addresses these challenges by providing:

- **Lifecycle management** - Archive and track SBOMs across product versions and releases
- **Centralized portal** - Manage all your security artifacts in one place, with full version history
- **Trust Center** - Share SBOMs with stakeholders (customers, auditors, regulators) through a branded portal
- **CI/CD integration** - Generate SBOMs automatically in your pipeline and upload them to sbomify

## The 5-Year Support Requirement Changes Everything

The CRA mandates security updates for the expected product lifetime, with a **minimum of five years**. For OT devices that often operate for 20+ years, this forces companies to fundamentally rethink their approach.

This isn't just about patching - it's about maintaining comprehensive records of what software was shipped, when, and to whom. You need to be able to answer: "What components were in version 2.3.1 that we shipped in 2024?" years down the line.

This is where SBOM archiving becomes critical. With sbomify, every release is captured and stored, creating an auditable trail that satisfies CRA's documentation requirements without manual tracking.

## Vulnerability Management at Scale

Manufacturers must establish robust vulnerability handling processes, including responsible disclosure mechanisms. Sarah notes that the hardest part isn't formal reporting - it's building an efficient system to triage the influx of vulnerability reports.

sbomify integrates with vulnerability databases like [Google OSV]({{ site.url }}/features/integrations/) and [Dependency Track]({{ site.url }}/features/integrations/), allowing you to continuously monitor your archived SBOMs for newly discovered vulnerabilities - even for products shipped years ago.

## Sarah's Key Message

> "CRA compliance isn't about ticking boxes. Done right, it's a path to stronger engineering practices, deeper supply chain accountability, and better product security."

Her advice for manufacturers getting started:

1. **Find your showstoppers early** - Run your products through the CRA requirements now to identify major blockers
2. **Start your risk assessment** - This is the linchpin that informs all other decisions
3. **Establish vulnerability handling** - Build the processes to manage the influx of security information

## Listen to the Full Episode

- [Full episode with transcript](https://vpetersson.com/podcast/S02E21.html)
- [YouTube](https://www.youtube.com/watch?v=e9_bpsJKOL0)
- [Spotify](https://open.spotify.com/show/2eoSJgEN0YOgshqYkqnX2B)
- [Apple Podcasts](https://podcasts.apple.com/podcast/nerding-out-with-viktor/id1722663668)
- [Amazon Music](https://music.amazon.com/podcasts/c2443912-6c23-4ce9-804c-4caa827f63d7/nerding-out-with-viktor)

## Get CRA-Ready with sbomify

The CRA deadline is approaching fast. [sbomify]({{ site.url }}) gives you the infrastructure to generate, manage, and share SBOMs throughout your product lifecycle - whether you're shipping embedded devices, IoT products, or enterprise software.

[Get started free →](https://app.sbomify.com)

## Related Resources

- [EU Cyber Resilience Act - Official EU page](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- [Why Now? CRA is Coming]({{ site.url }}/features/why-now/)
- [Understanding the EU Cyber Resilience Act: The Role of SBOMs]({{ site.url }}/2024/07/10/understanding-the-eu-cyber-resilience-act-the-role-of-sboms-in-enhancing-cybersecurity/)
