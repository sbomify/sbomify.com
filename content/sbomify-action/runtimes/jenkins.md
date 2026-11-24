---

url: /sbomify-action/runtimes/jenkins/
aliases:
  - /guides/sbomify-action/runtimes/jenkins/
title: "SBOM Generation in Jenkins"
description: "Run the sbomify action in Jenkins declarative and scripted pipelines, with credentials, caching and VCS detection from the Git plugin's variables."
keywords: ["Jenkins SBOM", "Jenkins pipeline SBOM", "CycloneDX Jenkins"]
tldr: "Use the container image as a pipeline agent. Repository, commit and branch are read from the Git plugin's build variables, with the checkout as the fallback; sbomify.json overrides them if you need something else recorded."
---

Jenkins runs the container image as a pipeline agent. Both declarative and scripted pipelines work.

## Declarative pipeline

```groovy
pipeline {
    agent {
        docker { image 'ghcr.io/sbomify/sbomify-action' }
    }

    environment {
        LOCK_FILE   = 'requirements.txt'
        OUTPUT_FILE = 'sbom.cdx.json'
        ENRICH      = 'true'
        UPLOAD      = 'false'
    }

    stages {
        stage('Generate SBOM') {
            steps {
                sh 'sbomify-action'
            }
        }
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'sbom.cdx.json'
            }
        }
    }
}
```

> If you have an older pipeline calling `/sbomify.sh`, update it. That entrypoint no longer exists; the command is `sbomify-action`.

## With credentials

Store the token in the Jenkins credential store as a secret text credential, and inject it only where needed:

```groovy
pipeline {
    agent {
        docker { image 'ghcr.io/sbomify/sbomify-action' }
    }

    environment {
        COMPONENT_ID = 'your-component-id'
        LOCK_FILE    = 'requirements.txt'
        AUGMENT      = 'true'
        ENRICH       = 'true'
    }

    stages {
        stage('Generate and upload SBOM') {
            steps {
                withCredentials([string(credentialsId: 'sbomify-token', variable: 'TOKEN')]) {
                    sh 'sbomify-action'
                }
            }
        }
    }
}
```

`withCredentials` masks the value in console output. Avoid putting the token in a global `environment` block, where it is in scope for every stage.

Jenkins does not support OIDC trusted publishing - that is currently GitHub-only.

## Scripted pipeline

```groovy
node {
    checkout scm

    docker.image('ghcr.io/sbomify/sbomify-action').inside {
        withCredentials([string(credentialsId: 'sbomify-token', variable: 'TOKEN')]) {
            sh '''
                export COMPONENT_ID="your-component-id"
                export LOCK_FILE="requirements.txt"
                export ENRICH="true"
                sbomify-action
            '''
        }
    }

    archiveArtifacts artifacts: 'sbom.cdx.json', allowEmptyArchive: false
}
```

## VCS information

Repository URL, commit SHA and branch are detected automatically, read from the variables the Git plugin exports into the build. Nothing to configure.

Detection landed after `v26.8.0`, so it is present on `master` and in any release tagged since. Older tags read the git checkout instead, which is still the fallback described below.

| Field         | Read from                                                                         |
| ------------- | --------------------------------------------------------------------------------- |
| Repository    | `GIT_URL`, or `GIT_URL_1` when the job has more than one SCM                      |
| Commit        | `GIT_COMMIT`                                                                      |
| Branch or tag | `GIT_LOCAL_BRANCH`, then `TAG_NAME`, `CHANGE_BRANCH`, `BRANCH_NAME`, `GIT_BRANCH` |

The ref list is in that order for a reason. On a multibranch pull request build `BRANCH_NAME` is Jenkins' own `PR-42` - a job name, not a ref anyone can check out - so `CHANGE_BRANCH`, the branch the request came _from_, is preferred. `GIT_BRANCH` is remote-tracking (`origin/main`, or `refs/remotes/origin/main` on older plugin versions), and the remote is stripped before the branch is recorded.

An SSH remote, or one carrying an embedded credential, is normalised to a browsable URL. A commit link is added for github.com, gitlab.com and bitbucket.org, plus self-hosted GitHub and GitLab. An internal Git server gets the repository URL and the SHA without a link rather than a guessed one that 404s.

**Why the environment rather than `git`.** `checkout scm` leaves a detached HEAD, so the checkout can name a tag that happens to point at the commit and nothing else. Jenkins knows which branch the job was triggered for, and on a pull request it knows which branch the request came from. Neither is recoverable from the working directory.

### Falling back to the checkout

Jenkins is VCS-agnostic. A job on Subversion or Perforce, or with no SCM at all, exports none of the `GIT_*` variables, and so does a scripted pipeline whose `checkout` step does not publish them. When `GIT_URL` is missing the action reads the git checkout in the workspace instead - the behaviour Jenkins had before it became a platform of its own.

Two things have to be true for that, and a normal `checkout scm` gives you both: the `.git` directory is present in the workspace the container sees, and the repository has a remote (`origin`, or the first one configured). If neither path yields a repository URL, nothing is emitted rather than a partial claim.

### Overriding

Set the fields in `sbomify.json` when you want something other than what the job reports - an internal mirror rewritten to its public URL, for example:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

`sbomify.json` wins over detection. Writing `GIT_URL`, `GIT_COMMIT` and `GIT_BRANCH` into it from an earlier stage is no longer necessary - those are exactly what the action reads for itself. Set `AUGMENT: 'true'` when you are supplying other metadata alongside it. See [augmentation](/sbomify-action/augmentation/).

## Versioning

Use the tag if there is one, and fall back to the commit:

```groovy
environment {
    COMPONENT_NAME    = 'my-app'
    COMPONENT_VERSION = "${env.TAG_NAME ?: env.GIT_COMMIT}"
}
```

## Caching

Mount a persistent directory on the agent:

```groovy
agent {
    docker {
        image 'ghcr.io/sbomify/sbomify-action'
        args '-v /var/jenkins_cache/sbomify:/cache'
    }
}

environment {
    SBOMIFY_CACHE_DIR = '/cache/sbomify'
    SYFT_CACHE_DIR    = '/cache/syft'
}
```

Also set `GITHUB_TOKEN`. License databases come from GitHub Releases whatever CI you use, and unauthenticated requests are limited to 60 per hour per IP. Long-lived Jenkins agents with a stable outbound IP hit that ceiling quickly, and when they do enrichment degrades silently. See [license database rate limits](/sbomify-action/enrichment/#license-database-rate-limits).

## Container images

The agent needs access to a Docker daemon, usually by mounting the socket:

```groovy
agent {
    docker {
        image 'ghcr.io/sbomify/sbomify-action'
        args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
}

environment {
    DOCKER_IMAGE = "my-app:${env.BUILD_NUMBER}"
    OUTPUT_FILE  = 'container-sbom.cdx.json'
    ENRICH       = 'true'
    UPLOAD       = 'false'
}
```

Mounting the Docker socket grants the container control of the host daemon. Use a rootless or remote daemon where you can.

## Monorepos

```groovy
environment {
    WORKING_DIR = 'packages/my-app'
    LOCK_FILE   = 'package-lock.json'
}
```

For several components, use a `matrix` block or parallel stages, each with its own `COMPONENT_ID`.

## Signing

Build provenance attestation is GitHub-specific. Use [cosign](/faq/how-do-i-sign-an-sbom/), which runs anywhere.

## Next steps

- [Configuration reference](/sbomify-action/configuration/) - every option
- [Augmentation](/sbomify-action/augmentation/) - setting VCS details manually
- [Advanced](/sbomify-action/advanced/) - caching, audit trail, troubleshooting
