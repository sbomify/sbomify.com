/** Shared standard-specific traversal and validation, independent of platform scoring. */
import parseLicense from 'spdx-expression-parse';
import type { JsonObject } from '../types';
const isObject = (v: unknown): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v);
const asObjectList = (v: unknown): JsonObject[] => (Array.isArray(v) ? v.filter(isObject) : []);
const pyGet = (v: unknown, key: string): unknown => (isObject(v) ? v[key] : undefined);

export function spdx3Nodes(data: unknown): JsonObject[] {
  const out: JsonObject[] = [];
  const seen = new Set<object>();
  const graph = pyGet(data, '@graph'),
    legacy = pyGet(data, 'elements');
  const container =
    Array.isArray(graph) || isObject(graph) ? graph : Array.isArray(legacy) || isObject(legacy) ? legacy : data;
  const stack: unknown[] = [container];
  while (stack.length) {
    const value = stack.pop();
    if (typeof value !== 'object' || value === null || seen.has(value)) continue;
    seen.add(value);
    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i--) stack.push(value[i]);
    } else if (isObject(value)) {
      if (typeof value.type === 'string' || typeof value['@type'] === 'string') out.push(value);
      const children = Object.values(value);
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }
  }
  return out;
}

export function cdxComponents(data: unknown): JsonObject[] {
  const metadata = pyGet(data, 'metadata');
  const root = pyGet(metadata, 'component');
  const stack = asObjectList(pyGet(data, 'components')).reverse();
  if (isObject(root)) stack.push(root);
  const seen = new Set<object>();
  const out: JsonObject[] = [];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
    for (const child of asObjectList(c.components).reverse()) stack.push(child);
  }
  return out;
}

export const normaliseHash = (v: unknown): string =>
  typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
/** Recognised cryptographic hash functions. This excludes non-cryptographic checksums. */
export const CRYPTO_HASHES: ReadonlySet<string> = new Set([
  'md2',
  'md4',
  'md5',
  'md6',
  'sha1',
  'sha224',
  'sha256',
  'sha384',
  'sha512',
  'sha3224',
  'sha3256',
  'sha3384',
  'sha3512',
  'blake2b256',
  'blake2b384',
  'blake2b512',
  'blake2s256',
  'blake3',
]);
/** NIST SHA-2/SHA-3 choices. Other authorities may approve other algorithms;
 * an algorithm outside this set needs confirmation, rather than a claim of approval.
 */
export const RECOMMENDED_HASHES: ReadonlySet<string> = new Set([
  'sha224',
  'sha256',
  'sha384',
  'sha512',
  'sha3224',
  'sha3256',
  'sha3384',
  'sha3512',
]);
export function cryptoHash(hashes: unknown, alg: string, value: string): boolean {
  return asObjectList(isObject(hashes) ? [hashes] : hashes).some(
    h =>
      CRYPTO_HASHES.has(normaliseHash(h[alg])) && typeof h[value] === 'string' && /^[a-f\d]+$/i.test(h[value] as string)
  );
}
export function validLicense(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    parseLicense(value);
    return true;
  } catch {
    return false;
  }
}

/** NTIA 2021 / CISA 2025 require a date and time, without mandating a UTC offset.
 * Accept the ISO8601 calendar-date forms used by generators, including basic
 * notation and minute precision; BSI uses the stricter format date-time instead.
 */
export function minimumElementsTimestamp(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const match =
    /^(\d{4})-?(\d{2})-?(\d{2})[Tt ](\d{2}):?(\d{2})(?::?(\d{2})(?:[.,](\d+))?)?([Zz]|[+-]\d{2}:?\d{2})?$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second = '00', fraction, rawZone = 'Z'] = match;
  const zone = /^[+-]\d{4}$/.test(rawZone) ? `${rawZone.slice(0, 3)}:${rawZone.slice(3)}` : rawZone;
  return rfc3339(`${year}-${month}-${day}T${hour}:${minute}:${second}${fraction ? '.' + fraction : ''}${zone}`);
}

/** RFC3339 §5.6, including real calendar dates and leap seconds at UTC day end. */
export function rfc3339(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d, h, mi, s] = m.slice(1, 7).map(Number) as [number, number, number, number, number, number];
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const zone = m[7]!;
  const oh = zone.length === 1 ? 0 : Number(zone.slice(1, 3));
  const om = zone.length === 1 ? 0 : Number(zone.slice(4));
  if (mo < 1 || mo > 12 || d < 1 || d > days[mo - 1]! || h > 23 || mi > 59 || s > 60 || oh > 23 || om > 59)
    return false;
  if (s === 60) {
    // Leap seconds are permitted only at the end of a UTC June/December day.
    const base = new Date(`${value.slice(0, 17)}59${zone.toUpperCase()}`);
    if (base.getUTCHours() !== 23 || base.getUTCMinutes() !== 59 || ![5, 11].includes(base.getUTCMonth())) return false;
    if (base.getUTCDate() !== (base.getUTCMonth() === 5 ? 30 : 31)) return false;
  }
  return true;
}

