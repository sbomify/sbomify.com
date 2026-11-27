---
title: "How do AI agents work in sbomify?"
description: "sbomify is built for your own AI agents to do the legwork of CVE triage and security advisories. An agent token can read and propose, but a person approves every change before it takes effect."
answer: "Give your agent an API token with the AI agent scope. With it, the agent can read your workspace, pick up the fix and triage prompts sbomify writes, send VEX rulings for review, and draft and edit security advisories. It cannot apply a ruling, approve its own work, or publish, withdraw or delete an advisory. Its rulings wait on the Review tab, and its changes to a published advisory wait as proposals with a diff, until a person in your workspace approves or rejects them."
tldr: "Agents do the legwork, a person makes the call. An AI agent token can investigate and propose, but nothing it sends changes your vulnerabilities or reaches your Trust Center until someone on your team approves it."
weight: 41
keywords: [AI agent, sbomify AI, agent token, human in the loop, AI vulnerability triage, AI security advisory, VEX review, Claude Code, Cursor, coding agent, agent permissions]
url: /faq/how-do-ai-agents-work-in-sbomify/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/ai_agents.webm" title="Working with AI agents in sbomify, with a person in the loop" description="Narrated screencast: create an AI agent token, let an agent propose a VEX ruling and draft a security advisory through the API, see what it is not allowed to do, and approve its work as a person." upload_date="2026-10-29T00:00:00Z" >}}

## Agent first, with a person in the loop

sbomify does not bundle an AI model. It gives the agents you already use, such as Claude Code or Cursor, structured security data and an API built for them. They can do the slow part of the work: read a vulnerability in the context of your own code, decide whether it affects you, and write it up.

What they cannot do is make the decision on your behalf. Two kinds of work leave your team and reach customers: a ruling on a vulnerability, which feeds your VEX and your Trust Center, and a security advisory. For both, sbomify holds what an agent sends until a person approves it.

## What the AI agent token can and cannot do

Create the token in **Settings**, on the **API tokens** tab, and choose the **AI agent** scope. See [How do I create an API token?](/faq/how-do-i-create-an-api-token/).

| The agent can                                                           | The agent cannot                                |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| Read your workspace, its vulnerabilities and the fix and triage prompts | Apply a ruling to a vulnerability               |
| Send VEX rulings for review                                             | Approve or reject any ruling, including its own |
| Draft and edit security advisories                                      | Publish, withdraw or delete an advisory         |
| Propose changes to a published advisory                                 | Change a published advisory directly            |

The token belongs to the person who created it and can never do more than that person's role allows. Everything an agent sends is marked as coming from an AI agent, so reviewers always know what they are approving.

## CVE triage

1. Open a vulnerability's **Fix prompt**. sbomify writes instructions for your agent, in two modes: **Fix** asks it to make the upgrade, and **Triage** asks it to judge the impact.
2. The agent sends its ruling, for example **Not affected** because the code is not reachable, with its reasoning.
3. The ruling waits on the **Review** tab of the Vulnerabilities page. It shows the agent's reasoning, each ruling, and how many vulnerabilities it would close. Nothing changes yet.
4. A person approves it, and the ruling is written into the component's VEX, or rejects it.

See [How do I triage vulnerabilities?](/faq/how-do-i-triage-vulnerabilities/) for the whole page.

## Security advisories

1. The agent drafts an advisory. A draft is visible only to your workspace.
2. A person reviews it and publishes it. Only owners and admins can publish.
3. Once an advisory is published, every change the agent sends, such as a new update, an edited field or a product status, becomes a proposal. The advisory's review list shows it as a diff against the current text.
4. A person approves the proposal, rewords it and approves, or rejects it with a reason. The agent reads the reason back through the API, so it can try again.

See [How do I publish a security advisory?](/faq/how-do-i-publish-a-security-advisory/).

## Further reading

- [How do I create an API token?](/faq/how-do-i-create-an-api-token/)
- [How do I triage vulnerabilities?](/faq/how-do-i-triage-vulnerabilities/)
- [How do I publish a security advisory?](/faq/how-do-i-publish-a-security-advisory/)
- [How do I use VEX?](/faq/how-do-i-use-vex/)
