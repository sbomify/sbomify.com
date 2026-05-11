---
title: "How do I attach signatures and provenance to SBOMs?"
description: "Walk through uploading detached cryptographic signatures (cosign-bundle, PGP, PKCS#7) and SLSA in-toto provenance attestations to your SBOMs in sbomify, where the Signed and Provenance badges appear, and how the SBOM Verification plugin validates both."
answer: "sbomify accepts a detached signature on every SBOM via `POST /api/v1/sboms/sbom/<id>/signature` (with an `X-Signature-Type` header naming `cosign-bundle`, `pgp-detached`, or `pkcs7`) and a separate in-toto / DSSE provenance attestation via `POST /api/v1/sboms/sbom/<id>/provenance`. Once attached, Signed and Provenance badges appear on the SBOM detail page and the SBOM Verification plugin runs five checks (digest integrity, signature presence + validity, provenance presence + digest match) on every assessment cycle."
tldr: "Each SBOM in sbomify can carry a detached signature and a SLSA provenance attestation as separate, opaque blobs. Signatures arrive as raw bytes plus a format header; provenance arrives as JSON (DSSE envelope or direct in-toto Statement) and is rejected on upload if its subject digest does not match the SBOM. The SBOM Verification plugin then turns both into pass/fail findings on every assessment run."
weight: 86
keywords: [SBOM signature, SBOM provenance, in-toto attestation, DSSE envelope, cosign-bundle, PGP detached signature, PKCS7 signature, SLSA provenance, sbomify sign API, SBOM verification plugin, signed SBOM, attestation]
url: /faq/how-do-i-use-signature-files/
---

## What this article covers

