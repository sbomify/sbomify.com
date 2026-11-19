---
title: "How do I set up a Trust Center in sbomify?"
description: "Step-by-step guide to enabling and configuring a Trust Center in sbomify, including custom domain setup, security.txt, NDA upload, and component visibility."
answer: "Go to Settings > Trust Center, enable it, optionally turn on security.txt and upload a Company NDA, then set your custom domain. Mark each component as Public, Gated, or Private to control what visitors can see. A public Trust Center is included on every plan; a custom domain and Gated or Private components need a Business plan or higher."
tldr: "Go to Settings > Trust Center, enable it, optionally turn on security.txt and upload a Company NDA, then set your custom domain. Mark each component as Public, Gated, or Private to control what visitors can see. A public Trust Center is included on every plan; a custom domain and Gated or Private components need a Business plan or higher."
weight: 71
keywords: [Trust Center, set up Trust Center, enable Trust Center, custom domain, sbomify Trust Center, trust.sbomify.com, security.txt, RFC 9116, Company NDA, component visibility]
url: /faq/how-do-i-set-up-a-trust-center/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/trust_center_setup.webm" title="How to set up a Trust Center in sbomify" description="Step-by-step screencast showing how to enable and configure a Trust Center in sbomify." upload_date="2026-02-26T19:24:17Z" >}}

## Setting up a Trust Center

A public Trust Center is included on every plan, including the free Community plan. A custom domain, Gated and Private components, and turning the Trust Center off need the **Business** plan or above. For background on what a Trust Center is and why it matters, see [What is a Trust Center?](/faq/what-is-a-trust-center/).

To set up your Trust Center:

1. Navigate to **Settings** and open the **Trust Center** tab
2. Turn on **Enable Trust Center**
3. (Optional) Add a **Welcome message** in the **Description** section
4. (Optional) Turn on **Enable security.txt** to publish an [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) `/.well-known/security.txt` file with your security contact details
5. (Optional) Upload your **Company NDA** (PDF) so it can be presented to visitors who request access to gated content
6. In the **Custom domain** section, enter your domain (e.g. `trust.yourcompany.com`) and click **Save domain**
7. Add the two CNAME records shown (one for the domain, one for automatic SSL certificates) with your DNS provider, then wait for the status to show **Verified**

Once enabled, your uploaded SBOMs and compliance documents are automatically published to your Trust Center. Public release pages also expose release-level [VEX](/faq/how-do-i-use-vex/) and [CBOM](/faq/what-is-a-cbom/) downloads next to the release SBOM. The **Sharing** section also lets you publish your vulnerability posture on public release pages (counting only public components, after applying VEX) and turn on the [Transparency Exchange API](/faq/how-do-i-enable-tea-in-sbomify/). You can see a live example at [trust.sbomify.com](https://trust.sbomify.com/).

## Component visibility

Not everything in a Trust Center needs to be public. Each component has a **visibility** setting on its detail page (Gated and Private need Business or above) that controls how visitors interact with it:

- **Public** - artifacts are listed and downloadable by anyone visiting the Trust Center
- **Gated** - artifacts are listed but visitors must request access (and, if you uploaded one, accept your Company NDA) before they can download
- **Private** - the component is hidden from the Trust Center entirely

Gated content lets you keep control over sensitive artifacts like penetration test reports or detailed SBOMs. When the Company NDA is uploaded, gated requests must accept it; otherwise visitors simply request access and you approve or deny manually. Requests show up in the **Access requests** section of the Trust Center settings tab, where you approve or reject them and can also invite guests directly.
