---

title: "Announcing sbomify's GitHub Actions Module: Seamlessly Share SBOMs in Your CI/CD Pipeline"
description: "Introducing sbomify's GitHub Actions module for automated SBOM generation in your CI/CD pipeline. Available on GitHub Marketplace for seamless integration."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, github-actions, security]
date: 2024-08-21
slug: introducing-github-action-module
---

We are thrilled to announce the launch of **sbomify's GitHub Actions Module** — now available in the [GitHub Marketplace](https://github.com/marketplace/actions/sbomify)! This powerful tool simplifies the process of generating Software Bill of Materials (SBOMs) right within your CI/CD pipeline, ensuring that your software components are transparently documented and compliant with industry standards.

## Why sbomify?

As software development evolves, transparency and security have become paramount. A Software Bill of Materials (SBOM) is a detailed list of components used in building a piece of software, allowing teams to manage vulnerabilities, license compliance, and supply chain risks effectively. With sbomify, you can automatically generate SBOMs as part of your development workflow, making it easier to maintain a secure and compliant software development lifecycle.

## Introducing sbomify’s GitHub Actions Module

The sbomify GitHub Action is designed to integrate seamlessly with your existing CI/CD pipelines, offering:

- **Automated SBOM Generation**: Automatically create SBOMs for your software projects as part of your CI/CD process, ensuring consistent documentation across all builds.
- **Compliance and Security**: Maintain compliance with industry standards and improve your software’s security posture by documenting all dependencies and components.
- **Easy Integration**: Simply add the sbomify Action to your workflow file, and it takes care of the rest. No complex configurations are required.

## How to Get Started

Getting started with sbomify is easy! Here's how you can integrate it into your project:

1. **Visit the Marketplace**: Head over to the [GitHub Marketplace](https://github.com/marketplace/actions/sbomify) to find the sbomify Action.
2. **Add sbomify to Your Workflow**: Add the sbomify Action to your GitHub Actions workflow by modifying your `.yml` file(s). You can find detailed setup instructions in the [sbomify GitHub repository](https://github.com/sbomify/github-action).
3. **Run Your Workflow**: Once integrated, every time your workflow runs, sbomify will automaticaally upload the generated SBOM for your project, which in turn can shared with your stakeholders. No more manual sharing of SBOMs over emails, your stakeholders can automatically pull down the latest SBOM directly from sbomify when they need it, ensuring they always have the latest version.

Here's a quick example of how to include sbomify in your workflow:

```yaml
name: Build and Generate SBOM

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    # Build your SBOM...

    - name: Upload SBOM
      uses: sbomify/github-action@master
      env:
        TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
        COMPONENT_ID: 'my-component-id'
        SBOM_FILE: 'sbom-file.json'
        COMPONENT_NAME: 'my-app'
        COMPONENT_VERSION: ${{ github.ref_name }}
        AUGMENT: true
        ENRICH: true
```

For more details on using the GitHub Action and other CI/CD integrations, see our [integrations page](/features/integrations/).

## Not using GitHub Actions?

No problem! Our tool can can easily be integrated in any other CI/CD pipeline. Just get in touch and we'll help you.

## Join Us in Building More Secure Software

As software supply chains become increasingly complex, tools like sbomify are essential for maintaining transparency and security. By integrating sbomify into your workflows, you're taking a proactive step towards better software management and compliance.

We’re excited to see how sbomify will help you build more secure and transparent software. Try it out today by visiting the [GitHub Marketplace](https://github.com/marketplace/actions/sbomify) and start sharing your SBOMs with ease!
