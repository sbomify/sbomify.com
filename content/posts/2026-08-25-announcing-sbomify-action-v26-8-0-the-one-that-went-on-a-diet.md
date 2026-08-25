---
title: "Announcing sbomify-action v26.8.0: The One That Went on a Diet"
description: "sbomify-action v26.8.0 cuts the container image from 515MB to 106MB by fetching verified, attested tool bundles on demand, ends silent SBOM quality downgrades, adds git submodule support, and introduces Clearly Cached, a caching proxy that makes ClearlyDefined license data actually usable from CI."
author:
  display_name: Viktor Petersson
categories:
  - announcement
tags: [sbom, release, ci-cd, supply-chain, attestation, rust, dotnet, php]
tldr: "sbomify-action v26.8.0 shrinks the container image from 515MB to 106MB by fetching per-ecosystem tool bundles on demand, pinned by digest and attested before use, without dropping a single ecosystem. More importantly, it ends silent quality downgrades: when the right generator for your project was broken or missing, the action used to quietly fall back to a worse one and hand you a plausible but wrong SBOM. It now fails loudly instead. The release also adds git submodule support, caches enrichment lookups across CI runs, and introduces Clearly Cached, a new open source caching proxy in front of ClearlyDefined that took license resolution from 31 of 76 packages to 76 of 76."
date: 2026-08-25
slug: announcing-sbomify-action-v26-8-0-the-one-that-went-on-a-diet
---

The headline number in this release is that the container image went from **515MB to 106MB**. That is the fun part. The part that should actually change your confidence in your SBOMs is what we found while getting there: for several ecosystems, sbomify-action was quietly producing a worse SBOM than it should have, and nothing told you.

---

## 515MB to 106MB, Without Dropping Anything

The old image shipped every tool it might ever need, for every language it supports, whether your project used them or not. If you build a Python service, you were still pulling a JDK on every cold CI run.

