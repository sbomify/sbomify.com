---

title: Comprehensive Guide to Generating and Understanding SBOMs with Docker and Django-CMS
description: "Practical walkthrough of generating SBOMs from Docker containers and Python projects using Django-CMS as an example, covering cyclonedx-python, docker sbom, and transitive dependencies."
categories:
  - guide
tags: [sbom, docker, django, tutorial]
author:
  display_name: Cowboy Neil
  login: Cowboy Neil
author_login: Cowboy Neil
author_url: https://sbomify.com
wordpress_id: 246
wordpress_url: https://sbomify.com/?p=246
date: '2024-05-27 16:18:25 +0200'
date_gmt: '2024-05-27 16:18:25 +0200'
comments:
slug: comprehensive-guide-to-generating-and-understanding-sboms-with-docker-and-django-cms
---

It's fair to say that SBOMs (Software Bill of Materials) is a rapidly emerging field. Many vendors, like Docker and GitHub, now offer tools to automatically generate SBOMs for you. That's great, but maybe we should first start by asking ourselves what should really go into an SBOM.

The simplest answer to this question is that it should include everything that makes up your software. Thus, things like dependencies (such as open source libraries used) should go into the SBOM. This is where it gets a bit murkier.

What about dependencies that you're only using for testing, such as a unit test library? This is never used in the production environment, so it's more like a soft dependency.

But what about your runtime environment? If you're using a dockerized runtime environment, it's relatively easy to determine what's part of your application stack, but less so if you're running on bare metal or in a Virtual Machine (VM). You could argue that you need to generate an SBOM from your Infrastructure-as-Code (IaC), such as Terraform/OpenTofu or Ansible, which holds the truths about your runtime environment. That is, assuming you even pin the releases of all of this.

It's also important to point out that an SBOM is not an absolute truth for a product. It's just true at the time of generation and might change the next time you fire off a build in your CI/CD pipeline. This largely depends on how strictly you pin your dependencies (and how strictly your dependencies pin their dependencies). It is, however, important to stress that SBOM generation needs to be part of your CI/CD pipeline to be relevant.

Your mileage may vary, but to keep things simple, for the sake of this article, let's focus on the 'hard dependencies,' meaning things that are required for your software to work. Let's also assume that your application is running in Docker to keep things simple and that everything that goes inside your Dockerfile is a hard requirement.

A project can, of course, span multiple services (e.g., microservices), but let's again keep things simple and focus on a single monolith application that lives inside a single Docker container.

### An Example Project: Django-CMS

To make things more realistic, let's use the open-source project [Django CMS](https://github.com/django-cms/django-cms/) and their [Django CMS Quickstart](https://github.com/django-cms/django-cms-quickstart) as the basis for our exploration.

Taking a closer look at this example, we will find a `requirements.txt` file as expected for a Python project. There are several tools we can use to generate an SBOM for this file, including [cyclonedx-python](https://github.com/CycloneDX/cyclonedx-python), which will generate an SBOM in CycloneDX format:

```bash
$ cyclonedx-py requirements \
    requirements.txt \
    -o sbom.json
```

There are other tools, like [spdx-sbom-generator](https://github.com/opensbom-generator/spdx-sbom-generator), that can generate SBOMs in SPDX format (rather than CycloneDX as we used above).

Now that we have our SBOM for the application layer, we can move on to the `Dockerfile` to build an SBOM for our Docker environment. We can do this as follows:

```bash
$ docker build . -t django-cms
[...]
$ docker sbom \
    --format cyclonedx-json \
    -o docker-sbom.json \
    django-cms
```

Now we have two files:

- `sbom.json`
- `docker-sbom.json`

Let's take a look at them:

```bash
$ wc -l sbom.json
1053 sbom.json

$ wc -l docker-sbom.json
48162 docker-sbom.json
```

Whoa! The first SBOM is just over 1,000 lines, whereas the one from Docker is ~48 times that size. Why is that? As it turns out, Docker will actually do more than just give you information about the runtime. In fact, it gives you an SBOM for the runtime and your application stack. Under the hood, `docker sbom` uses [syft](https://github.com/anchore/syft), which is capable of generating SBOMs for Python too. Thus, we can disregard our first SBOM.

The elegant thing about extracting our SBOM from a Docker container over a `requirements.txt` file is that assuming we are building our Docker containers correctly and not bundling our test dependencies in there, we have solved for this in the process.

### But wait, what about sub-dependencies?

Fantastic question! If we go back to django-cms, we notice that there is a dependency outside of Python by the presence of [`package.json`](https://github.com/django-cms/django-cms/blob/develop-4/package.json) (and `package-lock.json`). If we randomly pick a dependency in there (such as babel-runtime), we can indeed prove that this is missing:

```bash
$ grep babel-runtime docker-sbom.json
[...]
```

This is where it gets tricky. If there is a vulnerability in this package, a surface-level exploration of the SBOM with a tool like [osv-scanner](https://osv.dev/) would not pick up on this. This is generally known as transitive dependencies. To address this, we need to "explode" the SBOM, but that's outside the scope of this article.
