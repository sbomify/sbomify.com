/**
 * Small helpers that reproduce the Python semantics the sbomify plugins rely
 * on (truthiness, `dict.get`, `str()`, `str.strip()`, `datetime.fromisoformat`)
 * so the TypeScript ports score a document exactly as the app does.
 *
 * Everything here takes `unknown`: SBOM input is hostile and nothing may throw.
 */

import type { JsonObject } from "../types";

/** A plain JSON object (Python `isinstance(x, dict)`). */
export function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Python `x if isinstance(x, list) else []`. */
export function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Only the dict members of a list value; anything else is an empty list. */
export function asObjectList(value: unknown): JsonObject[] {
  return asList(value).filter(isObject);
}

/** Python truthiness for JSON values: None, False, 0, "", [] and {} are falsy. */
export function truthy(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "number") return value !== 0 && !Number.isNaN(value) ? true : Number.isNaN(value);
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Set || value instanceof Map) return value.size > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/** Whether `obj` is a dict that has `key` as its own member (Python `key in d`). */
export function hasKey(obj: unknown, key: string): boolean {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Python `d.get(key, default)`. A present key whose value is null returns
 * null (Python None), not the default. A non-dict returns the default rather
 * than raising.
 */
export function pyGet(obj: unknown, key: string, dflt: unknown = null): unknown {
  if (!hasKey(obj, key)) return dflt;
  return (obj as JsonObject)[key];
}

/** Python `repr()` for JSON values, close enough for substring checks and display. */
export function pyRepr(value: unknown): string {
  if (typeof value === "string") {
    const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
    let out = "";
    for (const ch of value) {
      if (ch === "\\") out += "\\\\";
      else if (ch === quote) out += "\\" + ch;
      else if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else if (ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f) {
        out += "\\x" + ch.charCodeAt(0).toString(16).padStart(2, "0");
      } else out += ch;
    }
    return quote + out + quote;
  }
  if (Array.isArray(value)) return "[" + value.map(pyRepr).join(", ") + "]";
  if (isObject(value)) {
    return "{" + Object.entries(value).map(([k, v]) => `${pyRepr(k)}: ${pyRepr(v)}`).join(", ") + "}";
  }
  return pyStr(value);
}

/** Python `str()` for JSON values. */
export function pyStr(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "nan";
    if (!Number.isFinite(value)) return value > 0 ? "inf" : "-inf";
    return String(value);
  }
  return pyRepr(value);
}

/** The characters Python's `str.isspace()` accepts (no-arg strip/split use these). */
const PY_WHITESPACE =
  "\t\n\v\f\r\x1c\x1d\x1e\x1f \x85\xa0                　";
const PY_WS_CLASS = `[${PY_WHITESPACE.replace(/[\\\]^-]/g, "\\$&")}]`;
const LEADING_WS = new RegExp(`^${PY_WS_CLASS}+`);
const TRAILING_WS = new RegExp(`${PY_WS_CLASS}+$`);
const WS_RUN = new RegExp(`${PY_WS_CLASS}+`);

/** Python `str.strip()` with no arguments. */
export function pyStrip(text: string): string {
  return text.replace(LEADING_WS, "").replace(TRAILING_WS, "");
}

/** Python `str.split()` with no arguments. */
export function pySplit(text: string): string[] {
  const stripped = pyStrip(text);
  return stripped === "" ? [] : stripped.split(WS_RUN);
}

/** Python `str.rsplit(sep, 1)[-1]`. */
export function lastSegment(text: string, sep: string): string {
  const i = text.lastIndexOf(sep);
  return i < 0 ? text : text.slice(i + sep.length);
}

/** Escape for use outside a character class in a `u`-flag RegExp (Python `re.escape`). */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** Python's Unicode `\w` (str.isalnum() or "_"); JS `\w` is ASCII-only. */
export const PY_WORD_CHAR = "[\\p{L}\\p{N}_]";

// ---------------------------------------------------------------------------
// Affected-list helpers
// ---------------------------------------------------------------------------

