---
layout: post
title: "How to generate an SBOM from a Docker container"
author:
  display_name: Viktor
categories: sbom docker tutorial education

---

A lot of people are asking about how one can generate an SBOM based on a Docker container. It seems to be a good idea, since a lot of modern software is shipped in Docker containers, so it's completely understandable why this is appealing.

## Why You Shouldn't Generate an SBOM from a Docker Container

Before we dive into _how_ to generate an SBOM from a Docker container, let's first talk about why you shouldn't do it this way. Or rather, what the limitations of generating an SBOM from a Docker container are.

Generally speaking, Docker containers will come with a set of system packages and runtime dependencies. Once you've installed your dependencies, you usually have a final step where you copy in your actual application codebase. There are, of course, countless exceptions to this (and multi-stage builds make things even murkier).

Now, capturing the system packages and runtime dependencies from a Docker container (assuming you're not using an obscure flavor) is a fairly straightforward task. If you go to our [resources]({{ site.url }}/resources/), you can find a few tools that can do this well. Perhaps the most popular ones at the time of this writing ar Syft and Trivy. In our [sbom-benchmark](https://github.com/sbomify/sbom-benchmarks) repository, you can see that both of these jobs do a good job in capturing this.

The problem is not with these packages, but rather what happens in the following layers. For instance, if you copy in a binary of sorts into your Docker container, more or less no SBOM generation tool will be able to capture this. This is because the tools usually are looking at the system package database to construct the list. If this list is incomplete (e.g. you're copying in a binary), or tampered with, none of these tools will pick it up.

Tools like Syft and Trivy are however pretty good at picking up installed packages from various programming languages, but the quality will vary from language to language.

You have been warned. Proceed with caution.

Our recommendation is to separate the container SBOM from the application SBOM. This way you use more customized tooling in order to achieve a more accurate SBOM.

## How to generate an SBOM form a container image

You can find a number of tools on our [resources]({{ site.url }}/resources/) page that can be used for generating SBOMs. Let's go though one-by-one how to do this. You can find a complete example in our [sbom-benchmark](https://github.com/sbomify/sbom-benchmarks) repository.

### Syft

You first need to install [Syft](https://github.com/anchore/syft), and then run it with the following command:

```bash
$ syft \
    nginx:stable \
    -o cyclonedx-json \
    > syft.cdx.json
```

This will generate an SBOM in CycloneDX format, and save it to `syft.cdx.json`.

Would you rather generate a SPDX SBOM, you can do this by running:

```bash
$ syft \
  nginx:stable \
  -o spdx-json \
  > syft.spdx.json
```

### Trivy

You can download [Trivy](https://github.com/aquasecurity/trivy), and then run it with the following command to generate an SBOM in CycloneDX format, and save it to `trivy.cdx.json`.

```bash
$ trivy image \
  --format cyclonedx \
  --output trivy.cdx.json \
  nginx:stable
```

Would you rather generate a SPDX SBOM, you can do this by running:

```bash
$ trivy image \
  --format spdx-json \
  --output trivy.spdx.json \
  nginx:stable
```

### Docker Desktop

If you have Docker Desktop installed, you can also use this to generate an SBOM in SPDX format, and save it to `docker.spdx.json`:

```bash
$ docker sbom \
  –-format spdx-json \
  nginx:stable > docker.spdx.json
```

It's worth noting that Docker is largely using Syft behind the scene. Docker is doing some extra things, but it also is more restrictive in output formats. We covered more about this in [this blog post]({{ site.baseurl }}{% post_url 2024-04-07-how-to-create-an-sbom %}).

### sbomify action

You can also use the [sbomify SBOM Generation tool](https://github.com/marketplace/actions/sbomify) directly in GitHub as follows:

```yaml
- name: Upload SBOM
  uses: sbomify/github-action@master
  env:
    TOKEN: ${%raw%}{{ secrets.SBOMIFY_TOKEN }}{%endraw%}
    COMPONENT_ID: 'my-component-id'
    DOCKER_IMAGE: 'nginx:stable'
    COMPONENT_NAME: 'nginx-container'
    COMPONENT_VERSION: ${%raw%}{{ github.ref_name }}{%endraw%}
    AUGMENT: true
    ENRICH: true
```

For more details on using the GitHub Action and other CI/CD integrations, see our [integrations page]({{ site.url }}/features/integrations/).
