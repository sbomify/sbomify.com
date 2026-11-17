/**
 * Port of sbomify `sbomify/apps/plugins/tests/test_bsi_plugin.py`, plus the
 * BSI cases from test_spdx3_field_fixes, test_spdx3_helpers,
 * test_spdx3_honest_edges, test_spdx3_agent_positions,
 * test_spdx3_license_resolution, test_spdx2_identifier_iri and
 * test_spdx3_corpus.
 */

import { describe, expect, test } from "bun:test";
import {
  bsiTr03183,
  checkAttestationRequirement,
  checkFormatVersion,
  detectFormatAndVersion,
  spdx3ComponentCreator,
  spdx3HasSourceCodeUri,
  spdx3SbomCreator,
  STANDARD_NAME,
  STANDARD_URL,
  STANDARD_VERSION,
  validateSpdx,
  validateSpdx3,
  versionGte,
} from "../src/frameworks/bsi-tr03183";
import type { Spdx3ElementMap } from "../src/frameworks/spdx3-helpers";
import type { Finding, JsonObject } from "../src/types";
import { runFramework } from "../src/types";
import { counts, sbom } from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any;

function createBaseCyclonedxSbom(): Doc {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    components: [
      {
        "bom-ref": "pkg:pypi/example-component@1.0.0",
        name: "example-component",
        version: "1.0.0",
        manufacturer: {
          name: "Example Corp",
          url: "https://example.com",
          contact: [{ email: "maintainer@example.com" }],
        },
        purl: "pkg:pypi/example-component@1.0.0",
        licenses: [{ expression: "MIT", acknowledgement: "concluded" }],
        hashes: [{ alg: "SHA-512", content: "a".repeat(128) }],
        properties: [
          { name: "bsi:component:filename", value: "example-component.whl" },
          { name: "bsi:component:executable", value: "non-executable" },
          { name: "bsi:component:archive", value: "archive" },
          { name: "bsi:component:structured", value: "structured" },
        ],
      },
    ],
    dependencies: [{ ref: "pkg:pypi/example-component@1.0.0", dependsOn: [] }],
    compositions: [{ aggregate: "complete", assemblies: ["pkg:pypi/example-component@1.0.0"] }],
    metadata: {
      timestamp: "2024-01-15T12:00:00Z",
      manufacturer: {
        name: "SBOM Creator Corp",
        url: "https://sbom-creator.example.com",
        contact: [{ email: "sbom@example.com" }],
      },
    },
  };
}

function createBaseSpdx3Sbom(): Doc {
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
        creationInfo: "_:creationInfo",
        name: "SBOM Creator Corp",
        externalIdentifier: [{ externalIdentifierType: "email", identifier: "sbom@example.com" }],
      },
      {
        type: "Organization",
        spdxId: "SPDXRef-Maintainer",
        creationInfo: "_:creationInfo",
        name: "Example Corp",
        externalIdentifier: [{ externalIdentifierType: "email", identifier: "maintainer@example.com" }],
      },
      {
        type: "software_Package",
        spdxId: "SPDXRef-Package-1",
        creationInfo: "_:creationInfo",
        name: "example-package",
        software_packageVersion: "1.0.0",
        originatedBy: ["SPDXRef-Maintainer"],
        externalIdentifier: [{ externalIdentifierType: "packageUrl", identifier: "pkg:pypi/example@1.0.0" }],
      },
      {
        type: "software_File",
        spdxId: "SPDXRef-File-1",
        creationInfo: "_:creationInfo",
        name: "example-package.whl",
        verifiedUsing: [{ type: "Hash", algorithm: "sha512", hashValue: "a".repeat(128) }],
        software_additionalPurpose: ["archive", "container"],
        comment: "software_additionalPurpose field is used to indicate the properties of BSI TR-03183-2",
      },
      {
        type: "Relationship",
        spdxId: "SPDXRef-Rel-1",
        creationInfo: "_:creationInfo",
        from: "SPDXRef-Package-1",
        relationshipType: "hasDistributionArtifact",
        to: ["SPDXRef-File-1"],
      },
      {
        type: "Relationship",
        spdxId: "SPDXRef-Rel-2",
        creationInfo: "_:creationInfo",
        from: "SPDXRef-Package-1",
        relationshipType: "dependsOn",
        to: [],
        completeness: "complete",
      },
      {
        type: "Relationship",
        spdxId: "SPDXRef-Rel-3",
        creationInfo: "_:creationInfo",
        from: "SPDXRef-Package-1",
        relationshipType: "hasConcludedLicense",
        to: ["SPDXRef-License-1"],
      },
      {
        type: "simpleLicensing_LicenseExpression",
        spdxId: "SPDXRef-License-1",
        creationInfo: "_:creationInfo",
        simpleLicensing_licenseExpression: "MIT",
      },
      {
        type: "SpdxDocument",
        spdxId: "SPDXRef-Document",
        creationInfo: "_:creationInfo",
        name: "BSI Test SBOM",
        dataLicense: "CC0-1.0",
        profileConformance: ["core", "software", "simpleLicensing"],
        element: [
          "SPDXRef-Creator",
          "SPDXRef-Maintainer",
          "SPDXRef-Package-1",
          "SPDXRef-File-1",
          "SPDXRef-Rel-1",
          "SPDXRef-Rel-2",
          "SPDXRef-Rel-3",
          "SPDXRef-License-1",
        ],
        rootElement: ["SPDXRef-Package-1"],
      },
    ],
  };
}

function createBaseSpdx2Sbom(): Doc {
  return {
    spdxVersion: "SPDX-2.3",
    packages: [
      {
        SPDXID: "SPDXRef-Package",
        name: "example-package",
        supplier: "Organization: Example Corp (maintainer@example.com)",
        versionInfo: "1.0.0",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:pypi/example-package@1.0.0",
          },
        ],
      },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Package" },
    ],
    creationInfo: {
      creators: ["Tool: example-tool", "Organization: Example Corp (security@example.com)"],
      created: "2024-01-15T00:00:00Z",
    },
  };
}

function assess(data: unknown): Finding[] {
  return bsiTr03183.assess(sbom(data));
}

function get(findings: Finding[], id: string): Finding {
  const f = findings.find((x) => x.id === id);
  if (!f) throw new Error(`no finding ${id}; got ${findings.map((x) => x.id).join(", ")}`);
  return f;
}

function status(data: unknown, id: string): string {
  return get(assess(data), id).status;
}

function graphPackages(doc: Doc): Doc[] {
  return doc["@graph"].filter((e: Doc) => e.type === "software_Package");
}

function setBsiProperty(doc: Doc, name: string, value: string): void {
  for (const prop of doc.components[0].properties) if (prop.name === `bsi:component:${name}`) prop.value = value;
}

describe("plugin metadata", () => {
  test("framework metadata keeps the plugin's identity", () => {
    expect(bsiTr03183.id).toBe("bsi-tr03183-2");
    expect(bsiTr03183.version).toBe("2.1.0");
    expect(bsiTr03183.shortName).toBe("CRA (BSI TR-03183-2)");
    expect(bsiTr03183.guideUrl).toBe("https://sbomify.com/compliance/bsi-tr-03183/");
  });

  test("plugin constants", () => {
    expect(STANDARD_NAME).toBe("BSI TR-03183-2: Cyber Resilience Requirements - Part 2: SBOM");
    expect(STANDARD_VERSION).toBe("2.1.0");
    expect(STANDARD_URL).toContain("bsi.bund.de");
    expect(bsiTr03183.url).toBe(STANDARD_URL);
  });
});

