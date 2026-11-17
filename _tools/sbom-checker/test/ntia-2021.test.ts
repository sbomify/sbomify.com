/**
 * Port of sbomify `sbomify/apps/plugins/tests/test_ntia_plugin.py`, plus the
 * pure-logic cases of `test_ntia_integration.py` (file-type skips, the
 * compliant / non-compliant workflow fixtures).
 *
 * Not ported, because the TS framework receives already-parsed JSON:
 *   - TestErrorHandling.test_invalid_json (JSON decode error result)
 *   - plugin metadata (`get_metadata().category`, plugin_version, result
 *     metadata such as sbom_format / standard_name / error flag) has no
 *     equivalent object; the Framework fields are asserted instead.
 *   - Finding.metadata (standard / standard_version) and severity are not part
 *     of the TS Finding shape.
 *   - Django / DB / API / signal integration tests.
 */

import { describe, expect, test } from "bun:test";
import { ntia2021, NTIA_2021_FINDING_IDS } from "../src/frameworks/ntia-2021";
import type { Finding } from "../src/types";
import { counts, findingById, run, sbom } from "./helpers";

const ID = {
  supplier: "ntia-2021:supplier-name",
  name: "ntia-2021:component-name",
  version: "ntia-2021:version",
  uid: "ntia-2021:unique-identifiers",
  dep: "ntia-2021:dependency-relationship",
  author: "ntia-2021:sbom-author",
  timestamp: "ntia-2021:timestamp",
} as const;

function assess(data: unknown): Finding[] {
  return run(ntia2021, data).findings;
}

function status(findings: Finding[], id: string): string {
  return findingById(findings, id).status;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

describe("NTIA plugin metadata", () => {
  test("plugin metadata", () => {
    expect(ntia2021.id).toBe("ntia-2021");
    expect(ntia2021.version).toBe("2021-07");
  });

  test("plugin standard info", () => {
    expect(ntia2021.name).toBe("NTIA Minimum Elements for a Software Bill of Materials (SBOM)");
    expect(ntia2021.version).toBe("2021-07");
    expect(ntia2021.url).toBe("https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials-sbom");
    expect(ntia2021.guideUrl).toBe("https://sbomify.com/compliance/ntia-minimum-elements/");
  });

  test("finding ids match standard", () => {
    for (const id of Object.values(NTIA_2021_FINDING_IDS)) {
      expect(id.startsWith("ntia-2021:")).toBe(true);
    }
    expect(Object.values(NTIA_2021_FINDING_IDS).sort()).toEqual(Object.values(ID).sort());
  });
});

// ---------------------------------------------------------------------------
// CycloneDX
// ---------------------------------------------------------------------------

function cdx(overrides: Record<string, unknown> = {}, component: Record<string, unknown> | null = null): Record<string, unknown> {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    components: [
      { "bom-ref": "pkg:pypi/example-component@1.0.0", ...(component ?? {
        name: "example-component",
        version: "1.0.0",
        publisher: "Example Corp",
        purl: "pkg:pypi/example-component@1.0.0",
      }) },
    ],
    dependencies: [{ ref: "pkg:pypi/example-component@1.0.0", dependsOn: [] }],
    metadata: { authors: [{ name: "Example Developer" }], timestamp: "2023-01-01T00:00:00Z" },
    ...overrides,
  };
}

