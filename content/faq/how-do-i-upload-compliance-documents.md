---
title: "How do I upload compliance documents?"
description: "Step-by-step guide to uploading compliance documents like SOC 2, ISO 27001, and CE certificates in sbomify by creating a Document component."
answer: "Compliance documents live on Document-type components. From Components, create a workspace-wide Document component (e.g. SOC 2 Type II Compliance), then use Upload document to add the file with its version, document type, subcategory, and description."
tldr: "Compliance documents live on Document-type components. From Components, create a workspace-wide Document component (e.g. SOC 2 Type II Compliance), then use Upload document to add the file with its version, document type, subcategory, and description."
weight: 76
keywords: [compliance documents, SOC 2, ISO 27001, CE certificate, upload documents, sbomify documents, Document component, workspace-wide component]
url: /faq/how-do-i-upload-compliance-documents/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/document_upload.webm" title="How to upload compliance documents in sbomify" description="Step-by-step screencast showing how to upload compliance documents like SOC 2 and ISO 27001 in sbomify." upload_date="2026-02-27T15:21:10Z" >}}

## Uploading compliance documents

sbomify treats compliance documents - such as SOC 2 Type II reports, ISO 27001 certificates, CE certificates, and other attestations - as **Document components**. Like SBOM components they hold versioned artifacts, but their content is a document file (PDF, Word, text, and similar) instead of an SBOM. Marking the component as **workspace-wide** means it lives at the workspace level rather than inside a single product, so one SOC 2 report covers the whole workspace without re-uploading. Only workspace-wide documents earn a certification badge on your Trust Center.

To upload a compliance document:

1. Navigate to **Components** in the workspace sidebar
2. Click **Create component**, name it (e.g. `SOC 2 Type II Compliance`), set **Type** to **Document**, tick **Workspace-wide component**, and click **Create component**
3. Open the new component, open its actions menu, and choose **Upload document…**
4. Fill in the upload form: **Version** (e.g. `2024`), **Document type** (e.g. `Compliance`), **Compliance Subcategory** (e.g. `SOC 2 Type II`), and a short **Description**
5. Choose the file and click **Save document**

The uploaded document appears in the component's documents table. Once the component's visibility is public or gated, the document appears on your [Trust Center](/faq/what-is-a-trust-center/). If you would rather attach a document to specific products, leave **Workspace-wide component** unticked and assign the component to those products instead.
