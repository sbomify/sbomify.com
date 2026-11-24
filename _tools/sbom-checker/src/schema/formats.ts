/**
 * JSON Schema `format` validators used by the generated schema validators.
 *
 * The generated code (scripts/build.ts, Ajv standalone mode) imports this
 * module instead of ajv-formats' runtime so the browser bundle carries only
 * the handful of formats the CycloneDX and SPDX schemas use.
 */
import { fullFormats } from "ajv-formats/dist/formats";

/** RFC3987 §2.2: map only legal ucschar/iprivate to URI pct-encoding,
 * then validate RFC3986 reference grammar (including authority/path).
 * Do not use encodeURI: it would repair malformed ASCII input before validation.
 */
export function iriReference(value: string): boolean {
  if (/[ <>"{}|\\^`\u0000-\u001f\u007f]/u.test(value)) return false;
  let ascii = "";
  const queryStart = value.indexOf("?"), fragmentStart = value.indexOf("#");
  let index = 0;
  for (const char of value) {
    const cp = char.codePointAt(0)!;
    if (cp <= 0x7f) ascii += char;
    else {
      const ucs = (cp >= 0xa0 && cp <= 0xd7ff) || (cp >= 0xf900 && cp <= 0xfdcf) ||
        (cp >= 0xfdf0 && cp <= 0xffef) || (cp >= 0x10000 && cp <= 0xdfffd && (cp & 0xffff) <= 0xfffd) || (cp >= 0xe1000 && cp <= 0xefffd);
      const privateChar = (cp >= 0xe000 && cp <= 0xf8ff) || (cp >= 0xf0000 && cp <= 0xffffd) || (cp >= 0x100000 && cp <= 0x10fffd);
      const inQuery = queryStart >= 0 && index > queryStart && (fragmentStart < 0 || index < fragmentStart);
      if (!ucs && !(privateChar && inQuery)) return false;
      ascii += encodeURIComponent(char);
    }
    index += char.length;
  }
  const m = /^(?:([a-z][a-z0-9+.-]*):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i.exec(ascii);
  if (!m) return false;
  const [, scheme, authority, path = "", query = "", fragment = ""] = m;
  const atom = "(?:[A-Za-z0-9._~!$&'()*+,;=-]|%[A-Fa-f0-9]{2})";
  const pathChars = new RegExp(`^(?:${atom}|[:@/])*$`);
  const queryChars = new RegExp(`^(?:${atom}|[:@/?])*$`);
  if (!pathChars.test(path) || !queryChars.test(query) || !queryChars.test(fragment)) return false;
  if (authority !== undefined) {
    if (path && !path.startsWith("/")) return false;
    const auth = new RegExp(`^(?:${atom}|:)*@`).exec(authority);
    const hostPort = auth ? authority.slice(auth[0].length) : authority;
    if (hostPort.startsWith("[")) {
      const literal = /^\[([^\]]+)\](?::[0-9]*)?$/.exec(hostPort);
      if (!literal) return false;
      if (/^v[0-9a-f]+\.[A-Za-z0-9._~!$&'()*+,;=:-]+$/i.test(literal[1]!)) return true;
      try { new URL(`http://[${literal[1]}]/`); } catch { return false; }
    } else if (!new RegExp(`^${atom}*(?::[0-9]*)?$`).test(hostPort)) return false;
  } else {
    if (path.startsWith("//")) return false;
    if (!scheme && !path.startsWith("/") && path.split("/")[0]!.includes(":")) return false;
  }
  return true;
}

// RFC 6531 internationalised mailbox: local@domain, non-ASCII allowed.
const IDN_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export const formats = {
  date: fullFormats.date,
  "date-time": fullFormats["date-time"],
  uri: fullFormats.uri,
  email: fullFormats.email,
  "iri-reference": iriReference,
  "idn-email": (s: string) => IDN_EMAIL.test(s),
};
