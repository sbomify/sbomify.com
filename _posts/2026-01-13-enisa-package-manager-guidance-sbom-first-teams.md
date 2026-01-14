---
layout: post
title: "ENISA's Package Manager Guidance: What It Means for SBOM-First Teams"
description: "Analysis of ENISA's December 2025 Technical Advisory for Secure Use of Package Managers, covering secure dependency consumption, supply chain attacks, and how SBOMs fit into the recommended lifecycle."
author:
  display_name: Viktor Petersson
category: compliance
tags: [sbom, enisa, security, supply-chain, package-managers]
---

In December 2025, ENISA quietly published a draft *Technical Advisory for Secure Use of Package Managers* (ENISA-TG-2025-01). It targets developers who live in npm, pip, Maven and friends, and focuses on one thing only: **how to consume third-party packages safely in your software lifecycle**.

If you care about SBOMs, this document is effectively a how-to manual for building a dependency lifecycle around them.

You can read the original draft here: [ENISA Technical Advisory for Secure Use of Package Managers (v0.8 draft, December 2025)](https://www.enisa.europa.eu/sites/default/files/2025-12/ENISA%20Technical%20Advisory%20-%20Package_Managers_v_0.8_draft.pdf).

## What ENISA Actually Covers

ENISA is very explicit about scope:

- It is about **consuming** packages, not publishing them
- It looks at package managers such as npm, pip, Maven, Conda, NuGet, Cargo and others
- It assumes these are part of your SDLC and asks: how do you use them without blowing up your supply chain?

The advisory walks through:

1. How package managers and dependency graphs work
2. Security risks in package consumption
3. Best practices for:
   - Package selection
   - Integration
   - Monitoring
   - Vulnerability mitigation
   - Automation

## Installed vs Reachable Code: The Key Mental Model

ENISA uses a simple Node.js example with the `express` framework to make an important point. Installing one dependency pulls in:

- The package itself
- Its direct dependencies
- All transitive dependencies

In the example, importing `express` brings in roughly **27 direct dependencies and 68 packages in total** once transitive ones are resolved.

Two important distinctions follow:

- These "third-party" components **become part of your trusted codebase** once included, so they deserve similar scrutiny to first-party code
- Not all installed code is actually executed. There is a difference between:
  - **Installed code** (on disk)
  - **Reachable code** (actually executed at runtime)

ENISA explicitly calls this out: if a vulnerability lives in code that is never invoked, your application is less likely to be exploitable — although not guaranteed safe. Reachability and exploitability analysis become central to risk.

For sbomify users this maps neatly to the reality that **an SBOM is an inventory of installed components, not a direct list of exploitable vulnerabilities**. You still need context.

## The Risk Model: Inherent Flaws and Supply Chain Attacks

ENISA splits risk into two main groups.

### 1. Packages with Inherent Vulnerabilities

These are the usual suspects:

- Insecure coding and design patterns
- Misconfigurations
- Discontinued or unmaintained packages that never receive fixes

Because popular packages sit high in dependency trees, a single unchecked flaw can propagate into thousands of projects.

### 2. Supply Chain Attacks

Here ENISA focuses on package-ecosystem specific attacks, including:

- **Insertion of malicious packages** — Attackers publish new, malicious modules that masquerade as legitimate utilities

- **Compromised legitimate packages** — Attackers gain control of maintainer accounts and push backdoored versions, as in the `event-stream` and `ua-parser-js` incidents

- **Typosquatting** — Lookalike names such as `crossenv` vs the legitimate `cross-env`, hoping a single mistyped character is enough to land malicious code in your build

- **Namespace / dependency confusion** — Publishing higher-version packages with the same name as internal ones to trick build systems into pulling from public registries

The consequence is a massive blast radius: recent npm and React incidents are used to show how one compromise can affect millions of websites or billions of weekly downloads.

## ENISA's Lifecycle: Five Stages of Secure Package Consumption

The main value of the document is a lifecycle model with concrete controls and a "cheat sheet" of commands, mostly in the npm and GitHub ecosystem.

### 1. Selecting Packages

**Goal:** Avoid inherently vulnerable and malicious components *before* they enter your tree.

ENISA proposes assessing packages along several dimensions:

- **Publisher trust and provenance** — Prefer verified publishers and packages with provenance metadata. Use tools such as `npm audit signatures` or UI indicators to check provenance

- **Existing known vulnerabilities** — Scan before or during dependency review using:
  - `npm audit --json`
  - `osv-scanner -r .`
  - OWASP Dependency-Check
  - Check databases such as EUVD, OSV.dev, Snyk, NVD

- **Signing and integrity** — Use ecosystems that support integrity metadata (hashes, lockfiles, `pip install --require-hashes`). Avoid direct installs from random tarballs or Git URLs that bypass registry checks

- **Maintainer reputation and project health** — Inspect maintainers, contributors, commit history, issues, and release cadence. Prefer active projects maintained by known organisations or foundations

- **Secure practices** — Examine lifecycle scripts (preinstall/postinstall) and dependency trees for suspicious behaviour or bloat

For sbomify customers: this is effectively **SBOM pre-filtering**. You decide what is allowed to appear in your SBOM in the first place.

### 2. Integrating Packages

**Goal:** Once a package is selected, make sure it is integrated in a verifiable way.

Key practices:

- **SBOM creation** — Generate an SBOM during builds to document all dependencies for future security and compliance work. Example commands:
  - `syft . -o spdx-json > sbom.json`
  - `@cyclonedx/cyclonedx-npm --output-file sbom.json`

- **Vulnerability checks in CI/CD** — Block builds when dependency scans find issues above your risk threshold

- **Integrity enforcement** — Use lockfiles and hash verification so installations match approved versions

- **Source enforcement** — Restrict installs to trusted registries via configuration (for example `.npmrc`)

- **Installation script control** — Disable or restrict install-time scripts, especially in high assurance environments, using `npm install --ignore-scripts` or equivalent

- **Version pinning** — Commit both manifest and lockfile, and enforce `npm ci` or similar in CI to ensure deterministic builds

This is the part where sbomify fits naturally into your build system: **SBOMs produced automatically on every build, using the exact dependency tree that goes to production.** See our [SBOM generation guides]({{ site.url }}/guides/) for language-specific tutorials.

### 3. Monitoring Packages

**Goal:** Keep visibility on risk as time and ecosystems move on.

ENISA's monitoring controls:

- **SBOM-driven monitoring** — Use SBOMs as the data source for continuous vulnerability correlation with tools such as Grype and OSV-Scanner

- **Automated scanning in CI/CD** — Run scans on a schedule and on every change to catch newly disclosed issues, even if your code did not change

- **Tracking CVEs and advisories** — Monitor EUVD, OSV, Snyk, NVD and integrate feeds with your alerting

- **Monitoring outdated or deprecated releases** — Watch for new versions, deprecated packages and maintainer changes (for example, checking `npm info` and `npm view` output)

- **Alerting** — Set alerts when:
  - New CVEs affect locked versions
  - Releases are deprecated
  - Maintainers or ownership change

In sbomify terms: you want **SBOMs that stay live**, continuously enriched with new vulnerability and lifecycle data, not static PDFs in an audit folder. Our [integrations with Google OSV and Dependency Track]({{ site.url }}/features/integrations/) provide exactly this continuous monitoring capability.

### 4. Vulnerability Mitigation

**Goal:** Move from "we have 2,000 CVEs" to "here is what actually matters and what we did about it".

ENISA defines a four-step loop:

1. **Assess** — Pull metrics such as:
   - CVSS
   - EPSS
   - KEV (Known Exploited Vulnerabilities)
   - VEX data from suppliers
   - Perform reachability analysis with tools like CodeQL or Semgrep to see if vulnerable code is actually used

2. **Prioritise** — Set explicit thresholds (for example, "CVSS ≥ 7.0 or EPSS ≥ 0.3"). Focus on exploitable, reachable vulnerabilities affecting production dependencies

3. **Mitigate** — Upgrade or patch (for example `npm update` or specific version installs). Use temporary controls such as WAF rules and feature flags if you cannot patch immediately. Remove, roll back or isolate when no fix exists

4. **Document and notify** — Classify vulnerabilities as exploitable, non-exploitable or mitigated by configuration. Update VEX statements and SBOMs. Communicate with affected customers and internal teams as required

This is where sbomify aims to be opinionated: **SBOMs plus VEX-like context give you a narrative you can share with auditors, customers and your own management, not just a long list of CVE IDs.**

### 5. Automation

ENISA closes by stating the obvious but essential point: with hundreds of dependencies and many repos, manual processes fail.

They recommend using CI/CD platforms such as GitHub Actions, GitLab CI or Jenkins to automate:

- SBOM generation with Syft or CycloneDX CLI
- Vulnerability scanning with tools like Grype or OSV-Scanner
- Hardening installs with native commands such as `npm ci --ignore-scripts`

The message aligns perfectly with how we see mature SBOM practices: **continuous, automated, pipeline-driven**. Our [GitHub Action](https://github.com/sbomify/github-action) and [GitLab modules]({{ site.url }}/2024/11/12/gitlab-support/) make this straightforward to implement.

## What This Means for SBOM Programmes

If you read ENISA's advisory through an SBOM lens, a few themes stand out:

### SBOMs Are Assumed, Not Optional

They sit at the core of integration, monitoring and mitigation. If you cannot reliably produce them from your builds, you are out of step with this guidance.

### Reachability and Context Matter

ENISA repeatedly warns against treating every "dependency has CVE" finding as equal. Reachability, exploitability and environment turn SBOM data into real risk insight.

### The Lifecycle Is Continuous

Select → integrate → monitor → mitigate → automate is a loop, not a checklist. SBOMs and their associated data must stay current.

### Documentation and Explainability Are First Class

Updating SBOMs, creating VEX statements and notifying stakeholders are explicit recommendations, not nice-to-have extras.

For sbomify, this advisory is a strong validation of the product philosophy: **inventory first, context next, automation everywhere**.

## Get Started with SBOM-First Dependency Management

Ready to implement ENISA's guidance in your organisation? [sbomify]({{ site.url }}) provides the infrastructure to:

- **Generate SBOMs automatically** in your CI/CD pipeline
- **Monitor continuously** for new vulnerabilities in your dependencies
- **Share securely** via our [Trust Center]({{ site.url }}/features/trust-center/) with customers and auditors
- **Manage the lifecycle** with versioning, archiving, and audit trails

[Get started free →](https://app.sbomify.com)

## Resources

### Source Document

- [ENISA Technical Advisory for Secure Use of Package Managers (v0.8 draft, December 2025)](https://www.enisa.europa.eu/sites/default/files/2025-12/ENISA%20Technical%20Advisory%20-%20Package_Managers_v_0.8_draft.pdf)

### Related sbomify Resources

- [What is an SBOM?]({{ site.url }}/what-is-sbom/) — Introduction to Software Bills of Materials
- [SBOM Generation Guides]({{ site.url }}/guides/) — Language and platform-specific tutorials
- [The SBOM Lifecycle: Generation, Distribution, and Analysis]({{ site.url }}/features/generate-collaborate-analyze/)
- [SBOM Resources & Tools]({{ site.url }}/resources/) — Comprehensive tool directory

### Related Compliance Frameworks

- [CISA Minimum Elements (2025 Draft)]({{ site.url }}/compliance/cisa-minimum-elements/) — US guidance on SBOM data fields
- [EU Cyber Resilience Act]({{ site.url }}/compliance/eu-cra/) — Binding EU law requiring SBOMs
- [NTIA Minimum Elements]({{ site.url }}/compliance/ntia-minimum-elements/) — The foundational US SBOM baseline
