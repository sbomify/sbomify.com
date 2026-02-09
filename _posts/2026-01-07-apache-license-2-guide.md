---
layout: post
title: "Apache License 2.0: What It Is, How It Works, and What It Means for Your Software"
description: "Understand the Apache License 2.0, its patent grant, attribution requirements, NOTICE file, compatibility with GPL, and how SBOMs track compliance."
category: education
tags: [apache, licensing, open-source, compliance]
tldr: "The Apache License 2.0 is a permissive open source license that includes an explicit patent grant and requires attribution through NOTICE files. It is compatible with most other licenses, and SBOMs help ensure your projects track Apache-licensed components and their attribution requirements."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the Apache License 2.0?"
    answer: "The Apache License 2.0 is a permissive open source license published by the Apache Software Foundation. It allows free use, modification, distribution, and sublicensing of the software, including in proprietary products. Its key features are an explicit patent grant protecting users from contributor patent claims and a NOTICE file mechanism for managing attribution."
  - question: "Can I use Apache 2.0 licensed software in commercial products?"
    answer: "Yes. The Apache License 2.0 explicitly permits commercial use, including incorporating Apache-licensed code into proprietary, closed-source products. The only requirements are including the Apache license text, retaining attribution notices, including the NOTICE file if one exists, and noting any modifications to original files."
  - question: "What is the difference between Apache 2.0 and MIT?"
    answer: "Both are permissive licenses that allow commercial use without requiring source code disclosure. The key differences are that Apache 2.0 includes an explicit patent grant and patent retaliation clause while MIT does not address patents, Apache 2.0 requires carrying forward NOTICE file attributions while MIT only requires including the license text, and Apache 2.0 requires stating changes to modified files."
  - question: "Is Apache 2.0 compatible with the GPL?"
    answer: "Apache 2.0 is compatible with GPL v3 but not with GPL v2. Apache 2.0 code can be included in a GPLv3 project where the combined work is licensed under GPLv3, but the Apache 2.0 patent termination clause is considered an additional restriction under GPLv2, making the two licenses incompatible."
  - question: "What is the NOTICE file in the Apache License?"
    answer: "The NOTICE file is a text file that Apache-licensed projects use to collect attribution notices, containing the project name, copyright notices, and any third-party attributions required by dependencies. When you redistribute Apache-licensed software, you must include the contents of the NOTICE file with your distribution."

---

The Apache License 2.0 is a permissive open source license published by the [Apache Software Foundation](https://www.apache.org/) (ASF) that allows users to freely use, modify, distribute, and sublicense software with minimal restrictions. Its defining features are an explicit patent grant that protects users from patent litigation by contributors, and straightforward attribution requirements through the NOTICE file mechanism. The Apache License 2.0 is one of the most popular open source licenses in the world, used by projects including Apache HTTP Server, Kubernetes, Android (AOSP), TensorFlow, and thousands of others.

## What Is the Apache License 2.0?

The Apache License 2.0 (formally, the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)) is a permissive free software license written by the Apache Software Foundation and released in January 2004. "Permissive" means that the license imposes minimal restrictions on how the software can be used, modified, and redistributed — including in proprietary, closed-source products.

The Apache License 2.0 replaced the earlier Apache License 1.1 and 1.0, which had more restrictive advertising clauses similar to the original BSD license. Version 2.0 was designed to be clear, comprehensive, and compatible with a broad range of other open source licenses.

