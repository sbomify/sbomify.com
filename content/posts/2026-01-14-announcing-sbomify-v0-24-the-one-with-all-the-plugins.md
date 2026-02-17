---

title: "Announcing sbomify v0.24: The One with All the Plugins"
description: "sbomify v0.24 introduces a powerful plugin-based assessment framework supporting security, license, compliance, and attestation plugins. Ships with NTIA, CISA, CRA, and FDA compliance plugins out of the box."
author:
  display_name: Viktor Petersson
category: announcement
tags: [sbom, release, compliance, plugins]
date: 2026-01-14
slug: announcing-sbomify-v0-24-the-one-with-all-the-plugins
---

Today marks a pivotal release for sbomify. With v0.24, we are laying the foundation for what will become a fully extensible, plugin-based platform. This release introduces our new **Plugin-Based Assessment Framework**, a unified architecture for running automated assessments on every SBOM upload. This represents a fundamental shift in how we think about sbomify's architecture going forward.

## Plugin-Based Assessment Framework

The headline feature of v0.24 is our new assessment plugin system, documented in [ADR-003: Plugin-based Assessments for SBOM Uploads](https://github.com/sbomify/sbomify/blob/master/docs/ADR/ADR-003.md). If you want to understand where sbomify is headed, this architectural decision record is essential reading.

### Four Assessment Categories

The plugin framework is designed to support four distinct categories of SBOM assessment:

| Category        | Description                                             | Examples              |
| --------------- | ------------------------------------------------------- | --------------------- |
| **Security**    | Vulnerability scanning via external tools and APIs      | OSV, Dependency-Track |
| **License**     | Policy evaluation against approved/denied license lists | License policy checks |
| **Compliance**  | Validation against regulatory and industry standards    | NTIA, CISA, CRA, FDA  |
| **Attestation** | Integrity and provenance verification                   | Sigstore, in-toto     |

Each category has different characteristics. Security plugins integrate with external vulnerability databases that change continuously, so they support scheduled re-runs. Compliance and license plugins are deterministic for a given ruleset version. Attestation plugins verify cryptographic signatures and provenance data.

### Compliance Plugins Shipping Now

This release ships with five compliance plugins ready to use. Each plugin aligns with our [compliance documentation](/compliance/), so you can understand exactly what is being validated:

- **[NTIA Minimum Elements](/compliance/ntia-minimum-elements/)** - Validates your SBOMs against the foundational US baseline for SBOM data fields
- **[CISA 2025 Minimum Elements](/compliance/cisa-minimum-elements/)** - Checks compliance with the updated US guidance including hash, license, and generation context
- **[EU Cyber Resilience Act (CRA)](/compliance/eu-cra/)** - Validates against Regulation 2024/2847 requirements (beta)
- **[FDA Medical Device Cybersecurity](/compliance/fda-medical-device/)** - Ensures medical device SBOM requirements are met, including lifecycle properties
- **Checksum Verification** - A test plugin that validates SBOM integrity through checksum verification (useful as a reference implementation)

Each plugin runs automatically when you upload an SBOM. Simply enable the plugins you need in **Settings → Plugins**, and assessments happen transparently in the background.

### Why This Architecture Matters

The design decisions in ADR-003 are intentional and set the stage for everything that follows:

- **Assessments tied to uploads, not content hashes** - Each upload is assessed independently, giving you a complete history of checks over time
- **Immutable AssessmentRun records** - Every assessment is recorded permanently, enabling full audit trails and historical tracking
- **Python SDK with normalized results** - All plugins return results in a consistent `AssessmentResult` schema with `Finding` entries, making it easy to compare and aggregate data across plugin types
- **Config hashing for reproducibility** - When assessment results change, you can trace exactly why by comparing configuration hashes
- **Per-team plugin enablement** - Teams can enable the plugins relevant to their needs, with feature gating based on billing plans

### The Migration Path

This plugin system is the future of sbomify. In upcoming releases, we will be migrating our existing features into this architecture:

**Phase 2: Security Plugins**
Our current **OSV vulnerability scanning** and **Dependency Track integration** will be refactored into security plugins. This migration will make these features more modular, give you historical tracking of all vulnerability scans, and allow the same plugin architecture to power scheduled re-scans as vulnerability databases are updated.

**Phase 3 and Beyond**
We have a roadmap of additional plugins including license policy evaluation, attestation verification (Sigstore and in-toto), and VEX (Vulnerability Exploitability eXchange) statement processing. The goal is to make sbomify a platform where you can mix and match the capabilities you need.

---

## Vue.js to Alpine.js Migration Complete

We have completed the frontend migration we started in previous releases. This release replaces the remaining **35 Vue.js components** with lightweight Alpine.js implementations backed by Django templates.

This migration closes out [ADR-001: Django Monolith](https://github.com/sbomify/sbomify/blob/master/docs/ADR/ADR-001.md). As documented there, our detour into Vue turned out to be a mistake. While we wanted to maintain an API-first approach, leveraging Django Templates with server-side rendering minimizes complexity compared to a separate Vue frontend. Equally important, Vue made end-to-end testing more challenging, and we had several blocks silently failing as a result.

The result is a significantly smaller bundle size, faster page loads, a more maintainable codebase, and much better test coverage. If you have been following our journey from Vue.js to Alpine.js + HTMX, this release marks the finish line.

---

## Contact Profiles CycloneDX Alignment

Contact profiles have been restructured to align with the CycloneDX specification. The new **3-level hierarchy** (Profile → Entity → Contact) matches how CycloneDX represents organizational and contact information.

If you have existing contact profiles, they will be automatically migrated to the new structure. No action required on your part.

---

## Billing System Improvements

We have made several improvements to how billing works:

- **Dynamic pricing from Stripe** - Pricing is now synced directly from Stripe, ensuring consistency across the platform
- **Promotion codes at checkout** - You can now apply promotion codes when subscribing or upgrading
- **Billing period visibility** - Your current billing period and next billing date are now displayed in team settings
- **Improved subscription management** - New management commands for subscription reconciliation and better webhook handling

---

## Other Improvements

- **Trust Center**: Consolidated templates, improved SEO, and better UX across the board
- **CycloneDX 1.6+**: Added manufacturer field support with backward compatibility for 1.5
- **CI/CD Templates**: New configuration templates for Azure DevOps and Jenkins
- **License Expressions**: Optimized parsing with server-side rendering support
- **Mobile Experience**: Improved search bar responsiveness on mobile devices
- **Document Upload**: Better drag-and-drop experience
- **Workspace Labels**: Now use title case (Product, Compliance Artifact, Project)

---

## Security and Infrastructure

On the security front, we addressed findings from Semgrep and Bandit scans, added `noreferrer` to external links, and fixed a user invitation limit bypass vulnerability.

Infrastructure updates include upgrading our base image to **Debian Trixie**, updating `python-keycloak` to 7.0.1, and bumping our GitHub Actions dependencies to their latest versions.

---

## Bug Fixes

- Fixed duplicate artifacts appearing in release pages when components belong to multiple projects
- Fixed barcode rendering on private product identifiers page
- Fixed latest badge display and modal issues in release UI
- Fixed private component access returning 404 instead of 403 Forbidden
- Fixed `$schema` alias handling in CycloneDX SBOM serialization
- Fixed domain verification cron job registration

---

## Getting Started

If you are self-hosting sbomify, update to v0.24 to take advantage of the new plugin system. For users on our hosted platform, these features are already live.

To enable assessment plugins, navigate to **Settings → Plugins** and enable the assessments relevant to your requirements. From there, every SBOM upload will be automatically assessed, with full historical tracking of all results.

Check out the [full changelog on GitHub](https://github.com/sbomify/sbomify/compare/v0.23...master) for complete details.

As always, I would love to hear your feedback. Drop us a note or open an issue on GitHub if you have questions, suggestions, or ideas for new plugins. The plugin architecture is designed to be extensible, and we are eager to hear what assessments would be most valuable to you!
