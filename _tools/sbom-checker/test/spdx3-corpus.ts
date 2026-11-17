/**
 * A conformant SPDX 3.0.1 fixture corpus.
 *
 * Mirrors sbomify `sbomify/apps/plugins/tests/spdx3_corpus.py`. Only the
 * builders in SCHEMA_VALID_BUILDERS claim 3.0.1 conformance; the 3.0.0 / 3.1
 * variants and the syft-shaped 3.0.0 document are deliberately not.
 *
 * Builders return fresh objects, so tests may mutate freely.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>;

export const CONTEXT = "https://spdx.org/rdf/3.0.1/spdx-context.jsonld";
export const CREATED = "2026-08-01T00:00:00Z";
const CI = "_:creationinfo";

function creationInfo(createdBy?: unknown[], createdUsing?: unknown[]): Obj {
  const info: Obj = {
    type: "CreationInfo",
    "@id": CI,
    specVersion: "3.0.1",
    created: CREATED,
    createdBy: createdBy ?? ["urn:acme:agent"],
  };
  if (createdUsing !== undefined) info.createdUsing = createdUsing;
  return info;
}

function person(spdxId = "urn:acme:agent", name = "Jane Doe", email = "jane@acme.test"): Obj {
  return {
    type: "Person",
    spdxId,
    creationInfo: CI,
    name,
    externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: email }],
  };
}

function tool(spdxId = "urn:acme:tool", name = "sbomify-action-1.2.3"): Obj {
  return { type: "Tool", spdxId, creationInfo: CI, name };
}

function document(root: string[] | string, spdxId = "urn:acme:doc"): Obj {
  return { type: "SpdxDocument", spdxId, creationInfo: CI, rootElement: root, profileConformance: ["core", "software"] };
}

function pkg(
  spdxId = "urn:acme:pkg1",
  name = "my-app",
  version = "1.2.3",
  supplier: unknown = "urn:acme:agent",
  extra: Obj = {},
): Obj {
  const p: Obj = {
    type: "software_Package",
    spdxId,
    creationInfo: CI,
    name,
    software_packageVersion: version,
    software_downloadLocation: `https://downloads.acme.test/${name}-${version}.tar.gz`,
    verifiedUsing: [{ type: "Hash", algorithm: "sha256", hashValue: "a".repeat(64) }],
    externalRef: [{ type: "ExternalRef", externalRefType: "vcs", locator: [`https://github.com/acme/${name}`] }],
    validUntilTime: "2030-01-01T00:00:00Z",
  };
  if (supplier !== null) p.originatedBy = [supplier];
  return { ...p, ...extra };
}

function licenseExpression(spdxId = "urn:acme:lic1", expression = "MIT"): Obj {
  return { type: "simplelicensing_LicenseExpression", spdxId, creationInfo: CI, simplelicensing_licenseExpression: expression };
}

function relationship(relType: string, fromId: string, toIds: string[], spdxId = "urn:acme:rel1"): Obj {
  return { type: "Relationship", spdxId, creationInfo: CI, relationshipType: relType, from: fromId, to: toIds };
}

function doc(...graph: Obj[]): Obj {
  return { "@context": CONTEXT, "@graph": graph };
}

/** One package carrying every field the plugins grade, spec-spelled. */
export function minimalConformant(): Obj {
  return doc(
    creationInfo(undefined, ["urn:acme:tool"]),
    person(),
    tool(),
    document(["urn:acme:pkg1"]),
    pkg(undefined, undefined, undefined, undefined, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
    licenseExpression(),
    relationship("hasConcludedLicense", "urn:acme:pkg1", ["urn:acme:lic1"]),
    relationship("hasDeclaredLicense", "urn:acme:pkg1", ["urn:acme:lic1"], "urn:acme:rel2"),
  );
}

/** Three packages; the SpdxDocument declares the third as the subject. */
export function rootElementNonFirst(): Obj {
  return doc(
    creationInfo(),
    person(),
    document(["urn:acme:pkg3"]),
    pkg("urn:acme:pkg1", "libfoo", "9.9.9"),
    pkg("urn:acme:pkg2", "libbar", "2.0.0"),
    pkg("urn:acme:pkg3", "my-app", "1.2.3", undefined, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
  );
}

/** Inline Agent objects in createdBy and originatedBy (legal per Agent_derived). */
export function inlineAgents(): Obj {
  const inlineOrg = (): Obj => ({
    type: "Organization",
    spdxId: "urn:acme:inlineorg",
    creationInfo: CI,
    name: "Inline Corp",
    externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: "sec@inline.test" }],
  });
  return doc(
    creationInfo([inlineOrg()]),
    document(["urn:acme:pkg1"]),
    pkg(undefined, undefined, undefined, inlineOrg(), { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
  );
}

/** Supplier typed SoftwareAgent; the author stays the default Person. */
export function softwareAgentSupplier(): Obj {
  const agent = {
    type: "SoftwareAgent",
    spdxId: "urn:acme:bot",
    creationInfo: CI,
    name: "build-bot",
    externalIdentifier: [{ type: "ExternalIdentifier", externalIdentifierType: "email", identifier: "bot@acme.test" }],
  };
  return doc(
    creationInfo(),
    person(),
    agent,
    document(["urn:acme:pkg1"]),
    pkg(undefined, undefined, undefined, "urn:acme:bot", { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
  );
}

/** The first-class 3.0.1 purl property, and nothing else. */
export function purlViaSoftwarePackageUrlOnly(): Obj {
  return doc(
    creationInfo(),
    person(),
    document(["urn:acme:pkg1"]),
    pkg(undefined, undefined, undefined, undefined, { software_packageUrl: "pkg:pypi/my-app@1.2.3" }),
  );
}

/** Spec spelling: singular property, packageUrl vocabulary value. */
export function purlViaExternalIdentifierOnly(): Obj {
  return doc(
    creationInfo(),
    person(),
    document(["urn:acme:pkg1"]),
    pkg(undefined, undefined, undefined, undefined, {
      externalIdentifier: [
        { type: "ExternalIdentifier", externalIdentifierType: "packageUrl", identifier: "pkg:pypi/my-app@1.2.3" },
      ],
    }),
  );
}

/** purlViaExternalIdentifierOnly written with the legacy (non-spec) spellings. */
export function legacySpellingCounterpart(): Obj {
  const d = purlViaExternalIdentifierOnly();
  for (const element of d["@graph"] as Obj[]) {
    if (element.type === "software_Package") {
      element.externalIdentifiers = [{ externalIdentifierType: "packageURL", identifier: "pkg:pypi/my-app@1.2.3" }];
      delete element.externalIdentifier;
    }
    if (element.type === "Person") {
      element.externalIdentifiers = element.externalIdentifier;
      delete element.externalIdentifier;
    }
  }
  return d;
}

/** The shape current Yocto (5.2+/6.0) emits. */
export function yoctoShaped(): Obj {
  return doc(
    creationInfo(["urn:oe:org"]),
    { type: "Organization", spdxId: "urn:oe:org", creationInfo: CI, name: "OpenEmbedded" },
    document(["urn:oe:sbom"]),
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
    pkg("urn:oe:netbase", "netbase", "6.4", "urn:oe:org", {
      software_packageUrl: "pkg:generic/netbase@6.4?distro=yocto",
    }),
  );
}

/** The shape syft v1.46+ writes: SPDX 3.0.0, describes relationship, purl on externalIdentifier. */
export function syftShaped(): Obj {
  const d = doc(
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
  d["@context"] = "https://spdx.org/rdf/3.0.0/spdx-context.jsonld";
  for (const element of d["@graph"] as Obj[]) if (element.type === "CreationInfo") element.specVersion = "3.0.0";
  return d;
}

/** A 3.0.0 document. */
export function spdx300(): Obj {
  const d = minimalConformant();
  d["@context"] = "https://spdx.org/rdf/3.0.0/spdx-context.jsonld";
  for (const element of d["@graph"] as Obj[]) if (element.type === "CreationInfo") element.specVersion = "3.0.0";
  return d;
}

/** A 3.1 document (prerelease). */
export function spdx31(): Obj {
  const d = minimalConformant();
  d["@context"] = "https://spdx.org/rdf/3.1.0/spdx-context.jsonld";
  for (const element of d["@graph"] as Obj[]) if (element.type === "CreationInfo") element.specVersion = "3.1.0";
  return d;
}

export const SCHEMA_VALID_BUILDERS: ReadonlyArray<() => Obj> = [
  minimalConformant,
  rootElementNonFirst,
  inlineAgents,
  softwareAgentSupplier,
  purlViaSoftwarePackageUrlOnly,
  purlViaExternalIdentifierOnly,
  yoctoShaped,
];