/** How many names a finding lists before it truncates. */
export const AFFECTED_CAP = 25;

/** `affected` (capped) and `affectedCount` (total) for a finding, or nothing. */
export function affectedFields(
  names: readonly string[],
  cap: number = AFFECTED_CAP,
): { affected?: string[]; affectedCount?: number } {
  if (names.length === 0) return {};
  return { affected: names.slice(0, cap), affectedCount: names.length };
}

/** "Missing for 3 components." */
export function missingForSentence(count: number): string {
  return `Missing for ${count} ${count === 1 ? "component" : "components"}.`;
}

/**
 * A display label for a component, matching Python's `x.get("name", fallback)`
 * where the result is a usable string, and the fallback otherwise. Python
 * would put a non-string name into the list as-is (and crash on `join`);
 * an empty name would display as an empty entry.
 */
export function displayName(value: unknown, fallback: string): string {
  if (typeof value === "string" && value !== "") return value;
  if (value === null || value === undefined || value === "") return fallback;
  return pyStr(value);
}

// ---------------------------------------------------------------------------
// ISO-8601: Python `datetime.fromisoformat` (CPython 3.11+)
// ---------------------------------------------------------------------------
//
// A line-for-line port of the C implementation in Modules/_datetimemodule.c,
// which is what the app runs, not the pure-Python fallback: the two disagree
// on edge cases (the C parser ignores one stray character before an offset,
// "10:10:10.Z" parses, and so on). It works on the UTF-8 bytes of the string
// with a NUL terminator, exactly like the C code, because several of those
// quirks come from reading one byte past a component.

/** A NUL-terminated byte buffer: reads past the end return 0, as in C. */
class CBuf {
  constructor(private readonly bytes: number[]) {}
  at(i: number): number {
    return i >= 0 && i < this.bytes.length ? this.bytes[i]! : 0;
  }
  get length(): number {
    return this.bytes.length;
  }
}