describe("format version", () => {
  for (const [v, expected] of [
    ["1.6", "pass"],
    ["1.7", "pass"],
    ["1.4", "fail"],
  ] as const) {
    test(`CycloneDX ${v} → ${expected}`, () => {
      const doc = createBaseCyclonedxSbom();
      doc.specVersion = v;
      expect(status(doc, "bsi-tr03183:sbom-format")).toBe(expected);
    });
  }

  test("CycloneDX 1.5 fails and names the floor", () => {
    const doc = createBaseCyclonedxSbom();
    doc.specVersion = "1.5";
    const f = get(assess(doc), "bsi-tr03183:sbom-format");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("1.6");
  });

  test("SPDX 3.0.1 passes", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:sbom-format")).toBe("pass");
  });

  test("SPDX 2.3 fails and names 3.0.1", () => {
    const f = get(assess(createBaseSpdx2Sbom()), "bsi-tr03183:sbom-format");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("3.0.1");
  });
});

describe("SBOM-level fields", () => {
  test("creator with email passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:sbom-creator")).toBe("pass");
  });

  test("creator with URL passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.metadata.manufacturer = { name: "Example Corp", url: "https://example.com" };
    expect(status(doc, "bsi-tr03183:sbom-creator")).toBe("pass");
  });

  test("creator missing fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.metadata.manufacturer = { name: "Example Corp" };
    expect(status(doc, "bsi-tr03183:sbom-creator")).toBe("fail");
  });

  test("creator from authors email passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.metadata.manufacturer = { name: "No Contact" };
    doc.metadata.authors = [{ name: "Dev", email: "dev@example.com" }];
    expect(status(doc, "bsi-tr03183:sbom-creator")).toBe("pass");
  });

  test("creator from supplier URL passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.metadata.manufacturer = { name: "No Contact" };
    doc.metadata.supplier = { name: "Supplier Corp", url: ["https://supplier.example.com"] };
    expect(status(doc, "bsi-tr03183:sbom-creator")).toBe("pass");
  });

  test("no email or URL anywhere fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.metadata.manufacturer = { name: "No Contact" };
    doc.metadata.supplier = { name: "No URL" };
    doc.metadata.authors = [{ name: "No Email" }];
    expect(status(doc, "bsi-tr03183:sbom-creator")).toBe("fail");
  });

  test("valid timestamp passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:timestamp")).toBe("pass");
  });

  test("missing timestamp fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.metadata.timestamp;
    const f = get(assess(doc), "bsi-tr03183:timestamp");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("Missing timestamp");
  });
});

describe("component-level fields", () => {
  test("name present passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:component-name")).toBe("pass");
  });

  test("name missing fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].name;
    const f = get(assess(doc), "bsi-tr03183:component-name");
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["Component at index 0"]);
  });

  test("version present passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:component-version")).toBe("pass");
  });

  test("version missing fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].version;
    expect(status(doc, "bsi-tr03183:component-version")).toBe("fail");
  });

  test("creator with email passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:component-creator")).toBe("pass");
  });

  test("creator with URL array passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].manufacturer = { name: "Example Corp", url: ["https://example.com"] };
    expect(status(doc, "bsi-tr03183:component-creator")).toBe("pass");
  });

  test("creator with bare URL string passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].manufacturer = { name: "Example Corp", url: "https://example.com" };
    expect(status(doc, "bsi-tr03183:component-creator")).toBe("pass");
  });

  test("invalid URL array entries are skipped", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].manufacturer = { name: "Example Corp", url: [null, "not a url", "https://example.com"] };
    expect(status(doc, "bsi-tr03183:component-creator")).toBe("pass");
  });

  test("URL array without a valid entry fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].manufacturer = { name: "Example Corp", url: ["not a url"] };
    expect(status(doc, "bsi-tr03183:component-creator")).toBe("fail");
  });

  test("creator missing fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].manufacturer = { name: "Example Corp" };
    const f = get(assess(doc), "bsi-tr03183:component-creator");
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["example-component"]);
    expect(f.affectedCount).toBe(1);
  });
});

describe("BSI properties", () => {
  test("filename present passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:filename")).toBe("pass");
  });

  test("filename missing fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].properties = doc.components[0].properties.filter(
      (p: Doc) => p.name !== "bsi:component:filename",
    );
    expect(status(doc, "bsi-tr03183:filename")).toBe("fail");
  });

  test("executable 'executable' passes", () => {
    const doc = createBaseCyclonedxSbom();
    setBsiProperty(doc, "executable", "executable");
    expect(status(doc, "bsi-tr03183:executable-property")).toBe("pass");
  });

  test("executable 'non-executable' passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:executable-property")).toBe("pass");
  });

  test("invalid executable value fails", () => {
    const doc = createBaseCyclonedxSbom();
    setBsiProperty(doc, "executable", "invalid");
    expect(status(doc, "bsi-tr03183:executable-property")).toBe("fail");
  });

  test("archive 'archive' passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:archive-property")).toBe("pass");
  });

  test("archive 'no archive' passes", () => {
    const doc = createBaseCyclonedxSbom();
    setBsiProperty(doc, "archive", "no archive");
    expect(status(doc, "bsi-tr03183:archive-property")).toBe("pass");
  });

  test("structured 'structured' passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:structured-property")).toBe("pass");
  });

  test("structured 'unstructured' passes", () => {
    const doc = createBaseCyclonedxSbom();
    setBsiProperty(doc, "structured", "unstructured");
    expect(status(doc, "bsi-tr03183:structured-property")).toBe("pass");
  });
});

describe("distribution licences", () => {
  test("SPDX expression passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:distribution-licences")).toBe("pass");
  });

  test("SPDX id passes", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].licenses = [{ license: { id: "MIT", acknowledgement: "concluded" } }];
    expect(status(doc, "bsi-tr03183:distribution-licences")).toBe("pass");
  });

  test("missing licence fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].licenses;
    expect(status(doc, "bsi-tr03183:distribution-licences")).toBe("fail");
  });
});

describe("hash value", () => {
  test("SHA-512 passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:hash-value")).toBe("pass");
  });

  test("SHA-512 in externalReferences passes", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].hashes;
    doc.components[0].externalReferences = [
      {
        type: "distribution",
        url: "https://example.com/package.whl",
        hashes: [{ alg: "SHA-512", content: "a".repeat(128) }],
      },
    ];
    expect(status(doc, "bsi-tr03183:hash-value")).toBe("pass");
  });

  test("SHA-256 alone fails (Table 3)", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].hashes = [{ alg: "SHA-256", content: "abc123".repeat(10) }];
    const f = get(assess(doc), "bsi-tr03183:hash-value");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("SHA-512");
    expect(f.affected).toEqual(["example-component"]);
  });

  test("missing hash fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].hashes;
    expect(status(doc, "bsi-tr03183:hash-value")).toBe("fail");
  });
});

describe("dependencies", () => {
  test("with completeness passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:dependencies")).toBe("pass");
  });

  for (const aggregate of ["incomplete", "unknown"]) {
    test(`aggregate ${aggregate} passes`, () => {
      const doc = createBaseCyclonedxSbom();
      doc.compositions = [{ aggregate, assemblies: [doc.components[0]["bom-ref"]] }];
      expect(status(doc, "bsi-tr03183:dependencies")).toBe("pass");
    });
  }

  test("without completeness fails", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.compositions;
    const f = get(assess(doc), "bsi-tr03183:dependencies");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("missing completeness indicator");
  });

  test("no dependencies fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.dependencies = [];
    delete doc.compositions;
    const f = get(assess(doc), "bsi-tr03183:dependencies");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("No valid dependency relationships found");
  });
});

