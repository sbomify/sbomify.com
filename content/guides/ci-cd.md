---

url: /guides/ci-cd/
title: "SBOM Generation in CI/CD Pipelines"
description: "Why SBOMs belong in your build pipeline, what to generate on every commit versus every release, and where to find setup instructions for your CI platform."
keywords: ["SBOM CI/CD", "SBOM automation", "SBOM pipeline", "continuous integration SBOM"]
section: guides
tldr: "Generate SBOMs at build time, where the full dependency context exists and the result can be signed at origin. Reconstructing one later is guesswork by comparison."
---

## Why build time

An SBOM describes what went into a build. The only moment that information is complete and unambiguous is **while the build is happening** - when the lockfile, the resolved dependency tree, the commit SHA and the build environment all exist together.

Afterwards you are reconstructing. Scanning a released artifact tells you what can be detected from the outside, which is not the same as what went in: vendored code, statically linked libraries and files copied between Docker build stages are routinely invisible to an external scan.

Generating in CI gives you five things:

1. **Consistency** - every build produces an SBOM the same way, with the same tools.
2. **Automation** - no manual step anyone can forget before a release.
3. **Attestation** - the SBOM can be signed where it was made, tied to the pipeline run and commit that produced it.
4. **Compliance** - obligations under the [EU CRA](/compliance/eu-cra/), [EO 14028](/compliance/eo-14028/) and [FDA guidance](/compliance/fda-medical-device/) are met continuously rather than scrambled for at audit time.
5. **Traceability** - a complete path from source commit to deployed artifact.

## Signing at origin

The reason build-time generation matters so much is that it is the only point at which you can sign the SBOM as the party that actually produced it.

A signature made in your pipeline binds the document to a specific commit and a specific build. Anyone can verify it later without trusting the platform that stored it. That property only holds if nothing modifies the artifact afterwards - which is why sbomify [never alters an SBOM you upload](/guides/sbomify-action/why/#the-part-most-platforms-get-wrong).

See [how to sign an SBOM](/faq/how-do-i-sign-an-sbom/).

## What to generate, and when

| Trigger                         | What to do                                | Why                                                                                   |
| ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Every commit on the main branch | Generate, do not upload                   | Catches breakage early, costs nothing                                                 |
| Pull requests                   | Generate, do not upload                   | Verifies the pipeline still works; CI secrets are usually unavailable to forks anyway |
| Tagged releases                 | Generate, upload, tag a product release   | This is the artifact customers and auditors will ask for                              |
| Container builds                | Generate from the image, not the lockfile | Captures OS packages as well as application dependencies                              |

For what to put in the version field, see [how to version SBOMs](/guides/how-to-version-sboms/).

## Set it up

The [sbomify action](/guides/sbomify-action/) is a CLI shipped as a container image. It selects the right generator for your ecosystem, adds your business metadata, and enriches every component from package registries - in one step. Configuration is environment variables, and they are identical on every platform.

Pick your runtime:

- [GitHub Actions](/guides/sbomify-action/runtimes/github-actions/) - native action, OIDC trusted publishing, attestation
- [GitLab CI](/guides/sbomify-action/runtimes/gitlab-ci/) - container image, automatic VCS detection
- [Bitbucket Pipelines](/guides/sbomify-action/runtimes/bitbucket/) - container image via a Docker pipe
- [Jenkins](/guides/sbomify-action/runtimes/jenkins/) - declarative and scripted pipelines
- [CircleCI](/guides/sbomify-action/runtimes/circleci/) - container executor
- [Azure DevOps](/guides/sbomify-action/runtimes/azure-devops/) - container job or Docker task
- [TeamCity](/guides/sbomify-action/runtimes/teamcity/) - Docker Wrapper build feature
- [Any container runner](/guides/sbomify-action/runtimes/docker/) - Drone, Woodpecker, Buildkite, Concourse
- [Your local machine](/guides/sbomify-action/runtimes/local/) - `uvx`, `pipx` or Docker

If your platform can run a container, it is supported even without a dedicated page.

## Good practice

- **Do not fail the build on SBOM generation errors** while you are still rolling this out. Once it is stable, do - a missing SBOM should be as loud as a failing test.
- **Store SBOMs as build artifacts** as well as uploading them, so they are available even if an upload fails.
- **Cache the license database.** It avoids re-downloading 20-50 MB on every run and reduces exposure to [rate limits](/guides/sbomify-action/enrichment/#license-database-rate-limits).
- **Set `GITHUB_TOKEN`** whatever platform you are on. License databases come from GitHub Releases, and unauthenticated requests are throttled hard enough that enrichment quietly degrades.
- **Prefer short-lived credentials.** On GitHub Actions, [OIDC trusted publishing](/guides/sbomify-action/publishing/#oidc-trusted-publishing) removes the long-lived token entirely.
- **Keep the audit trail.** `audit_trail.txt` records every change the pipeline made and where it came from - archive it next to the SBOM.

## Related reading

- [Why SBOM quality matters](/guides/sbomify-action/why/) - scanners versus pipelines, and chain of custody
- [Language and platform guides](/guides/) - ecosystem-specific instructions
- [SBOM generation tools compared](/2026/01/26/sbom-generation-tools-comparison/)
- [GitHub Action with attestation](/2024/10/31/github-action-update-and-attestation/)
- [SBOM resources](/resources/) - the wider tooling landscape
