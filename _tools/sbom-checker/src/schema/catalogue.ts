/** Schemas the checker validates against, keyed by format and version. */
export interface SchemaEntry {
  id: string;
  format: "cyclonedx" | "spdx" | "spdx3";
  version: string;
  file: string;
  draft2020: boolean;
  label: string;
}

export const SCHEMAS: SchemaEntry[] = [
  { id: "cdx-1.2", format: "cyclonedx", version: "1.2", file: "bom-1.2.schema.json", draft2020: false, label: "CycloneDX 1.2" },
  { id: "cdx-1.3", format: "cyclonedx", version: "1.3", file: "bom-1.3.schema.json", draft2020: false, label: "CycloneDX 1.3" },
  { id: "cdx-1.4", format: "cyclonedx", version: "1.4", file: "bom-1.4.schema.json", draft2020: false, label: "CycloneDX 1.4" },
  { id: "cdx-1.5", format: "cyclonedx", version: "1.5", file: "bom-1.5.schema.json", draft2020: false, label: "CycloneDX 1.5" },
  { id: "cdx-1.6", format: "cyclonedx", version: "1.6", file: "bom-1.6.schema.json", draft2020: false, label: "CycloneDX 1.6" },
  { id: "cdx-1.7", format: "cyclonedx", version: "1.7", file: "bom-1.7.schema.json", draft2020: false, label: "CycloneDX 1.7" },
  { id: "spdx-2.2", format: "spdx", version: "2.2", file: "spdx-2.2.schema.json", draft2020: false, label: "SPDX 2.2" },
  { id: "spdx-2.3", format: "spdx", version: "2.3", file: "spdx-2.3.schema.json", draft2020: false, label: "SPDX 2.3" },
  { id: "spdx-3.0.0", format: "spdx3", version: "3.0.0", file: "spdx-3.0.0.schema.json", draft2020: true, label: "SPDX 3.0.0" },
  { id: "spdx-3.0.1", format: "spdx3", version: "3.0.1", file: "spdx-3.0.1.schema.json", draft2020: true, label: "SPDX 3.0.1" },
];

export function findSchema(format: string, version: string | null): SchemaEntry | undefined {
  if (!version) return undefined;
  return SCHEMAS.find((s) => s.format === format && s.version === version);
}
