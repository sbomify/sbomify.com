---
title: "Announcing sbomify v26.9.0: The One That Speaks SPDX 3"
description: "sbomify v26.9.0 makes SPDX 3 a first-class format end to end, ships a v2 API that calls things what the product calls them, adds a Helm chart for self-hosting on Kubernetes, puts certification badges and CSAF 2.0 discovery on the Trust Center, and rebuilds vulnerability browsing around a real findings table."
keywords: "sbomify release, SPDX 3.0.1, SPDX 3 scanning, Yocto SBOM, SBOM API v2, sbomify Helm chart, Kubernetes SBOM, CSAF 2.0, security.txt CSAF, CISA 2026 minimum elements, trust center certification badges"
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, spdx, yocto, api, kubernetes, trust-center, csaf, compliance]
tldr: "sbomify v26.9.0 stops treating SPDX 3 as a document it will store but not understand. A 3.0 or 3.0.1 upload is now validated against the real schema, scanned for vulnerabilities through a derived copy instead of being skipped, read for the VEX and licence data it carries, and large enough to actually arrive — the request ceiling went from an effective 20 MB to 100 MB, which is what a Yocto image SBOM needs. There is also a v2 API that says artifacts and workspaces rather than sboms and teams, with v1 deprecated but not going anywhere; a Helm chart for running sbomify on Kubernetes; certification badges, reachable gated documents and CSAF 2.0 discovery on the Trust Center; the CISA 2026 Minimum Elements scored by a plugin that is finally switched on; and a vulnerabilities panel you can filter, page and triage from without the page taking five seconds to render."
date: 2026-09-24
slug: announcing-sbomify-v26-9-0-the-one-that-speaks-spdx-3
---

If you generate SBOMs from an embedded Linux build, you have probably had a version of this experience with us: the document uploads, sbomify stores it, and then most of the interesting things quietly do not happen. No scan. No validated schema. Licences flattened. And if the image was big enough, not even an upload — just a `400` that named no size.

That is the main thing v26.9.0 fixes. SPDX 3 is now a format sbomify understands rather than one it merely accepts.

---

## SPDX 3, End to End

The work splits into four pieces, and each one was its own dead end.

**It is validated now.** The bundled schemas covered SPDX 2.2, 2.3 and 3.0.1. A 3.0 document matched none of them, so it validated as "skipped" and went through unchecked — and 3.0 is what syft, Microsoft's sbom-tool, JFrog Xray and Yocto 5.1 emit. Both 3.0.0 and 3.0.1 are now checked against their own schema, not against each other's: 3.0.1 renamed several properties, so aliasing one onto the other would produce false failures in one direction and false passes in the other. SPDX 3.1 is explicitly refused with a message that names the version and says what we do accept, rather than the old "could not detect spec version".

**It is scanned now.** osv-scanner has no SPDX 3 reader and Dependency Track takes CycloneDX only, so every SPDX document came back as a skip telling you to run `syft convert` yourself and upload the result. Doing that for you is the whole change: the scan path derives a copy in a format the scanner reads, scans the copy, and reports findings against the stored artifact, which is never modified. The conversion is lossy and that is survivable, because scanners match on package identity and PURLs come through intact. The result records that it read a derived copy, so a surprising finding is traceable to the conversion rather than looking like a scanner fault.

**It is read properly now.** A pile of individually small bugs added up to a document we were interpreting through guesswork: the BOM subject came from whichever package happened to be first rather than from `rootElement`, several single-field reads pointed at properties the spec does not have, set-valued properties were only read in one of their several legal shapes, licences resolved to booleans instead of expressions, and an external-reference type written as an IRI read as a different type than the same thing written as a bare name. A document that roots itself on its `Sbom` element is followed, and the subject is read from the relationship Yocto actually writes. The VEX an SPDX 3 document carries about itself is now honoured instead of ignored.

**It fits now.** The SBOM endpoint advertised a 100 MB cap that Django refused at 20 MB, before the check could run, so anything in between came back as a bare `400 Invalid request` naming no size. A Yocto SPDX 3 image SBOM lands squarely in that gap. The ceiling is one number now, enforced where it is stated, configurable through `DATA_UPLOAD_MAX_MEMORY_SIZE_MB`, and defaulting to the 100 MB the docs always claimed.

The regression test for all of this is a real 50 MiB `core-image-sato-sdk` document, alongside Yocto SPDX 2.2 and 3.0 samples. If you build with Yocto, this is the release to re-upload on.

---

## A v2 API That Says What the Product Says

The v1 API has been accumulating vocabulary it grew out of. `/api/v1/sboms/` now holds eight artifact types, most of which are not SBOMs. `/api/v1/workspaces/{team_key}` is a prefix that was renamed and a path parameter that was not, in twenty-nine places. And one resource answers on both `/sboms/{id}` and `/sboms/sbom/{id}`.

None of that is fixable in place without breaking every caller, which is what a second version is for.

