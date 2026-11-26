---
title: "How do I upload an SBOM to sbomify by hand?"
description: "Upload a CycloneDX or SPDX SBOM to a sbomify component from the browser, using search or the component's actions menu."
answer: "Open search with Control K (Command K on a Mac), type upload and choose Upload SBOM. Filter the list of components, pick the one the SBOM is for, and drop the file into the upload dialog. sbomify accepts CycloneDX and SPDX, stores the file exactly as uploaded, and lists the new version on the component. For regular uploads, use your CI pipeline instead."
tldr: "Hand uploads take a few seconds: search for Upload SBOM, pick the component, drop the file. The SBOM is stored byte for byte as a new version, and scanned once vulnerability scanning is on. Automate it in CI for anything you ship regularly."
weight: 59
keywords: [upload SBOM, manual SBOM upload, CycloneDX upload, SPDX upload, sbomify upload, component SBOM, Upload SBOM]
url: /faq/how-do-i-upload-an-sbom/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/artifact_upload.webm" title="How to upload an SBOM by hand in sbomify" description="Narrated screencast: open search, choose Upload SBOM, pick the component, drop in a CycloneDX file, and see the new version on the component." upload_date="2026-10-28T00:00:00Z" >}}

## Uploading from anywhere

1. Press **Control K** (or **Command K** on a Mac) to open search, and type `upload`
2. Choose **Upload SBOM**. The upload page lists your components, with the products each one belongs to
3. Filter by name, then pick the component the SBOM is for
4. The component page opens with the upload dialog ready, and SBOM already chosen as the artifact type
5. Drop the file in, or click to browse

sbomify accepts CycloneDX and SPDX. Once the upload succeeds, the SBOM is stored exactly as uploaded, and its version is listed on the component. Its vulnerabilities show up once the new version has been [scanned](/faq/how-do-i-enable-vulnerability-scanning/).

You can also start from the component itself: open the **Component actions** menu and choose **Upload SBOM**. The same menu has **Upload CBOM** and **Upload VEX** for other artifact types. Document components offer **Upload document** instead.

## For regular uploads, use CI

A hand upload is fine for a one-off or a first try. For anything you ship regularly, the upload dialog recommends your CI pipeline instead, so every build produces a fresh SBOM without anyone remembering to upload it. See [How do I generate an SBOM?](/faq/how-do-i-generate-an-sbom/) and [How do I use the sbomify setup wizard?](/faq/how-do-i-use-the-sbomify-setup-wizard/).

## Further reading

- [How do products work in sbomify?](/faq/how-do-products-work-in-sbomify/) - components, products, and releases
- [How do I create an API token?](/faq/how-do-i-create-an-api-token/) - upload from CI with a token
- [How do I upload compliance documents?](/faq/how-do-i-upload-compliance-documents/) - the same idea for PDFs and reports
- [How do I search in sbomify?](/faq/how-do-i-search-in-sbomify/) - more about search
