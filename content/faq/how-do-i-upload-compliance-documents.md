---
title: "How do I upload compliance documents?"
description: "Step-by-step guide to uploading compliance documents like SOC 2, ISO 27001, and CE certificates in sbomify by creating a Document component."
answer: "Compliance documents live on Document-type components. From Components, click Create component, pick Document as the type and tick Workspace-wide component. Then click Upload document and add the file with its version, document type, subcategory, and description."
tldr: "Compliance documents live on Document-type components. From Components, click Create component, pick Document as the type and tick Workspace-wide component. Then click Upload document and add the file with its version, document type, subcategory, and description."
weight: 76
keywords: [compliance documents, SOC 2, ISO 27001, CE certificate, upload documents, sbomify documents, Document component, workspace-wide component]
url: /faq/how-do-i-upload-compliance-documents/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/document_upload.webm" title="How to upload compliance documents in sbomify" description="Narrated screencast: create a workspace-wide Document component and upload a SOC 2 Type II report with its version, type and subcategory." upload_date="2026-10-28T00:00:00Z" >}}

## Uploading compliance documents

sbomify treats compliance documents - such as SOC 2 Type II reports, ISO 27001 certificates, CE certificates, and other attestations - as **Document components**. Like SBOM components they hold versioned artifacts, but their content is a document instead of an SBOM. PDF, Word, text, and markdown files all work. Marking the component as **workspace-wide** means it is not tied to one product, so a single SOC 2 report can serve every product that needs it, without re-uploading. A workspace-wide document can also earn a badge on your Trust Center.

To upload a compliance document:

1. Open **Components** in the sidebar and click **Create component**
2. Name it (e.g. `SOC 2 Type II Compliance`), pick **Document** as the **Type**, tick **Workspace-wide component**, and click **Create component**
3. On the new component, click **Upload document**
4. Fill in the **Version** (e.g. `2024`), pick a **Document type** (e.g. `Compliance`) and a subcategory (e.g. `SOC 2 Type II`), and add a short **Description**
5. Drop in the file, or click to browse, then click **Save document**

The uploaded document appears in the component's documents table, with its type and version. To show it on your [Trust Center](/faq/what-is-a-trust-center/), set the component's visibility to **Public** or **Gated** (see [How do I set up a Trust Center?](/faq/how-do-i-set-up-a-trust-center/)).

## Further reading

- [How do I manage Trust Center access requests?](/faq/how-do-i-manage-trust-center-access-requests/) - share a gated report only after you approve the request
- [How do I track compliance controls?](/faq/how-do-i-track-compliance-controls/) - track the SOC 2 or ISO 27001 controls the report covers
