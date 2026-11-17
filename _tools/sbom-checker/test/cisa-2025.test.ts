/**
 * Port of sbomify `sbomify/apps/plugins/tests/test_cisa_2025_plugin.py`.
 *
 * Not ported, with reason:
 *   - test_plugin_metadata (plugin registry name/category): no registry here.
 *   - test_invalid_json: input arrives parsed; a JSON error never reaches a framework.
 *   - test_findings_have_standard_metadata: findings carry no per-finding metadata
 *     dict in this package; the standard version is on the framework instead.
 *   - test_cisa_integration.py: Django/DB workflow tests against cisa-2026.
 */

import { describe, expect, test } from "bun:test";
import { GENERATION_CONTEXT_VALUES, cisa2025, statesGenerationContext } from "../src/frameworks/cisa-2025";
import type { Finding } from "../src/types";
import { counts, findingById, run, sbom } from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any;

function assess(data: unknown): Finding[] {
  return run(cisa2025, data).findings;
}

/** Python's `next(f for f in findings if needle in f.id)`. */
function find(findings: Finding[], needle: string): Finding {
  const f = findings.find((x) => x.id.includes(needle));
  if (!f) throw new Error(`no finding matching ${needle}`);
  return f;
}

function statusOf(data: unknown, needle: string): string {
  return find(assess(data), needle).status;
}

function baseCyclonedx(): Doc {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    components: [
      {
        name: "example-component",
        version: "1.0.0",
        publisher: "Example Corp",
        purl: "pkg:pypi/example-component@1.0.0",
        hashes: [{ alg: "SHA-256", content: "abc123def456" }],
        licenses: [{ license: { id: "MIT" } }],
      },
    ],
    dependencies: [{ ref: "pkg:pypi/example-component@1.0.0", dependsOn: [] }],
    metadata: {
      authors: [{ name: "Example Developer" }],
      tools: [{ name: "sbom-generator", version: "1.0.0" }],
      timestamp: "2023-01-01T00:00:00Z",
      properties: [{ name: "cdx:sbom:generationContext", value: "build" }],
    },
  };
}

function baseSpdx(): Doc {
  return {
    spdxVersion: "SPDX-2.3",
    packages: [
      {
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
        checksums: [{ algorithm: "SHA256", checksumValue: "abc123def456" }],
        licenseConcluded: "MIT",
      },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Package" },
    ],
    creationInfo: {
      creators: ["Tool: example-tool (1.0.0)", "Person: Developer"],
      created: "2023-01-01T00:00:00Z",
    },
    annotations: [
      {
        annotationType: "OTHER",
        spdxElementId: "SPDXRef-DOCUMENT",
        comment: "cisa:generationContext=build",
        annotator: "Tool: example-tool",
        annotationDate: "2023-01-01T00:00:00Z",
      },
    ],
  };
}

function baseSpdx3(): Doc {
  return {
    "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
    "@graph": [
      {
        type: "CreationInfo",
        "@id": "_:creationInfo",
        specVersion: "3.0.1",
        created: "2024-01-15T12:00:00Z",
        createdBy: ["SPDXRef-Creator"],
        createdUsing: ["SPDXRef-Tool"],
        comment: "Generated during build phase",
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
      { type: "Tool", spdxId: "SPDXRef-Tool", name: "sbom-generator" },
      {
        type: "software_Package",
        spdxId: "SPDXRef-Package-1",
        name: "example-package",
        software_packageVersion: "1.0.0",
        originatedBy: ["SPDXRef-Supplier"],
        externalIdentifier: [{ externalIdentifierType: "packageUrl", identifier: "pkg:pypi/example@1.0.0" }],
        verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "abc123" }],
      },
      { type: "Relationship", spdxId: "SPDXRef-Rel-1", from: "SPDXRef-Package-1", relationshipType: "dependsOn", to: [] },
      {
        type: "Relationship",
        spdxId: "SPDXRef-Rel-2",
        from: "SPDXRef-Package-1",
        relationshipType: "hasConcludedLicense",
        to: ["SPDXRef-License-1"],
      },
      {
        type: "simpleLicensing_LicenseExpression",
        spdxId: "SPDXRef-License-1",
        simpleLicensing_licenseExpression: "MIT",
      },
    ],
  };
}

