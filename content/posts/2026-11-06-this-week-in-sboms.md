---

title: "This Week in SBOMs: OpenSSH's musl Hole, APT Swaps Packages, and the CRA Reporting Platform Hits v1.3"
description: "SBOM news for 31 October to 6 November 2026: the OpenSSH 10.6p2 password bypass on musl systems (CVE-2026-123158), the APT man-in-the-middle flaw CVE-2026-109518, zlib 1.4 and libexpat 2.10.0, ENISA's SRP v1.3 and secure-update advisory, MAS's cryptographic inventory proposal, and a quiet week for SPDX, CycloneDX and PURL releases."
keywords: "This Week in SBOMs, SBOM news, OpenSSH 10.6p2, CVE-2026-123158, sshole, musl, Alpine Linux, APT CVE-2026-109518, zlib 1.4, CVE-2026-85091, libexpat 2.10.0, CISA KEV, WordPress CVE-2026-119977, cPGuard, ENISA SRP 1.3, ENISA secure update mechanisms, CRA news, NIS2, Bundesrat CRA, MAS quantum-safe, CBOM, SPDX 3, CycloneDX 2.0, PURL, cdxgen 12.9.1"
categories:
  - news
tags: [sbom, this-week-in-sboms, openssh, musl, alpine, apt, zlib, supply-chain, kev, cra, nis2, enisa, cisa, cbom, pqc, spdx, cyclonedx, purl, vex]
tldr: "OpenSSH 10.6p2 fixed a password bypass that only exists when sshd is built against musl libc without PAM, which makes the build flavor, not the version, the thing to inventory. Debian fixed an APT flaw that let a man-in-the-middle swap a package after verification. zlib 1.4 and libexpat 2.10.0 shipped security fixes for two of the most vendored libraries there are. ENISA moved the CRA Single Reporting Platform to v1.3 and published a technical advisory on secure update mechanisms that treats the SBOM as release evidence. Germany's CRA implementation act is on the Bundesrat's draft agenda for 20 November, and MAS proposed a mandatory cryptographic asset inventory for Singapore's financial sector. Standards bodies shipped no releases."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
date: 2026-11-06
slug: this-week-in-sboms-2026-11-06
---

This is the third issue of **This Week in SBOMs**, covering **Saturday 31 October to Friday 6 November 2026**. [Last week](/2026/10/30/this-week-in-sboms-2026-10-30/) was about finding PHP and Brotli in places nobody had listed them. This week's lead story goes one step further: the component was easy to find, but its version did not tell you whether you were exposed. The build did.

Regulators were busier than last week, though mostly with plumbing rather than new rules.

## The big one: OpenSSH on musl accepted any long password

