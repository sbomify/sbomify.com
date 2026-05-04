---
title: "How do I use signature files?"
description: "Learn how detached signature files attach to SBOMs in sbomify, which formats are supported (cosign-bundle, PGP, PKCS#7), how the API accepts them, where they show up in the UI, and how consumers verify them downstream."
answer: "Detached signature files cryptographically bind your SBOM to a known identity. Upload one to sbomify with `POST /api/v1/sboms/sbom/<id>/signature` plus an `X-Signature-Type` header (`cosign-bundle`, `pgp-detached`, or `pkcs7`); sbomify stores it alongside the SBOM, surfaces a Signed badge in the component view, and the SBOM Verification plugin validates it on every assessment run."
tldr: "A signature file is a small detached payload that proves an SBOM has not been altered since its issuer signed it. sbomify accepts cosign-bundle, PGP-detached, and PKCS#7 formats via a single API endpoint, displays a Signed badge once a signature is attached, and runs the SBOM Verification plugin on every upload so an invalid signature can never go unnoticed."
weight: 86
keywords: [signature file, SBOM signature, cosign bundle, PGP detached signature, PKCS7 signature, sbomify sign API, SBOM verification, attestation, sigstore]
url: /faq/how-do-i-use-signature-files/
---

## What a signature file is

A signature file is a small detached payload — typically a few hundred bytes to a few kilobytes — that cryptographically binds an artifact (your SBOM, a compliance PDF, a release tarball) to the identity that produced it. The artifact itself is unchanged; the signature lives next to it as a sibling file (`sbom.cdx.json` + `sbom.cdx.json.sig`, for example).

When a consumer downloads both the artifact and the signature, they can run a single command to confirm two independent facts:

