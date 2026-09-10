---

title: "The CRA Single Reporting Platform Opens Tomorrow: What ENISA Actually Requires"
description: "ENISA's CRA Single Reporting Platform goes live on 11 September 2026 with Article 14 reporting obligations. Registration, Assigned Representative roles, the 24/72-hour clocks, CSIRT selection, and the fields you will be typing."
keywords: "CRA Single Reporting Platform, ENISA SRP, CRA SRP registration, CRA reporting obligations, CRA Article 14, actively exploited vulnerability reporting, CRA severe incident, CSIRT designated as coordinator, EU Login SRP, CRA 11 September 2026"
categories:
  - compliance
tags: [sbom, cra, enisa, srp, compliance, eu, vulnerability-reporting, incident-reporting]
tldr: "From 11 September 2026, manufacturers of products with digital elements must report actively exploited vulnerabilities and severe incidents through ENISA's CRA Single Reporting Platform at portal.cra-srp.enisa.europa.eu. You log in with an EU Login account with MFA, register as a Primary or Secondary Assigned Representative, and pick the CSIRT designated as coordinator yourself - pick the wrong one and the notification can be invalidated. The clocks are 24 hours, 72 hours, and a final report at 14 days or one month. There is no API at launch, the platform is English-only, voluntary reporting is not implemented yet, and open-source software stewards are not in scope until 11 December 2027."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
faq:
  - question: "What is the CRA Single Reporting Platform (SRP)?"
    answer: "The CRA Single Reporting Platform is an online tool operated by ENISA under Article 16(1) of the Cyber Resilience Act. Manufacturers and, later, open-source software stewards use it to report actively exploited vulnerabilities and severe incidents once, rather than notifying each national authority separately. A submitted notification is made available to ENISA simultaneously, while the CSIRT designated as coordinator that receives it disseminates it to other relevant CSIRTs and to market surveillance authorities."
  - question: "Where is the CRA Single Reporting Platform and how do I log in?"
    answer: "The platform is at https://portal.cra-srp.enisa.europa.eu, available from 11 September 2026. Select 'Assigned Representative' and sign in with an EU Login account that has multi-factor authentication enabled. EU Login accounts are personal, so each Assigned Representative submitting notifications uses their own. There is no separate corporate authentication mechanism."
  - question: "When do CRA reporting obligations start?"
    answer: "The Article 14 reporting obligations apply to manufacturers of products with digital elements from 11 September 2026. The corresponding obligations for open-source software stewards under Article 24(3) apply from 11 December 2027, in accordance with Article 71(2) of the CRA."
  - question: "What are the CRA reporting deadlines?"
    answer: "An early warning without undue delay and in any case within 24 hours of becoming aware; an actively exploited vulnerability or severe incident notification within 72 hours, with general information and an initial assessment; and a final report no later than 14 days after a corrective measure becomes available for vulnerabilities, or within one month of the 72-hour notification for severe incidents."
  - question: "Which national CSIRT do I report to under the CRA?"
    answer: "You select the CSIRT designated as coordinator yourself, and you are responsible for identifying the correct one under Article 14(7). In general it is the CSIRT of the Member State of your main establishment in the EU, meaning where decisions about the cybersecurity of your products are predominantly taken. If that cannot be determined, use the Member State where your EU establishment has the most employees. If you have no EU establishment, ENISA gives a fallback order: authorised representative, then importer, then distributor, then highest number of users. Selecting the wrong coordinator can invalidate the notification and force a resubmission."
  - question: "Does the CRA Single Reporting Platform have an API?"
    answer: "No. ENISA states that no Application Programming Interface will be provided at the initial release, so notifications must be submitted through the platform interface. API functionality may be considered in a future phase. You can automate everything up to the point of submission, but a person types the final form into a browser."
  - question: "Do open-source software stewards have to report through the SRP?"
    answer: "Not yet. Open-source software stewards fall under Article 24(3), which applies from 11 December 2027 under Article 71(2). At launch the platform supports only mandatory notifications from manufacturers under Article 14."
  - question: "Can I report a vulnerability that is not actively exploited?"
    answer: "Not through the SRP at launch. Voluntary reporting under Article 15 has not been implemented yet and will come in a later phase. Only mandatory notifications of actively exploited vulnerabilities and severe incidents under Article 14(3) can currently be submitted. If you are not a manufacturer and want to report a vulnerability, ENISA directs you to contact the relevant national CSIRT directly; a submission made through the SRP may be marked invalid."
