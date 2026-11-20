---
title: "How do I create a software release in sbomify?"
description: "Step-by-step guide to creating a product release in sbomify by linking existing component SBOMs to a versioned release."
answer: "Upload your component SBOMs first, then create a product release that points to specific SBOMs. Each SBOM can have its own version and be shared across multiple releases."
tldr: "Upload your component SBOMs first, then create a product release that points to specific SBOMs. Each SBOM can have its own version and be shared across multiple releases."
weight: 77
keywords: [product release, software release, sbomify release, create release, SBOM versioning, release management]
url: /faq/how-do-i-create-a-software-release/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/release_creation.webm" title="How to create a software release in sbomify" description="Step-by-step screencast showing how to create a product release in sbomify by linking component SBOMs." upload_date="2026-02-26T19:24:17Z" >}}

## Creating a product release

A product release in sbomify ties together one or more component SBOMs (and other artifacts like compliance documents) under a single version. This is how you represent a shipped version of your software.

### Prerequisites

Before creating a release, you need:

- A **product** set up in sbomify (see [How do products work?](/faq/how-do-products-work-in-sbomify/))
- One or more **components** with uploaded SBOMs

### The "Latest" release

Every product automatically gets a `latest` release that always points to the most recent SBOM and documents of each component in the product. sbomify manages it for you (you cannot add or remove its artifacts by hand) - it's there as a stable URL for "whatever is current".

Named releases (e.g. `v2.1.0`) hold exactly the artifacts you add to them and do not move when new SBOMs are uploaded, which makes them what you should share with customers and auditors.

### Steps

1. Open your **Product** and choose **Create release** from its actions menu (or use **New** → **Add release** in the header)
2. On the **New release** page, check the **Product**, fill in **Release name** (e.g. `Middle-Out Rewrite`), **Version** (e.g. `v2.1.0`) and, optionally, a **Description** and dates, then click **Create release**
3. sbomify opens the new release
4. Click **Add Artifact**, use **Select All Visible** (or pick individual SBOMs and documents) in the artifact picker, then click **Add to Release**

If you upload from CI with [sbomify-action](/sbomify-action/publishing/), setting `PRODUCT_RELEASE` tags each uploaded SBOM into a release and creates the release if it does not exist yet.

### How versioning works

Component SBOMs and product releases are versioned independently. For example, your product `v2.1.0` might include a backend component at `v1.8.3` and a frontend at `v3.0.1`. The same component SBOM can also be shared across multiple product releases - if two products ship the same library version, there's no need to upload it twice.
