---

url: /sbomify-action/augmentation/
aliases:
  - /guides/sbomify-action/augmentation/
title: "Augmentation: Adding Your Business Metadata to an SBOM"
description: "How to add supplier, author, license, lifecycle and security contact information to your SBOM with sbomify.json, plus automatic VCS detection from your CI environment."
keywords: ["SBOM supplier metadata", "sbomify.json", "SBOM lifecycle phase", "NTIA supplier", "CRA security contact"]
section: sbomify-action
tldr: "Augmentation adds the metadata only you know - supplier, authors, licenses, support dates - from a sbomify.json file in your repository. No account needed. Your local values always win."
---

## Augmentation vs. enrichment

Two different problems, two different mechanisms:

|                  | Augmentation                               | Enrichment                           |
| ---------------- | ------------------------------------------ | ------------------------------------ |
| Adds             | Metadata about **your** software           | Metadata about **your dependencies** |
| Source           | You, via `sbomify.json` or the sbomify API | Public package registries            |
| Scope            | The document and its root component        | Every component                      |
| Account required | No                                         | No                                   |
| Enable with      | `AUGMENT: true`                            | `ENRICH: true`                       |

Nobody but you knows who supplies your software, when its support window ends, or where to report a vulnerability in it. That is augmentation. What license `requests` uses is public knowledge - that is [enrichment](/sbomify-action/enrichment/).

Most projects want both.

## The config file

Create `sbomify.json` in your project root and set `AUGMENT: true`. No account needed.

```json
{
  "lifecycle_phase": "build",
  "supplier": {
    "name": "My Company",
    "url": ["https://example.com"],
    "contacts": [{"name": "Support", "email": "support@example.com"}]
  },
  "authors": [
    {"name": "Jane Doe", "email": "jane@example.com"}
  ],
  "licenses": ["Apache-2.0"],
  "security_contact": "https://example.com/.well-known/security.txt",
  "release_date": "2026-06-15",
  "support_period_end": "2028-12-31",
  "end_of_life": "2030-12-31"
}
```

### Field reference

| Field                | Description                                    | Where it lands                                                                                |
| -------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `lifecycle_phase`    | The context this SBOM was generated in         | CycloneDX `metadata.lifecycles[].phase`; SPDX `creationInfo.creatorComment`                   |
| `supplier`           | The organisation supplying the component       | CycloneDX `metadata.supplier`; SPDX `packages[].supplier`                                     |
| `authors`            | Who authored the component                     | CycloneDX `metadata.authors[]`; SPDX `creationInfo.creators[]`                                |
| `licenses`           | SPDX license identifiers for your own software | CycloneDX `metadata.licenses[]`; SPDX document licenses                                       |
| `security_contact`   | Where to report vulnerabilities                | CycloneDX `externalReferences[type=security-contact]`; SPDX `externalRefs[category=SECURITY]` |
| `release_date`       | When this version was released                 | CycloneDX lifecycle property; SPDX external ref                                               |
| `support_period_end` | When security-only support ends                | CycloneDX lifecycle property; SPDX `validUntilDate`                                           |
| `end_of_life`        | When all support ends                          | CycloneDX lifecycle property; SPDX external ref                                               |
| `vcs_url`            | Repository URL, overriding CI detection        | CycloneDX `externalReferences[type=vcs]`; SPDX `downloadLocation`                             |
| `vcs_commit_sha`     | Full commit SHA                                | Appended to the VCS URL                                                                       |
| `vcs_ref`            | Branch or tag name                             | Added as build context                                                                        |

### Valid values

**`lifecycle_phase`** is one of `design`, `pre-build`, `build`, `post-build`, `operations`, `discovery`, `decommission`. Most CI pipelines want `build`. When the input is a container image, `post-build` is set automatically.