describe("CycloneDX validation", () => {
  test("compliant cyclonedx sbom", () => {
    const findings = assess(cdx());
    const c = counts(findings);
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(7);
    expect(c.total).toBe(7);
    expect(findings.map((f) => f.id)).toEqual([ID.supplier, ID.name, ID.version, ID.uid, ID.dep, ID.author, ID.timestamp]);
  });

  test("cyclonedx missing supplier", () => {
    const findings = assess(
      cdx({}, { name: "example-component", version: "1.0.0", purl: "pkg:pypi/example-component@1.0.0" }),
    );
    expect(counts(findings).fail).toBe(1);
    const f = findingById(findings, ID.supplier);
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["example-component"]);
    expect(f.affectedCount).toBe(1);
    expect(f.description).toBe(
      "Name of entity that creates, defines, and identifies components. Missing for 1 component.",
    );
    expect(f.remediation).toBe("Add publisher field or supplier.name to components.");
  });

  test("cyclonedx missing version", () => {
    const findings = assess(
      cdx({}, { name: "example-component", publisher: "Example Corp", purl: "pkg:pypi/example-component@1.0.0" }),
    );
    expect(counts(findings).fail).toBe(1);
    expect(status(findings, ID.version)).toBe("fail");
  });

  test("cyclonedx missing dependencies", () => {
    const data = cdx();
    delete data.dependencies;
    const findings = assess(data);
    const f = findingById(findings, ID.dep);
    expect(f.status).toBe("fail");
    expect(f.description).toContain("No dependencies section found");
  });

  test("cyclonedx missing author", () => {
    const findings = assess(cdx({ metadata: { timestamp: "2023-01-01T00:00:00Z" } }));
    expect(status(findings, ID.author)).toBe("fail");
  });

  test("cyclonedx missing timestamp", () => {
    const findings = assess(cdx({ metadata: { authors: [{ name: "Example Developer" }] } }));
    const f = findingById(findings, ID.timestamp);
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Missing timestamp");
  });

  test("cyclonedx with tools instead of authors", () => {
    const findings = assess(cdx({ metadata: { tools: [{ name: "sbom-generator" }], timestamp: "2023-01-01T00:00:00Z" } }));
    expect(status(findings, ID.author)).toBe("pass");
  });

  test("cyclonedx with supplier object", () => {
    const findings = assess(
      cdx({}, { name: "example-component", version: "1.0.0", supplier: { name: "Example Corp" }, purl: "pkg:pypi/x@1" }),
    );
    expect(status(findings, ID.supplier)).toBe("pass");
  });

  test("cyclonedx with hashes as unique id", () => {
    const findings = assess(
      cdx(
        { dependencies: [{ ref: "example-component", dependsOn: [] }] },
        {
          name: "example-component",
          version: "1.0.0",
          publisher: "Example Corp",
          hashes: [{ alg: "SHA-256", content: "abc123" }],
        },
      ),
    );
    expect(status(findings, ID.uid)).toBe("fail");
  });

  test("cyclonedx with cpe as unique id", () => {
    const findings = assess(
      cdx(
        { dependencies: [{ ref: "example-component", dependsOn: [] }] },
        {
          name: "example-component",
          version: "1.0.0",
          publisher: "Example Corp",
          cpe: "cpe:2.3:a:example:component:1.0.0:*:*:*:*:*:*:*",
        },
      ),
    );
    expect(status(findings, ID.uid)).toBe("pass");
  });

  test("cyclonedx with swid as unique id", () => {
    const findings = assess(
      cdx(
        { dependencies: [{ ref: "example-component", dependsOn: [] }] },
        {
          name: "example-component",
          version: "1.0.0",
          publisher: "Example Corp",
          swid: { tagId: "example.com+example-component@1.0.0" },
        },
      ),
    );
    expect(status(findings, ID.uid)).toBe("pass");
  });

  test("malformed supplier as list", () => {
    const findings = assess(
      cdx(
        { metadata: { authors: [{ name: "Author" }], timestamp: "2023-01-01T00:00:00Z" } },
        {
          name: "test-component",
          version: "1.0.0",
          supplier: [{ name: "Corp A" }, { name: "Corp B" }],
          purl: "pkg:pypi/test@1.0.0",
        },
      ),
    );
    expect(counts(findings).error).toBe(0);
    expect(status(findings, ID.supplier)).toBe("fail");
  });
});

// ---------------------------------------------------------------------------
// SPDX 2.x
// ---------------------------------------------------------------------------

function spdx(pkg: Record<string, unknown>, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    spdxVersion: "SPDX-2.3",
    packages: [pkg],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Package" },
    ],
    creationInfo: { creators: ["Tool: example-tool"], created: "2023-01-01T00:00:00Z" },
    ...overrides,
  };
}

const goodSpdxPackage = {
  SPDXID: "SPDXRef-Package",
  name: "example-package",
  supplier: "Organization: Example Corp",
  versionInfo: "1.0.0",
  externalRefs: [
    {
      referenceCategory: "PACKAGE-MANAGER",
      referenceType: "purl",
      referenceLocator: "pkg:pypi/example-package@1.0.0",
    },
  ],
};

