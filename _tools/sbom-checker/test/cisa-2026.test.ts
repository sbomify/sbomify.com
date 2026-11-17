/**
 * Port of sbomify's CISA 2026 plugin tests:
 *   - sbomify/apps/plugins/tests/test_cisa_2026_plugin.py (all cases)
 *   - the CISA 2026 cases in test_spdx3_honest_edges.py, test_spdx3_agent_positions.py,
 *     test_spdx3_license_resolution.py, test_spdx2_identifier_iri.py, test_spdx3_corpus.py
 *     and the scoring assertions of test_cisa_integration.py.
 *
 * Deliberate difference: SBOM Author Signature without an in-document
 * signature is a warning here (the app passes it on a stored detached
 * signature, which a browser cannot see), so the Python "context=SIGNED"
 * cases expect "warning" for SPDX.
 */

import { describe, expect, test } from "bun:test";
import corpus from "./fixtures/cisa-2026-spdx3-corpus.json";
import {
  cisa2026,
  COMPONENT_ELEMENTS,
  ELEMENTS,
  MAX_TIMESTAMP_LEN,
  METADATA_ELEMENTS,
  pyUrlHostname,
  spdx3HasAuthor,
  spdx3HasGenerationContext,
  spdx3ProducerNames,
  spdx3Tools,
  STANDARD_NAME,
  STANDARD_URL,
  STANDARD_VERSION,
  type Element,
} from "../src/frameworks/cisa-2026";
import { sbom } from "./helpers";
import type { Finding } from "../src/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

const ALL_ELEMENTS: string[] = [...METADATA_ELEMENTS, ...COMPONENT_ELEMENTS];

function findings(document: unknown): Finding[] {
  return cisa2026.assess(sbom(document));
}

function elementOf(f: Finding): string {
  return f.id.replace(/^cisa-2026:/, "").replaceAll("-", "_");
}

/** element key → status, like the Python `assess` helper. */
function assess(document: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of findings(document)) out[elementOf(f)] = f.status;
  return out;
}

function finding(document: unknown, element: Element): Finding {
  const f = findings(document).find((x) => elementOf(x) === element);
  if (!f) throw new Error(`no finding for ${element}`);
  return f;
}

function detail(document: unknown, element: Element): string {
  return finding(document, element).description;
}

function counts(fs: Finding[]): Record<string, number> {
  const c: Record<string, number> = { pass: 0, fail: 0, warning: 0, error: 0 };
  for (const f of fs) c[f.status] = (c[f.status] ?? 0) + 1;
  return c;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function cyclonedx(overrides: Doc = {}): Doc {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      timestamp: "2026-07-29T10:00:00Z",
      authors: [{ name: "Acme Release Engineering" }],
      lifecycles: [{ phase: "build" }],
      tools: { components: [{ name: "syft", version: "1.51.1" }] },
    },
    components: [
      {
        name: "openssl",
        version: "3.0.11",
        type: "library",
        manufacturer: { name: "The OpenSSL Project" },
        purl: "pkg:generic/openssl@3.0.11",
        hashes: [{ alg: "SHA-256", content: "a".repeat(64) }],
        licenses: [{ license: { id: "Apache-2.0" } }],
      },
      {
        name: "zlib",
        version: "1.3",
        type: "library",
        manufacturer: { name: "Zlib" },
        purl: "pkg:generic/zlib@1.3",
        hashes: [{ alg: "SHA-256", content: "b".repeat(64) }],
        licenses: [{ license: { id: "Zlib" } }],
      },
    ],
    dependencies: [{ ref: "openssl", dependsOn: ["zlib"] }],
    signature: { algorithm: "RS512", value: "signed" },
    ...overrides,
  };
}

function spdx2(overrides: Doc = {}): Doc {
  return {
    spdxVersion: "SPDX-2.3",
    SPDXID: "SPDXRef-DOCUMENT",
    documentNamespace: "https://acme.example/spdx/image-2026-07-29",
    creationInfo: {
      created: "2026-07-29T10:00:00Z",
      creators: ["Organization: Acme Inc", "Tool: syft-1.51.1"],
      comment: "Generated after build from the release image.",
    },
    packages: [
      {
        name: "openssl",
        SPDXID: "SPDXRef-openssl",
        versionInfo: "3.0.11",
        originator: "Organization: The OpenSSL Project",
        externalRefs: [
          { referenceCategory: "PACKAGE-MANAGER", referenceType: "purl", referenceLocator: "pkg:generic/openssl@3.0.11" },
        ],
        checksums: [{ algorithm: "SHA256", checksumValue: "a".repeat(64) }],
        licenseDeclared: "Apache-2.0",
      },
      {
        name: "zlib",
        SPDXID: "SPDXRef-zlib",
        versionInfo: "1.3",
        originator: "Organization: Zlib",
        externalRefs: [
          { referenceCategory: "PACKAGE-MANAGER", referenceType: "purl", referenceLocator: "pkg:generic/zlib@1.3" },
        ],
        checksums: [{ algorithm: "SHA256", checksumValue: "b".repeat(64) }],
        licenseDeclared: "Zlib",
      },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-openssl", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-zlib" },
    ],
    ...overrides,
  };
}

