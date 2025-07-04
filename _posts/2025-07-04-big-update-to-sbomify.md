---
layout: post
title: "Big Update to sbomify"
date: 2025-07-04 09:00:00 +0000
categories: announcement update
author:
  display_name: Viktor
---

Happy 4 July to our US friends.

Today, we are pleased to announce that we have shipped yet another big update to sbomify, version 0.15. This release has two major focuses:

* **Improving the look and feel – and overall experience – of all public pages**
* **Introducing support for documents in addition to SBOMs**

The latter is especially important because it paves the way toward our ultimate goal: becoming the best open implementation of CycloneDX's Transparency Exchange API (TEA), where documents are first-class citizens.

## Why are these two features such a big deal?

Imagine you are a product company. People in the community have told us they want a portal where they can direct users to security artifacts. These artifacts might be SBOMs, but they could also include penetration testing results, FCC or CE certification documents, and many other items.

With this new feature, that is now possible. All you need to do is create a new "Component" in sbomify and upload your documents there with versioning. If you create a product (such as "sbomify") and a project (for example, "compliance documents"), you can then add a component called "FCC Certificates" and share those documents by making the relevant components public directly in the user interface.

## A Compliance Hub

In short, sbomify is evolving into a compliance hub. SBOMs remain important, but they are now just one part of a broader picture. Speaking of SBOMs, we have also exposed our product- and project-level SBOM aggregation download feature to public pages. This means that if you have a project with ten different components—for example, ten different microservices—you can now download an aggregated SBOM that links all of them together using externalReferences in CycloneDX*.

Want a live demo? Check out our public page:
https://app.sbomify.com/public/product/eP_4dk8ixV/

_* Note: This is currently available only for CycloneDX, and it assumes your SBOM components are marked as public._