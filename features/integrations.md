---
layout: page
description: "sbomify integrates with all your favorite tools."
title: sbomify integrations

---

## GitHub

GitHub is at the core of many organizations. That's why we started our integration journey with GitHub and wrote our [GitHub Actions integration](https://github.com/marketplace/actions/sbomify) first.

Using the sbomify Action for GitHub Actions is very straightforward. All you need to do is define a new step in your pipeline as follows:

```yaml
[...]
- name: Upload SBOM
  uses: sbomify/github-action@master
  env:
    TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
    COMPONENT_ID: 'my-component-id'
    SBOM_FILE: 'sbom-file.json'
    AUGMENT: true
    ENRICH: true
[...]
```

You can find more information about how to use our GitHub Actions module [here](https://github.com/sbomify/github-action).

## GitLab

If your organization is using GitLab instead of GitHub, that's fine -- we've got you covered with our [gitlab-pipeline](https://gitlab.com/sbomify/gitlab-pipeline).

The workflow is very similar to GitHub, but with some minor changes to adjust for the workflow in GitLab:

```yaml
[...]
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    TOKEN: $SBOMIFY_TOKEN
    COMPONENT_ID: 'Your Component ID'
    UPLOAD: true
    AUGMENT: true
    ENRICH: true
    SBOM_VERSION: $CI_COMMIT_SHA
    LOCK_FILE: 'poetry.lock'
    OUTPUT_FILE: 'test-sbom.cdx.json'
  script:
    - /sbomify.sh
[...]
```
You can find an example implementation [here](https://gitlab.com/sbomify/gitlab-pipeline/-/blob/master/.gitlab-ci.yml), and the arguments are the same as for GitHub.

## BitBucket

If you are using BitBucket, we've also got you covered with our [bitbucket-pipe](https://bitbucket.org/sbomify/bitbucket-pipe/).

The step to build the SBOM would look like this:

```yaml
[...]
- step:
    name: Build SBOM
    image: atlassian/default-image:latest
    script:
        - pipe: docker://sbomifyhub/sbomify-action:latest
          variables:
            TOKEN: $SBOMIFY_TOKEN
            COMPONENT_ID: "Your Component ID"
            UPLOAD: "true"
            AUGMENT: "true"
            ENRICH: "true"
            SBOM_VERSION: $BITBUCKET_COMMIT
            LOCK_FILE: "poetry.lock"
            OUTPUT_FILE: "bitbucket-sbom.cdx.json"
[...]
```

You can find an example implementation [here](https://bitbucket.org/sbomify/bitbucket-pipe/src/master/bitbucket-pipelines.yml), and the arguments are the same as for the GitHub Actions module.

## Docker

For Docker, or any other CI/CD pipelines that support Docker, you can use our Docker implementation directly.

```bash
$ docker run --rm \
   -v $(pwd):/code \
   -e TOKEN=<my token> \
   -e COMPONENT_ID=<my component id> \
   -e LOCK_FILE=/code/requirements.txt \
   sbomifyhub/sbomify-action
```

Please note that you cannot use `DOCKER_IMAGE` inside Docker unless you are running docker-in-docker.