function spdx3(overrides: Doc = {}): Doc {
  const graph: Doc[] = [
    { type: "SpdxDocument", spdxId: "urn:doc", name: "image" },
    { type: "software_Sbom", spdxId: "urn:sbom", software_sbomType: "build" },
    { type: "Organization", spdxId: "urn:org:acme", name: "Acme Inc" },
    { type: "Organization", spdxId: "urn:org:openssl", name: "The OpenSSL Project" },
    { type: "Tool", spdxId: "urn:tool:syft", name: "syft", software_packageVersion: "1.51.1" },
    {
      type: "CreationInfo",
      spdxId: "urn:ci",
      specVersion: "3.0.1",
      created: "2026-07-29T10:00:00Z",
      createdBy: ["urn:org:acme"],
      createdUsing: ["urn:tool:syft"],
    },
    {
      type: "software_Package",
      spdxId: "urn:pkg:openssl",
      name: "openssl",
      software_packageVersion: "3.0.11",
      software_packageUrl: "pkg:generic/openssl@3.0.11",
      originatedBy: ["urn:org:openssl"],
      verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "a".repeat(64) }],
    },
    {
      type: "software_Package",
      spdxId: "urn:pkg:zlib",
      name: "zlib",
      software_packageVersion: "1.3",
      software_packageUrl: "pkg:generic/zlib@1.3",
      originatedBy: ["urn:org:openssl"],
      verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "b".repeat(64) }],
    },
    { type: "simplelicensing_LicenseExpression", spdxId: "urn:lic:apache", simplelicensing_licenseExpression: "Apache-2.0" },
    { type: "simplelicensing_LicenseExpression", spdxId: "urn:lic:zlib", simplelicensing_licenseExpression: "Zlib" },
    { type: "Relationship", spdxId: "urn:rel:lic1", from: "urn:pkg:openssl", relationshipType: "hasDeclaredLicense", to: ["urn:lic:apache"] },
    { type: "Relationship", spdxId: "urn:rel:lic2", from: "urn:pkg:zlib", relationshipType: "hasDeclaredLicense", to: ["urn:lic:zlib"] },
    { type: "Relationship", spdxId: "urn:rel:dep", from: "urn:pkg:openssl", relationshipType: "dependsOn", to: ["urn:pkg:zlib"] },
  ];
  return { "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": graph, ...overrides };
}

const BUILDERS: [string, () => Doc][] = [
  ["cyclonedx", () => cyclonedx()],
  ["spdx2", () => spdx2()],
  ["spdx3", () => spdx3()],
];

describe("the element set", () => {
  test("it is the seventeen data fields", () => {
    expect(METADATA_ELEMENTS.length).toBe(9);
    expect(COMPONENT_ELEMENTS.length).toBe(8);
    expect(new Set(ALL_ELEMENTS)).toEqual(new Set(Object.keys(ELEMENTS)));
  });

  test("it names the final standard and not the draft", () => {
    expect(cisa2026.id).toBe("cisa-2026");
    expect(cisa2026.guideUrl).toBe("https://sbomify.com/compliance/cisa-minimum-elements/");
    expect(STANDARD_VERSION).toBe("2026-07");
    expect(cisa2026.version).toBe("2026-07");
    expect(STANDARD_NAME.toLowerCase()).not.toContain("draft");
    expect(STANDARD_URL).toContain("2026");
  });

  for (const [id, builder] of BUILDERS) {
    test(`every format reports every element once (${id})`, () => {
      const fs = findings(builder());
      expect(fs.map(elementOf).sort()).toEqual([...ALL_ELEMENTS].sort());
    });

    test(`findings come back in the order the standard lists them (${id})`, () => {
      expect(findings(builder()).map(elementOf)).toEqual(ALL_ELEMENTS);
    });
  }
});

describe("a compliant document passes", () => {
  // Python passes context=SIGNED; here SPDX cannot carry a signature and no
  // detached one is visible, so that element fails exactly as it does in the
  // app for an SBOM uploaded without a signature. Nothing else fails.
  for (const [id, builder] of BUILDERS) {
    test(`nothing fails (${id})`, () => {
      const statuses = assess(builder());
      const notPassing = Object.entries(statuses).filter(([, s]) => s !== "pass").map(([e]) => e);
      expect(notPassing).toEqual(id === "cyclonedx" ? [] : ["sbom_author_signature"]);
      expect(Object.values(statuses).filter((s) => s !== "pass")).toEqual(id === "cyclonedx" ? [] : ["fail"]);
    });
  }
});

describe("the author is not the tool", () => {
  test("spdx2 tool-only creators do not name an author", () => {
    const statuses = assess(spdx2({ creationInfo: { created: "2026-07-29T10:00:00Z", creators: ["Tool: syft-1.51.1"] } }));
    expect(statuses.sbom_author).toBe("fail");
    expect(statuses.sbom_tool_name).toBe("pass");
  });

  test("spdx2 junk is not an author either", () => {
    expect(assess(spdx2({ creationInfo: { created: "2026-07-29T10:00:00Z", creators: ["banana"] } })).sbom_author).toBe("fail");
  });

  for (const creator of ["Person: Jane Doe", "Organization: Acme Inc"]) {
    test(`spdx2 a person or an organization is an author (${creator})`, () => {
      expect(assess(spdx2({ creationInfo: { created: "2026-07-29T10:00:00Z", creators: [creator] } })).sbom_author).toBe("pass");
    });
  }

  test("spdx3 a software agent is the tool, not the author", () => {
    const document = spdx3();
    const graph: Doc[] = document["@graph"].filter((e: Doc) => e.spdxId !== "urn:org:acme");
    graph.push({ type: "SoftwareAgent", spdxId: "urn:agent:syft", name: "syft" });
    for (const element of graph) if (element.type === "CreationInfo") element.createdBy = ["urn:agent:syft"];
    document["@graph"] = graph;
    expect(assess(document).sbom_author).toBe("fail");
  });

  test("cyclonedx tools alone do not name an author", () => {
    const document = cyclonedx();
    delete document.metadata.authors;
    expect(assess(document).sbom_author).toBe("fail");
  });

  test("cyclonedx reads the manufacturer as an author", () => {
    const document = cyclonedx();
    delete document.metadata.authors;
    document.metadata.manufacturer = { name: "Acme Inc" };
    expect(assess(document).sbom_author).toBe("pass");
  });
});