describe("unique identifiers", () => {
  test("purl passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:unique-identifiers")).toBe("pass");
  });

  test("CPE passes", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].purl;
    doc.components[0].cpe = "cpe:2.3:a:example:component:1.0.0:*:*:*:*:*:*:*";
    expect(status(doc, "bsi-tr03183:unique-identifiers")).toBe("pass");
  });

  test("no identifier warns", () => {
    const doc = createBaseCyclonedxSbom();
    delete doc.components[0].purl;
    expect(status(doc, "bsi-tr03183:unique-identifiers")).toBe("warning");
  });
});

describe("additional data fields (§5.2.3 / §5.2.4)", () => {
  test("CycloneDX SBOM-URI passes with a urn:uuid serialNumber", () => {
    const doc = createBaseCyclonedxSbom();
    doc.serialNumber = "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79";
    expect(status(doc, "bsi-tr03183:sbom-uri")).toBe("pass");
  });

  test("CycloneDX SBOM-URI warns without serialNumber", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:sbom-uri")).toBe("warning");
  });

  test("CycloneDX SBOM-URI warns on a non-URN serialNumber", () => {
    const doc = createBaseCyclonedxSbom();
    doc.serialNumber = "not-a-urn-uuid";
    expect(status(doc, "bsi-tr03183:sbom-uri")).toBe("warning");
  });

  test("CycloneDX source-code URI passes via vcs ref", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].externalReferences = [{ type: "vcs", url: "https://github.com/example/example-component" }];
    expect(status(doc, "bsi-tr03183:source-code-uri")).toBe("pass");
  });

  test("CycloneDX source-code URI warns without ref", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:source-code-uri")).toBe("warning");
  });

  test("CycloneDX deployable URI passes via distribution ref", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].externalReferences = [
      { type: "distribution", url: "https://example.com/example-component.whl" },
    ];
    expect(status(doc, "bsi-tr03183:uri-deployable-form")).toBe("pass");
  });

  test("CycloneDX deployable URI warns without distribution ref", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:uri-deployable-form")).toBe("warning");
  });

  test("CycloneDX original licences pass via declared acknowledgement", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].licenses = [{ expression: "MIT", acknowledgement: "declared" }];
    expect(status(doc, "bsi-tr03183:original-licences")).toBe("pass");
  });

  test("CycloneDX original licences are not supplied by effectiveLicence property", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].properties.push({ name: "bsi:component:effectiveLicence", value: "MIT" });
    expect(status(doc, "bsi-tr03183:original-licences")).toBe("warning");
  });

  test("CycloneDX original licences warn when only concluded", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:original-licences")).toBe("warning");
  });

  test("CycloneDX original licences pass via associatedLicences property", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components[0].properties.push({ name: "bsi:component:associatedLicences", value: "MIT" });
    expect(status(doc, "bsi-tr03183:original-licences")).toBe("pass");
  });

  test("SPDX 3 SBOM-URI passes when SpdxDocument has an id", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:sbom-uri")).toBe("pass");
  });

  test("SPDX 3 SBOM-URI warns without an SpdxDocument", () => {
    const doc = createBaseSpdx3Sbom();
    doc["@graph"] = doc["@graph"].filter((e: Doc) => e.type !== "SpdxDocument");
    expect(status(doc, "bsi-tr03183:sbom-uri")).toBe("warning");
  });

  test("SPDX 3 source-code URI passes via software_sourceInfo", () => {
    const doc = createBaseSpdx3Sbom();
    for (const p of graphPackages(doc)) p.software_sourceInfo = "https://example.com/source";
    expect(status(doc, "bsi-tr03183:source-code-uri")).toBe("pass");
  });

  test("SPDX 3 source-code URI passes via legacy vcs externalIdentifier", () => {
    const doc = createBaseSpdx3Sbom();
    for (const p of graphPackages(doc)) {
      (p.externalIdentifier ??= []).push({ externalIdentifierType: "vcs", identifier: "https://github.com/example/repo" });
    }
    expect(status(doc, "bsi-tr03183:source-code-uri")).toBe("pass");
  });

  test("SPDX 3 source-code URI warns when absent", () => {
    const f = get(assess(createBaseSpdx3Sbom()), "bsi-tr03183:source-code-uri");
    expect(f.status).toBe("warning");
    expect(f.affected).toEqual(["example-package"]);
  });

  test("SPDX 3 deployable URI passes via software_downloadLocation", () => {
    const doc = createBaseSpdx3Sbom();
    for (const p of graphPackages(doc)) p.software_downloadLocation = "https://example.com/pkg.whl";
    expect(status(doc, "bsi-tr03183:uri-deployable-form")).toBe("pass");
  });

  test("SPDX 3 deployable URI warns when absent", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:uri-deployable-form")).toBe("warning");
  });

  test("SPDX 3 original licences pass via hasDeclaredLicense", () => {
    const doc = createBaseSpdx3Sbom();
    doc["@graph"].push({
      type: "Relationship",
      spdxId: "SPDXRef-Rel-Declared",
      from: "SPDXRef-Package-1",
      relationshipType: "hasDeclaredLicense",
      to: ["SPDXRef-License-1"],
    });
    expect(status(doc, "bsi-tr03183:original-licences")).toBe("pass");
  });

  test("SPDX 3 original licences warn when only concluded", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:original-licences")).toBe("warning");
  });

  test("SPDX 2 SBOM-URI passes via documentNamespace", () => {
    const doc = createBaseSpdx2Sbom();
    doc.documentNamespace = "https://example.com/docs/abc-1.0";
    expect(status(doc, "bsi-tr03183:sbom-uri")).toBe("pass");
  });

  test("SPDX 2.2 is assessed the same as 2.3", () => {
    const doc23 = createBaseSpdx2Sbom();
    doc23.documentNamespace = "https://example.com/docs/same-base";
    const doc22 = createBaseSpdx2Sbom();
    doc22.spdxVersion = "SPDX-2.2";
    doc22.documentNamespace = "https://example.com/docs/same-base";
    for (const pkg of doc22.packages) {
      pkg.downloadLocation ??= "NOASSERTION";
      pkg.copyrightText ??= "NOASSERTION";
      pkg.licenseConcluded ??= "NOASSERTION";
      pkg.licenseDeclared ??= "NOASSERTION";
    }
    const statuses = (fs: Finding[]) => Object.fromEntries(fs.map((f) => [f.id, f.status]));
    expect(statuses(assess(doc22))).toEqual(statuses(assess(doc23)));
  });

  test("SPDX 2 SBOM-URI warns without documentNamespace", () => {
    expect(status(createBaseSpdx2Sbom(), "bsi-tr03183:sbom-uri")).toBe("warning");
  });

  test("SPDX 2 source-code URI passes via sourceInfo", () => {
    const doc = createBaseSpdx2Sbom();
    doc.packages[0].sourceInfo = "https://github.com/example/repo";
    expect(status(doc, "bsi-tr03183:source-code-uri")).toBe("pass");
  });

  test("SPDX 2 source-code URI passes via vcs externalRef", () => {
    const doc = createBaseSpdx2Sbom();
    doc.packages[0].externalRefs.push({
      referenceCategory: "SOURCE_CODE",
      referenceType: "vcs",
      referenceLocator: "git+https://github.com/example/repo",
    });
    expect(status(doc, "bsi-tr03183:source-code-uri")).toBe("pass");
  });

  test("SPDX 2 source-code URI warns when absent", () => {
    expect(status(createBaseSpdx2Sbom(), "bsi-tr03183:source-code-uri")).toBe("warning");
  });

  test("SPDX 2 deployable URI passes via downloadLocation", () => {
    const doc = createBaseSpdx2Sbom();
    doc.packages[0].downloadLocation = "https://pypi.org/simple/example/";
    expect(status(doc, "bsi-tr03183:uri-deployable-form")).toBe("pass");
  });

  for (const placeholder of ["NOASSERTION", "NONE"]) {
    test(`SPDX 2 deployable URI rejects ${placeholder}`, () => {
      const doc = createBaseSpdx2Sbom();
      doc.packages[0].downloadLocation = placeholder;
      expect(status(doc, "bsi-tr03183:uri-deployable-form")).toBe("warning");
    });

    test(`SPDX 2 original licences reject ${placeholder}`, () => {
      const doc = createBaseSpdx2Sbom();
      doc.packages[0].licenseDeclared = placeholder;
      expect(status(doc, "bsi-tr03183:original-licences")).toBe("warning");
    });
  }

  test("SPDX 2 original licences pass via licenseDeclared", () => {
    const doc = createBaseSpdx2Sbom();
    doc.packages[0].licenseDeclared = "MIT";
    expect(status(doc, "bsi-tr03183:original-licences")).toBe("pass");
  });
});

