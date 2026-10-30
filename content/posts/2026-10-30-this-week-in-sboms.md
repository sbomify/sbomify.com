---

title: "This Week in SBOMs: PHP2Shell Goes Live, Brotli Hides Behind Version Numbers, and Alpine's GitLab Scare"
description: "SBOM news for 24 to 30 October 2026: PHP2Shell added to CISA KEV and exploited in firewalls, the Brotli CVE-2026-111497 KEV entry and PHP's rebuilt Windows packages, the attempted GitLab exploit at Alpine Linux, a quiet week for the CRA and NIS2, NIST IR 8547 final, CISA 2030, and steady work on SPDX, CycloneDX and PURL."
keywords: "This Week in SBOMs, SBOM news, PHP2Shell, CVE-2026-109618, CVE-2026-109619, CVE-2026-46300, Brotli CVE-2026-111497, CVE-2026-97229, Alpine Linux GitLab, CISA KEV, NIST IR 8547, CBOM, CISA 2030, FASCSA, CRA news, NIS2, EN 40000, SPDX 3, CycloneDX 2.0, PURL ECMA-427, Dependency-Track 5.2.1"
categories:
  - news
tags: [sbom, this-week-in-sboms, php2shell, fosdem, trust-center, supply-chain, kev, cra, nis2, cisa, nist, cbom, spdx, cyclonedx, purl, vex]
tldr: "PHP2Shell went from patched to exploited: CISA added both PHP CVEs to KEV on 26 October and a chained Linux kernel bug on 28 October, and Palo Alto confirmed attacks on the PHP inside its firewall management interfaces. CISA also added the Brotli decoder flaw, and PHP rebuilt its Windows packages without changing the PHP version number. Alpine Linux disclosed an attempted exploit of its GitLab server, where upgrading GitLab did not fix a bug that lives in Ruby. The CRA and NIS2 had a quiet week. NIST finalised IR 8547 on the post-quantum transition, and CISA published its 2030 strategy. Standards work was incremental: SPDX, CycloneDX and PURL merged fixes but shipped no releases."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
date: 2026-10-30
slug: this-week-in-sboms-2026-10-30
---