describe("the producer is whoever is named", () => {
  test("spdx2 an originator alone is a producer", () => {
    const document = spdx2();
    for (const p of document.packages) {
      p.originator = "Organization: The OpenSSL Project";
      delete p.supplier;
    }
    expect(assess(document).component_producer).toBe("pass");
  });

  test("spdx2 a supplier alone is still a party", () => {
    const document = spdx2();
    for (const p of document.packages) {
      delete p.originator;
      p.supplier = "Organization: A Distributor";
    }
    expect(assess(document).component_producer).toBe("pass");
  });

  test("cyclonedx a manufacturer alone is a producer", () => {
    const document = cyclonedx();
    for (const c of document.components) {
      c.manufacturer = { name: "The OpenSSL Project" };
      delete c.publisher;
      delete c.supplier;
    }
    expect(assess(document).component_producer).toBe("pass");
  });

  test("naming nobody fails", () => {
    const document = cyclonedx();
    for (const c of document.components) delete c.manufacturer;
    const f = finding(document, "component_producer");
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["openssl", "zlib"]);
    expect(f.affectedCount).toBe(2);
  });

  test("spdx3 a dangling reference names nobody", () => {
    const document = spdx3();
    for (const e of document["@graph"]) if (e.type === "software_Package") e.originatedBy = ["urn:org:missing"];
    expect(assess(document).component_producer).toBe("fail");
  });

  test("spdx3 NOASSERTION still reaches the unknown outcome", () => {
    const document = spdx3();
    for (const e of document["@graph"]) if (e.type === "software_Package") e.originatedBy = ["NOASSERTION"];
    expect(assess(document).component_producer).toBe("warning");
  });
});

describe("the timestamp is RFC 9557", () => {
  for (const stamp of [
    "2026-07-29T10:00:00Z",
    "2026-07-29T10:00:00.123Z",
    "2026-07-29T10:00:00+02:00",
    "2026-07-29T10:00:00Z[Europe/Berlin]",
    "2026-07-29T10:00:00+01:00[Europe/London][u-ca=hebrew]",
  ]) {
    test(`accepted: ${stamp}`, () => {
      const document = cyclonedx();
      document.metadata.timestamp = stamp;
      expect(assess(document).sbom_timestamp).toBe("pass");
    });
  }

  for (const stamp of [
    "2026-07-29",
    "2026-07-29 10:00:00Z",
    "2026-07-29T10:00:00",
    "2026-02-30T10:00:00Z",
    "not a timestamp",
    "",
  ]) {
    test(`refused: ${JSON.stringify(stamp)}`, () => {
      const document = cyclonedx();
      document.metadata.timestamp = stamp;
      expect(assess(document).sbom_timestamp).toBe("fail");
    });
  }

  test("a megabyte of text is refused on length", () => {
    const document = cyclonedx();
    document.metadata.timestamp = "2026-07-29T10:00:00Z" + "[a=b]".repeat(200_000);
    expect(assess(document).sbom_timestamp).toBe("fail");
  });

  test("the bound is generous enough for a real timestamp", () => {
    const longest = "2026-07-29T10:00:00.123456789+01:00[Europe/London][u-ca=hebrew][x-foo=bar]";
    expect(longest.length).toBeLessThan(MAX_TIMESTAMP_LEN);
    const document = cyclonedx();
    document.metadata.timestamp = longest;
    expect(assess(document).sbom_timestamp).toBe("pass");
  });
});