- **Authenticity** — the signature was produced by a key or identity you trust (your CI pipeline, your organization's certificate, your GPG key).
- **Integrity** — the artifact has not been modified, even by a single byte, since the signature was created.

The signature does not need to travel with the artifact in a single file. It does not need to live on the same server. As long as the consumer can fetch both, they can verify the chain — that is the whole point of "detached".

## Formats sbomify accepts

The signature endpoint accepts three formats today, picked because each maps to a real-world signing pipeline:

| `X-Signature-Type` value | When you use it                                                          | Tooling                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cosign-bundle`          | Sigstore / GitHub Attestations / keyless OIDC signing                    | [`cosign sign-blob`](https://docs.sigstore.dev/cosign/) or [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance) |
| `pgp-detached`           | Long-lived organizational GPG keys, mirroring the OpenPGP ecosystem      | `gpg --detach-sign --armor sbom.cdx.json`                                                                                                          |
| `pkcs7`                  | Enterprise X.509 certificate chains, code-signing certs, hardware tokens | `openssl smime -sign -binary -outform DER`                                                                                                         |

The format is signaled exclusively through the `X-Signature-Type` header on the upload request — sbomify does not sniff the bytes. Each SBOM can carry one signature at a time; uploading a second time returns a `409 Conflict` until the first is removed.

## Generating a signature

The simplest case is signing an SBOM you already have on disk with cosign in keyless mode:

```bash
# OIDC-issued, recorded in Sigstore's transparency log, no key management
cosign sign-blob --bundle sbom.cdx.json.sig --yes sbom.cdx.json
```

That writes `sbom.cdx.json.sig` containing a Sigstore bundle (certificate + signature + Rekor inclusion proof). The same flow applies in CI:

```yaml
- name: Generate SBOM
  uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: 'your-component-id'
    LOCK_FILE: 'requirements.txt'
    UPLOAD: true
    OUTPUT_FILE: sbom.cdx.json

- name: Attest the SBOM
  uses: actions/attest-build-provenance@v1
  with:
    subject-path: '${{ github.workspace }}/sbom.cdx.json'
```

`actions/attest-build-provenance` wraps the same cosign primitives, hosts the bundle on GitHub's Attestations endpoint, and lets `gh attestation verify` do the verification later.

For PGP, the equivalent is:

```bash
gpg --detach-sign --armor --output sbom.cdx.json.sig sbom.cdx.json
```

For PKCS#7:

```bash
openssl smime -sign -binary -in sbom.cdx.json -out sbom.cdx.json.sig \
    -outform DER -signer signing-cert.pem -inkey signing-key.pem -nocerts
```

## Uploading the signature to sbomify

The signature endpoint is `POST /api/v1/sboms/sbom/<sbom_id>/signature`. The body is the raw signature bytes — no JSON envelope, no multipart wrapper. The `X-Signature-Type` header declares the format. The request must be authenticated with a [personal access token](/faq/) or an authenticated session.

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/sbom/$SBOM_ID/signature" \
    -H "Authorization: Bearer $SBOMIFY_TOKEN" \
    -H "X-Signature-Type: cosign-bundle" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @sbom.cdx.json.sig
```

A successful upload returns `201 Created` with the storage key sbomify assigned. The endpoint enforces a per-signature size cap, requires the SBOM to already exist (so the signature is bound to a known SHA-256 hash), and rejects any `X-Signature-Type` value that is not in the supported set above.

After the upload, sbomify queues the [SBOM Verification plugin](/faq/how-do-i-sign-an-sbom/#sbomify-attestation-verification) to validate the signature in the background. If the signature fails to verify, the next assessment results page on the component shows a `verification:attestation` finding with status `fail`.

## Where the signature shows up

Once the signature is stored, two badges appear on the SBOM detail page (Components → component → click the SBOM filename):

- **Signed** (green padlock) — `signature_blob_key` is set on the SBOM.
- **Provenance** (blue shield) — a build-provenance attestation is attached. This is the same field the SBOM Verification plugin checks when an SBOM is signed by GitHub Attestations.

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/document_signatures.webm" title="Signed and Provenance badges on a sbomify SBOM detail page" description="Step-by-step screencast showing how the Signed and Provenance badges appear on an SBOM in sbomify after a detached signature is uploaded via the API." >}}

The badges are visible to anyone authenticated against the workspace. Public Trust Center pages do not display the raw badge today, but the `SBOMResponseSchema` exposes `signature_blob_key`, `signature_type`, and `provenance_blob_key` so any external pipeline querying the API can tell at a glance whether the SBOM is signed.

## Verifying a signed SBOM

`cosign-bundle` signatures are designed to verify with a single command — no key fetch, no certificate dance. Download both the SBOM and its signature from sbomify, then:

```bash
# Download the SBOM and signature side-by-side
curl -o sbom.cdx.json "https://app.sbomify.com/api/v1/sboms/sbom/$SBOM_ID/download"
curl -o sbom.cdx.json.sig "https://app.sbomify.com/api/v1/sboms/sbom/$SBOM_ID/signature"

# Verify with cosign — supply the issuer + identity you trust
cosign verify-blob \
    --bundle sbom.cdx.json.sig \
    --certificate-identity-regexp 'https://github.com/your-org/.+' \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    sbom.cdx.json
```

Anyone with the SBOM and the signature can run the same command. They do not need a sbomify account, an API token, or any cooperation from sbomify itself — that is the whole reason for using detached signatures rather than relying on a trusted-platform claim.

For SBOMs signed via `actions/attest-build-provenance`, GitHub's CLI is even simpler:

```bash
gh attestation verify sbom.cdx.json --owner your-org
```

This confirms the SBOM was produced by a workflow inside `your-org` on GitHub and has not been modified since.

## How sbomify auto-discovers GitHub Attestations

If your SBOM declares a GitHub VCS URL (the github-action does this automatically when the metadata block carries a repository reference), sbomify's verification pipeline does not even need a signature to be uploaded explicitly. The plugin queries GitHub's public Attestations API for the SBOM's SHA-256, fetches the Sigstore bundle, and runs `cosign verify-blob-attestation` against it on every assessment cycle.

Use the explicit upload endpoint when:

- Your CI does not run on GitHub.
- You sign with PGP or PKCS#7 instead of Sigstore.
- You want sbomify to retain the bundle even if the upstream GitHub repository is deleted.

The two paths are not mutually exclusive — a signature uploaded explicitly takes precedence over the GitHub-discovered one, so you can use the API as a primary channel and let the auto-discovery serve as a backup.

## Compliance documents

Compliance artifacts (Vulnerability Disclosure Policy, Risk Assessment, Declaration of Conformity, etc.) carry a `signature_url` field that points to a detached signature you host yourself. The same cosign / GPG / PKCS#7 commands work for these PDFs and Markdown files; the difference is that sbomify currently stores only the URL — the bytes live on your infrastructure.

When you export the [CRA compliance bundle](/faq/how-do-i-use-cra-compliance/), the bundle's `metadata/INTEGRITY.md` walks consumers through verifying the bundle ZIP itself with `cosign sign-blob` over the whole archive. Bundle signing is downstream of sbomify and stays under your direct control.

## Rotating a signature

A signature in sbomify is bound to the exact bytes of the SBOM. If you re-sign with a new key but the SBOM bytes are unchanged, sbomify rejects the second upload with a `409 Conflict` — the existing signature is still considered the authoritative record for that SBOM hash. To rotate a key in practice, re-build the SBOM (any change to the bytes produces a new SHA-256), upload the new SBOM as a new revision under the same component, then attach the freshly-generated signature to that new revision. The previous SBOM and its signature stay on file as immutable history.

## Further reading

- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) — the producer-side companion to this article, covering GitHub Attestations end-to-end.
- [What is Sigstore?](/2024/08/12/what-is-sigstore/) — keyless signing primer.
- [What is in-toto?](/2024/08/14/what-is-in-toto/) — the attestation envelope format cosign-bundle wraps.
- [What is SLSA?](/2024/08/17/what-is-slsa/) — provenance levels that build on signed attestations.
- [GitHub Action with attestation](/2024/10/31/github-action-update-and-attestation/) — full workflow walkthrough.