describe("no embedded vulnerabilities", () => {
  test("without vulnerabilities passes", () => {
    expect(status(createBaseCyclonedxSbom(), "bsi-tr03183:no-vulnerabilities")).toBe("pass");
  });

  test("with vulnerabilities fails and points at CSAF/VEX", () => {
    const doc = createBaseCyclonedxSbom();
    doc.vulnerabilities = [{ id: "CVE-2024-12345", source: { name: "NVD" }, ratings: [{ severity: "high" }] }];
    const f = get(assess(doc), "bsi-tr03183:no-vulnerabilities");
    expect(f.status).toBe("fail");
    expect(f.remediation).toMatch(/CSAF|VEX/);
  });
});

describe("attestation cross-check", () => {
  test("is present, and a warning in the browser", () => {
    const f = get(assess(createBaseCyclonedxSbom()), "bsi-tr03183:attestation-check");
    expect(f.status).toBe("warning");
  });

  test("without dependency status: warning that explains what satisfies it", () => {
    const f = checkAttestationRequirement(undefined);
    expect(f.status).toBe("warning");
    expect(f.description).toContain("cannot see a signature or attestation");
    expect(f.remediation).toContain("sbom-verification");
    expect(f.remediation!.toLowerCase()).toContain("attestation");
  });

  test("with a passing plugin passes", () => {
    const f = checkAttestationRequirement({
      requires_one_of: { satisfied: true, passing_plugins: ["sbom-verification"], failed_plugins: [] },
    });
    expect(f.status).toBe("pass");
    expect(f.description).toContain("sbom-verification");
  });

  test("with only failed plugins fails", () => {
    const f = checkAttestationRequirement({
      requires_one_of: { satisfied: false, passing_plugins: [], failed_plugins: ["sbom-verification"] },
    });
    expect(f.status).toBe("fail");
    expect(f.description).toContain("did not pass");
    expect(f.description).toContain("sbom-verification");
  });

  test("with no plugins run fails", () => {
    const f = checkAttestationRequirement({
      requires_one_of: { satisfied: false, passing_plugins: [], failed_plugins: [] },
    });
    expect(f.status).toBe("fail");
    expect(f.description).toContain("No attestation plugin has been run");
  });

  test("recommends attestation plugins", () => {
    const f = get(assess(createBaseCyclonedxSbom()), "bsi-tr03183:attestation-check");
    expect(f.remediation!.toLowerCase()).toContain("attestation");
  });

  test("multiple passing plugins are listed", () => {
    const f = checkAttestationRequirement({
      requires_one_of: {
        satisfied: true,
        passing_plugins: ["sbom-verification", "sigstore-attestation"],
        failed_plugins: [],
      },
    });
    expect(f.status).toBe("pass");
    expect(f.description).toContain("sbom-verification");
    expect(f.description).toContain("sigstore-attestation");
  });

  test("one passing plugin is enough (OR logic)", () => {
    const f = checkAttestationRequirement({
      requires_one_of: { satisfied: true, passing_plugins: ["sbom-verification"], failed_plugins: ["other-attestation"] },
    });
    expect(f.status).toBe("pass");
    expect(f.description).toContain("sbom-verification");
  });

  test("requires_all is ignored", () => {
    const f = checkAttestationRequirement({
      requires_one_of: { satisfied: true, passing_plugins: ["sbom-verification"], failed_plugins: [] },
      requires_all: { satisfied: false, passing_plugins: [], failed_plugins: ["some-other-plugin"] },
    });
    expect(f.status).toBe("pass");
  });

  test("a hostile dependency status does not throw", () => {
    expect(checkAttestationRequirement({ requires_one_of: "x" }).status).toBe("fail");
    expect(checkAttestationRequirement({ requires_one_of: { satisfied: true, passing_plugins: 7 } }).status).toBe("pass");
  });
});

describe("SPDX 3", () => {
  test("a compliant document passes the required SBOM-level checks", () => {
    const findings = assess(createBaseSpdx3Sbom());
    for (const id of ["bsi-tr03183:sbom-format", "bsi-tr03183:sbom-creator", "bsi-tr03183:timestamp"]) {
      expect(get(findings, id).status).toBe("pass");
    }
  });

  test("package name is validated", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:component-name")).toBe("pass");
  });

  test("package version is validated", () => {
    expect(status(createBaseSpdx3Sbom(), "bsi-tr03183:component-version")).toBe("pass");
  });

  test("the compliant document passes every file-derived check", () => {
    const findings = assess(createBaseSpdx3Sbom());
    for (const id of [
      "bsi-tr03183:component-creator",
      "bsi-tr03183:filename",
      "bsi-tr03183:distribution-licences",
      "bsi-tr03183:hash-value",
      "bsi-tr03183:archive-property",
      "bsi-tr03183:structured-property",
      "bsi-tr03183:dependencies",
      "bsi-tr03183:unique-identifiers",
    ]) {
      expect(get(findings, id).status).toBe("pass");
    }
    // With the BSI comment, absence of executable explicitly means non-executable.
    expect(get(findings, "bsi-tr03183:executable-property").status).toBe("pass");
  });
});

describe("SPDX 2 legacy", () => {
  test("fails the format check", () => {
    expect(status(createBaseSpdx2Sbom(), "bsi-tr03183:sbom-format")).toBe("fail");
  });

  test("still validates basic fields", () => {
    const findings = assess(createBaseSpdx2Sbom());
    expect(get(findings, "bsi-tr03183:sbom-creator").status).toBe("pass");
    expect(get(findings, "bsi-tr03183:timestamp").status).toBe("pass");
  });

  test("BSI-specific fields fail", () => {
    const findings = assess(createBaseSpdx2Sbom());
    for (const id of [
      "bsi-tr03183:filename",
      "bsi-tr03183:executable-property",
      "bsi-tr03183:archive-property",
      "bsi-tr03183:structured-property",
    ]) {
      const f = get(findings, id);
      expect(f.status).toBe("fail");
      expect(f.description.includes("SPDX 2.x") || f.remediation!.includes("3.0.1")).toBe(true);
    }
    expect(get(findings, "bsi-tr03183:executable-property").remediation).toBe(
      "Upgrade to SPDX 3.0.1+ to properly represent executable property.",
    );
  });
});