describe("the identifiers CISA names", () => {
  const shapes: [string, unknown][] = [
    ["purl", "pkg:generic/openssl@3.0.11"],
    ["cpe", "cpe:2.3:a:openssl:openssl:3.0.11:*:*:*:*:*:*:*"],
    ["swid", { tagId: "acme.openssl-3.0.11", name: "openssl" }],
    ["omniborId", ["gitoid:blob:sha1:" + "a".repeat(40)]],
    ["swhid", ["swh:1:cnt:" + "b".repeat(40)]],
  ];
  for (const [field, value] of shapes) {
    test(`cyclonedx accepts ${field} in the shape the schema gives it`, () => {
      const document = cyclonedx();
      for (const c of document.components) {
        delete c.purl;
        c[field] = clone(value);
      }
      expect(assess(document).component_identifiers).toBe("pass");
    });
  }

  for (const field of ["swid", "omniborId", "swhid"]) {
    test(`cyclonedx still reads a producer that writes ${field} as a bare string`, () => {
      const document = cyclonedx();
      for (const c of document.components) {
        delete c.purl;
        c[field] = "identifier-value";
      }
      expect(assess(document).component_identifiers).toBe("pass");
    });
  }

  for (const value of [{}, { tagId: "" }, [], [""]]) {
    test(`cyclonedx an empty identifier is no identifier (${JSON.stringify(value)})`, () => {
      const document = cyclonedx();
      for (const c of document.components) {
        delete c.purl;
        c[Array.isArray(value) ? "omniborId" : "swid"] = clone(value);
      }
      expect(assess(document).component_identifiers).toBe("fail");
    });
  }

  for (const referenceType of ["purl", "cpe23Type", "cpe22Type", "swid", "gitoid", "swhid"]) {
    test(`spdx2 accepts ${referenceType}`, () => {
      const document = spdx2();
      for (const p of document.packages) {
        p.externalRefs = [{ referenceCategory: "OTHER", referenceType, referenceLocator: "value" }];
      }
      expect(assess(document).component_identifiers).toBe("pass");
    });
  }

  test("spdx2 a bare purl on the package counts", () => {
    const document = spdx2();
    for (const p of document.packages) {
      delete p.externalRefs;
      p.purl = "pkg:generic/openssl@3.0.11";
    }
    expect(assess(document).component_identifiers).toBe("pass");
  });

  test("a reference that is not an identifier does not count", () => {
    const document = spdx2();
    for (const p of document.packages) {
      p.externalRefs = [{ referenceCategory: "OTHER", referenceType: "website", referenceLocator: "https://example.com" }];
    }
    expect(assess(document).component_identifiers).toBe("fail");
  });
});

describe("the licence the producer declares", () => {
  test("spdx3 accepts a declared licence", () => {
    expect(assess(spdx3()).component_license).toBe("pass");
  });

  test("spdx3 accepts a concluded licence", () => {
    const document = spdx3();
    for (const e of document["@graph"]) {
      if (e.relationshipType === "hasDeclaredLicense") e.relationshipType = "hasConcludedLicense";
    }
    expect(assess(document).component_license).toBe("pass");
  });

  test("spdx3 no licence relationship fails", () => {
    const document = spdx3();
    document["@graph"] = document["@graph"].filter((e: Doc) => !String(e.relationshipType ?? "None").includes("License"));
    expect(assess(document).component_license).toBe("fail");
  });
});

describe("the generation context", () => {
  for (const phase of ["build", "post-build", "design", "operations"]) {
    test(`cyclonedx lifecycle phase ${phase} is accepted`, () => {
      const document = cyclonedx();
      document.metadata.lifecycles = [{ phase }];
      expect(assess(document).sbom_generation_context).toBe("pass");
    });
  }

  for (const wording of ["after build", "after_build", "before build", "during build"]) {
    test(`CISA's own wording is accepted: ${wording}`, () => {
      const document = spdx2();
      document.creationInfo.comment = `Generated ${wording}.`;
      expect(assess(document).sbom_generation_context).toBe("pass");
    });
  }

  test("a custom cyclonedx lifecycle counts", () => {
    const document = cyclonedx();
    document.metadata.lifecycles = [{ name: "nightly image bake", description: "after the build step" }];
    expect(assess(document).sbom_generation_context).toBe("pass");
  });

  for (const sbomType of ["build", "source", "analyzed", "deployed", "runtime", "design"]) {
    test(`spdx3 accepts the spec's own vocabulary: ${sbomType}`, () => {
      const document = spdx3();
      for (const e of document["@graph"]) if (e.type === "software_Sbom") e.software_sbomType = sbomType;
      expect(assess(document).sbom_generation_context).toBe("pass");
    });
  }

  test("spdx3 refuses a value the spec does not define", () => {
    const document = spdx3();
    for (const e of document["@graph"]) if (e.type === "software_Sbom") e.software_sbomType = "banana";
    expect(assess(document).sbom_generation_context).toBe("fail");
  });
});

describe("a declared unknown is its own outcome", () => {
  for (const [element, field] of [
    ["component_version", "versionInfo"],
    ["component_producer", "originator"],
  ] as const) {
    test(`spdx2 NOASSERTION warns rather than failing (${element})`, () => {
      const document = spdx2();
      for (const p of document.packages) p[field] = "NOASSERTION";
      expect(assess(document)[element]).toBe("warning");
    });
  }

  test("spdx2 an omission still fails", () => {
    const document = spdx2();
    for (const p of document.packages) delete p.versionInfo;
    expect(assess(document).component_version).toBe("fail");
  });

  test("NONE is an answer and not an unknown", () => {
    const document = spdx2();
    for (const p of document.packages) p.licenseDeclared = "NONE";
    expect(assess(document).component_license).toBe("pass");
  });

  test("a miss outranks a declared unknown", () => {
    const document = spdx2();
    document.packages[0].versionInfo = "NOASSERTION";
    delete document.packages[1].versionInfo;
    const f = finding(document, "component_version");
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["zlib"]);
  });

  test("the finding names which components said unknown", () => {
    const document = spdx2();
    document.packages[0].versionInfo = "NOASSERTION";
    document.packages[1].versionInfo = "NOASSERTION";
    const f = finding(document, "component_version");
    // Python puts the names in the description; here they are in `affected`.
    expect(f.affected).toContain("openssl");
    expect(f.affectedCount).toBe(2);
    expect(f.description).toContain("Stated as unknown for 2 components");
  });
});

