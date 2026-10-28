---
title: "How do I triage vulnerabilities in sbomify?"
description: "Work through open vulnerabilities across your whole sbomify workspace: filter the list, hand fixes to a coding agent, record Not affected decisions that sbomify writes into VEX, and approve rulings on the Review tab."
answer: "Open Vulnerabilities in the sidebar to see what is open in every component, worst first. Filter by severity, product, component or urgency. For each finding, use Fix prompt to hand the upgrade to a coding agent, or Triage to record a decision such as Not affected with a justification. sbomify writes decisions into a VEX for the component, and rulings from an AI agent wait on the Review tab until someone approves them."
tldr: "The Vulnerabilities page is your workspace-wide triage queue. Filter it, fix what you can with a prompt for your coding agent, and record a decision for what does not affect you. Decisions become VEX automatically, and nothing is deleted: closed findings stay listed with their reason."
weight: 65
keywords: [vulnerability triage, triage vulnerabilities, VEX decision, not affected, CISA KEV, fix prompt, coding agent, sbomify vulnerabilities, VEX review]
url: /faq/how-do-i-triage-vulnerabilities/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/vulnerability_triage.webm" title="How to triage vulnerabilities in sbomify" description="Narrated screencast: filter the workspace Vulnerabilities page, generate a fix prompt for a coding agent, record a Not affected decision that sbomify writes into VEX, and approve AI agent rulings on the Review tab." upload_date="2026-10-28T00:00:00Z" >}}

## The Vulnerabilities page

Once [vulnerability scanning](/faq/how-do-i-enable-vulnerability-scanning/) is on, open **Vulnerabilities** in the sidebar. It lists what is open in every component, worst first. The cards at the top count each vulnerability once. See [How does sbomify count vulnerabilities?](/faq/how-does-sbomify-count-vulnerabilities/) for how that works.

To narrow the list:

- Filter by severity, product, component, or urgency (**Known exploited** or **Past fix deadline**)
- Search by advisory ID or package name
- Set the status filter to **Open** or **Closed by a decision**

Findings in the CISA Known Exploited Vulnerabilities (KEV) catalog are flagged, so you can start with the ones attackers actually use.

## Fix it, or ask an agent to

Open the actions menu on a row and choose **Fix prompt**. sbomify writes instructions for a coding agent, such as Claude Code or Cursor, to make that one upgrade. When an upgrade is not an option, switch to the **Triage** prompt, which asks the agent to judge the impact instead.

## Record a decision

When a vulnerability does not affect your product, record that:

1. Open the actions menu on the row and choose **Triage**
2. Under **Applies to**, choose this package, the entire component, or every component in the workspace
3. Pick a **State**, such as **Not affected**, and a **Justification**, such as **Code not reachable**
4. Add a short note on why the decision holds for this product, then click **Save decision**

sbomify writes the decision into a [VEX](/faq/how-do-i-use-vex/) for the component. The finding leaves the open list, and the counts drop. Nothing is deleted: switch the status filter to **Closed by a decision** to see it, with the reason attached.

## Approve rulings on the Review tab

Rulings from an AI agent, and VEX uploads sent for approval, do not apply on their own. They wait on the **Review** tab until someone signs off. Each submission shows the agent's reasoning, every ruling, and how many vulnerabilities it would hide. Click **Approve**, and the rulings apply. Decided submissions stay on record under **Decided**, with who approved them and when.

An agent sends rulings with an API token that has the **AI agent** scope. See [How do I create an API token?](/faq/how-do-i-create-an-api-token/).

## When a vulnerability does affect you

If the finding is real and your customers need to know, publish a [security advisory](/faq/how-do-i-publish-a-security-advisory/) to your Trust Center.

## Further reading

- [How do I enable vulnerability scanning?](/faq/how-do-i-enable-vulnerability-scanning/) - turn on the scanners that feed this page
- [How do I use VEX with sbomify?](/faq/how-do-i-use-vex/) - how decisions and uploaded VEX suppress findings
- [How does sbomify count vulnerabilities?](/faq/how-does-sbomify-count-vulnerabilities/) - what the numbers on the page mean
- [How do I publish a security advisory?](/faq/how-do-i-publish-a-security-advisory/) - tell customers about the ones that matter
