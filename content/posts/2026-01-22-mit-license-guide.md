---

title: "The MIT License: A Complete Guide for Developers"
description: "Understand the MIT License — what it permits, what it requires, how it compares to BSD and Apache 2.0, and how SBOMs help track MIT license compliance."
categories:
  - education
tags: [mit, licensing, open-source, compliance]
tldr: "The MIT License is the most popular open source license, allowing virtually unrestricted use, modification, and distribution with only an attribution requirement. SBOMs track MIT-licensed components across your dependency tree, ensuring attribution obligations are met at scale."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the MIT License?"
    answer: "The MIT License is a permissive open source license that allows unrestricted use, modification, distribution, and sublicensing of software, including in proprietary and commercial products. Its only requirement is that the license text and copyright notice be included with any distribution."
  - question: "Can I use MIT-licensed software commercially?"
    answer: "Yes. The MIT License explicitly permits commercial use, including selling copies, incorporating MIT-licensed code into proprietary products, and distributing modified versions. The only requirement is including the MIT license text and copyright notice with your distribution."
  - question: "What is the difference between MIT and Apache 2.0?"
    answer: "Both are permissive licenses allowing commercial use without requiring source code disclosure. Apache 2.0 includes an explicit patent grant and patent retaliation clause while MIT does not address patents explicitly. Apache 2.0 also requires carrying forward NOTICE file attributions and noting changes to modified files, while MIT only requires including the license text."
  - question: "Is the MIT License compatible with the GPL?"
    answer: "Yes, but only in one direction. MIT-licensed code can be included in GPL-licensed projects, with the combined work distributed under the GPL. However, GPL-licensed code cannot be included in an MIT-licensed project without the entire project becoming GPL-licensed."
  - question: "Do I need to include the MIT License text when distributing software?"
    answer: "Yes. The MIT License requires that the copyright notice and permission notice be included in all copies or substantial portions of the Software. This applies to both source and binary distributions, typically via a LICENSE file or third-party attribution document."
  - question: "How do I comply with the MIT License?"
    answer: "Include the full MIT license text including the copyright notice in your distribution. This is typically done by maintaining a LICENSE or THIRD-PARTY-NOTICES file that aggregates the license texts of all open source dependencies. For applications with many MIT-licensed dependencies, automated tools that generate attribution documents from SBOMs are the most reliable approach."
date: 2026-01-22
slug: mit-license-guide
---

The MIT License is a permissive open source license that allows virtually unrestricted use, modification, distribution, and sublicensing of software, including use in proprietary and commercial products. Its only substantive requirement is that the license text and copyright notice must be included with any substantial distribution of the software. The MIT License is the most widely used open source license in the world — GitHub's data consistently shows it as the most popular license choice across its platform.

## What Is the MIT License?