describe("what a reader is told", () => {
  test("a declared unknown does not borrow the absence wording", () => {
    const document = spdx2({ creationInfo: { created: "2026-07-29T10:00:00Z", creators: ["Tool: NOASSERTION"] } });
    const told = detail(document, "sbom_tool_version");
    expect(assess(document).sbom_tool_version).toBe("warning");
    expect(told).toContain("states this is unknown");
    expect(told).not.toContain("without a version");
  });

  test("affected is capped at 25 names but the count is the total", () => {
    const document = cyclonedx({
      components: Array.from({ length: 30 }, (_, i) => ({ name: `c${i}`, type: "library" })),
      dependencies: [],
    });
    const f = finding(document, "component_version");
    expect(f.status).toBe("fail");
    expect(f.affected?.length).toBe(25);
    expect(f.affectedCount).toBe(30);
    expect(f.description).toContain("Missing for 30 components");
    expect(f.remediation).toBe("Add version to every component, or state that it is unknown.");
  });

  test("a passing finding carries no remediation", () => {
    for (const f of findings(cyclonedx())) {
      expect(f.status).toBe("pass");
      expect(f.remediation).toBeUndefined();
      expect(f.affected).toBeUndefined();
    }
  });
});

describe("every format agrees on an unknown", () => {
  test("spdx3 tool version warns like the other two", () => {
    const document = spdx3();
    for (const e of document["@graph"]) if (e.type === "Tool") e.software_packageVersion = "NOASSERTION";
    expect(assess(document).sbom_tool_version).toBe("warning");
  });

  test("an unreadable document reports a single error", () => {
    const fs = findings({ hello: "world" });
    expect(fs.length).toBe(1);
    expect(fs[0]!.status).toBe("error");
    expect(fs[0]!.id).toBe("cisa-2026:error");
  });
});

describe("the signature", () => {
  test("cyclonedx carries its own", () => {
    expect(assess(cyclonedx()).sbom_author_signature).toBe("pass");
  });

  test("an unsigned cyclonedx document fails and points at a detached signature", () => {
    const document = cyclonedx();
    delete document.signature;
    const f = finding(document, "sbom_author_signature");
    expect(f.status).toBe("fail");
    expect(f.description).toContain("no signature block");
    expect(f.remediation).toContain("detached signature");
  });

  test("unsigned spdx fails (a stored signature would pass it in the app) and says why", () => {
    for (const document of [spdx2(), spdx3()]) {
      const f = finding(document, "sbom_author_signature");
      expect(f.status).toBe("fail");
      expect(f.description).toContain("no in-document signature");
      expect(f.remediation).toContain("Sign the SBOM and attach the signature to the artifact");
    }
  });
});

describe("the new metadata elements", () => {
  test("the format names itself", () => {
    const statuses = assess(cyclonedx());
    expect(statuses.sbom_data_format_name).toBe("pass");
    expect(statuses.sbom_data_format_version).toBe("pass");
  });

  test("a missing spec version fails", () => {
    const document = cyclonedx();
    delete document.specVersion;
    expect(assess(document).sbom_data_format_version).toBe("fail");
  });

  test("the tool version is read from the SPDX naming convention", () => {
    expect(assess(spdx2()).sbom_tool_version).toBe("pass");
    const document = spdx2({ creationInfo: { created: "2026-07-29T10:00:00Z", creators: ["Tool: syft"] } });
    expect(assess(document).sbom_tool_version).toBe("fail");
  });

  test("the document version", () => {
    expect(assess(cyclonedx()).sbom_version).toBe("pass");
    const document = cyclonedx();
    delete document.version;
    expect(assess(document).sbom_version).toBe("fail");
  });

  test("spdx uses its namespace to tell revisions apart", () => {
    expect(assess(spdx2()).sbom_version).toBe("pass");
    const document = spdx2();
    delete document.documentNamespace;
    expect(assess(document).sbom_version).toBe("fail");
  });
});

describe("the hash splits in two", () => {
  test("both are reported", () => {
    const statuses = assess(cyclonedx());
    expect(statuses.component_hash_value).toBe("pass");
    expect(statuses.component_hash_algorithm).toBe("pass");
  });

  test("a value without a recognised algorithm splits the two", () => {
    const document = cyclonedx();
    for (const c of document.components) c.hashes = [{ alg: "homegrown", content: "a".repeat(64) }];
    const statuses = assess(document);
    expect(statuses.component_hash_value).toBe("pass");
    expect(statuses.component_hash_algorithm).toBe("fail");
  });

  for (const algorithm of ["SHA-256", "SHA256", "sha256", "SHA3-512", "BLAKE2b-512"]) {
    test(`the spellings the formats disagree about are all read: ${algorithm}`, () => {
      const document = cyclonedx();
      for (const c of document.components) c.hashes = [{ alg: algorithm, content: "a".repeat(64) }];
      expect(assess(document).component_hash_algorithm).toBe("pass");
    });
  }
});

