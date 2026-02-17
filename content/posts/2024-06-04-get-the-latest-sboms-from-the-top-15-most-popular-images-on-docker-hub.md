---

title: Get the latest SBOMs from the top 15 most popular images on Docker Hub
description: "Automated nightly SBOM generation for Docker Hub's top 15 images including nginx, postgres, redis, and node using Syft in GitHub Actions CI/CD pipeline."
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
  url: https://sbomify.com
author_login: Cowboy Neil
author_url: https://sbomify.com
wordpress_id: 259
wordpress_url: https://sbomify.com/?p=259
date: '2024-06-04 14:52:07 +0200'
date_gmt: '2024-06-04 14:52:07 +0200'
category: news
tags: [sbom, docker, containers]
comments: []
slug: get-the-latest-sboms-from-the-top-15-most-popular-images-on-docker-hub
---

Most companies that use Docker also use Docker Hub in some capacity. Have you ever wondered how secure these images are? In our article [Comprehensive Guide to Generating and Understanding SBOMs with Docker and Django-CMS](https://sbomify.com/2024/05/27/comprehensive-guide-to-generating-and-understanding-sboms-with-docker-and-django-cms/), we talked about how to generate SBOMs from a Docker image.

In this article, we are taking this one step further and automating the process in our CI/CD pipeline (in this case [GitHub Actions](https://docs.github.com/en/actions)). We've created a GitHub repository called [docker-hub-sbom](https://github.com/sbomify/docker-hub-sbom) that automatically builds SBOMs for the top 15 Docker Hub images every night.

The top 15 most popular (official) Docker images are as follows:

- alpine
- busybox
- docker
- hello-world
- httpd
- memcached
- mongo
- mysql
- nginx
- node
- postgres
- python
- rabbitmq
- redis
- ubuntu

To keep things simple, we will only generate the SBOM for the 'latest' tag of each disk image.

Unlike in our previous guide, we will not use the `docker sbom` feature available in Docker Desktop. Instead, we will use the tool that Docker Desktop uses behind the scenes, namely [syft](https://github.com/anchore/syft).

The full CI/CD pipeline is defined in [build-sboms.yml](https://github.com/sbomify/docker-hub-sbom/blob/master/.github/workflows/build-sboms.yml), but in simple terms, all it does is iterate over the list of images and then use `syft` to build an SBOM both in CycloneDX and SPDX format.

After each run has been successful, it publishes the SBOMs as artifacts. You can see an example of this in [this run](https://github.com/sbomify/docker-hub-sbom/actions/runs/9359480735). For instance, you can download the SBOM for nginx ([CycloneDX](https://github.com/sbomify/docker-hub-sbom/actions/runs/9359480735/artifacts/1564889381) and [SPDX](https://github.com/sbomify/docker-hub-sbom/actions/runs/9359480735/artifacts/1564889383)).

There are a few important things to point out here:

- First, this way of generating SBOMs is completely CI/CD agnostic. You could easily take this workflow and implement it on other tools like [Travis](https://www.travis-ci.com/), [Jenkins](https://www.jenkins.io/), [TeamCity](https://www.jetbrains.com/teamcity/) or almost any other CI/CD platform.
- Second, while we are using upstream Docker Hub images in this example, you could just swap this out for your own internal Docker images for your application and get the same result.
