---

url: /sbomify-action/configuration/
aliases:
  - /guides/sbomify-action/configuration/
title: "sbomify Action Configuration Reference"
description: "Every input, environment variable and CLI flag for the sbomify action, including precedence rules and deprecated aliases."
keywords: ["sbomify action configuration", "SBOM environment variables", "sbomify-action reference"]
section: sbomify-action
tldr: "Configuration is environment variables, and they are the same on every runtime. Exactly one input source is required; everything else has a sensible default."
---

Configuration is done through **environment variables**, and they behave identically on every runtime. The GitHub Action declares only a handful of native inputs; everything else is passed via `env:` there, `variables:` in GitLab, and `-e` flags with plain Docker.

## Action inputs (GitHub Actions only)

These are the only values passed with `with:` rather than `env:`. Each maps to the environment variable of the same name.

| Input            | Default       | Description                                                                                  |
| ---------------- | ------------- | -------------------------------------------------------------------------------------------- |
| `working-dir`    | empty         | Working directory, relative to the repository root or absolute. Must be under the workspace. |
| `component-purl` | none          | Override the component PURL, for example `pkg:npm/@scope/name@1.0.0`.                        |
| `bom-type`       | `sbom`        | Artifact type recorded on upload: `sbom`, `vex`, `cbom` or `hbom`.                           |
| `oidc-audience`  | `sbomify.com` | OIDC audience for trusted publishing. Override for self-hosted.                              |

> **Monorepo gotcha:** the workflow-level `working-directory:` setting has no effect on this action, because it runs in a container. Use the `working-dir` input instead.

## Input source

Exactly one of these is required.

| Variable       | Description                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOCK_FILE`    | Path to a lockfile. Set to `none` for additional-packages-only mode.                                                                                          |
| `SBOM_FILE`    | Path to an existing SBOM to process rather than generate. Set to `none` for additional-packages-only mode.                                                    |
| `DOCKER_IMAGE` | Container image reference, for example `nginx:latest`.                                                                                                        |
| `SOURCE_DIR`   | Directory to scan with Syft. **Last resort** - prefer `LOCK_FILE` whenever one exists, see [directory scanning](/sbomify-action/sources/#directory-scanning). |

## Output

| Variable       | Default            | Description                                                                                           |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `OUTPUT_FILE`  | `sbom_output.json` | Where to write the final SBOM.                                                                        |
| `SBOM_FORMAT`  | `cyclonedx`        | `cyclonedx` or `spdx`.                                                                                |
| `SPEC_VERSION` | `1.6` or `2.3`     | Spec version to generate, for example `1.7` or `2.2`. SPDX 3.0.1 cannot be generated, only processed. |
| `BOM_TYPE`     | `sbom`             | `sbom`, `vex`, `cbom` or `hbom`.                                                                      |

Non-SBOM `BOM_TYPE` values are uploaded verbatim to sbomify: augmentation, enrichment, overrides, package injection and finalization fixups are all skipped, and Dependency Track and `PRODUCT_RELEASE` are rejected.

## Processing

| Variable                   | Default                   | Description                                                                                                                                                                                                |
| -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENRICH`                   | `false`                   | Add per-component metadata from package registries.                                                                                                                                                        |
| `AUGMENT`                  | `false`                   | Add organisational metadata from `sbomify.json` or the sbomify API.                                                                                                                                        |
| `OVERRIDE_SBOM_METADATA`   | `false`                   | Let augmentation overwrite existing metadata instead of only filling gaps.                                                                                                                                 |
| `COMPONENT_NAME`           | none                      | Override the component name.                                                                                                                                                                               |
| `COMPONENT_VERSION`        | none                      | Override the component version.                                                                                                                                                                            |
| `COMPONENT_PURL`           | none                      | Add or override the component PURL.                                                                                                                                                                        |
| `ADDITIONAL_PACKAGES`      | none                      | Inline PURLs to inject, comma or newline separated.                                                                                                                                                        |
| `ADDITIONAL_PACKAGES_FILE` | `additional_packages.txt` | Path to a file of PURLs, one per line.                                                                                                                                                                     |
| `DISABLE_VCS_AUGMENTATION` | `false`                   | Disable automatic VCS detection from the CI environment.                                                                                                                                                   |
| `SUBMODULE_PATH`           | none                      | Treat the component as a git submodule pinned at this path. Resolves the pin to a version and reuses an existing SBOM at that version if there is one. Requires `LOCK_FILE` and the `sbomify` destination. |
| `WORKING_DIR`              | none                      | Working directory. On GitHub Actions prefer the `working-dir` input.                                                                                                                                       |

## Uploading