describe("what counts as a component", () => {
  test("the target component is assessed too", () => {
    const document = cyclonedx();
    document.metadata.component = { name: "image", type: "application" };
    expect(assess(document).component_version).toBe("fail");
  });

  test("nested components are assessed", () => {
    const document = cyclonedx();
    document.components[0].components = [{ name: "nested", type: "library" }];
    const f = finding(document, "component_version");
    expect(f.status).toBe("fail");
    expect(f.affected).toEqual(["nested"]);
  });

  test("a file entry is not a component", () => {
    const document = cyclonedx();
    document.components.push({ name: "uv.lock", type: "file" });
    const statuses = assess(document);
    expect(statuses.component_version).toBe("pass");
    expect(statuses.component_name).toBe("pass");
  });

  test("a document with no components warns rather than passing", () => {
    const statuses = assess(cyclonedx({ components: [], dependencies: [] }));
    expect(statuses.component_name).toBe("warning");
    expect(statuses.component_version).toBe("warning");
  });

  test("deeply nested components do not overflow the stack", () => {
    const root: Doc = { name: "root", type: "library" };
    let cursor = root;
    for (let i = 0; i < 50_000; i++) {
      const child: Doc = { name: `n${i}`, type: "library" };
      cursor.components = [child];
      cursor = child;
    }
    const f = finding(cyclonedx({ components: [root] }), "component_version");
    expect(f.status).toBe("fail");
    expect(f.affectedCount).toBe(50_001);
  });
});

describe("dependency relationships", () => {
  test("an edge is required once there is more than one component", () => {
    const document = cyclonedx();
    document.dependencies = [{ ref: "openssl", dependsOn: [] }];
    expect(assess(document).component_dependency_relationship).toBe("fail");
  });

  test("a single component has nothing to relate", () => {
    const document = cyclonedx();
    document.components = document.components.slice(0, 1);
    document.dependencies = [];
    expect(assess(document).component_dependency_relationship).toBe("pass");
  });

  test("spdx2 reads its relationship vocabulary", () => {
    const document = spdx2();
    document.relationships = [
      { spdxElementId: "SPDXRef-openssl", relationshipType: "CONTAINS", relatedSpdxElement: "SPDXRef-zlib" },
    ];
    expect(assess(document).component_dependency_relationship).toBe("pass");
  });

  test("file entries do not make an edge necessary", () => {
    const document = cyclonedx();
    document.components = document.components.slice(0, 1);
    document.components.push({ name: "uv.lock", type: "file" });
    document.dependencies = [];
    expect(assess(document).component_dependency_relationship).toBe("pass");
  });

  test("spdx2 file packages do not make an edge necessary", () => {
    const document = spdx2();
    document.packages = document.packages.slice(0, 1);
    document.packages.push({ name: "uv.lock", SPDXID: "SPDXRef-File-uv-lock" });
    document.relationships = [];
    expect(assess(document).component_dependency_relationship).toBe("pass");
  });
});

describe("malformed input", () => {
  test("JSON that is not an object is an error", () => {
    expect(counts(findings([])).error).toBe(1);
    expect(counts(cisa2026.assess({ format: "cyclonedx", specVersion: null, schemaVersion: null, data: [] as never })).error).toBe(1);
  });

  test("a format we do not recognise is an error", () => {
    const fs = findings({ hello: "world" });
    expect(counts(fs).error).toBe(1);
    expect(fs[0]!.description).toBeTruthy();
  });

  for (const junk of [null, 5, "text", { a: 1 }]) {
    test(`a field of the wrong type does not crash the run (${JSON.stringify(junk)})`, () => {
      const statuses = assess(cyclonedx({ components: junk, dependencies: junk, metadata: junk }));
      expect(new Set(Object.keys(statuses))).toEqual(new Set(ALL_ELEMENTS));
    });

    test(`a malformed spdx2 document does not crash the run (${JSON.stringify(junk)})`, () => {
      const document = spdx2({ packages: junk });
      document.creationInfo = { created: "2026-07-29T10:00:00Z", creators: junk };
      expect(new Set(Object.keys(assess(document)))).toEqual(new Set(ALL_ELEMENTS));
    });
  }

  for (const junk of [null, 5, "text"]) {
    test(`a malformed spdx3 graph does not crash the run (${JSON.stringify(junk)})`, () => {
      const fs = findings({ "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": junk });
      expect([0, 1]).toContain(counts(fs).error);
    });
  }

  test("hostile shapes everywhere never throw", () => {
    const junkValues: unknown[] = [null, true, 0, 1.5, "", "x", [], [null], {}, { a: [1] }];
    for (const junk of junkValues) {
      for (const builder of [cyclonedx, spdx2, spdx3]) {
        const base = builder();
        for (const key of Object.keys(base)) {
          const document = { ...clone(base), [key]: junk };
          expect(() => findings(document)).not.toThrow();
        }
      }
      const graph = spdx3();
      for (const e of graph["@graph"]) for (const k of Object.keys(e)) if (k !== "type") e[k] = junk;
      expect(() => findings(graph)).not.toThrow();
    }
  });
});

describe("the format claim must name the format", () => {
  for (const [version, name, number] of [
    ["SPDX-2.3", "pass", "pass"],
    ["SPDX-2.2", "pass", "pass"],
    ["SPDX", "pass", "fail"],
    ["hello", "fail", "fail"],
    ["banana7", "fail", "fail"],
    ["CycloneDX-1.6", "fail", "fail"],
  ]) {
    test(`only a value naming SPDX counts: ${version}`, () => {
      const statuses = assess(spdx2({ spdxVersion: version }));
      expect(statuses.sbom_data_format_name).toBe(name!);
      expect(statuses.sbom_data_format_version).toBe(number!);
    });
  }
});

