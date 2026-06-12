---
title: "Announcing sbomify v26.3.0: The One That Ditches the Token"
description: "sbomify v26.3.0 adds GitHub Actions OIDC trusted publishing so you can push SBOMs with no long-lived API token, expires personal access tokens by default, removes the Project layer, and ships a broad security and access-control hardening pass."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, oidc, security, github-actions, cra, compliance]
tldr: "sbomify v26.3.0 lets your GitHub Actions workflows publish SBOMs using short-lived OIDC tokens instead of a long-lived API key, so there is no secret to store or rotate. It also makes personal access tokens expire by default (90 days), removes the old Project layer so the hierarchy is now just Product and Component, and ships a broad security and access-control hardening pass across the API, downloads, and Trust Center."
date: 2026-06-12
slug: announcing-sbomify-v26-3-0-the-one-that-ditches-the-token
---

The headline of v26.3.0 is about getting rid of something: the long-lived API token sitting in your CI secrets. With GitHub Actions OIDC trusted publishing, your pipeline can now push SBOMs to sbomify without any stored credential at all. Alongside that, this release tightens access control across the board and simplifies the workspace hierarchy. Here is what matters for you.

## OIDC Trusted Publishing for GitHub Actions

If you publish SBOMs from GitHub Actions today, you almost certainly have a sbomify API token stored as a repository or organization secret. That token is long-lived, it has to be rotated by hand, and if it ever leaks it can be used from anywhere until you notice and revoke it.

