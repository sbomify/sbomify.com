/**
 * Ports of the sbomify tests for `_spdx3_helpers.py`:
 * test_spdx3_helpers.py, test_spdx3_agent_positions.py,
 * test_spdx3_field_fixes.py, test_spdx3_honest_edges.py and
 * test_spdx3_license_resolution.py.
 *
 * Assertions on plugins not ported here (BSI, CISA 2026, FDA, OSV, the
 * sboms schema and sboms utils) are left out; the licence-dangling case is
 * asserted against CISA 2025 instead, which reads the same helper.
 */

import { describe, expect, test } from "bun:test";
import type { JsonObject } from "../src/types";
import {
  extractSpdx3Elements,
  extractSpdx3Licenses,
  getSpdx3CreationInfoFields,
  getSpdx3PackageFields,
  getSpdx3PackageLicense,
  hasSpdx3Supplier,
  isSpdx3,
  resolveSpdx3Agent,
  resolveSpdx3LicenseExpression,
  spdx3PackagePurl,
  spdx3Refs,
  type Spdx3ElementMap,
} from "../src/frameworks/spdx3-helpers";
import { cisa2025 } from "../src/frameworks/cisa-2025";
import { run } from "./helpers";

const CONTEXT = "https://spdx.org/rdf/3.0.1/spdx-context.jsonld";

function graph(...elements: JsonObject[]): JsonObject {
  return { "@context": CONTEXT, "@graph": elements };
}

function agentMap(obj: Record<string, JsonObject>): Spdx3ElementMap {
  return new Map(Object.entries(obj));
}

// ---------------------------------------------------------------------------
// test_spdx3_helpers.py
// ---------------------------------------------------------------------------

describe("TestAgentRouting", () => {
  const agentsFor = (elemType: string): Spdx3ElementMap => {
    const doc = graph({ type: elemType, spdxId: "urn:agent", name: "ACME" });
    return extractSpdx3Elements(doc)[3];
  };

  test("person and organization still route", () => {
    expect(agentsFor("Person").get("urn:agent")?.name).toBe("ACME");
    expect(agentsFor("Organization").get("urn:agent")?.name).toBe("ACME");
  });

  test("software agent is an agent", () => {
    expect(agentsFor("SoftwareAgent").get("urn:agent")?.name).toBe("ACME");
  });

  test("bare agent is an agent", () => {
    expect(agentsFor("Agent").get("urn:agent")?.name).toBe("ACME");
  });

  test("tool stays a tool", () => {
    const doc = graph({ type: "Tool", spdxId: "urn:t", name: "syft" });
    const [, , , agents, tools] = extractSpdx3Elements(doc);
    expect(tools.get("urn:t")?.name).toBe("syft");
    expect(agents.has("urn:t")).toBe(false);
  });

  test("software agent in createdUsing still resolves", () => {
    const doc = graph(
      { type: "SoftwareAgent", spdxId: "urn:sa", name: "sbomify-action-1.0" },
      { type: "CreationInfo", spdxId: "urn:ci", createdUsing: ["urn:sa"] },
    );
    const [creationInfo, , , agents, tools] = extractSpdx3Elements(doc);
    const fields = getSpdx3CreationInfoFields(creationInfo, agents, tools);
    expect(fields.toolEntries).toContain("sbomify-action-1.0");
  });
});

