---

url: /share-and-collaborate/
title: Share and Collaborate on SBOMs
description: "Centralize SBOM management and share software transparency artifacts with customers, auditors, and internal teams through sbomify's Trust Center and integrations."

---

sbomify is a central hub for managing and sharing SBOMs and compliance artifacts. Suppliers upload SBOMs automatically through CI/CD integrations, while stakeholders (customers, auditors, and internal teams) access them through the [Trust Center](/features/trust-center/) or direct exports.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-sharing" >}}
</div>

## Centralized SBOM Hub

Instead of sharing SBOMs over email or scattered file shares, sbomify provides a single source of truth. Vendors and internal teams upload SBOMs via [CI/CD integrations](/features/integrations/) (GitHub Actions, GitLab CI, etc.), and sbomify stores, enriches, and distributes them automatically.

Because an SBOM is a snapshot of a specific point in time, having a centralized platform where the latest versions are always available is critical. sbomify ensures stakeholders can access the most current SBOMs at any time, whether for compliance audits, vulnerability management, or procurement decisions.

Both CycloneDX and SPDX formats are fully supported.

## Hierarchical Organization

Most real-world products are composed of multiple backend services, frontend components, and infrastructure, each with its own SBOM. sbomify organizes these through a hierarchy of **Products**, **Projects**, and **Components**, reflecting how your software is actually structured.

<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {{< d2 "sbom-hierarchy" >}}
</div>

In the example above, a Smart Thermostat product contains both an IoT device firmware and a backend composed of Python, Node, and Docker SBOMs. With sbomify, you can share individual component SBOMs or the entire product SBOM (aggregating all sub-components) with stakeholders.

This hierarchical approach uses linkage rather than flattening, so no contextual data is lost. You always know exactly where an affected component lives. Learn more about [SBOM hierarchy and release management](/features/sbom-hierarchy/).

## Trust Center

The [Trust Center](/features/trust-center/) is the primary way to share SBOMs and compliance artifacts with external stakeholders. It's a branded portal on your own domain where customers and auditors can access:

- Current SBOMs for your products
- Compliance documents and certifications
- Penetration test results and security assessments

The Trust Center stays in sync with your CI/CD pipeline, automatically publishing new SBOMs with every release. Access can be public (for broad transparency) or private (for invited stakeholders only). Available on Business and Enterprise plans.

{{< cta-ready >}}
