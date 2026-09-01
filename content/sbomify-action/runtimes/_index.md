---

url: /sbomify-action/runtimes/
aliases:
  - /guides/sbomify-action/runtimes/
title: "sbomify Action Runtimes"
description: "Platform-specific setup for the sbomify action: GitHub Actions, GitLab CI, Bitbucket, Jenkins, CircleCI, Azure DevOps, plain Docker and local machines."
keywords: ["SBOM CI integration", "GitLab SBOM", "Jenkins SBOM", "CircleCI SBOM", "Azure DevOps SBOM"]
tldr: "One container image runs everywhere. GitHub Actions gets a native action; every other runtime pulls ghcr.io/sbomify/sbomify-action and passes the same environment variables."
---

The tool is a CLI shipped as a container image. Configuration is environment variables, and they are **identical on every platform**. What changes between runtimes is only how you invoke the container, how you authenticate, and how much the platform tells the action about your build.

If your platform can run a container, it is supported - even if it does not have a page here. Start with [any container runner](/sbomify-action/runtimes/docker/).

## Pick your platform

- [**GitHub Actions**](/sbomify-action/runtimes/github-actions/) - native action, OIDC trusted publishing, build provenance attestation
- [**GitLab CI**](/sbomify-action/runtimes/gitlab-ci/) - container image, automatic VCS detection, self-managed supported
- [**Bitbucket Pipelines**](/sbomify-action/runtimes/bitbucket/) - container image via a Docker pipe, automatic VCS detection
- [**Jenkins**](/sbomify-action/runtimes/jenkins/) - declarative and scripted pipelines, VCS detected from the checkout
- [**CircleCI**](/sbomify-action/runtimes/circleci/) - container executor, VCS detected from the checkout
- [**Azure DevOps**](/sbomify-action/runtimes/azure-devops/) - container job or Docker task, VCS detected from the checkout
- [**TeamCity**](/sbomify-action/runtimes/teamcity/) - Docker Wrapper build feature or Kotlin DSL
- [**Any container runner**](/sbomify-action/runtimes/docker/) - Drone, Woodpecker, Buildkite, Concourse, or a plain shell
- [**Local machine**](/sbomify-action/runtimes/local/) - `uvx`, `pipx` or Docker on your laptop

## What differs

| Runtime                                        | Integration     | Auth          | VCS auto-detect | Wizard             | Attestation |
| ---------------------------------------------- | --------------- | ------------- | --------------- | ------------------ | ----------- |
| GitHub Actions                                 | Native action   | OIDC or token | Yes             | Generates workflow | Yes         |
| GitLab CI                                      | Container image | Token         | Yes             | No                 | No          |
| Bitbucket                                      | Container image | Token         | Yes             | No                 | No          |
| Jenkins                                        | Container image | Token         | From git        | No                 | No          |
| CircleCI                                       | Container image | Token         | From git        | No                 | No          |
| Azure DevOps                                   | Container image | Token         | From git        | No                 | No          |
| Any container runner                           | Container image | Token         | From git        | No                 | No          |
| [TeamCity](/sbomify-action/runtimes/teamcity/) | Container image | Token         | Git roots       | No                 | No          |
| Local machine                                  | `uvx` or `pipx` | Token         | Opt-in          | Yes                | No          |

**VCS auto-detect** means the action records repository URL, commit SHA and branch without configuration. _Yes_ is read from the platform's own environment variables. _From git_ is read from the checkout the job is running in, which covers every CI system with no vendor integration of its own - it needs the `.git` directory to be present and the repository to have a remote, both of which a normal CI checkout gives you.

_Git roots_ is TeamCity, which is VCS-agnostic and can be backed by Subversion, Perforce or TFVC as easily as Git. Detection runs only when the repository URL positively identifies Git, and emits nothing otherwise rather than recording a changelist number as a commit SHA. See [TeamCity](/sbomify-action/runtimes/teamcity/#vcs-information).

_Opt-in_ is a run on your own machine: it reads the checkout only when you set `SBOMIFY_LOCAL_VCS=true`, so an internal remote is never written into a document by accident. On every runtime, `vcs_url`, `vcs_commit_sha` and `vcs_ref` in [`sbomify.json`](/sbomify-action/augmentation/#automatic-vcs-detection) override what was detected.

**OIDC trusted publishing** and **attestation** are GitHub-only today because both depend on GitHub-issued identity tokens. Other runtimes authenticate with an API token, and can sign with [cosign](/faq/how-do-i-sign-an-sbom/) rather than GitHub's provenance tooling. Support will expand as platforms expose equivalent primitives.

## The universal pattern

Every non-GitHub runtime is a variation on this:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -e LOCK_FILE=requirements.txt \
  -e OUTPUT_FILE=sbom.cdx.json \
  -e ENRICH=true \
  -e UPLOAD=false \
  ghcr.io/sbomify/sbomify-action
```

Mount your repository at `/workspace` - the image's working directory, so no `-w` is needed - and pass configuration as environment variables. Any other mount point works as long as `-w` points at it, including the `/github/workspace` older examples used. The image entrypoint is `sbomify-action`, so no command is needed unless you want a subcommand such as `wizard` or `yocto`.

Whatever your platform's syntax for "run this container with these variables" is, that is your integration.

## Where the code lives

| Channel                  | Location                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Source and GitHub Action | [`sbomify/sbomify-action`](https://github.com/sbomify/sbomify-action) |
| Container image          | `ghcr.io/sbomify/sbomify-action`                                      |
| Python package           | [`sbomify-action`](https://pypi.org/project/sbomify-action/)          |

One repository, one image. There is no per-platform integration to install or keep in sync.
