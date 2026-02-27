---
title: "How do I set up a Trust Center in sbomify?"
description: "Step-by-step guide to enabling and configuring a Trust Center in sbomify, including custom domain setup."
answer: "Go to Settings > Trust Center, enable it, and set your custom domain. Trust Center requires a Business plan or higher."
tldr: "Go to Settings > Trust Center, enable it, and set your custom domain. Trust Center requires a Business plan or higher."
weight: 71
keywords: [Trust Center, set up Trust Center, enable Trust Center, custom domain, sbomify Trust Center, trust.sbomify.com]
url: /faq/how-do-i-set-up-a-trust-center/
---

## Setting up a Trust Center

The Trust Center is available on the **Business** plan and above. For background on what a Trust Center is and why it matters, see [What is a Trust Center?](/faq/what-is-a-trust-center/).

To set up your Trust Center:

1. Navigate to **Settings**
2. Go to the **Trust Center** section
3. **Enable** your Trust Center
4. Set your **custom domain** (e.g. `trust.yourcompany.com`)
5. Configure a CNAME record with your DNS provider pointing to sbomify

Once enabled, your uploaded SBOMs and compliance documents are automatically published to your Trust Center. You can see a live example at [trust.sbomify.com](https://trust.sbomify.com/).

## Gated content

Not everything needs to be public. sbomify lets you mark components as **gated**, meaning visitors must request access before they can view or download the artifacts. This is useful for sensitive documents like penetration test reports or detailed SBOMs that you only want to share under certain conditions.

Gated content supports two modes:

- **With NDA** -the visitor must accept your NDA before access is granted
- **Without NDA** -the visitor requests access and you approve or deny it manually

Either way, you stay in control of who sees what. Approval requests show up in your sbomify dashboard so you can review them.

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/trust_center_setup.webm" title="How to set up a Trust Center in sbomify" description="Step-by-step screencast showing how to enable and configure a Trust Center in sbomify." >}}
