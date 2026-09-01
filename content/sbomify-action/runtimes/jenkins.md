---

url: /sbomify-action/runtimes/jenkins/
aliases:
  - /guides/sbomify-action/runtimes/jenkins/
title: "SBOM Generation in Jenkins"
description: "Run the sbomify action in Jenkins declarative and scripted pipelines, with credentials, caching and VCS detection from the checkout."
keywords: ["Jenkins SBOM", "Jenkins pipeline SBOM", "CycloneDX Jenkins"]
tldr: "Use the container image as a pipeline agent. Repository details are detected from the git checkout in the workspace; sbomify.json overrides them if you need something else recorded."
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

Repository URL, commit SHA and branch are detected automatically, read from the git checkout in the workspace. Jenkins exposes no repository variables worth trusting - which ones exist depends on the SCM plugin and the job type - so the action asks `git` directly instead. Nothing to configure.

Two things have to be true, and a normal `checkout scm` gives you both: the `.git` directory is present in the workspace the container sees, and the repository has a remote (`origin`, or the first one configured). If either is missing, nothing is emitted rather than a partial claim.

Set the fields in `sbomify.json` when you want something other than the remote recorded - an internal mirror rewritten to its public URL, for example:

```json
{
  "vcs_url": "https://github.com/my-org/my-repo",
  "vcs_commit_sha": "abc123def456",
  "vcs_ref": "main"
}
```

`sbomify.json` wins over detection. To populate it from the build, write the file in an earlier stage:

```groovy
stage('Prepare SBOM metadata') {
    steps {
        sh '''
            cat > sbomify.json <<EOF
            {
              "vcs_url": "${GIT_URL}",
              "vcs_commit_sha": "${GIT_COMMIT}",
              "vcs_ref": "${GIT_BRANCH}",
              "supplier": {"name": "My Company"},
              "lifecycle_phase": "build"
            }
            EOF
        '''
    }
}
```

`GIT_URL`, `GIT_COMMIT` and `GIT_BRANCH` are set by the Git plugin. Then set `AUGMENT: 'true'`. See [augmentation](/sbomify-action/augmentation/).

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