v26.3.0 removes the need for it. sbomify now supports **OpenID Connect (OIDC) trusted publishing** for GitHub Actions, the same model [PyPI](https://docs.pypi.org/trusted-publishers/) and other ecosystems have moved to.

Here is how it works. Instead of storing a secret, you create a **binding** in sbomify that says "this GitHub repository is allowed to publish to this workspace." When your workflow runs, GitHub mints a short-lived, cryptographically signed token that proves which repository, workflow, and branch the job is running from. sbomify verifies that token against your binding and accepts the upload. The token is valid for minutes, not months, and it never leaves the runner.

For you, this means:

- **No secret to store or rotate.** There is nothing in your repository settings to leak, and nothing to remember to cycle every quarter.
- **Scoped to exactly one repository.** A binding authorizes one specific repo to publish, so a token minted anywhere else is useless.
- **Upload-only by design.** OIDC credentials can publish SBOMs and nothing else. They cannot read or manage the rest of your workspace.
- **Private repositories supported.** You can create a binding for a private repo using just the org and repo name, with no token and no need to expose anything. The repository ID is pinned automatically the first time it publishes.

There is a new authenticated API for managing bindings, so you can wire this into your own provisioning if you run a lot of repositories. We are also [publishing sbomify's own SBOMs](https://github.com/sbomify/sbomify/pull/1013) through OIDC trusted publishing now, as the reference implementation for rolling it out across an organization.

If you only take one thing from this release, take this one. Moving your pipeline off a stored API token is one of the highest-leverage supply-chain security improvements you can make, and it is now a few minutes of setup.

---

## Personal Access Tokens Now Expire

This is the change most likely to need action from you, so it gets its own section.

Until now, personal access tokens (PATs) in sbomify lived forever unless you explicitly revoked them. As of v26.3.0, **new tokens expire by default, with a 90-day lifetime.**

Long-lived credentials are the thing attackers love most, and a token that never expires is a token you will eventually forget you issued. Capping the default lifetime keeps your workspace's credential footprint honest.

What this means in practice:

- **Existing tokens are not retroactively killed**, but any integration that depends on a long-lived PAT should plan to rotate on a schedule rather than set-and-forget.
- **For CI pipelines, prefer OIDC trusted publishing** (above) over a PAT wherever you can. It sidesteps the rotation problem entirely.
- If you genuinely need a longer-lived token for a specific integration, you can still set the expiry when you create it.

---

## Goodbye, Project Layer

We have simplified the workspace hierarchy. The old three-level model of **Product, Project, Component** is now just **Product and Component**. The Project layer is gone.

In practice almost nobody was using Projects as a meaningful grouping. They added a click and a concept without adding much value, and they made the data model harder to reason about. Flattening to Product and Component matches how people actually think about their software: a product is the thing you ship, and it is made of components.

This release includes a **data migration** that moves your existing components up under their products automatically. On the hosted platform this has already happened and there is nothing for you to do. If you self-host, see the upgrade note at the end.

---

## A Security and Access-Control Hardening Pass

A large chunk of this release is unglamorous but important: making sure that every endpoint checks who you are and what you are allowed to see, every time. If you run sbomify in front of real customers, these are the fixes you want.

- **Authentication required on list endpoints**, and invalid bearer tokens are now properly rejected instead of being quietly ignored.
- **CSRF protection on the API.** Browser-based, cookie or session authenticated requests now require a CSRF token. Bearer-token requests (your PATs and OIDC credentials) are exempt, so existing API integrations are unaffected.
- **Access is re-checked at download time.** When someone follows a signed link to download an artifact, sbomify now re-verifies that they still have access at that moment, rather than trusting that they did when the link was created.
- **Roles are read from the database, not a stale session cache.** If you revoke someone's access, that change now takes effect immediately rather than lingering until their session refreshes.
- **Private product names are redacted** from branding reads for users who are not members of the workspace, and membership is enforced before those reads happen.
- **Transport and cookie hardening** ships alongside the CSRF work.

None of these require any action from you. They simply close gaps so that the boundary between public and private data holds up under scrutiny.

---

## CRA and Compliance Polish

We have kept refining the EU Cyber Resilience Act workflow we have been building over the last two releases:

- **CRA documents now render correctly in plain markdown viewers**, not just GitHub-flavored ones, and export cleanly to **PDF** in the production image.
- **No more stray template comments** leaking into CRA and Trust Center output. A few pages were emitting tails of HTML comments into the visible text. They are gone.
- **The sbomify-action call-to-action is now hidden** when your SBOM already came from sbomify-action, so you are not nagged to do something you already did.
- **Broken BSI guidance links** that pointed at 404s have been replaced with the published page.

---

## Billing, Performance, and the Rest

A round of reliability and polish work that you will mostly feel as "things just work better":

- **Stripe webhooks retry on transient failures** instead of being dropped, so subscription state stays in sync even when Stripe has a hiccup.
- **Faster page loads.** Stripe synchronization has been moved off the hot path that ran on every request, and aggregated release and product SBOMs are now cached, so dashboards render quicker.
- **Vulnerability-trends dashboards** got repaired dropdowns, a new releases filter, and properly formatted counts.
- **Relative timestamps** with a hover tooltip on "Created at" columns, so you can see "3 days ago" at a glance and the exact time when you need it.
- **Dark-mode fixes** across public, authenticated, and Trust Center pages: logos, table headers, and code blocks that were previously hard to read.
- **API correctness fixes:** field-level validation errors are preserved on 400 responses, out-of-range pagination returns an empty page instead of silently falling back, and a duplicate component name now returns a clear `DUPLICATE_NAME` error.

---

## Getting Started

If you are on the **hosted platform**, everything in this release is already live, no action needed. Your components have already been migrated out from under the old Project layer, and OIDC trusted publishing is ready to set up from your workspace settings. If you have long-lived personal access tokens powering integrations, now is a good moment to plan their rotation or move them to OIDC.

For **self-hosted** deployments, pull `ghcr.io/sbomify/sbomify:v26.3.0` and update. Take a database snapshot before you upgrade, as the Project-layer removal includes a real data migration.

For the full technical detail, including the complete list of bug fixes, dependency upgrades, and infrastructure changes, see the [v26.3.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.3.0).

As always, I would love to hear your feedback. If you are setting up OIDC trusted publishing and something is unclear, open a support ticket from inside [the app](https://app.sbomify.com) and the team will get back to you. Getting your pipeline off a stored token is exactly the kind of thing we want to make painless, so tell us where it is not.
