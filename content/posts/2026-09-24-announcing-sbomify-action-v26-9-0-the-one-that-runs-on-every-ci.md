---
title: "Announcing sbomify-action v26.9.0: The One That Runs on Every CI"
description: "sbomify-action v26.9.0 gives TeamCity, Jenkins, CircleCI and Travis CI first-class support through a new CI platform subsystem, fixes the GitLab invocation we had published in every non-GitHub example, adds DOCUMENT_FILE for publishing PDFs and reports from a pipeline, and makes SPDX 3 documents survive a round trip intact."
keywords: "sbomify-action release, SBOM CI/CD, TeamCity SBOM, Jenkins SBOM, CircleCI SBOM, Travis CI SBOM, GitLab SBOM pipeline, SPDX 3 round trip, DOCUMENT_FILE, SBOM audit trail"
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, ci-cd, spdx, teamcity, jenkins, circleci, gitlab, supply-chain]
tldr: "sbomify-action v26.9.0 stops treating GitHub Actions as the CI system and everything else as a fallback. TeamCity, Jenkins, CircleCI and Travis CI each get a platform that reads what their vendor actually publishes, so your SBOMs carry the branch the build was for rather than whatever tag happened to point at a detached HEAD. It also fixes an embarrassing one: the GitLab example we shipped — and had copied into roughly nineteen language guides on this site — invoked a script that does not exist, so those pipelines were never running the tool at all. Plus DOCUMENT_FILE for publishing a pentest report or a compliance PDF straight from CI, SPDX 3 documents that survive a round trip without losing 708 licence relationships, and an audit trail that no longer records the build machine's directory layout."
date: 2026-09-24
slug: announcing-sbomify-action-v26-9-0-the-one-that-runs-on-every-ci
---

The action has always claimed to work on any CI system. That was true in the sense that it ran, and false in every sense that matters once you look at the SBOM it produced. GitHub Actions, GitLab CI and Bitbucket Pipelines each had a provider reading their environment variables. Everything else fell through to a generic path that read the git checkout — which works right up to the moment you ask it something the checkout cannot answer.

v26.9.0 is mostly about closing that gap, and about one invocation we had published that could never have worked.

---

## Every CI System Gets a Platform of Its Own

Supporting a new CI system used to mean editing four unrelated modules: the console branched on GitHub in ten places, OIDC gated on `GITHUB_ACTIONS`, the CLI hardcoded `/github/workspace`, and each vendor needed its own augmentation provider. Adding one was four edits and a growing list.

There is now a `CIPlatform` abstraction carrying everything the action knows about the system a run is under — checkout root, VCS metadata, log dialect, OIDC issuer, telemetry — resolved exclusively, first match by priority:

```text
github-actions 10 → gitlab-ci 20 → bitbucket-pipelines 30 → teamcity 40
→ jenkins 50 → circleci 60 → travis 70 → generic-ci 90 → local 100
```

Adding a CI system is now one module and one registration. Nothing else learns its name.

### Why this changes your SBOM, not just our codebase

**Jenkins, CircleCI and Travis CI all check out a detached HEAD.** The generic path read the git checkout, which means the ref in your SBOM was whatever tag happened to point at that commit, or nothing at all. The vendor knows which branch the build was for, and on a pull request it knows which branch the request came _from_. Each of the three now reads that, keeping the checkout as the fallback, so a job publishing nothing behaves exactly as it did before.

Two judgement calls worth stating, because both could have been done the lazy way:

- On Jenkins, `CHANGE_BRANCH` beats `BRANCH_NAME`, because on a multibranch PR build `BRANCH_NAME` is Jenkins' own `PR-42` — a job name, not a ref anyone can check out. Same reasoning for Travis's `TRAVIS_PULL_REQUEST_BRANCH` over `TRAVIS_BRANCH`, which on a PR build names the branch being merged _into_.
- No repository URL is constructed from CircleCI's `CIRCLE_PROJECT_USERNAME` / `CIRCLE_PROJECT_REPONAME`. CircleCI serves GitHub, Bitbucket and GitLab projects and publishes nothing naming which, so that pair would only ever produce a plausible URL pointing at the wrong host. Travis's `TRAVIS_REPO_SLUG` is left alone for the same reason. An empty field beats a confident wrong one.

### TeamCity

