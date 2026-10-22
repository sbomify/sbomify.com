---

title: "This Week in SBOMs: PHP2Shell, a Wave of Poisoned Releases, and Germany Passes Its CRA Law"
description: "A month of SBOM news, 22 September to 22 October 2026: the PHP2Shell RCEs, LiteLLM and other poisoned releases, compromised eMudhra CA keys, national CRA implementation laws in Germany, Italy and France, ENISA SRP updates, NIS2 reporting reshaped by the Digital Omnibus, PURL and VERS approved by Ecma TC54, CycloneDX 2.0 proposals."
keywords: "This Week in SBOMs, SBOM news, PHP2Shell, CVE-2026-109618, CVE-2026-109619, LiteLLM compromise, eMudhra, CRA news, Cyber Resilience Act implementation, NIS2 transposition, ENISA SRP, CycloneDX 2.0, PURL ECMA-427, VERS, SPDX 3.1, CBOM, OMB M-26-15, CISA CVE quality"
categories:
  - news
tags: [sbom, this-week-in-sboms, php2shell, supply-chain, cra, nis2, cisa, spdx, cyclonedx, purl, vex, cbom]
tldr: "PHP2Shell, two unauthenticated PHP RCEs that were exploited before disclosure, prompted the first EU-level joint patch call since CRA reporting went live, and the hardest part was finding the PHP embedded in other products. LiteLLM, tensorlake, Rank Math and the OVHcloud CLI all shipped poisoned releases, several with valid provenance. Eight eMudhra intermediate CA keys were compromised, forcing emergency updates to every bundled trust store. Germany's Bundestag passed its CRA implementation act, making BSI the market surveillance authority, and Italy and France set out their own enforcement arrangements. ENISA shipped SRP v1.2.1 and updated the FAQ, which still says there is no API. The Council's Digital Omnibus position swaps the single EU incident entry point for national ones. Ecma TC54 approved PURL (ECMA-427 2nd Edition) and VERS for the December General Assembly. CycloneDX 2.0 proposals are moving forward, including a breaking rename of bom-ref to refId. US agencies' post-quantum migration plans, with crypto inventories, are due today under OMB M-26-15."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
date: 2026-10-23
slug: this-week-in-sboms-2026-10-23
---

Welcome to the inaugural **This Week in SBOMs**, a weekly survey of developments within software security, regulation and standards, viewed specifically through the lens of software transparency. As this is the initial edition, it encompasses a full month: **22 September to 22 October 2026**. Commencing next week, every issue will span seven days.

The brief summary: a severe PHP vulnerability demonstrated the necessity of understanding your operational stack's contents, a sequence of compromised releases illustrated that digital signatures do not guarantee trustworthiness, enforcement of the [Cyber Resilience Act](/compliance/eu-cra/) is proceeding nation-by-nation, SBOM identifiers are approaching Ecma standardisation, and the US is quietly converting cryptographic inventories into a federal requirement.

## The big one: PHP2Shell

**Two unauthenticated PHP remote code execution flaws, exploited prior to patching (21 October).** [CVE-2026-109618 and CVE-2026-109619](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/), colloquially termed PHP2Shell, both carry a CVSS score of 9.2:

- **CVE-2026-109618:** memory corruption occurring when out-of-memory handling disrupts request initialisation.
- **CVE-2026-109619:** a use-after-free incident where internal state leaks from one request to the subsequent one processed by the same worker.