| Variable                 | Default                   | Description                                                                     |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------- |
| `UPLOAD`                 | `true`                    | Set to `false` to generate without uploading anywhere.                          |
| `UPLOAD_DESTINATIONS`    | `sbomify`                 | Comma-separated: `sbomify`, `dependency-track`.                                 |
| `TOKEN`                  | none                      | sbomify API token.                                                              |
| `SBOMIFY_TOKEN`          | none                      | sbomify API token. **Takes precedence over `TOKEN`.**                           |
| `COMPONENT_ID`           | none                      | sbomify component ID. Required for upload and for sbomify-sourced augmentation. |
| `PRODUCT_RELEASE`        | none                      | JSON array of product and version strings.                                      |
| `API_BASE_URL`           | `https://app.sbomify.com` | Override for self-hosted instances.                                             |
| `OIDC_AUDIENCE`          | `sbomify.com`             | Audience for trusted publishing. Derived from `API_BASE_URL` when self-hosted.  |
| `SBOMIFY_UPLOAD_TIMEOUT` | `120`                     | Upload timeout in seconds. Raise for very large SBOMs.                          |

Credential precedence is the `--token` flag, then `SBOMIFY_TOKEN`, then `TOKEN`. If no token is present on GitHub Actions and the workflow grants `id-token: write`, [OIDC trusted publishing](/sbomify-action/publishing/#oidc-trusted-publishing) is used automatically.

### Dependency Track

Required when `dependency-track` is in `UPLOAD_DESTINATIONS`. CycloneDX only - Dependency Track does not accept SPDX.

| Variable                                 | Required | Description                                                      |
| ---------------------------------------- | -------- | ---------------------------------------------------------------- |
| `DTRACK_API_KEY`                         | Yes      | Dependency Track API key.                                        |
| `DTRACK_API_URL`                         | Yes      | Full API base URL, for example `https://dtrack.example.com/api`. |
| `DTRACK_PROJECT_ID`                      | Either   | Project UUID.                                                    |
| `COMPONENT_NAME` and `COMPONENT_VERSION` | Or both  | Used to identify the project instead of a UUID.                  |
| `DTRACK_AUTO_CREATE`                     | No       | Create the project if it does not exist. Defaults to `false`.    |
| `DTRACK_PROJECT_TAGS`                    | No       | Comma-separated tags.                                            |
| `DTRACK_PARENT_ID`                       | No       | Parent project ID.                                               |
| `DTRACK_PARENT_NAME`                     | No       | Parent project name.                                             |
| `DTRACK_PARENT_VERSION`                  | No       | Parent project version.                                          |
| `DTRACK_IS_LATEST`                       | No       | Mark this BOM as the latest version. Defaults to `false`.        |

## Caching and performance

| Variable                       | Default                              | Description                                                                                                                          |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SBOMIFY_CACHE_DIR`            | `~/.cache/sbomify`                   | Where license databases are cached. Roughly 20-50 MB.                                                                                |
| `SYFT_CACHE_DIR`               | none                                 | Syft's own package metadata cache.                                                                                                   |
| `XDG_CACHE_HOME`               | `~/.cache`                           | Fallback cache root when `SBOMIFY_CACHE_DIR` is unset.                                                                               |
| `SBOMIFY_TOOL_CACHE`           | none                                 | Where fetched tool runtimes are unpacked. Falls back to `XDG_CACHE_HOME`, then `$HOME/.cache`, then the temp directory.              |
| `SBOMIFY_FETCH_RUNTIMES`       | `1`                                  | Set to `0` to refuse downloading tool runtimes, for air-gapped builds. See [tool runtimes](/sbomify-action/advanced/#tool-runtimes). |
| `SBOMIFY_ENRICHMENT_CACHE`     | `1`                                  | Set to `0` to disable the on-disk enrichment response cache.                                                                         |
| `SBOMIFY_ENRICHMENT_CACHE_TTL` | none                                 | Override how long cached enrichment responses stay valid, in seconds.                                                                |
| `SBOMIFY_CLEARLY_CACHED_URL`   | `https://clearly-cached.sbomify.com` | Point ClearlyDefined lookups at your own [clearly-cached](https://github.com/sbomify/clearly-cached) instance.                       |
| `GITHUB_TOKEN` or `GH_TOKEN`   | none                                 | **Strongly recommended.** Authenticates license database downloads.                                                                  |

`GITHUB_TOKEN` is worth calling out. License databases are downloaded from GitHub Releases, and unauthenticated requests are limited to 60 per hour per IP address. On shared CI runners that limit is often already exhausted, and when it is, **enrichment degrades silently** - you get an SBOM with fewer licenses populated and no hard error. This applies on every runtime, not just GitHub Actions. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Diagnostics and privacy

| Variable     | Default | Description                                                           |
| ------------ | ------- | --------------------------------------------------------------------- |
| `VERBOSE`    | `false` | Verbose logging. Equivalent to `--verbose`.                           |
| `TELEMETRY`  | `true`  | **Error telemetry is enabled by default.** Set to `false` to disable. |
| `SENTRY_DSN` | none    | Point error telemetry at your own Sentry instance.                    |

The action reports unhandled errors to Sentry unless you opt out. If your policy prohibits outbound diagnostics, set `TELEMETRY=false` or pass `--no-telemetry`. See [telemetry and privacy](/sbomify-action/advanced/#telemetry-and-privacy).

## Advanced

| Variable                               | Default | Description                                                                                                         |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `SBOMIFY_ENABLE_LICENSE_DB_GENERATION` | `false` | Allow local license database generation when no prebuilt one is available. Slow - Debian and Ubuntu can take hours. |
| `SBOMIFY_LICENSE_DB_WORKERS`           | `5`     | Parallelism for the `sbomify-license-db` tool.                                                                      |
| `SBOMIFY_VCS_URL`                      | none    | TeamCity only. Repository URL, trusted as given and taking precedence over detection.                               |
| `SBOMIFY_VCS_REF`                      | none    | TeamCity only. Branch or tag, used when the build properties file is not readable.                                  |

`SBOMIFY_VCS_URL` and `SBOMIFY_VCS_REF` exist because TeamCity keeps repository details in a properties file rather than the environment, and a containerised step may not be able to read it. The other runtimes need no equivalent. See [TeamCity](/sbomify-action/runtimes/teamcity/#vcs-information).

## Deprecated

Still honoured, but they log a warning. Use the replacement.

| Deprecated      | Use instead         |
| --------------- | ------------------- |
| `SBOM_VERSION`  | `COMPONENT_VERSION` |
| `OVERRIDE_NAME` | `COMPONENT_NAME`    |

## Set automatically by CI

You do not set these. They are read from the environment to detect VCS information and, on GitHub Actions, to perform the OIDC exchange.

- **GitHub Actions** - `GITHUB_REPOSITORY`, `GITHUB_SERVER_URL`, `GITHUB_SHA`, `GITHUB_REF`, `GITHUB_REF_NAME`, `GITHUB_WORKSPACE`, `GITHUB_RUN_ID`, `GITHUB_REPOSITORY_VISIBILITY`, `ACTIONS_ID_TOKEN_REQUEST_URL`, `ACTIONS_ID_TOKEN_REQUEST_TOKEN`
- **GitLab CI** - `CI_PROJECT_URL`, `CI_PROJECT_PATH`, `CI_SERVER_URL`, `CI_COMMIT_SHA`, `CI_COMMIT_REF_NAME`, `CI_PIPELINE_ID`, `CI_PROJECT_VISIBILITY`
- **Bitbucket** - `BITBUCKET_WORKSPACE`, `BITBUCKET_REPO_SLUG`, `BITBUCKET_COMMIT`, `BITBUCKET_BRANCH`, `BITBUCKET_TAG`, `BITBUCKET_GIT_HTTP_ORIGIN`
- **TeamCity** - `TEAMCITY_VERSION`, `BUILD_VCS_NUMBER` (and `BUILD_VCS_NUMBER_<VcsRootId>` on multi-root builds), `TEAMCITY_BUILD_PROPERTIES_FILE`

The two OIDC request variables only exist when the workflow grants `permissions: id-token: write`.

## CLI flags

Every variable has a matching flag when you invoke the CLI directly. Flags win over environment variables.

```bash
sbomify-action --lock-file requirements.txt --enrich --no-upload -o sbom.cdx.json
```

| Flag                                                           | Equivalent                         |
| -------------------------------------------------------------- | ---------------------------------- |
| `--lock-file`, `--sbom-file`, `--docker-image`, `--source-dir` | input source                       |
| `--submodule-path`                                             | `SUBMODULE_PATH`                   |
| `-o`, `--output-file`                                          | `OUTPUT_FILE`                      |
| `-f`, `--sbom-format`                                          | `SBOM_FORMAT`                      |
| `--spec-version`                                               | `SPEC_VERSION`                     |
| `--bom-type`                                                   | `BOM_TYPE`                         |
| `--enrich`, `--no-enrich`                                      | `ENRICH`                           |
| `--augment`, `--no-augment`                                    | `AUGMENT`                          |
| `--override-sbom-metadata`                                     | `OVERRIDE_SBOM_METADATA`           |
| `--upload`, `--no-upload`                                      | `UPLOAD`                           |
| `--upload-destination`                                         | `UPLOAD_DESTINATIONS`. Repeatable. |
| `--token`, `--component-id`                                    | `TOKEN`, `COMPONENT_ID`            |
| `--component-name`, `--component-version`, `--component-purl`  | matching variables                 |
| `--product-release`                                            | `PRODUCT_RELEASE`                  |
| `--api-base-url`, `--oidc-audience`                            | matching variables                 |
| `--working-dir`                                                | `WORKING_DIR`                      |
| `--telemetry`, `--no-telemetry`                                | `TELEMETRY`                        |
| `-v`, `--verbose`, `-q`, `--quiet`                             | `VERBOSE`                          |

### Subcommands

| Command                 | Purpose                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `sbomify-action wizard` | Interactive setup. `init` is an alias. See [quick start](/sbomify-action/quickstart/).                              |
| `sbomify-action yocto`  | Process Yocto and OpenEmbedded SPDX archives. See [input sources](/sbomify-action/sources/#yocto-and-openembedded). |
| `sbomify-license-db`    | Generate a distro license database locally. Advanced.                                                               |
