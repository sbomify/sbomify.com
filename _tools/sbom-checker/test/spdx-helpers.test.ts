/**
 * Ports of the sbomify helper tests:
 *   test_spdx_shared.py, test_spdx2_identifier_iri.py,
 *   test_spdx2_yocto_source_download.py, test_spdx3_corpus.py
 * plus unit checks for the Python-semantics helpers in util.ts.
 *
 * Plugin-parametrised Python tests run here against the ported frameworks
 * only (NTIA 2021, CISA 2025); the cisa-2026, BSI and FDA parameters are
 * covered by those frameworks' own ports.
 */

import { describe, expect, test } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Finding, Framework } from "../src/types";
import { cisa2025 } from "../src/frameworks/cisa-2025";
import { ntia2021 } from "../src/frameworks/ntia-2021";
import {
  iterSpdx3Elements,
  spdx2AnnotationTargetsDocument,
  spdx2RootSpdxid,
  spdx2YoctoSourceDownloads,
  spdx3AnnotationSubjectMatches,
  spdx3DocumentSubjects,
} from "../src/frameworks/spdx-shared";
import { isValidIsoTimestamp, pySplit, pyStr, pyStrip, truthy } from "../src/frameworks/util";
import * as corpus from "./spdx3-corpus";
import { run } from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = Record<string, any>;

const types = (data: unknown): unknown[] => [...iterSpdx3Elements(data)].map((e) => e.type);

// ============================================================================
// spdx2RootSpdxid
// ============================================================================

