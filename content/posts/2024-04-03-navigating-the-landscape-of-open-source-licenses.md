---

title: "Navigating the Landscape of Open Source Licenses"
description: "Comprehensive guide to open source licenses including MIT, Apache 2.0, GPL, BSD, MPL, and more. Learn the differences between permissive and copyleft licenses and how SBOMs help with license compliance."
categories:
  - education
tags: [open-source, licenses, compliance, mit-license, gpl, apache-license, sbom]
tldr: "Open source licenses fall into three categories: permissive (MIT, Apache, BSD) that allow nearly unrestricted use, strong copyleft (GPL, AGPL) that require derivative works to use the same license, and weak copyleft (LGPL, MPL) that strike a middle ground. Understanding these categories is essential for license compliance — and SBOMs make tracking license obligations across your dependency tree automatic."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the most permissive open source license?"
    answer: "The MIT License and BSD 2-Clause License are considered the most permissive open source licenses. They allow virtually unrestricted use, modification, and distribution — including in proprietary commercial software — with only the requirement to include the original copyright notice. The Apache License 2.0 is similarly permissive but adds an explicit patent grant."
  - question: "Can I use GPL-licensed software in commercial products?"
    answer: "Yes, but with significant restrictions. The GPL requires that any derivative work also be distributed under the GPL, meaning you must release your source code. This makes it challenging for proprietary software. The LGPL offers a compromise — you can link to LGPL libraries from proprietary code without triggering the copyleft requirement, as long as you don't modify the library itself."
  - question: "What license should I choose for my open source project?"
    answer: "It depends on your goals. If you want maximum adoption, choose MIT or Apache 2.0. If you want to ensure improvements stay open source, choose GPL or AGPL. If you want a middle ground that keeps your library open source but allows proprietary use, choose LGPL or MPL 2.0. Apache 2.0 is often recommended for projects that want permissiveness plus patent protection."
  - question: "How do SBOMs help with license compliance?"
    answer: "An SBOM lists every component in your software along with its license. This makes it possible to automatically scan for license conflicts, copyleft obligations, and restricted licenses across your entire dependency tree — including transitive dependencies you may not know about. Tools like sbomify enrich SBOMs with license data from multiple sources, giving you a complete compliance picture."
  - question: "What is the difference between permissive and copyleft licenses?"
    answer: "Permissive licenses (MIT, Apache, BSD) allow you to use, modify, and redistribute the code with minimal restrictions — you can even include it in proprietary software. Copyleft licenses (GPL, AGPL) require that derivative works be distributed under the same license, ensuring the code and its modifications remain open source. Weak copyleft licenses (LGPL, MPL) apply this requirement only to the licensed component itself, not to the larger work it's combined with."
date: 2024-04-03
slug: navigating-the-landscape-of-open-source-licenses
---

Open source software forms the backbone of modern applications, from the smallest utilities to the infrastructure running the largest data centers. Studies consistently show that 70-90% of a typical application consists of open source components. The licenses under which this software is released determine how it can be used, integrated, and distributed — and getting license compliance wrong can have serious legal and business consequences.

This guide covers the most important open source licenses, organized by category, with practical guidance on commercial compatibility. If you're building software that incorporates open source dependencies — and you almost certainly are — understanding these licenses is essential.

## Why Licenses Matter for Software Supply Chain Security

License compliance is a supply chain concern. When your application depends on hundreds of open source packages, each with its own license, manually tracking obligations becomes impossible. A single copyleft dependency buried three levels deep in your dependency tree can create unexpected obligations for your entire application.