/** RFC9557 §§3–4. Unknown critical annotations must be rejected. */
export function rfc9557(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 512) return false;
  const start = value.indexOf('[');
  if (start < 0) return rfc3339(value);
  const base = value.slice(0, start);
  if (!rfc3339(base)) return false;
  const suffix = value.slice(start);
  const annotations = suffix.match(/\[[^\[\]]+\]/g);
  if (!annotations || annotations.join('') !== suffix) return false;
  let zoneSeen = false;
  for (const [i, annotation] of annotations.entries()) {
    const raw = annotation.slice(1, -1);
    const critical = raw.startsWith('!');
    const item = critical ? raw.slice(1) : raw;
    if (item.includes('=')) {
      // No extension keys are interpreted by this checker.
      if (critical || !/^[a-z][a-z0-9_-]*=[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(item)) return false;
    } else {
      if (zoneSeen || i !== 0) return false;
      zoneSeen = true;
      if (/^[+-]\d{2}:\d{2}$/.test(item)) {
        const hour = Number(item.slice(1, 3)),
          minute = Number(item.slice(4));
        if (hour > 23 || minute > 59) return false;
        // The bracketed fixed offset must agree with the date-time offset.
        const offset = base.match(/([Zz]|[+-]\d{2}:\d{2})$/)![1]!;
        const mins = (s: string) =>
          /^[Zz]$/.test(s) ? 0 : (s[0] === '-' ? -1 : 1) * (Number(s.slice(1, 3)) * 60 + Number(s.slice(4)));
        if (critical && !/^(?:[Zz]|-00:00)$/.test(offset) && mins(item) !== mins(offset)) return false;
      } else {
        if (!/^[A-Za-z._][A-Za-z0-9._+-]*(?:\/[A-Za-z._][A-Za-z0-9._+-]*)*$/.test(item)) return false;
        if (item.split('/').some(part => part === '.' || part === '..')) return false;
        try {
          const date = new Date(base);
          const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: item,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
          }).formatToParts(date);
          const p = Object.fromEntries(parts.map(p => [p.type, p.value]));
          const local = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
          if (critical && !/(?:[Zz]|-00:00)$/.test(base) && local !== base.slice(0, 19).replace('t', 'T')) return false;
        } catch {
          if (critical) return false;
        }
      }
    }
  }
  return true;
}

/** Require explicit dependency knowledge for every component; an arbitrary edge cannot cover an orphan. */
export function dependencyCoverage(
  data: JsonObject,
  format: 'cyclonedx' | 'spdx' | 'spdx3',
  completeness = false
): boolean {
  const components =
    format === 'cyclonedx'
      ? cdxComponents(data)
      : format === 'spdx'
        ? asObjectList(data.packages)
        : spdx3Nodes(data).filter(n => /(?:software_Package|\/Package|^Package)$/.test(String(n.type)));
  const idKey = format === 'cyclonedx' ? 'bom-ref' : format === 'spdx' ? 'SPDXID' : 'spdxId';
  const ids = components.map(c => (typeof c[idKey] === 'string' ? (c[idKey] as string) : ''));
  if (!ids.length || ids.some(id => !id) || new Set(ids).size !== ids.length) return false;
  const covered = new Set<string>();
  const links = new Map<string, string[]>();
  let edges = 0;
  if (format === 'cyclonedx') {
    for (const dep of asObjectList(data.dependencies)) {
      if (typeof dep.ref !== 'string' || !Array.isArray(dep.dependsOn)) continue;
      const targets = dep.dependsOn.filter((v): v is string => typeof v === 'string');
      if (targets.length !== dep.dependsOn.length) return false;
      covered.add(dep.ref);
      links.set(dep.ref, targets);
      edges += targets.length;
    }
    const referenced = new Set(
      components
        .filter(c => asObjectList(c.externalReferences).some(r => r.type === 'bom' && typeof r.url === 'string'))
        .map(c => c['bom-ref'])
    );
    if (!ids.every(id => covered.has(id) || (completeness && referenced.has(id)))) return false;
    if (completeness) {
      const known = new Set<string>();
      for (const comp of asObjectList(data.compositions)) {
        if (!['complete', 'incomplete', 'unknown'].includes(String(comp.aggregate))) continue;
        for (const ref of [
          ...(Array.isArray(comp.assemblies) ? comp.assemblies : []),
          ...(Array.isArray(comp.dependencies) ? comp.dependencies : []),
        ])
          if (typeof ref === 'string') known.add(ref);
      }
      if (!ids.every(id => known.has(id) || referenced.has(id))) return false;
    }
    const root = pyGet(pyGet(data, 'metadata'), 'component');
    const rootId = pyGet(root, 'bom-ref');
    if (typeof rootId === 'string') {
      const visited = new Set<string>(),
        pending = [rootId];
      while (pending.length) {
        const id = pending.pop()!;
        if (visited.has(id)) continue;
        visited.add(id);
        for (const target of links.get(id) ?? []) pending.push(target);
      }
      if (!ids.every(id => visited.has(id))) return false;
    }
  } else {
    const rels =
      format === 'spdx'
        ? asObjectList(data.relationships)
        : spdx3Nodes(data).filter(n => String(n.type).endsWith('Relationship'));
    for (const r of rels) {
      if (typeof r.relationshipType !== 'string') continue;
      if (
        ![
          'DEPENDS_ON',
          'CONTAINS',
          'DEPENDENCY_OF',
          'DESCENDANT_OF',
          'dependsOn',
          'contains',
          'hasPrerequisite',
          'hasStaticLink',
          'hasDynamicLink',
        ].includes(String(r.relationshipType))
      )
        continue;
      if (completeness && !['complete', 'incomplete', 'noAssertion'].includes(String(r.completeness))) return false;
      const from = format === 'spdx' ? r.spdxElementId : r.from;
      const to = format === 'spdx' ? [r.relatedSpdxElement] : Array.isArray(r.to) ? r.to : [r.to];
      if (typeof from !== 'string' || to.some(v => typeof v !== 'string')) continue;
      covered.add(from);
      for (const id of to)
        if (typeof id === 'string') {
          covered.add(id);
          edges++;
        }
    }
    if (!ids.every(id => covered.has(id))) return false;
  }
  return ids.length === 1 || edges > 0;
}
