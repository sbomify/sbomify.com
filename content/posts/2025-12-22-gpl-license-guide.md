---

title: "The GPL License: A Comprehensive Guide to the GNU General Public License"
description: "Understand the GPL license, including GPL v2 vs v3, copyleft obligations, LGPL, AGPL, commercial use, and how SBOMs track GPL compliance."
categories:
  - education
tags: [gpl, licensing, open-source, compliance]
tldr: "The GNU General Public License (GPL) is a copyleft license that requires derivative works to be distributed under the same terms. Understanding GPL v2 vs v3, LGPL, and AGPL obligations is critical for compliance — and SBOMs help track which components carry GPL requirements."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the GPL license?"
    answer: "The GPL (GNU General Public License) is a copyleft free software license created by the Free Software Foundation. It guarantees that users can run, study, modify, and distribute the software, with the condition that any distributed derivative works must also be licensed under the GPL and include source code."
  - question: "Can I use GPL software in commercial products?"
    answer: "Yes. The GPL explicitly permits commercial use, distribution, and sale. The restriction is not on commerce but on making the software proprietary. If you distribute a product that includes GPL code, you must make the complete source code available under the GPL."
  - question: "What is the difference between GPL and LGPL?"
    answer: "The GPL requires that any derivative work be distributed under the GPL (strong copyleft). The LGPL (Lesser GPL) allows proprietary software to link against LGPL-licensed libraries without the copyleft applying to the proprietary code. If you modify the LGPL library itself, those modifications must be shared, but your application code can remain proprietary."
  - question: "What is the difference between GPL v2 and GPL v3?"
    answer: "GPL v3 added explicit patent grants, anti-tivoization provisions preventing hardware lockdown of modified software, anti-DRM clauses, broader international compatibility, and better compatibility with other open source licenses like Apache 2.0. GPL v2 remains widely used, notably by the Linux kernel, which is licensed under GPL v2 only."
  - question: "How do SBOMs help with GPL compliance?"
    answer: "SBOMs document every component in your software along with its license, making it possible to automatically identify GPL-licensed dependencies, track copyleft obligations, and enforce license policies in CI/CD pipelines. Both CycloneDX and SPDX include standardized license fields that support machine-readable GPL license identification."
date: 2025-12-22
slug: gpl-license-guide
---

The GPL (GNU General Public License) is a free software license that guarantees end users the freedom to run, study, modify, and share software. Created by Richard Stallman and the Free Software Foundation (FSF), the GPL is the most widely used copyleft license in open source software. Its defining characteristic is the copyleft requirement: any derivative work must also be distributed under the GPL, ensuring that the freedoms it grants are preserved downstream.

## What Is the GPL?

