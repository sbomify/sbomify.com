---
title: "How do I manage Trust Center access requests in sbomify?"
description: "How gated documents work on a sbomify Trust Center: visitors request access and sign your NDA, admins approve or reject the request, and access can be revoked at any time."
answer: "When a visitor opens a gated document on your Trust Center, they request access and, if you uploaded an NDA, sign it. Workspace admins are notified of every new request. Approve or reject it under Access requests on the Trust Center tab in Settings. Approved visitors can then open and download the document, and you can revoke their access at any time."
tldr: "Gated components stay listed on your Trust Center, but downloads need your approval and a signed NDA. Requests land on the Trust Center tab in Settings, where you approve, reject, or later revoke them."
weight: 74
plan: "Business+"
keywords: [Trust Center access requests, gated documents, NDA, approve access, revoke access, guest access, SOC 2 report sharing, sbomify Trust Center]
url: /faq/how-do-i-manage-trust-center-access-requests/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/access_requests.webm" title="How Trust Center access requests work in sbomify" description="Narrated screencast: a visitor requests access to a gated SOC 2 report and signs the NDA, then a workspace admin approves the request and the visitor downloads the report." upload_date="2026-10-28T00:00:00Z" >}}

## How gated access works

Some documents, like an audit report, should only be shared once you approve the request. Set the component's visibility to **Gated** (see [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/)). It stays listed on your Trust Center, but downloads need your approval. Gated visibility is available on Business and Enterprise plans.

## The visitor's side

1. The visitor opens the gated document on your Trust Center and requests access
2. If your workspace has a Company NDA, signing it is the next step. They read the NDA, type their full name, agree to the terms, and click **Sign NDA and submit request**
3. sbomify records the signature with the time, IP address, and a hash of the NDA
4. The request waits for the workspace to approve it

## The admin's side

Workspace admins are notified of every new request. To review them:

1. Open **Settings** and go to the **Trust Center** tab
2. Scroll to **Access requests**. Each pending request shows whether the NDA is signed
3. Open the request's actions menu and choose **Approve** (or **Reject**). **View details** shows the signature record

Approved visitors move to **Approved requests**, and can now open and download the document. You can revoke their access there at any time with **Revoke access**.

You can also invite someone directly with **Invite guest**, without waiting for them to ask. Guests see your public pages, plus the gated components they have been approved for and signed the NDA for.

If you upload a new version of your NDA, existing signatures no longer count and requesters need to sign again.

## Further reading

- [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/) - upload the NDA and set component visibility
- [How do I upload compliance documents?](/faq/how-do-i-upload-compliance-documents/) - add the SOC 2 report you want to gate
- [How do I invite team members?](/faq/how-do-i-invite-team-members/) - roles for people inside your workspace