describe("error handling", () => {
  test("unknown format returns one error finding", () => {
    const findings = assess({ unknown: "format", no: "version" });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.status).toBe("error");
    expect(findings[0]!.id).toBe("bsi-tr03183:error");
    expect(counts(findings).error).toBe(1);
  });

  test("non-object data returns an error, never throws", () => {
    for (const data of [null, 42, "text", [1, 2]]) {
      const findings = bsiTr03183.assess({ format: "unknown", specVersion: null, schemaVersion: null, data: data as never });
      expect(findings[0]!.status).toBe("error");
    }
  });
});

describe("summary", () => {
  test("counts add up", () => {
    const result = runFramework(bsiTr03183, sbom(createBaseCyclonedxSbom()));
    const { pass, fail, warning, error } = result.summary;
    expect(pass + fail + warning + error).toBe(result.findings.length);
  });

  test("a fully compliant SBOM has mostly passes", () => {
    const c = counts(assess(createBaseCyclonedxSbom()));
    expect(c.pass).toBeGreaterThan(c.fail);
    expect(c.error).toBe(0);
  });

  test("framework result carries the standard", () => {
    const result = runFramework(bsiTr03183, sbom(createBaseCyclonedxSbom()));
    expect(result.version).toBe(STANDARD_VERSION);
    expect(result.url).toBe(STANDARD_URL);
    expect(get(result.findings, "bsi-tr03183:sbom-format").description).toContain("CycloneDX 1.6 meets");
  });
});

describe("multiple components", () => {
  test("all valid", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push({
      name: "second-component",
      version: "2.0.0",
      manufacturer: { name: "Example Corp", url: "https://example.com" },
      purl: "pkg:pypi/second-component@2.0.0",
      licenses: [{ expression: "Apache-2.0" }],
      hashes: [{ alg: "SHA-512", content: "def456".repeat(20) }],
      properties: [
        { name: "bsi:component:filename", value: "second-component.whl" },
        { name: "bsi:component:executable", value: "executable" },
        { name: "bsi:component:archive", value: "archive" },
        { name: "bsi:component:structured", value: "structured" },
      ],
    });
    const findings = assess(doc);
    for (const id of ["bsi-tr03183:component-name", "bsi-tr03183:component-version", "bsi-tr03183:component-creator"]) {
      expect(get(findings, id).status).toBe("pass");
    }
  });

  test("one invalid component fails", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push({ name: "invalid-component" });
    const findings = assess(doc);
    expect(get(findings, "bsi-tr03183:component-version").status).toBe("fail");
    expect(get(findings, "bsi-tr03183:component-creator").status).toBe("fail");
  });
});

describe("malformed input", () => {
  const base = (extra: Doc): Doc => ({
    spdxVersion: "SPDX-2.3",
    packages: [{ SPDXID: "SPDXRef-Pkg", name: "test", supplier: "Org: T", versionInfo: "1.0", ...extra }],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Pkg" },
    ],
    creationInfo: { creators: ["Tool: test"], created: "2023-01-01T00:00:00Z" },
  });

  test("SPDX 2 relationshipType as a list does not crash", () => {
    const doc = base({});
    doc.relationships[0].relationshipType = ["DEPENDS_ON"];
    expect(counts(assess(doc)).error).toBe(0);
  });

  test("SPDX 2 referenceType as a list does not crash", () => {
    expect(counts(assess(base({ externalRefs: [{ referenceType: ["purl"] }] }))).error).toBe(0);
  });

  test("hostile CycloneDX shapes never throw", () => {
    const hostile: Doc[] = [
      { bomFormat: "CycloneDX", specVersion: null, components: null, metadata: "x" },
      { bomFormat: "CycloneDX", specVersion: 1.6, components: [1, "x", null], dependencies: {}, compositions: "x" },
      {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        metadata: { manufacturer: "x", supplier: [1], authors: "x", timestamp: 123 },
        components: [
          {
            name: null,
            type: null,
            manufacturer: { url: 5, contact: "x" },
            hashes: null,
            externalReferences: [1, { type: "distribution", hashes: [{ alg: null }, "x"] }],
            properties: { a: 1 },
            licenses: [null, { license: "MIT" }],
          },
        ],
        vulnerabilities: null,
        extensions: null,
      },
    ];
    for (const doc of hostile) {
      const findings = assess(doc);
      expect(counts(findings).error).toBe(0);
      expect(findings.length).toBeGreaterThan(10);
    }
  });

  test("hostile SPDX 3 shapes never throw", () => {
    const hostile: Doc[] = [
      { "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": null },
      { "@graph": [42, "x", null, { type: null }, { type: "CreationInfo", specVersion: 3 }] },
      { spdxVersion: "SPDX-3.0", spdxDocument: "x", elements: { a: 1 } },
      { spdxVersion: 7 },
      {
        "@graph": [
          { type: "CreationInfo", specVersion: "3.0.1", created: 5, createdBy: 9 },
          { type: "software_Package", spdxId: "p", name: ["x"], originatedBy: [{ externalIdentifier: "x" }] },
          { type: "software_File", spdxId: "f", verifiedUsing: null, software_additionalPurpose: null },
          { type: "Relationship", from: "p", relationshipType: "hasDistributionArtifact", to: [{ a: 1 }, "f"] },
          { type: "Relationship", from: "p", relationshipType: "hasDistributionArtifact", to: 5 },
          { type: "security_Vulnerability" },
        ],
      },
    ];
    for (const doc of hostile) {
      const findings = assess(doc);
      expect(findings.length).toBeGreaterThan(0);
      if (findings.length > 1) expect(counts(findings).error).toBe(0);
    }
  });

  test("an SPDX 3 vulnerability element fails the vulnerability check", () => {
    const doc = createBaseSpdx3Sbom();
    doc["@graph"].push({ type: "security_Vulnerability", spdxId: "urn:vuln" });
    expect(status(doc, "bsi-tr03183:no-vulnerabilities")).toBe("fail");
  });
});

describe("affected lists (replaces _format_failure_details)", () => {
  const withComponents = (n: number): Doc => {
    const doc = createBaseCyclonedxSbom();
    for (let i = 0; i < n; i++) doc.components.push({ name: `pkg${i}` });
    return doc;
  };

  test("a small list shows all", () => {
    const f = get(assess(withComponents(3)), "bsi-tr03183:component-version");
    expect(f.affected).toEqual(["pkg0", "pkg1", "pkg2"]);
    expect(f.affectedCount).toBe(3);
    expect(f.description).toContain("Missing for 3 components.");
  });

  test("a large list is capped with the total kept", () => {
    const f = get(assess(withComponents(200)), "bsi-tr03183:component-version");
    expect(f.affected).toHaveLength(25);
    expect(f.affected![0]).toBe("pkg0");
    expect(f.affected).not.toContain("pkg25");
    expect(f.affectedCount).toBe(200);
    expect(f.description).not.toContain("pkg0");
  });

  test("a passing finding has no affected list", () => {
    const f = get(assess(createBaseCyclonedxSbom()), "bsi-tr03183:component-version");
    expect(f.affected).toBeUndefined();
    expect(f.affectedCount).toBeUndefined();
    expect(f.remediation).toBeUndefined();
  });
});

