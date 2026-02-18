---
type: case-studies
title: "Atsign Case Study: Working towards NTIA compliance"
description: "Atsign provides a platform for secure and private communication, and its NoPorts product is used for zero-trust infrastructure access. This is how sbomify helped them improve the quality of their SBOMs."
url: /case-studies/atsign/
aliases:
  - /case-studies/atsign
logo: /assets/images/site/atsign-logo-horizontal-color2022.svg
---

## About Atsign

Atsign’s atProtocol enables mutual verification between any two people,
devices, or entities connected to the Internet. Once verified, they can
securely and privately exchange data without exposing vulnerabilities.
The open-source atPlatform empowers developers to create applications and
solutions with security and privacy at their core.

## The Challenge

Atsign have been producing SBOMs for some of their key products and components
for some time. This has been part of their 'showing how we care about
security' using SBOMs, Supply-chain Levels for Software Artifacts (SLSA) and
OpenSSF Scorecards.

Those SBOMs were created by running dependency lock files through Anchore
Syft. Unfortunately, this did not help to describe Atsign's own software or
carry any of the metadata needed for NTIA compliance (which describes 'The
Minimum Elements For a Software Bill of Materials (SBOM)').

The SBOMs also weren't very visible, buried away as files in GitHub releases
(which might sometimes be a completely different place from where the
software itself would be found such as Docker Hub).

## Solution with sbomify

Partnering with **sbomify** helped Atsign overcome these challenges:

- **Augmentation and Enrichment**: Atsign filled out the relevant metadata in
  sbomify so that it could be added to lock file generated components by the
  sbomify GitHub Action. The Action is run as part of their CD pipelines so
  that SBOMs are created for each release.
- **sbomify badge**: An sbomify badge in the README.md for each open source
  repo sits alongside the SLSA and Scorecard badges, making the SBOM a visible
  part of the trifecta. It also provides an easy link through to the most
  recent SBOMs for that component. For example the
  [at_server](https://github.com/atsign-foundation/at_server/) repo, which
  contains the core software implementation of the atProtocol.

## Our Broader Partnership

Whilst working together on SBOM quality and visibility, opportunities have
arisen to take on broader issues in the SBOM arena, such as the difficulty
in generating SBOMs for C based projects.

<div class="quote-container bg-gray-100 p-6 my-8 rounded-lg border-l-4 border-blue-500">
    <p class="italic text-gray-700">
        "Working with Viktor and the team at sbomify has been a pleasure.
        Using sbomify has hugely accelerated our work on NTIA compliance. Viktor
        has also been leading a group that's creating standards for making SBOMs.
        This gives us confidence that sbomify will become a platform that follows
        industry practices as they emerge."
    </p>
    <p class="mt-4 font-semibold text-gray-800">— Chris Swan</p>
</div>

## The Results

- **Complete, compliant SBOMs**: The SBOMs Atsign creates now carry the full
  set of metadata that a customer would expect to find.
- **Enhanced Visibility**: SBOMs are no longer hidden away in releases, and
  have joined SLSA and Scorecard in showing that Atsign care about security.

## Conclusion

By teaming up with sbomify, Atsign have improved the quality and visibility
of SBOMs.

Privacy and the security needed to guarantee it are at the heart of Atsign's
platform, so being able to show customers how they care about security is
vital in establishing trust. Especially when Atsign solutions like NoPorts
become security-critical infrastructure for their customers.
