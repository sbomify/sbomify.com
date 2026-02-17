---

title: How to create an SBOM
description: "Step-by-step guide to generating SBOMs using Docker CLI and GitHub tools including the command line interface, Dependency Graph, and REST API."
author:
  display_name: Viktor Petersson
author_url: https://sbomify.com
wordpress_id: 175
wordpress_url: https://sbomify.com/?p=175
date: '2024-04-07 11:32:45 +0200'
date_gmt: '2024-04-07 11:32:45 +0200'
category: guide
tags: [sbom, tutorial]
comments: []
slug: how-to-create-an-sbom
---

<div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="ml-4">
      <h3 class="text-lg font-semibold text-blue-800 mt-0">📘 Updated Guides Available</h3>
      <p class="text-blue-700 mt-2 mb-0">This article provides a general overview, but we now have more comprehensive and up-to-date guides available. Check out our <a href="/guides/" class="font-semibold underline hover:text-blue-900">SBOM Generation Guides</a> for language-specific instructions covering Python, JavaScript, Go, Rust, Java, Docker, and many more.</p>
    </div>
  </div>
</div>

In the evolving landscape of software development and cybersecurity, the importance of creating a Software Bill of Materials (SBOM) has never been more critical. As organizations and developers seek to enhance transparency and security in their software supply chain, understanding how to generate an SBOM efficiently becomes a foundational step. This article serves as a comprehensive guide on how to create, generate, and build an SBOM, ensuring that you're equipped with the knowledge to improve your software's integrity and trustworthiness. By detailing the process of generating an SBOM, we aim to empower developers and organizations alike to take proactive steps in securing their software ecosystems against vulnerabilities and threats.

### Using Docker

If you are using a recent version of Docker Engine, you can generate an SBOM directly from the `docker` command. While this feature is still [flagged as experimental](https://docs.docker.com/engine/sbom/), it is indeed supported out of the box.

To do this, simply run:

```bash
$ docker sbom \
    –-format spdx-json \
    nginx:latest > docker-sbom.json
```

This will generate a file called `docker-sbom.json`, which is an SBOM for the `nginx:latest` docker image in your current directory. In this example, we're using the [SPDX](https://spdx.dev) SBOM format, but other formats are supported, including:

- syft-json
- cyclonedx-xml
- cyclonedx-json
- github-0-json
- spdx-tag-value
- pdx-json
- table
- text

The default value is table.

### Using GitHub

GitHub also supports generating SBOM in a few ways:

- Using the GitHub Command Line Interface
- Using the Export feature in Dependency Graph
- Using the RESTful API

Note that GitHub currently only allows you to export SBOMs in the SPDX format.

#### Using the Command Line Interface

To enable the SBOM feature in the GitHub CLI, you need to first install the SBOM extension:

```bash
gh ext install advanced-security/gh-sbom
```

With the extension installed, you can generate an SBOM directly from your terminal using the `gh sbom` command. To use this, simply jump into the GitHub repository you want to generate an SBOM for, and then run:

```bash
gh sbom > my-sbom.json
```

This will generate a file called `my-sbom.json` in your current working directory.

There's also a GitHub Actions workflow [available](https://github.com/marketplace/actions/sbom-generator-action) that allows you to build the SBOM during your CI/CD run.

#### Using Dependency Graph

Navigate to your GitHub repository in your browser. Then go to:

- Insights
- Dependency Graph
- Export SBOM

#### Using the RESTful API

GitHub exposes the same functionality using this [RESTful API](https://docs.github.com/en/rest/dependency-graph/sboms?apiVersion=2022-11-28).

```
```
