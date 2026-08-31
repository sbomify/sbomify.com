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

When running in supported CI environments, repository URL, commit SHA and branch or tag are detected and added automatically. No configuration needed.

| Runtime             | Detected                                  | Notes                                                |
| ------------------- | ----------------------------------------- | ---------------------------------------------------- |
| GitHub Actions      | Repository URL, commit SHA, branch or tag | Works with GitHub Enterprise Server                  |
| GitLab CI           | Project URL, commit SHA, ref name         | Works with self-managed instances                    |
| Bitbucket Pipelines | Repository URL, commit SHA, branch or tag |                                                      |
| TeamCity            | Repository URL, commit SHA, branch or tag | Git roots only - see [below](#teamcity-is-different) |

What gets written:

- **CycloneDX** - a VCS external reference on the root component, in `git+https://...@sha` form
- **SPDX** - `downloadLocation` pinned to the commit, plus `sourceInfo` with build context and a VCS external reference

This is what makes an SBOM traceable back to a specific commit, which in turn is what makes signing meaningful: the document says exactly which source produced it.

### TeamCity is different

TeamCity is VCS-agnostic, and a root can just as easily be Subversion, Perforce or TFVC as Git. Under those, its revision parameter holds a changelist or revision number rather than a commit hash, and the SBOM's VCS fields are Git-shaped - so writing one into the other would put a false claim into a document you may go on to sign.

TeamCity exposes no parameter saying which VCS a root uses. Detection therefore runs only when the repository URL positively identifies Git, and emits nothing otherwise. A self-hosted Git server whose URL has neither a `.git` suffix nor a recognised host cannot be detected; set `SBOMIFY_VCS_URL` (and `SBOMIFY_VCS_REF`) and it is trusted as given. See the [TeamCity runtime guide](/sbomify-action/runtimes/teamcity/#vcs-information).

### Other runtimes

Jenkins, CircleCI, Azure DevOps and plain container runs do not expose enough standard environment information for reliable detection. Set the values yourself:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

Most CI systems expose the commit SHA in some environment variable, so this is usually a small template change in your pipeline definition.

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
