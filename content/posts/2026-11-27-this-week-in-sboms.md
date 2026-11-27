---

title: "This Week in SBOMs: Hex.pm Breached, CI/CD Becomes the Front Door, and Germany's CRA Act Becomes Law"
description: "SBOM news for 21 to 27 November 2026: an unauthenticated RCE in the Hex.pm package registry, GitHub and CI/CD breaches at 1Password, Todoist and Defang, PolinRider in open-source pull requests, Ghostscript Upload2Shell and NFS2ROOT, 15 KEV additions, Germany's CRA implementation act in the Bundesgesetzblatt, the FCC keeping SBOM disclosure on the Cyber Trust Mark label, MAS asking for cryptographic inventories, a stricter SPDX NTIA conformance checker, and new sbomify FAQ entries on linked releases, advisory IDs and VEX."
keywords: "This Week in SBOMs, SBOM news, Hex.pm, CVE-2026-129514, 1Password, Todoist, Defang, SAP, PolinRider, CI/CD compromise, Ghostscript, Upload2Shell, CVE-2026-125396, NFS2ROOT, CVE-2026-99362, GPGME, CVE-2026-129975, zstd, libexpat, OpenSSL 4.1.1, CISA KEV, Drupal, Xen Orchestra, Eclypsium bundled components, BGBl. 2026 I Nr. 355, German CRA act, ENISA SRP, NIS2, FCC Cyber Trust Mark, HBOM, MAS quantum-safe, cryptographic inventory, CBOM, Cyber Security and Resilience Bill, NTIA conformance checker 6.1.0, CycloneDX 2.0, PURL directory, ECMA-427, VERS, SPDX 3.1, VEX, sbomify FAQ"
categories:
  - news
tags: [sbom, this-week-in-sboms, supply-chain, hex, elixir, ci-cd, github, ghostscript, linux, kev, cra, nis2, bsi, fcc, cbom, pqc, vex, spdx, cyclonedx, purl, vers]
tldr: "The Hex.pm package registry was taken over through an unauthenticated RCE (CVE-2026-129514). Hex found no modified packages, but its registry signing key has not been rotated yet, so it says to fetch only from repo.hex.pm. The same week, 1Password, Todoist and Defang disclosed breaches that ran through GitHub accounts or CI workflows, and PolinRider force-pushed a loader into open-source pull requests, where it ran in at least one release workflow. A report covered by BleepingComputer found that 33 of 38 appliance advisories fixing exploited flaws were for bundled components. Germany's CRA implementation act was published in the Bundesgesetzblatt, mostly applying from 11 December 2027. The FCC proposed keeping 'does the manufacturer maintain an SBOM' on the front of the Cyber Trust Mark label, and MAS's quantum-safe consultation asking for cryptographic inventories closed. The SPDX NTIA conformance checker got stricter. And sbomify's FAQ now covers linked releases, advisory IDs and three ways VEX gets in."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
date: 2026-11-27
slug: this-week-in-sboms-2026-11-27
---

This is the sixth **This Week in SBOMs**, covering **Saturday 21 to Friday 27 November 2026**. [Last week](/2026/11/20/this-week-in-sboms-2026-11-20/) was about runtimes hidden inside other products. This week the theme is the pipeline that builds them: a language registry, three software vendors and a batch of open-source projects were all hit through source control or CI. It was a quiet week for regulators, with US Thanksgiving on Thursday, but Germany's CRA act is now law.

## The big one: Hex.pm, and a week of CI/CD breaches

