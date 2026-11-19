/**
 * CBOM (Cryptography Bill of Materials) required fields.
 *
 * A CBOM is a CycloneDX 1.6+ document whose components include
 * `cryptographic-asset` entries. The schema enforces only `assetType` inside
 * `cryptoProperties`; these checks add what a reader needs to tell one asset
 * from another: the type-specific property that says what the asset is
 * (an algorithm's primitive, a protocol's type, a key's type, a
 * certificate's subject and issuer), and that every reference between
 * assets resolves.
 *
 * Crypto-asset detection matches the sbomify platform
 * (`sbomify/apps/sboms/crypto_inventory.py`, `is_crypto_asset`): typed as
 * one, legacy `crypto-asset` included, or carrying `cryptoProperties`.
 */
import type { DetectedSbom, Finding, Framework, JsonObject } from "../types";
import { allComponents, atLeast, documentChecks, label, notCycloneDx, perComponent, present, single, sub } from "./bom-common";
import { asList, isObject } from "./util";

const P = "cbom";
const ASSET_TYPES = ["algorithm", "certificate", "protocol", "related-crypto-material"] as const;
const LEGACY_TYPE = "crypto-asset";

export function isCryptoAsset(c: unknown): c is JsonObject {
  return isObject(c) && (c.type === "cryptographic-asset" || c.type === LEGACY_TYPE || "cryptoProperties" in c);
}

export function cryptoAssets(data: JsonObject): JsonObject[] {
  return allComponents(data).filter(isCryptoAsset);
}

const assetType = (c: JsonObject): string | undefined => {
  const t = sub(c, "cryptoProperties")?.assetType;
  return typeof t === "string" ? t : undefined;
};

/** Every bom-ref an asset points at, with where it points from. */
function referencesOf(c: JsonObject): string[] {
  const cp = sub(c, "cryptoProperties");
  if (!cp) return [];
  const out: string[] = [];
  const add = (v: unknown) => {
    if (present(v)) out.push(v);
  };
  const cert = sub(cp, "certificateProperties");
  add(cert?.signatureAlgorithmRef);
  add(cert?.subjectPublicKeyRef);
  const rcm = sub(cp, "relatedCryptoMaterialProperties");
  add(rcm?.algorithmRef);
  add(sub(rcm, "securedBy")?.algorithmRef);
  const proto = sub(cp, "protocolProperties");
  for (const r of asList(proto?.cryptoRefArray)) add(r);
  for (const suite of asList(proto?.cipherSuites)) for (const r of asList(isObject(suite) ? suite.algorithms : undefined)) add(r);
  for (const props of [cert, rcm, proto]) {
    for (const rel of asList(props?.relatedCryptographicAssets)) add(isObject(rel) ? rel.ref : undefined);
  }
  return out;
}

