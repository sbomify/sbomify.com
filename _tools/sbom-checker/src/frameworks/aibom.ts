/**
 * AIBOM (AI Bill of Materials) required fields.
 *
 * Two formats describe AI systems:
 *
 * - CycloneDX 1.5+: components of type `machine-learning-model`, described
 *   by a `modelCard`, with training data as components of type `data`. The
 *   schema requires only a type and a name; these checks add who supplied
 *   the model, its version and its model card, and recommend the task,
 *   training datasets and licence.
 * - SPDX 3.0 AI and Dataset profiles: `ai_AIPackage` and
 *   `dataset_DatasetPackage`. The profiles make several inherited properties
 *   mandatory (minCount 1 in the model's "External properties
 *   restrictions"), which the JSON schema cannot express. Those are checked
 *   here as failures: for an AIPackage suppliedBy, releaseTime,
 *   software_downloadLocation, software_packageVersion and
 *   software_primaryPurpose; for a DatasetPackage originatedBy, releaseTime,
 *   builtTime, software_downloadLocation, software_primaryPurpose and
 *   dataset_datasetType.
 */
import type { DetectedSbom, Finding, Framework, JsonObject } from "../types";
import { allComponents, atLeast, documentChecks, label, perComponent, present, single, sub, type Check } from "./bom-common";
import { spdx3Nodes } from "./standards";
import { asList, isObject } from "./util";

const P = "aibom";

// ---------------------------------------------------------------- CycloneDX

export const isModel = (c: unknown): c is JsonObject => isObject(c) && c.type === "machine-learning-model";
export const isDataset = (c: unknown): c is JsonObject => isObject(c) && c.type === "data";

function hasProducer(c: JsonObject): boolean {
  return present(sub(c, "supplier")?.name) || present(sub(c, "manufacturer")?.name) || present(c.publisher) || present(c.author) || asList(c.authors).some((a) => isObject(a) && present(a.name));
}

function assessCycloneDx(sbom: DetectedSbom): Finding[] {
  const data = sbom.data;
  const models = allComponents(data).filter(isModel);
  const findings: Finding[] = [
    single(
      {
        id: `${P}:spec-version`,
        title: "CycloneDX 1.5 or later",
        about: "Machine learning models and model cards are part of CycloneDX from version 1.5.",
        missing: "fail",
        remediation: "Generate the AIBOM as CycloneDX 1.5, 1.6 or 1.7. Earlier versions have no `machine-learning-model` type or `modelCard`.",
      },
      atLeast(sbom.specVersion, 1, 5),
      `This document declares ${sbom.specVersion ? `specVersion ${sbom.specVersion}` : "no specVersion"}.`,
    ),
    single(
      {
        id: `${P}:models`,
        title: "AI models",
        about: "An AIBOM lists each AI model as a component of type `machine-learning-model`.",
        missing: "fail",
        remediation: "Add a component of type `machine-learning-model` for each model the product ships or calls, with a `modelCard` describing it.",
      },
      models.length > 0,
      models.length ? `Found ${models.length}.` : "None found.",
    ),
  ];

  if (models.length) {
    const noun: [string, string] = ["model", "models"];
    const names = (bad: (c: JsonObject) => boolean) => models.flatMap((c, i) => (bad(c) ? [label(c, i)] : []));
    const params = (c: JsonObject) => sub(sub(c, "modelCard"), "modelParameters");
    const checks: [Check, (c: JsonObject) => boolean][] = [
      [
        {
          id: `${P}:model-supplier`,
          title: "Model supplier",
          about: "`supplier`, `manufacturer` or `authors` says who created or provides the model.",
          missing: "fail",
          remediation: "Set `supplier.name` (or `manufacturer.name` on CycloneDX 1.6+, or `authors`) on every model.",
        },
        (c) => !hasProducer(c),
      ],
      [
        {
          id: `${P}:model-version`,
          title: "Model version",
          about: "`version` distinguishes this release or checkpoint of the model from others with the same name.",
          missing: "fail",
          remediation: "Set `version` on every model, for example the release tag or the commit of the weights.",
        },
        (c) => !present(c.version),
      ],
      [
        {
          id: `${P}:model-card`,
          title: "Model card",
          about: "`modelCard` describes the model: what it does, how it was trained and its limitations.",
          missing: "fail",
          remediation: "Add a `modelCard` to every model, with at least `modelParameters` (task, architecture, datasets) and `considerations`.",
        },
        (c) => !isObject(c.modelCard),
      ],
      [
        {
          id: `${P}:model-task`,
          title: "Model task",
          about: "`modelCard.modelParameters.task` says what the model does, for example `text-generation` or `image-classification`.",
          missing: "warning",
          remediation: "Set `modelCard.modelParameters.task` on every model.",
        },
        (c) => !present(params(c)?.task),
      ],
      [
        {
          id: `${P}:model-datasets`,
          title: "Training data",
          about: "`modelCard.modelParameters.datasets` lists the data the model was trained and evaluated on, inline or by reference to a component of type `data`.",
          missing: "warning",
          remediation: "List the training and evaluation datasets in `modelCard.modelParameters.datasets`, ideally as references to components of type `data`.",
        },
        (c) => asList(params(c)?.datasets).length === 0,
      ],
      [
        {
          id: `${P}:model-license`,
          title: "Model licence",
          about: "`licenses` says under which terms the model weights may be used.",
          missing: "warning",
          remediation: "Add the model's licence to `licenses`, as an SPDX ID or expression where one exists.",
        },
        (c) => asList(c.licenses).length === 0,
      ],
    ];
    for (const [check, bad] of checks) findings.push(perComponent(check, names(bad), models.length, noun));
  }

  findings.push(...documentChecks(P, "AIBOM", data));
  return findings;
}

