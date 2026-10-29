---
title: "How do I publish a security advisory in sbomify?"
description: "Write a security advisory in sbomify, track the fix on its timeline, and publish it to your Trust Center with a permanent tracking ID."
answer: "Open Security advisories in the sidebar and click Create advisory. A title is all a draft needs. Set the severity and status, pick the affected products and releases, and add the CVE, CVSS score and description if you have them. The advisory opens as a private draft. Post timeline updates as the fix moves along, then click Publish advisory, choose who can read it, and confirm. It gets a permanent tracking ID and appears on your Trust Center."
tldr: "Security advisories go from draft to published in one place. Drafts are private to your workspace, the timeline records every update, and publishing assigns a permanent tracking ID and puts the advisory on your public advisories page."
weight: 78
keywords: [security advisory, publish advisory, vulnerability disclosure, Trust Center advisories, CVE advisory, CRA disclosure, advisory timeline, sbomify advisories]
url: /faq/how-do-i-publish-a-security-advisory/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/security_advisories.webm" title="How to publish a security advisory in sbomify" description="Narrated screencast: create a security advisory, pick the affected releases, post a timeline update, publish it with a tracking ID, and see it on the public Trust Center advisories page." upload_date="2026-10-28T00:00:00Z" >}}

## Creating an advisory

**Security advisories** in the sidebar lists every advisory in the workspace, with its severity and status. To write a new one:

1. Click **Create advisory**
2. Give it a **Title**. That is all a draft needs
3. Set the **Severity**, and a **Status** for where the work stands now (for example **Investigating**)
4. Under **What it affects**, pick the products it touches. Open a product to choose specific releases
5. Under **What else is known**, add the **CVE or reference**, a **CVSS score**, and a short **Description** if you have them
6. Click **Create advisory**

The advisory opens as a draft. Only your workspace can see it.

Workspace owners and admins write and publish advisories. An API token with the **AI agent** scope can also create and edit drafts, but it cannot publish, withdraw, or delete them, so nothing it writes reaches your Trust Center until a person publishes it.

## Tracking the fix on the timeline

The advisory's **Timeline** records every change. As the fix moves along, write a note, choose **Note only** or a new status (for example **Fix in progress**), and click **Post update**. The update lands on the timeline, and the advisory's status moves with it. The statuses are Identified, Investigating, Fix in progress, Resolved, and Won't fix.

## Publishing it

When you are ready to disclose:

1. Click **Publish advisory**
2. Under **Who can read it**, choose **Public** (anyone can read it on your Trust Center) or **Gated** (only readers who have signed your NDA and can see an affected product)
3. Click **Publish**

The advisory now has a permanent tracking ID, and the tracking ID and disclosure date are recorded for good. It appears on your [Trust Center](/faq/how-do-i-set-up-a-trust-center/), and **View in Trust Center** takes you to it. Customers see it on your public advisories page, next to every advisory you have published.

## Further reading

- [How do AI agents work in sbomify?](/faq/how-do-ai-agents-work-in-sbomify/)
- [How do I triage vulnerabilities?](/faq/how-do-i-triage-vulnerabilities/) - decide which findings affect you before you disclose
- [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/) - where published advisories appear
- [How do I manage Trust Center access requests?](/faq/how-do-i-manage-trust-center-access-requests/) - how readers get access to gated content
- [How do I use CRA compliance in sbomify?](/faq/how-do-i-use-cra-compliance/) - the CRA assessment your disclosure policy comes from