**OpenSSH 10.6p2 was released on 5 November** with what the [release notes](https://www.openssh.org/releasenotes.html#10.6p2) call "a critical security workaround that affects Linux systems that use the musl libc and PAM disabled". The bug, nicknamed "\*sshole" by its reporter on [sshhole.com](https://sshhole.com/), is now [CVE-2026-123158](https://www.cve.org/CVERecord?id=CVE-2026-123158). MITRE's record says that for some account configurations "any password between 256 and 1024 characters succeeds".

The mechanism is old and dull, which is why it survived. An account whose password field is `*`, the normal state for key-only users, should never accept a password. On musl, a failed `crypt()` call returns a short string rather than NULL, and in this path that string lined up with the `*` field. [Alpine's advisory](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/) spells out the conditions:

- the `openssh-server` package, which Alpine builds without PAM, or `openssh-server-pam` with `UsePAM no`;
- `PasswordAuthentication yes`, which is the OpenSSH default;
- an account with `*` as its password field, plus at least one local account with a `$5$` or `$6$` hash.

Alpine says every release it checked is affected: 3.21 to 3.24 and edge, plus the unsupported 3.16 to 3.20. It also warns that the `alpine` user in its official tiny-cloud images (3.18.11 to 3.24.3) has a `*` password field and passwordless `doas`: safe on first boot, exploitable once any account gets a `$6$` hash. Container users who do not run sshd in the container are not affected, and nor are PAM builds with `UsePAM yes`. Damien Miller, quoted by LWN, said the bug does not exist on glibc systems. The reporter also names OpenWrt, Buildroot and Yocto as musl-based systems worth checking. The stopgap is `PasswordAuthentication no`. Alpine's advisory notes that no CVE had been assigned when it was written; MITRE published the CVE record on 5 November. THN reported no known attacks. ([THN](https://thehackernews.com/2026/11/openssh-issues-emergency-fix-for-flaw.html), [BleepingComputer](https://www.bleepingcomputer.com/news/security/openssh-flaw-lets-attackers-log-into-password-disabled-linux-accounts/), [LWN](https://lwn.net/Articles/1105464/), [oss-security](https://www.openwall.com/lists/oss-security/2026/11/05/2), [HN discussion](https://news.ycombinator.com/item?id=50378228))

The release notes add a policy change worth noting: because bugs found by AI tools are being "independently discovered by a different researcher", the OpenSSH team "will, for now, be making more frequent releases" rather than batching fixes.

**Why this matters for SBOM/VEX practitioners:** "openssh 10.6p1" is not enough to decide exposure. You need the libc the binary was built against, the package flavor (`openssh-server` or `openssh-server-pam`) and, for the last step, the configuration. An image SBOM that records musl and the exact package name lets you rule out most of your fleet at once. It also gives suppliers what they need to publish a [VEX](/faq/how-do-i-use-vex/) `not_affected` statement for glibc and PAM builds, with a justification that holds up. Expect more advisories where the answer depends on how something was built, and fewer where the version string settles it.

## Security news that mattered

**APT: a man-in-the-middle could swap a verified package (4 November).** Debian's [DSA 6607-1](https://lists.debian.org/debian-security-announce/2026/msg00526.html) fixes [CVE-2026-109518](https://www.cve.org/CVERecord?id=CVE-2026-109518), found by Max Justicz. In Debian's words, "improper file handling when resuming an HTTP download allows a man-in-the-middle attacker to replace a package after verification, resulting in the execution of arbitrary code as root." The fix for trixie is apt 3.0.4. The bug relies on `Acquire::Retries`, the default since APT 2.3.2, and the [oss-security post](https://www.openwall.com/lists/oss-security/2026/11/04/12) suggests `Acquire::Retries 0;` as a stopgap. Ubuntu published fixed APT builds for 22.04, 24.04, 26.04 and 26.10 the same day. ([THN](https://thehackernews.com/2026/11/debian-and-ubuntu-apt-flaw-lets-mitm.html))

_Why it matters:_ this one hits the build, not the product. Every Debian or Ubuntu base image runs APT during `docker build`, and signature checks were the thing it got past. Check the apt version in your build images, not just in what you ship, and treat images built over untrusted networks during the exposure window as worth rebuilding.

**zlib 1.4 and libexpat 2.10.0 (2 and 5 November).** [zlib 1.4](https://github.com/madler/zlib/releases/tag/v1.4) fixes a non-blocking `gzwrite()` buffer overflow ([CVE-2026-85091](https://insights.sbomify.com/CVE-2026-85091/)). It also fixes an `inflateGetDictionary()` bug that "could write up to 8 MB past the caller's 32K buffer" in 1.3.1 and 1.3.2, a batch of Trail of Bits audit findings, and several minizip path-traversal and memory bugs. On [CVE-2026-4738](https://insights.sbomify.com/CVE-2026-4738/) in contrib/infback9, the notes say the critical rating "overstates it". zlib 1.4 also has breaking changes, including `z_off_t` reverting to `long`. Separately, [libexpat 2.10.0](https://www.openwall.com/lists/oss-security/2026/11/02/6) fixes CVE-2026-113351, CVE-2026-115506, CVE-2026-117610 and CVE-2026-118370, including billion-laughs variants. ([oss-security on zlib](https://www.openwall.com/lists/oss-security/2026/11/05/10))

_Why it matters:_ zlib and Expat are the classic vendored libraries, copied into source trees where package managers never see them. Most of the zlib fixes are tied to specific APIs, so a VEX statement saying which functions you actually call is more useful than a blanket "affected".

**cPGuard's update channel delivered a backdoor (2–3 November).** OPSSHIELD's [advisory](https://opsshield.com/notice/cpguard-update-channel-compromise.html) and [incident disclosure](https://opsshield.com/notice/security-incident-disclosure-servermanage.html) say an attacker used a stolen access key to push a fake update, cPGuard versions 5.88.12 to 5.88.19, which agents installed between 02:08 and 03:20 UTC on 2 November. About 2,950 customer servers ran it, and it copied `/etc/shadow`, root SSH keys and the MySQL root password. The clean update is 5.88.26, and credentials on affected servers need rotating. ([THN](https://thehackernews.com/2026/11/cpguard-update-channel-hijacked-to.html)) _Why it matters:_ a compromise with a known bad version range is exactly what a version-level inventory answers in minutes.

**A backdoored Docker Hub image behind a popular GitHub repo (5 November).** THN [reports](https://thehackernews.com/2026/11/backdoored-docker-image-for-artex-ai.html) that a GitHub copy of the ARTEX project changed one line in its `docker-compose.yml` to pull the `tomicdd/artex` Docker Hub image, which hides an unauthenticated root shell in the login handler. THN counts 62 internet-facing ARTEX consoles serving the backdoored build between 2 and 4 November. _Why it matters:_ the image namespace and digest are provenance. A one-line compose change replaced the whole artifact while the source looked fine.

**Also worth a look:**

- **Rails 8.0.5.2 and 8.1.4.1** [fix 21 issues](https://www.openwall.com/lists/oss-security/2026/11/04/2), including a critical Active Storage file read/write bug in image analysis ([GHSA-f3w6-w445-fwh9](https://github.com/rails/rails/security/advisories/GHSA-f3w6-w445-fwh9)). Rails 8.0 security support ends on 7 November. ([THN](https://thehackernews.com/2026/11/critical-rails-flaw-lets-attackers.html))
- **Linux TCP [CVE-2026-98432](https://insights.sbomify.com/CVE-2026-98432/), continued:** Red Hat shipped fixes, while Ubuntu's were still in testing as of THN's 3 November [report](https://thehackernews.com/2026/11/red-hat-patches-98-rated-linux-tcp-rce.html).
- **Pre-announcements:** Go 1.27.4 and 1.26.11 are [due on 10 November](https://www.openwall.com/lists/oss-security/2026/11/05/13), and Node.js security releases are [due on or shortly after 11 November](https://www.openwall.com/lists/oss-security/2026/11/04/3).

**KEV.** CISA added two entries in the window. WordPress Core [CVE-2026-119977](https://www.cve.org/CVERecord?id=CVE-2026-119977), a race condition during core upgrades, went in on 3 November with a due date of 6 November. Apple's CVE-2024-27834 went in on 4 November. Neither carries the open-source component flag that the PHP and Brotli entries had last week. ([THN on WordPress](https://thehackernews.com/2026/11/cisa-confirms-hackers-exploiting.html))

**Last week's watch list.** [Last week](/2026/10/30/this-week-in-sboms-2026-10-30/) we said we would look out for five things. Here is where each stands:

- **Vendor advisories for embedded PHP and Brotli, and whether they come with CSAF or VEX.** Palo Alto updated its [Brotli portfolio advisory](https://security.paloaltonetworks.com/CVE-2026-111497) on 31 October. It lists affected and fixed builds for PAN-OS 12.2, 12.1 and 11.2 and marks 11.1 and 10.2 as unaffected. It notes that Brotli encoding is disabled by default from PAN-OS 11.2.4 and ships the advisory as CSAF. It is a VEX statement in all but format. Its PHP2Shell advisory has not changed since 29 October. We found no other new vendor advisories for PHP2Shell in the window. On the tooling side, cdxgen 13.6.0 now finds Brotli decoders hidden inside runtimes and binaries (see below).
- **Whether Apple fixes the macOS command-line CA bundle.** Not yet, as far as we can see. Apple's [security releases page](https://support.apple.com/en-us/100100) lists no macOS update after 26 October, and the researcher's [page](https://emudhra.we-have-a-problem.com/apple.html), still dated 28 October, says git, curl and python3 trust the compromised eMudhra intermediates. If you run macOS CI runners, the manual workaround is still the only fix.
- **CEN-CENELEC ratification of EN 40000-1-1 and 1-2.** No primary confirmation (see CRA below).
- **TC54's 15 October minutes and a CycloneDX 2.0 release candidate.** Neither has appeared (see Standards).
- **The German CRA act on the Bundesrat agenda for 20 November.** Yes: it is item 6 on the draft agenda (see CRA).

## CRA

**The Single Reporting Platform is now v1.3 (4 November).** ENISA's [SRP page](https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp) says that "on 4 November 2026, the CRA SRP was upgraded to version 1.3" and that the documentation "is currently being updated". There are no release notes, so we cannot say what changed. The FAQ is still dated 15 October and still says there is no API. If you have [SRP](/2026/09/10/cra-single-reporting-platform-enisa-srp/) runbooks, recheck the form fields before you need them.

**ENISA Technical Advisory on Secure Update Mechanisms (4 November).** The [advisory](https://www.enisa.europa.eu/publications/enisa-technical-advisory-on-secure-update-mechanisms) is aimed at manufacturers, especially smaller ones, and maps update controls to CRA Annex I. It references TUF, Uptane, SLSA provenance, in-toto and Sigstore, and lists an SBOM of third-party components, checked for known vulnerabilities before release, as a build-stage control. _Why it matters:_ read it alongside the 22 October SBOM advisory. Together they describe an update as something you can only ship with evidence of what is in it.

**Germany: the CRA act is on the Bundesrat draft agenda.** The [draft agenda](https://www.bundesrat.de/SharedDocs/TO/1070/tagesordnung-1070.html) for the 20 November plenary, dated 3 November, lists the CRA implementation act as item 6 (Drucksache 621/26). It is a draft; the final agenda follows later.

**Eclipse ORC.** The Vulnerability Handling task force's [22 October minutes](https://github.com/orcwg/orcwg/blob/main/cyber-resilience-sig/task-forces/vulnerability-handling-tf/minutes/2026-10-22-mom-vulnerability-handling-tf.md), merged on 5 November, record proposals to use PURL rather than a new package identity in the CRA due-diligence schema. Slides from the 27 October [Code & Compliance event](https://github.com/orcwg/orcwg/tree/main/events/2026-10-code-compliance) went up on 3–4 November, including an ENISA talk on "SBOM by design".

**Still waiting:** we found no primary confirmation that EN 40000-1-1 and EN 40000-1-2 were ratified around 2 November. CEN-CENELEC has published nothing, and an aggregator's "ratification completed" status is not something we will report as fact. We also found no new Commission acts or steward guidance, though EUR-Lex blocked automated searches, so the Official Journal was not fully checked. See our [CRA compliance guide](/compliance/eu-cra/).

## NIS2

**France's NIS2 bill returns on 9 November.** The Assemblée nationale [dossier](https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N50731) lists the resilience and cybersecurity bill, which transposes NIS2 alongside the CER Directive and DORA, for public sitting on Monday 9 November. [Silicon.fr](https://www.silicon.fr/cybersecurite-1371/nis-2-le-projet-de-loi-de-retour-le-9-novembre-230126) notes it had been set for 7 October before being withdrawn because of the crowded parliamentary calendar.

**EU-level incident response.** On 4 November the Commission, ENISA, Europol and the EU's CSIRT and crisis networks issued a [joint statement](https://www.enisa.europa.eu/news/joint-statement-on-cyber-incidents-in-refrigeration-systems-across-the-eu) on incidents affecting commercial refrigeration systems in several Member States since 11 October. It reminds manufacturers of their CRA reporting duty and NIS2 entities of theirs. It is one of the first public cases we have seen where both regimes are invoked for the same incident.

Otherwise quiet: no infringement decisions, and no date yet for the Digital Omnibus or the Cybersecurity Act revision in Parliament. Our [NIS2 page](/compliance/eu-nis2/) has the background.

## CISA and US regulators

**CISA, ASD and NSA: post-quantum questions for vendors (5 November).** CISA [published](https://www.cisa.gov/resources-tools/resources/post-quantum-questions-ask-your-vendors) joint guidance and a quick-reference list to help buyers judge vendor readiness for post-quantum cryptography, including whether a vendor "maintains transparency over its cryptographic implementations". _Relevance:_ "transparency over cryptographic implementations" is a [CBOM](/faq/what-is-a-cbom/) by another name.

Otherwise quiet. Federal Register searches for "software bill of materials" and FASCSA returned nothing in the window. We found no movement on the FCC's bills-of-materials proposal, no new OMB cyber memo, and no change to NIST's SSDF revision.

## Other regulators

**Singapore: MAS proposes a required cryptographic inventory (6 November).** MAS's [consultation](https://www.mas.gov.sg/publications/consultations/2026/consultation-paper-on-quantum-safe-migration-guidance-and-timelines-for-the-financial-sector) on quantum-safe migration proposes that financial institutions keep a "comprehensive inventory of cryptographic assets", covering algorithms, key lengths, protocols and their dependencies. It also proposes deadlines: a migration plan by 31 December 2027, critical systems by 31 December 2030 and everything else by 31 December 2034. Comments close on 23 November. _Relevance:_ a financial regulator proposing a dated, mandatory cryptographic inventory that includes dependencies is a CBOM requirement in all but name. The proposal also expects migration plans to cover "vendor engagements to align third-party migration roadmaps".

**UK.** The Cyber Security and Resilience Bill finished its Lords Third Reading on 2 November ([Parliament](https://bills.parliament.uk/bills/4035)). A government-commissioned [software market analysis](https://www.gov.uk/government/publications/uk-software-market-analysis) published on 6 November found that "only 19% of survey respondents claimed they implemented" the voluntary [Software Security Code of Practice](/compliance/uk-software-security-code-of-practice/).

**Japan.** METI [announced](https://www.meti.go.jp/press/2026/11/20261104002.html) on 4 November that Japan–EU work comparing its JC-STAR IoT labeling scheme with the CRA is starting in earnest. The Japan Business Council in Europe and the EU-funded StandICT.eu secretariat signed a memorandum in Brussels on 26 October, and METI and IPA will now take part in a requirement-by-requirement comparison.

We found nothing new on SBOM, CBOM, VEX or AIBOM from BSI, CERT-In or Singapore's CSA. Canada's CCCS and Australia's ASD sites did not load for us.

## Standards

**SPDX.** No release; 3.1 is still at RC1. The SPDX 3 model [added an `additionalName` property](https://github.com/spdx/spdx-3-model/pull/1469) on 3 November. The PR cites the CISA 2026 Minimum Elements rule that a component name should allow multiple entries. A [proposed rename](https://github.com/spdx/spdx-3-model/pull/1482) of AbstractPackage to GenericPackage is open after the 3 November tech call.

**CycloneDX and Ecma TC54.** Still 1.7.2, still no 2.0 release candidate. Two schema-tooling PRs landed on the 2.0 branch on 2 November, and a [proposed `role`](https://github.com/CycloneDX/specification/pull/1195) on related cryptographic assets (encryption, key exchange, signing) would make CBOMs more precise. The minutes of TC54's 15 October meeting are still not published.

**PURL, VERS and TEA.** No releases. An open purl-spec PR [rewrites the Go type notes](https://github.com/package-url/purl-spec/pull/1054) for modules: the type definition already marks Go names as case-sensitive, but the notes still said to lowercase them. If your tooling followed the notes, check how it handles Go module path casing. TEA remains frozen pending Ecma.

## The wider landscape

- **[cdxgen 12.9.1](https://github.com/cdxgen/cdxgen/releases/tag/v12.9.1) (6 November):** an LTS security release fixing four ways a scanned repository could influence cdxgen, including a config file that could run commands. If you scan code you do not control, such as fork PRs, upgrade. [13.6.0](https://github.com/cdxgen/cdxgen/releases/tag/v13.6.0) (31 October) finds Brotli decoders hidden inside runtimes and binaries for CVE-2026-111497, which package-level scans miss.
- **[cyclonedx-python 8.0.0](https://github.com/CycloneDX/cyclonedx-python/releases/tag/v8.0.0) (4 November):** a breaking change, since `-E`/`-S` without an interpreter argument now probes the current interpreter.
- **[Grype 0.121.1](https://github.com/anchore/grype/releases/tag/v0.121.1) (2 November)** fixes an incorrect constraint for versionless PURLs in OpenVEX, and **[Syft 1.57.0](https://github.com/anchore/syft/releases/tag/v1.57.0) (5 November)** records GNU ELF build IDs.
- **Dependency-Track:** no release, but CEL policies [now honor analysis overrides](https://github.com/DependencyTrack/dependency-track/pull/7907) on the main branch, so VEX-style triage decisions will feed policy.
- **OpenSSF:** the TAC has been [asked to ratify](https://github.com/ossf/tac/issues/682) a new Supply Chain Integrity working group charter. The SBOM & VEX working group was quiet.
- **Research:** we found no arXiv papers on SBOMs or VEX submitted in the window.

## What to watch next week

- Distribution advisories for CVE-2026-123158 from OpenWrt, Buildroot and Yocto, and whether image vendors publish VEX for glibc builds.
- Go and Node.js security releases on 10 and 11 November.
- The French NIS2 debate from 9 November, and the final Bundesrat agenda for 20 November.
- ENISA's updated SRP documentation for v1.3, and any primary confirmation of EN 40000-1-1 and 1-2.
- The Brotli KEV deadline on 10 November.
- Whether Apple ships a fix for the macOS command-line CA bundle, and whether TC54 publishes its October minutes.

_This Week in SBOMs covers regulation, standards and the open-source landscape. It deliberately excludes vendor product and marketing news, but reports on vendors' own security incidents. Noticed something we missed? Let us know._