describe("spdx2RootSpdxid", () => {
  test("documentDescribes wins", () => {
    expect(spdx2RootSpdxid({ documentDescribes: ["SPDXRef-Package-Primary"] })).toBe("SPDXRef-Package-Primary");
  });

  test("DESCRIBES relationship fallback", () => {
    const data = {
      relationships: [
        { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Package-Root" },
      ],
    };
    expect(spdx2RootSpdxid(data)).toBe("SPDXRef-Package-Root");
  });

  test("relationshipType matched case-insensitively", () => {
    const data = {
      relationships: [
        { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "describes", relatedSpdxElement: "SPDXRef-Package-X" },
      ],
    };
    expect(spdx2RootSpdxid(data)).toBe("SPDXRef-Package-X");
  });

  test("no root returns null", () => {
    expect(spdx2RootSpdxid({})).toBeNull();
  });

  test("empty documentDescribes falls back to relationships", () => {
    const data = {
      documentDescribes: [],
      relationships: [{ spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Pkg" }],
    };
    expect(spdx2RootSpdxid(data)).toBe("SPDXRef-Pkg");
  });

  test("non-string documentDescribes entries ignored", () => {
    expect(spdx2RootSpdxid({ documentDescribes: [null, { oops: "not-a-ref" }, 42] })).toBeNull();
  });

  test.each([["not-a-list"], [{ dict: "not-list" }], [null], [42]])("malformed relationships %p do not raise", (rels) => {
    expect(spdx2RootSpdxid({ relationships: rels })).toBeNull();
  });

  test("non-dict relationship entries skipped", () => {
    const data = {
      relationships: [
        "not-a-dict",
        null,
        { spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-Pkg" },
      ],
    };
    expect(spdx2RootSpdxid(data)).toBe("SPDXRef-Pkg");
  });

  test("non-DESCRIBES relationships ignored", () => {
    const data = {
      relationships: [{ spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-Pkg" }],
    };
    expect(spdx2RootSpdxid(data)).toBeNull();
  });
});

// ============================================================================
// spdx2AnnotationTargetsDocument
// ============================================================================

describe("spdx2AnnotationTargetsDocument", () => {
  test("explicit SPDXRef-DOCUMENT", () => {
    expect(spdx2AnnotationTargetsDocument({ spdxElementId: "SPDXRef-DOCUMENT" }, null)).toBe(true);
  });

  test("explicit match to root", () => {
    expect(spdx2AnnotationTargetsDocument({ spdxElementId: "SPDXRef-Pkg-Root" }, "SPDXRef-Pkg-Root")).toBe(true);
  });

  test("explicit match to non-root rejected", () => {
    expect(spdx2AnnotationTargetsDocument({ spdxElementId: "SPDXRef-Pkg-Dep" }, "SPDXRef-Pkg-Root")).toBe(false);
  });

  test("empty subject with root accepted", () => {
    expect(spdx2AnnotationTargetsDocument({ spdxElementId: "" }, "SPDXRef-Pkg-Root")).toBe(true);
  });

  test("empty subject without root rejected", () => {
    expect(spdx2AnnotationTargetsDocument({ spdxElementId: "" }, null)).toBe(false);
  });

  test("missing subject treated as empty", () => {
    expect(spdx2AnnotationTargetsDocument({}, "SPDXRef-Root")).toBe(true);
    expect(spdx2AnnotationTargetsDocument({}, null)).toBe(false);
  });

  test("non-string subject rejected", () => {
    for (const bad of [null, 42, ["ref"], { dict: "nope" }]) {
      expect(spdx2AnnotationTargetsDocument({ spdxElementId: bad }, "SPDXRef-Root")).toBe(false);
    }
  });

  test("non-dict annotation rejected without raising", () => {
    for (const bad of [null, "x", 42, []]) expect(spdx2AnnotationTargetsDocument(bad, "SPDXRef-Root")).toBe(false);
  });
});

// ============================================================================
// spdx3DocumentSubjects
// ============================================================================

describe("spdx3DocumentSubjects", () => {
  test("canonical graph", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({
      "@graph": [{ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: ["SPDXRef-Pkg-1"] }],
    });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
    expect(rootIds).toEqual(new Set(["SPDXRef-Pkg-1"]));
  });

  test("legacy elements alias", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({
      elements: [{ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: ["SPDXRef-Pkg"] }],
    });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
    expect(rootIds).toEqual(new Set(["SPDXRef-Pkg"]));
  });

  test("@id fallback for spdxId", () => {
    const [docIds] = spdx3DocumentSubjects({ "@graph": [{ "@type": "SpdxDocument", "@id": "SPDXRef-Document" }] });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
  });

  test("rootElement as bare string normalised", () => {
    const [, rootIds] = spdx3DocumentSubjects({
      "@graph": [{ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: "SPDXRef-Pkg-1" }],
    });
    expect(rootIds).toEqual(new Set(["SPDXRef-Pkg-1"]));
  });

  test("multiple SpdxDocument entries merged", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({
      "@graph": [
        { type: "SpdxDocument", spdxId: "SPDXRef-Document-A", rootElement: ["SPDXRef-Pkg-A"] },
        { type: "SpdxDocument", spdxId: "SPDXRef-Document-B", rootElement: ["SPDXRef-Pkg-B"] },
      ],
    });
    expect(docIds).toEqual(new Set(["SPDXRef-Document-A", "SPDXRef-Document-B"]));
    expect(rootIds).toEqual(new Set(["SPDXRef-Pkg-A", "SPDXRef-Pkg-B"]));
  });

  test("no SpdxDocument returns empty sets", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({ "@graph": [{ type: "software_Package", spdxId: "SPDXRef-Pkg" }] });
    expect(docIds).toEqual(new Set());
    expect(rootIds).toEqual(new Set());
  });

  test("SpdxDocument without rootElement still yields doc id", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({ "@graph": [{ type: "SpdxDocument", spdxId: "SPDXRef-Document" }] });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
    expect(rootIds).toEqual(new Set());
  });

  test.each([["a-string"], [42], [null], [true]])("non-list @graph %p returns empty", (graph) => {
    expect(spdx3DocumentSubjects({ "@graph": graph })).toEqual([new Set(), new Set()]);
  });

  test("non-dict entry skipped", () => {
    const [docIds] = spdx3DocumentSubjects({
      "@graph": ["not-a-dict", null, { type: "SpdxDocument", spdxId: "SPDXRef-Document" }],
    });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
  });

  test("non-list rootElement skipped without crash", () => {
    const [docIds, rootIds] = spdx3DocumentSubjects({
      "@graph": [{ type: "SpdxDocument", spdxId: "SPDXRef-Document", rootElement: 42 }],
    });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
    expect(rootIds).toEqual(new Set());
  });

  test("non-string rootElement entries skipped", () => {
    const [, rootIds] = spdx3DocumentSubjects({
      "@graph": [
        {
          type: "SpdxDocument",
          spdxId: "SPDXRef-Document",
          rootElement: [null, 42, { nested: "dict" }, "", "SPDXRef-Valid"],
        },
      ],
    });
    expect(rootIds).toEqual(new Set(["SPDXRef-Valid"]));
  });

  test("single-node @graph accepted", () => {
    const [docIds] = spdx3DocumentSubjects({ "@graph": { type: "SpdxDocument", spdxId: "SPDXRef-Document" } });
    expect(docIds).toEqual(new Set(["SPDXRef-Document"]));
  });
});

// ============================================================================
// spdx3AnnotationSubjectMatches
// ============================================================================

describe("spdx3AnnotationSubjectMatches", () => {
  const docIds = new Set(["SPDXRef-Document"]);
  const rootIds = new Set(["SPDXRef-Pkg-Root"]);

  test("subject matches document id", () => {
    expect(spdx3AnnotationSubjectMatches({ subject: "SPDXRef-Document" }, docIds, rootIds)).toBe(true);
  });

  test("subject matches rootElement", () => {
    expect(spdx3AnnotationSubjectMatches({ subject: "SPDXRef-Pkg-Root" }, docIds, rootIds)).toBe(true);
  });

  test("subject matching a package rejected", () => {
    expect(spdx3AnnotationSubjectMatches({ subject: "SPDXRef-Pkg-Dep" }, docIds, rootIds)).toBe(false);
  });

  test("empty subject with root accepted", () => {
    expect(spdx3AnnotationSubjectMatches({ subject: "" }, docIds, rootIds)).toBe(true);
  });

  test("empty subject without root rejected", () => {
    expect(spdx3AnnotationSubjectMatches({ subject: "" }, docIds, new Set())).toBe(false);
  });

  test("missing subject treated as empty", () => {
    expect(spdx3AnnotationSubjectMatches({}, docIds, rootIds)).toBe(true);
    expect(spdx3AnnotationSubjectMatches({}, docIds, new Set())).toBe(false);
  });

  test("annotationSubject alias", () => {
    expect(spdx3AnnotationSubjectMatches({ annotationSubject: "SPDXRef-Document" }, docIds, rootIds)).toBe(true);
  });

  test("non-string subject rejected", () => {
    for (const bad of [null, 42, ["ref"], { k: "v" }]) {
      expect(spdx3AnnotationSubjectMatches({ subject: bad }, docIds, rootIds)).toBe(false);
    }
  });
});

// ============================================================================
// iterSpdx3Elements
// ============================================================================

describe("iterSpdx3Elements", () => {
  test("yields dict entries from @graph", () => {
    expect(types({ "@graph": [{ type: "A" }, { type: "B" }] })).toEqual(["A", "B"]);
  });

  test("yields from elements alias", () => {
    expect(types({ elements: [{ type: "A" }] })).toEqual(["A"]);
  });

  test("prefers @graph over legacy elements", () => {
    expect(types({ "@graph": [{ type: "from-graph" }], elements: [{ type: "from-elements" }] })).toEqual(["from-graph"]);
  });

  test("non-dict entries skipped", () => {
    expect(types({ "@graph": ["str", null, { type: "Only" }, 42] })).toEqual(["Only"]);
  });

  test("single-node dict @graph", () => {
    expect(types({ "@graph": { type: "Lonely" } })).toEqual(["Lonely"]);
  });

  test.each([["str"], [42], [null], [true]])("malformed @graph %p yields nothing", (bad) => {
    expect(types({ "@graph": bad })).toEqual([]);
  });

  test("missing @graph and elements yields nothing", () => {
    expect(types({})).toEqual([]);
  });

  test.each([["str"], [42], [null]])("malformed @graph %p falls back to elements", (bad) => {
    expect(types({ "@graph": bad, elements: [{ type: "FromElements" }] })).toEqual(["FromElements"]);
  });

  test("malformed @graph and malformed elements yields nothing", () => {
    expect(types({ "@graph": "broken", elements: 42 })).toEqual([]);
  });

  test("non-object data yields nothing", () => {
    for (const bad of [null, "x", 42, []]) expect(types(bad)).toEqual([]);
  });
});

// ============================================================================
// test_spdx2_identifier_iri.py
// ============================================================================

const BARE = "cpe23Type";
const IRI = "http://spdx.org/rdf/references/cpe23Type";
const CPE = "cpe:2.3:*:openssl:openssl:3.2.3:*:*:*:*:*:*:*";

/** Each ported framework with the finding id its identifier check reports under. */
const PLUGINS: ReadonlyArray<[string, Framework, string]> = [
  ["cisa-2025", cisa2025, "cisa-2025:software-identifiers"],
  ["ntia", ntia2021, "ntia-2021:unique-identifiers"],
];

/** One SPDX 2.2 package whose only identifier is a CPE, as Yocto emits it. */
function recipeDocument(referenceType: string): Obj {
  return {
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
  };
}

function identifierFinding(framework: Framework, findingId: string, document: Obj): Finding {
  const f = run(framework, document).byId[findingId];
  if (!f) throw new Error(`${framework.id} reported no finding ${findingId}`);
  return f;
}

describe.each(PLUGINS)("the IRI spelling is read as an identifier (%s)", (_name, framework, findingId) => {
  test("the IRI form scores as an identifier", () => {
    expect(identifierFinding(framework, findingId, recipeDocument(IRI)).status).not.toBe("fail");
  });

  test("the bare form still scores as one", () => {
    expect(identifierFinding(framework, findingId, recipeDocument(BARE)).status).not.toBe("fail");
  });
});

// ============================================================================
// test_spdx2_yocto_source_download.py
// ============================================================================

const YOCTO_CREATOR = "Tool: OpenEmbedded Core create-spdx.bbclass";
const TARBALL = "https://github.com/openssl/openssl/releases/download/openssl-3.2.3/openssl-3.2.3.tar.gz";

function download(spdxId = "SPDXRef-Download-openssl-1", location = TARBALL): Obj {
  return {
    SPDXID: spdxId,
    name: "openssl-source-1",
    downloadLocation: location,
    checksums: [{ algorithm: "SHA256", checksumValue: "b".repeat(64) }],
    supplier: "NOASSERTION",
    licenseConcluded: "NOASSERTION",
    licenseDeclared: "NOASSERTION",
    copyrightText: "NOASSERTION",
  };
}

/** The Yocto 5.0.x recipe shape: the recipe with its CPE, plus its source download. */
function yoctoDocument(dl: Obj, creator = YOCTO_CREATOR): Obj {
  const document = recipeDocument(IRI);
  document.creationInfo.creators = [creator, "Organization: OpenEmbedded ()"];
  document.packages.push(dl);
  document.relationships.push({
    spdxElementId: dl.SPDXID,
    relationshipType: "BUILD_DEPENDENCY_OF",
    relatedSpdxElement: "SPDXRef-Recipe-openssl",
  });
  return document;
}

describe.each(PLUGINS)("Yocto source download (%s)", (_name, framework, findingId) => {
  test("the source download does not need an identifier", () => {
    const f = identifierFinding(framework, findingId, yoctoDocument(download()));
    expect(f.status).toBe("pass");
  });

  test("a git fetch is a source download too", () => {
    const document = yoctoDocument(download(undefined, "git+https://git.example.com/openssl.git@0123abcd"));
    delete document.packages[document.packages.length - 1].checksums;
    expect(identifierFinding(framework, findingId, document).status).toBe("pass");
  });

  test.each([
    ["other-producer", () => yoctoDocument(download(), "Tool: some-other-generator-1.0")],
    ["ordinary-package", () => yoctoDocument(download("SPDXRef-Package-openssl-source-1"))],
    ["no-location", () => yoctoDocument(download(undefined, "NOASSERTION"))],
  ])("anything else still needs one: %s", (_id, build) => {
    const f = identifierFinding(framework, findingId, build());
    expect(f.status).not.toBe("pass");
    // Python asserts the name in the description; the port lists it in `affected`.
    expect(f.affected ?? []).toContain("openssl-source-1");
  });

  test("a malformed SPDXID does not stop the check", () => {
    const document = yoctoDocument(download());
    document.packages[0].SPDXID = ["SPDXRef-Recipe-openssl"];
    identifierFinding(framework, findingId, document);
  });
});

describe("spdx2YoctoSourceDownloads", () => {
  test("only the download is exempt", () => {
    expect(spdx2YoctoSourceDownloads(yoctoDocument(download()))).toEqual(new Set(["SPDXRef-Download-openssl-1"]));
  });

  test.each([[null], ["x"], [{ creators: null }], [{ creators: [null, 3] }]])(
    "malformed creationInfo %p exempts nothing",
    (creationInfo) => {
      const document = yoctoDocument(download());
      document.creationInfo = creationInfo;
      expect(spdx2YoctoSourceDownloads(document)).toEqual(new Set());
    },
  );
});

// ============================================================================
// test_spdx3_corpus.py
// ============================================================================

const SCHEMA_PATH = join(import.meta.dir, "..", "schemas", "spdx-3.0.1.schema.json");

let validator: ((doc: unknown) => string[]) | null = null;
function schemaErrors(document: unknown): string[] {
  if (!validator) {
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, "utf8")));
    validator = (doc) => (validate(doc) ? [] : (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`).sort());
  }
  return validator(document);
}

/** Frameworks scored in the corpus guard: the ported subset of the Python list. */
const CORPUS_FRAMEWORKS: ReadonlyArray<Framework> = [ntia2021, cisa2025];

function scores(document: unknown): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  for (const fw of CORPUS_FRAMEWORKS) {
    const statuses = run(fw, document).findings.map((f) => f.status);
    out[fw.id] = [statuses.filter((s) => s === "pass").length, statuses.filter((s) => s === "fail").length];
  }
  return out;
}

describe("corpus validates against the official schema", () => {
  test.each(corpus.SCHEMA_VALID_BUILDERS.map((b) => [b.name, b] as const))("%s is schema-valid", (_n, builder) => {
    expect(schemaErrors(builder())).toEqual([]);
  });

  test("legacy counterpart is deliberately invalid", () => {
    expect(schemaErrors(corpus.legacySpellingCounterpart())).not.toEqual([]);
  });
});

describe("conformant never scores worse", () => {
  test("spec spelling beats or ties legacy everywhere", () => {
    const conformant = scores(corpus.purlViaExternalIdentifierOnly());
    const legacy = scores(corpus.legacySpellingCounterpart());
    for (const [name, [specPass, specFail]] of Object.entries(conformant)) {
      const [legacyPass, legacyFail] = legacy[name]!;
      expect(specPass).toBeGreaterThanOrEqual(legacyPass);
      expect(specFail).toBeLessThanOrEqual(legacyFail);
    }
  });

  test("first-class purl property scores like an identifier", () => {
    expect(scores(corpus.purlViaSoftwarePackageUrlOnly())).toEqual(scores(corpus.purlViaExternalIdentifierOnly()));
  });

  test.each([corpus.inlineAgents, corpus.softwareAgentSupplier, corpus.yoctoShaped, corpus.syftShaped].map((b) => [b.name, b] as const))(
    "%s completes without an exception",
    (_n, builder) => {
      for (const [, [passCount, failCount]] of Object.entries(scores(builder()))) {
        expect(passCount + failCount).toBeGreaterThan(0);
      }
    },
  );

  test("inline and referenced suppliers score identically", () => {
    expect(scores(corpus.softwareAgentSupplier())).toEqual(scores(corpus.inlineAgents()));
  });
});

// ============================================================================
// util.ts: Python semantics
// ============================================================================

describe("isValidIsoTimestamp (RFC3339)", () => {
  // Expectations checked against CPython 3.14 datetime.fromisoformat.
  test.each([
    ["2023-01-01", false],
    ["20230101", false],
    ["2023-W01-1", false],
    ["2023-01-01T10:10:10Z", true],
    ["2023-01-01T10:10:10.123456+05:30", true],
    ["2024-02-29T24:00", false],
    ["2023-01-01 10:10", false],
    ["2023-01-01T10:10:10.Z", false],
    ["", false],
    ["2023-02-29", false],
    ["2023-01-01T25:00", false],
    ["not a date", false],
    ["2023-01-01T10:10:10+24:00", false],
    ["2023-01-01T", false],
    ["2023-01-01T10:10:10z", true],
  ] as const)("%p → %p", (value, expected) => {
    expect(isValidIsoTimestamp(value)).toBe(expected);
  });

  test("non-strings are invalid, never thrown on", () => {
    for (const bad of [123, null, undefined, ["x"], { a: 1 }, true, 0]) expect(isValidIsoTimestamp(bad)).toBe(false);
  });
});

describe("Python truthiness and string helpers", () => {
  test("truthy follows Python", () => {
    for (const v of [null, undefined, false, 0, "", [], {}]) expect(truthy(v)).toBe(false);
    for (const v of [true, 1, -1, "x", " ", [0], { a: null }]) expect(truthy(v)).toBe(true);
  });

  test("pyStrip uses Python's whitespace set", () => {
    expect(pyStrip(" \x1c a\x85b 　")).toBe("a\x85b");
    expect(pyStrip("﻿x")).toBe("﻿x");
  });

  test("pySplit splits on Python whitespace runs", () => {
    expect(pySplit(" a\x1cb c﻿d ")).toEqual(["a", "b", "c﻿d"]);
    expect(pySplit("   ")).toEqual([]);
  });

  test("pyStr mirrors str()", () => {
    expect(pyStr(null)).toBe("None");
    expect(pyStr(true)).toBe("True");
    expect(pyStr(false)).toBe("False");
    expect(pyStr(42)).toBe("42");
    expect(pyStr("s")).toBe("s");
    expect(pyStr(["a", 1])).toBe("['a', 1]");
    expect(pyStr({ k: "v" })).toBe("{'k': 'v'}");
  });
});