function utf8(codePoints: number[]): number[] {
  const out: number[] = [];
  for (const cp of codePoints) {
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return out;
}

const CH = (c: string): number => c.charCodeAt(0);
const isDigitByte = (b: number): boolean => b >= 48 && b <= 57;

/** parse_digits: returns the new position, or -1 on a non-digit. */
function parseDigits(buf: CBuf, pos: number, count: number, out: { v: number }): number {
  for (let i = 0; i < count; i++) {
    const b = buf.at(pos++);
    if (!isDigitByte(b)) return -1;
    out.v = out.v * 10 + (b - 48);
  }
  return pos;
}

function isLeap(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysInMonth(y: number, m: number): number {
  if (m === 2 && isLeap(y)) return 29;
  return DAYS_IN_MONTH[m] ?? 0;
}

/** ymd_to_ord: 0001-01-01 is day 1. */
function ymdToOrd(y: number, m: number, d: number): number {
  const y1 = y - 1;
  let days = y1 * 365 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400);
  for (let i = 1; i < m; i++) days += daysInMonth(y, i);
  return days + d;
}

function ordToYmd(ord: number): [number, number, number] {
  let year = Math.max(1, Math.floor(ord / 365.2425));
  while (ymdToOrd(year + 1, 1, 1) <= ord) year++;
  while (year > 1 && ymdToOrd(year, 1, 1) > ord) year--;
  let rem = ord - ymdToOrd(year, 1, 1) + 1;
  let month = 1;
  while (month < 12 && rem > daysInMonth(year, month)) {
    rem -= daysInMonth(year, month);
    month++;
  }
  return [year, month, rem];
}

function findSeparator(buf: CBuf, len: number): number {
  if (len === 7) return 7;
  if (buf.at(4) === CH("-")) {
    if (buf.at(5) === CH("W")) {
      if (len < 8) return -1;
      if (len > 8 && buf.at(8) === CH("-")) {
        if (len === 9) return -1;
        if (len > 10 && isDigitByte(buf.at(10))) return 8;
        return 10;
      }
      return 8;
    }
    return 10;
  }
  if (buf.at(4) === CH("W")) {
    let idx = 7;
    for (; idx < len; idx++) if (!isDigitByte(buf.at(idx))) break;
    if (idx < 9) return idx;
    return idx % 2 === 0 ? 7 : 8;
  }
  return 8;
}

/** parse_isoformat_date: [y, m, d] or null. */
function parseIsoDate(buf: CBuf, len: number): [number, number, number] | null {
  let p = 0;
  const year = { v: 0 };
  p = parseDigits(buf, p, 4, year);
  if (p < 0) return null;
  const usesSep = buf.at(p) === CH("-");
  if (usesSep) p++;
  if (buf.at(p) === CH("W")) {
    p++;
    const week = { v: 0 };
    const day = { v: 0 };
    p = parseDigits(buf, p, 2, week);
    if (p < 0) return null;
    if (p < len) {
      if (usesSep && buf.at(p++) !== CH("-")) return null;
      p = parseDigits(buf, p, 1, day);
      if (p < 0) return null;
    } else {
      day.v = 1;
    }
    // iso_to_ymd
    if (year.v < 1 || year.v > 9999) return null;
    if (week.v <= 0 || week.v >= 53) {
      let outOfRange = true;
      if (week.v === 53) {
        const firstWeekday = ymdToOrd(year.v, 1, 1) % 7;
        if (firstWeekday === 4 || (firstWeekday === 3 && isLeap(year.v))) outOfRange = false;
      }
      if (outOfRange) return null;
    }
    if (day.v <= 0 || day.v >= 8) return null;
    const firstDay = ymdToOrd(year.v, 1, 1);
    const weekday = (firstDay + 6) % 7;
    const week1Monday = firstDay - weekday + (weekday > 3 ? 7 : 0);
    return ordToYmd(week1Monday + (week.v - 1) * 7 + day.v - 1);
  }
  const month = { v: 0 };
  const day = { v: 0 };
  p = parseDigits(buf, p, 2, month);
  if (p < 0) return null;
  if (usesSep && buf.at(p++) !== CH("-")) return null;
  p = parseDigits(buf, p, 2, day);
  if (p < 0) return null;
  return [year.v, month.v, day.v];
}

interface TimeParts {
  hour: number;
  minute: number;
  second: number;
  micro: number;
}

/** parse_hh_mm_ss_ff over [start, end): <0 error, 0 ok, 1 ok with trailing bytes. */
function parseHhMmSsFf(buf: CBuf, start: number, end: number, out: TimeParts): number {
  const vals = [{ v: 0 }, { v: 0 }, { v: 0 }];
  let p = start;
  let hasSep = true;
  let broke = false;
  for (let i = 0; i < 3; i++) {
    p = parseDigits(buf, p, 2, vals[i]!);
    if (p < 0) return -3;
    const c = buf.at(p++);
    if (i === 0) hasSep = c === CH(":");
    if (p >= end) {
      out.hour = vals[0]!.v;
      out.minute = vals[1]!.v;
      out.second = vals[2]!.v;
      out.micro = 0;
      return c !== 0 ? 1 : 0;
    } else if (hasSep && c === CH(":")) {
      if (i === 2) return -4;
      continue;
    } else if (c === CH(".") || c === CH(",")) {
      if (i < 2) return -3;
      broke = true;
      break;
    } else if (!hasSep) {
      p--;
    } else {
      return -4;
    }
  }
  void broke;
  out.hour = vals[0]!.v;
  out.minute = vals[1]!.v;
  out.second = vals[2]!.v;
  const remains = end - p;
  const toParse = remains >= 6 ? 6 : remains;
  const micro = { v: 0 };
  p = parseDigits(buf, p, toParse, micro);
  if (p < 0) return -3;
  out.micro = toParse > 0 && toParse < 6 ? micro.v * 10 ** (6 - toParse) : micro.v;
  while (isDigitByte(buf.at(p))) p++;
  return buf.at(p) !== 0 ? 1 : 0;
}

/** parse_isoformat_time: null on error, else parts plus the UTC offset in microseconds. */
function parseIsoTime(buf: CBuf, start: number, len: number): (TimeParts & { offsetMicros: number }) | null {
  const end = start + len;
  let tz = start;
  do {
    const b = buf.at(tz);
    if (b === CH("Z") || b === CH("+") || b === CH("-")) break;
  } while (++tz < end);
  const t: TimeParts = { hour: 0, minute: 0, second: 0, micro: 0 };
  const rv = parseHhMmSsFf(buf, start, tz, t);
  if (rv < 0) return null;
  if (tz === end) return rv === 1 ? null : { ...t, offsetMicros: 0 };
  if (buf.at(tz) === CH("Z")) return buf.at(tz + 1) !== 0 ? null : { ...t, offsetMicros: 0 };
  const sign = buf.at(tz) === CH("-") ? -1 : 1;
  const o: TimeParts = { hour: 0, minute: 0, second: 0, micro: 0 };
  const rv2 = parseHhMmSsFf(buf, tz + 1, end, o);
  if (rv2 !== 0) return null;
  return { ...t, offsetMicros: sign * (((o.hour * 60 + o.minute) * 60 + o.second) * 1_000_000 + o.micro) };
}

/**
 * Whether Python's `datetime.fromisoformat(s)` accepts `s`. Date-only forms
 * (YYYY-MM-DD, YYYYMMDD, week dates), any single character as the date/time
 * separator, comma or dot fractions of any length, and Z or ±HH[:MM[:SS[.f]]]
 * offsets strictly inside ±24h.
 */
export function pyFromIsoFormat(s: string): boolean {
  const cps: number[] = [];
  for (const ch of s) cps.push(ch.codePointAt(0)!);
  if (cps.length < 7) return false;
  // _sanitize_isoformat_str: a lone surrogate is allowed only as the separator.
  const isSurrogate = (cp: number): boolean => cp >= 0xd800 && cp <= 0xdfff;
  for (const pos of [7, 8, 10]) {
    if (pos > cps.length) break;
    if (pos < cps.length && isSurrogate(cps[pos]!)) {
      cps[pos] = CH("T");
      break;
    }
  }
  if (cps.some(isSurrogate)) return false;
  const bytes = utf8(cps);
  const buf = new CBuf(bytes);
  const len = bytes.length;

  const sepLoc = findSeparator(buf, len);
  if (sepLoc < 0) return false;
  const date = parseIsoDate(buf, sepLoc);
  if (!date) return false;
  let [year, month, day] = date;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let micro = 0;
  let offset = 0;
  if (len > sepLoc) {
    let p = sepLoc + 1;
    const lead = buf.at(sepLoc);
    if (lead & 0x80) {
      const hi = lead & 0xf0;
      p += hi === 0xe0 ? 2 : hi === 0xf0 ? 3 : 1;
    }
    const time = parseIsoTime(buf, p, len - p);
    if (!time) return false;
    ({ hour, minute, second, micro } = time);
    offset = time.offsetMicros;
  }
  if (hour === 24) {
    if (minute !== 0 || second !== 0 || micro !== 0) return false;
    hour = 0;
    if (month >= 1 && month <= 12 && day <= daysInMonth(year, month)) {
      day += 1;
      if (day > daysInMonth(year, month)) {
        day = 1;
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    }
  }
  if (Math.abs(offset) >= 24 * 3600 * 1_000_000) return false;
  if (year < 1 || year > 9999 || month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  if (hour > 23 || minute > 59 || second > 59 || micro > 999_999) return false;
  return true;
}

/**
 * The plugins' `_validate_timestamp`: falsy → invalid, otherwise
 * `datetime.fromisoformat(timestamp.replace("Z", "+00:00"))` must succeed.
 * A truthy non-string is invalid here; the Python raised AttributeError.
 */
export function isValidIsoTimestamp(timestamp: unknown): boolean {
  if (!truthy(timestamp) || typeof timestamp !== "string") return false;
  return pyFromIsoFormat(timestamp.replaceAll("Z", "+00:00"));
}