describe("file-type components are assessed", () => {


  test("a CycloneDX type=file component requires core data", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push({ name: "uv.lock", type: "file", hashes: [{ alg: "SHA-256", content: "def456".repeat(20) }] });
    const findings = assess(doc);
    for (const id of ["bsi-tr03183:component-version", "bsi-tr03183:component-creator"]) expect(get(findings, id).status).toBe("fail");
  });

  test("a nameless file-type component still fails the name check", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push({ type: "file" });
    expect(status(doc, "bsi-tr03183:component-name")).toBe("fail");
  });

  test("SPDX 2 -File- entries are assessed for version and creator", () => {
    const doc = {
      spdxVersion: "SPDX-2.3",
      SPDXID: "SPDXRef-DOCUMENT",
      name: "test",
      dataLicense: "CC0-1.0",
      documentNamespace: "https://example.com/test",
      creationInfo: {
        created: "2024-01-15T12:00:00Z",
        creators: ["Tool: test", "Organization: Example Corp (sbom@example.com)"],
      },
      packages: [
        {
          SPDXID: "SPDXRef-Package-django",
          name: "django",
          versionInfo: "5.2.3",
          supplier: "Organization: Django",
          downloadLocation: "NOASSERTION",
        },
        {
          SPDXID: "SPDXRef-DocumentRoot-File-uv.lock",
          name: "uv.lock",
          downloadLocation: "NOASSERTION",
          filesAnalyzed: false,
        },
      ],
      relationships: [
        { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Package-django" },
        {
          spdxElementId: "SPDXRef-Package-django",
          relationshipType: "DEPENDS_ON",
          relatedSpdxElement: "SPDXRef-Package-django",
        },
      ],
    };
    const findings = assess(doc);
    expect(get(findings, "bsi-tr03183:component-version").status).toBe("fail");
    expect(get(findings, "bsi-tr03183:component-creator").status).toBe("fail");
  });

  test("library and file components both require core fields", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push({ name: "broken-lib", type: "library", purl: "pkg:pypi/broken-lib@unknown" });
    doc.components.push({ name: "uv.lock", type: "file" });
    const findings = assess(doc);
    for (const id of ["bsi-tr03183:component-version", "bsi-tr03183:component-creator"]) {
      const f = get(findings, id);
      expect(f.status).toBe("fail");
      expect(f.affected).toContain("broken-lib");
      expect(f.affected).toContain("uv.lock");
    }
  });

  test("every file-type component requires core data, case-insensitively", () => {
    const doc = createBaseCyclonedxSbom();
    doc.components.push(
      { name: "uv.lock", type: "file" },
      { name: "poetry.lock", type: "FILE" },
      { name: "package-lock.json", type: "File" },
    );
    const findings = assess(doc);
    for (const id of ["bsi-tr03183:component-version", "bsi-tr03183:component-creator"]) expect(get(findings, id).status).toBe("fail");
  });
});

// ---------------------------------------------------------------------------
// BSI cases from the other plugin test modules
// ---------------------------------------------------------------------------

describe("source-code URI on SPDX 3 (test_spdx3_field_fixes)", () => {
  const hasUri = (extra: Doc) => spdx3HasSourceCodeUri({ type: "software_Package", spdxId: "urn:p", name: "p", ...extra });

  test("externalRef vcs passes", () => {
    expect(hasUri({ externalRef: [{ externalRefType: "vcs", locator: ["https://github.com/acme/p"] }] })).toBe(true);
  });

  test("externalRef sourceArtifact passes", () => {
    expect(hasUri({ externalRef: [{ externalRefType: "sourceArtifact", locator: ["https://acme.test/src.tgz"] }] })).toBe(
      true,
    );
  });

  test("a bare-string locator passes", () => {
    expect(hasUri({ externalRef: [{ externalRefType: "vcs", locator: "https://github.com/acme/p" }] })).toBe(true);
  });

  test("software_sourceInfo fallback", () => {
    expect(hasUri({ software_sourceInfo: "built from https://github.com/acme/p" })).toBe(false);
  });

  test("the legacy identifier shape is still accepted", () => {
    expect(
      hasUri({ externalIdentifiers: [{ externalIdentifierType: "vcs", identifier: "https://github.com/acme/p" }] }),
    ).toBe(true);
  });

  test("nothing still fails", () => {
    expect(hasUri({})).toBe(false);
    expect(hasUri({ externalRef: [{ externalRefType: "binaryArtifact", locator: ["x"] }] })).toBe(false);
  });
});

const EMAIL = "releases@acme.test";
const URL = "https://acme.test/security";
const ACME: JsonObject = {
  type: "Organization",
  spdxId: "urn:acme",
  name: "Acme",
  externalIdentifier: [{ externalIdentifierType: "email", identifier: EMAIL }],
};
const agents = (entries: Record<string, JsonObject> = {}): Spdx3ElementMap => new Map(Object.entries(entries));

describe("SPDX 3 creators in every agent position (test_spdx3_agent_positions, test_spdx3_helpers)", () => {
  test("a list createdBy", () => {
    expect(spdx3SbomCreator({ createdBy: ["urn:acme"] }, agents({ "urn:acme": ACME }))).toBe(EMAIL);
  });

  test("a compact createdBy", () => {
    expect(spdx3SbomCreator({ createdBy: "urn:acme" }, agents({ "urn:acme": ACME }))).toBe(EMAIL);
  });

  test("an inline createdBy agent", () => {
    expect(spdx3SbomCreator({ createdBy: ACME }, agents())).toBe(EMAIL);
    expect(
      spdx3SbomCreator(
        {
          type: "CreationInfo",
          createdBy: [
            {
              type: "Organization",
              name: "Inline",
              externalIdentifier: [{ externalIdentifierType: "email", identifier: "sec@inline.test" }],
            },
          ],
        },
        agents(),
      ),
    ).toBe("sec@inline.test");
  });

  test("a URL creator", () => {
    const org = {
      type: "Organization",
      name: "Acme",
      externalIdentifier: [{ externalIdentifierType: "urlScheme", identifier: URL }],
    };
    expect(spdx3SbomCreator({ createdBy: org }, agents())).toBe(URL);
  });

  test("no createdBy reads nobody", () => {
    expect(spdx3SbomCreator({}, agents())).toBeNull();
  });

  test("a creator without contact details reads nobody", () => {
    expect(spdx3SbomCreator({ createdBy: { type: "Organization", name: "Acme" } }, agents())).toBeNull();
  });

  test("a list originatedBy", () => {
    expect(spdx3ComponentCreator({ originatedBy: ["urn:acme"] }, agents({ "urn:acme": ACME }))).toBe(EMAIL);
  });

  test("a compact originatedBy", () => {
    expect(spdx3ComponentCreator({ originatedBy: "urn:acme" }, agents({ "urn:acme": ACME }))).toBe(EMAIL);
  });

  test("an inline originatedBy agent", () => {
    expect(spdx3ComponentCreator({ originatedBy: ACME }, agents())).toBe(EMAIL);
    expect(
      spdx3ComponentCreator(
        {
          type: "software_Package",
          name: "p",
          originatedBy: [
            {
              type: "SoftwareAgent",
              name: "builder",
              externalIdentifier: [{ externalIdentifierType: "email", identifier: "bot@acme.test" }],
            },
          ],
        },
        agents(),
      ),
    ).toBe("bot@acme.test");
  });

  test("no originatedBy reads nobody", () => {
    expect(spdx3ComponentCreator({}, agents())).toBeNull();
  });

  test("identifier check accepts the spec and the legacy spelling", () => {
    const doc = (pkgExtra: Doc): Doc => ({
      "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
      "@graph": [{ type: "CreationInfo", specVersion: "3.0.1" }, { type: "software_Package", name: "p", ...pkgExtra }],
    });
    const id = "bsi-tr03183:unique-identifiers";
    expect(
      get(
        validateSpdx3(doc({ externalIdentifier: [{ externalIdentifierType: "packageUrl", identifier: "pkg:pypi/p@1" }] })),
        id,
      ).status,
    ).toBe("pass");
    expect(
      get(
        validateSpdx3(doc({ externalIdentifiers: [{ externalIdentifierType: "packageURL", identifier: "pkg:pypi/p@1" }] })),
        id,
      ).status,
    ).toBe("pass");
  });
});