These affect PHP-FPM, mod_php, php-cgi, FrankenPHP and LiteSpeed. With mod_php, the attack triggers before any application logic executes. Remediations are available in [8.5.12, 8.4.27, 8.3.36 and 8.2.35](https://www.php.net/archive/2026.php). No upstream updates exist for 8.1 and older versions, though the PHP team issued minimal source backports covering 7.4 through 8.1.

The CVE identifiers were exposed one day prior to the scheduled release, prompting an early patch deployment. Amazon [detected an exploitation attempt targeting its honeypots on 17 October](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/), four days before disclosure, and reports that the flaws are now widely exploited. As of today, they remain absent from CISA's KEV catalog.

**Why this constitutes an SBOM narrative.** Remediating your own PHP servers is straightforward. The challenge lies in managing PHP embedded within purchased products: appliances, control panels and vendor software. Fortinet, Plesk and Palo Alto have already issued advisories. The EU's [joint statement](https://digital-strategy.ec.europa.eu/en/news/joint-statement-critical-php-vulnerabilities) (addressed under CRA below) explicitly cautions against this concealed embedding. NCSC-NL monitors impacted third-party products via its [php2shell repository](https://github.com/NCSC-NL/php2shell), publishing the data as SPDX files. If your suppliers provide SBOMs and VEX statements, "are we affected?" becomes a query. Without them, it requires a week of correspondence.

## Security news that mattered

**A month of poisoned releases.** Four projects distributed malicious versions through their official channels:

- **[LiteLLM 1.107.0](https://docs.litellm.ai/blog/security-incident-oct-21-2026) (21 October):** Stolen GitHub CLI OAuth tokens were utilised to bypass branch protection and redirect the release workflow to a lookalike repository. The outcome was signed, Trusted Publishing-backed artifacts on PyPI, Docker Hub and GHCR containing a credential stealer that re-initialises upon every Python start. PyPI was impacted for approximately 1h45m, and Docker's `latest` tag for roughly 2.5 hours. Pin to 1.106.2 and rotate your secrets. ([THN](https://thehackernews.com/2026/10/litellm-compromised-in-supply-chain.html))
- **[tensorlake on npm](https://thehackernews.com/2026/10/tensorlake-npm-package-compromised-to.html) (8 October):** Version 0.5.144 distributed a Shai-Hulud worm variant via a hijacked maintainer identity, again with valid provenance.
- **[Rank Math SEO PRO 3.0.123](https://www.securityweek.com/rank-math-pro-wordpress-plugin-compromised-in-supply-chain-attack/) (15–16 October):** The WordPress plugin was trojanised at the vendor for approximately 11 hours (CVE-2026-111862).
- **[OVHcloud CLI](https://thehackernews.com/2026/10/hackers-hijack-five-ovhcloud-cli.html) (19 October):** Archives on five _existing_ releases were replaced with a secret stealer for 94 minutes.

The shared lesson is that provenance indicates which pipeline constructed an artifact, not whether it should be trusted. Version numbers alone proved insufficient: the OVHcloud and Rank Math incidents require hashes or download timestamps to determine "were we hit?". SBOMs recording digests, rather than just versions, justify their existence here.

**Eight eMudhra intermediate CA keys compromised (17–21 October).** Six TLS intermediates and two code-signing certificates featured [trivially recoverable keys](https://thehackernews.com/2026/10/eight-emudhra-ca-keys-compromised.html). Mozilla enforced blocks via OneCRL. Go, Node.js, Python's `certifi` and Perl's `Mozilla::CA` all distributed emergency trust-store patches. Each runtime environment and numerous utilities maintain their _own_ instance of the CA bundle, meaning only a full component inventory can locate them all.

**Node.js Brotli RCE (21 October).** The [October security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) addresses 10 CVEs, with the most severe being an out-of-bounds write in Node's _bundled_ Brotli decoder (CVE-2026-111497). Scanners limited to OS packages overlook vendored libraries like this; runtime and container SBOMs detect them.

**CI/CD under attack.** The [GhostAction campaign](https://thehackernews.com/2026/10/ghostaction-compromises-about-1900.html) used stolen tokens to push secret-extracting GitHub Actions workflows into repositories. Estimates vary from roughly 380 active targets to more than 30,000. Distinctly, GitHub [strengthened npm trusted publishing](https://thehackernews.com/2026/10/github-tightens-npm-publishing-after.html) following the "SlugFest" disclosure, revealing that trust depended on repository names and exposed over 1,500 packages. Bruce Schneier [published on 24 September](https://www.schneier.com/blog/archives/2026/09/malicious-npm-packages-that-evade-defenses.html) regarding npm packages designed to bypass install-time protections, and the rest of the month bore him out.

**Also worth patching:** two CVSS 10 RCEs within GitLab's regex compiler ([CVE-2026-110264](https://www.bleepingcomputer.com/news/security/gitlab-warns-of-new-max-severity-code-execution-vulnerability/) and CVE-2026-97229). CISA also incorporated longstanding open-source CVEs into KEV (Apache Struts CVE-2016-3081, BIND CVE-2015-5477), underscoring the longevity of legacy components.

## CRA: the national enforcement layer arrives

**Germany passes its CRA implementation act (15 October).** The Bundestag enacted the _CRA-Durchführungsgesetz_, and [BSI announced it](https://www.bsi.bund.de/DE/Service-Navi/Presse/Pressemitteilungen/Presse2026/261020_CRA-Durchf%C3%BChrungsgesetz.html) on 16 October. BSI assumes four functions: market surveillance authority, notifying authority for conformity assessment bodies, CSIRT appointed as coordinator, and consumer complaint handler. It gains the authority to mandate fixes, levy penalties and remove products. BSI also drafted [TR-03183](/2026/08/20/bsi-tr-03183-four-parts-cra-update/), Europe's most comprehensive SBOM technical guideline, positioning Germany as the likely first jurisdiction to enforce SBOM requirements. The legislation remains to be formally promulgated.

**Italy and France set out who enforces what.** On 2 October, Italy's Council of Ministers [granted preliminary consent](https://www.governo.it/it/articolo/comunicato-stampa-del-consiglio-dei-ministri-n-191/32740) to a CRA decree. It designates the national cybersecurity agency, ACN, as the notifying and market surveillance authority, establishes proportionate conformity-assessment charges for SMEs, and introduces a "Sandbox-CRA". In France, [ANSSI, ANFR and DGE](https://cyber.gouv.fr/actualites/cra-lanssi-lanfr-et-la-dge-accompagnent-les-fabricants-dans-la-conformite-des-produits-numeriques/) outlined the national framework. ANFR manages market surveillance, while ANSSI serves as the notifying authority and national CSIRT.

**ENISA keeps iterating on the Single Reporting Platform.** Six weeks after [the SRP launched](/2026/09/10/cra-single-reporting-platform-enisa-srp/), ENISA issued [v1.2.1 on 20 October](https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp) featuring a revised procedure for inviting secondary Assigned Representatives. The previous invitation method will function only briefly, so verify role assignments in your account. The [FAQ was revised on 15 October](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions) and continues to state that no API exists and voluntary reporting is unavailable. A modification to the calculation of the 72-hour window is scheduled for a future release.

**The first EU-level patch call of the CRA era.** On 21 October, the Commission, ENISA, CERT-EU, Europol's EC3 and the CSIRTs network released a [joint declaration on PHP2Shell](https://digital-strategy.ec.europa.eu/en/news/joint-statement-critical-php-vulnerabilities). In addition to remediation guidance, it reminds manufacturers that actively exploited flaws in their products, including embedded PHP, must now be reported via the SRP within 24 hours. For numerous manufacturers this will constitute their inaugural Article 14 notification.

**Harmonised standards: observe, do not yet rejoice.** It was [reported](https://compliance.globalnorm.de/en/product-compliance-news/detail/eu-cyber-resilience-act-cra-standards-en-40000-1-x-series/) that the inaugural horizontal standards, EN 40000-1-1 (vocabulary) and EN 40000-1-2 (principles), successfully passed their formal vote. CEN-CENELEC has yet to confirm this outcome, and these two components are not anticipated to provide presumption of conformity in isolation. The element critical for SBOMs, prEN 40000-1-3 regarding vulnerability management, remains under review.

**Funding for SMEs.** The EU-backed SECURE initiative launched a [second €11.5M call](https://www.secure4sme.eu/cascade-funding/second-open-call) on 1 October. It provides grants reaching €30k, with a 50% co-financing rate, for CRA preparation, and the application window closes on 11 December.

## NIS2: reporting gets redesigned, laggards still lag

**Council supports national portals for incident notification (21 October).** Within its [Digital Omnibus position](https://www.consilium.europa.eu/en/press/press-releases/2026/10/21/digital-rulebook-council-agrees-position-to-simplify-data-protection-privacy-and-cyber-reporting-rules/), the Council dismissed the Commission's proposal for a unified EU-level entry point for incidents under NIS2, GDPR, DORA and the Critical Entities Resilience Directive. It prefers a national portal in each Member State alongside an EU "information point". Trilogue negotiations commence once Parliament adopts a stance. How this resolution interacts with the CRA's ENISA-managed SRP warrants attention.

**Austria's NISG 2026 is active (1 October).** Roughly 4,000 entities fall within scope; reporting duties take effect immediately, and registration must be completed by year-end. As [Wolf Theiss notes](https://www.wolftheiss.com/insights/austrian-nis-2-implementation-acts-nisg-2026-and-nisv-2026-now-in-effect/), supply-chain security provisions, such as supplier agreements, constitute the most difficult aspect to satisfy.

**France and Ireland remain absent.** France's NIS2 legislation was [removed from the Assemblée nationale agenda again](https://www.leto.legal/news/assemblee-nationale-report-projet-loi-resilience-nis2-octobre-2026) on 6 October, three months after referral to the Court of Justice. Ireland's fresh [National Cyber Security Strategy 2030](https://assets.gov.ie/static/documents/3c7e136d/National_Cyber_Security_Strategy_2030.pdf) labels NIS2 transposition "a major cross-Government project", yet the bill [remains unpublished](https://www.lawsociety.ie/gazette/top-stories/2026/october/government-pledge-on-delayed-cyber-bill/). Spain constitutes the third holdout.

**Background to consider:** the [ENISA Threat Landscape 2026](https://www.enisa.europa.eu/news/exploring-the-evolution-of-the-cyber-threat-landscape-how-dependencies-weaken-our-digital-resilience) (22 September) indicates that dependencies and supply-chain breaches generated the most severe incidents. Over 48,000 CVEs were published in 2025, with 73% of targeted organisations classified as NIS2 essential or important entities.

## CISA and US regulators

Major US SBOM releases appeared just prior to this period: CISA's [2026 SBOM Minimum Elements](https://www.cisa.gov/sbom) (29 July), EO 14412 and OMB M-26-15 (June). The current month focused on implementation.

**Federal PQC migration schedules are due, requiring a cryptographic inventory.** [OMB M-26-15](https://www.whitehouse.gov/wp-content/uploads/2026/06/M-26-15-Execution-of-the-Migration-to-Post-Quantum-Cryptography.pdf) allotted agencies 120 days to submit post-quantum transition plans, a deadline falling approximately **22 October**. Per [secondary analysis](https://postquantum.com/security-pqc/omb-m-26-15-pqc-migration/), these plans must outline automated cryptographic inventory and supply a central cryptographic bill of materials (CBOM). CISA and NIST have until early 2027 to specify CBOM contents. Federal government suppliers should anticipate requests for cryptographic inventory data. Distinctly, NSA [announced PQC measures](https://www.executivegov.com/articles/nsa-post-quantum-cryptography-resources) for national security systems on 1 October, reaffirming the 2027 deadline for new products to support quantum-resistant algorithms.

**CISA on CVE quality (22–23 September).** CISA's whitepaper [_CVE Program: Establishing a Quality Era Framework_](https://www.cisa.gov/resources-tools/resources/cve-program-establishing-quality-era-framework) addresses governance and data integrity. As critics [highlighted](https://cyberscoop.com/cisa-cve-data-quality-white-paper-expert-reaction/), it fails to resolve the most pressing issue for SBOM users: numerous CVE records still lack machine-readable software identifiers such as a PURL. Without one, correlating an SBOM with vulnerabilities remains speculative.

**OT procurement gains an inventory clause (23 September).** An FBI/CISA [fact sheet for critical infrastructure operators collaborating with ICS integrators](https://www.cisa.gov/resources-tools/resources/considerations-critical-infrastructure-operators-working-third-party-ics-integrators) directs operators to request an inventory of all software and hardware supplied by an integrator, referencing the SBOM Minimum Elements.

**FCC: The chip embargo is active, yet the SBOM/HBOM requirement remains pending (for now).** The FCC regulation prohibiting the authorization of devices featuring chips from firms on its Covered List [became effective in mid-October](https://www.techtimes.com/articles/328987/20261014/fcc-rule-takes-effect-huawei-zte-chips-now-block-devices-us-authorization.htm). The [associated proposal](https://www.federalregister.gov/documents/2026/08/07/2026-16197/protecting-against-national-security-threats-to-the-communications-supply-chain-through-the) demands that applicants provide signed software and hardware bills of materials, detailing the country of origin for each component. Public comment periods have concluded, but no rule has been finalised; consequently, it remains the most definitive SBOM directive currently under review in the United States.

## Standards: SPDX, CycloneDX and the identifiers underneath

**PURL and VERS approved by Ecma TC54 (7 October).** Ecma TC54 voted to approve [ECMA-427 2nd Edition (PURL)](https://github.com/package-url/purl-spec/releases/tag/v1.1.0) and the [initial edition of VERS](https://github.com/package-url/vers-spec/releases/tag/v1.2.1) for presentation to the Ecma General Assembly in December. PURL serves to identify packages within both CycloneDX and SPDX, while VERS provides the version-range syntax required for vulnerability matching. Securing both as formal standards resolves numerous procurement queries regarding which identifier scheme to employ.

**CycloneDX 2.0 emerges.** The [15 October TC54 agenda](https://github.com/Ecma-TC54/meetings/blob/main/2026/2026-10-15-agenda.md) outlines several 2.0 proposals for advancement:

- a refactoring of the inventory coupled with a definitions registry
- EPSS and other scoring metrics based on measurements
- enhancements to AI models
- predefined perspectives
- renaming `bom-ref` to `refId`

This renaming constitutes a breaking change for any party parsing `bom-ref`. The project still [targets](https://cyclonedx.org/news/cyclonedx-v2.0-coming-soon/) a release this autumn and Ecma ratification in December. No release candidate exists at present. TC54 has also been developing the [Transparency Exchange API (TEA)](https://github.com/Ecma-TC54/ECMA-xxx-TEA) within the Ecma document format, though it lacks an Ecma number as yet.

**SPDX: 3.1 continues development, and the conformance checker adopts BSI.** SPDX 3.1 remains at RC1, yet the specification has continued to evolve. This month it integrated `AbstractPackage`, relationships defined by `hasInstall`/`hasUninstall`, and the obsolescence of `standardCompliance` in preference for `conformsTo`. An [SPDX 2.3.1](https://spdx.github.io/spdx-spec/v2.3.1/) rendering also surfaced without prior notice. The more pertinent development is [ntia-conformance-checker v6.0.0](https://github.com/spdx/ntia-conformance-checker/releases/tag/v6.0.0) (5 October). It introduces checks aligned with the BSI TR-03183-2 minimum elements and graph-based validation for SPDX 3, alongside shipping its own SBOM within the wheel per PEP 770.

**Open-source tooling, in brief:**

- **[OWASP cdxgen](https://github.com/CycloneDX/cdxgen/releases) versions 13.2 to 13.4:** AI-BOM coverage for model files, accurate post-quantum OIDs, CMake-based resolution for C/C++ dependencies, Terraform/OpenTofu SBOMs, and CBOM output validated against CycloneDX 1.7.
- **[cyclonedx-dotnet 6.3.0](https://github.com/CycloneDX/cyclonedx-dotnet/releases/tag/v6.3.0):** development dependencies are now included by default with `scope="excluded"`; verify your diffs accordingly.
- **[Dependency-Track 5.2.0](https://github.com/DependencyTrack/dependency-track/releases/tag/5.2.0):** limits on BOM/VEX upload sizes, service accounts, workload identity federation, and signed webhooks.

## The wider landscape

**OpenSSF establishes an SBOM & VEX Working Group.** The OpenSSF TAC approved a [new SBOM & VEX Working Group](https://github.com/ossf/tac/blob/main/process/wg-lifecycle-documents/SBOM_VEX_WG_sandbox_stage.md) at the sandbox stage. This was announced in the Linux Foundation's [October newsletter](https://www.linuxfoundation.org/blog/linux-foundation-newsletter-october-2026). During [Community Day Europe](https://openssf.org/press-release/2026/10/06/openssf-shares-expanded-membership-and-new-global-policy-resources-during-community-day-europe/) in Prague, OpenSSF also issued CRA resources for practitioners. Open Source Summit Europe featured several sessions heavy on SBOMs, including CRA readiness with SPDX 3 in Zephyr and a panel appropriately titled, "Possessing an SBOM Is Not Sufficient".

## What to watch next week

- Whether CEN-CENELEC validates the EN 40000-1-1/1-2 vote (ratification is reportedly scheduled until 2 November).
- Results from the 15 October TC54 gathering concerning CycloneDX 2.0 proposals.
- Whether France's NIS2 legislation returns to the Assemblée agenda.
- BSI's subsequent actions following the passage of the German CRA act.
- Whether PHP2Shell appears in CISA's KEV catalog, and the quantity of vendor VEX statements that emerge.

_This Week in SBOMs addresses regulation, standards, and the open-source landscape. It intentionally excludes vendor product and marketing updates but covers vendors' own security incidents. Noticed something we overlooked? Inform us._