const ALL_IDS = [
  "cisa-2025:sbom-author",
  "cisa-2025:software-producer",
  "cisa-2025:component-name",
  "cisa-2025:component-version",
  "cisa-2025:software-identifiers",
  "cisa-2025:component-hash",
  "cisa-2025:license",
  "cisa-2025:dependency-relationship",
  "cisa-2025:tool-name",
  "cisa-2025:timestamp",
  "cisa-2025:generation-context",
];

const PER_COMPONENT_IDS = [
  "cisa-2025:software-producer",
  "cisa-2025:component-version",
  "cisa-2025:software-identifiers",
  "cisa-2025:component-hash",
  "cisa-2025:license",
];

describe("CISA 2025 plugin metadata", () => {
  test("plugin standard info", () => {
    expect(cisa2025.name).toBe(
      "CISA 2025 Minimum Elements for a Software Bill of Materials (SBOM) - Public Comment Draft",
    );
    expect(cisa2025.version).toBe("2025-08-draft");
    expect(cisa2025.url).toBe("https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf");
    expect(cisa2025.guideUrl).toBe("https://sbomify.com/compliance/cisa-minimum-elements/");
    expect(cisa2025.id).toBe("cisa-2025");
  });

  test("finding ids match standard", () => {
    for (const f of assess({ bomFormat: "CycloneDX", specVersion: "1.5", components: [{ name: "x" }] })) {
      expect(f.id.startsWith("cisa-2025:")).toBe(true);
    }
  });

  test("all eleven elements have finding ids", () => {
    const ids = assess(baseCyclonedx()).map((f) => f.id);
    expect(new Set(ids)).toEqual(new Set(ALL_IDS));
    expect(ids).toHaveLength(11);
  });
});

