---

title: "What Is OpenSSF? Scorecards, SLSA, and the Open Source Security Ecosystem"
description: "What is OpenSSF? The Open Source Security Foundation coordinates industry-wide efforts to secure open source software. Learn about OpenSSF Scorecards, how to run them, what they measure, and how they connect to SBOMs, SLSA, and supply chain security."
categories:
  - education
tags: [openssf, security, open-source, supply-chain]
tldr: "The Open Source Security Foundation (OpenSSF) coordinates the industry's efforts to secure open source software. Its most visible tool — OpenSSF Scorecards — automatically evaluates the security practices of any GitHub project across 18+ checks, producing a 0-10 score. Scorecards help consumers choose trustworthy dependencies and help maintainers identify security gaps."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is OpenSSF?"
    answer: "The Open Source Security Foundation (OpenSSF) is a cross-industry initiative under the Linux Foundation that brings together developers, security professionals, and organizations to improve the security of open source software. It coordinates projects including Scorecards, SLSA, Sigstore, GUAC, Alpha-Omega, and the Best Practices Badge program."
  - question: "What are OpenSSF Scorecards?"
    answer: "OpenSSF Scorecards is an automated tool that evaluates the security practices of open source projects on GitHub. It runs 18+ checks covering areas like branch protection, code review, dependency management, CI/CD security, fuzzing, and vulnerability disclosure. Each check produces a score from 0 to 10, providing a quick assessment of a project's security posture."
  - question: "How do I run OpenSSF Scorecards?"
    answer: "You can run Scorecards via the CLI (scorecard --repo=github.com/org/repo), as a GitHub Action on your own repository, or look up pre-computed scores on the Scorecard website (securityscorecards.dev). The GitHub Action can run on every pull request and post results to the repository's security tab."
  - question: "How do Scorecards relate to SBOMs?"
    answer: "Scorecards help evaluate the security quality of your dependencies, which is complementary to SBOM-based vulnerability monitoring. An SBOM tells you what dependencies you have; Scorecards tell you how well-maintained and secure those dependencies' development practices are. Combining both gives a more complete picture of supply chain risk."
  - question: "Is OpenSSF the same as the Linux Foundation?"
    answer: "OpenSSF is a project within the Linux Foundation, not a separate organization. It was formed in 2020 by merging the Core Infrastructure Initiative (CII) and the Open Source Security Coalition. Its members include Google, Microsoft, Amazon, Intel, IBM, and many other organizations invested in open source security."
date: 2024-04-25
slug: openssf-and-openssf-scorecards-bolstering-open-source-security
---

