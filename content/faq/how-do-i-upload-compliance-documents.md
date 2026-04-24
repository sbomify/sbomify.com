---
title: "How do I upload compliance documents?"
description: "Step-by-step guide to uploading compliance documents like SOC 2, ISO 27001, and CE certificates in sbomify by creating a Document component."
answer: "Compliance documents live on Document-type components. From Components, create a workspace-wide Document component (e.g. SOC 2 Type II Compliance), then upload the file with its version, document type, subcategory, and description."
tldr: "Compliance documents live on Document-type components. From Components, create a workspace-wide Document component (e.g. SOC 2 Type II Compliance), then upload the file with its version, document type, subcategory, and description."
weight: 76
keywords: [compliance documents, SOC 2, ISO 27001, CE certificate, upload documents, sbomify documents, Document component, workspace-wide component]
url: /faq/how-do-i-upload-compliance-documents/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/document_upload.webm" title="How to upload compliance documents in sbomify" description="Step-by-step screencast showing how to upload compliance documents like SOC 2 and ISO 27001 in sbomify." >}}

## Uploading compliance documents

sbomify treats compliance documents - such as SOC 2 Type II reports, ISO 27001 certificates, CE certificates, and other attestations - as **Document components**. Like SBOM components they hold versioned artifacts, but their content is a PDF instead of an SBOM. Marking the component as **workspace-wide** means a single SOC 2 report can be linked into every project and product that needs it, without re-uploading.

To upload a compliance document:

1. Navigate to **Components** in the workspace sidebar
2. Click **Add Component**, name it (e.g. `SOC 2 Type II Compliance`), set **Type** to **Document**, and tick **Workspace-wide component**, then submit
3. Open the new component and fill in the upload form: **Version** (e.g. `2024`), **Document Type** (e.g. `Compliance`), **Subcategory** (e.g. `SOC 2`), and a short **Description**
4. Choose the file and click **Save Document**

The uploaded document appears in the component's documents table and can be linked to any project or product that uses this component, and shared externally via your [Trust Center](/faq/what-is-a-trust-center/).
