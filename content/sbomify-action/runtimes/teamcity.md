---

url: /sbomify-action/runtimes/teamcity/
aliases:
  - /guides/sbomify-action/runtimes/teamcity/
title: "SBOM Generation in TeamCity"
description: "Run the sbomify action in TeamCity using the Docker Wrapper build feature or a Kotlin DSL configuration, with caching, parameters and manual VCS configuration."
keywords: ["TeamCity SBOM", "TeamCity CycloneDX", "Docker Wrapper", "SBOM pipeline"]
section: sbomify-action
tldr: "Add a Command Line step with the Docker Wrapper build feature pointing at the container image. VCS details are detected automatically for Git roots; a containerised step that cannot read the build properties file sets SBOMIFY_VCS_URL instead."
---

TeamCity runs the container image through the **Docker Wrapper** build feature, which wraps a Command Line step so it executes inside a container.

## Minimal setup

In the build configuration:

1. Add a **Command Line** build step.
2. Set **Custom script** to `sbomify-action`.
3. Add the **Docker Wrapper** build feature to that step, with:
   - **Docker image**: `ghcr.io/sbomify/sbomify-action`
   - **Additional docker run arguments**: `-w /github/workspace`
4. Add the configuration as environment variables under **Parameters**, prefixed `env.`:

```text
env.LOCK_FILE    = requirements.txt
env.OUTPUT_FILE  = sbom.cdx.json
env.ENRICH       = true
env.UPLOAD       = false
```

TeamCity mounts the checkout directory into the container automatically, so the lockfile path is relative to your repository root.

## Kotlin DSL

If your configuration is versioned:

```kotlin
object GenerateSbom : BuildType({
    name = "Generate SBOM"

    params {
        param("env.LOCK_FILE", "requirements.txt")
        param("env.OUTPUT_FILE", "sbom.cdx.json")
        param("env.ENRICH", "true")
        param("env.UPLOAD", "false")
    }

    vcs { root(DslContext.settingsRoot) }

    steps {
        script {
            name = "Generate SBOM"
            scriptContent = "sbomify-action"
            dockerImage = "ghcr.io/sbomify/sbomify-action"
            dockerRunParameters = "-w /github/workspace"
        }
    }

    artifactRules = "sbom.cdx.json"
})
```

## Uploading to sbomify

TeamCity does not support OIDC trusted publishing - that is currently GitHub-only. Use an API token stored as a **password** parameter so it is masked in the build log.

```kotlin
params {
    password("env.TOKEN", "credentialsJSON:...", display = ParameterDisplay.HIDDEN)
    param("env.COMPONENT_ID", "your-component-id")
    param("env.LOCK_FILE", "requirements.txt")
    param("env.AUGMENT", "true")
    param("env.ENRICH", "true")
}
```

Password parameters are the only kind TeamCity masks in logs. A plain `param` holding a token will be printed.

## Versioning

TeamCity exposes the build number and VCS revision as parameters:

```text
env.COMPONENT_NAME    = my-app
env.COMPONENT_VERSION = %build.vcs.number%
```

For tagged releases, use a VCS trigger on tags and read the branch name:

```text
env.COMPONENT_VERSION = %teamcity.build.branch%
env.PRODUCT_RELEASE   = ["your-product-id:%teamcity.build.branch%"]
```

## Caching

TeamCity agents keep their working directories between builds, so pointing the caches at a path outside the checkout directory persists them across runs on the same agent:

```text
env.SBOMIFY_CACHE_DIR    = %system.agent.home.dir%/cache/sbomify
env.SYFT_CACHE_DIR       = %system.agent.home.dir%/cache/syft
env.SBOMIFY_TOOL_CACHE   = %system.agent.home.dir%/cache/sbomify-runtimes
env.GITHUB_TOKEN         = %github.token%
```

Mount that directory into the container by adding it to the Docker Wrapper's run arguments:

```text
-w /github/workspace -v %system.agent.home.dir%/cache:/cache
```

