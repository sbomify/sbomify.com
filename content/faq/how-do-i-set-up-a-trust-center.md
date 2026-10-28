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

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/trust_center_setup.webm" title="How to set up a Trust Center in sbomify" description="Narrated screencast: switch on the Trust Center, add a welcome message, security.txt and an NDA, set a custom domain, and choose which components to share." upload_date="2026-10-28T00:00:00Z" >}}

## Setting up a Trust Center

The Trust Center is available on the **Business** plan and above. For background on what a Trust Center is and why it matters, see [What is a Trust Center?](/faq/what-is-a-trust-center/).

To set up your Trust Center:

1. Open **Settings** and go to the **Trust Center** tab
2. Switch on **Enable Trust Center**. The **Public URL** appears, with an address you can share
3. (Optional) Under **Description**, write a **Welcome message** for visitors and click **Save description**
4. (Optional) Switch on **Enable security.txt** to publish an [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) `/.well-known/security.txt` file with your security contacts, then click **Save security.txt**
5. (Optional) Under **Company NDA**, choose your NDA (PDF) and click **Upload NDA**. Visitors sign it before they can download gated artifacts
6. Under **Custom domain**, enter your domain (for example `trust.yourcompany.com`) and click **Save domain**
7. Add the DNS records shown under **DNS configuration** with your DNS provider. sbomify checks the domain automatically, and the status moves from **Pending verification** to **Verified**

Once enabled, the products and components you make public show up on your Trust Center. Public release pages also expose release-level [VEX](/faq/how-do-i-use-vex/) and [CBOM](/faq/what-is-a-cbom/) downloads next to the release SBOM. You can see a live example at [trust.sbomify.com](https://trust.sbomify.com/).

To put your own logo and colors on it, see [How do I brand my Trust Center?](/faq/how-do-i-brand-my-trust-center/).

## Component visibility

Not everything in a Trust Center needs to be public. Everything starts private. Open a component and use the **Component visibility** menu at the top of the page to choose how visitors interact with it:

- **Public** - artifacts are listed and downloadable by anyone visiting the Trust Center
- **Gated** - artifacts are listed but visitors must request access (and, if you uploaded one, sign your Company NDA) before they can download
- **Private** - the component is hidden from the Trust Center entirely

Gated content lets you keep control over sensitive artifacts like penetration test reports or detailed SBOMs. When a Company NDA is uploaded, visitors must sign it as part of their request. Otherwise they simply request access. Workspace admins are notified of each new request, and you approve or reject it under **Access requests** on the same **Trust Center** tab. See [How do I manage Trust Center access requests?](/faq/how-do-i-manage-trust-center-access-requests/) for the full flow.