describe("CycloneDX validation", () => {
  test("compliant CycloneDX SBOM", () => {
    const c = counts(assess(baseCyclonedx()));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(11);
    expect(c.total).toBe(11);
  });

  test("missing software producer", () => {
    const d = baseCyclonedx();
    delete d.components[0].publisher;
    expect(statusOf(d, "software-producer")).toBe("fail");
  });

  test("missing component version", () => {
    const d = baseCyclonedx();
    delete d.components[0].version;
    expect(statusOf(d, "component-version")).toBe("fail");
  });

  test("missing software identifiers", () => {
    const d = baseCyclonedx();
    delete d.components[0].purl;
    expect(statusOf(d, "software-identifiers")).toBe("fail");
  });

  test("missing component hash", () => {
    const d = baseCyclonedx();
    delete d.components[0].hashes;
    expect(statusOf(d, "component-hash")).toBe("fail");
  });

  test("missing license", () => {
    const d = baseCyclonedx();
    delete d.components[0].licenses;
    expect(findingById(assess(d), "cisa-2025:license").status).toBe("fail");
  });

  test("file-type component skipped from per-component checks", () => {
    const d = baseCyclonedx();
    d.components.push({ type: "file", name: "uv.lock" });
    const findings = assess(d);
    for (const id of PER_COMPONENT_IDS) expect(findingById(findings, id).status).toBe("pass");
  });

  test("missing dependencies", () => {
    const d = baseCyclonedx();
    delete d.dependencies;
    expect(statusOf(d, "dependency-relationship")).toBe("fail");
  });

  test("missing SBOM author", () => {
    const d = baseCyclonedx();
    delete d.metadata.authors;
    delete d.metadata.tools;
    expect(statusOf(d, "sbom-author")).toBe("fail");
  });

  test("missing tool name", () => {
    const d = baseCyclonedx();
    delete d.metadata.tools;
    expect(statusOf(d, "tool-name")).toBe("fail");
  });

  test("missing timestamp", () => {
    const d = baseCyclonedx();
    delete d.metadata.timestamp;
    expect(statusOf(d, "timestamp")).toBe("fail");
  });

  test("missing generation context", () => {
    const d = baseCyclonedx();
    delete d.metadata.properties;
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("supplier object instead of publisher", () => {
    const d = baseCyclonedx();
    delete d.components[0].publisher;
    d.components[0].supplier = { name: "Example Corp" };
    expect(statusOf(d, "software-producer")).toBe("pass");
  });

  test("CPE identifier", () => {
    const d = baseCyclonedx();
    delete d.components[0].purl;
    d.components[0].cpe = "cpe:2.3:a:example:component:1.0.0:*:*:*:*:*:*:*";
    expect(statusOf(d, "software-identifiers")).toBe("pass");
  });

  test("SWID identifier", () => {
    const d = baseCyclonedx();
    delete d.components[0].purl;
    d.components[0].swid = { tagId: "example-swid-tag" };
    expect(statusOf(d, "software-identifiers")).toBe("pass");
  });

  test("tools 1.5 format", () => {
    const d = baseCyclonedx();
    d.metadata.tools = { components: [{ name: "sbom-tool", version: "2.0.0" }] };
    expect(statusOf(d, "tool-name")).toBe("pass");
  });

  test("generation context values", () => {
    for (const context of ["before_build", "build", "post_build", "source", "analyzed"]) {
      const d = baseCyclonedx();
      d.metadata.properties = [{ name: "cdx:sbom:generationContext", value: context }];
      expect(statusOf(d, "generation-context")).toBe("pass");
    }
  });

  test("invalid generation context", () => {
    const d = baseCyclonedx();
    d.metadata.properties = [{ name: "cdx:sbom:generationContext", value: "invalid_context" }];
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("generation context via lifecycles", () => {
    const d = baseCyclonedx();
    delete d.metadata.properties;
    d.metadata.lifecycles = [{ phase: "build" }];
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("generation context via internal namespace", () => {
    const d = baseCyclonedx();
    d.metadata.properties = [{ name: "internal:sbom:generationContext", value: "build" }];
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("legacy cdx: name still accepted", () => {
    const d = baseCyclonedx();
    delete d.metadata.lifecycles;
    d.metadata.properties = [{ name: "cdx:sbom:generationContext", value: "build" }];
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("lifecycle phases", () => {
    for (const phase of ["design", "pre-build", "build", "post-build", "operations", "discovery", "decommission"]) {
      const d = baseCyclonedx();
      delete d.metadata.properties;
      d.metadata.lifecycles = [{ phase }];
      expect(statusOf(d, "generation-context")).toBe("pass");
    }
  });
});

describe("SPDX validation", () => {
  test("compliant SPDX SBOM", () => {
    const c = counts(assess(baseSpdx()));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(11);
  });

  test("missing software producer", () => {
    const d = baseSpdx();
    delete d.packages[0].supplier;
    expect(statusOf(d, "software-producer")).toBe("fail");
  });

  test("file package skipped from per-component checks", () => {
    const d = baseSpdx();
    d.packages.push({ SPDXID: "SPDXRef-File-LockFile", name: "uv.lock" });
    const findings = assess(d);
    for (const id of PER_COMPONENT_IDS) expect(findingById(findings, id).status).toBe("pass");
  });

  test("missing component hash", () => {
    const d = baseSpdx();
    delete d.packages[0].checksums;
    expect(statusOf(d, "component-hash")).toBe("fail");
  });

  test("missing license", () => {
    const d = baseSpdx();
    delete d.packages[0].licenseConcluded;
    expect(findingById(assess(d), "cisa-2025:license").status).toBe("fail");
  });

  test("licenseDeclared instead of licenseConcluded", () => {
    const d = baseSpdx();
    delete d.packages[0].licenseConcluded;
    d.packages[0].licenseDeclared = "Apache-2.0";
    expect(findingById(assess(d), "cisa-2025:license").status).toBe("pass");
  });

  test("NOASSERTION license passes", () => {
    const d = baseSpdx();
    d.packages[0].licenseConcluded = "NOASSERTION";
    expect(findingById(assess(d), "cisa-2025:license").status).toBe("pass");
  });

  test("missing tool name", () => {
    const d = baseSpdx();
    d.creationInfo.creators = ["Person: Developer"];
    expect(statusOf(d, "tool-name")).toBe("fail");
  });

  test("missing generation context", () => {
    const d = baseSpdx();
    delete d.annotations;
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("CONTAINS relationship", () => {
    const d = baseSpdx();
    d.relationships[0].relationshipType = "CONTAINS";
    expect(statusOf(d, "dependency-relationship")).toBe("pass");
  });

  test("DESCENDANT_OF relationship", () => {
    const d = baseSpdx();
    d.relationships[0].relationshipType = "DESCENDANT_OF";
    expect(statusOf(d, "dependency-relationship")).toBe("pass");
  });

  test("invalid timestamp format", () => {
    const d = baseSpdx();
    d.creationInfo.created = "invalid-timestamp";
    const f = find(assess(d), "timestamp");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Invalid ISO-8601 format");
  });

  test("generation context values", () => {
    for (const context of ["before_build", "build", "post_build", "source", "analyzed"]) {
      const d = baseSpdx();
      d.annotations[0].comment = `cisa:generationContext=${context}`;
      expect(statusOf(d, "generation-context")).toBe("pass");
    }
  });

  test("generation context via creator comment", () => {
    const d = baseSpdx();
    delete d.annotations;
    d.creationInfo.comment = "SBOM generated during build phase";
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("generation context via document comment", () => {
    const d = baseSpdx();
    delete d.annotations;
    d.comment = "This SBOM was created post-build from binary analysis";
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("lifecycle phases in comments", () => {
    for (const phase of ["design", "pre-build", "build", "post-build", "operations", "discovery", "decommission"]) {
      const d = baseSpdx();
      delete d.annotations;
      d.creationInfo.comment = `Generated in ${phase} phase`;
      expect(statusOf(d, "generation-context")).toBe("pass");
    }
  });

  test("SPDX 2.2 processed same as 2.3", () => {
    const baseline = assess(baseSpdx());
    const d = baseSpdx();
    d.spdxVersion = "SPDX-2.2";
    d.documentNamespace = "https://example.com/sbom/example-package-1.0.0";
    for (const pkg of d.packages) {
      pkg.downloadLocation ??= "NOASSERTION";
      pkg.copyrightText ??= "NOASSERTION";
      pkg.licenseDeclared ??= pkg.licenseConcluded ?? "NOASSERTION";
    }
    const toMap = (fs: Finding[]) => Object.fromEntries(fs.map((f) => [f.id, f.status]));
    expect(toMap(assess(d))).toEqual(toMap(baseline));
  });

  test("annotation targeting a package does not count", () => {
    const d = baseSpdx();
    d.annotations = [
      {
        annotationType: "OTHER",
        annotator: "Tool: example-tool",
        annotationDate: "2023-01-01T00:00:00Z",
        spdxElementId: "SPDXRef-Package",
        comment: "cisa:generationContext=build",
      },
    ];
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("annotation with explicit document subject passes", () => {
    const d = baseSpdx();
    d.annotations = [
      {
        annotationType: "OTHER",
        annotator: "Tool: example-tool",
        annotationDate: "2023-01-01T00:00:00Z",
        spdxElementId: "SPDXRef-DOCUMENT",
        comment: "cisa:generationContext=build",
      },
    ];
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("unanchored annotation without root is rejected", () => {
    const d = baseSpdx();
    d.relationships = d.relationships.filter((r: Doc) => r.relationshipType !== "DESCRIBES");
    d.annotations = [
      {
        annotationType: "OTHER",
        annotator: "Tool: x",
        annotationDate: "2023-01-01T00:00:00Z",
        comment: "cisa:generationContext=build",
      },
    ];
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("root via DESCRIBES relationship fallback", () => {
    const d = baseSpdx();
    d.relationships = [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Package" },
    ];
    d.annotations = [
      {
        annotationType: "OTHER",
        annotator: "Tool: x",
        annotationDate: "2023-01-01T00:00:00Z",
        spdxElementId: "SPDXRef-Package",
        comment: "cisa:generationContext=build",
      },
    ];
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("malformed referenceType as list does not crash", () => {
    const findings = assess({
      spdxVersion: "SPDX-2.3",
      packages: [
        { SPDXID: "SPDXRef-Pkg", name: "test", supplier: "Org: Test", versionInfo: "1.0", externalRefs: [{ referenceType: ["purl"] }] },
      ],
      relationships: [{ spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Pkg" }],
      creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z" },
    });
    expect(counts(findings).error).toBe(0);
    expect(findingById(findings, "cisa-2025:software-identifiers").status).toBe("fail");
  });

  test("generation context with null comment fields", () => {
    const findings = assess({
      spdxVersion: "SPDX-2.3",
      comment: null,
      creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z", comment: 42 },
      packages: [{ SPDXID: "SPDXRef-Pkg", name: "test", supplier: "Org: Test", versionInfo: "1.0", purl: "pkg:pypi/t@1" }],
      annotations: "not-a-list",
    });
    expect(counts(findings).error).toBe(0);
    expect(find(findings, "generation-context").status).toBe("fail");
  });

  test("CycloneDX generation context with malformed metadata", () => {
    const findings = assess({
      bomFormat: "CycloneDX",
      specVersion: "1.6",
      metadata: {
        lifecycles: "build",
        properties: ["not-a-dict", { name: "internal:sbom:generationContext", value: null }],
        timestamp: "2023-01-01T00:00:00Z",
        component: { "bom-ref": "root", type: "application", name: "app" },
        tools: { components: [{ name: "test-tool" }] },
      },
      components: [],
    });
    expect(counts(findings).error).toBe(0);
    expect(find(findings, "generation-context").status).toBe("fail");
  });

  test("CycloneDX tool check with malformed tools", () => {
    for (const tools of [["syft-1.0"], { components: ["syft-1.0"] }, { components: "syft-1.0" }, "syft-1.0"]) {
      const findings = assess({
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        metadata: {
          timestamp: "2023-01-01T00:00:00Z",
          component: { "bom-ref": "root", type: "application", name: "app" },
          tools,
        },
        components: [],
      });
      expect(counts(findings).error).toBe(0);
      expect(findingById(findings, "cisa-2025:tool-name").status).toBe("fail");
    }
  });

  test("CycloneDX tool check still reads a well-formed tool", () => {
    for (const tools of [[{ name: "syft", version: "1.0" }], { components: [{ name: "syft" }] }]) {
      const findings = assess({
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        metadata: {
          timestamp: "2023-01-01T00:00:00Z",
          component: { "bom-ref": "root", type: "application", name: "app" },
          tools,
        },
        components: [],
      });
      expect(findingById(findings, "cisa-2025:tool-name").status).toBe("pass");
    }
  });

  test("malformed relationshipType as list", () => {
    const findings = assess({
      spdxVersion: "SPDX-2.3",
      packages: [{ SPDXID: "SPDXRef-Pkg", name: "test", supplier: "Org: T", versionInfo: "1.0", purl: "pkg:pypi/t@1" }],
      relationships: [{ spdxElementId: "SPDXRef-DOCUMENT", relationshipType: ["DEPENDS_ON"], relatedSpdxElement: "SPDXRef-Pkg" }],
      creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z" },
    });
    expect(counts(findings).error).toBe(0);
    expect(find(findings, "dependency").status).toBe("fail");
  });
});

describe("error handling", () => {
  test("unknown format", () => {
    const findings = assess({ some: "data", without: "format indicators" });
    expect(counts(findings).error).toBe(1);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.id).toBe("cisa-2025:error");
    expect(findings[0]!.description.toLowerCase()).toContain("format");
  });

  test("empty components", () => {
    const findings = assess({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: [],
      dependencies: [],
      metadata: {
        authors: [{ name: "Example Developer" }],
        tools: [{ name: "sbom-generator" }],
        timestamp: "2023-01-01T00:00:00Z",
        properties: [{ name: "cdx:sbom:generationContext", value: "build" }],
      },
    });
    expect(find(findings, "dependency").status).toBe("fail");
    for (const id of PER_COMPONENT_IDS) expect(findingById(findings, id).status).toBe("pass");
  });

  test("hostile input never throws", () => {
    const hostile: unknown[] = [
      null,
      42,
      "string",
      [],
      { bomFormat: "CycloneDX", components: "x", dependencies: 5, metadata: [] },
      { bomFormat: "CycloneDX", components: [null, 1, "a", { name: null, type: ["file"], supplier: "x" }], metadata: { timestamp: 123, authors: "a", lifecycles: [null, { phase: 7 }] } },
      { spdxVersion: 3, packages: { a: 1 }, relationships: "x", creationInfo: { created: ["x"], creators: "Tool: x", comment: ["build"] } },
      { spdxVersion: "SPDX-2.3", packages: [{ SPDXID: ["x"], name: 5, externalRefs: "purl" }], annotations: [null, { annotationType: "OTHER", spdxElementId: 5, comment: "cisa:generationContext=build" }], documentDescribes: [null] },
      { "@graph": 5, elements: "x" },
      { "@context": { a: ["https://spdx.org/rdf/3.0.1/x"] }, "@graph": [null, { type: 5 }, { type: "software_Package", name: ["x"], originatedBy: [[1]], externalIdentifier: [{ externalIdentifierType: ["purl"] }], verifiedUsing: "x" }, { type: "Relationship", relationshipType: "hasConcludedLicense", from: null, to: { a: 1 } }, { type: "Annotation", subject: ["x"], statement: 5 }, { type: "CreationInfo", createdBy: "SpdxOrganization", createdUsing: { name: 5 }, created: {} }] },
    ];
    for (const data of hostile) {
      expect(() => cisa2025.assess(sbom(data))).not.toThrow();
    }
    // A raw DetectedSbom whose data is not an object must also not throw.
    expect(() => cisa2025.assess({ format: "spdx", specVersion: null, schemaVersion: null, data: null as never })).not.toThrow();
  });

  test("hostile timestamp types fail instead of crashing", () => {
    for (const ts of [123, ["2023-01-01"], { a: 1 }, true]) {
      const d = baseCyclonedx();
      d.metadata.timestamp = ts;
      const f = findingById(assess(d), "cisa-2025:timestamp");
      expect(f.status).toBe("fail");
      expect(f.description).toContain("Invalid ISO-8601 format");
    }
  });
});

describe("finding details", () => {
  test("failed findings have remediation", () => {
    const findings = assess({ bomFormat: "CycloneDX", specVersion: "1.5", components: [{ name: "example" }], metadata: {} });
    expect(findings.some((f) => f.status === "fail")).toBe(true);
    for (const f of findings) {
      if (f.status === "fail") expect(f.remediation).toBeDefined();
      else expect(f.remediation).toBeUndefined();
    }
  });

  test("result includes standard info", () => {
    // Python asserts on result.metadata standard_*; here they live on the framework.
    expect(cisa2025.name).toContain("CISA 2025 Minimum Elements");
    expect(cisa2025.version).toBe("2025-08-draft");
    expect(cisa2025.url).toContain("2025_CISA_SBOM_Minimum_Elements.pdf");
  });
});

describe("multiple component failures", () => {
  const meta = {
    authors: [{ name: "Author" }],
    tools: [{ name: "tool" }],
    timestamp: "2023-01-01T00:00:00Z",
    properties: [{ name: "cdx:sbom:generationContext", value: "build" }],
  };

  test("multiple components missing fields", () => {
    const findings = assess({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: [{ name: "comp1" }, { name: "comp2", version: "1.0" }, { name: "comp3", version: "1.0", publisher: "Pub" }],
      dependencies: [{ ref: "comp1", dependsOn: [] }],
      metadata: meta,
    });
    const producer = find(findings, "software-producer");
    expect(producer.status).toBe("fail");
    expect(producer.affected).toContain("comp1");
    expect(producer.affected).toContain("comp2");
    expect(producer.affected).not.toContain("comp3");
    expect(producer.affectedCount).toBe(2);
    expect(producer.description).toContain("Missing for 2 components.");

    const version = find(findings, "component-version");
    expect(version.status).toBe("fail");
    expect(version.affected).toEqual(["comp1"]);
    expect(version.description).toContain("Missing for 1 component.");
  });

  test("failure lists all components (up to the cap)", () => {
    const findings = assess({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: Array.from({ length: 10 }, (_, i) => ({ name: `comp${i}` })),
      dependencies: [{ ref: "comp0", dependsOn: [] }],
      metadata: meta,
    });
    const producer = find(findings, "software-producer");
    for (let i = 0; i < 10; i++) expect(producer.affected).toContain(`comp${i}`);
    expect(producer.affectedCount).toBe(10);
  });

  test("affected list is capped at 25 with the full count", () => {
    const findings = assess({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: Array.from({ length: 40 }, (_, i) => ({ name: `comp${i}` })),
      metadata: meta,
    });
    const producer = find(findings, "software-producer");
    expect(producer.affected).toHaveLength(25);
    expect(producer.affectedCount).toBe(40);
    expect(producer.description).toContain("Missing for 40 components.");
  });
});

describe("format detection", () => {
  // Python asserts result.metadata.sbom_format; here the format is detected
  // up front, so the check is that detection lands on the right branch.
  test("CycloneDX with bomFormat", () => {
    const data = { bomFormat: "CycloneDX", specVersion: "1.5", components: [], metadata: { timestamp: "2023-01-01T00:00:00Z" } };
    expect(sbom(data).format).toBe("cyclonedx");
    expect(assess(data)).toHaveLength(11);
  });

  test("CycloneDX without bomFormat", () => {
    const data = { specVersion: "1.5", components: [], metadata: { timestamp: "2023-01-01T00:00:00Z" } };
    expect(sbom(data).format).toBe("cyclonedx");
    expect(assess(data)).toHaveLength(11);
  });

  test("SPDX format", () => {
    const data = { spdxVersion: "SPDX-2.3", packages: [], creationInfo: { created: "2023-01-01T00:00:00Z" } };
    expect(sbom(data).format).toBe("spdx");
    expect(findingById(assess(data), "cisa-2025:timestamp").status).toBe("pass");
  });
});

describe("SPDX 3 validation", () => {
  test("compliant SPDX 3 SBOM", () => {
    const c = counts(assess(baseSpdx3()));
    expect(c.fail).toBe(0);
    expect(c.pass).toBe(11);
    expect(c.total).toBe(11);
  });

  test("format detection", () => {
    expect(sbom(baseSpdx3()).format).toBe("spdx3");
  });

  test("missing software producer", () => {
    const d = baseSpdx3();
    delete d["@graph"][4].originatedBy;
    expect(statusOf(d, "software-producer")).toBe("fail");
  });

  test("missing component hash", () => {
    const d = baseSpdx3();
    delete d["@graph"][4].verifiedUsing;
    expect(statusOf(d, "component-hash")).toBe("fail");
  });

  test("missing license", () => {
    const d = baseSpdx3();
    d["@graph"] = d["@graph"].filter((e: Doc) => e.relationshipType !== "hasConcludedLicense");
    expect(findingById(assess(d), "cisa-2025:license").status).toBe("fail");
  });

  test("missing tool name", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].createdUsing;
    expect(statusOf(d, "tool-name")).toBe("fail");
  });

  test("missing generation context", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("generation context via annotation", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    d["@graph"].push({ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: ["SPDXRef-Package-1"] });
    d["@graph"].push({
      type: "Annotation",
      spdxId: "SPDXRef-Annotation-1",
      subject: "SPDXRef-Document",
      statement: "cisa:generationContext=build",
    });
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("anchored annotation without rootElement still accepted", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    d["@graph"].push({ type: "SpdxDocument", spdxId: "SPDXRef-Document" });
    d["@graph"].push({
      type: "Annotation",
      spdxId: "SPDXRef-Annotation-AnchoredNoRoot",
      subject: "SPDXRef-Document",
      statement: "cisa:generationContext=build",
    });
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("generation context via SpdxDocument comment", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    d["@graph"].push({ type: "SpdxDocument", spdxId: "SPDXRef-Document", comment: "Generated during build phase" });
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("annotation targeting a package does not count", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    d["@graph"].push({
      type: "Annotation",
      spdxId: "SPDXRef-Annotation-Pkg",
      subject: "SPDXRef-Package-1",
      statement: "cisa:generationContext=build",
    });
    expect(statusOf(d, "generation-context")).toBe("fail");
  });

  test("annotation subject is rootElement passes", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].comment;
    d["@graph"].push({ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: ["SPDXRef-Package-1"] });
    d["@graph"].push({
      type: "Annotation",
      spdxId: "SPDXRef-Annotation-Root",
      subject: "SPDXRef-Package-1",
      statement: "cisa:generationContext=build",
    });
    expect(statusOf(d, "generation-context")).toBe("pass");
  });

  test("missing timestamp", () => {
    const d = baseSpdx3();
    delete d["@graph"][0].created;
    const f = find(assess(d), "timestamp");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Missing timestamp");
  });

  test("missing SBOM author", () => {
    const d = baseSpdx3();
    d["@graph"][0].createdBy = [];
    expect(statusOf(d, "sbom-author")).toBe("fail");
  });
});

describe("statesGenerationContext (Python _states_generation_context)", () => {
  test("phrases match only as whole words", () => {
    expect(statesGenerationContext("SBOM generated during build phase")).toBe(true);
    expect(statesGenerationContext("Generated in pre-build phase")).toBe(true);
    expect(statesGenerationContext("BUILD")).toBe(true);
    for (const text of ["rebuild", "debuild", "resource", "cooperations", "builder", "ébuild", "build_x"]) {
      expect(statesGenerationContext(text)).toBe(false);
    }
  });

  test("every accepted value is recognised in a sentence", () => {
    for (const value of GENERATION_CONTEXT_VALUES) {
      expect(statesGenerationContext(`made at ${value}.`)).toBe(true);
    }
  });
});