The license is identified in the [SPDX License List](https://spdx.org/licenses/) as `Apache-2.0`.

## Key Provisions

### Permissions Granted

The Apache License 2.0 grants the following rights, in both copyright and patent terms:

- **Use** — Run the software for any purpose, including commercial use
- **Modify** — Create derivative works based on the software
- **Distribute** — Distribute copies of the original or modified software
- **Sublicense** — Grant these same rights to others
- **Patent use** — Use any patents held by contributors that cover their contributions

### Conditions

The license requires:

1. **Attribution.** You must include a copy of the Apache License 2.0 in any distribution and retain all copyright, patent, trademark, and attribution notices from the original source.

2. **NOTICE file.** If the original work includes a NOTICE file (a text file containing attribution notices required by the license), you must include a readable copy of the NOTICE file in your distribution. You may add your own attribution notices to the NOTICE file, but you may not remove existing ones.

3. **State changes.** If you modify the software, you must include a prominent notice stating that you changed the files.

### What Is NOT Required

Unlike copyleft licenses such as the [GPL]({{ site.url }}/2025/12/22/gpl-license-guide/), the Apache License 2.0 does **not** require:

- Distributing your source code (you can distribute binaries only)
- Licensing your derivative works under the Apache License
- Making your modifications open source

This is what makes it "permissive" — you can incorporate Apache-licensed code into proprietary software without triggering any obligation to open-source your own code.

## The Patent Grant

The Apache License 2.0's explicit patent grant is one of its most important features and a key reason organizations choose it over other permissive licenses like MIT or BSD.

Section 3 of the license states that each contributor grants "a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable ... patent license" covering the contributor's contributions. This means:

- If a contributor holds patents that cover their code contribution, they are granting you a license to those patents for the purpose of using, making, and selling the software.
- This protection applies to all users and redistributors of the software.
- The patent grant is automatically revoked for any user who initiates patent litigation against the project (the "patent retaliation" clause in Section 3).

Neither the [MIT license]({{ site.url }}/2026/01/22/mit-license-guide/) nor the BSD licenses include an explicit patent grant, which creates theoretical patent risk — a contributor could contribute code and later assert patent claims against users. The Apache License 2.0 eliminates this risk.

## The NOTICE File

The NOTICE file is a mechanism unique to the Apache License 2.0 for managing attribution requirements. The Apache Software Foundation [requires](https://www.apache.org/legal/src-headers.html) all ASF projects to include a NOTICE file containing:

- The project name and a brief description
- Copyright notices from all contributors
- Any third-party attribution notices required by dependencies

When you redistribute Apache-licensed software, you must include the contents of the NOTICE file in at least one of:

- A NOTICE file included with your distribution
- Documentation provided alongside the distribution
- A display generated by your software (if it has a user-facing display)

The NOTICE file is a common source of compliance failures. Organizations that use Apache-licensed components must ensure they carry forward all required attributions, especially when bundling multiple Apache-licensed libraries.

## License Compatibility

License compatibility determines whether code from different licenses can be combined in a single work. The Apache License 2.0 has broad compatibility with other open source licenses, but there are notable interactions.

| License                      | Compatible with Apache 2.0? | Notes                                                                              |
| ---------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| **MIT**                      | Yes                         | MIT code can be included in Apache-licensed projects and vice versa                |
| **BSD (2-clause, 3-clause)** | Yes                         | Similar permissive terms; no conflict                                              |
| **GPL v3**                   | Yes (one direction)         | Apache 2.0 code can be included in GPLv3 projects; the combined work is GPLv3      |
| **GPL v2**                   | No                          | The Apache 2.0 patent clause is considered an "additional restriction" under GPLv2 |
| **LGPL v3**                  | Yes (one direction)         | Similar to GPLv3 compatibility                                                     |
| **MPL 2.0**                  | Yes                         | MPL 2.0 was explicitly designed for compatibility                                  |
| **AGPL v3**                  | Yes (one direction)         | Apache 2.0 code can be included in AGPLv3 projects                                 |

The GPLv2 incompatibility is historically significant. It means you cannot combine Apache 2.0 code with GPLv2-only code (like the Linux kernel) in a single work. This was one of the issues addressed when GPLv3 was designed to be compatible with Apache 2.0.

## Apache License 2.0 vs. MIT vs. GPL

These are the three most commonly encountered open source licenses. Understanding their differences is essential for license compliance.

| Feature                      | Apache 2.0        | MIT                | GPL v3                      |
| ---------------------------- | ----------------- | ------------------ | --------------------------- |
| **License type**             | Permissive        | Permissive         | Copyleft                    |
| **Patent grant**             | Explicit          | None               | Explicit                    |
| **Source code required**     | No                | No                 | Yes (for distributed works) |
| **Derivative works license** | Any license       | Any license        | Must be GPL                 |
| **Attribution required**     | Yes (NOTICE file) | Yes (license text) | Yes (license text + source) |
| **Commercial use**           | Yes               | Yes                | Yes                         |
| **SPDX identifier**          | `Apache-2.0`      | `MIT`              | `GPL-3.0-only`              |

For organizations that want permissive licensing with patent protection, Apache 2.0 is the standard choice. For projects that prioritize simplicity and brevity, MIT is often preferred. For projects that want to ensure all derivatives remain open source, GPL is the appropriate choice.

For a broader overview of open source licenses, see our [guide to navigating the landscape of open source licenses]({{ site.url }}/2024/04/03/navigating-the-landscape-of-open-source-licenses/).

## How SBOMs Track Apache License Compliance

A [Software Bill of Materials]({{ site.url }}/what-is-sbom/) documents every component in your software along with its license. For Apache-licensed components, SBOMs support compliance in several ways:

1. **Identifying Apache-licensed dependencies.** SBOMs include license information for each component, making it straightforward to identify all Apache 2.0 dependencies in your project. The SPDX identifier `Apache-2.0` provides machine-readable identification.

2. **NOTICE file tracking.** By identifying which components are Apache-licensed, SBOMs help teams ensure they are carrying forward all required NOTICE file attributions.

3. **Compatibility checking.** Automated license compliance tools can process SBOMs to detect potential compatibility conflicts — for example, flagging if Apache 2.0 and GPLv2-only components coexist in the same project.

4. **Audit trail.** SBOMs provide the evidence that organizations need for license audits and due diligence in M&A transactions, documenting exactly which licenses are present in a software product.

Both [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/) support standardized license fields. The [CISA minimum elements draft]({{ site.url }}/compliance/cisa-minimum-elements/) includes license as a recommended SBOM field, recognizing that license information is increasingly expected in SBOMs.

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) automatically enriches SBOMs with license data from multiple sources, making it straightforward to identify all Apache-licensed components in your dependency tree. For language-specific instructions, see our [SBOM generation guides]({{ site.url }}/guides/).

## Frequently Asked Questions

### What is the Apache License 2.0?

The Apache License 2.0 is a permissive open source license published by the Apache Software Foundation. It allows free use, modification, distribution, and sublicensing of the software, including in proprietary products. Its key features are an explicit patent grant protecting users from contributor patent claims, and a NOTICE file mechanism for managing attribution requirements.

### Can I use Apache 2.0 licensed software in commercial products?

Yes. The Apache License 2.0 explicitly permits commercial use, including incorporating Apache-licensed code into proprietary, closed-source products. The only requirements are that you include the Apache license text, retain attribution notices, include the NOTICE file if one exists, and note any modifications you made to the original files.

### What is the difference between Apache 2.0 and MIT?

Both are permissive licenses that allow commercial use without requiring source code disclosure. The key differences are: Apache 2.0 includes an explicit patent grant and patent retaliation clause, while MIT does not address patents; Apache 2.0 requires carrying forward NOTICE file attributions, while MIT only requires including the license text; and Apache 2.0 requires stating changes to modified files, while MIT does not.

### Is Apache 2.0 compatible with the GPL?

Apache 2.0 is compatible with GPL v3 but NOT with GPL v2. Apache 2.0 code can be included in a GPLv3 project (the combined work is licensed under GPLv3), but the Apache 2.0 patent termination clause is considered an "additional restriction" under GPLv2, making the two licenses incompatible. This distinction matters for projects like the Linux kernel, which is GPLv2-only.

### What is the NOTICE file in the Apache License?

The NOTICE file is a text file that Apache-licensed projects use to collect attribution notices. It contains the project name, copyright notices, and any third-party attributions required by dependencies. When you redistribute Apache-licensed software, you must include the contents of the NOTICE file with your distribution. Failure to carry forward NOTICE attributions is a common compliance oversight.