The MIT License (formally, the "MIT License" as listed in the [SPDX License List](https://spdx.org/licenses/) with identifier `MIT`) is a permissive free software license originating at the Massachusetts Institute of Technology. It is sometimes referred to as the "Expat License" to distinguish it from other licenses historically associated with MIT.

The full text of the MIT License is remarkably short — approximately 170 words:

> Copyright (c) \<year\> \<copyright holder\>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This brevity is intentional. The MIT License prioritizes simplicity and clarity, making it easy for developers and organizations to understand exactly what is permitted and what is required.

## What the MIT License Permits

The MIT License grants the following rights without restriction:

- **Use** — Run the software for any purpose, including commercial use
- **Copy** — Make copies of the software
- **Modify** — Create derivative works based on the software
- **Merge** — Combine the software with other software
- **Publish** — Make the software publicly available
- **Distribute** — Share copies with others
- **Sublicense** — Grant these same rights to third parties
- **Sell** — Sell copies of the software, including modified versions

The phrase "deal in the Software without restriction" is deliberately broad. There are no limitations on field of use, no requirements to share source code, and no requirements to license derivative works under the MIT License.

## What the MIT License Requires

The MIT License has exactly one condition: **the copyright notice and permission notice must be included in all copies or substantial portions of the Software.**

In practice, this means:

- If you distribute MIT-licensed code (in source or binary form), include the MIT license text and the original copyright notice
- If you modify the code and redistribute it, the same requirement applies
- If you include MIT-licensed code as part of a larger work, the license text must be present somewhere in the distribution (typically in a LICENSE file, NOTICES file, or third-party attribution document)

There is no requirement to:

- Make your source code available
- License your derivative works under MIT
- Notify the original author of your use
- Display attribution in a user interface

## MIT License vs. Other Permissive Licenses

The MIT License is one of several permissive licenses. Understanding the differences matters for license compliance, particularly in projects that combine code from multiple licenses.

### MIT vs. BSD (2-Clause and 3-Clause)

The BSD 2-Clause License ("Simplified BSD") is functionally equivalent to the MIT License — both require attribution and disclaim warranties, with no other conditions. The wording differs, but the legal effect is the same.

The BSD 3-Clause License adds a "non-endorsement" clause: you may not use the name of the copyright holder or contributors to endorse or promote derived products without permission. The MIT License has no such clause.

| Feature                    | MIT           | BSD 2-Clause   | BSD 3-Clause   |
| -------------------------- | ------------- | -------------- | -------------- |
| **Attribution required**   | Yes           | Yes            | Yes            |
| **Non-endorsement clause** | No            | No             | Yes            |
| **Patent grant**           | No (implicit) | No (implicit)  | No (implicit)  |
| **SPDX identifier**        | `MIT`         | `BSD-2-Clause` | `BSD-3-Clause` |

### MIT vs. Apache 2.0

The [Apache License 2.0](/2026/01/07/apache-license-2-guide/) is also permissive but includes two significant additions that the MIT License lacks:

1. **Explicit patent grant.** Apache 2.0 Section 3 grants users a patent license covering the contributor's contributions. The MIT License makes no mention of patents. While the broad language of the MIT License ("deal in the Software without restriction") may imply a patent license in some jurisdictions, this is not settled law.

2. **NOTICE file requirement.** Apache 2.0 requires that any redistribution carry forward the contents of a NOTICE file if one exists. The MIT License has no equivalent mechanism.

3. **State changes requirement.** Apache 2.0 requires that modified files carry a prominent notice stating the changes. MIT has no such requirement.

For a detailed comparison including GPL, see our [Apache License 2.0 guide](/2026/01/07/apache-license-2-guide/).

### MIT vs. ISC License

The ISC License is a simplified rewrite of the MIT License. It removes the explicit enumeration of rights ("use, copy, modify...") in favor of a single clause: "Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted." The legal effect is generally considered identical to MIT. The ISC License is used by OpenBSD and many npm packages.

## MIT License and Copyleft (GPL)

The MIT License is compatible with copyleft licenses like the [GPL](/2025/12/22/gpl-license-guide/) — but only in one direction. MIT-licensed code can be included in a GPL-licensed project. The combined work is then licensed under the GPL. However, GPL-licensed code cannot be included in an MIT-licensed project, because the GPL requires that the entire combined work be distributed under the GPL.

| Combination                        | Result                                  | Permitted?             |
| ---------------------------------- | --------------------------------------- | ---------------------- |
| MIT code included in GPLv2 project | Combined work is GPLv2                  | Yes                    |
| MIT code included in GPLv3 project | Combined work is GPLv3                  | Yes                    |
| GPL code included in MIT project   | Would require MIT project to become GPL | No (unless relicensed) |
| MIT code included in AGPL project  | Combined work is AGPL                   | Yes                    |

This compatibility makes MIT one of the most versatile licenses for code reuse. MIT-licensed libraries can be used in virtually any project, regardless of the project's own license.

## MIT License in Commercial Software

The MIT License is one of the most commercially friendly open source licenses. Organizations commonly use MIT-licensed code in proprietary products because:

- **No source disclosure.** You are not required to share your source code, even if you modify the MIT-licensed component.
- **No license propagation.** Your proprietary code does not need to be licensed under MIT.
- **Minimal compliance burden.** Including the license text in your distribution (typically in a NOTICES or THIRD-PARTY file) satisfies the only condition.
- **No patent risk (with caveats).** While the MIT License does not include an explicit patent grant, its broad permission language is generally interpreted as an implied license. For maximum patent protection, consider [Apache 2.0](/2026/01/07/apache-license-2-guide/) instead.

The primary compliance risk with MIT is not the license itself but the volume. A typical web application may depend on hundreds of MIT-licensed packages. Each one requires its license text and copyright notice to be included in the distribution. Automated tooling — particularly SBOM-based compliance checking — is essential at this scale.

## How SBOMs Track MIT License Compliance

A [Software Bill of Materials](/what-is-sbom/) documents every component in your software along with its license. For MIT-licensed components, SBOMs support compliance in several ways:

1. **Identifying MIT dependencies.** SBOMs include license information for each component, using the SPDX identifier `MIT` for machine-readable identification. This makes it straightforward to enumerate all MIT-licensed components in a project.

2. **Attribution aggregation.** With hundreds of MIT-licensed dependencies, manually collecting license texts is impractical. SBOMs provide the component list from which attribution documents (NOTICES files, THIRD-PARTY files) can be generated automatically.

3. **License compatibility checking.** SBOM-based compliance tools can detect potential issues — for example, flagging if MIT code is being redistributed without the required license text, or identifying MIT/GPL combinations that require the combined work to be GPL-licensed.

4. **Audit evidence.** SBOMs provide the documentation needed for license audits, M&A due diligence, and procurement assessments.

Both [CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/) support standardized license fields. The [sbomify GitHub Action](https://github.com/sbomify/github-action/) automatically enriches SBOMs with license data from multiple sources, making it practical to track MIT attribution requirements across hundreds of dependencies. For language-specific instructions, see our [SBOM generation guides](/guides/).

For a broader overview of open source licenses, see our [guide to navigating the landscape of open source licenses](/2024/04/03/navigating-the-landscape-of-open-source-licenses/).

## Frequently Asked Questions

### What is the MIT License?

The MIT License is a permissive open source license that allows unrestricted use, modification, distribution, and sublicensing of software, including in proprietary and commercial products. Its only requirement is that the license text and copyright notice be included with any distribution. It is the most widely used open source license, identified in the SPDX License List as `MIT`.

### Can I use MIT-licensed software commercially?

Yes. The MIT License explicitly permits commercial use, including selling copies, incorporating MIT-licensed code into proprietary products, and distributing modified versions. The only requirement is that you include the MIT license text and copyright notice with your distribution.

### What is the difference between MIT and Apache 2.0?

Both are permissive licenses that allow commercial use without requiring source code disclosure. The key differences are: Apache 2.0 includes an explicit patent grant and patent retaliation clause, while MIT does not address patents explicitly; Apache 2.0 requires carrying forward NOTICE file attributions, while MIT only requires including the license text; and Apache 2.0 requires noting changes to modified files, while MIT does not. For projects where patent protection is important, Apache 2.0 provides stronger guarantees.

### Is the MIT License compatible with the GPL?

Yes, but only in one direction. MIT-licensed code can be included in GPL-licensed projects — the combined work is then distributed under the GPL. However, GPL-licensed code cannot be included in an MIT-licensed project without the entire project becoming GPL-licensed. This one-directional compatibility is a feature of the GPL's copyleft requirement, not a restriction in the MIT License.

### Do I need to include the MIT License text when distributing software?

Yes. The MIT License requires that "the above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software." In practice, this means including the license text in a LICENSE file, NOTICES file, or third-party attribution document shipped with your distribution. This applies to both source and binary distributions.

### How do I comply with the MIT License?

Include the full MIT license text (including the copyright notice) in your distribution. This is typically done by maintaining a LICENSE or THIRD-PARTY-NOTICES file that aggregates the license texts of all open source dependencies. For applications with many MIT-licensed dependencies, automated tools that generate attribution documents from SBOMs are the most reliable approach.