**`security_contact`** accepts a [security.txt](https://securitytxt.org/) URL (recommended), a `mailto:` address, or a disclosure procedure URL.

**Dates** are ISO-8601, for example `2028-12-31`. The three lifecycle dates mean different things:

- `release_date` - when this version became publicly available
- `support_period_end` - bugfixes stop, security patches continue
- `end_of_life` - no further updates of any kind

These map onto [Common Lifecycle Enumeration](/compliance/cle/), and let downstream consumers automatically flag software that is approaching or past end of support.

## Why this matters for compliance

The [NTIA Minimum Elements](/compliance/ntia-minimum-elements/) require a supplier name and an author of the SBOM data. The [EU Cyber Resilience Act](/compliance/eu-cra/) expects a documented vulnerability reporting channel and a defined support period. None of that can be inferred from a lockfile - a scanner has no way to know it.

Augmentation is how those fields get populated, and it is the difference between an SBOM that passes a procurement review and one that gets sent back.

## Where values come from

Sources are consulted in priority order, and **local values always win**:

1. **`sbomify.json`** in your project root. Highest priority. No account required.
2. **The sbomify API**, using metadata configured on your component. Requires `COMPONENT_ID` and credentials.
3. **CI environment detection**, which fills in VCS information automatically.

Keeping metadata in `sbomify.json` means it is version-controlled and reviewable alongside your code. Keeping it in sbomify means you can change it without a commit. Local wins, so you can override centrally-managed values per repository.

By default augmentation only fills fields that are empty. Set `OVERRIDE_SBOM_METADATA: true` to make it overwrite values the generator already produced - useful when a generator guesses a name or version you would rather correct.

## Automatic VCS detection

Repository URL, commit SHA and branch or tag are detected and added automatically on every CI runtime. No configuration needed.

Where a vendor publishes those details as environment variables, they are read from there. Everywhere else the action reads them from the git checkout it is running in, which is why Jenkins, CircleCI, Azure Pipelines and any other container runner get provenance without you writing it out by hand.

| Runtime                                                                                                | Source                                           | Notes                                                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------- |
| GitHub Actions                                                                                         | Runner environment                               | Works with GitHub Enterprise Server                                 |
| GitLab CI                                                                                              | Job environment                                  | Works with self-managed instances                                   |
| Bitbucket Pipelines                                                                                    | Step environment                                 | Bitbucket Cloud; Data Center needs `vcs_url` in `sbomify.json`      |
| TeamCity                                                                                               | Build properties file                            | Git roots only - see [below](#teamcity-is-different)                |
| Jenkins, CircleCI, Azure Pipelines, Buildkite, Drone, Travis CI, AppVeyor, AWS CodeBuild, any other CI | The git checkout (`git remote`, `git rev-parse`) | Needs the `.git` directory in the container and a configured remote |
| Your own machine                                                                                       | The git checkout, opt-in                         | Set `SBOMIFY_LOCAL_VCS=true` - see [below](#local-runs-are-opt-in)  |

Each records repository URL, commit SHA and branch or tag. A browsable commit URL is added as well for github.com, gitlab.com and bitbucket.org, plus self-hosted GitHub and GitLab, whose commit paths match their cloud products. Everything else - Bitbucket Data Center included, since it lays commit URLs out differently from Bitbucket Cloud - gets the repository URL and the SHA without a link, rather than a guessed one that 404s.

What gets written:

- **CycloneDX** - a VCS external reference on the root component, in `git+https://...@sha` form
- **SPDX** - `downloadLocation` pinned to the commit, plus `sourceInfo` with build context and a VCS external reference

This is what makes an SBOM traceable back to a specific commit, which in turn is what makes signing meaningful: the document says exactly which source produced it.

### TeamCity is different

TeamCity is VCS-agnostic, and a root can just as easily be Subversion, Perforce or TFVC as Git. Under those, its revision parameter holds a changelist or revision number rather than a commit hash, and the SBOM's VCS fields are Git-shaped - so writing one into the other would put a false claim into a document you may go on to sign.

TeamCity exposes no parameter saying which VCS a root uses. Detection therefore runs only when the repository URL positively identifies Git, and emits nothing otherwise. A self-hosted Git server whose URL has neither a `.git` suffix nor a recognised host cannot be detected; set `SBOMIFY_VCS_URL` (and `SBOMIFY_VCS_REF`) and it is trusted as given. See the [TeamCity runtime guide](/sbomify-action/runtimes/teamcity/#vcs-information).

### Runtimes read from the checkout

Jenkins, CircleCI, Azure Pipelines and any other container runner have no vendor integration, and none is needed: they check out a git repository and run a command in it, so the action asks `git` directly. Two conditions have to hold, and both are the default:

- **The `.git` directory has to be there.** A shallow clone is fine; an exported tarball or a mount of only your lockfile is not.
- **The repository needs a remote.** `origin` is used if present, otherwise the first remote. A checkout with no remote has no URL worth recording, so nothing is emitted.

A runner is recognised as CI when it sets `CI=true` or a vendor variable of its own (`JENKINS_URL`, `CIRCLECI`, `TF_BUILD`, `BUILDKITE`, `DRONE`, `TRAVIS`, `APPVEYOR`, `CODEBUILD_BUILD_ID`). Almost every runner sets one; a bare `docker run` from a shell script sets neither and is treated as a local run.

If any of that does not hold, or the remote URL is not the one you want in the document, set the fields yourself:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

`sbomify.json` takes priority over detection, so this is also how you replace an internal remote URL with the public one.

### Local runs are opt-in

On your own machine nothing is read from the checkout unless you ask for it. The same lock file would otherwise produce a different SBOM depending on whether a remote happened to be configured, and an internal remote would be written into a document that often leaves the company.

Set `SBOMIFY_LOCAL_VCS=true` to opt in, or state the fields in `sbomify.json` as above. On CI it stays automatic - that is the point of it.

### Overriding or disabling

The same three fields override auto-detected values, which is useful for self-hosted forges whose URLs are not derivable from the environment.

To turn detection off entirely:

```yaml
env:
  DISABLE_VCS_AUGMENTATION: "true"
```

## Component identity overrides

Independently of `sbomify.json`, three variables override the root component's identity:

```yaml
env:
  COMPONENT_NAME: my-app
  COMPONENT_VERSION: ${{ github.ref_name }}
  COMPONENT_PURL: pkg:golang/github.com/my-org/my-app@1.2.3
```

`COMPONENT_VERSION` is the one most projects need, because generators often infer a version from a manifest rather than from the release you are actually shipping. See [how to version SBOMs](/guides/how-to-version-sboms/) for what to put there.

Every override is recorded in the [audit trail](/sbomify-action/advanced/#audit-trail), so the fact that a value was changed - and what it was before - is preserved.