describe("format floor messages and detection (test_spdx3_honest_edges)", () => {
  test("SPDX 3.0 failure names the source and a way out", () => {
    const f = checkFormatVersion("spdx", "3.0");
    expect(f.status).toBe("fail");
    for (const s of ["TR-03183-2", "3.0.1", "cdxgen", "Yocto"]) expect(f.remediation).toContain(s);
  });

  test("SPDX 3.0.1 still passes", () => {
    expect(checkFormatVersion("spdx", "3.0.1").status).toBe("pass");
  });

  test("SPDX 2.3 keeps its existing message", () => {
    const f = checkFormatVersion("spdx", "2.3");
    expect(f.status).toBe("fail");
    expect(f.remediation!.toLowerCase()).toContain("regenerate");
  });

  const verdict = (doc: Doc) => {
    const [format, version] = detectFormatAndVersion(doc);
    return checkFormatVersion(format, version).status;
  };

  test("a graph alone is recognised as SPDX 3", () => {
    const doc = { "@graph": [{ type: "CreationInfo", specVersion: "3.0.1" }] };
    expect(detectFormatAndVersion(doc)).toEqual(["spdx", "3.0.1"]);
    expect(verdict(doc)).toBe("pass");
  });

  test("an unversioned document takes the version from its context", () => {
    expect(
      detectFormatAndVersion({ "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": [] }),
    ).toEqual(["spdx", "3.0.1"]);
  });

  test("a document stating no version anywhere fails rather than guesses", () => {
    const doc = { "@graph": [] };
    expect(detectFormatAndVersion(doc)).toEqual(["spdx", ""]);
    expect(verdict(doc)).toBe("fail");
  });

  test("the 3.1 line is detected and is reported as unsupported", () => {
    const doc = {
      "@context": "https://spdx.org/rdf/3.1/spdx-context.jsonld",
      "@graph": [{ type: "CreationInfo", specVersion: "3.1.0" }],
    };
    expect(detectFormatAndVersion(doc)).toEqual(["spdx", "3.1.0"]);
    expect(verdict(doc)).toBe("warning");
    expect(checkFormatVersion("spdx", "3.1.0").description).toContain("published-release catalogue");
  });

  test("3.0.1 passes and 3.0 fails", () => {
    expect(
      verdict({
        "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld",
        "@graph": [{ type: "CreationInfo", specVersion: "3.0.1" }],
      }),
    ).toBe("pass");
    expect(
      verdict({
        "@context": "https://spdx.org/rdf/3.0/spdx-context.jsonld",
        "@graph": [{ type: "CreationInfo", specVersion: "3.0" }],
      }),
    ).toBe("fail");
  });

  test("CycloneDX is untouched", () => {
    expect(detectFormatAndVersion({ bomFormat: "CycloneDX", specVersion: "1.6" })).toEqual(["cyclonedx", "1.6"]);
  });
});

describe("version comparison (packaging.version)", () => {
  test("PEP 440 ordering", () => {
    expect(versionGte("1.6", "1.6")).toBe(true);
    expect(versionGte("1.6.0", "1.6")).toBe(true);
    expect(versionGte("1.10", "1.6")).toBe(true);
    expect(versionGte("1.6rc1", "1.6")).toBe(false);
    expect(versionGte("1.6.post1", "1.6")).toBe(true);
    expect(versionGte("1.6.dev0", "1.6")).toBe(false);
    expect(versionGte("v1.7", "1.6")).toBe(true);
    expect(versionGte("3.0.1", "3.0.1")).toBe(true);
    expect(versionGte("3.0", "3.0.1")).toBe(false);
  });

  test("invalid versions fall back to the int tuple", () => {
    expect(versionGte("1.6-foo.x", "1.6")).toBe(false); // (1, 0, 0) < (1, 6)
    expect(versionGte("2.x", "1.6")).toBe(true); // (2, 0) > (1, 6)
    expect(versionGte("", "1.6")).toBe(false);
    expect(versionGte("SPDX-3.0.1", "3.0.1")).toBe(true);
  });
});

// The conformant SPDX 3 corpus (spdx3_corpus.py), for the cross-plugin guards.
const CI = "_:creationinfo";
const creationInfo = (createdBy: unknown[] = ["urn:acme:agent"], createdUsing?: unknown[]): Doc => ({
  type: "CreationInfo",
  "@id": CI,
  specVersion: "3.0.1",
  created: "2026-08-01T00:00:00Z",
  createdBy,
  ...(createdUsing ? { createdUsing } : {}),
});
const person = (spdxId = "urn:acme:agent", name = "Jane Doe", email = "jane@acme.test"): Doc => ({
  type: "Person",
  spdxId,
  creationInfo: CI,
  name,
  externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: email }],
});
const tool = (spdxId = "urn:acme:tool", name = "sbomify-action-1.2.3"): Doc => ({ type: "Tool", spdxId, creationInfo: CI, name });
const spdxDocument = (root: unknown, spdxId = "urn:acme:doc"): Doc => ({
  type: "SpdxDocument",
  spdxId,
  creationInfo: CI,
  rootElement: root,
  profileConformance: ["core", "software"],
});
const pkg = (spdxId = "urn:acme:pkg1", name = "my-app", version = "1.2.3", supplier: unknown = "urn:acme:agent", extra: Doc = {}): Doc => ({
  type: "software_Package",
  spdxId,
  creationInfo: CI,
  name,
  software_packageVersion: version,
  software_downloadLocation: `https://downloads.acme.test/${name}-${version}.tar.gz`,
  verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "a".repeat(64) }],
  externalRef: [{ type: "ExternalRef", externalRefType: "vcs", locator: [`https://github.com/acme/${name}`] }],
  validUntilTime: "2030-01-01T00:00:00Z",
  ...(supplier !== null ? { originatedBy: [supplier] } : {}),
  ...extra,
});
const licenseExpression = (): Doc => ({
  type: "simplelicensing_LicenseExpression",
  spdxId: "urn:acme:lic1",
  creationInfo: CI,
  simplelicensing_licenseExpression: "MIT",
});
const relationship = (relType: string, from: string, to: string[], spdxId = "urn:acme:rel1"): Doc => ({
  type: "Relationship",
  spdxId,
  creationInfo: CI,
  relationshipType: relType,
  from,
  to,
});
const corpusDoc = (...graph: Doc[]): Doc => ({ "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": graph });