Welcome to the second edition of **This Week in SBOMs**, and the first that covers a normal seven-day window: **Saturday 24 October to Friday 30 October 2026**. [Last week's edition](/2026/10/23/this-week-in-sboms-2026-10-23/) covered a whole month.

The short version: last week's vulnerabilities became this week's incidents. PHP2Shell and the Brotli flaw both landed in CISA's Known Exploited Vulnerabilities (KEV) catalogue, and in both cases the hard part is finding the copies of the component that nobody lists. Regulators, by contrast, mostly had a week off. A short, labelled section of our own news closes this edition.

## The big one: PHP2Shell is now exploited

**CISA added CVE-2026-109618 and CVE-2026-109619 to KEV on 26 October**, with a federal remediation deadline of 29 October. Both are flagged in the [KEV feed](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) as affecting "an open-source component, third-party library, protocol, or proprietary implementation that could be used by different products". That is CISA's way of saying the problem is not limited to servers you know run PHP. ([THN](https://thehackernews.com/2026/10/cisa-confirms-active-exploitation-of.html))

Three things followed during the week:

- **A kernel bug joined the chain (28 October).** CISA added the Linux kernel flaw CVE-2026-46300 to KEV with a deadline of 31 October. Its KEV entry states that it "can be chained with CVE-2026-109618 and CVE-2026-109619 to implant PHP webshells and run commands as root". ([BleepingComputer](https://www.bleepingcomputer.com/news/security/cisa-warns-of-fragnesia-linux-flaw-chained-in-php2shell-attacks/))
- **Exploitation reports arrived.** GreyNoise told [The Record](https://therecord.media/php2shell-successful-exploitation-reports-emerge) it had seen at least six successful exploitations. Dream published a report on what it says is a China-nexus campaign that compromised US government-affiliated servers by chaining PHP2Shell with an exploit for an unnamed vendor's firewall software. Dream's claims are as reported; we have not seen independent confirmation. ([THN](https://thehackernews.com/2026/10/php2shell-attack-roots-25-servers.html), [HN discussion](https://news.ycombinator.com/item?id=50286987))
- **Palo Alto confirmed attacks on its own appliances.** The vendor's [advisory for the PHP flaws](https://security.paloaltonetworks.com/CVE-2026-109618), first published on 21 October and updated on 29 October, now says that "active exploitation has been observed targeting the Palo Alto Networks management interface exposed to the internet". It lists affected and fixed PAN-OS builds, and publishes the advisory as CSAF. ([THN](https://thehackernews.com/2026/10/attackers-exploit-php2shell-flaws-in.html))

**Why this matters for SBOM/VEX practitioners:** last week the question was "where is our PHP?". This week it became urgent, and the most exposed copies turned out to be inside network appliances, not on web servers. If your suppliers cannot tell you whether their products embed PHP, and which version, ask them now. The Palo Alto advisory, with its machine-readable CSAF document and a per-product affected/unaffected table, is roughly what a useful supplier response looks like. A [VEX statement](/2026/07/30/announcing-sbomify-v26-7-1-the-one-that-says-not-affected/) for every product that is _not_ affected is the other half.

## Security news that mattered

**Brotli joins KEV, and PHP rebuilds without a version bump (26–27 October).** CISA added the Brotli decoder flaw CVE-2026-111497 to KEV on 27 October, deadline 10 November, again flagged as an open-source component used by different products. The fix is in [Brotli 1.2.1](https://github.com/google/brotli/releases/tag/v1.2.1). On 26 October the PHP team [rebuilt its Windows packages](https://www.php.net/archive/2026.php) as 8.5.12-1, 8.4.27-1, 8.3.36-1 and 8.2.35-1 to ship Brotli 1.2.1. PHP says the vulnerable decoder is reachable through the cURL extension when automatic response decompression is enabled. The runtime version stays the same; only the `-1` package suffix changes. On the same day, an [oss-security post](https://www.openwall.com/lists/oss-security/2026/10/26/16) pointed out that git's HTTPS transport is also exposed when libcurl is built with Brotli support, as it is on most distributions. ([THN](https://thehackernews.com/2026/10/php-issues-second-windows-security.html))

_Why it matters:_ `php -v` will tell you nothing here. Only an SBOM that records the bundled Brotli version, or the package digest, separates a fixed Windows build from a vulnerable one. The same goes for every product that links libcurl with Brotli.

**Alpine Linux's GitLab: upgraded, still vulnerable (28 October).** Alpine [disclosed](https://alpinelinux.org/posts/GitLab-security-incident-CVE-2026-97229.html) that an attacker tried to exploit CVE-2026-97229 on its GitLab instance on 20–21 October and came back on 25–26 October. The flaw is in Onigmo, the regular expression engine built into Ruby. GitLab's fix is a patch to the Ruby it bundles in its own packages, so Alpine's upgrade to GitLab 19.3.6, running on standard Ruby, left the server vulnerable. Self-built deployments need Ruby 3.3.13, 3.4.12 or 4.0.9. Alpine found no evidence that the attack succeeded but could not rule it out, so it rebuilt the instance and reset all passwords. It says aports, packages and the 21 October releases (3.21.9, 3.22.7, 3.23.7 and 3.24.3) were verified against records outside GitLab, and that its signing keys have never been stored on the GitLab server. CISA added CVE-2026-97229 to KEV on 29 October. ([THN](https://thehackernews.com/2026/10/attacker-tried-to-exploit-alpine-linuxs.html), [HN discussion](https://news.ycombinator.com/item?id=50282544))

_Why it matters:_ an SBOM that says "GitLab 19.3.6" gives a false all-clear when the vulnerable code is in the runtime underneath. Runtime components belong in the inventory, and a VEX statement for this CVE has to say which Ruby it was assessed against.

**testmetest: npm malware and 42 armed GitHub repositories (26 October).** JFrog [reported](https://research.jfrog.com/post/beyond-testmetest-42-hijacked-github-repos/) that the testmetest npm campaign, whose packages are disguised as native addons, extends to 42 armed repositories across 11 legitimate GitHub owners. JFrog's inventory as of 26 October covers 25 package names, including benign decoys. _Why it matters:_ check your lockfiles and SBOMs for package names ending in `-testmetest`, and remember that malware does not always need an install script.

**eMudhra, continued: CA bundles are components (28 October).** A researcher [reported](https://emudhra.we-have-a-problem.com/apple.html) that the macOS update released on 26 October protected Safari and apps built on Apple's networking stack, but left the CA bundle used by command-line tools such as git, curl and python3 still trusting the compromised eMudhra intermediates. We have not independently confirmed Apple's current status. ([HN discussion](https://news.ycombinator.com/item?id=50271640)) Separately, Dependency-Track 5.2.1, released on 25 October, removed eMudhra from the CA certificates in its container image. _Why it matters:_ every runtime and image carries its own trust store, and only a component inventory finds them all.

**Also worth a look:**

- **EDK II CVE-2026-97631:** a [pre-boot RCE](https://www.openwall.com/lists/oss-security/2026/10/28/4) in the PXE network-boot driver of the open-source UEFI code that most firmware is built from (28 October). Firmware SBOMs, where you can get them, are the only way to know which EDK II you ship. ([THN](https://thehackernews.com/2026/10/critical-16-year-old-uefi-flaw-can-run.html))
- **Linux CVE-2026-98432:** a TCP flaw that the kernel CVE team rates 9.8. Anthropic said on 27 October that its AI model wrote an exploit for it. ([THN](https://thehackernews.com/2026/10/linux-kernel-tcp-flaw-with-98-cvss.html))
- **GoAhead:** the embedded web server loaded certificate revocation lists but never switched revocation checking on in its OpenSSL backend (27 October). ([THN](https://thehackernews.com/2026/10/goahead-tls-flaws-allow-revoked-client.html))
- **Malicious AI models:** Pluto Security reported 31 malicious Hugging Face repositories abusing `trust_remote_code` for crypto-mining (29 October, as reported by [BleepingComputer](https://www.bleepingcomputer.com/news/security/hugging-face-malware-campaign-returns-to-hijack-gpus-for-crypto-mining/)). Models are dependencies too.

The other KEV additions in the window were Adobe Commerce/Magento (CVE-2026-48356), VMware ESX (CVE-2026-41709) and Cisco ASA/FTD (CVE-2026-76418).

## CRA: a quiet week

We found no new Commission act, ENISA publication or national CRA law dated in the window. The status, for the record:

- **Single Reporting Platform.** The [SRP](/2026/09/10/cra-single-reporting-platform-enisa-srp/) is still on v1.2.1, and the [FAQ](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions) is still dated 15 October. It confirms there is no API yet. It also describes a known issue: the 72-hour counter is calculated from the 24-hour early warning, so a notification can show as overdue early. Track your own deadlines from the moment you became aware, not from the portal's countdown.
- **Harmonised standards.** CEN-CENELEC has announced nothing yet. Ratification of EN 40000-1-1 and EN 40000-1-2 is reportedly due on 2 November. The SBOM-relevant part, prEN 40000-1-3 on vulnerability handling, shows no public movement.
- **Germany.** The [CRA-Durchführungsgesetz](https://www.bsi.bund.de/DE/Service-Navi/Presse/Pressemitteilungen/Presse2026/261020_CRA-Durchf%C3%BChrungsgesetz.html) still needs the Bundesrat. Its next plenary is reportedly on 20 November.
- **Open-source stewards.** The Eclipse ORC Cyber Resilience SIG's [26 October agenda](https://github.com/orcwg/orcwg/blob/main/cyber-resilience-sig/minutes/2026-10-26-mom-cyber-resilience-sig.md) includes last week's ENISA Technical Advisory for SBOMs. No minutes have been posted yet.

See our [CRA compliance guide](/compliance/eu-cra/) for the full timeline.

## NIS2: also quiet

Nothing new in the window. France's NIS2 bill is still off the Assemblée nationale agenda, Ireland has still not introduced its bill, and the European Parliament has not yet adopted a position on the Digital Omnibus cyber-reporting changes that the Council agreed on 21 October. No vote date has been set for the Cybersecurity Act revision in the ITRE committee. Our [NIS2 page](/compliance/eu-nis2/) has the background.

## CISA and US regulators

**NIST finalises IR 8547 on the post-quantum transition (27 October).** [NIST IR 8547](https://csrc.nist.gov/pubs/ir/8547/final), first published in draft in November 2024, sets out how quantum-vulnerable public-key algorithms such as RSA and elliptic-curve schemes will be deprecated after 2030 and disallowed after 2035. NIST tells organisations to start with cryptographic inventories. ([NIST news](https://www.nist.gov/news-events/news/2026/10/nist-report-provides-guidelines-transition-post-quantum-cryptography)) _Why it matters:_ this is the timeline behind the federal migration plans required by OMB M-26-15. The report does not use the term CBOM, but a [cryptographic bill of materials](/faq/what-is-a-cbom/) is the obvious way to deliver the inventory it asks for.

**CISA publishes "CISA 2030: Defend, Harden, Prevail" (26 October).** The [new strategy](https://www.cisa.gov/news-events/news/cisa-unveils-new-strategy-strengthen-national-cyber-defense-and-critical-infrastructure-security) includes an objective to "position software security as a strategic advantage" and to develop guidance on "software security and supply chain transparency". It does not mention SBOM or VEX by name. An implementation plan is due within 180 days; that is where any concrete SBOM work would appear.

**DHS orders Acronis products out of federal civilian systems (30 October).** A [Federal Register notice](https://www.federalregister.gov/documents/2026/10/30/2026-22215/notice-of-order-regarding-exclusion-and-removal-of-acronis-products-from-federal-civilian-executive) published an order under the Federal Acquisition Supply Chain Security Act (FASCSA) excluding Acronis products from federal civilian procurements and requiring their removal from agency systems. _Why it matters:_ removal orders like this reach products supplied "directly or indirectly". Finding an embedded or OEM component across an estate is an inventory problem, and supplier SBOMs are how you solve it.

**FCC.** The proposed rule requiring signed software and hardware bills of materials with country of origin is still not final. It does not appear to be on the 19 November open-meeting agenda.

## Other regulators

A quiet week. We found nothing new on SBOM, CBOM, VEX or AIBOM requirements from BSI, the UK NCSC, Japan's METI, CERT-In, the ASD, Canada's CCCS, Singapore's CSA or the G7.

## Standards

**SPDX.** No releases this week; 3.1 is still at RC1. The SPDX 3 model [added a `followsProcess` relationship](https://github.com/spdx/spdx-3-model/pull/1457) on 27 October, for linking a manufacturing action to the process it follows. That is more hardware-provenance work. On 29 October, documentation fixes corrected the constraint text in the Security profile's VEX relationship classes. Worth knowing if you validate SPDX VEX.

**CycloneDX and Ecma TC54.** No 2.0 release candidate yet. The latest release is still 1.7.2, and the [2.0 umbrella PR](https://github.com/CycloneDX/specification/pull/652) remains open. Work continued on the 2.0 development branch. On master, the cryptography registry used for CBOMs [gained EAX](https://github.com/CycloneDX/specification/pull/1099) and further fixes on 29 October. No TC54 minutes or agendas were posted in the window, so the outcome of the 15 October meeting is still not public.

**PURL and VERS.** No releases. ECMA-427 picked up editorial clarifications ahead of the December General Assembly, and purl-spec [incorporated the case-sensitivity clarification](https://github.com/package-url/purl-spec/pull/1047) on 26 October. Two practical changes: the type definitions' `$id` fields [moved from `types/` to `purl-types/`](https://github.com/package-url/purl-spec/pull/1049), and the `vcpkg` type [gained a `vcs_url` qualifier](https://github.com/package-url/purl-spec/pull/1044). Tools that validate against the PURL type schemas should check the new paths.

**TEA.** Quiet.

## The wider landscape

- **[Dependency-Track 5.2.1 and 4.14.6](https://github.com/DependencyTrack/dependency-track/releases/tag/5.2.1) (25 October):** bug-fix releases, including a fix for an ineffective access-control check on the findings analysis endpoint and for BOM validation of XML with CDATA. Patch for the access-control fix.
- **[cyclonedx-core-java 13.4.0](https://github.com/CycloneDX/cyclonedx-core-java/releases/tag/cyclonedx-core-java-13.4.0) (24 October):** drops its dependency on packageurl-java, a breaking change for anything that relied on it transitively.
- **[cyclonedx-python 7.6.0](https://github.com/CycloneDX/cyclonedx-python/releases/tag/v7.6.0) (28 October):** adds an option to ignore the parent environment's PYTHON\* variables, which makes generated SBOMs more reproducible.
- **GitHub Dependabot reachability (28 October):** [public preview](https://github.blog/changelog/2026-10-28-prioritize-dependabot-alerts-with-reachability-analysis) for JavaScript and TypeScript, labelling alerts by whether the vulnerable code is reachable. These labels are close to VEX justifications, though GitHub does not mention exporting them as VEX.
- **OpenSSF:** no new posts in the window; the new SBOM & VEX Working Group is still at the sandbox stage.
- **Research:** Jukka Ruohonen's ["The Policies of Programming Language Ecosystems"](https://arxiv.org/abs/2610.34187) (submitted 25 October) compares policies across eight package ecosystems and finds more divergence than convergence.

**No SBOM devroom at FOSDEM 2027.** FOSDEM [announced its accepted developer rooms](https://fosdem.org/2027/news/accepted-developer-rooms/) on 21 October: 77 of 128 proposals made it, and for the first time in several years there is no dedicated SBOM room (2026 had [SBOMs and Supply Chains](https://fosdem.org/2026/schedule/track/sboms-and-supply-chains/)). Adjacent rooms did make the cut, including "Beyond the CRA - Building Secure and Resilient Open Source", Package Management, Security, and Open Source & EU Policy. Expect the dedicated SBOM conversations to move to the fringe events around FOSDEM week instead. _Why it matters:_ if you were planning to submit an SBOM talk for 30–31 January, aim for those adjacent rooms or the fringe.

## From the sbomify desk

This column normally leaves out vendor news, ours included. This section is the exception, and it is labelled as such.

**After the SBOM.** On 28 October Viktor Petersson spoke at the [DevSecOps London Gathering](https://www.meetup.com/devsecops-london-gathering/events/316267481/) on "You've Generated Your SBOM. Now What?" ([slides](https://vpetersson.com/presentations/2026/DevSecOps-London-2026.pdf)). The first half covered generation done properly: not one tool pointed at `requirements.txt`, but a pipeline of creation, augmentation, enrichment and signing, with transitive dependencies kept apart from primary ones. The second half covered what comes after. That means modelling products as the many components they are made of, tying SBOMs to releases, monitoring them for new CVEs, telling customers about your security posture through a trust center, and using agents to help with triage. The CRA framing is simple: produce an SBOM for every product, archive one per release, monitor for vulnerabilities, and report the ones that are actively exploited. This week's PHP and Brotli stories show why the second half is the hard part.

**A pet peeve: SBOMs altered after CI.** A growing category of products takes the SBOM your build produced and "improves" it afterwards: rewriting components, adding guessed versions, dropping what it does not recognise. Call them unicorn fart products. Whatever comes out is no longer a record of what was built. It is no longer bound to the artifact by hash, and nobody can reproduce it from the source. Last week's ENISA advisory recommends build-time generation and binding each SBOM to its artifact by hash or immutable digest. Enrichment is fine when it happens in the pipeline, before signing, and is recorded with everything else. Silent edits downstream are not.

**Trust centers are becoming the distribution channel.** Customers increasingly expect one place to fetch SBOMs, VEX, security advisories and compliance documents, rather than an email thread per request. With CRA vulnerability reporting live and advisories like Palo Alto's setting expectations, a [trust center](/faq/what-is-a-trust-center/) that publishes [security advisories](/faq/what-is-a-security-advisory/) alongside SBOMs is quickly becoming the baseline.

**Releases since last week:**

- **[sbomify v26.10.0](https://github.com/sbomify/sbomify/releases/tag/v26.10.0) (24 October):** a deduplicated Vulnerabilities page, a VEX approval queue where AI agents propose rulings and a person approves them, a read-only Operator role, editable per-product advisory statuses, and CycloneDX VEX scoped to a CPE. Self-hosters should read the upgrade notes first: the token-hashing migration cannot be rolled back.
- **[sbomify-action v26.10.0 to v26.10.3](https://github.com/sbomify/sbomify-action/releases) (22–29 October):** SBOM generation for PlatformIO projects, build tooling bumped to drop trust in the compromised emSign (eMudhra) CA, sanitised log output, and a fix so SPDX overrides are written to the described root package rather than the first package in the list.

## What to watch next week

- Whether CEN-CENELEC confirms the EN 40000-1-1 and 1-2 ratification, reportedly due on 2 November.
- More vendor advisories for embedded PHP and Brotli, and whether they come with CSAF or VEX.
- Whether Apple updates the macOS command-line CA bundle.
- TC54 minutes from the 15 October meeting, and any CycloneDX 2.0 release candidate.
- The draft Bundesrat agenda for 20 November, and whether the German CRA act is on it.

_This Week in SBOMs covers regulation, standards and the open-source landscape. It deliberately leaves out vendor product and marketing news, but covers vendors' own security incidents. Spotted something we missed? Let us know._