describe("SPDX validation", () => {
  test("compliant spdx sbom", () => {
    const c = counts(assess(spdx(goodSpdxPackage)));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(7);
  });

  test("spdx missing supplier", () => {
    const pkg: Record<string, unknown> = { ...goodSpdxPackage };
    delete pkg.supplier;
    const f = findingById(assess(spdx(pkg)), ID.supplier);
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["example-package"]);
    expect(f.remediation).toBe("Add supplier field to packages. Use 'NOASSERTION' if supplier is unknown.");
  });

  test("spdx missing all required fields", () => {
    const data = { spdxVersion: "SPDX-2.3", packages: [{ SPDXID: "SPDXRef-Package" }], creationInfo: {} };
    const findings = assess(data);
    expect(counts(findings).fail).toBeGreaterThanOrEqual(6);
    // A nameless package is listed by index for the name check.
    expect(findingById(findings, ID.name).affected).toEqual(["Package at index 0"]);
    expect(findingById(findings, ID.supplier).affected).toEqual(["Package 1"]);
  });

  test("spdx with contains relationship", () => {
    const pkg = { ...goodSpdxPackage, externalRefs: [{ referenceType: "purl", referenceLocator: "pkg:pypi/example@1.0.0" }] };
    const data = spdx(pkg, {
      relationships: [
        { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "CONTAINS", relatedSpdxElement: "SPDXRef-Package" },
      ],
    });
    expect(status(assess(data), ID.dep)).toBe("pass");
  });

  test("spdx invalid timestamp format", () => {
    const data = spdx(goodSpdxPackage, { creationInfo: { creators: ["Tool: example-tool"], created: "invalid-timestamp" } });
    const f = findingById(assess(data), ID.timestamp);
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Invalid ISO-8601 format");
  });

  test("spdx with invalid external ref type", () => {
    const pkg = {
      ...goodSpdxPackage,
      externalRefs: [
        { referenceCategory: "SECURITY", referenceType: "advisory", referenceLocator: "https://example.com/advisory/123" },
      ],
    };
    expect(status(assess(spdx(pkg)), ID.uid)).toBe("fail");
  });

  test("spdx with cpe external ref", () => {
    const pkg = {
      ...goodSpdxPackage,
      externalRefs: [
        {
          referenceCategory: "SECURITY",
          referenceType: "cpe23Type",
          referenceLocator: "cpe:2.3:a:example:package:1.0.0:*:*:*:*:*:*:*",
        },
      ],
    };
    expect(status(assess(spdx(pkg)), ID.uid)).toBe("pass");
  });

  test("spdx with swid external ref", () => {
    const pkg = {
      ...goodSpdxPackage,
      externalRefs: [
        {
          referenceCategory: "PACKAGE-MANAGER",
          referenceType: "swid",
          referenceLocator: "swid:example.com+example-package@1.0.0",
        },
      ],
    };
    expect(status(assess(spdx(pkg)), ID.uid)).toBe("pass");
  });

  test("malformed reference type as list", () => {
    const pkg = {
      SPDXID: "SPDXRef-Package",
      name: "test-package",
      supplier: "Organization: Test",
      versionInfo: "1.0.0",
      externalRefs: [{ referenceType: ["purl", "cpe23Type"] }],
    };
    const findings = assess(spdx(pkg, { creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z" } }));
    expect(counts(findings).error).toBe(0);
    expect(status(findings, ID.uid)).toBe("fail");
  });

  test("malformed relationship type as list", () => {
    const pkg = {
      SPDXID: "SPDXRef-Package",
      name: "test",
      supplier: "Org: Test",
      versionInfo: "1.0",
      purl: "pkg:pypi/test@1.0",
    };
    const data = spdx(pkg, {
      relationships: [
        {
          spdxElementId: "SPDXRef-DOCUMENT",
          relationshipType: ["DEPENDS_ON", "CONTAINS"],
          relatedSpdxElement: "SPDXRef-Package",
        },
      ],
      creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z" },
    });
    const findings = assess(data);
    expect(counts(findings).error).toBe(0);
    expect(status(findings, ID.dep)).toBe("fail");
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("Error handling", () => {
  // test_invalid_json: not applicable, the framework receives parsed JSON.

  test("unknown format", () => {
    const findings = assess({ some: "data", without: "format indicators" });
    expect(counts(findings).error).toBe(1);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("ntia-2021:error");
    expect(findings[0]!.title).toBe("Assessment Error");
    expect(findings[0]!.description.toLowerCase()).toContain("format");
    expect(findings[0]!.description).toBe("Unable to detect SBOM format (expected SPDX or CycloneDX)");
  });

  test("empty components", () => {
    const findings = assess(cdx({ components: [], dependencies: [] }));
    expect(status(findings, ID.dep)).toBe("fail");
    for (const id of [ID.supplier, ID.name, ID.version, ID.uid]) expect(status(findings, id)).toBe("pass");
  });
});

// ---------------------------------------------------------------------------
// Finding details
// ---------------------------------------------------------------------------

describe("Finding details", () => {
  test("findings have remediation", () => {
    const findings = assess({ bomFormat: "CycloneDX", specVersion: "1.5", components: [{ name: "example" }], metadata: {} });
    expect(counts(findings).fail).toBeGreaterThan(0);
    for (const f of findings) {
      if (f.status === "fail") expect(f.remediation).toBeTruthy();
      else expect(f.remediation).toBeUndefined();
    }
  });

  test("findings have standard metadata", () => {
    // Python asserted finding.metadata.standard == "NTIA"; TS findings carry the id prefix instead.
    const findings = assess(
      cdx(
        { dependencies: [{ ref: "pkg:npm/example@1.0.0", dependsOn: [] }], metadata: { authors: [{ name: "Author" }], timestamp: "2023-01-01T00:00:00Z" } },
        { name: "example", version: "1.0.0", publisher: "Example", purl: "pkg:npm/example@1.0.0" },
      ),
    );
    for (const f of findings) expect(f.id.startsWith("ntia-2021:")).toBe(true);
  });

  test("result includes standard info", () => {
    // Python asserted result.metadata standard_* == plugin STANDARD_*; covered by the Framework fields.
    const findings = assess({ bomFormat: "CycloneDX", specVersion: "1.5", components: [], metadata: { timestamp: "2023-01-01T00:00:00Z" } });
    expect(findings).toHaveLength(7);
    expect(ntia2021.url).toBe("https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials-sbom");
  });

  test("affected list is capped at 25 with a full count", () => {
    const components = Array.from({ length: 30 }, (_, i) => ({ name: `c${i}` }));
    const f = findingById(assess(cdx({ components })), ID.supplier);
    expect(f.status).toBe("fail");
    expect(f.affected).toHaveLength(25);
    expect(f.affected![0]).toBe("c0");
    expect(f.affectedCount).toBe(30);
    expect(f.description).toContain("Missing for 30 components.");
  });
});

// ---------------------------------------------------------------------------
// SPDX 3.0
// ---------------------------------------------------------------------------

function baseSpdx3(): { "@context": string; "@graph": Record<string, unknown>[] } {
  return {
    "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
    "@graph": [
      {
        type: "CreationInfo",
        "@id": "_:creationInfo",
        specVersion: "3.0.1",
        created: "2024-01-15T12:00:00Z",
        createdBy: ["SPDXRef-Creator"],
      },
      {
        type: "Organization",
        spdxId: "SPDXRef-Creator",
        name: "SBOM Creator Corp",
        externalIdentifier: [{ externalIdentifierType: "email", identifier: "creator@example.com" }],
      },
      {
        type: "Organization",
        spdxId: "SPDXRef-Supplier",
        name: "Supplier Corp",
        externalIdentifier: [{ externalIdentifierType: "email", identifier: "supplier@example.com" }],
      },
      {
        type: "software_Package",
        spdxId: "SPDXRef-Package-1",
        name: "example-package",
        software_packageVersion: "1.0.0",
        originatedBy: ["SPDXRef-Supplier"],
        externalIdentifier: [{ externalIdentifierType: "packageUrl", identifier: "pkg:pypi/example@1.0.0" }],
      },
      {
        type: "Relationship",
        spdxId: "SPDXRef-Rel-1",
        from: "SPDXRef-Package-1",
        relationshipType: "dependsOn",
        to: [],
      },
    ],
  };
}

describe("SPDX 3.0 validation", () => {
  test("compliant spdx3 sbom", () => {
    const c = counts(assess(baseSpdx3()));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(7);
    expect(c.total).toBe(7);
  });

  test("spdx3 format detection", () => {
    expect(sbom(baseSpdx3()).format).toBe("spdx3");
  });

  test("spdx3 missing supplier", () => {
    const data = baseSpdx3();
    delete data["@graph"][3]!.originatedBy;
    const f = findingById(assess(data), ID.supplier);
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["example-package"]);
    expect(f.remediation).toBe("Add originatedBy reference to Person/Organization element.");
  });

  test("spdx3 missing version", () => {
    const data = baseSpdx3();
    delete data["@graph"][3]!.software_packageVersion;
    expect(status(assess(data), ID.version)).toBe("fail");
  });

  test("spdx3 missing unique identifiers", () => {
    const data = baseSpdx3();
    delete data["@graph"][3]!.externalIdentifier;
    const f = findingById(assess(data), ID.uid);
    expect(f.status).toBe("fail");
    expect(f.remediation).toBe(
      "Add software_packageUrl to each package, or an externalIdentifier of type packageUrl, cpe23 or swid.",
    );
  });

  test("spdx3 missing dependencies", () => {
    const data = baseSpdx3();
    data["@graph"] = data["@graph"].filter((e) => e.type !== "Relationship");
    const f = findingById(assess(data), ID.dep);
    expect(f.status).toBe("fail");
    expect(f.description).toContain("No dependsOn or contains relationships found");
  });

  test("spdx3 missing sbom author", () => {
    const data = baseSpdx3();
    data["@graph"][0]!.createdBy = [];
    expect(status(assess(data), ID.author)).toBe("fail");
  });

  test("spdx3 missing timestamp", () => {
    const data = baseSpdx3();
    delete data["@graph"][0]!.created;
    expect(status(assess(data), ID.timestamp)).toBe("fail");
  });

  test("spdx3 with contains relationship", () => {
    const data = baseSpdx3();
    data["@graph"][4]!.relationshipType = "contains";
    expect(status(assess(data), ID.dep)).toBe("pass");
  });

  test("spdx3 malformed relationship type as list", () => {
    const data = baseSpdx3();
    data["@graph"][4]!.relationshipType = ["dependsOn", "contains"];
    const findings = assess(data);
    expect(counts(findings).error).toBe(0);
    expect(status(findings, ID.dep)).toBe("fail");
  });
});

// ---------------------------------------------------------------------------
// From test_ntia_integration.py (pure-logic cases)
// ---------------------------------------------------------------------------

describe("Integration fixtures", () => {
  test("full assessment workflow compliant", () => {
    const c = counts(assess(cdx()));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(7);
  });

  test("full assessment workflow non compliant", () => {
    const c = counts(
      assess({ bomFormat: "CycloneDX", specVersion: "1.5", components: [{ name: "example-component" }], metadata: {} }),
    );
    expect(c.fail).toBeGreaterThan(0);
  });
});

const django = {
  name: "django",
  version: "5.2.3",
  type: "library",
  purl: "pkg:pypi/django@5.2.3",
  publisher: "Django",
};

function cdx16(components: Record<string, unknown>[], specVersion = "1.6"): Record<string, unknown> {
  return {
    bomFormat: "CycloneDX",
    specVersion,
    metadata: { authors: [{ name: "Dev" }], timestamp: "2026-01-01T00:00:00Z" },
    components,
    dependencies: [{ ref: "pkg:pypi/django@5.2.3", dependsOn: [] }],
  };
}

function spdxDoc(packages: Record<string, unknown>[]): Record<string, unknown> {
  return {
    spdxVersion: "SPDX-2.3",
    SPDXID: "SPDXRef-DOCUMENT",
    name: "test",
    dataLicense: "CC0-1.0",
    documentNamespace: "https://example.com/test",
    creationInfo: { created: "2026-01-01T00:00:00Z", creators: ["Tool: test"] },
    packages: [
      {
        SPDXID: "SPDXRef-Package-django",
        name: "django",
        versionInfo: "5.2.3",
        supplier: "Organization: Django",
        downloadLocation: "NOASSERTION",
        externalRefs: [
          { referenceCategory: "PACKAGE-MANAGER", referenceType: "purl", referenceLocator: "pkg:pypi/django@5.2.3" },
        ],
      },
      ...packages,
    ],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Package-django" },
    ],
  };
}

describe("File-type components assessed", () => {
  test("cyclonedx file type assessed in purl check", () => {
    const findings = assess(
      cdx16([django, { name: "uv.lock", type: "file", hashes: [{ alg: "SHA-256", content: "abc123" }] }]),
    );
    expect(status(findings, ID.uid)).toBe("fail");
  });

  test("spdx file entry assessed in purl check", () => {
    const findings = assess(
      spdxDoc([
        { SPDXID: "SPDXRef-DocumentRoot-File-uv.lock", name: "uv.lock", downloadLocation: "NOASSERTION", filesAnalyzed: false },
      ]),
    );
    expect(status(findings, ID.uid)).toBe("fail");
  });

  test("cyclonedx file type assessed in supplier and version checks", () => {
    const findings = assess(
      cdx16([django, { name: "uv.lock", type: "file", hashes: [{ alg: "SHA-256", content: "abc123" }] }]),
    );
    expect(status(findings, ID.supplier)).toBe("fail");
    expect(status(findings, ID.version)).toBe("fail");
  });

  test("spdx file entry assessed in supplier and version checks", () => {
    const findings = assess(
      spdxDoc([
        { SPDXID: "SPDXRef-DocumentRoot-File-uv.lock", name: "uv.lock", downloadLocation: "NOASSERTION", filesAnalyzed: false },
      ]),
    );
    expect(status(findings, ID.supplier)).toBe("fail");
    expect(status(findings, ID.version)).toBe("fail");
  });

  test("cyclonedx library component still fails when missing fields", () => {
    const findings = assess({
      ...cdx16([
        { name: "unmaintained-lib", type: "library", purl: "pkg:pypi/unmaintained-lib@unknown" },
        { name: "uv.lock", type: "file" },
      ]),
      dependencies: [{ ref: "pkg:pypi/unmaintained-lib@unknown", dependsOn: [] }],
    });
    const supplier = findingById(findings, ID.supplier);
    const version = findingById(findings, ID.version);
    expect(supplier.status).toBe("fail");
    expect(supplier.affected).toContain("unmaintained-lib");
    expect(supplier.affected).toContain("uv.lock");
    expect(version.status).toBe("fail");
    expect(version.affected).toContain("unmaintained-lib");
  });

  test("cyclonedx file type case insensitive", () => {
    const findings = assess(
      cdx16([
        django,
        { name: "lock1.lock", type: "File" },
        { name: "lock2.lock", type: "FILE" },
        { name: "lock3.lock", type: "file" },
      ]),
    );
    for (const id of [ID.supplier, ID.version, ID.uid]) expect(status(findings, id)).toBe("fail");
  });
});

describe("File-type names cannot bypass checks across generators", () => {


  test("spdx syft document root file naming", () => {
    missingCore(
      assess(spdxDoc([{ SPDXID: "SPDXRef-DocumentRoot-File-uv.lock-e473982c", name: "uv.lock", downloadLocation: "NOASSERTION" }])),
    );
  });

  test("spdx microsoft sbom tool double dash naming", () => {
    missingCore(
      assess(
        spdxDoc([
          {
            SPDXID: "SPDXRef-File--sbom-tool-win-x64.exe-E55F25E239D8D3572D75D5CDC5CA24899FD4993F",
            name: "sbom-tool-win-x64.exe",
            downloadLocation: "NOASSERTION",
          },
        ]),
      ),
    );
  });

  test("spdx clean file naming", () => {
    missingCore(assess(spdxDoc([{ SPDXID: "SPDXRef-File-manifest.txt", name: "manifest.txt", downloadLocation: "NOASSERTION" }])));
  });

  test("spdx real packages containing file in name not skipped", () => {
    const findings = assess(
      spdxDoc([
        { SPDXID: "SPDXRef-Package-filelock-3.12.0", name: "filelock", downloadLocation: "NOASSERTION" },
        { SPDXID: "SPDXRef-Package-FileManager-abc123", name: "FileManager", downloadLocation: "NOASSERTION" },
        { SPDXID: "SPDXRef-Package-python-file-utils-2.0", name: "python-file-utils", downloadLocation: "NOASSERTION" },
      ]),
    );
    const supplier = findingById(findings, ID.supplier);
    const version = findingById(findings, ID.version);
    expect(supplier.status).toBe("fail");
    expect(version.status).toBe("fail");
    for (const name of ["filelock", "FileManager", "python-file-utils"]) {
      expect(supplier.affected).toContain(name);
      expect(version.affected).toContain(name);
    }
  });

  test("cyclonedx works on multiple spec versions", () => {
    for (const v of ["1.4", "1.5", "1.6"]) {
      missingCore(assess(cdx16([django, { name: "uv.lock", type: "file" }], v)));
    }
  });
});

// ---------------------------------------------------------------------------
// Hostile input: assess must never throw
// ---------------------------------------------------------------------------

describe("Hostile input", () => {
  const hostile: unknown[] = [
    null,
    42,
    "string",
    [],
    [1, 2],
    {},
    { bomFormat: "CycloneDX", components: "nope", dependencies: 5, metadata: [] },
    { bomFormat: "CycloneDX", components: [null, 1, "x", [], { name: null, type: null, supplier: "s", publisher: 0 }] },
    { bomFormat: "CycloneDX", components: [], metadata: { timestamp: 12345, authors: "someone" } },
    { spdxVersion: 3, packages: "x", relationships: { a: 1 }, creationInfo: "c" },
    { spdxVersion: "SPDX-2.3", packages: [{ name: 7, SPDXID: ["x"], externalRefs: "no" }], creationInfo: { created: [] } },
    { spdxVersion: "SPDX-2.3", creationInfo: { created: { y: 2020 }, creators: "Tool: x" }, relationships: [null, 5] },
    { "@graph": 5 },
    { "@graph": null, elements: [{ type: "software_Package", name: "p" }] },
    { "@context": ["https://spdx.org/rdf/3.0.1/spdx-context.jsonld"], "@graph": [null, 1, { type: 5 }, { type: null }] },
    {
      "@graph": [
        { type: "CreationInfo", createdBy: [[1], { name: 3 }, 4, "SpdxOrganization"], created: 99 },
        { type: "Person", spdxId: ["bad"] },
        { type: "software_Package", name: ["x"], originatedBy: [[1]], externalIdentifier: [{ externalIdentifierType: ["purl"] }] },
        { type: "Relationship", relationshipType: null },
      ],
    },
  ];

  test("assess never throws and always returns findings", () => {
    for (const data of hostile) {
      let findings: Finding[] = [];
      expect(() => {
        findings = ntia2021.assess(sbom(data));
      }).not.toThrow();
      expect(findings.length === 1 || findings.length === 7).toBe(true);
    }
  });

  test("non-string truthy timestamp is invalid, not a crash", () => {
    const f = findingById(assess(cdx({ metadata: { authors: [{ name: "a" }], timestamp: 12345 } })), ID.timestamp);
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Invalid ISO-8601 format");
  });

  test("assess on a DetectedSbom with non-object data does not throw", () => {
    const detected = { format: "cyclonedx" as const, specVersion: null, schemaVersion: null, data: null as never };
    expect(() => ntia2021.assess(detected)).not.toThrow();
  });

  test("spdx3 inline and SpdxOrganization agents count", () => {
    const data = baseSpdx3();
    data["@graph"][3]!.originatedBy = { type: "Organization", name: "Inline Corp" };
    data["@graph"][0]!.createdBy = "SpdxOrganization";
    const findings = assess(data);
    expect(status(findings, ID.supplier)).toBe("pass");
    expect(status(findings, ID.author)).toBe("pass");
  });

  test("clone helper keeps fixtures independent", () => {
    const a = clone(baseSpdx3());
    a["@graph"].length = 0;
    expect(baseSpdx3()["@graph"]).toHaveLength(5);
  });
});

function missingCore(fs: Finding[]): void {
  for (const id of [ID.version, ID.supplier, ID.uid]) expect(status(fs, id)).toBe("fail");
}