TeamCity builds previously produced SBOMs with no VCS provenance at all unless you hand-authored `sbomify.json`. It is the awkward one to support: the other platforms hand you everything in environment variables, while TeamCity exposes only a version marker, the VCS revision, and a path to a build properties file. The repository URL and branch are _configuration parameters_, reachable only by reading that file and following a key in it to a second file.

Three assumptions taken from TeamCity's documentation turned out to be wrong, which is why this was verified against real servers on five major lines from 2024.12 to 2026.1 rather than from the docs.

One deliberate limitation: TeamCity is VCS-agnostic, and under Subversion, Perforce or TFVC the revision is a changelist or a timestamp, not a commit hash. The SBOM VCS fields are Git-shaped, so recording a Perforce changelist as a commit would put a false claim into an attestation document. Non-Git roots record nothing instead.

**CircleCI also gets release tags.** `VERSION_FROM_RELEASE_TAG` and `NORMALIZE_VERSION` read the tag that triggered the build — and read nothing CircleCI sets, so a CircleCI user who turned either switch on got no error and no effect. `CIRCLE_TAG` joins the list, and `CIRCLE_PROJECT_REPONAME` with it, so the foreign-tag check can still tell a release of your repository from a monorepo's per-package tag.

---

## The GitLab Example Was Broken, and We Had Copied It Everywhere

This one deserves to be said plainly rather than buried in a changelog.

Our GitLab CI config ran:

```yaml
script:
  - /sbomify.sh
```

There is no such script. The image's entrypoint is `sbomify-action`. That job cannot have been running the tool, and the same invocation had been copied from it into this site's CI/CD guide and roughly nineteen language guides — so **every GitLab, Jenkins and CircleCI example we published was broken**. Both the source and the published guides are fixed.

Related, in the same pass:

- Our own configs still set `SBOM_VERSION`, which has been deprecated in favour of `COMPONENT_VERSION` for a while and logs a warning on every run. Fixed, in both, so the next copy-paste picks the right one.
- The Bitbucket pipe catalogue entry said `sbomfiy`. It says `sbomify` now.
- The container image gains `WORKDIR /workspace`, so `docker run -v "$PWD:/workspace" …` is a complete invocation with no `-w` flag. The final stage had none, the container started in `/`, and every caller had to pass one — which is exactly how a GitHub-specific path ended up pasted into docs for other CI systems. Existing pipelines that pass `-w`, and GitHub Actions' own `/github/workspace` mount, keep working unchanged.

---

## Publish Documents, Not Just SBOMs

The platform has held document artifacts — pentest reports, compliance PDFs, NDAs — for a while, and the action had no way to publish one. So the pipeline that produced your pentest report ended at a shared drive and somebody uploaded it by hand.

`DOCUMENT_FILE` closes that:

```yaml
- uses: sbomify/sbomify-action@v26.9.0
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: ${{ vars.DOCS_COMPONENT_ID }}
    DOCUMENT_FILE: reports/pentest-2026.pdf
    DOCUMENT_TYPE: pentest-report
    DOCUMENT_VERSION: "2026.1"
```

The file is uploaded **exactly as authored** — no generation, augmentation, enrichment or re-serialization — so a signed report stays byte-for-byte the one that was signed. `DOCUMENT_NAME` defaults to the file name, `DOCUMENT_TYPE` defaults to `other` and is validated against the backend's types, and `DOCUMENT_COMPLIANCE_SUBCATEGORY` tags an ISO 27001 or SOC 2 report so the platform can recognise it — which is what the new [certification badges](/2026/09/24/announcing-sbomify-v26-9-0-the-one-that-speaks-spdx-3/) on the Trust Center read. `PRODUCT_RELEASE` tags the uploaded document into a release exactly as it does an SBOM, and OIDC trusted publishing works unchanged.

---

## SPDX 3 Documents Survive the Round Trip

If you feed the action an SPDX 3 document, it parses it, does its work, and writes it back out. Until now, what came out was not what went in.

Measured on the published Yocto 6.0.3 `core-image-minimal` SBOM, 3,049 elements, plain round trip with no augmentation or enrichment:

|                                                          |    before | after |
| -------------------------------------------------------- | --------: | ----: |
| schema errors in the document we wrote                   | thousands | **0** |
| packages that lost `primaryPurpose`                      |    **38** |     0 |
| `hasDeclaredLicense` relationships downgraded to `other` |   **708** |     0 |

