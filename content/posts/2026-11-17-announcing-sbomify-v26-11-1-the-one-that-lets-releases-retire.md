---
title: "Announcing sbomify v26.11.1: The One That Lets Releases Retire"
description: "sbomify v26.11.1 gives every release a lifecycle: declare what a release replaces, set support and end-of-life dates, and sbomify scans, applies VEX to, and tracks in Dependency-Track only the releases you still support. Dependency-Track is laid out by release series, the Trust Center stays up when the database does not, and self-hosted installs move from Redis to Valkey."
keywords: "sbomify release, release lifecycle, end of support, end of life, supersession, Dependency-Track release series, VEX review, Trust Center availability, Valkey, self-hosted SBOM platform, CRA authorised representative"
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, lifecycle, dependency-track, vex, trust-center, self-hosting, cra]
tldr: "sbomify v26.11.1 stops treating every release you have ever shipped as something to watch forever. A release can now replace another, on the same line or as the start of a new one, and can carry support and end-of-life dates. sbomify uses that to decide what is live: only live releases are scanned, re-checked against VEX, and kept in Dependency-Track, which is now laid out by release series so the projects and audit history carry over from one release to the next. Retired releases say when they were last scanned instead of passing off old counts as current. The Trust Center keeps serving its last good pages when the database is down, readers who are granted access can actually sign in on a custom domain, and self-hosted installs move from Redis to Valkey, which needs one step on upgrade."
date: 2026-11-17
slug: announcing-sbomify-v26-11-1-the-one-that-lets-releases-retire
---

Until now, sbomify had no idea which of your releases you still support. Version 1.0 from three years ago and last week's 2.4 were treated the same way: both scanned on schedule, both in Dependency-Track, both adding findings to your totals. That is noise for you. For your customers it is also misleading, because a release you stopped supporting last year should not look actively monitored on your Trust Center.

v26.11.1 fixes that by giving a release a lifecycle. Here is what matters for you.

## Releases Have a Lifecycle

A release can now declare what it **replaces**, and how:

- **Same line.** 1.2.4 replaces 1.2.3. The older release retires and stops being monitored.
- **New line.** 2.0 follows 1.2, but 1.2 is still maintained. Both stay monitored until something replaces 1.2 on its own line.

It is a graph, not a chain. A product with two maintained lines, backports included, can describe itself accurately. A release can replace several releases, and one release can be followed by several. On top of that, a release (or its product) can carry an **end of support** and an **end of life** date, and it can be withdrawn or archived.

You can set all of this wherever you already create releases:

- **In the app**, where the new-release form now guesses the predecessor from the version you type. 1.2.5 picks 1.2.4, not whatever shipped most recently. Without that, a backport released after 2.0.0 would be offered 2.0.0 and, on Same line, would retire a release you still support. The edit dialog can change the link later.
- **From CI**, where `POST /api/v1/releases` and its v2 twin take a `supersedes` list. You name the predecessor by version, the previous tag, which is what a pipeline knows. `PATCH` takes the same list.

This is the same model the [Common Lifecycle Enumeration](/compliance/cle/) describes, so it is not a sbomify-specific idea.

---

## Only Live Releases Get Watched

Lifecycle data is only useful if something acts on it, so sbomify now acts on it in several places.

A release counts as live until it is replaced on its line, withdrawn, archived, or past its support or end-of-life date. The latest build of each component always counts. Scheduled scans, the VEX re-apply and Dependency-Track all read that one definition, so they cannot drift apart.

Here is what that looks like for a product with two maintained lines:

<div class="my-10 bg-navy-5 rounded-[1.25rem] p-6">
    {{< d2 "release-lifecycle" >}}
</div>

- **Scans** cover the newest SBOM of each component and the SBOMs of live releases, and nothing older.
- **Support dates take effect on their own.** A release whose support ended yesterday retires today, even with nobody touching it. Self-hosted installs without the task scheduler get a management command they can run from cron.
- **Retired releases are honest about it.** A release that is no longer scanned shows when it was last scanned and why it stopped, for example "Its support ended on…". Previously, a release with no findings at its last scan simply read as clean, on the Trust Center too. Now the date and the reason are right next to the counts.

Expect your totals to shrink when you start marking old releases as replaced. As with the [posture fix in v26.7.1](/2026/07/30/announcing-sbomify-v26-7-1-the-one-that-says-not-affected/), nothing was fixed by the change itself. The number now covers what you actually support.

---

## Dependency-Track, by Release Series

If you use the Dependency-Track integration, it changes shape in this release. sbomify used to upload one project version per SBOM. Now each workspace gets a tree laid out the way you ship:

- one collection per **live release**, holding one project per component that release ships;
- a **Latest builds** collection with each component's newest SBOM, released or not.

When a release replaces another on the same line, it **takes over the older release's projects**. sbomify renames them and swaps a component's BOM only where it actually changed. Dependency-Track keeps the project, its history and **your audit decisions**. Triage you did on 1.2.3 is still there on 1.2.4.

Shipping 1.3 on the 1.2 line, for example:

<div class="my-10 bg-navy-5 rounded-[1.25rem] p-6">
    {{< d2 "dt-release-series" >}}
</div>

Around that:

- An SBOM stuck on "Could not scan" has a **Re-import** button on its page, which sends it to Dependency-Track again instead of polling forever.
- Findings are read only after Dependency-Track has finished analysing the upload, so a scan no longer comes back empty because it asked too early.
- An SBOM Dependency-Track lost is uploaded again automatically. One it rejects as invalid is reported as rejected instead of failing over and over.
- An assessment waiting on Dependency-Track keeps retrying for six hours instead of giving up after half an hour.

