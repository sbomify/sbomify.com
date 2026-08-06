---

title: "CBOM: Cryptography Bill of Materials Management"
description: "Upload, analyze, and share Cryptography Bills of Materials (CBOMs) with sbomify: automatic CBOM detection, post-quantum readiness grading, certificate and cipher-suite views, and release-level crypto inventories."

---

Your [SBOMs](/what-is-sbom/) tell you what software you ship. A **CBOM (Cryptography Bill of Materials)** tells you what cryptography that software uses: algorithms, key sizes, certificates, and protocols. With NIST's post-quantum standards finalized and [EO 14412](/blog/) directing CISA and NIST to define CBOM minimum elements, cryptographic visibility is moving from nice-to-have to mandated. sbomify treats CBOMs as first-class artifacts, end to end.

## Upload once, sbomify does the rest

Upload a CycloneDX document through the [same API, CI/CD action, or UI](/features/generate-collaborate-analyze/) you already use for SBOMs. sbomify recognizes cryptographic content automatically:

- A pure CBOM (every component a cryptographic asset) is tagged `cbom` and gets the full crypto pipeline.
- A software SBOM with embedded crypto assets keeps its SBOM pipelines (NTIA checks, vulnerability scanning) **and** gains a crypto inventory. You never trade one analysis for the other.
- Every CBOM lineage ingests: CycloneDX 1.6, CycloneDX 1.7 with registry identifiers, and the legacy IBM CBOM 1.0 format that older scanners emitted. Documents are stored byte-for-byte unmodified; every analysis is derived on read.

## A crypto inventory you can actually read

![Cryptographic asset inventory with per-asset quantum readiness grading](/assets/images/site/cbom-inventory-card.png)

Each artifact gets a tabbed cryptographic inventory:

- **Assets** - every algorithm, key, certificate, and protocol, graded for post-quantum readiness. Expand any row for the verdict's reasoning, NIST security levels, and a concrete migration target: quantum-vulnerable signatures point at ML-DSA (FIPS 204) or SLH-DSA (FIPS 205), key establishment at ML-KEM (FIPS 203).
- **Certificates** - subject, issuer, validity window, and a live expiry countdown with expired and expiring-soon flags, sorted soonest first.
- **Protocols** - cipher suites per protocol and version, with weak suites flagged (RC4, 3DES, NULL, export-grade) and deprecated protocol versions called out.

Algorithm names normalize against the CycloneDX 1.7 cryptography registry, so `prime256v1`, `secp256r1`, and `nist/P-256` all resolve to the same curve however your scanner spelled it.

## PCI DSS 12.3.3 evidence in one click

![Protocol and cipher-suite view with weak-suite flagging](/assets/images/site/cbom-protocols-tab.png)

PCI DSS 4.x requirement 12.3.3, mandatory since March 31, 2025, requires a documented inventory of cipher suites and protocols in use, reviewed annually. sbomify derives that inventory from your CBOMs and exports it as CSV, ready to attach to your assessment.

## Quantum readiness across the whole workspace

![Workspace cryptography dashboard with migrate-first guidance](/assets/images/site/cbom-workspace-dashboard.png)

The workspace cryptography dashboard rolls every component up into one view: how many are at risk, which algorithms to migrate first ranked by how many components use them, and certificate expiry across the fleet, recomputed live. CNSA 2.0's 2030-2033 transition deadlines stop being abstract when the dashboard names the exact algorithms in your estate.

## Share it like everything else

CBOMs plug into the sharing machinery you already have:

- **[Trust Center](/features/trust-center/)** - your public component pages show the crypto posture card and full inventory, so customers can verify your quantum readiness without asking.
- **Release-level CBOM** - one merged CycloneDX document per [release](/features/sbom-hierarchy/), combining every component's CBOM. Emits CycloneDX 1.6 by default for maximum tool compatibility, or native 1.7 on request.
- **[TEA](/faq/how-do-i-enable-tea-in-sbomify/)** - CBOMs are enumerated alongside SBOMs and VEX in the Transparency Exchange API.

## Generating a CBOM

No scanner yet? Three well-trodden paths, all ending in a one-line upload:

1. **[sbomify-action](https://github.com/sbomify/sbomify-action)** with `cbom-generate: true` runs [cdxgen](https://github.com/cdxgen/cdxgen) crypto detection over your project (Java and Python projects, JS/TS source analysis, keystores, certificates) and uploads the result.
2. **[cbomkit](https://github.com/cbomkit)** (PQCA / Linux Foundation) scans Java and Python source with sonar-cryptography; its GitHub action drops a CycloneDX CBOM you pass through with `bom-type: cbom`.
3. **Any CycloneDX CBOM** from commercial scanners or hand-authored inventories uploads verbatim; sbomify never modifies the document.

More detail in the [FAQ on CBOM generation tools](/faq/which-tools-generate-cboms/).