**`/api/v2/` serves the same resources from the same code, named the way the product names them.** Artifacts rather than SBOMs, workspaces rather than teams, and one path per resource. The views are shared, not forked, so the two versions cannot drift apart.

Two things to know if you integrate against us:

- **v1 is deprecated, not scheduled for removal.** It answers with an RFC 9745 `Deprecation` header, and every v1 operation is struck through in `/api/v1/docs` and flagged in generated clients. There is no `Sunset` header, deliberately: `Sunset` is a promise of a date, and we are not making one we have not thought through. When there eventually is a date, it will be a long way out.
- **Error codes are now reliable enough to branch on.** Around two hundred error returns shipped with no `error_code` at all, so a client reading it got `null` and had to fall back to matching prose. Every response now carries one. Separately, thirty-four handlers answered a server-side crash with `400` and the message "Internal server error" — telling you your request was malformed when the server had in fact fallen over. Those are `500`s now, which matters because sensible clients retry one and not the other.

Also new on the API side: security advisories can be created, read and deleted through it, and a workspace's plugins can be enabled and disabled over it rather than only in the UI.

In the product itself, the on-screen copy says workspace throughout — templates, toasts, admin labels. The v1 wire format was deliberately left untouched, down to the prose in its error messages, because a client may be matching on it.

---

## Running sbomify on Kubernetes

There is now a **Helm chart**, at `charts/sbomify` in the repository.

It deploys the application: Caddy at the edge, a gunicorn/uvicorn web tier, a pool of Dramatiq workers, a singleton cron scheduler, and a migration job that runs before any of them serve traffic. It deliberately does **not** deploy PostgreSQL, Redis, object storage or Keycloak — you point it at ones you run, and it refuses to render if you have not, rather than quietly standing up a database nobody is backing up.

```bash
helm install sbomify ./charts/sbomify \
  --namespace sbomify --create-namespace \
  --set app.baseUrl=https://sbom.example.com \
  --set database.host=pg.internal \
  ...
```

HPA, PodDisruptionBudget, NetworkPolicy and ServiceAccount templates are included, secrets can come from a Secret you manage with External Secrets, SOPS or Vault, and `./bin/kind-up.sh` brings the whole thing up on a laptop with throwaway backing services — provisioned outside the chart, exactly as production does, so there is no all-in-one code path to drift.

On AWS and GCP you can drop the object storage credentials entirely and use workload identity instead. That work is documented as an architecture decision record in the repository, and the short version is that static keys for three buckets were six secrets to rotate and one leak away from a problem that lasts until someone notices.

---

## The Trust Center

**Certification badges.** A workspace that has published a company-wide ISO 27001 or SOC 2 report now shows it as a seal at the top of its Trust Center, which is usually the question the visitor came to the page to answer. A badge is earned rather than ticked: the document has to hang off a company-wide component, that component has to be published, and the document has to have an actual file on it. An empty component named "ISO 27001" claims nothing, because that is the easiest way to accidentally claim a certification you do not hold. Gated counts — "we hold this, ask us for the report" is what a badge is for — and SOC 2 splits into Type I and Type II, because a reader wants to know which one they are being shown. An NDA is deliberately not a badge: signing one says nothing about your own security.

**Gated documents are reachable again.** If you set a document component to gated, the row appeared on your Trust Center and then 404'd for anyone who clicked it, because slug resolution only scanned public components. The artifact behind it was the second half of the same dead end, 403'ing into a generic error page. Gated components now resolve like every other published component, and the request-access gate is what a reader without a grant sees — which was the entire point of gating rather than hiding.

**CSAF 2.0 discovery.** We have served CSAF documents from the public API since advisories shipped, but nothing linked to them, `security.txt` carried no CSAF field, and the provider metadata URL that field points at did not exist — so a CSAF consumer had no way to learn we publish CSAF at all. The three documents CSAF 2.0 defines for discovery are now served, gated exactly as `security.txt` is, and the `security.txt` CSAF field is derived from your own domain rather than waiting for someone to paste it in. Everything under there is TLP:WHITE for every reader, built from public advisories only, so an aggregator holding an NDA grant can never republish gated content as WHITE.

**Your vulnerability posture is now opt-in, and it was not before.** This one was reported from production and is worth stating plainly: a Trust Center release page published severity counts and every finding by ID, package and version to anyone with the link, whenever the release had a completed scan. There was no setting behind it. There is now — a workspace toggle, off unless you turn it on. If you have been running a public Trust Center with release pages, this is the paragraph to act on.

---

## Vulnerabilities You Can Actually Work Through

A trial workspace uploaded two large SBOMs and started hitting gateway timeouts. The upload was not the problem. The **component detail page** rendered every finding of the newest SBOM into the HTML server-side and let the browser show five at a time.

For a component with 2,390 findings, measured on production: deriving the rows took 0.49s, rendering them took **5.10s**, and the page shipped **8.5 MB** of HTML for one panel. On a CPU-bound render that holds the GIL for the whole worker process, that is enough to time out unrelated requests routed to the same process.