On **23 November**, between 18:16 and 18:29 UTC, an attacker sent 69 malicious requests to [hex.pm](https://hex.pm/blog/security-incident-on-hexpm), the package registry for Elixir and Erlang, and ran commands on six web servers. The flaw, [CVE-2026-129514](https://insights.sbomify.com/CVE-2026-129514/) (CVSS 10.0, [GHSA-9pmm-hf4r-27pg](https://github.com/advisories/GHSA-9pmm-hf4r-27pg)), was in how hex.pm decoded unauthenticated request bodies in Erlang term format with `Plug.Crypto.non_executable_binary_to_term/2`, "which blocks most potentially harmful terms, but allows struct values through". Hex says it found no evidence of modified packages. But "because database reads are not logged, we cannot rule out that the attacker accessed data stored in the database, including email addresses, password hashes, API key hashes, 2FA secrets". It has rotated infrastructure credentials. The registry signing key is another matter: Hex is "building a new registry signing system that supports key rotation", and until then users should not "trust third-party mirrors and fetch packages only from repo.hex.pm". ([THN](https://thehackernews.com/2026/11/hackers-exploited-cvss-100-hexpm-rce.html), [SecurityWeek](https://www.securityweek.com/hex-package-manager-warns-of-potential-data-breach/), [HN](https://news.ycombinator.com/item?id=50629149))

Hex was not alone. **1Password** [said](https://1password.com/blog/update-on-nov-2026-security-incident) on 25 November that an attacker got into an employee's corporate GitHub account and used it to "push malicious code to backend services". The attacker "copied source code from private repositories and gained access to our CI/CD system"; vaults were not affected. It was the week's top security story on [HN](https://news.ycombinator.com/item?id=50644817). **Todoist** [says](https://www.todoist.com/help/todoist/get-started/security-incident-in-november-2026-cG0EIACNU) that between 22 and 23 November an attacker "used a stolen credential associated with our version control system to modify automated workflows in three repositories and obtain additional credentials". **Defang** [writes](https://defang.io/blog/post/security-incident-november-2026/) that "Our production environment trusted release tags, so their code ran in our CI with access to our production credentials". **SAP** confirmed it "identified suspicious activity" and found "no evidence of unauthorized access to customer business data" ([BleepingComputer](https://www.bleepingcomputer.com/news/security/sap-confirms-security-incident-after-suspicious-github-activity/)). German press reports that source code on GitHub was copied and modified, and [The Record](https://therecord.media/sap-germany-cyberattack-github) and [SecurityWeek](https://www.securityweek.com/sap-confirms-cyberattack-source-code-reportedly-compromised/) relay that signing keys were replaced. Neither claim is confirmed by SAP.

**Why this matters for SBOM/VEX practitioners:** an SBOM tells you what went into a build. It does not tell you whether the build, the registry or the signing key can be trusted. If you consume Hex packages, check that every Hex, Mix, rebar3 and Gleam client in your CI pulls from repo.hex.pm until the new signing system ships, and record which mirror each build used. For your own pipeline, the Defang line is the one to pin on the wall: anything that can create a release tag can run code with production credentials. Provenance attestations that bind an SBOM to a specific workflow run are how a customer tells your release from one built by someone holding your token.

## Security news that mattered

**PolinRider reaches open-source release workflows (25 to 27 November).** [StepSecurity](https://www.stepsecurity.io/blog/polinrider-malware-open-source-pull-requests) reports that an account force-pushed a Python loader into pull-request branches at projects including AsyncAPI, Jaeger, CircuitVerse and Open Food Facts. In CircuitVerse it ran in the release workflow, and maintainers "deleted the 40 installers the workflow published". THN, citing Apiiro, puts the wider campaign at "over 7,600 GitHub repositories" and says there is "no evidence" of distribution via PyPI or npm ([THN](https://thehackernews.com/2026/11/north-korea-linked-polinrider-poisons.html)). _Why it matters:_ a release artefact built from a poisoned PR branch carries a clean-looking SBOM. Rebuild and re-issue the SBOM for anything shipped from an affected workflow.

**Ghostscript Upload2Shell (21 November).** [pwn.ai](https://pwn.ai/upload2shell) published [CVE-2026-125396](https://insights.sbomify.com/CVE-2026-125396/), a use-after-free in the Type 1 font loader that bypasses `-dSAFER`. It is reachable through ImageMagick, Pillow, libvips and CUPS, among others. It was fixed in Ghostscript 10.08.0 in September, yet some distributions still listed it as unfixed on 12 November. The write-up's own point: "Looking only for explicit Ghostscript calls in application code misses both kinds of indirect invocation." ([oss-security](https://www.openwall.com/lists/oss-security/2026/11/21/2), [THN](https://thehackernews.com/2026/11/researchers-demonstrate-ghostscript.html), [HN](https://news.ycombinator.com/item?id=50592097)) _Why it matters:_ this is what transitive dependencies look like in practice. Ghostscript sits two layers down, behind an image library.

**NFS2ROOT in the Linux kernel (25 November).** [OpenSec](https://opensec.in/blog/nfs2root-cve-2026-99362) describes [CVE-2026-99362](https://insights.sbomify.com/CVE-2026-99362/), a pre-auth heap overflow in nfsd that it chains to root. It dates from Linux 3.16 and is fixed in 6.12.117, 6.18.61, 7.3.2 and 7.4-rc1. ([HN](https://news.ycombinator.com/item?id=50647161)) On oss-security, Hanno Böck [noted](https://www.openwall.com/lists/oss-security/2026/11/25/9) that Ubuntu still had no fix for two other kernel bugs nine days after publication. _Why it matters:_ distro kernels carry backports, so match on the distro package version, not the upstream version string.

**Bundled components dominate exploited appliance flaws (25 November).** [BleepingComputer](https://www.bleepingcomputer.com/news/security/infratrust-warns-of-exploited-supply-chain-flaws-in-network-appliances/) covered an Eclypsium report on 373 advisories from 23 infrastructure vendors: "33 of those 38 advisories fixed exploited flaws in bundled software components, primarily PHP, Node.js, and OpenSSH." We have not read the report itself. _Why it matters:_ it is the quantitative version of [last week's](/2026/11/20/this-week-in-sboms-2026-11-20/) argument. Ask appliance vendors for an SBOM that lists the bundled runtime and its version.

**Also worth your time:**

- **WordPress.org** held back backdoored releases of six WP Connect plugins on 22 November using its new release hold, per [THN](https://thehackernews.com/2026/11/wordpress-blocks-six-backdoored-wp.html) citing Wordfence ([CVE-2026-135202](https://insights.sbomify.com/CVE-2026-135202/)). We did not verify the Wordfence post directly.
- **Component fixes:** zstd 1.6.0 fixes [CVE-2026-124851](https://insights.sbomify.com/CVE-2026-124851/), which can leak up to 64 KiB of an internal buffer ([oss-security](https://www.openwall.com/lists/oss-security/2026/11/24/1)). libexpat 2.11.0 fixes [CVE-2026-124317](https://insights.sbomify.com/CVE-2026-124317/), [CVE-2026-128241](https://insights.sbomify.com/CVE-2026-128241/) and [CVE-2026-134703](https://insights.sbomify.com/CVE-2026-134703/) ([oss-security](https://www.openwall.com/lists/oss-security/2026/11/23/19)). Flatpak 1.18.6 fixes a setuid-file bug and a sandbox escape ([oss-security](https://www.openwall.com/lists/oss-security/2026/11/24/15)). Both zstd and expat are statically linked more often than anyone admits.
- **OpenSSL** [confirmed](https://www.openwall.com/lists/oss-security/2026/11/24/14) 4.1.1, 4.0.4 and 3.5.10 for 1 December; "The highest severity issue fixed in these releases is Moderate."
- **GitLab** 19.6.2, 19.5.9 and 19.4.11 (25 November) [move](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-6-2-released/) the bundled nginx to 1.31.9 and fix the bundled GPGME double free, [CVE-2026-129975](https://insights.sbomify.com/CVE-2026-129975/). That answers last week's question about GitLab's bundled nginx. nginx itself shipped 1.31.10 and 1.30.8 on 23 November for [CVE-2026-132779](https://insights.sbomify.com/CVE-2026-132779/) ([nginx.org](https://nginx.org/en/security_advisories.html)).
- **Follow-ups:** Java4Shell is still not in KEV. We found no fix or CVE for the SCTP bug behind NGINX2Root, and no confirmed root cause for the agent-framework PyPI compromise.

**KEV.** Fifteen additions on 23 to 25 November; the catalogue was at version 2026.11.25 on Friday. Four are open source: MONAI Label [CVE-2026-133968](https://insights.sbomify.com/CVE-2026-133968/), Drupal core [CVE-2026-132165](https://insights.sbomify.com/CVE-2026-132165/), Xen Orchestra [CVE-2026-133469](https://insights.sbomify.com/CVE-2026-133469/), and Idunno AntiCsrf [CVE-2026-131914](https://insights.sbomify.com/CVE-2026-131914/), an ASP.NET library that has not been updated since 2008 according to [THN](https://thehackernews.com/2026/11/hackers-exploit-critical-aspnet-anti.html). Optimizely [CVE-2026-132224](https://insights.sbomify.com/CVE-2026-132224/), last week's snippet hijack, was added on 24 November. The rest are Danfoss, Juniper, Mitel and N-able products. An abandoned library is the case where only an SBOM finds it: nobody is going to send you an advisory. See our [KEV explainer](/2025/12/30/what-is-kev-cisa-known-exploited-vulnerabilities/).

## CRA

**Germany's CRA implementation act is law (25 November).** The act, dated 20 November, was [published](https://www.recht.bund.de/bgbl/1/2026/355/VO.html) as BGBl. 2026 I Nr. 355. It adds a part on products with digital elements to the BSI Act and makes the BSI "die zuständige nationale Marktüberwachungsbehörde". Some press reports say most of it took effect on 26 November. The [text](https://www.recht.bund.de/bgbl/1/2026/355/regelungstext.pdf?__blob=publicationFile&v=1) does not support that. Only a few provisions apply the day after promulgation, including § 66 on notification and accreditation; "Im Übrigen tritt dieses Gesetz am 11. Dezember 2027 in Kraft." _Why it matters:_ the authority that will check German manufacturers' SBOMs is the one that wrote [TR-03183](/compliance/bsi-tr-03183/), and its fines regime arrives with the CRA's SBOM obligation in December 2027.

**Eclipse ORC: PURLs in attestations.** An open [pull request](https://github.com/orcwg/cra-attestations/pull/45) from 21 November adds Package URLs to the attestation template, because "SBOMs usually record a component's package rather than its repository". If it lands, an open-source attestation could be matched straight against an SBOM entry.

**Otherwise quiet.** ENISA published nothing new. The SRP page still says the version 1.4 documentation is "currently being updated". The Commission's [manufacturers page](https://digital-strategy.ec.europa.eu/en/policies/cra-manufacturers) added Spain's INCIBE-CERT to its national resources on 26 November. We found nothing new on EN 40000-1-3. Background is on our [CRA page](/compliance/eu-cra/).

## NIS2

Quiet. France's resilience bill is waiting for a joint committee with no date set ([Sénat](https://www.senat.fr/dossier-legislatif/pjl24-033.html)), and we found no infringement steps in the window. See our [NIS2 page](/compliance/eu-nis2/).

## CISA and US regulators

**FCC keeps the SBOM question on the front of the label (23 November).** A [Federal Register notice](https://www.federalregister.gov/documents/2026/11/23/2026-23812/cybersecurity-labeling-for-internet-of-things) on the U.S. Cyber Trust Mark summarises a public notice from 27 October. The CTA-2120 standard puts the HBOM/SBOM disclosure on the label's second layer. The Bureau writes "we propose to decline to remove this data element (whether the manufacturer maintains an HBOM/SBOM) from Layer 1", while conceding that "many consumers may not understand the purpose of an HBOM/SBOM". Comments are due 23 December. _Why it matters:_ for labelled IoT products, "do you maintain an SBOM" would be a yes/no question on page one of the label. Saying yes implies you can produce one.

Apart from KEV and routine ICS advisories, CISA published nothing. The Federal Register had no other hits for SBOM, "cryptographic inventory", "post-quantum" or "secure software development". The [Minimum Elements](/compliance/cisa-minimum-elements/) are unchanged.

## Other regulators

**Singapore MAS: cryptographic inventories (23 November).** The comment period for MAS's [consultation](https://www.mas.gov.sg/-/media/mas-media-library/publications/consultations/trpd/2026/p019-2026-november-2026-consultation-paper-on-quantumsafe-migration-guidance-and-timelines-for-the-f.pdf) on quantum-safe migration closed. It expects financial institutions to keep "a comprehensive inventory of cryptographic assets, covering at minimum the algorithms, key lengths and protocols in use", with an indicative deadline of the end of 2027 for migration plans. Together with the UK guidance we covered last week, that makes two financial supervisors asking for what is in effect a [CBOM](/faq/what-is-a-cbom/).

**UK Cyber Security and Resilience Bill (24 November).** The Commons accepted most Lords amendments but rejected two, including a review clause that would have covered "the management of supply chain risks" ([Hansard](https://hansard-api.parliament.uk/debates/debate/9696CEE9-A8C3-449D-9B15-89FA9F00CF8E.json)). The Lords take it up again on 7 December. There is no Royal Assent yet, and no SBOM provision in the bill.

The BSI [confirmed](https://www.bsi.bund.de/DE/Service-Navi/Presse/Alle-Meldungen-News/Meldungen/2026/OSCAL-bleibt_261124.html) on 24 November that OSCAL stays its format for machine-readable security requirements. Nothing new from METI, CERT-In or ASD that we could find, though several of those sites did not load for us.

## Standards

**The SPDX NTIA conformance checker got stricter (27 November).** [v6.1.0](https://github.com/spdx/ntia-conformance-checker/releases/tag/v6.1.0) warns that "Some SBOMs that passed 6.0.0 may now fail". A missing element at either end of a relationship now fails every checker (NTIA, FSCT3 and BSI), and "`SPDXRef-DOCUMENT DESCRIBES A` alone no longer counts as a dependency relationship". _Why it matters:_ if your SPDX generator only emits `DESCRIBES`, expect red in CI after upgrading.

**CycloneDX 2.0 missed November so far.** The latest release is still 1.7.2. A maintainer [wrote](https://github.com/CycloneDX/specification/issues/1254) on 27 November that "WE are currently finalizing CycloneDX 2.0". Changes merged this week were editorial. [cyclonedx-python-lib 11.13.0](https://github.com/CycloneDX/cyclonedx-python-lib/releases/tag/v11.13.0) added 1.7.2 support and the component `modelCard` field.

**PURL and VERS.** The PURL registry design became a [decision document](https://github.com/package-url/purl-spec/pull/1073) on 21 November, renaming the namespace registry to a "PURL directory". In the [ECMA-427 second-edition edits](https://github.com/Ecma-TC54/ECMA-427/pull/114), still open, a 24 November commit refers to VERS as "ECMA-436". That number is not yet confirmed by Ecma.

**SPDX.** Still 3.1 RC1. [#1498](https://github.com/spdx/spdx-3-model/issues/1498) proposes deprecating MD5 and SHA-1 in `HashAlgorithm`, with pushback that SPDX should "record facts about the system".

## The wider landscape

- **Dependency-Track:** new issue [#8075](https://github.com/DependencyTrack/dependency-track/issues/8075) reports that "an older CycloneDX VEX version uploaded later overrides a newer one". If you push VEX from more than one pipeline, upload order matters until that is fixed.
- **Sigstore:** [sigstore-python 4.6.0](https://github.com/sigstore/sigstore-python/releases/tag/v4.6.0) (22 November) adds Ed25519 certificate verification and now uses the OS certificate store.
- **OpenVEX:** spec issues [#78](https://github.com/openvex/spec/issues/78) and #80 report that several examples are invalid JSON or fail the schema.
- **OpenSSF** launched a Japan working group; TAC was quiet. We found no new SBOM papers on arXiv.

## House news: new sbomify FAQ entries

This column leaves vendor announcements out, so this section is flagged as ours. On 26 November we updated three FAQ entries to match the rebuilt walkthrough videos:

- [How do I use VEX?](/faq/how-do-i-use-vex/) now covers the three ways a VEX statement gets into sbomify. sbomify writes one when you triage a vulnerability, an AI agent can propose one that waits for a person to approve it, or you upload one from another tool. The walkthrough ends on the public release page with the finding shown as suppressed.
- [How do I create a software release?](/faq/how-do-i-create-a-software-release/) gains a **Ships with** section. A release can link the release of another product it includes, such as a runtime or firmware image, and that release's SBOMs become part of the combined SBOM.
- [How do I publish a security advisory?](/faq/how-do-i-publish-a-security-advisory/) explains how to set the advisory ID prefix and the number each year starts at, so IDs do not clash with ones you issued elsewhere.

The same material now has its own pages: [Vulnerability Management and VEX](/features/vulnerability-management/) and [AI Agents](/features/ai-agents/). _Why it matters:_ "Ships with" is this week's Ghostscript and Eclypsium stories in product form. If your product bundles a runtime you also ship separately, its SBOM should travel with the release.

## What to watch next week

- Hex's new registry signing system and client releases, and 1Password's promised root-cause analysis.
- OpenSSL's releases on 1 December.
- The EU Telecom Council on 1 December, where the Cybersecurity Act revision and NIS2 amendments are on the agenda as any other business.
- The Lords' consideration of the UK bill on 7 December.
- CycloneDX 2.0, and whether VERS is approved as ECMA-436 at the December Ecma General Assembly.

_This Week in SBOMs concentrates on regulation, standards and the open-source ecosystem. It omits vendor product announcements and marketing but covers vendors' own security incidents. Releases from our own organisation, when referenced, are marked as house news. Noticed something we overlooked? Contact us._