date: 2026-09-10
slug: cra-single-reporting-platform-enisa-srp
---

Tomorrow, the [Cyber Resilience Act](/compliance/eu-cra/)'s reporting obligations stop being a date on a slide. From **11 September 2026**, manufacturers of products with digital elements must notify actively exploited vulnerabilities and severe incidents, and the machinery for doing so - ENISA's **Single Reporting Platform (SRP)** - opens at [portal.cra-srp.enisa.europa.eu](https://portal.cra-srp.enisa.europa.eu).

ENISA has been publishing steadily through the summer: a [factsheet](https://www.enisa.europa.eu/sites/default/files/2026-07/ENISA_CRA_SRP_Factsheet_v1.0_0.pdf), a [glossary of every reporting field](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/cra-srp-glossary2), step-by-step guidance for Assigned Representatives, and a [FAQ that was updated as recently as 9 September](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions). Between them they answer most of the operational questions, and several answers are not what teams assume.

Here is what the official material says, and what it means if you are the person who will actually be filling in the form.

## What the SRP Is

Article 16(1) of the [CRA](https://eur-lex.europa.eu/eli/reg/2024/2847/oj) requires ENISA to establish a single reporting platform and run its day-to-day operations, so that manufacturers report once instead of notifying each Member State separately.

Mechanically, that means:

1. You submit a notification and select the **CSIRT designated as coordinator** (CDaC).
2. The notification is **simultaneously made available to ENISA** - unless particularly exceptional circumstances apply, more on which below.
3. The receiving CDaC disseminates it without delay to the CSIRTs of other Member States where the product is available.
4. National CSIRTs share some of that information with their **market surveillance authorities**, who hold the enforcement powers.

Note the direction of travel. You do not report _to ENISA_; ENISA runs the pipe. The authority that receives your notification and decides what happens to it is a national CSIRT, and the authority that can fine you sits downstream of that.

**Only one notification is required per event**, even if you have multiple EU branches or subsidiaries and a parent company outside the EU. ENISA is explicit that coordinating internally so exactly one notification goes out is the manufacturer's problem, not the platform's.

## Who Reports, and Who Does Not Yet

This is where the launch scope is narrower than the regulation.

| Who                             | Legal basis   | Status on 11 September 2026                                                            |
| ------------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| Manufacturers                   | Article 14    | **In scope now.** Mandatory reporting through the SRP                                  |
| Open-source software stewards   | Article 24(3) | Not until **11 December 2027**, per Article 71(2)                                      |
| Anyone, voluntary notifications | Article 15    | **Not implemented at launch.** Coming in a later phase                                 |
| Non-manufacturers               | -             | Contact your national CSIRT directly; an SRP submission "might be marked as 'invalid'" |

So if you are a steward of an open-source project, you have another fifteen months. If you are a researcher or a downstream user wanting to flag something, the SRP is not your channel yet.

## What Has To Be Reported

Two categories, and both have definitions with teeth:

- **Actively exploited vulnerabilities (AEV)** - a vulnerability for which there is reliable evidence that a malicious actor has exploited it in a system without the owner's permission (Article 3(42)).
- **Severe incidents (SI)** - an incident that negatively affects, or is capable of negatively affecting, a product's ability to protect the availability, authenticity, integrity or confidentiality of data or functions (Article 3(44)), where the severity criteria in Article 14(5) are met.

For interpretation of what "becoming aware" means in practice, ENISA points at Section 5 of the Commission's [FAQs on the CRA Implementation](https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act-implementation-frequently-asked-questions) and Section 9.1 of its [July 2026 guidance](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation) rather than answering itself.

## The Clocks

| Stage                                           | Deadline                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| Early warning                                   | Without undue delay, and within **24 hours** of becoming aware          |
| AEV / severe incident notification              | Within **72 hours**, with general information and an initial assessment |
| Final report - actively exploited vulnerability | No later than **14 days** after a corrective measure is available       |
| Final report - severe incident                  | Within **1 month** of the 72-hour notification                          |

The clock starts when you become aware, not when you finish triaging.

**One quirk worth knowing before it bites you.** ENISA documents that in the current release, the 72-hour counter in the platform displays a due date **48 hours after you submit the 24-hour early warning**, not 72 hours after you became aware. If you submit your early warning at hour 20, the platform will show your 72-hour notification as due at hour 68 and may flag it overdue before the legal deadline has passed. ENISA says this will be recalculated from the "date/time when you became aware" field in a future release.

Two consequences. First, do not use the platform's counter as your compliance clock - track the real one internally. Second, the counters exist to drive reminder emails, and ENISA is careful to say they "do not replace the responsibility" to meet the Article 14 timelines.

For final reports, there is currently **no counter at all for AEVs**, because the deadline depends on when your corrective measure ships - a date the platform cannot know in advance. Severe incidents get a counter set one month after the 72-hour notification.

## Registration: EU Login, and the AR Model

You cannot register a company. You register **people**.

Assigned Representatives (ARs) sign in with an **EU Login account with multi-factor authentication enabled**. Accounts can be created in advance at [ecas.ec.europa.eu](https://ecas.ec.europa.eu/cas/login). ENISA states there is no additional corporate entity authentication mechanism, and that EU Login accounts are personal - so the people who will submit notifications need their own, not a shared mailbox login.

There are two roles:

| Role             | How you get it                                                             | Can do                                                                                   | Can see                                          |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Primary AR**   | Registers directly, selects the CDaC, creates the manufacturer association | Submit and update notifications, manage the association, invite and remove Secondary ARs | All notifications for the manufacturer           |
| **Secondary AR** | Invited by the Primary AR, confirms pre-filled manufacturer information    | Submit and update notifications                                                          | Only the notifications they submitted themselves |

**One Primary AR per manufacturer, up to 20 Secondary ARs.** The Primary must have a _verified_ AR-manufacturer association before it can invite anyone. A Secondary AR may claim the Primary role, but that goes to the designated CSIRT for review and approval. Current role and association status live under **Settings > Association Management**.

The association itself is validated by the designated CSIRT, and ENISA is upfront that the procedure and processing time **vary between CSIRTs**. Two mitigations are built in:

- Verification happens **in parallel** with reporting - a pending association does not block submission.
- An AR whose association is not yet verified may submit **up to 20 notifications** before verification becomes mandatory.

ENISA's own advice cuts against the instinct to get registered early: to limit CSIRT validation workload, manufacturers are advised to "register and initiate the validation process only when they need to submit a notification." Registration takes a few minutes if the EU Login account already exists.

That is a defensible reading of the platform's design, and we would still argue for splitting the difference: **create the EU Login accounts now, decide who your Primary and Secondary ARs are now, and leave the SRP registration itself until you need it.** The EU Login step is the one with an unknown-length tail (personal accounts, MFA enrolment, people on leave), and it is the one ENISA explicitly says you can do in advance.

## Picking the Right CSIRT Is Your Job

The platform does not route for you, and getting it wrong has a cost. ENISA: "If the wrong CDaC is selected, the notification may be invalidated and will need to be resubmitted to the correct CDaC." Inside a 24-hour window, a resubmission is not a formality.

Article 14(7) gives a cascade. Work down it in order:

| Order | Test                                                                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | The Member State of your **main establishment** - where decisions about the cybersecurity of your products with digital elements are predominantly taken |
| 2     | If that cannot be determined: the Member State where your EU establishment has the **highest number of employees**                                       |
| 3     | No EU establishment: where your **authorised representative** acts for the highest number of your products                                               |
| 4     | Failing that: where the **importer** places the highest number of your products on the market                                                            |
| 5     | Failing that: where the **distributor** makes the highest number of your products available                                                              |
| 6     | Failing all of the above: the Member State with the **highest number of users** of your products                                                         |

Note that step 1 is not "where you are headquartered" and not "where engineering sits." It is where cybersecurity decisions are predominantly taken. For a distributed company that is a determination worth making in writing, once, in advance - and recording, because you will need to justify it if it is ever questioned. ENISA publishes the [list of CSIRTs designated as coordinators](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/list-of-csirts-designated-as-coordinators) so you can map the answer to an actual entry in the dropdown.

## What You Will Be Typing

ENISA's [SRP Glossary](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/cra-srp-glossary2) documents 43 fields with their meaning, format, and the stage at which each applies. Fields are marked required, optional, mandatory if the information is available, or carried forward from a previous stage.

The early warning is deliberately thin. Here is what is **required at the 24-hour mark**:

| Field                                        | Notes                                      |
| -------------------------------------------- | ------------------------------------------ |
| Notification type (vulnerability/incident)   | Determines which subsequent fields you see |
| Notification level (24h/72h/final)           | -                                          |
| Title and summary                            | -                                          |
| Manufacturer name                            | -                                          |
| **Product name**                             | -                                          |
| **Product version**                          | -                                          |
| Member States where the product is available | Required if the information is available   |
| Date/time you became aware                   | AEV and SI both                            |
| Unlawful or malicious acts suspected         | Severe incidents only                      |

Read that list again with an engineering eye. At the 24-hour mark, the regulator is not asking for your root cause analysis. It is asking **which product, which version, and which Member States**. Those are inventory questions, and they are the ones that go badly when the answer lives in three spreadsheets and a release engineer's memory.

The 72-hour notification adds general information about the vulnerability or the nature of the incident, an initial assessment, considered sensitivity of the information, and - now required - **corrective or mitigating measures taken, and measures users can take**. The final report is where the detailed severity and impact descriptions, the malicious actor where known, and the date the corrective measure became available all land.

Fields that stay optional throughout are worth noting too, because they are where SBOM data would go if you have it: **component name**, CVE ID, EUVD ID, and attack vector. Optional to ENISA. Extremely useful to the CSIRT reading it at 3am, and to you when the same component turns up in the next notification.

## Two Things That Are Not There

**No API.** ENISA states plainly that no Application Programming Interface will be provided at the initial release, and that notifications must be submitted through the platform interface. Organisations "may automate their internal reporting workflows and integrate CRA reporting requirements into their own systems and databases" - everything up to submission. API functionality "may be considered in a future phase."

The practical effect: your integration work does not shorten the critical path. Your **data quality** does. A human will be reading a field off a screen and typing it into a browser, and the only question that matters is whether that screen already says "these four product versions ship the affected component."

**English only.** At launch the platform is available in English only. ENISA will progressively translate the factsheet and supporting materials into all EU languages, and will review platform translation in a later phase. If your incident response runbook assumes a local-language filing, it does not.

## Particularly Exceptional Circumstances

Article 16(2) lets the receiving CSIRT delay or withhold dissemination of a notification to other Member States, including at the manufacturer's request. [Commission Delegated Regulation (EU) 2026/881](https://eur-lex.europa.eu/eli/reg_del/2026/881/oj/eng) of 11 December 2025 specifies the terms and conditions.

Operationally, ENISA says you should assess **during the 72-hour window** whether PEC applies, and it can only be invoked where at least one of the Article 16(2) conditions is met. When you actively mark PEC in the 72-hour notification, **ENISA receives only partial information** until the receiving CSIRT releases the full notification.

That is a genuine decision point with a deadline attached, and it is not one you want to be reading about for the first time at hour 70. Decide in advance who in your organisation is allowed to invoke it and on what basis.

## If the Platform Is Down

ENISA's answer is unambiguous and worth internalising: **wait, then submit**. If the SRP is temporarily unavailable, you submit the notification once it is back. If you judge that immediate communication is necessary in the meantime, you may contact your designated CSIRT directly - but the notification must **still** be submitted through the SRP once it is available again. A phone call does not discharge the obligation.

## Your Existing Backlog

Three clarifications from ENISA's FAQ, all of which route to the Commission's implementation FAQ for the legal detail:

- **Products placed on the market before the CRA.** The Article 14 obligations apply from 11 September 2026 to all products with digital elements within CRA scope, including products placed on the market before 11 December 2027 (Commission FAQ subsection 5.3).
- **No retroactive reporting.** You are not required to report an actively exploited vulnerability where you were **already aware of the active exploitation** before 11 September 2026. But if you become aware of the exploitation after that date, the obligation applies - including where the underlying vulnerability was already known to you (subsections 5.1 and 5.3).
- **Third-party components.** Where an actively exploited vulnerability in your product originates from a third-party component, ENISA refers you to Section 5.4 of the Commission's FAQ. The July 2026 Commission guidance elaborates: if the vulnerable code cannot be exploited in your product, or has not been exploited in it, it is not an actively exploited vulnerability contained in your product - and mandatory reporting does not bite.

That last one is a reachability determination with a legal consequence attached, and it is the shape of a [VEX](/faq/how-do-i-use-vex/) statement. Making it credibly in 24 hours means having both an SBOM you trust and an analysis you can defend afterwards.

## What This Means for SBOM Practice

Nothing in the SRP mentions SBOMs. The CRA's SBOM obligation lives in Annex I Part II and does not bind until 11 December 2027. So why does a reporting platform matter to an SBOM programme?

Because the reporting obligation lands **fifteen months before** the documentation obligation, and it asks the harder question first.

Annex I asks _do you have an SBOM_. Article 14 asks _which of your products and versions contain this component, and can you say so within 24 hours_. The second question is answerable only if you have been treating SBOMs as a queryable archive of every shipped version rather than a file generated at release time and forgotten. From tomorrow, the gap between those two postures has a deadline and a fine attached - up to EUR 15,000,000 or 2.5% of worldwide annual turnover under Article 64(2) for breaches of the Article 14 obligations.

Three things follow:

1. **Version-level SBOM coverage of what is in the field**, not just what is on `main`. The 24-hour field is "product version," singular, and you may need several rows.
2. **Continuous matching against vulnerability intelligence**, so "is this being exploited in something we ship?" is a query rather than a project.
3. **A reachability answer per affected product**, because the Commission has made "is the vulnerable code reachable" the difference between a mandatory notification and a voluntary one.

## Before Tomorrow

1. **Create EU Login accounts with MFA** for everyone who might submit. This is the step with the unpredictable tail, and the one ENISA says you can do in advance.
2. **Name your Primary AR and your Secondary ARs.** One Primary, up to 20 Secondaries. Decide the succession now, not while the Primary is on a plane.
3. **Determine and write down your CSIRT designated as coordinator** using the Article 14(7) cascade. Wrong choice, invalidated notification.
4. **Track your own 24/72-hour clocks internally.** The platform's 72-hour counter currently runs from your early-warning submission, not from awareness.
5. **Decide who can invoke PEC**, and on what grounds, before you need to.
6. **Make sure "which versions ship component X" is a query.** Everything else on this list is paperwork you can do in an afternoon. This one is not.

## How sbomify Helps

sbomify generates SBOMs automatically in CI/CD with the [sbomify GitHub Action](https://github.com/sbomify/sbomify-action) and keeps one per product version in a queryable archive, which is the shape the 24-hour field wants. Components are continuously matched against vulnerability data, so the "which of our releases contain this?" step is a lookup rather than an investigation, and [VEX statements](/faq/how-do-i-use-vex/) let you record the reachability determination that decides whether a notification is mandatory at all.

Our [CRA Compliance Wizard](/faq/how-do-i-use-cra-compliance/) tracks ENISA SRP registration status alongside your CSIRT contact and vulnerability-handling setup, and grades each uploaded SBOM against [BSI TR-03183-2](/compliance/bsi-tr-03183/) so the December 2027 obligation is not a second scramble. On the intake side, every [Trust Center](/faq/what-is-a-trust-center/) can publish an RFC 9116 `security.txt`, because a 24-hour clock that starts late because a researcher could not find your contact address is still a 24-hour clock.

## Official Sources

- [ENISA: CRA Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp)
- [ENISA: CRA SRP Frequently Asked Questions](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions) (updated 9 September 2026)
- [ENISA: CRA Single Reporting Platform Factsheet v1.0](https://www.enisa.europa.eu/sites/default/files/2026-07/ENISA_CRA_SRP_Factsheet_v1.0_0.pdf) (PDF)
- [ENISA: CRA SRP Glossary](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/cra-srp-glossary2)
- [ENISA: List of CSIRTs designated as coordinators](https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/list-of-csirts-designated-as-coordinators)
- [CRA SRP portal](https://portal.cra-srp.enisa.europa.eu) - live from 11 September 2026
- [Regulation (EU) 2024/2847 (Cyber Resilience Act)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [Commission Delegated Regulation (EU) 2026/881](https://eur-lex.europa.eu/eli/reg_del/2026/881/oj/eng) - delaying dissemination of notifications
- [European Commission: CRA reporting obligations](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)
- [European Commission: FAQs on the CRA Implementation](https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act-implementation-frequently-asked-questions)
- [European Commission: CRA implementation guidance, C(2026) 5252 (27 July 2026)](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation)

ENISA runs a helpdesk for questions not covered by the published material, reachable at `cra-srp-helpdesk[@]enisa.europa.eu`.

Further reading: our [EU CRA compliance guide](/compliance/eu-cra/), the [BSI TR-03183 four-part update](/2026/08/20/bsi-tr-03183-four-parts-cra-update/), and [what the CRA means for device manufacturers](/2026/01/06/cra-explained-cyber-resilience-act-for-device-manufacturers/).
