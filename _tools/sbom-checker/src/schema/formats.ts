/**
 * JSON Schema `format` validators used by the generated schema validators.
 *
 * The generated code (scripts/build.ts, Ajv standalone mode) imports this
 * module instead of ajv-formats' runtime so the browser bundle carries only
 * the handful of formats the CycloneDX and SPDX schemas use.
 */
import { fullFormats } from "ajv-formats/dist/formats";

// RFC 3987 IRI reference. Relative references are allowed, so this only
// rejects what can never appear in one: whitespace, controls and the
// characters RFC 3987 excludes.
const IRI_REFERENCE = /^[^\s<>"{}|\\^`\u0000-\u001f\u007f]*$/u;

// RFC 6531 internationalised mailbox: local@domain, non-ASCII allowed.
const IDN_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export const formats = {
  date: fullFormats.date,
  "date-time": fullFormats["date-time"],
  uri: fullFormats.uri,
  email: fullFormats.email,
  "iri-reference": (s: string) => IRI_REFERENCE.test(s),
  "idn-email": (s: string) => IDN_EMAIL.test(s),
};