Two things are worth caching here. The [tool runtimes](/sbomify-action/advanced/#tool-runtimes) are downloaded on first use, so without a cache every build re-fetches them. And `GITHUB_TOKEN` matters even though you are not on GitHub: license databases come from GitHub Releases, unauthenticated requests are capped at 60 per hour per IP, and a pool of agents behind one NAT address exhausts that quickly. When it happens, enrichment degrades silently. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## VCS information

Repository URL, commit SHA and branch are detected automatically, the same as on GitHub, GitLab and Bitbucket. Detection landed after `v26.8.0`, so it is present on `master` and in any release tagged since - if you pin to an older tag, use the manual fallback below.

TeamCity is not like the other three, and the differences are worth knowing.

**The details are configuration parameters, not environment variables.** TeamCity exposes only `TEAMCITY_VERSION`, `BUILD_VCS_NUMBER` and `TEAMCITY_BUILD_PROPERTIES_FILE` to the build. The repository URL and branch live in the build properties file, which points at a second file holding the rest. The action follows that chain for you - but a **containerised step may not be able to see those files**, and this page recommends running in a container. If the properties file is not reachable, set the values explicitly:

```text
-e SBOMIFY_VCS_URL=https://git.example.com/team/app.git
-e SBOMIFY_VCS_REF=%teamcity.build.vcs.branch.MyVcsRootId%
```

`SBOMIFY_VCS_URL` is always trusted as an operator assertion, and takes precedence over anything detected.

**Only Git roots are recorded.** TeamCity is VCS-agnostic - a root can be Subversion, Perforce, TFVC or Mercurial, and under those `BUILD_VCS_NUMBER` is a revision number or changelist rather than a commit hash. The SBOM's VCS fields are Git-shaped, so recording a Perforce changelist there would put a false claim into a document you may go on to sign. TeamCity exposes no VCS-type parameter, so the action emits nothing unless the URL positively identifies Git: a `.git` suffix, a recognised Git host, or an `ssh://` or `git@host:path` form.

The practical consequence: **a self-hosted Git server whose URL has neither a `.git` suffix nor a known host** - `https://git.example.com/team/app`, say - cannot be detected. Set `SBOMIFY_VCS_URL` and it is recorded as given. For an attestation artifact, omitting provenance is better than asserting a repository that might not be Git.

### Manual fallback

To set everything yourself instead, generate `sbomify.json` from build parameters in an earlier Command Line step:

```bash
cat > sbomify.json <<EOF
{
  "vcs_url": "%vcsroot.url%",
  "vcs_commit_sha": "%build.vcs.number%",
  "vcs_ref": "%teamcity.build.vcs.branch.MyVcsRootId%",
  "supplier": {"name": "My Company"},
  "lifecycle_phase": "build"
}
EOF
```

Then set `env.AUGMENT = true`. See [augmentation](/sbomify-action/augmentation/).

> **Do not use `%teamcity.build.branch%` here.** On the default branch it reports the literal string `<default>` when a branch specification is configured ([TW-23699](https://youtrack.jetbrains.com/issue/TW-23699)), and is absent entirely when one is not. Neither gives you the branch name. Use `%teamcity.build.vcs.branch.<VcsRootId>%`, substituting your VCS root's ID.

## Container images

Scanning an image needs access to a Docker daemon. TeamCity agents that already run Docker builds have one; add the socket to the wrapper's run arguments:

```text
-w /github/workspace -v /var/run/docker.sock:/var/run/docker.sock
```

```text
env.DOCKER_IMAGE = my-app:%build.number%
env.OUTPUT_FILE  = container-sbom.cdx.json
env.ENRICH       = true
env.UPLOAD       = false
```

Mounting the socket gives the container control of the host daemon. Prefer a rootless or remote daemon where your agents support it.

## Monorepos

```text
env.WORKING_DIR = packages/my-app
env.LOCK_FILE   = package-lock.json
```

For several components, use a build configuration per component, each with its own `COMPONENT_ID`, or a single configuration with a matrix parameter.

## Signing

Build provenance attestation is GitHub-specific. Sign with [cosign](/faq/how-do-i-sign-an-sbom/) instead, which runs anywhere.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Augmentation](/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/sbomify-action/advanced/) - tool runtimes, caching, troubleshooting