function assess(sbom: DetectedSbom): Finding[] {
  if (sbom.format !== "cyclonedx") return [notCycloneDx(P, "CBOM", sbom)];
  const data = sbom.data;
  const assets = cryptoAssets(data);
  const legacy = assets.some((c) => c.type === LEGACY_TYPE);
  const findings: Finding[] = [];

  findings.push(
    single(
      {
        id: `${P}:spec-version`,
        title: "CycloneDX 1.6 or later",
        about: "Cryptographic assets are part of CycloneDX from version 1.6.",
        missing: "fail",
        remediation: legacy
          ? "This looks like a pre-standard CBOM (component type `crypto-asset`). Regenerate it with a tool that writes CycloneDX 1.6 or 1.7, where the type is `cryptographic-asset`."
          : "Generate the CBOM as CycloneDX 1.6 or 1.7. Earlier versions have no `cryptographic-asset` type or `cryptoProperties`.",
      },
      atLeast(sbom.specVersion, 1, 6),
      `This document declares ${sbom.specVersion ? `specVersion ${sbom.specVersion}` : "no specVersion"}.`,
    ),
  );

  findings.push(
    single(
      {
        id: `${P}:crypto-assets`,
        title: "Cryptographic assets",
        about: "A CBOM lists the algorithms, certificates, protocols and keys a product uses as components of type `cryptographic-asset`.",
        missing: "fail",
        remediation: "Add a component of type `cryptographic-asset`, with `cryptoProperties`, for each algorithm, certificate, protocol and key or other related crypto material in use.",
      },
      assets.length > 0,
      assets.length ? `Found ${assets.length}.` : "None found.",
    ),
  );

  if (assets.length) {
    const noun: [string, string] = ["cryptographic asset", "cryptographic assets"];
    const names = (list: JsonObject[], bad: (c: JsonObject) => boolean) => list.flatMap((c, i) => (bad(c) ? [label(c, i)] : []));

    findings.push(
      perComponent(
        {
          id: `${P}:asset-type`,
          title: "Asset type",
          about: `\`cryptoProperties.assetType\` says what kind of asset each one is: ${ASSET_TYPES.map((t) => `\`${t}\``).join(", ")}.`,
          missing: "fail",
          remediation: `Give every cryptographic asset a \`cryptoProperties\` object with \`assetType\` set to one of ${ASSET_TYPES.map((t) => `\`${t}\``).join(", ")}.`,
        },
        names(assets, (c) => !(ASSET_TYPES as readonly string[]).includes(assetType(c) ?? "")),
        assets.length,
        noun,
      ),
    );

    const ofType = (t: string) => assets.filter((c) => assetType(c) === t);
    const props = (c: JsonObject, key: string) => sub(sub(c, "cryptoProperties"), key);

    const algorithms = ofType("algorithm");
    if (algorithms.length) {
      findings.push(
        perComponent(
          {
            id: `${P}:algorithm-primitive`,
            title: "Algorithm primitive",
            about: "`algorithmProperties.primitive` says what an algorithm does (for example `ae`, `signature`, `hash`, `kem` or `block-cipher`), which is what quantum-readiness and policy checks key on.",
            missing: "fail",
            remediation: "Set `cryptoProperties.algorithmProperties.primitive` on every algorithm.",
          },
          names(algorithms, (c) => !present(props(c, "algorithmProperties")?.primitive)),
          algorithms.length,
          ["algorithm", "algorithms"],
        ),
        perComponent(
          {
            id: `${P}:algorithm-oid`,
            title: "Algorithm OID",
            about: "`cryptoProperties.oid` identifies an algorithm unambiguously, whatever it is called.",
            missing: "warning",
            remediation: "Add the algorithm's object identifier as `cryptoProperties.oid` where one is registered, for example `2.16.840.1.101.3.4.1.46` for AES-256-GCM.",
          },
          names(algorithms, (c) => !present(sub(c, "cryptoProperties")?.oid)),
          algorithms.length,
          ["algorithm", "algorithms"],
        ),
      );
    }

    const certificates = ofType("certificate");
    if (certificates.length) {
      findings.push(
        perComponent(
          {
            id: `${P}:certificate-identity`,
            title: "Certificate subject and issuer",
            about: "`certificateProperties.subjectName` and `issuerName` identify a certificate.",
            missing: "fail",
            remediation: "Set `cryptoProperties.certificateProperties.subjectName` and `issuerName` on every certificate.",
          },
          names(certificates, (c) => {
            const cert = props(c, "certificateProperties");
            return !present(cert?.subjectName) || !present(cert?.issuerName);
          }),
          certificates.length,
          ["certificate", "certificates"],
        ),
        perComponent(
          {
            id: `${P}:certificate-validity`,
            title: "Certificate validity",
            about: "`certificateProperties.notValidBefore` and `notValidAfter` say when a certificate is valid, so expiry can be tracked.",
            missing: "warning",
            remediation: "Set `cryptoProperties.certificateProperties.notValidBefore` and `notValidAfter` on every certificate.",
          },
          names(certificates, (c) => {
            const cert = props(c, "certificateProperties");
            return !present(cert?.notValidBefore) || !present(cert?.notValidAfter);
          }),
          certificates.length,
          ["certificate", "certificates"],
        ),
      );
    }

    const protocols = ofType("protocol");
    if (protocols.length) {
      findings.push(
        perComponent(
          {
            id: `${P}:protocol-type`,
            title: "Protocol type",
            about: "`protocolProperties.type` says which protocol it is (for example `tls`, `ssh`, `ipsec` or `ike`).",
            missing: "fail",
            remediation: "Set `cryptoProperties.protocolProperties.type` on every protocol.",
          },
          names(protocols, (c) => !present(props(c, "protocolProperties")?.type)),
          protocols.length,
          ["protocol", "protocols"],
        ),
      );
    }

    const material = ofType("related-crypto-material");
    if (material.length) {
      findings.push(
        perComponent(
          {
            id: `${P}:material-type`,
            title: "Crypto material type",
            about: "`relatedCryptoMaterialProperties.type` says what the material is (for example `private-key`, `public-key`, `secret-key` or `password`).",
            missing: "fail",
            remediation: "Set `cryptoProperties.relatedCryptoMaterialProperties.type` on every `related-crypto-material` asset.",
          },
          names(material, (c) => !present(props(c, "relatedCryptoMaterialProperties")?.type)),
          material.length,
          ["crypto material asset", "crypto material assets"],
        ),
      );
    }

    findings.push(
      perComponent(
        {
          id: `${P}:bom-ref`,
          title: "Asset reference (bom-ref)",
          about: "A `bom-ref` lets other assets and the dependency graph point at an asset, for example a certificate at its signature algorithm.",
          missing: "warning",
          remediation: "Give every cryptographic asset a unique `bom-ref`.",
        },
        names(assets, (c) => !present(c["bom-ref"])),
        assets.length,
        noun,
      ),
    );

    const refs = new Set(allComponents(data).flatMap((c) => (present(c["bom-ref"]) ? [c["bom-ref"] as string] : [])));
    const withRefs = assets.filter((c) => referencesOf(c).length > 0);
    if (withRefs.length) {
      findings.push(
        perComponent(
          {
            id: `${P}:asset-references`,
            title: "References between assets",
            about: "References such as `signatureAlgorithmRef`, `algorithmRef`, `cryptoRefArray` and cipher suite algorithms must name the `bom-ref` of a component in the document.",
            missing: "fail",
            remediation: "Point every reference at the `bom-ref` of a component in this CBOM, or add the missing asset.",
            phrase: {
              ok: (total) => `Every reference resolves (${total === 1 ? "one asset" : `${total} assets`} with references).`,
              bad: (n, total) => `${n} of ${total} assets with references point at a bom-ref that is not in the document.`,
            },
          },
          names(withRefs, (c) => referencesOf(c).some((r) => !refs.has(r))),
          withRefs.length,
          ["asset with references", "assets with references"],
        ),
      );
    }
  }

  findings.push(...documentChecks(P, "CBOM", data));
  return findings;
}

export const cbomRequired: Framework = {
  id: "cbom",
  name: "CBOM required fields",
  shortName: "Required fields",
  version: "CycloneDX 1.6+",
  url: "https://cyclonedx.org/capabilities/cbom/",
  guideUrl: "/2024/04/10/future-proofing-cybersecurity-with-the-cryptography-bill-of-materials-cbom/",
  assess,
};
