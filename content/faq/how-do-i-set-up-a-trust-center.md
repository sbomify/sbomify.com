---
title: "How do I set up a Trust Center in sbomify?"
description: "Step-by-step guide to enabling and configuring a Trust Center in sbomify, including custom domain setup, security.txt, NDA upload, and component visibility."
answer: "Go to Settings > Trust Center, enable it, optionally turn on security.txt and upload a Company NDA, then set your custom domain. Mark each component as Public, Gated, or Private to control what visitors can see. Trust Center requires a Business plan or higher."
tldr: "Go to Settings > Trust Center, enable it, optionally turn on security.txt and upload a Company NDA, then set your custom domain. Mark each component as Public, Gated, or Private to control what visitors can see. Trust Center requires a Business plan or higher."
plan: "Business+"
weight: 71
keywords: [Trust Center, set up Trust Center, enable Trust Center, custom domain, sbomify Trust Center, trust.sbomify.com, security.txt, RFC 9116, Company NDA, component visibility]
url: /faq/how-do-i-set-up-a-trust-center/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/trust_center_setup.webm" title="How to set up a Trust Center in sbomify" description="Step-by-step screencast showing how to enable and configure a Trust Center in sbomify." >}}

## Setting up a Trust Center

The Trust Center is available on the **Business** plan and above. For background on what a Trust Center is and why it matters, see [What is a Trust Center?](/faq/what-is-a-trust-center/).

To set up your Trust Center:

1. Navigate to **Settings** and open the **Trust Center** tab
2. **Enable** your Trust Center
3. (Optional) Toggle on **security.txt** to publish an [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) `/.well-known/security.txt` file with your security contact details
4. (Optional) Upload your **Company NDA** so it can be presented to visitors who request access to gated content
5. Set your **custom domain** (e.g. `trust.yourcompany.com`) and click **Save Domain**
6. Configure a CNAME record with your DNS provider pointing to sbomify, then wait for the domain to validate

Once enabled, your uploaded SBOMs and compliance documents are automatically published to your Trust Center. You can see a live example at [trust.sbomify.com](https://trust.sbomify.com/).

## Component visibility

Not everything in a Trust Center needs to be public. Each component has a **visibility** setting on its detail page that controls how visitors interact with it:

- **Public** - artifacts are listed and downloadable by anyone visiting the Trust Center
- **Gated** - artifacts are listed but visitors must request access (and, if you uploaded one, accept your Company NDA) before they can download
- **Private** - the component is hidden from the Trust Center entirely

Gated content lets you keep control over sensitive artifacts like penetration test reports or detailed SBOMs. When the Company NDA is uploaded, gated requests must accept it; otherwise visitors simply request access and you approve or deny manually. Approval requests show up in your sbomify dashboard so you can review them.