describe("TestResolveAgent", () => {
  const AGENTS = agentMap({ "urn:org": { type: "Organization", name: "ACME" } });

  test("string ref resolves through the map", () => {
    expect(resolveSpdx3Agent("urn:org", AGENTS).name).toBe("ACME");
  });

  test("inline dict passes through", () => {
    const inline = { type: "Organization", name: "Inline Corp" };
    expect(resolveSpdx3Agent(inline, AGENTS)).toBe(inline);
  });

  test("SpdxOrganization literal is the SPDX agent", () => {
    expect(resolveSpdx3Agent("SpdxOrganization", AGENTS).name).toBe("SPDX");
  });

  test("unknown ref is empty", () => {
    expect(resolveSpdx3Agent("urn:missing", AGENTS)).toEqual({});
    expect(resolveSpdx3Agent(null, AGENTS)).toEqual({});
  });

  test("inline agent in createdBy does not crash", () => {
    const creationInfo = { type: "CreationInfo", createdBy: [{ type: "Organization", name: "Inline Corp" }] };
    const fields = getSpdx3CreationInfoFields(creationInfo, new Map());
    expect(fields.creators).toContain("Inline Corp");
  });
});

describe("TestSpecFieldNames", () => {
  test("software_packageUrl alone is a unique id", () => {
    const pkg = { type: "software_Package", name: "p", software_packageUrl: "pkg:pypi/p@1.0" };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
    expect(spdx3PackagePurl(pkg)).toBe("pkg:pypi/p@1.0");
  });

  test("singular externalIdentifier with spec casing", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      externalIdentifier: [{ externalIdentifierType: "packageUrl", identifier: "pkg:pypi/p@1.0" }],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
    expect(spdx3PackagePurl(pkg)).toBe("pkg:pypi/p@1.0");
  });

  test("legacy plural and uppercase still accepted", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      externalIdentifiers: [{ externalIdentifierType: "packageURL", identifier: "pkg:pypi/p@1.0" }],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
    expect(spdx3PackagePurl(pkg)).toBe("pkg:pypi/p@1.0");
  });

  test("purl type variant accepted", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      externalIdentifier: [{ externalIdentifierType: "purl", identifier: "pkg:pypi/p@1.0" }],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
  });

  test("no identifier still fails", () => {
    expect(getSpdx3PackageFields({ type: "software_Package", name: "p" }).hasUniqueId).toBe(false);
    expect(spdx3PackagePurl({ type: "software_Package", name: "p" })).toBeNull();
  });

  test("creator email via singular externalIdentifier", () => {
    const creationInfo = { type: "CreationInfo", createdBy: ["urn:p"] };
    const agents = agentMap({
      "urn:p": {
        type: "Person",
        name: "Jane",
        externalIdentifier: [{ externalIdentifierType: "email", identifier: "jane@acme.test" }],
      },
    });
    expect(getSpdx3CreationInfoFields(creationInfo, agents).creators).toContain("jane@acme.test");
  });
});

describe("TestSupplierResolution", () => {
  test("string ref to known agent", () => {
    expect(hasSpdx3Supplier(["urn:org"], agentMap({ "urn:org": { name: "ACME" } }))).toBe(true);
  });

  test("inline agent dict counts", () => {
    expect(hasSpdx3Supplier([{ type: "Organization", name: "Inline" }], new Map())).toBe(true);
  });

  test("unknown ref does not", () => {
    expect(hasSpdx3Supplier(["urn:nope"], new Map())).toBe(false);
    expect(hasSpdx3Supplier([], agentMap({ "urn:org": { name: "ACME" } }))).toBe(false);
  });
});

describe("TestHostileGraphEntries", () => {
  test("non-dict and null type entries are skipped", () => {
    const doc = {
      "@context": CONTEXT,
      "@graph": [42, "not-an-element", { type: null, spdxId: "urn:x" }, { type: "Person", spdxId: "urn:p", name: "Jane" }],
    };
    const agents = extractSpdx3Elements(doc)[3];
    expect(agents.get("urn:p")?.name).toBe("Jane");
  });

  test("null graph yields empty extraction", () => {
    const [creationInfo, packages, relationships, agents, tools] = extractSpdx3Elements({ "@graph": null });
    expect(creationInfo).toBeNull();
    expect(packages).toEqual([]);
    expect(relationships).toEqual([]);
    expect(agents.size).toBe(0);
    expect(tools.size).toBe(0);
  });
});