This is where [Software Bills of Materials](/what-is-sbom/) become critical. An SBOM lists every component in your software along with its license, making automated compliance checking possible. Tools like [sbomify](https://sbomify.com) enrich SBOMs with license data from multiple sources, automatically flagging conflicts and compliance risks before they become legal problems.

## Permissive Licenses

Permissive licenses impose minimal restrictions on how software can be used, modified, and redistributed. They are the most commercially friendly category and are widely used in both open source and proprietary software.

### MIT License

One of the most popular open source licenses. It allows almost unrestricted freedom to use, modify, and distribute the licensed software, provided that the original license and copyright notice are included with any substantial portions of the software.

**Commercial compatibility:** Highly compatible. Its permissiveness makes it favorable for commercial use without imposing significant legal constraints. For a deep dive, see our [MIT License guide](/2026/01/22/mit-license-guide/).

### Apache License 2.0

Similar to the MIT License in its permissiveness, the Apache License also provides an express grant of patent rights from contributors to users. It allows for commercial use, modification, and distribution of the licensed software.

**Commercial compatibility:** Generally considered commercially friendly. It requires explicit attribution and provides an explicit grant of patent rights, reducing legal risks for commercial applications. See our [Apache License 2.0 guide](/2026/01/07/apache-license-2-guide/) for details.

### BSD Licenses (2-Clause and 3-Clause)

The BSD licenses are permissive, similar to the MIT License. The 2-clause license is very straightforward, allowing for almost unrestricted use, while the 3-clause license adds a non-endorsement clause, preventing the use of the licensor's name to promote derived products without permission.

**Commercial compatibility:** Both are considered commercially friendly due to their permissiveness and minimal requirements.

### Zlib/libpng License

A very permissive license for software libraries that allows modification, distribution, and use in proprietary applications, provided that credit is given to the author.

**Commercial compatibility:** Highly compatible with commercial projects due to its minimal restrictions.

## Strong Copyleft Licenses

Copyleft licenses require that derivative works be distributed under the same license terms. This ensures that modifications and extensions remain open source, but creates challenges for proprietary software that incorporates copyleft-licensed code.

### GNU General Public License (GPL) Versions 2 and 3

The GPL is the most widely known copyleft license. Any derivative work must be distributed under the same license terms. GPLv3 introduced terms intended to protect against patent aggression and to prevent tivoization (the practice of designing hardware to prevent modifications to the software it runs).

**Commercial compatibility:** GPLv3 is often considered commercially challenging because it requires that derivative works be open-sourced under the same license, potentially exposing proprietary code. GPLv2 is seen as slightly more lenient, though still restrictive for proprietary use. For a comprehensive analysis, see our [GPL License guide](/2025/12/22/gpl-license-guide/).

### GNU Affero General Public License (AGPLv3)

Similar to GPLv3, but with an additional requirement: if you run a modified program on a server and let other users communicate with it, you must release the modified source code to those users. This closes the "application service provider" loophole in GPLv3 — a critical consideration for SaaS applications.

**Commercial compatibility:** The most restrictive of the major open source licenses for commercial use, especially for software offered as a service.

## Weak Copyleft Licenses

Weak copyleft licenses strike a middle ground: modifications to the licensed code itself must be shared, but the licensed code can be combined with proprietary software without triggering copyleft obligations on the larger work.

### GNU Lesser General Public License (LGPL)

A compromise between the strong copyleft of the GPL and permissive licenses. It allows linking to LGPL libraries in proprietary software without requiring that the proprietary software's source code be released — as long as the LGPL library itself is not modified.

**Commercial compatibility:** More commercially friendly than GPL, especially for proprietary software that uses open source libraries without modifying them.

### Mozilla Public License 2.0 (MPL 2.0)

A file-level copyleft license that requires modifications to MPL-licensed files to be open-sourced, but allows those files to be combined with proprietary code into a larger work without open-sourcing the proprietary components.

**Commercial compatibility:** Commercially friendly for projects that want to ensure improvements to open source code are shared while allowing commercial application development.

### Eclipse Public License (EPL)

Similar to the MPL, the EPL requires that modifications to EPL-licensed code be made available under the EPL, but allows proprietary applications to link to EPL-licensed libraries without open-sourcing the proprietary code.

**Commercial compatibility:** Generally considered commercially friendly, especially for developers using open source libraries within proprietary applications.

## Special-Purpose and Dual Licenses

### Creative Commons Licenses

Creative Commons licenses are not typically used for software but for creative works such as documentation, images, and videos. They range from the most permissive (CC0, essentially public domain) to restrictive forms (CC BY-NC-ND, which prohibits commercial use and derivative works).

**Commercial compatibility:** Varies widely. CC0 is fully compatible with commercial use. Restrictive variants like CC BY-NC-ND are unsuitable for commercial projects.

### European Union Public License (EUPL)

A strong copyleft license approved by the European Commission. It is compatible with several other licenses including the GPL, allowing integration of EUPL-licensed code with code under those licenses.

**Commercial compatibility:** The copyleft nature makes it less commercially friendly for proprietary software, similar to the GPL. However, its cross-license compatibility offers flexibility for open source projects.

### Artistic License 2.0

Originally designed for the Perl programming language, this license allows modified versions of the software to be distributed under a different license or as closed source, provided that certain conditions are met.

**Commercial compatibility:** Generally considered commercially friendly, offering flexibility to distribute proprietary versions alongside open source ones.

### Dual Licensing (Redis, MySQL)

Some projects use dual licensing: an open source license for community use and a commercial license for proprietary use. Redis uses the BSD license for its core but the Redis Source Available License (RSAL) for certain modules. MySQL is available under the GPL for open source use or a commercial license from Oracle for proprietary use.

**Commercial compatibility:** The open source license applies the usual restrictions (BSD for Redis core, GPL for MySQL), while the commercial license removes those restrictions for a fee.

## License Compliance in Practice

Tracking license obligations manually is impractical for modern software with hundreds or thousands of dependencies. Automated tools and processes are essential:

1. **Generate SBOMs in CI/CD** — Use the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) or similar tools to produce an SBOM at every build. The SBOM captures every component and its license.

2. **Enrich with license data** — sbomify enriches SBOMs with license information from multiple sources, resolving ambiguous or missing license declarations.

3. **Automate policy checks** — Define your organization's license policy (e.g., "no AGPL in production services") and automatically flag violations.

4. **Monitor continuously** — License declarations can change between package versions. Continuous monitoring ensures you catch changes when dependencies are updated.

For teams getting started with SBOM-based compliance, the [sbomify zero-to-hero guide](/zero-to-hero/) walks through the complete setup.

## Conclusion

The landscape of open source licenses is broad and varied, but understanding the three main categories — permissive, strong copyleft, and weak copyleft — covers the vast majority of what you'll encounter. The key is not just understanding individual licenses but having automated systems to track compliance across your entire dependency tree. SBOMs provide that foundation, and tools like sbomify make the process manageable at scale.

**This is not legal advice. Please consult a legal professional before making commercial decisions around licensing.**