Three changes come out of that:

- **Findings live in a table of their own.** A finding previously existed only inside a scan run's JSON blob, so anything wanting to rank, filter or page findings across a workspace loaded every run and did the work in Python. "Critical findings across this product, worst first, page 3" could not be asked at all. It can now. The table is derived and rebuildable; the scan result stays the record of what the scanner said.
- **Search, severity, VEX state and the KEV toggle run on the server**, before the slice rather than after it, on the component page and in the full scan report. The dashboard digest reads the same table.
- **You can triage from the vulnerabilities panel**, with a row count you choose. Previously you found the finding in the panel, went to the artifact page, opened the right plugin card, and paged an unfiltered five-at-a-time list until you found it again.

Alongside that: a scan that every provider declined is no longer reported as a clean scan, the page says _why_ each scanner skipped an SBOM rather than showing an unexplained gap, a suppressed finding no longer counts toward your vulnerability totals, a fixed finding no longer reads as "not affected", and assessment runs that nothing will ever come back for are settled rather than sitting in flight forever.

---

## The CISA 2026 Minimum Elements, Scored

CISA published the [2026 Minimum Elements](https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom) on 29 July 2026 with the NSA, the FBI and fifteen international partners, replacing the 2021 NTIA elements. Our plugin implemented the August 2025 draft and — this is the awkward part — was never registered, so it had never run for a single user. Parking it was right while the standard was a draft. That reason expired in July.

It is switched on now, against the published standard: seventeen data fields rather than eleven, including the six that had no check at all, and three outcomes rather than two. That third outcome matters. The standard repeatedly tells an author who does not have a value to _say so_ rather than omit it, so a declared unknown is not scored as a miss — but it is not real data either, so it warns where an omission fails. `NOASSERTION` is the declared unknown; `NONE` is an answer and passes.

Six scoring defects went with it, each of which had mis-scored real documents: a tool counted as the author (`Tool: syft` passed, and so did `banana`), Component Producer read only the distributor and not the creator, the timestamp check accepted formats RFC 9557 does not and rejected ones it does, OmniBOR and SWHID were not accepted as component identifiers, and SPDX 3's declared licence did not count where only the concluded one did.

---

## Advisories, VEX and the Smaller Corrections

The advisory work from [v26.8.0](/2026/08/25/announcing-sbomify-v26-8-0-the-one-with-security-advisories/) got a round of hardening now that people are using it:

- An advisory can be asked which releases it affects, resolved on read from both the pinned releases and the version strings. A version that will not parse answers "undetermined" rather than "not affected", because the latter is a security claim nobody verified.
- A VEX statement matches every ID the advisory is known by, can be scoped to a CPE as well as a PURL, and says so when it cannot be applied rather than silently doing nothing.
- A withdrawn advisory says it is withdrawn on the list, not only on its own page, and the VEX preview counts advisories rather than scan rows.
- A release VEX download respects component visibility, and an advisory body renders as prose rather than as its own markup.

And a set of things that were simply wrong:

- Deleting a workspace cancels its Stripe subscription. It did not, from either place you can delete one.
- Rate limiting counts the visitor's IP rather than the Cloudflare edge's, so one noisy visitor no longer spends everyone else's budget.
- A Redis blip refuses API requests with a `429`, not a `500`.
- Deleting a release no longer destroys its lifecycle history.
- Documents are unique by name and version within a component, can be made workspace-wide from their own page, and an upload whose declared type does not match the document is refused.
- Every allauth page — login, password reset, the lot — renders inside the styled shell rather than dropping you onto a bare Django template.

---

## Getting Started

If you are on the **hosted platform**, this is already live. Two things worth ten minutes: if you run a public Trust Center with release pages, check the new vulnerability posture toggle and decide deliberately whether it should be on. And if you have SPDX 3 or Yocto SBOMs that previously uploaded but never scanned, re-upload one and look at what comes back.

If you **self-host**, pull `ghcr.io/sbomify/sbomify:v26.9.0`. There are database migrations in this release, including index and table renames from the workspace terminology work, so take a snapshot first as usual. If you have been running the Docker Compose deployment on a single box and want something that survives a node, the new Helm chart is worth a look.

If you **integrate against the API**, start reading `/api/v2/docs`. Nothing is being taken away from you on a deadline, but v2 is where the vocabulary and the URL shapes stop being a compromise with history.

The [sbomify-action v26.9.0](/2026/09/24/announcing-sbomify-action-v26-9-0-the-one-that-runs-on-every-ci/) release went out at the same time. If you build anywhere other than GitHub Actions, read that one — it is the release where the other CI systems stop being second-class.

For the full technical detail, see the [v26.9.0 release notes on GitHub](https://github.com/sbomify/sbomify/releases/tag/v26.9.0).

As always, tell us how this lands. The SPDX 3 work in particular came out of documents real people sent us that we handled badly, and there are certainly more of those. If sbomify does something surprising with yours, open a support ticket from inside [the app](https://app.sbomify.com) and it will reach us.