That last row is the one that validated while it lied. Across the three published Yocto SPDX 3 images, every declared licence relationship — 708 in one document, 1,667 in another — was rewritten as a generic `other` relationship. The document still parsed. It just no longer said what its producer said.

Alongside that:

- **SPDX 3.0 documents are validated now.** The bundled schemas held 2.2, 2.3 and 3.0.1, so a 3.0 document matched nothing, validated as "skipped", and went to the upload unchecked — while the README promised generated SBOMs are validated against their JSON schemas. 3.0 is what syft, Microsoft's sbom-tool, JFrog Xray and Zephyr emit, and what Yocto 5.1 declares.
- **SPDX 3.1 gets a real answer.** It used to produce "could not detect spdx spec version", or nothing at all. It now says 3.1 is unsupported and names what is accepted, in the backend's own wording, so you hear one answer rather than two. 3.1 is at RC1, BSI accepts released versions only, and the platform refuses it.
- **The version is read from what the document states**, not inferred from the URL in its context.
- **Licence sanitization actually looks at SPDX 3.** It walked `packages[]`, `files[]` and `snippets[]` for fields an SPDX 3 document does not have, returned zero having read nothing, and zero reads as "nothing to fix".
- **`SPEC_VERSION` stops advertising a value that cannot work.** The help text offered `3.0.1` as an example; nothing in the toolchain generates SPDX 3. Asking for any 3.0.x now points you at the routes that do work, and asking for 3.1 tells you it is refused rather than sending you to a second route to hear the same no.

---

## The Audit Trail Stops Leaking Your Build Machine

The audit trail is a compliance artifact. It exists to be handed to someone other than whoever generated it. It was recording lines like:

```text
# Input: /private/tmp/claude-501/-Users-<username>-PycharmProjects-sbomify/.../requirements.txt
```

which tells that reader nothing usable while publishing the generating machine's directory layout and the username on it. A path under the working directory is now recorded relative to it (`src/requirements.txt`); a path anywhere else keeps only its file name. Both emitters are covered — the `audit_trail.txt` file and the copy printed to stdout for attestation — and there is no flag to opt back in, because a flag whose only function is to re-enable a leak is config surface for no gain.

---

## Smaller Things

- **A crash on one component's copyright header no longer fails the whole document.** cdxgen writes a licence body straight into `license.text`, where the CycloneDX schema wants an object, and the parser dies on it naming neither the component nor the field. Four of the six parse call sites already guarded against it; the two that did not have been a steady trickle of failed runs. They are paired now.
- **The README is a quick start again.** It had grown to twelve hundred lines and was drifting from the [documentation site](/sbomify-action/), which is now the single place any of it is maintained.
- **Tool versions are frozen at build time**, so a release carries the versions it was actually built against rather than resolving them later.

---

## Getting Started

Run it straight from PyPI, with no install step:

```bash
pipx run sbomify-action
# or
uvx sbomify-action
```

As a GitHub Action:

```yaml
- uses: sbomify/sbomify-action@v26.9.0
```

On anything else, as a container:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e SBOMIFY_TOKEN=$SBOMIFY_TOKEN \
  ghcr.io/sbomify/sbomify-action:v26.9.0
```

If you build on **TeamCity, Jenkins, CircleCI or Travis**, upgrade and look at the VCS fields in your next SBOM — the branch and repository that were missing or wrong should now be there, and the [runtime guides](/sbomify-action/runtimes/) have a page for each. If you build on **GitLab**, check your pipeline is calling `sbomify-action` and not `/sbomify.sh`; if it came from our docs, it is not.

The platform side shipped the same day: [sbomify v26.9.0](/2026/09/24/announcing-sbomify-v26-9-0-the-one-that-speaks-spdx-3/) makes SPDX 3 a first-class format end to end, which is the other half of the Yocto work above.

For the full technical detail, see the [v26.9.0 release notes on GitHub](https://github.com/sbomify/sbomify-action/releases/tag/v26.9.0).

As always, if the action is doing something surprising with your project, we want to hear about it. Both the GitLab fix and the TeamCity support in this release started as somebody telling us their pipeline was quietly producing nothing useful.
