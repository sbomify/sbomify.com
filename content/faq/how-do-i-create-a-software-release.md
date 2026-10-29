---
title: "How do I create a software release in sbomify?"
description: "Step-by-step guide to creating a product release in sbomify by linking existing component SBOMs to a versioned release."
answer: "Upload your component SBOMs first. Then open the product, choose Create release from the Product actions menu, and add the artifacts that shipped in that version. Each SBOM keeps its own version and can be shared across multiple releases."
tldr: "Upload your component SBOMs first. Then open the product, choose Create release from the Product actions menu, and add the artifacts that shipped in that version. Each SBOM keeps its own version and can be shared across multiple releases."
weight: 77
keywords: [product release, software release, sbomify release, create release, SBOM versioning, release management]
url: /faq/how-do-i-create-a-software-release/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/release_creation.webm" title="How to create a software release in sbomify" description="Narrated screencast: create a release from the product actions menu and add the SBOM of every component that shipped in that version." upload_date="2026-10-28T00:00:00Z" >}}

## Creating a product release

A product release in sbomify ties together one or more component SBOMs (and other artifacts like compliance documents) under a single version. This is how you represent a shipped version of your software.

### Prerequisites

Before creating a release, you need:

- A **product** set up in sbomify (see [How do products work?](/faq/how-do-products-work-in-sbomify/))
- One or more **components** with uploaded SBOMs

### The "latest" release

Every product has a `latest` release. sbomify keeps it current with the newest artifact of each component. You don't need to manage it - it's there as a stable URL for "whatever is current".

Named releases (e.g. `v2.1.0`) are immutable snapshots and are what you should share with customers and auditors.

### Steps

1. Open **Products** and click your product
2. Open the **Product actions** menu at the top of the page and choose **Create release**
3. The product is already picked. Fill in a **Name** (e.g. `Middle-Out Rewrite`), a **Version** (e.g. `v2.1.0`), and an optional **Description**, then click **Create release**
4. The release starts empty. Click **Add Artifact**, search or filter the list, or use **Select All Visible** to pick every SBOM at once, then click **Add to Release**

### How versioning works

Component SBOMs and product releases are versioned independently. For example, your product `v2.1.0` might include a backend component at `v1.8.3` and a frontend at `v3.0.1`. The same component SBOM can also be shared across multiple product releases - if two products ship the same library version, there's no need to upload it twice.
