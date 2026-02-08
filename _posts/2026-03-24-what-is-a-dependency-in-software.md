---
layout: post
title: "What Is a Dependency in Software? A Beginner's Guide"
description: "Learn what software dependencies are, the difference between direct and transitive dependencies, how dependency trees work, and how SBOMs document them."
category: education
tags: [dependencies, security, sbom, supply-chain]
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com

---

A dependency in software is any external component — a library, framework, module, or package — that your application relies on to function. When you import a package from npm, add a library from PyPI, or include a Maven artifact, you are adding a dependency. Dependencies allow developers to reuse tested, maintained code rather than writing everything from scratch. Modern applications are built overwhelmingly from dependencies: studies consistently show that [70-90% of a typical application consists of open source components](https://www.linux.com/training-tutorials/estimating-total-number-linux-contributors-approach-using-linus-law/).

## Direct vs. Transitive Dependencies

The most important distinction in dependency management is between direct and transitive dependencies.

**Direct dependencies** are the packages your project explicitly declares. These appear in your dependency manifest — `package.json` for JavaScript, `requirements.txt` or `pyproject.toml` for Python, `pom.xml` for Java, `go.mod` for Go, `Cargo.toml` for Rust, and similar files for other ecosystems. You chose these packages, you decided which versions to use, and you are (presumably) aware of their purpose in your application.

**Transitive dependencies** are the dependencies of your dependencies. When you add package A to your project, and package A depends on packages B and C, and package B depends on package D, then B, C, and D are all transitive dependencies of your project. You may never have heard of packages B, C, or D, yet they are running in your application and their vulnerabilities are your vulnerabilities.

### The Scale of Transitive Dependencies

The ratio of transitive to direct dependencies is often surprising:

| Ecosystem  | Typical direct dependencies | Typical total (including transitive) |
| ---------- | --------------------------- | ------------------------------------ |
| JavaScript | 20-50                       | 200-1,500+                           |
| Python     | 10-30                       | 50-200                               |
| Java/Maven | 10-30                       | 100-500                              |
| Go         | 10-30                       | 50-300                               |
| Rust/Cargo | 10-30                       | 100-400                              |

A JavaScript project with 30 direct dependencies may pull in over 1,000 transitive packages through the npm dependency tree. Each of those packages is code running in your application, with its own maintenance status, license, and vulnerability history.

## The Dependency Tree

A dependency tree (or dependency graph) is the complete set of relationships between a project and all of its dependencies, both direct and transitive. Visualizing this tree reveals the full scope of what your application depends on.

```
my-application
├── express@4.18.2 (direct)
│   ├── body-parser@1.20.2 (transitive)
│   │   ├── bytes@3.1.2
│   │   └── iconv-lite@0.4.24
│   │       └── safer-buffer@2.1.2
│   ├── cookie@0.5.0
│   └── ...
├── lodash@4.17.21 (direct)
└── axios@1.6.2 (direct)
    └── follow-redirects@1.15.3 (transitive)
```

In this example, `express`, `lodash`, and `axios` are direct dependencies. Everything nested beneath them is transitive. The vulnerability in `safer-buffer` — four levels deep — is just as dangerous as one in `express` itself.

## Why Dependencies Matter for Security

Dependencies are the primary attack surface for most applications. Several high-profile incidents illustrate the risks:

### Vulnerable Dependencies

The [Log4Shell vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2021-44228) ([CVE-2021-44228]({{ site.url }}/2026/02/13/cve-vulnerability-explained/)) in the Apache Log4j logging library affected millions of Java applications. Many organizations did not know they used Log4j because it was a transitive dependency — pulled in by frameworks and libraries they did depend on directly.

### Compromised Dependencies

The [XZ Utils backdoor](https://nvd.nist.gov/vuln/detail/CVE-2024-3094) demonstrated that attackers can spend years gaining trust in a legitimate open source project before inserting malicious code. When a dependency is compromised, every application that uses it is affected.

### Abandoned Dependencies

Dependencies that are no longer maintained represent a growing risk. When a [CVE]({{ site.url }}/2026/02/13/cve-vulnerability-explained/) is found in an unmaintained package, there may be no one to produce a patch. The component stays vulnerable indefinitely unless consumers fork it or find an alternative.

### Dependency Confusion

Dependency confusion attacks exploit the way package managers resolve names. An attacker publishes a malicious package to a public registry with the same name as a private internal package. If the package manager checks the public registry first (or alongside) the private one, it may install the attacker's package instead.

For a deeper discussion of supply chain attacks, see our [software supply chain management guide]({{ site.url }}/2026/02/20/software-supply-chain-management/).

## Lock Files

Lock files are a critical tool for dependency management. They record the exact versions of every dependency (direct and transitive) that were resolved during installation, ensuring that subsequent installations produce identical results.

| Ecosystem  | Lock File           | Manifest File    |
| ---------- | ------------------- | ---------------- |
| JavaScript | `package-lock.json` | `package.json`   |
| Python     | `poetry.lock`       | `pyproject.toml` |
| Rust       | `Cargo.lock`        | `Cargo.toml`     |
| Go         | `go.sum`            | `go.mod`         |
| Ruby       | `Gemfile.lock`      | `Gemfile`        |
| PHP        | `composer.lock`     | `composer.json`  |

Without a lock file, the same manifest can resolve to different dependency versions on different machines or at different times. This non-determinism is both a reliability risk (builds may break unpredictably) and a security risk (a newly published malicious version could be pulled in automatically).

Lock files should always be committed to version control. They are the source of truth for what is actually installed in your project.

## How SBOMs Document Dependencies

A [Software Bill of Materials]({{ site.url }}/what-is-sbom/) provides a complete, machine-readable inventory of every component in your software, including all transitive dependencies. This is essential for security because:

1. **Full visibility.** An SBOM documents every package in the dependency tree, not just the direct dependencies listed in your manifest file. This is the only reliable way to know everything running in your application.

2. **Vulnerability matching.** Once you have an SBOM, tools like [Grype](https://github.com/anchore/grype), [OWASP Dependency-Track](https://dependencytrack.org/), and [OSV-Scanner](https://google.github.io/osv-scanner/) can match every component against vulnerability databases like the [NVD](https://nvd.nist.gov/) and the [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog). See our [SBOM scanning guide]({{ site.url }}/2026/03/28/sbom-scanning-vulnerability-detection/) for details.

3. **Dependency relationship mapping.** Both [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/) support dependency relationship data, documenting which components depend on which others. This lets you trace the path from a vulnerable transitive dependency back to the direct dependency that brought it in.

4. **License tracking.** Each dependency carries a license. SBOMs document these licenses, enabling automated compliance checking. A single [GPL-licensed]({{ site.url }}/2026/02/17/gpl-license-guide/) transitive dependency can trigger copyleft obligations for your entire application.

SBOM generation tools like [Syft](https://github.com/anchore/syft) and [Trivy](https://github.com/aquasecurity/trivy) analyze lock files and build artifacts to capture the full dependency tree. For language-specific SBOM generation instructions, see our [SBOM guides]({{ site.url }}/guides/).

## Best Practices

1. **Always use and commit lock files.** Lock files ensure reproducible builds and prevent unexpected dependency changes. Review lock file diffs in pull requests to catch unintended dependency updates.

2. **Audit your dependency tree regularly.** Use `npm audit`, `pip-audit`, `cargo audit`, or equivalent tools to check for known vulnerabilities. Do not limit auditing to direct dependencies — transitive vulnerabilities are equally dangerous.

3. **Minimize your dependency footprint.** Every dependency is a potential risk vector. Before adding a new package, evaluate whether the functionality justifies the added surface area. Prefer well-maintained libraries with active security response processes.

4. **Generate and monitor SBOMs.** Automate SBOM generation in your CI/CD pipeline and monitor SBOMs continuously against vulnerability databases. This catches newly disclosed CVEs in your existing dependencies. See our [SBOM management guide]({{ site.url }}/2026/03/12/sbom-management-best-practices/).

5. **Keep dependencies up to date.** Apply security updates promptly, especially for dependencies listed in the [CISA KEV catalog]({{ site.url }}/2026/02/23/what-is-kev-cisa-known-exploited-vulnerabilities/). Use tools like Dependabot or Renovate to automate update pull requests.

6. **Review dependency changes.** Treat dependency updates in pull requests with the same scrutiny as code changes. A bumped version may introduce new transitive dependencies, change licenses, or include unexpected modifications.

## Frequently Asked Questions

### What is a dependency in software?

A dependency is any external component — a library, framework, module, or package — that your application relies on to function. Dependencies are declared in manifest files (like `package.json` or `requirements.txt`) and installed from package registries (like npm or PyPI). They allow developers to reuse existing code rather than building everything from scratch.

### What is a transitive dependency?

A transitive dependency is a dependency of your dependency. If your project depends on package A, and package A depends on package B, then B is a transitive dependency of your project. Transitive dependencies are often invisible to developers but can contain vulnerabilities, restrictive licenses, or outdated code. They typically outnumber direct dependencies by a factor of 5-30x depending on the ecosystem.

### What is a dependency tree?

A dependency tree (or dependency graph) is the complete hierarchy of all dependencies in a project, showing both direct and transitive relationships. It reveals the full set of code that your application actually uses at runtime. SBOM generation tools analyze dependency trees to produce complete component inventories.

### Why are dependencies a security risk?

Dependencies are a security risk because each one introduces code that your team did not write and may not audit. Known vulnerabilities in dependencies (CVEs) are a primary attack vector — incidents like Log4Shell affected millions of applications through a single widely-used library. Dependencies can also be intentionally compromised (as in the XZ Utils backdoor), abandoned by maintainers, or used in dependency confusion attacks.

### What is a lock file?

A lock file records the exact resolved versions of all dependencies (direct and transitive) in a project. Examples include `package-lock.json` (npm), `poetry.lock` (Python), and `Cargo.lock` (Rust). Lock files ensure reproducible builds — the same versions are installed every time, on every machine. They should always be committed to version control.