After the [Log4Shell vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2021-44228) exposed how a single widely-used open source library could affect hundreds of thousands of organizations, the technology industry confronted an uncomfortable question: who is responsible for securing the open source software that underpins the modern internet? The answer, increasingly, is everyone — and the **[Open Source Security Foundation (OpenSSF)](https://openssf.org/)** is the organization coordinating that effort.

OpenSSF is a cross-industry initiative under the Linux Foundation that brings together developers, security professionals, and organizations to improve the security of open source software. Formed in 2020 by merging the Core Infrastructure Initiative (CII) and the Open Source Security Coalition, OpenSSF includes members like Google, Microsoft, Amazon, Intel, IBM, and dozens of other companies that depend on open source and have a shared interest in securing it.

## The OpenSSF Ecosystem

OpenSSF is not a single tool — it is an umbrella for a portfolio of projects that together address different layers of the software supply chain security problem.

| Project | What It Does |
| --- | --- |
| **[Scorecards](https://securityscorecards.dev/)** | Automated security health assessment for open source projects |
| **[SLSA](/2024/08/17/what-is-slsa/)** | Build integrity and provenance framework (Supply chain Levels for Software Artifacts) |
| **[Sigstore](/2024/08/12/what-is-sigstore/)** | Keyless signing and verification infrastructure |
| **[GUAC](https://guac.sh/)** | Graph for Understanding Artifact Composition — aggregates supply chain metadata |
| **[Alpha-Omega](https://openssf.org/community/alpha-omega/)** | Funds security improvements for critical open source projects |
| **[Best Practices Badge](https://www.bestpractices.dev/)** | Self-assessment program for open source project security maturity |
| **[Package Analysis](https://github.com/ossf/package-analysis)** | Detects malicious packages in open source registries |
| **[Allstar](https://github.com/ossf/allstar)** | Enforces security policies on GitHub organizations |

This guide focuses on **Scorecards** — the most widely used and immediately actionable tool in the OpenSSF portfolio.

## OpenSSF Scorecards: How They Work

[OpenSSF Scorecards](https://securityscorecards.dev/) is an automated tool that evaluates the security practices of open source projects on GitHub. It examines a project's repository configuration, CI/CD setup, dependency management, and contribution practices, and produces a score from 0 to 10 for each check.

### What Scorecards Measure

Scorecards currently run 18+ checks. The most important ones:

**Branch Protection** — Is the default branch protected? Are force pushes blocked? Are status checks required before merging? Branch protection prevents unauthorized code from entering the main branch.

**Code Review** — Are pull requests reviewed before merging? Code review is one of the most effective defenses against malicious or accidental introduction of vulnerabilities.

**CI Tests** — Does the project run tests in CI? Automated testing catches regressions that manual review might miss.

**Dependency Update Tool** — Does the project use Dependabot, Renovate, or a similar tool to keep dependencies current? Outdated dependencies are a common source of vulnerabilities.

**Pinned Dependencies** — Are CI/CD workflow dependencies pinned to specific versions (by hash, not tag)? Unpinned dependencies in GitHub Actions workflows are a supply chain attack vector — an attacker who compromises a dependency can inject code into every workflow that references it by tag.

**Vulnerabilities** — Does the project have unaddressed vulnerabilities in the OSV database? This checks whether known security issues are being resolved.

**Security Policy** — Does the project have a `SECURITY.md` file describing how to report vulnerabilities? A clear disclosure process encourages responsible reporting.

**Signed Releases** — Are releases cryptographically signed? Signed releases let consumers verify artifact integrity. This is where [Sigstore](/2024/08/12/what-is-sigstore/) and Scorecards intersect.

**Fuzzing** — Does the project participate in OSS-Fuzz or use other fuzzing infrastructure? Fuzzing finds bugs that unit tests typically miss.

**SAST** — Does the project run static analysis security testing tools? SAST catches common vulnerability patterns in code.

**Token Permissions** — Are GitHub Actions workflow tokens scoped to minimum necessary permissions? Overly broad tokens increase the blast radius of a compromised workflow.

**Dangerous Workflow** — Does the project have CI workflows that run untrusted code in a privileged context (e.g., `pull_request_target` with checkout)? This is a known attack vector for GitHub Actions.

### Running Scorecards

**CLI:**

```bash
# Install
go install github.com/ossf/scorecard/v5/cmd/scorecard@latest

# Run against any public GitHub repo
scorecard --repo=github.com/apache/log4j
```

**GitHub Action (for your own repos):**

```yaml
- uses: ossf/scorecard-action@v2
  with:
    results_file: results.sarif
    publish_results: true
```

The GitHub Action posts results to the repository's Security tab and can be configured to run on every push or PR.

**Website:**

Pre-computed scores for popular projects are available at [securityscorecards.dev](https://securityscorecards.dev/).

### Interpreting Results

Scorecard results are most useful when viewed at the individual check level, not just as an aggregate score. A project might score 9/10 overall but have a 0 on Branch-Protection — which is a critical gap regardless of the overall score.

When evaluating a dependency, focus on the checks that matter most for your threat model:

- **If you're concerned about supply chain attacks:** Prioritize Branch-Protection, Code-Review, Pinned-Dependencies, Signed-Releases, and Dangerous-Workflow.
- **If you're concerned about vulnerability management:** Prioritize Vulnerabilities, Dependency-Update-Tool, and Maintained.
- **If you're concerned about build integrity:** Prioritize CI-Tests, SAST, and Fuzzing.

## Scorecards and SBOMs

Scorecards and [SBOMs](/what-is-sbom/) address different dimensions of dependency risk, and they are most powerful when used together.

An SBOM tells you _what_ dependencies you have and [whether they contain known vulnerabilities](/2026/02/01/sbom-scanning-vulnerability-detection/). Scorecards tell you _how well those dependencies are maintained_ — which is a leading indicator of future vulnerability risk. A dependency with no known CVEs but a Scorecard score of 2/10 (no code review, no CI tests, no branch protection) is a risk that an SBOM alone would not flag.

**Practical workflow:**

1. Generate an [SBOM](/what-is-sbom/) for your project to identify all dependencies
2. Run Scorecards against your critical dependencies (or check pre-computed scores on securityscorecards.dev)
3. Use Scorecard results to inform dependency selection: prefer well-maintained dependencies with strong security practices
4. Monitor both SBOMs (for vulnerabilities) and Scorecards (for security practice degradation) over time

For organizations using [sbomify](https://sbomify.com) for SBOM management, Scorecard data provides a complementary signal: while sbomify tracks known vulnerabilities in your components, Scorecards assess the development practices that determine how quickly those dependencies will respond to future vulnerabilities.

## Scorecards and SLSA

Scorecards and [SLSA](/2024/08/17/what-is-slsa/) are both OpenSSF projects, and they reinforce each other:

- Scorecards evaluate whether a project _follows_ good security practices (code review, CI testing, dependency management)
- SLSA verifies that a specific artifact _was built_ through a secure, untampered process

A project can have a perfect Scorecard but ship a compromised artifact if the build system is attacked. SLSA provenance catches that. Conversely, a project can have SLSA Build L3 provenance but still ship vulnerable code if it lacks code review or CI testing. Scorecards catch that.

Together, they provide layered defense: Scorecards for development practices, SLSA for build integrity, and [SBOMs](/what-is-sbom/) for component visibility.

{{< video-embed video_id="KdgkiWdhpZ8" title="OpenSSF Scorecards Deep Dive" description="A detailed look at OpenSSF Scorecards and their implications for open-source security." >}}

## Frequently Asked Questions

### What is OpenSSF?

The Open Source Security Foundation (OpenSSF) is a cross-industry initiative under the Linux Foundation that brings together developers, security professionals, and organizations to improve the security of open source software. It coordinates projects including Scorecards, [SLSA](/2024/08/17/what-is-slsa/), [Sigstore](/2024/08/12/what-is-sigstore/), GUAC, Alpha-Omega, and the Best Practices Badge program.

### What are OpenSSF Scorecards?

[OpenSSF Scorecards](https://securityscorecards.dev/) is an automated tool that evaluates the security practices of open source projects on GitHub. It runs 18+ checks covering areas like branch protection, code review, dependency management, CI/CD security, fuzzing, and vulnerability disclosure. Each check produces a score from 0 to 10.

### How do I run OpenSSF Scorecards?

You can run Scorecards via the CLI (`scorecard --repo=github.com/org/repo`), as a [GitHub Action](https://github.com/ossf/scorecard-action) on your own repository, or look up pre-computed scores at [securityscorecards.dev](https://securityscorecards.dev/).

### How do Scorecards relate to SBOMs?

Scorecards help evaluate the security quality of your dependencies, which is complementary to [SBOM](/what-is-sbom/)-based vulnerability monitoring. An SBOM tells you what dependencies you have; Scorecards tell you how well-maintained and secure those dependencies' development practices are. Combining both gives a more complete picture of supply chain risk.

### Is OpenSSF the same as the Linux Foundation?

OpenSSF is a project _within_ the Linux Foundation, not a separate organization. It was formed in 2020 by merging the Core Infrastructure Initiative (CII) and the Open Source Security Coalition. Its members include Google, Microsoft, Amazon, Intel, IBM, and many other organizations invested in open source security.