describe("TestContentAddressableIdentifiers", () => {
  test("gitoid external identifier counts", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      externalIdentifier: [{ externalIdentifierType: "gitoid", identifier: "gitoid:blob:sha256:abc123" }],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
  });

  test("swhid external identifier counts", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      externalIdentifier: [
        { externalIdentifierType: "swhid", identifier: "swh:1:rel:22ece559cc7cc2364edc5e5593d63ae8bd229f9f" },
      ],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
  });

  test("content identifier property counts", () => {
    const pkg = {
      type: "software_Package",
      name: "p",
      software_contentIdentifier: [
        {
          type: "software_ContentIdentifier",
          software_contentIdentifierType: "swhid",
          software_contentIdentifierValue: "swh:1:cnt:94a9ed024d3859793618152ea559a168bbcbb5e2",
        },
      ],
    };
    expect(getSpdx3PackageFields(pkg).hasUniqueId).toBe(true);
  });

  test("empty or malformed content identifier does not", () => {
    expect(
      getSpdx3PackageFields({ type: "software_Package", name: "p", software_contentIdentifier: [] }).hasUniqueId,
    ).toBe(false);
    expect(
      getSpdx3PackageFields({ type: "software_Package", name: "p", software_contentIdentifier: "not-a-list" })
        .hasUniqueId,
    ).toBe(false);
  });
});