const corpus = {
  minimalConformant: () =>
    corpusDoc(
      creationInfo(undefined, ["urn:acme:tool"]),
      person(),
      tool(),
      spdxDocument(["urn:acme:pkg1"]),
      pkg(undefined, undefined, undefined, undefined, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
      licenseExpression(),
      relationship("hasConcludedLicense", "urn:acme:pkg1", ["urn:acme:lic1"]),
      relationship("hasDeclaredLicense", "urn:acme:pkg1", ["urn:acme:lic1"], "urn:acme:rel2"),
    ),
  inlineAgents: () => {
    const inlineOrg = {
      type: "Organization",
      spdxId: "urn:acme:inlineorg",
      creationInfo: CI,
      name: "Inline Corp",
      externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: "sec@inline.test" }],
    };
    return corpusDoc(
      creationInfo([{ ...inlineOrg }]),
      spdxDocument(["urn:acme:pkg1"]),
      pkg(undefined, undefined, undefined, { ...inlineOrg }, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
    );
  },
  softwareAgentSupplier: () =>
    corpusDoc(
      creationInfo(),
      person(),
      {
        type: "SoftwareAgent",
        spdxId: "urn:acme:bot",
        creationInfo: CI,
        name: "build-bot",
        externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: "bot@acme.test" }],
      },
      spdxDocument(["urn:acme:pkg1"]),
      pkg(undefined, undefined, undefined, "urn:acme:bot", { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
    ),
  purlViaSoftwarePackageUrlOnly: () =>
    corpusDoc(
      creationInfo(),
      person(),
      spdxDocument(["urn:acme:pkg1"]),
      pkg(undefined, undefined, undefined, undefined, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
    ),
  purlViaExternalIdentifierOnly: () =>
    corpusDoc(
      creationInfo(),
      person(),
      spdxDocument(["urn:acme:pkg1"]),
      pkg(undefined, undefined, undefined, undefined, {
        externalIdentifier: [
          { type: "ExternalIdentifier", externalIdentifierType: "packageUrl", identifier: "pkg:pypi/my-app@1.2.3" },
        ],
      }),
    ),
  legacySpellingCounterpart: () => {
    const doc = corpus.purlViaExternalIdentifierOnly();
    for (const e of doc["@graph"]) {
      if (e.type === "software_Package") {
        e.externalIdentifiers = [{ externalIdentifierType: "packageURL", identifier: "pkg:pypi/my-app@1.2.3" }];
        delete e.externalIdentifier;
      }
      if (e.type === "Person") {
        e.externalIdentifiers = e.externalIdentifier;
        delete e.externalIdentifier;
      }
    }
    return doc;
  },
  yoctoShaped: () =>
    corpusDoc(
      creationInfo(["urn:oe:org"]),
      { type: "Organization", spdxId: "urn:oe:org", creationInfo: CI, name: "OpenEmbedded" },
      spdxDocument(["urn:oe:sbom"]),
      {
        type: "software_Sbom",
        spdxId: "urn:oe:sbom",
        creationInfo: CI,
        software_sbomType: ["build"],
        rootElement: ["urn:oe:image"],
        element: ["urn:oe:image", "urn:oe:netbase"],
      },
      pkg("urn:oe:image", "core-image-minimal", "6.0", "urn:oe:org", {
        software_packageUrl: "pkg:generic/core-image-minimal@6.0",
      }),
      pkg("urn:oe:netbase", "netbase", "6.4", "urn:oe:org", { software_packageUrl: "pkg:generic/netbase@6.4?distro=yocto" }),
    ),
  syftShaped: () => {
    const doc = corpusDoc(
      creationInfo(undefined, ["urn:syft:tool"]),
      person("urn:syft:agent", "Anchore", "oss@anchore.test"),
      tool("urn:syft:tool", "syft-1.46.0"),
      { type: "SpdxDocument", spdxId: "urn:syft:doc", creationInfo: CI, profileConformance: ["core", "software"] },
      pkg("urn:syft:pkg1", "left-pad", "1.3.0", "urn:syft:agent", {
        externalIdentifier: [
          { type: "ExternalIdentifier", externalIdentifierType: "packageUrl", identifier: "pkg:npm/left-pad@1.3.0" },
        ],
      }),
      relationship("describes", "urn:syft:doc", ["urn:syft:pkg1"], "urn:syft:rel1"),
    );
    doc["@context"] = "https://spdx.org/rdf/3.0.0/spdx-context.jsonld";
    for (const e of doc["@graph"]) if (e.type === "CreationInfo") e.specVersion = "3.0.0";
    return doc;
  },
};

const score = (doc: Doc): [number, number] => {
  const statuses = validateSpdx3(doc).map((f) => f.status);
  return [statuses.filter((s) => s === "pass").length, statuses.filter((s) => s === "fail").length];
};
const licenceStatuses = (findings: Finding[]) => findings.filter((f) => f.id.toLowerCase().includes("licen")).map((f) => f.status);

describe("licence resolution (test_spdx3_license_resolution)", () => {
  test("a dangling licence relationship fails", () => {
    const doc = corpus.minimalConformant();
    doc["@graph"] = doc["@graph"].filter((e: Doc) => !String(e.type).includes("License"));
    expect(licenceStatuses(validateSpdx3(doc))).toContain("fail");
  });

  test("the conformant corpus passes the licence checks", () => {
    expect(licenceStatuses(validateSpdx3(corpus.minimalConformant()))).not.toContain("fail");
  });
});

describe("SPDX 2 IRI reference types (test_spdx2_identifier_iri)", () => {
  const document = (referenceType: string): Doc => ({
    spdxVersion: "SPDX-2.2",
    dataLicense: "CC0-1.0",
    SPDXID: "SPDXRef-DOCUMENT",
    name: "recipe-openssl",
    documentNamespace: "http://spdx.org/spdxdocs/recipe-openssl-0f2c1f0e",
    creationInfo: {
      created: "2026-01-01T00:00:00Z",
      creators: ["Tool: OpenEmbedded Core create-spdx.bbclass", "Organization: OpenEmbedded"],
    },
    packages: [
      {
        SPDXID: "SPDXRef-Recipe-openssl",
        name: "openssl",
        versionInfo: "3.2.3",
        downloadLocation: "NOASSERTION",
        filesAnalyzed: false,
        supplier: "Organization: OpenEmbedded ()",
        licenseConcluded: "NOASSERTION",
        licenseDeclared: "OpenSSL",
        copyrightText: "NOASSERTION",
        checksums: [{ algorithm: "SHA256", checksumValue: "a".repeat(64) }],
        externalRefs: [
          {
            referenceCategory: "SECURITY",
            referenceType,
            referenceLocator: "cpe:2.3:*:openssl:openssl:3.2.3:*:*:*:*:*:*:*",
          },
        ],
      },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Recipe-openssl" },
    ],
  });

  for (const ref of ["http://spdx.org/rdf/references/cpe23Type", "cpe23Type"]) {
    test(`${ref} scores as an identifier`, () => {
      const f = get(validateSpdx(document(ref), "2.2"), "bsi-tr03183:unique-identifiers");
      expect(f.status).not.toBe("fail");
      expect(f.status).toBe("pass");
    });
  }
});

describe("conformant corpus (test_spdx3_corpus, BSI only)", () => {
  test("spec spelling beats or ties legacy", () => {
    const [specPass, specFail] = score(corpus.purlViaExternalIdentifierOnly());
    const [legacyPass, legacyFail] = score(corpus.legacySpellingCounterpart());
    expect(specPass).toBeGreaterThanOrEqual(legacyPass);
    expect(specFail).toBeLessThanOrEqual(legacyFail);
  });

  test("the first-class purl property scores like an identifier", () => {
    expect(score(corpus.purlViaSoftwarePackageUrlOnly())).toEqual(score(corpus.purlViaExternalIdentifierOnly()));
  });

  for (const [name, build] of [
    ["inline_agents", corpus.inlineAgents],
    ["software_agent_supplier", corpus.softwareAgentSupplier],
    ["yocto_shaped", corpus.yoctoShaped],
    ["syft_shaped", corpus.syftShaped],
  ] as const) {
    test(`${name} completes with gradeable findings`, () => {
      const [pass, fail] = score(build());
      expect(pass + fail).toBeGreaterThan(0);
    });
  }

  test("inline and referenced suppliers score identically", () => {
    expect(score(corpus.softwareAgentSupplier())).toEqual(score(corpus.inlineAgents()));
  });
});