describe("a phase is a word, not a substring", () => {
  for (const [comment, expected] of [
    ["Generated after build.", "pass"],
    ["Built during build.", "pass"],
    ["phase: post-build", "pass"],
    ["Ran debuild on this.", "fail"],
    ["This was a rebuild of the image.", "fail"],
    ["Uses a shared resource.", "fail"],
    ["Our cooperations team produced it.", "fail"],
    ["No phase here.", "fail"],
  ]) {
    test(`${comment} -> ${expected}`, () => {
      const document = spdx2();
      document.creationInfo = { ...document.creationInfo, comment };
      expect(assess(document).sbom_generation_context).toBe(expected!);
    });
  }
});

describe("spdx3 must name SPDX too", () => {
  test("the SPDX context names the format", () => {
    expect(assess(spdx3()).sbom_data_format_name).toBe("pass");
  });

  test("a context list counts", () => {
    const document = spdx3({
      "@context": ["https://spdx.org/rdf/3.0.1/spdx-context.jsonld", { "@vocab": "http://example.com/" }],
    });
    expect(assess(document).sbom_data_format_name).toBe("pass");
  });

  test("an spdxVersion counts", () => {
    const document = spdx3({ spdxVersion: "SPDX-3.0" });
    delete document["@context"];
    expect(assess(document).sbom_data_format_name).toBe("pass");
  });

  test("a document that names nothing does not pass", () => {
    const document = spdx3();
    delete document["@context"];
    expect(assess(document).sbom_data_format_name).toBe("fail");
  });

  for (const context of [
    "https://schema.org/?ref=spdx.org",
    "https://spdx.org.attacker.example/evil.jsonld",
    "https://evil.example/spdx.org/context.jsonld",
  ]) {
    test(`a URL that only mentions SPDX does not count: ${context}`, () => {
      expect(assess(spdx3({ "@context": context })).sbom_data_format_name).toBe("fail");
    });
  }

  test("a subdomain of spdx counts", () => {
    expect(assess(spdx3({ "@context": "https://raw.spdx.org/rdf/3.0.1/spdx-context.jsonld" })).sbom_data_format_name).toBe("pass");
  });

  test("JSON-LD that is not SPDX at all does not pass", () => {
    const document = { "@context": "https://schema.org", "@graph": [{ type: "Person", name: "Ada" }] };
    expect(assess(document).sbom_data_format_name).toBe("fail");
  });

  test("hostnames are read the way urllib.parse reads them", () => {
    expect(pyUrlHostname("https://SPDX.org/rdf")).toBe("spdx.org");
    expect(pyUrlHostname("https://user:pw@spdx.org:443/x")).toBe("spdx.org");
    expect(pyUrlHostname("spdx.org/rdf")).toBeNull();
    expect(pyUrlHostname("//spdx.org/rdf")).toBe("spdx.org");
    expect(pyUrlHostname("https://[::1/")).toBeNull();
    expect(pyUrlHostname("https://sp\tdx.org/")).toBe("spdx.org");
  });
});

// ---------------------------------------------------------------------------
// From test_spdx3_honest_edges.py: TestSbomTypeGenerationContext
// ---------------------------------------------------------------------------