describe("externalIdentifiers field (TS divergence: a full array, not a consumed generator)", () => {
  test("lists every identifier under both spellings", () => {
    const fields = getSpdx3PackageFields({
      externalIdentifier: [{ externalIdentifierType: "purl", identifier: "a" }, "junk"],
      externalIdentifiers: [{ externalIdentifierType: "cpe23", identifier: "b" }],
    });
    expect(fields.externalIdentifiers.map((e) => e.identifier)).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// test_spdx3_agent_positions.py
// ---------------------------------------------------------------------------

const EMAIL = "releases@acme.test";
const ACME: JsonObject = {
  type: "Organization",
  spdxId: "urn:acme",
  name: "Acme",
  externalIdentifier: [{ externalIdentifierType: "email", identifier: EMAIL }],
};

describe("TestSpdx3Refs", () => {
  test("a list passes through", () => {
    expect(spdx3Refs(["urn:a", "urn:b"])).toEqual(["urn:a", "urn:b"]);
  });

  test("a bare string is a singleton", () => {
    expect(spdx3Refs("urn:acme")).toEqual(["urn:acme"]);
  });

  test("an inline object is a singleton", () => {
    const agent = { type: "Organization", name: "Acme" };
    expect(spdx3Refs(agent)).toEqual([agent]);
  });

  test("a missing field resolves nobody", () => {
    expect(spdx3Refs(null)).toEqual([]);
  });

  for (const hostile of [0, 1.5, true]) {
    test(`a hostile scalar resolves nobody (${hostile})`, () => {
      expect(spdx3Refs(hostile)).toEqual([]);
    });
  }
});

describe("TestSupplierOnAPackage", () => {
  test("a list originatedBy finds the supplier", () => {
    const fields = getSpdx3PackageFields({ name: "acl", originatedBy: ["urn:acme"] });
    expect(hasSpdx3Supplier(fields.supplierRefs, agentMap({ "urn:acme": ACME }))).toBe(true);
  });

  test("a compact originatedBy finds the same supplier", () => {
    const fields = getSpdx3PackageFields({ name: "acl", originatedBy: "urn:acme" });
    expect(hasSpdx3Supplier(fields.supplierRefs, agentMap({ "urn:acme": ACME }))).toBe(true);
  });

  test("an inline agent finds the supplier", () => {
    const fields = getSpdx3PackageFields({ name: "acl", originatedBy: ACME });
    expect(hasSpdx3Supplier(fields.supplierRefs, new Map())).toBe(true);
  });

  test("a compact suppliedBy is the fallback", () => {
    const fields = getSpdx3PackageFields({ name: "acl", suppliedBy: "urn:acme" });
    expect(hasSpdx3Supplier(fields.supplierRefs, agentMap({ "urn:acme": ACME }))).toBe(true);
  });

  test("no supplier field finds nobody", () => {
    const fields = getSpdx3PackageFields({ name: "acl" });
    expect(hasSpdx3Supplier(fields.supplierRefs, agentMap({ "urn:acme": ACME }))).toBe(false);
  });
});

describe("TestToolsOnCreationInfo", () => {
  const TOOL: JsonObject = { type: "Tool", spdxId: "urn:tool", name: "sbomify-action-1.2.3" };

  test("a list createdUsing reads the tool", () => {
    const fields = getSpdx3CreationInfoFields({ createdUsing: ["urn:tool"] }, new Map(), agentMap({ "urn:tool": TOOL }));
    expect(fields.toolEntries).toEqual(["sbomify-action-1.2.3"]);
  });

  test("a compact createdUsing reads the same tool", () => {
    const fields = getSpdx3CreationInfoFields({ createdUsing: "urn:tool" }, new Map(), agentMap({ "urn:tool": TOOL }));
    expect(fields.toolEntries).toEqual(["sbomify-action-1.2.3"]);
  });

  test("an inline tool reads its name", () => {
    const fields = getSpdx3CreationInfoFields({ createdUsing: TOOL }, new Map(), new Map());
    expect(fields.toolEntries).toEqual(["sbomify-action-1.2.3"]);
  });

  test("an unresolvable ref is kept as itself", () => {
    const fields = getSpdx3CreationInfoFields({ createdUsing: "urn:unknown" }, new Map(), new Map());
    expect(fields.toolEntries).toEqual(["urn:unknown"]);
  });
});

// ---------------------------------------------------------------------------
// test_spdx3_honest_edges.py
// ---------------------------------------------------------------------------

describe("TestOneDetector", () => {
  test("bare graph document is spdx3", () => {
    expect(isSpdx3({ "@graph": [{ type: "software_Package", name: "p" }] })).toBe(true);
  });

  test("any 3.x context is spdx3", () => {
    expect(isSpdx3({ "@context": "https://spdx.org/rdf/3.1.0/spdx-context.jsonld" })).toBe(true);
  });

  test("cyclonedx is not", () => {
    expect(isSpdx3({ bomFormat: "CycloneDX", specVersion: "1.6" })).toBe(false);
  });

  test("spdx2 is not", () => {
    expect(isSpdx3({ spdxVersion: "SPDX-2.3", packages: [] })).toBe(false);
  });

  test("non-list graph is not spdx3", () => {
    expect(isSpdx3({ "@graph": "not-a-list" })).toBe(false);
    expect(isSpdx3({ "@graph": 42 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// test_spdx3_license_resolution.py
// ---------------------------------------------------------------------------

const EXPRESSION: JsonObject = {
  type: "simplelicensing_LicenseExpression",
  spdxId: "urn:acme:lic1",
  simplelicensing_licenseExpression: "Apache-2.0 OR MIT",
};
const LISTED: JsonObject = {
  type: "expandedlicensing_ListedLicense",
  spdxId: "https://spdx.org/licenses/MIT",
  name: "MIT",
};
const NOASSERTION: JsonObject = {
  type: "expandedlicensing_NoAssertionLicense",
  spdxId: "urn:acme:noassert",
};

describe("TestResolver", () => {
  test("license expression resolves to its expression", () => {
    const licenses = extractSpdx3Licenses(graph(EXPRESSION));
    expect(resolveSpdx3LicenseExpression("urn:acme:lic1", licenses)).toBe("Apache-2.0 OR MIT");
  });

  test("listed license resolves to its name", () => {
    const licenses = extractSpdx3Licenses(graph(LISTED));
    expect(resolveSpdx3LicenseExpression("https://spdx.org/licenses/MIT", licenses)).toBe("MIT");
  });

  test("SPDX listed URL without an element resolves to the id tail", () => {
    expect(resolveSpdx3LicenseExpression("https://spdx.org/licenses/BSD-3-Clause", new Map())).toBe("BSD-3-Clause");
  });

  test("NoAssertion resolves to nothing", () => {
    const licenses = extractSpdx3Licenses(graph(NOASSERTION));
    expect(resolveSpdx3LicenseExpression("urn:acme:noassert", licenses)).toBeNull();
  });

  test("dangling reference resolves to nothing", () => {
    expect(resolveSpdx3LicenseExpression("urn:acme:missing", new Map())).toBeNull();
  });

  test("inline target resolves without a graph element", () => {
    expect(resolveSpdx3LicenseExpression({ ...EXPRESSION }, new Map())).toBe("Apache-2.0 OR MIT");
  });
});

describe("TestCompoundShapes", () => {
  const APACHE: JsonObject = {
    type: "expandedlicensing_ListedLicense",
    spdxId: "https://spdx.org/licenses/Apache-2.0",
    name: "Apache-2.0",
  };
  const GPL: JsonObject = {
    type: "expandedlicensing_ListedLicense",
    spdxId: "https://spdx.org/licenses/GPL-2.0-only",
    name: "GPL-2.0-only",
  };
  const EXCEPTION: JsonObject = {
    type: "expandedlicensing_ListedLicenseException",
    spdxId: "urn:acme:classpath",
    name: "Classpath-exception-2.0",
  };

  test("conjunctive set joins with AND", () => {
    const conj = {
      type: "expandedlicensing_ConjunctiveLicenseSet",
      spdxId: "urn:acme:conj",
      expandedlicensing_member: [LISTED.spdxId!, APACHE.spdxId!],
    };
    const licenses = extractSpdx3Licenses(graph(conj, LISTED, APACHE));
    expect(resolveSpdx3LicenseExpression("urn:acme:conj", licenses)).toBe("MIT AND Apache-2.0");
  });

  test("nested set is parenthesized", () => {
    const disj = {
      type: "expandedlicensing_DisjunctiveLicenseSet",
      spdxId: "urn:acme:disj",
      expandedlicensing_member: [LISTED.spdxId!, APACHE.spdxId!],
    };
    const conj = {
      type: "expandedlicensing_ConjunctiveLicenseSet",
      spdxId: "urn:acme:conj",
      expandedlicensing_member: ["urn:acme:disj", GPL.spdxId!],
    };
    const licenses = extractSpdx3Licenses(graph(conj, disj, LISTED, APACHE, GPL));
    expect(resolveSpdx3LicenseExpression("urn:acme:conj", licenses)).toBe("(MIT OR Apache-2.0) AND GPL-2.0-only");
  });

  test("or-later appends plus", () => {
    const later = {
      type: "expandedlicensing_OrLaterOperator",
      spdxId: "urn:acme:later",
      expandedlicensing_subjectLicense: GPL.spdxId!,
    };
    const licenses = extractSpdx3Licenses(graph(later, GPL));
    expect(resolveSpdx3LicenseExpression("urn:acme:later", licenses)).toBe("GPL-2.0-only+");
  });

  test("with-addition names the exception", () => {
    const withOp = {
      type: "expandedlicensing_WithAdditionOperator",
      spdxId: "urn:acme:with",
      expandedlicensing_subjectLicense: GPL.spdxId!,
      expandedlicensing_subjectAddition: "urn:acme:classpath",
    };
    const licenses = extractSpdx3Licenses(graph(withOp, GPL, EXCEPTION));
    expect(resolveSpdx3LicenseExpression("urn:acme:with", licenses)).toBe("GPL-2.0-only WITH Classpath-exception-2.0");
  });

  test("a set with an unresolvable member resolves to nothing", () => {
    const conj = {
      type: "expandedlicensing_ConjunctiveLicenseSet",
      spdxId: "urn:acme:conj",
      expandedlicensing_member: [LISTED.spdxId!, "urn:acme:missing"],
    };
    const licenses = extractSpdx3Licenses(graph(conj, LISTED));
    expect(resolveSpdx3LicenseExpression("urn:acme:conj", licenses)).toBeNull();
  });

  test("a spoofed licenses URL does not resolve", () => {
    expect(resolveSpdx3LicenseExpression("https://evil.example/spdx.org/licenses/MIT", new Map())).toBeNull();
    expect(resolveSpdx3LicenseExpression("https://spdx.org.evil.example/licenses/MIT", new Map())).toBeNull();
    expect(resolveSpdx3LicenseExpression("https://spdx.org/licenses/", new Map())).toBeNull();
  });

  test("a named SimpleLicensingText resolves to its name; a nameless one to its id", () => {
    const named: JsonObject = {
      type: "simplelicensing_SimpleLicensingText",
      spdxId: "urn:acme:freetext",
      name: "Acme Proprietary 1.0",
      simplelicensing_licenseText: "You may...",
    };
    let licenses = extractSpdx3Licenses(graph(named));
    expect(resolveSpdx3LicenseExpression("urn:acme:freetext", licenses)).toBe("Acme Proprietary 1.0");

    const nameless: JsonObject = { ...named };
    delete nameless.name;
    nameless.spdxId = "urn:acme:nameless";
    licenses = extractSpdx3Licenses(graph(nameless));
    expect(resolveSpdx3LicenseExpression("urn:acme:nameless", licenses)).toBe("urn:acme:nameless");
  });

  test("compact IRI types are collected and resolved", () => {
    const expr = {
      type: "simplelicensing:LicenseExpression",
      spdxId: "urn:acme:compact",
      simplelicensing_licenseExpression: "BSD-2-Clause",
    };
    const noassert = { type: "expandedlicensing:NoAssertionLicense", spdxId: "urn:acme:na" };
    const licenses = extractSpdx3Licenses(graph(expr, noassert));
    expect(resolveSpdx3LicenseExpression("urn:acme:compact", licenses)).toBe("BSD-2-Clause");
    expect(resolveSpdx3LicenseExpression("urn:acme:na", licenses)).toBeNull();
  });

  test("a self-citing set terminates", () => {
    const conj = {
      type: "expandedlicensing_ConjunctiveLicenseSet",
      spdxId: "urn:acme:conj",
      expandedlicensing_member: ["urn:acme:conj", LISTED.spdxId!],
    };
    const licenses = extractSpdx3Licenses(graph(conj, LISTED));
    expect(resolveSpdx3LicenseExpression("urn:acme:conj", licenses)).toBeNull();
  });
});

describe("TestPackageLicense", () => {
  test("declared license resolves through the relationship", () => {
    const pkg = { type: "software_Package", spdxId: "urn:acme:pkg1", name: "my-app" };
    const relationships = [
      { type: "Relationship", relationshipType: "hasDeclaredLicense", from: "urn:acme:pkg1", to: ["urn:acme:lic1"] },
    ];
    const licenses = extractSpdx3Licenses(graph(EXPRESSION));
    expect(getSpdx3PackageLicense(pkg, relationships, licenses, "hasDeclaredLicense")).toBe("Apache-2.0 OR MIT");
  });

  test("relationship to nothing resolvable yields null", () => {
    const pkg = { type: "software_Package", spdxId: "urn:acme:pkg1", name: "my-app" };
    const relationships = [
      { type: "Relationship", relationshipType: "hasConcludedLicense", from: "urn:acme:pkg1", to: ["urn:acme:missing"] },
    ];
    expect(getSpdx3PackageLicense(pkg, relationships, new Map(), "hasConcludedLicense")).toBeNull();
  });
});

/** spdx3_corpus.minimal_conformant() */
function minimalConformant(): JsonObject {
  const CI = "_:creationinfo";
  const rel = (relType: string, spdxId: string): JsonObject => ({
    type: "Relationship",
    spdxId,
    creationInfo: CI,
    relationshipType: relType,
    from: "urn:acme:pkg1",
    to: ["urn:acme:lic1"],
  });
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        type: "CreationInfo",
        "@id": CI,
        specVersion: "3.0.1",
        created: "2026-08-01T00:00:00Z",
        createdBy: ["urn:acme:agent"],
        createdUsing: ["urn:acme:tool"],
      },
      {
        type: "Person",
        spdxId: "urn:acme:agent",
        creationInfo: CI,
        name: "Jane Doe",
        externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: "jane@acme.test" }],
      },
      { type: "Tool", spdxId: "urn:acme:tool", creationInfo: CI, name: "sbomify-action-1.2.3" },
      {
        type: "SpdxDocument",
        spdxId: "urn:acme:doc",
        creationInfo: CI,
        rootElement: ["urn:acme:pkg1"],
        profileConformance: ["core", "software"],
      },
      {
        type: "software_Package",
        spdxId: "urn:acme:pkg1",
        creationInfo: CI,
        name: "my-app",
        software_packageVersion: "1.2.3",
        software_downloadLocation: "https://downloads.acme.test/my-app-1.2.3.tar.gz",
        verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "a".repeat(64) }],
        externalRef: [{ type: "ExternalRef", externalRefType: "vcs", locator: ["https://github.com/acme/my-app"] }],
        validUntilTime: "2030-01-01T00:00:00Z",
        originatedBy: ["urn:acme:agent"],
        software_packageUrl: "pkg:pypi/my-app@1.2.3",
      },
      {
        type: "simplelicensing_LicenseExpression",
        spdxId: "urn:acme:lic1",
        creationInfo: CI,
        simplelicensing_licenseExpression: "MIT",
      },
      rel("hasConcludedLicense", "urn:acme:rel1"),
      rel("hasDeclaredLicense", "urn:acme:rel2"),
    ],
  };
}

describe("TestPluginsFailOnDanglingLicence (asserted on CISA 2025)", () => {
  const licenceStatuses = (data: JsonObject): string[] =>
    run(cisa2025, data)
      .findings.filter((f) => f.id.toLowerCase().includes("licen"))
      .map((f) => f.status);

  test("CISA 2025 licence check fails on a dangling licence", () => {
    const doc = minimalConformant();
    doc["@graph"] = (doc["@graph"] as JsonObject[]).filter((e) => !String(e.type ?? "").includes("License"));
    expect(licenceStatuses(doc)).toContain("fail");
  });

  test("conformant corpus still passes the licence check", () => {
    expect(licenceStatuses(minimalConformant())).not.toContain("fail");
  });
});

describe("TestThePackageIdIsReadHonestly", () => {
  const rels = [{ from: "urn:pkg", relationshipType: "hasDeclaredLicense", to: ["urn:lic"] }];
  const lics = new Map<string, JsonObject>([
    ["urn:lic", { type: "expandedlicensing_ListedLicense", spdxId: "https://spdx.org/licenses/MIT" }],
  ]);

  test("an id given only as @id resolves", () => {
    expect(getSpdx3PackageLicense({ "@id": "urn:pkg" }, rels, lics, "hasDeclaredLicense")).toBe("MIT");
  });

  test("a null spdxId falls back to @id", () => {
    expect(getSpdx3PackageLicense({ spdxId: null, "@id": "urn:pkg" }, rels, lics, "hasDeclaredLicense")).toBe("MIT");
  });

  test("an id that is not a string resolves to nothing", () => {
    expect(getSpdx3PackageLicense({ spdxId: { nested: "urn:pkg" } }, rels, lics, "hasDeclaredLicense")).toBeNull();
  });
});