The new image ships one Python runtime, sbomify-action itself, and `cyclonedx-py`. Everything else is fetched at the moment it is needed, as per-ecosystem bundles from [sbomify/sbom-tools](https://github.com/sbomify/sbom-tools), pinned by digest, verified and attested before use, and unpacked into an unprivileged prefix. Every `apt-get` call is gone, so nothing in the image needs root.

**No ecosystem was dropped to get there.** An earlier attempt removed cdxgen and the JVM to hit the number, and we reverted it, because a smaller image that generates worse SBOMs is not an improvement.

What this buys you beyond faster pulls: the tools are now verified supply-chain artifacts rather than layers baked in months ago, and they can be updated without waiting for a new action release. If you build in an air-gapped environment, `SBOMIFY_FETCH_RUNTIMES=0` opts out.

---

## The Part That Matters: No More Silent Downgrades

Fetching tools used to be opt-in outside our own image. The reasoning was that fetching a tool changes which generator wins, and therefore changes the user's SBOM, so we should not do it without permission.

That reasoning is backwards. Declining to fetch does not leave you without an opinion. It silently hands you the fallback, which is the worse answer. A Rust project resolved by a generic file scanner instead of `cargo-cyclonedx` is not a neutral outcome, and nothing was telling you it had happened.

Two examples from this release, both real:

- **Rust was broken for every user.** The CycloneDX Cargo integration was failing outright on a spec-version argument, and nobody noticed, because the fallback scanner quietly produced a worse SBOM in its place.
- **Go looked fine and was not.** A `go.sum` returned 154 components through the fallback, which _looks_ like a working result. Routed to the right generator, it returns 158 components with real module metadata. A plausible wrong answer is far more dangerous than an empty one, because nobody investigates it.

Inside the image, the chain is now strict: a generator that claims your project and then fails aborts the run instead of falling through to something worse. Two generators were also caught claiming inputs they cannot actually handle, which on a developer laptop looked harmless and in production cost you the SBOM entirely.

Related, and in the same spirit: a container image no longer has every file in it described as a component; a Swift package with missing information now tells you what is missing instead of writing an empty SBOM; and a spec version that nothing in the toolchain can generate is rejected at config time rather than after your build has run.

---

## Every Lock File We Support, Fully Supported

Twenty-eight lock file and manifest names. Twenty-five real-world repositories. Both CycloneDX and SPDX. Every combination now runs on every commit.

That breadth turned into depth. Point sbomify-action at the same project today and it sees a great deal more of it:

| Input                   | Components before | Components now |
| ----------------------- | ----------------: | -------------: |
| `composer.json` (SPDX)  |                 1 |            100 |
| `pyproject.toml` (SPDX) |                 1 |             70 |
| `gradle.lockfile`       |              none |             68 |
| `package.json` (SPDX)   |                 1 |             10 |
| `Package.swift`         |              none |              4 |

PHP is the clearest example. A `composer.json` now describes the whole project, all hundred components of it. Gradle lock files generate directly, without running your build. Swift packages resolve properly. And a manifest that lists version ranges reads the lock file sitting next to it, so you get the versions you actually shipped.

Discovery got broader in the same pass. Rust crates that carry only a `Cargo.toml`, .NET project files rather than the lock file almost nobody commits, PHP through a proper Composer bundle, and first-class recognition for Haskell, Erlang, and Clojure. If that is your stack, point the action at it and it will find your dependencies.

---

## Git Submodules, Handled Properly

If your repository pulls in code through git submodules, that code is part of what you ship, and it was previously invisible.

Discovery now detects lock files that live in another repository, whether through `.gitmodules` or a vendored clone, and annotates them clearly. They are left **deselected by default**, with an explanation, because a submodule is better tracked from the repository that owns it.

When you do enable one, the action resolves the submodule's pinned commit to a real version, then either attaches the SBOM that already exists for that version or generates and uploads one so it is there next time. So the same dependency, pinned by five different products, produces one SBOM rather than five near-identical ones.

One decision worth stating explicitly: submodule SBOMs are **never attested** from the parent repository's workflow. An attestation from your pipeline would carry your Sigstore identity for code your organisation does not own, which is a claim we are not willing to emit on your behalf. The generated workflow marks those rows as deliberately unsigned.

---

## Better Enrichment, Fewer Rate Limits

Enrichment is how a bare dependency list becomes an SBOM with suppliers, licenses, and metadata that a downstream consumer can act on. It is also where the action talks to a dozen upstream services, and where rate limiting quietly costs you data.

Every enrichment lookup, across all twelve sources, is now cached across runs rather than being thrown away when the process exits. That directly improves SBOM completeness, because the throttled lookups that used to come back empty now come back from cache.

The subtle half is what is _not_ cached. A transient failure, a timeout, or a 429 is never persisted, because a single throttled run would otherwise suppress that package's enrichment for the entire cache lifetime, which is exactly the data loss the cache exists to prevent. Negative results expire in a day rather than a month, so a newly published package is picked up instead of remembered as absent. And any cache failure degrades to no cache: a corrupt cache costs you network calls, not your run.

Elsewhere in the same vein: the operating system lifecycle data has been re-sourced directly from vendors, with staleness detection so we notice when it drifts rather than serving you dates that quietly went out of date.

---

## Introducing Clearly Cached

[ClearlyDefined](https://clearlydefined.io/) is one of the most useful datasets in the open source supply chain: curated license and attribution data for millions of packages, built by the community and free to everyone. It is also a free public API carrying the whole ecosystem, and querying it package by package from CI asks a great deal of it. A coordinate that has not been looked at recently can take the better part of a minute to come back. And by design the API never returns a 404, so a package that simply has not been harvested yet returns an empty definition, which from the client side is indistinguishable from a package with no license.

That last point is the one that mattered for your SBOMs. A slow response and an unharvested package both ended up recorded as "no license", sitting alongside real answers with nothing to tell them apart.

So we built [**clearly-cached**](https://github.com/sbomify/clearly-cached), a fast, selective caching proxy that sits in front of ClearlyDefined. We run it publicly at `clearly-cached.sbomify.com`, and sbomify-action now goes through it by default. The goal is not to route around ClearlyDefined but to be a better-behaved client of it: ask for less, ask once, and share the answer with everyone else running the action.

Measured across 76 real packages spanning all seven supported ecosystems:

|                          | Licenses resolved | Wall clock            |
| ------------------------ | ----------------: | --------------------- |
| Direct to ClearlyDefined |          31 of 76 | 474s                  |
| Through clearly-cached   |      **76 of 76** | **5s** warm, 92s cold |

Forty-five of those packages exceeded our ten-second client timeout when queried directly, cold. All of them now resolve.

Three things make the difference. The proxy returns a flat 0.4KB projection of the handful of fields enrichment actually uses, instead of a definition that can run to 190KB. It answers from cache, so the second project to ask about a popular package pays nothing for the answer. And it reports **unharvested** as its own state, distinct from unlicensed, so "ClearlyDefined has not looked at this yet" can never be recorded in your SBOM as "this package has no license". A circuit breaker backs that up: after five consecutive failures the source steps aside for the rest of the run, which saves your CI minutes and stops us adding load to a service that is already busy.

It is open source, and `SBOMIFY_CLEARLY_CACHED_URL` points the action at your own instance or a local container if you would rather not depend on ours.

Burning it in surfaced two defects that had been quietly costing people data against the old API as well. **Go packages had never enriched at all.** The namespace was interpolated into the URL raw, so `pkg:golang/github.com/gorilla/mux` split across extra path segments and 404'd every single time, silently. Go went from 0 of 6 packages enriched to 6 of 6. And a malformed response could take the parser down mid-SBOM; every field is now type-checked.

We also stopped deriving the **supplier** field from ClearlyDefined's copyright parties. That was our misreading rather than bad data: copyright parties are exactly what they say they are, and a copyright holder found somewhere inside a package is simply not the same thing as that package's supplier. Across 68 live packages it showed: numpy's supplier came back as the author of meson, SQLAlchemy's as the author of clipboard.js, certifi's as a certificate authority bundled inside it. Confidently wrong provenance is worse than an empty field, so supplier is now left to the sources that model it directly.

---

## Smaller Things That Remove Friction

- **The wizard survives real workspaces.** Hitting a plan limit now offers a route forward instead of a raw `403` and a retry button that fails identically. Tokens scoped to a non-default workspace bind to the right one. A retry after a partial run no longer dies on something it already created. There is a Reload on the components screen, and the action row stays on screen at every terminal size.
- **Your component version comes from the release tag.** If your workflow runs on a tag, that is the version, and the action offers to normalise it rather than making you wire it up yourself.
- **Prereleases are marked as prereleases** when publishing to sbomify, so a release candidate does not sit in your Trust Center looking like a shipped version.
- **Environment variable handling is fixed outside Docker.** If you run the CLI directly rather than as a container action, three resolution defects that only surfaced there are gone.

---

## Getting Started

Run it straight from PyPI, with no install step at all:

```bash
pipx run sbomify-action
# or
uvx sbomify-action
```

Or use the GitHub Action:

```yaml
- uses: sbomify/sbomify-action@v26.8.0
```

Or run the wizard against your repository and let it write the workflow for you:

```bash
docker run --rm -it \
  -v "$(pwd):/github/workspace" \
  -w /github/workspace \
  -e SBOMIFY_TOKEN=$SBOMIFY_TOKEN \
  ghcr.io/sbomify/sbomify-action \
  sbomify-action wizard
```

If you are already on an earlier version, the upgrade is worth doing for the quality fixes alone. Regenerate an SBOM for a Rust, Go, PHP, or Swift project and compare the component count against your last one. If the number jumps, that gap is what was missing from your SBOM before.

The platform side shipped the same day: [sbomify v26.8.0](/2026/08/25/announcing-sbomify-v26-8-0-the-one-with-security-advisories/) adds security advisory publishing and the measurable half of CRA compliance.

For the full technical detail, see the [v26.8.0 release notes on GitHub](https://github.com/sbomify/sbomify-action/releases/tag/v26.8.0).

As always, if the action is doing something surprising with your project, we want to hear about it. Several of the fixes above started as somebody's confusing SBOM.