describe("spdx3 sbomType is the generation context", () => {
  const hasContext = (...graph: Doc[]): boolean =>
    spdx3HasGenerationContext({ "@context": "https://spdx.org/rdf/3.0.1/spdx-context.jsonld", "@graph": graph });

  test("sbomType declares the context", () => {
    expect(hasContext({ type: "software_Sbom", spdxId: "urn:x:sbom", software_sbomType: ["build"] })).toBe(true);
  });

  test("an empty sbomType does not", () => {
    expect(hasContext({ type: "software_Sbom", spdxId: "urn:x:sbom", software_sbomType: [] })).toBe(false);
    expect(hasContext({ type: "software_Sbom", spdxId: "urn:x:sbom" })).toBe(false);
  });

  test("no sbom element keeps failing", () => {
    expect(hasContext({ type: "software_Package", spdxId: "urn:x:p", name: "p" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// From test_spdx3_agent_positions.py: TestTheCisa2026Plugin
// ---------------------------------------------------------------------------

describe("spdx3 agent positions", () => {
  const PERSON = { type: "Person", spdxId: "urn:someone", name: "A Person" };
  const TOOL = { type: "Tool", spdxId: "urn:tool", name: "syft 1.2.3" };
  const agents = new Map<string, Doc>([["urn:someone", PERSON]]);

  for (const [id, createdBy] of [
    ["list", ["urn:someone"]],
    ["compact string", "urn:someone"],
    ["inline object", PERSON],
    ["list of one inline object", [PERSON]],
  ] as const) {
    test(`every shape names the author (${id})`, () => {
      expect(spdx3HasAuthor({ createdBy: clone(createdBy) as never }, agents)).toBe(true);
    });
  }

  test("a software agent is the tool, not the author", () => {
    const agent = { type: "SoftwareAgent", spdxId: "urn:bot", name: "a bot" };
    expect(spdx3HasAuthor({ createdBy: agent }, new Map())).toBe(false);
  });

  for (const [id, createdUsing] of [
    ["list", ["urn:tool"]],
    ["compact string", "urn:tool"],
    ["inline object", TOOL],
  ] as const) {
    test(`every shape finds the tool (${id})`, () => {
      const found = spdx3Tools({ createdUsing: clone(createdUsing) as never }, new Map([["urn:tool", TOOL]]), new Map());
      expect(found.map((t) => t.name)).toEqual(["syft 1.2.3"]);
    });
  }

  for (const key of ["originatedBy", "suppliedBy"]) {
    for (const [id, value] of [
      ["list", ["urn:someone"]],
      ["compact string", "urn:someone"],
      ["inline object", PERSON],
    ] as const) {
      test(`every shape names the producer (${key}, ${id})`, () => {
        expect(spdx3ProducerNames({ [key]: clone(value) as never }, agents)).toEqual(["A Person"]);
      });
    }
  }

  test("NOASSERTION still counts as naming nobody explicitly", () => {
    expect(spdx3ProducerNames({ originatedBy: "NOASSERTION" }, new Map())).toEqual(["NOASSERTION"]);
  });

  test("a package naming nobody names nobody", () => {
    expect(spdx3ProducerNames({}, new Map())).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// From test_spdx3_license_resolution.py and test_spdx3_corpus.py (CISA only)
// ---------------------------------------------------------------------------

type CorpusName = keyof typeof corpus;
const fromCorpus = (name: CorpusName): Doc => clone(corpus[name]) as Doc;

const licenceStatuses = (fs: Finding[]): string[] =>
  fs.filter((f) => f.id.toLowerCase().includes("licen")).map((f) => f.status);

describe("spdx3 licence resolution", () => {
  test("a dangling licence fails", () => {
    const doc = fromCorpus("minimal_conformant");
    doc["@graph"] = doc["@graph"].filter((e: Doc) => !String(e.type ?? "").includes("License"));
    expect(licenceStatuses(findings(doc))).toContain("fail");
  });

  test("the conformant corpus still passes the licence check", () => {
    expect(licenceStatuses(findings(fromCorpus("minimal_conformant")))).not.toContain("fail");
  });
});

describe("spdx3 corpus", () => {
  const score = (doc: Doc): [number, number] => {
    const c = counts(findings(doc));
    return [c.pass!, c.fail!];
  };

  test("spec spelling beats or ties legacy", () => {
    const [specPass, specFail] = score(fromCorpus("purl_via_external_identifier_only"));
    const [legacyPass, legacyFail] = score(fromCorpus("legacy_spelling_counterpart"));
    expect(specPass).toBeGreaterThanOrEqual(legacyPass);
    expect(specFail).toBeLessThanOrEqual(legacyFail);
  });

  test("the first-class purl property scores like an identifier", () => {
    expect(score(fromCorpus("purl_via_software_package_url_only"))).toEqual(
      score(fromCorpus("purl_via_external_identifier_only")),
    );
  });

  for (const name of ["inline_agents", "software_agent_supplier", "yocto_shaped", "syft_shaped"] as const) {
    test(`every producer shape completes (${name})`, () => {
      const [p, f] = score(fromCorpus(name));
      expect(p + f).toBeGreaterThan(0);
    });
  }

  test("inline and referenced suppliers score identically", () => {
    expect(score(fromCorpus("software_agent_supplier"))).toEqual(score(fromCorpus("inline_agents")));
  });
});

// ---------------------------------------------------------------------------
// From test_spdx2_identifier_iri.py (cisa-2026 row)
// ---------------------------------------------------------------------------

describe("an SPDX 2 reference type written as an IRI", () => {
  const CPE = "cpe:2.3:*:openssl:openssl:3.2.3:*:*:*:*:*:*:*";
  const yocto = (referenceType: string): Doc => ({
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
        externalRefs: [{ referenceCategory: "SECURITY", referenceType, referenceLocator: CPE }],
      },
    ],
    relationships: [
      { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Recipe-openssl" },
    ],
  });

  test("the IRI form scores as an identifier", () => {
    expect(finding(yocto("http://spdx.org/rdf/references/cpe23Type"), "component_identifiers").status).not.toBe("fail");
  });

  test("the bare form still scores as one", () => {
    expect(finding(yocto("cpe23Type"), "component_identifiers").status).not.toBe("fail");
  });
});

// ---------------------------------------------------------------------------
// From test_cisa_integration.py: the documents the integration tests score
// ---------------------------------------------------------------------------

describe("integration fixtures", () => {
  test("a compliant CycloneDX 1.5 document passes all seventeen", () => {
    const fs = findings({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      version: 1,
      signature: { algorithm: "RS512", value: "signed" },
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
    });
    expect(counts(fs).fail).toBe(0);
    expect(counts(fs).pass).toBe(17);
  });

  test("a non-compliant document fails", () => {
    const fs = findings({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: [{ name: "example-component" }],
      metadata: {},
    });
    expect(counts(fs).fail).toBeGreaterThan(0);
  });

  test("a document missing the new elements fails each of them", () => {
    const fs = findings({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      components: [
        {
          name: "example-component",
          version: "1.0.0",
          publisher: "Example Corp",
          purl: "pkg:pypi/example-component@1.0.0",
        },
      ],
      dependencies: [{ ref: "pkg:pypi/example-component@1.0.0", dependsOn: [] }],
      metadata: { authors: [{ name: "Example Developer" }], timestamp: "2023-01-01T00:00:00Z" },
    });
    const failed = fs.filter((f) => f.status === "fail").map((f) => f.id);
    for (const id of [
      "cisa-2026:component-hash-value",
      "cisa-2026:component-hash-algorithm",
      "cisa-2026:component-license",
      "cisa-2026:sbom-tool-name",
      "cisa-2026:sbom-generation-context",
    ]) {
      expect(failed).toContain(id);
    }
  });
});