// ---------------------------------------------------------------- SPDX 3

const typeOf = (e: JsonObject) => String(e.type ?? e["@type"] ?? "");
export const isAiPackage = (e: JsonObject) => /^(ai_)?AIPackage$/.test(typeOf(e));
export const isDatasetPackage = (e: JsonObject) => /^(dataset_)?DatasetPackage$/.test(typeOf(e));

/** A property under its JSON-LD name (software_packageVersion) or the bare one (packageVersion). */
function prop(e: JsonObject, name: string, prefix?: string): unknown {
  return prefix && e[`${prefix}_${name}`] !== undefined ? e[`${prefix}_${name}`] : e[name];
}

const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : present(v) || isObject(v));
const idOf = (e: JsonObject) => String(e.spdxId ?? e["@id"] ?? "");

function spdxLabel(e: JsonObject, i: number): string {
  return present(e.name) ? e.name : present(idOf(e)) ? idOf(e) : `element #${i + 1}`;
}

interface Required {
  id: string;
  title: string;
  field: string;
  get: (e: JsonObject) => unknown;
}

function assessSpdx3(sbom: DetectedSbom): Finding[] {
  const nodes = spdx3Nodes(sbom.data);
  const models = nodes.filter(isAiPackage);
  const datasets = nodes.filter(isDatasetPackage);
  const findings: Finding[] = [
    single(
      {
        id: `${P}:models`,
        title: "AI models",
        about: "An SPDX 3 AIBOM describes each AI model as an `ai_AIPackage` element (the AI profile).",
        missing: "fail",
        remediation: "Add an `ai_AIPackage` element for each model the product ships or calls.",
      },
      models.length > 0,
      models.length ? `Found ${models.length}.` : "None found.",
    ),
  ];

  const required = (list: JsonObject[], what: string, nouns: [string, string], fields: Required[]) => {
    for (const f of fields) {
      findings.push(
        perComponent(
          {
            id: `${P}:${f.id}`,
            title: f.title,
            about: `The SPDX 3 ${what} profile requires \`${f.field}\` on every ${nouns[0]}.`,
            missing: "fail",
            remediation: `Set \`${f.field}\` on every ${nouns[0]}.`,
          },
          list.flatMap((e, i) => (has(f.get(e)) ? [] : [spdxLabel(e, i)])),
          list.length,
          nouns,
        ),
      );
    }
  };

  if (models.length) {
    required(models, "AI", ["ai_AIPackage", "ai_AIPackage elements"], [
      { id: "model-supplier", title: "Model supplier", field: "suppliedBy", get: (e) => e.suppliedBy },
      { id: "model-version", title: "Model version", field: "software_packageVersion", get: (e) => prop(e, "packageVersion", "software") },
      { id: "model-download-location", title: "Download location", field: "software_downloadLocation", get: (e) => prop(e, "downloadLocation", "software") },
      { id: "model-primary-purpose", title: "Primary purpose", field: "software_primaryPurpose", get: (e) => prop(e, "primaryPurpose", "software") },
      { id: "model-release-time", title: "Release time", field: "releaseTime", get: (e) => e.releaseTime },
    ]);

    // Recommended: what the model was trained on, and its licence. Both are relationships from the model.
    const rels = nodes.filter((e) => typeOf(e) === "Relationship");
    const relatedBy = (types: RegExp) => new Set(rels.filter((r) => types.test(String(r.relationshipType ?? ""))).map((r) => String(r.from ?? "")));
    const trained = relatedBy(/^(trainedOn|testedOn)$/);
    const licensed = relatedBy(/^(hasConcludedLicense|hasDeclaredLicense)$/);
    const names = (bad: (e: JsonObject) => boolean) => models.flatMap((e, i) => (bad(e) ? [spdxLabel(e, i)] : []));
    const nouns: [string, string] = ["ai_AIPackage", "ai_AIPackage elements"];
    findings.push(
      perComponent(
        {
          id: `${P}:model-datasets`,
          title: "Training data",
          about: "A `trainedOn` or `testedOn` relationship from the model names the data it was trained and evaluated on.",
          missing: "warning",
          remediation: "Describe each dataset as a `dataset_DatasetPackage` and add `trainedOn` (and `testedOn`) relationships from the model to it.",
        },
        names((e) => !trained.has(idOf(e))),
        models.length,
        nouns,
      ),
      perComponent(
        {
          id: `${P}:model-license`,
          title: "Model licence",
          about: "A `hasDeclaredLicense` or `hasConcludedLicense` relationship from the model says under which terms it may be used.",
          missing: "warning",
          remediation: "Add a `hasDeclaredLicense` relationship from each model to its licence.",
        },
        names((e) => !licensed.has(idOf(e))),
        models.length,
        nouns,
      ),
    );
  }

  if (datasets.length) {
    required(datasets, "Dataset", ["dataset_DatasetPackage", "dataset_DatasetPackage elements"], [
      { id: "dataset-originator", title: "Dataset originator", field: "originatedBy", get: (e) => e.originatedBy },
      { id: "dataset-type", title: "Dataset type", field: "dataset_datasetType", get: (e) => prop(e, "datasetType", "dataset") },
      { id: "dataset-download-location", title: "Dataset download location", field: "software_downloadLocation", get: (e) => prop(e, "downloadLocation", "software") },
      { id: "dataset-primary-purpose", title: "Dataset primary purpose", field: "software_primaryPurpose", get: (e) => prop(e, "primaryPurpose", "software") },
      { id: "dataset-release-time", title: "Dataset release time", field: "releaseTime", get: (e) => e.releaseTime },
      { id: "dataset-built-time", title: "Dataset built time", field: "builtTime", get: (e) => e.builtTime },
    ]);
  }
  return findings;
}

