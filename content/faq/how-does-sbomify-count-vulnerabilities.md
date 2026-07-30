---
title: "How does sbomify count vulnerabilities?"
description: "sbomify counts vulnerabilities against your current posture - the latest artifact per component and format - not by summing findings across every SBOM version you have ever uploaded."
answer: "Vulnerability counts in sbomify reflect your current posture: the findings present in the latest artifact for each component and format, with VEX-suppressed findings excluded. They are not a running total across every historical SBOM version. If your counts dropped noticeably after upgrading to v26.7.1, that is the fix for exactly this behaviour landing - the earlier numbers were inflated by superseded SBOM versions."
tldr: "Counts reflect your current posture, not the sum of every SBOM you have ever uploaded. Fixing a vulnerability and uploading a new SBOM makes the count go down. If your totals dropped after v26.7.1, the old numbers were counting superseded versions."
weight: 69
keywords: [vulnerability count, vulnerability dashboard, current posture, historical SBOM versions, count dropped, vulnerability totals, VEX suppression]
url: /faq/how-does-sbomify-count-vulnerabilities/
---

## The short answer

Counts reflect **current posture**: the findings present in the latest artifact for each component and format, after VEX statements are applied. They are not a cumulative total of everything ever scanned.

This is the behaviour you want, because it means the number responds to your work. Fix a vulnerability, upload a new SBOM, and the count goes down.

## Why your count may have dropped

If you have been using sbomify for a while and your totals fell noticeably around v26.7.1, nothing broke and nothing was fixed in your software. The counts were previously aggregated across **every historical SBOM version** for a component rather than the current one.

The practical effect was a number that could only ever go up. Upload ten iterations of a component over six months, remediate along the way, and findings from all ten versions were still counted, including ones you had already fixed and superseded.

That is now corrected, so expect the totals to drop, in many cases substantially. The new number is the honest one.

## What is included in a count

- **The latest artifact per component and format.** A CycloneDX SBOM and an SPDX SBOM for the same component are both current; version 3 of that CycloneDX SBOM supersedes versions 1 and 2.
- **Findings from your enabled scanners**, whether that is the built-in OSV scanning or [Dependency Track](/faq/how-do-i-enable-vulnerability-scanning/).
- **Minus anything covered by VEX.** Findings you have marked `not_affected` are suppressed, so the dashboard shows triaged exposure rather than raw scanner output. See [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/).

Skipped assessments are reported as skipped rather than counted as problems, so a scan that could not run does not inflate or deflate your posture.

## Release-scoped counts

A release pins specific artifacts, so a release's vulnerability posture is calculated against the artifacts pinned to it rather than whatever is newest on the component. This is deliberate: a release you shipped six months ago should report the posture of what you actually shipped, not of your current `main`.

That release posture is what your customers see on the public [Trust Center](/features/trust-center/) release page.

## Further reading

- [How do I enable vulnerability scanning?](/faq/how-do-i-enable-vulnerability-scanning/) - where the findings come from
- [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/) - suppressing findings that do not affect you
- [How do I create a software release?](/faq/how-do-i-create-a-software-release/) - how artifacts get pinned to a release