---

## Reviewing Agent VEX Without Diffing by Eye

[v26.10.0](https://github.com/sbomify/sbomify/releases/tag/v26.10.0) let AI agents propose VEX rulings into an approval queue. Real agent submissions turned out to be repetitive. An agent ruling on a transitive dependency sends one decision per package version, so the reviewer saw eight identical rows and had to spot the difference themselves.

The Review tab now merges rulings that say the same thing into **one verdict per vulnerability**. The packages and versions it covers are listed as chips, and the explanation appears once. Long scoped package names wrap instead of spilling into the next column.

Vulnerability ids in more places, including the release findings table, the Trust Center posture and the VEX review, now link to [sbomify Insights](https://insights.sbomify.com/). Insights also covers more advisory schemes: GSD, HSEC, PSF and Drupal.

---

## A Trust Center That Stays Up

Your [Trust Center](/features/trust-center/) is what your customers see, so it should not go down with the database.

- **Public pages are served from their last good copy** while Postgres is unavailable, instead of an error page. Previously the proxy's health check needed the database, so one database stall made _every_ host return a 503.
- **Postgres and Valkey outages are handled in one place.** A brief backend restart no longer turns every in-flight request into a 500, and our error reporting only hears about outages that last.
- **Readers can sign in on a custom domain.** Gated documents on a Trust Center served from your own domain refused readers even after they had requested access, signed the NDA and been approved. The session lived on the app domain and never reached yours. Sign-in now hands the reader over to your Trust Center's host.
- **The workspace NDA** no longer appears in the Compliance artifacts section as if it were a published document.

---

## Smaller Things Worth Knowing

- **The CRA authorised representative is optional.** The CRA wizard required an EU authorised representative from any manufacturer outside the Union, and cited the wrong article. [Article 18(1)](/compliance/eu-cra/) says a manufacturer _may_ appoint one. The wizard now treats it as optional and cites Article 18.
- **Change a member's role in place.** Owners and admins can promote or demote someone from the Members tab or through `PATCH /workspaces/{team_key}/members/{member_id}`. Previously you had to remove them and invite them again.
- **Components record their repository.** A new source control URL on the component metadata says which repository a component's SBOMs are built from.
- **Seats are not capped** when billing is disabled, which matters if you self-host.

---

## For Self-Hosters

This release needs a little more care than usual on upgrade.

- **Dependency-Track needs a one-off backfill.** First give your Dependency-Track API key the `PORTFOLIO_MANAGEMENT` permission, so sbomify can create, rename and retire projects. Then, right after the deploy, lay out the release-series tree and retire the old per-SBOM projects:

  ```bash
  python manage.py dt_tracked_scope --dry-run
  python manage.py dt_tracked_scope
  ```

  Do it straight away: a component deleted before the backfill runs leaves nothing to find its old projects by.
- **No scheduler? Add two cron jobs.** Support dates retire releases on their own, and scans only run when something triggers them. Run the bundled `sbomify-scheduler`, or call `python manage.py dt_tracked_scope --changed-only` daily and `python manage.py rescan_tracked_sboms` hourly from cron. The [release notes](https://github.com/sbomify/sbomify/releases/tag/v26.11.1) have the exact lines.
- **Check old support dates.** End-of-support and end-of-life dates set through the API before this release had no effect. From now on they retire the release on deploy.
- **Redis becomes Valkey.** The bundled backing service is now Valkey 9. Valkey cannot read the data files Redis 8 writes, so its data lives in a new `sbomify_valkey_data` volume and starts empty. That is safe because it only holds the cache and the task queue. **Let the workers drain the queue before upgrading**, or any task still waiting in it is dropped. Once the new version is running, remove the old `sbomify_redis_data` volume. To stay on Redis, set `REDIS_IMAGE`. The [upgrade notes](https://github.com/sbomify/sbomify/blob/master/docs/deployment.md#upgrading-from-redis) have the details.
- **Anonymous usage telemetry.** Installations now report the number of users, workspaces, products and components, and the sbomify version, under a random installation id. The report contains nothing else: no names, no documents and no SBOMs. It helps us understand how sbomify is deployed outside the hosted platform. To turn it off, set `TELEMETRY_ENABLED=False`. It is already off when `CI` is set.
- **The image moved to Python 3.15** on a Chainguard base that now tracks daily security rebuilds instead of a frozen digest. `osv-scanner` now comes from a [sbom-tools](https://github.com/sbomify/sbom-tools) bundle whose SLSA provenance is checked with cosign during the build.
- **The Helm chart caught up.** Its `appVersion` had stayed at 26.9.0, so a default install pulled an image two releases old. Chart 0.1.4 installs v26.11.1.

---

## Getting Started

If you are on the **hosted platform**, this is already live. The ten minutes worth spending: open a product with a few years of releases, mark the ones you no longer support as replaced or give them an end-of-support date, and watch your vulnerability totals come down to what you actually maintain. If you create releases from CI, add `supersedes` with the previous tag to the call you already make, and the lifecycle keeps itself up to date from then on.

If you **self-host**, read the notes above, let the queue drain, then pull `ghcr.io/sbomify/sbomify:v26.11.1`. There are database migrations in this release, so take a snapshot first as usual, and run the Dependency-Track backfill once the new version is up.

For the full technical detail, see the [v26.11.1 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.11.1).

As always, tell us how this lands, especially if your release model does not fit Same line and New line. Long-term-support branches, vendor forks and products with more than one maintained line are exactly where a lifecycle model gets tested. If yours breaks it, open a support ticket from inside [the app](https://app.sbomify.com) and it will reach us.
