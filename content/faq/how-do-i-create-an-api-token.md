---
title: "How do I create an API token in sbomify?"
description: "Create a personal API token in sbomify with a narrow scope and short expiry, use it in CI to upload SBOMs, and delete it when you no longer need it."
answer: "Open Settings, then the API tokens tab, and click Generate token. Give it a name, pick the narrowest Access scope that does the job (Publish only is made for CI uploads), and a short Expiration. sbomify shows the token only once, so copy it and store it as a secret in your CI. To revoke it, delete it from Your tokens. It stops working right away."
tldr: "API tokens are personal and live in Settings, under API tokens. Choose a scope and an expiry, copy the token once, store it as a CI secret named SBOMIFY_TOKEN, and delete it when you are done. On GitHub Actions, OIDC trusted publishing removes the need for a token altogether."
weight: 63
keywords: [API token, sbomify token, personal access token, SBOMIFY_TOKEN, CI token, token scope, publish only, token expiry, revoke token]
url: /faq/how-do-i-create-an-api-token/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/api_tokens.webm" title="How to create and revoke an API token in sbomify" description="Narrated screencast: generate a Publish only API token with a 30-day expiry, copy it, see where it goes in a component's CI/CD integration, and delete it." upload_date="2026-10-28T00:00:00Z" >}}

## Creating a token

API tokens live in **Settings**, on the **API tokens** tab. You can also reach it from **API keys** in the sidebar. Tokens are personal, so other members cannot see or manage yours.

1. Click **Generate token**
2. Enter a **Token name** that says where it is used, for example `GitHub Actions: web-dashboard`
3. Pick the narrowest **Access scope** that does the job:
   - **Publish only (CI/CD upload)** is made for CI uploads
   - **Read-only** reads but changes nothing
   - **AI agent** reads fix prompts and sends VEX rulings for approval. Nothing it sends changes your vulnerabilities until someone approves it
   - **Full access** can do everything your role allows
4. Give it a short **Expiration**, for example 30 days. The default is 90 days
5. Click **Generate token**

sbomify shows the token only once, so copy it now. Store it as a secret in your CI, never in your code. A token can never do more than your own role allows.

## Using it in CI

To see where the token goes, open a component, open the **Component actions** menu, and choose **CI/CD integration**. The [sbomify GitHub Action](https://github.com/sbomify/sbomify-action) reads the token from the `SBOMIFY_TOKEN` secret, and the setup wizard shown there writes the pipeline that uploads your SBOMs.

On GitHub Actions you can skip the token entirely: [OIDC trusted publishing](/faq/how-do-i-set-up-oidc-trusted-publishing/) trades a short-lived GitHub token for a short-lived sbomify token on every run.

## Revoking a token

Back in **Settings**, your tokens are listed under **Your tokens**, with when each was last used and when it expires. When you no longer need one, delete it and confirm. It stops working right away, and anything still using it is locked out.

## Further reading

- [How do AI agents work in sbomify?](/faq/how-do-ai-agents-work-in-sbomify/)
- [How do I set up OIDC trusted publishing?](/faq/how-do-i-set-up-oidc-trusted-publishing/) - uploads from GitHub Actions with no stored token
- [How do I use the sbomify setup wizard?](/faq/how-do-i-use-the-sbomify-setup-wizard/) - generates the CI workflow for you
- [How do I generate an SBOM?](/faq/how-do-i-generate-an-sbom/) - the pipeline your token uploads from
- [How do I upload an SBOM?](/faq/how-do-i-upload-an-sbom/) - uploading by hand instead