The GNU General Public License, commonly called the GPL or GNU GPL, is a series of free software licenses published by the [Free Software Foundation](https://www.fsf.org/) (FSF). The GPL was first written by Richard Stallman in 1989 for the GNU Project and has since become the most prominent copyleft license in the world.

The core idea behind the GPL is simple: software licensed under the GPL can be freely used, modified, and distributed, but anyone who distributes modified versions must also make their source code available under the same GPL terms. This "share-alike" obligation is what distinguishes copyleft licenses from permissive licenses like [MIT](/2026/01/22/mit-license-guide/) or [Apache 2.0](/2026/01/07/apache-license-2-guide/).

The GPL family includes three major versions and two important variants:

- **GPL v2** (1991) — The version that popularized copyleft; still used by the Linux kernel
- **GPL v3** (2007) — Updated to address patents, tivoization, and international compatibility
- **LGPL** (Lesser GPL) — A weaker copyleft for libraries, allowing proprietary linking
- **AGPL** (Affero GPL) — Extends copyleft to software accessed over a network

## GPL v2 vs. GPL v3: Key Differences

Understanding the differences between GPL version 2 and version 3 matters because they have different implications for commercial use and distribution.

| Feature                      | GPL v2 (1991)                              | GPL v3 (2007)                                                      |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **Patent grant**             | Implicit (not explicit)                    | Explicit patent license from contributors                          |
| **Tivoization protection**   | No                                         | Yes — prevents hardware that blocks modified software from running |
| **Anti-DRM provisions**      | No                                         | Yes — modified GPL software cannot be locked down by DRM           |
| **License compatibility**    | Narrower                                   | Broader — compatible with Apache 2.0, for example                  |
| **Internationalization**     | US-centric language                        | Jurisdiction-neutral terminology                                   |
| **Installation information** | Not required                               | Required for "User Products" (consumer devices)                    |
| **Notable users**            | Linux kernel, Git, WordPress (v2 or later) | GCC, GNU Bash, Samba                                               |

GPL v2 includes a clause that allows licensees to use "version 2 or any later version," but this is optional — the copyright holder can specify "GPL v2 only." The Linux kernel, for instance, is licensed under "GPL v2 only" because Linus Torvalds chose not to adopt v3.

GPL v3 was designed to close perceived loopholes in v2. The anti-tivoization provisions were a direct response to devices (like TiVo) that used GPL software but locked the hardware to prevent users from running modified versions. The explicit patent grant protects users and developers from patent litigation by contributors.

## Understanding Copyleft

Copyleft is the legal mechanism that makes the GPL distinctive. While copyright restricts copying and modification by default, copyleft uses copyright law to ensure that freedoms are preserved. Under a copyleft license:

1. You can use, modify, and distribute the software freely
2. If you distribute the software (modified or unmodified), you must provide the source code
3. Your distribution must be under the same license terms
4. You cannot add restrictions beyond what the license specifies

This creates a "viral" effect: GPL code that enters a project tends to make the whole project (or at least the derivative portions) subject to the GPL. This is the characteristic that makes commercial adoption of GPL software more complex than permissive-licensed alternatives.

### What Counts as a Derivative Work?

This is the most debated question in GPL compliance. The GPL requires that "the work as a whole" be licensed under the GPL if it is based on GPL-licensed code. But what exactly constitutes a derivative work?

Generally accepted interpretations:

- **Modifying GPL source code and distributing it** — clearly a derivative work
- **Statically linking against a GPL library** — generally considered a derivative work
- **Dynamically linking against a GPL library** — debated; the FSF considers it a derivative work, others disagree
- **Using a GPL command-line tool in your build process** — generally not a derivative work (the tool's output is yours)
- **Using a GPL library as a separate process via IPC** — generally not a derivative work

The LGPL was created specifically to address the library linking question.

## The LGPL: Lesser GPL for Libraries

The GNU Lesser General Public License (LGPL) is a modified version of the GPL designed for software libraries. The LGPL allows proprietary software to link against LGPL-licensed libraries without the copyleft obligation applying to the proprietary code.

Under the LGPL:

- You can use the library in proprietary software without releasing your source code
- If you modify the LGPL library itself, those modifications must be released under the LGPL
- You must allow users to replace the LGPL library with modified versions (e.g., via dynamic linking)

Common LGPL-licensed projects include the GNU C Library (glibc), Qt (available under both LGPL and commercial licenses), and many Java libraries.

The LGPL is a pragmatic compromise: it keeps the library itself free while allowing commercial adoption that would be impractical under the full GPL.

## The AGPL: Closing the Network Loophole

The GNU Affero General Public License (AGPL) adds one significant provision to GPL v3: if you run modified AGPL software as a network service (such as a web application), you must make the modified source code available to users who interact with the software over the network.

Under the standard GPL, the copyleft obligation is triggered by _distribution_. Running software on a server and letting users access it via a browser is not distribution — the users never receive a copy of the software. The AGPL closes this gap by treating network interaction as equivalent to distribution for the purpose of source code availability.

AGPL is commonly used by companies that offer open source software as a service but want to prevent competitors from running modified versions without contributing back. Notable AGPL projects include MongoDB (before its switch to SSPL), Grafana, and Nextcloud.

## GPL and Commercial Use

A common misconception is that the GPL prohibits commercial use. It does not. The GPL explicitly allows commercial use, distribution, and even sale of GPL-licensed software. What it restricts is the ability to make the software proprietary.

### Can You Sell GPL Software?

Yes. You can sell copies of GPL software, charge for support, or sell services around GPL software. The FSF itself has always supported commercial free software. The key constraint is that buyers must receive the same freedoms: the source code and the right to modify and redistribute.

### Commercial Strategies with GPL Software

Organizations commonly take one of these approaches:

1. **Dual licensing** — Offer the software under both the GPL (for open source users) and a commercial license (for proprietary users who want to avoid copyleft obligations). MySQL, Qt, and many others use this model.
2. **Open core** — Release the core product under the GPL and sell proprietary extensions or enterprise features under a commercial license.
3. **Services and support** — Distribute the software under the GPL and monetize through consulting, support contracts, and managed hosting. Red Hat built a multi-billion dollar business on this model.
4. **SaaS delivery** — Run GPL software on your own servers without triggering the distribution clause (though this doesn't apply to AGPL software).

## GPL Compliance in Practice

GPL compliance requires careful attention to three areas: distribution, source code availability, and license notices.

### When You Distribute GPL Software

If you distribute GPL-licensed software (binary or source), you must:

1. Include a copy of the GPL license text
2. Include copyright notices and any warranty disclaimers
3. Provide the complete corresponding source code (or a written offer to provide it)
4. License the whole work under the GPL (for derivative works)

### Source Code Requirements

The source code you provide must be the "complete corresponding source" — everything needed to build the binary, including build scripts, interface definition files, and any shared libraries. For GPL v3, this extends to "Installation Information" for consumer products (the anti-tivoization clause).

### Common Compliance Failures

- Distributing binaries without source code or a valid written offer
- Failing to include the license text with distributed software
- Adding restrictions that the GPL does not permit (e.g., "no commercial use" clauses)
- Confusing GPL v2 and GPL v3 obligations in mixed-license codebases

## How SBOMs Track GPL License Compliance

A [Software Bill of Materials](/what-is-sbom/) plays a critical role in license compliance by documenting every component in your software along with its license. This is essential for GPL compliance because:

1. **Identifying GPL components.** SBOMs include license information for each component, making it straightforward to determine whether your project includes any GPL-licensed dependencies. The [CISA minimum elements draft](/compliance/cisa-minimum-elements/) now includes license as a recommended SBOM field.

2. **Tracking copyleft obligations.** When an SBOM shows a GPL-licensed component, your legal and engineering teams can assess whether the copyleft obligation applies to your distribution model. This is especially important for complex dependency trees with dozens or hundreds of transitive dependencies.

3. **Automating license audits.** Tools that process SBOMs can automatically flag components with copyleft licenses, allowing organizations to enforce license policies in their CI/CD pipeline. This is far more reliable than manual code review for license compliance.

4. **Supporting dual-license decisions.** When a component is available under both GPL and a commercial license, the SBOM documents which license applies to your specific use.

Both [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/) (which originated as a license documentation format) include standardized license fields. SPDX license expressions (e.g., `GPL-2.0-only`, `GPL-3.0-or-later`, `LGPL-2.1-or-later`) provide machine-readable license identifiers that make automated compliance checking possible.

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) automatically enriches SBOMs with license data from multiple sources (including its LicenseDB covering 28 Linux distro versions), making GPL identification reliable even for system-level packages. For language-specific instructions, see our [SBOM generation guides](/guides/).

## GPL License Comparison Table

| License        | Copyleft Strength | Commercial Use | Library Linking       | Network Use Trigger | Patent Grant |
| -------------- | ----------------- | -------------- | --------------------- | ------------------- | ------------ |
| **GPL v2**     | Strong            | Yes            | Copyleft applies      | No                  | Implicit     |
| **GPL v3**     | Strong            | Yes            | Copyleft applies      | No                  | Explicit     |
| **LGPL v2.1**  | Weak (library)    | Yes            | Allowed (proprietary) | No                  | Implicit     |
| **LGPL v3**    | Weak (library)    | Yes            | Allowed (proprietary) | No                  | Explicit     |
| **AGPL v3**    | Strong + network  | Yes            | Copyleft applies      | Yes                 | Explicit     |
| **MIT**        | None (permissive) | Yes            | No restrictions       | No                  | No           |
| **Apache 2.0** | None (permissive) | Yes            | No restrictions       | No                  | Explicit     |

For a broader overview of open source licenses, see our [guide to navigating the landscape of open source licenses](/2024/04/03/navigating-the-landscape-of-open-source-licenses/).

## Frequently Asked Questions

### What is the GPL license?

The GPL (GNU General Public License) is a copyleft free software license created by the Free Software Foundation. It guarantees that users can run, study, modify, and distribute the software, with the condition that any distributed derivative works must also be licensed under the GPL and include source code. It is the most widely used copyleft license in open source software.

### Can I use GPL software in commercial products?

Yes. The GPL explicitly permits commercial use, distribution, and sale. The restriction is not on commerce but on making the software proprietary. If you distribute a product that includes GPL code, you must make the complete source code available under the GPL. Common commercial strategies include dual licensing, open core models, and selling services around GPL software.

### What is the difference between GPL and LGPL?

The GPL requires that any derivative work be distributed under the GPL (strong copyleft). The LGPL (Lesser GPL) allows proprietary software to link against LGPL-licensed libraries without the copyleft applying to the proprietary code. If you modify the LGPL library itself, those modifications must be shared, but your application code that uses the library can remain proprietary.

### What is the difference between GPL v2 and GPL v3?

GPL v3 (2007) added explicit patent grants, anti-tivoization provisions (preventing hardware lockdown of modified software), anti-DRM clauses, broader international compatibility, and better compatibility with other open source licenses like Apache 2.0. GPL v2 (1991) remains widely used, notably by the Linux kernel, which is licensed under "GPL v2 only."

### How do SBOMs help with GPL compliance?

SBOMs document every component in your software along with its license, making it possible to automatically identify GPL-licensed dependencies, track copyleft obligations, and enforce license policies in CI/CD pipelines. Both CycloneDX and SPDX include standardized license fields that support machine-readable GPL license identification using SPDX license expressions like `GPL-2.0-only` or `GPL-3.0-or-later`.