The features described here landed in [sbomify/sbomify#880](https://github.com/sbomify/sbomify/pull/880). Each SBOM record in sbomify can now carry two independent cryptographic artefacts:

- A **detached signature** — proves the SBOM bytes have not been altered since the issuer signed them.
- A **provenance attestation** — proves the SBOM was produced by a specific build, in a specific repository, by a specific workflow.

Both are uploaded through dedicated endpoints, stored as opaque blobs in object storage, and validated by the unified SBOM Verification plugin. They are _complementary_ rather than alternatives: a signature without provenance proves the bytes; provenance without a signature proves the build origin; together they prove both.

For the producer-side guidance on _generating_ signatures and attestations in CI (GitHub Attestations, Sigstore keyless signing, the in-toto envelope format), see [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) — that article is the upstream half of this one.

## Signature formats sbomify accepts

The signature endpoint takes raw bytes in the request body plus an `X-Signature-Type` header that names the format. Three formats are recognised today:

| `X-Signature-Type` value | Use when                                                                 | Tooling                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cosign-bundle`          | Sigstore / GitHub Attestations / keyless OIDC signing                    | [`cosign sign-blob --bundle`](https://docs.sigstore.dev/cosign/) or [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance) |
| `pgp-detached`           | Long-lived organisational GPG keys                                       | `gpg --detach-sign --armor sbom.cdx.json`                                                                                                                   |
| `pkcs7`                  | Enterprise X.509 certificate chains, code-signing certs, hardware tokens | `openssl smime -sign -binary -outform DER`                                                                                                                  |

The format string is the only thing sbomify uses to discriminate — the bytes themselves are stored opaquely. An unknown format value is rejected with `400 Bad Request`. Every SBOM holds at most one signature; uploading a second time without first removing the old one returns `409 Conflict`.

## Provenance formats sbomify accepts

The provenance endpoint takes a JSON body. Two shapes are recognised:

- **DSSE envelope** — the standard Sigstore-issued wrapper, identified by a top-level `payloadType` + `payload` (base64-encoded in-toto Statement).
- **Direct in-toto Statement** — the unwrapped Statement body itself, identified by a top-level `_type` and `subject`.

Either way, sbomify decodes down to the in-toto Statement, walks the `subject[].digest.sha256` array, and rejects the upload (`400 Bad Request`) unless one of those digests matches the SBOM's stored SHA-256. The check is intentional: a provenance attestation that does not name the actual SBOM file is meaningless, and silently accepting one would hide that mismatch from downstream consumers.

The accepted Statement is stored as-is — sbomify does not re-shape or re-canonicalise it.

## The four endpoints

```text
POST   /api/v1/sboms/sbom/<sbom_id>/signature      # raw bytes + X-Signature-Type
GET    /api/v1/sboms/sbom/<sbom_id>/signature      # download stored bytes
POST   /api/v1/sboms/sbom/<sbom_id>/provenance     # JSON body (DSSE or Statement)
GET    /api/v1/sboms/sbom/<sbom_id>/provenance     # download stored JSON
```

All four require authentication — uploads need write access to the SBOM's component, downloads honour the SBOM's public/private visibility just like the SBOM body itself. Upload sizes are capped (5 MB for signatures, 10 MB for provenance) and the SBOM row is row-locked during the write so two concurrent uploads cannot both win.

### Uploading a signature

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/sbom/$SBOM_ID/signature" \
    -H "Authorization: Bearer $SBOMIFY_TOKEN" \
    -H "X-Signature-Type: cosign-bundle" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @sbom.cdx.json.sig
```

A successful upload returns `201 Created` with the storage key sbomify assigned and queues the SBOM Verification plugin to validate the bytes asynchronously.

### Uploading provenance

```bash
curl -X POST "https://app.sbomify.com/api/v1/sboms/sbom/$SBOM_ID/provenance" \
    -H "Authorization: Bearer $SBOMIFY_TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary @sbom.cdx.json.intoto.jsonl
```

The endpoint accepts the in-toto JSON or the DSSE envelope and returns `201 Created` once the subject digest passes. A `400 Bad Request` with `error_code: bad_request` and a message about the digest mismatch means the attestation does not name your SBOM — most often a sign that the SBOM was rebuilt after the attestation was issued.

## Where the badges show up

Once attached, two badges render on the SBOM detail page (Components → component → click the SBOM filename):

- **Signed** (green padlock) — the SBOM has a stored `signature_blob_key`.
- **Provenance** (blue shield) — the SBOM has a stored `provenance_blob_key`.

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/document_signatures.webm" title="Signed and Provenance badges on a sbomify SBOM detail page" description="Step-by-step screencast walking from Components into the SBOM detail page where the Signed and Provenance badges render once a signature and a provenance attestation are attached via the API." >}}

The badges are visible to authenticated users in the workspace. The same fields (`signature_blob_key`, `signature_type`, `provenance_blob_key`) are exposed in `SBOMResponseSchema` so external pipelines querying the API can tell at a glance whether either artefact is present.

## How the SBOM Verification plugin uses them

The unified `sbom-verification` plugin runs as part of every SBOM assessment cycle and produces five granular findings:

| Finding              | What it checks                                                                                                                                                                                        | When it passes                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `digest:integrity`   | Re-computes the SBOM SHA-256 and compares it to the stored hash                                                                                                                                       | The recomputed hash matches                |
| `signature:present`  | Looks for a stored `signature_blob_key`                                                                                                                                                               | A signature has been uploaded              |
| `signature:valid`    | Validates the stored signature using `sigstore.Verifier.production().verify_artifact` (cosign-bundle) — the other formats currently report `unknown` while keeping the upload + presence check active | The signature verifies cleanly             |
| `provenance:present` | Looks for a stored `provenance_blob_key`                                                                                                                                                              | A provenance attestation has been uploaded |
| `provenance:digest`  | Re-checks the stored attestation's `subject[].digest.sha256` against the SBOM hash                                                                                                                    | At least one subject digest matches        |

The plugin also rolls all five up into an aggregated `verification:attestation` summary finding whose status is `pass` when _any_ cryptographic source verified and `fail` when none did — the BSI / FDA / NTIA plugins consume that summary via a `requires_one_of: [{"type": "category", "value": "attestation"}]` clause, so a digest-only "pass" cannot satisfy an attestation requirement on its own.

The plugin runs even if neither artefact has been uploaded — the digest check still passes on its own, and the signature/provenance findings come back as `not present` rather than `fail`. Uploading either artefact while the SBOM is sitting in the assessment queue triggers a re-run.

## Auto-discovering GitHub Attestations

If your SBOM declares a GitHub VCS URL (the [github-action](https://github.com/sbomify/sbomify-action) does this automatically when the metadata block carries a repository reference), the verification pipeline does not even need an explicit upload. The plugin queries GitHub's public Attestations API for the SBOM's SHA-256, fetches the Sigstore bundle, and runs `cosign verify-blob-attestation` against it on every assessment cycle.

Use the explicit `POST /signature` / `POST /provenance` endpoints when:

- Your CI does not run on GitHub.
- You sign with PGP or PKCS#7 instead of Sigstore.
- You want sbomify to retain the bundle even if the upstream GitHub repository is deleted.

The two paths are not mutually exclusive — an explicitly uploaded artefact takes precedence over the GitHub-discovered one, so the API can be the primary channel and auto-discovery serves as a backup.

## Rotating a signature or provenance

Both endpoints reject a second upload while the first is still attached (`409 Conflict`). The intent is to keep the audit trail clean: replacing in place would silently change the verification result for downstream consumers. To rotate:

1. **Re-build the SBOM.** Any change to the bytes produces a new SHA-256 and creates a fresh SBOM revision under the same component.
2. **Sign / attest the new revision** with the new key or build provenance.
3. **Upload the fresh signature / provenance to the new SBOM.**

The previous SBOM and its artefacts stay on file as immutable history. If you genuinely need to drop an artefact in place (test environment, mistaken upload), do that against the SBOM record directly — the API does not expose a delete primitive on either endpoint by design.

## CRA Declaration of Conformity is a different kind of signature

If you arrived here looking for the Place / Name / Function signature pad on Step 5 of the CRA Compliance Wizard, that is a separate feature — the _legal_ manufacturer signature required by [Article 28 + Annex V Section 8](/faq/how-do-i-use-cra-compliance/) of the EU Cyber Resilience Act, captured as a drawn PNG. It is conceptually distinct from the cryptographic signatures and provenance attestations described above, which prove what the SBOM bytes say.

A complete filing typically carries both — the DoC says _who_ declares conformity, the cryptographic artefacts prove _which exact bytes_ the consumer received.

## Further reading

- [How do I sign an SBOM?](/faq/how-do-i-sign-an-sbom/) — producer-side workflow: GitHub Attestations end-to-end.
- [What is Sigstore?](/2024/08/12/what-is-sigstore/) — keyless signing primer.
- [What is in-toto?](/2024/08/14/what-is-in-toto/) — the attestation envelope format the provenance endpoint consumes.
- [What is SLSA?](/2024/08/17/what-is-slsa/) — provenance levels that build on signed attestations.
- [GitHub Action with attestation](/2024/10/31/github-action-update-and-attestation/) — full workflow walkthrough.
- [PR sbomify/sbomify#880](https://github.com/sbomify/sbomify/pull/880) — the implementation this article describes.
