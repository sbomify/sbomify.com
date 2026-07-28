---

url: /guides/mcp/
title: "Connect AI Agents to sbomify - MCP Server Guide"
description: "Query your SBOMs, vulnerabilities and compliance status from Claude and other AI agents using sbomify's Model Context Protocol server."
section: guides
---

sbomify runs a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server, so AI
agents can answer questions about your software supply chain directly — without you copying
data between a browser and a chat window.

Ask "what changed in our vulnerability posture since the last release?" and the agent reads it
from your workspace, using your own permissions.

## What you can do with it

- **Answer risk questions.** "Which components in the 2.4 release have critical vulnerabilities,
  and which of those already have a VEX?"
- **Check compliance before shipping.** "Is every SBOM in this release NTIA-compliant? Which are
  missing supplier information?"
- **Trace a dependency.** "Does this SBOM ship log4j, and at what version?"
- **Fill in the tedious parts.** "Create a supplier contact profile for ACME and attach it to the
  three components missing one."
- **Publish from an agent.** Upload an SBOM, cut a release, tag artifacts to it.

## Setup

### 1. Create a scoped access token

In sbomify, go to **Workspace settings → Access tokens** and create a token. Choose the narrowest
scope the agent needs:

| Scope       | What the agent can do                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| `read_only` | Read products, components, releases, SBOMs, documents, vulnerabilities, assessments |
| `publish`   | Upload SBOMs, cut and tag releases                                                  |
| `full`      | Everything, including VEX publishing                                                |

**Start with `read_only`.** You can always issue a second, wider token later. Give each agent its
own token rather than sharing one — it keeps the "last used" timestamp meaningful and limits the
damage if a token leaks.

### 2. Connect your client

**Claude Code:**

```bash
claude mcp add --transport http sbomify https://app.sbomify.com/mcp \
  --header "Authorization: Bearer $SBOMIFY_TOKEN"
```

**Clients that use a JSON config file** (Claude Desktop and most others):

```json
{
  "mcpServers": {
    "sbomify": {
      "type": "http",
      "url": "https://app.sbomify.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN_HERE" }
    }
  }
}
```

Self-hosting sbomify? Replace the hostname with your own instance. MCP is served on your main
application hostname.

### 3. Check the connection

```bash
curl -sS -X POST https://app.sbomify.com/mcp \
  -H "Authorization: Bearer $SBOMIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

You should get back a list of tools. If the list is empty, the token is missing or invalid.

## What the agent can see

The tools an agent is offered are filtered by its token's scopes. A `read_only` agent is never
shown `upload_sbom` — it does not have to be told not to use it, because it cannot see it.

### Reading

| Tool                                | What it answers                                       |
| ----------------------------------- | ----------------------------------------------------- |
| `get_workspace_summary`             | What is in this workspace? (usually the first call)   |
| `list_products` / `get_product`     | Products, with identifiers, links and components      |
| `list_components` / `get_component` | Components and their recent artifacts                 |
| `list_releases` / `get_release`     | Releases and everything tagged to them                |
| `list_sboms` / `get_sbom`           | SBOM metadata — format, version, hash, signing status |
| `get_sbom_packages`                 | The packages an SBOM declares, filterable by name     |
| `list_documents`                    | Documents attached to a component                     |
| `get_assessments`                   | Compliance results — NTIA minimum elements and others |
| `get_vulnerability_summary`         | Severity counts, by product, component or release     |
| `list_vulnerabilities`              | Individual findings, traced to the package and SBOM   |
| `get_release_risk_report`           | A release's full posture in one call                  |

### Contact profiles

Contact profiles carry the supplier and author details published in your SBOMs — the fields NTIA
minimum-elements checks look for. An agent can list them, create one, and attach it to components
that are missing one.

Reading profiles needs only workspace read access. Creating or attaching them needs a token
explicitly scoped for workspace or component management, which the `read_only` and `publish`
presets deliberately do not include.

### Publishing

`upload_sbom`, `upload_vex`, `create_release` and `tag_artifact_to_release`. Uploaded artifacts are
stored exactly as supplied — sbomify never rewrites your documents.

## How it stays safe

An AI agent reading your SBOMs is reading content written by your suppliers, and their suppliers,
and so on down the tree. A package name or advisory description can contain text aimed at the model
rather than at you. sbomify assumes this:

- **Your token is the boundary.** Scopes are checked before anything else, so no instruction hidden
  in a dependency can widen what an agent may do. A `read_only` agent told to publish is refused.
- **Destructive tools do not exist.** There is no tool to delete a product, component, SBOM or
  release — not disabled, absent. "Delete everything" has nothing to call. Deletion stays something
  a person does in the UI.
- **Everything is capped.** Upload sizes, artifact sizes, response sizes and page sizes, so a
  misbehaving agent cannot exhaust anything.
- **Every call is logged** with the tool, token, user and workspace, so activity is auditable after
  the fact.
- **Artifact text is marked as data.** Content taken from SBOMs is truncated and the agent is told
  explicitly to treat it as information to report on, never as instructions to follow.

What this does not do: it cannot stop a determined injection from making an agent _describe_
something misleadingly. Treat an agent's summary of a third-party artifact with the same caution you
would treat the artifact.

## Good to know

- **Large SBOMs.** `get_sbom_packages` always pages. To check for one dependency, ask the agent to
  filter by name rather than page through thousands of entries.
- **Vulnerability numbers match the dashboard.** Counts merge findings across scanners, drop
  scanner bookkeeping rows, and exclude anything you have already dispositioned via VEX.
- **Searching across components** — "which of our products ship log4j?" — is not yet supported.
  Ask per SBOM for now.
- **Rate limits** are shared with the sbomify API. Agents ask a lot more questions than CI does, so
  give an agent its own token rather than reusing a CI one.

## Related

- [CI/CD Integration](/guides/ci-cd/) — generate and upload SBOMs automatically
- [How to Version SBOMs](/guides/how-to-version-sboms/)
- [What is an SBOM?](/what-is-sbom/)