function assess(sbom: DetectedSbom): Finding[] {
  if (sbom.format === "cyclonedx") return assessCycloneDx(sbom);
  if (sbom.format === "spdx3") return assessSpdx3(sbom);
  return [
    {
      id: `${P}:format`,
      title: "AIBOM format",
      description: `AIBOMs are written in CycloneDX 1.5+ or SPDX 3 (AI profile), and this is ${sbom.format === "spdx" ? "an SPDX 2 document, which has no way to describe a model" : "neither"}.`,
      status: "fail",
      remediation: "Export the AIBOM as CycloneDX JSON (1.5 or later) or SPDX 3 JSON-LD with the AI profile.",
    },
  ];
}

/** Models and datasets in the document, for the report's facts. */
export function aiInventory(sbom: DetectedSbom): { models: number; datasets: number } {
  if (sbom.format === "cyclonedx") {
    const all = allComponents(sbom.data);
    return { models: all.filter(isModel).length, datasets: all.filter(isDataset).length };
  }
  if (sbom.format === "spdx3") {
    const nodes = spdx3Nodes(sbom.data);
    return { models: nodes.filter(isAiPackage).length, datasets: nodes.filter(isDatasetPackage).length };
  }
  return { models: 0, datasets: 0 };
}

export const aibomRequired: Framework = {
  id: "aibom",
  name: "AIBOM required fields",
  shortName: "Required fields",
  version: "CycloneDX 1.5+ and SPDX 3 AI profile",
  url: "https://cyclonedx.org/capabilities/mlbom/",
  guideUrl: "",
  assess,
};
