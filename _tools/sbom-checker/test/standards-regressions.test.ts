/** Regression evidence for review F01–F17. Clause references: ../STANDARDS.md. */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { detect } from '../src/detect';
import { FRAMEWORKS } from '../src/frameworks';
import { validTimestamp } from '../src/frameworks/cisa-2026';
import { rfc3339, validLicense } from '../src/frameworks/standards';
import { checkRef, extractRefs, verifyHashes, type ExternalRef } from '../src/refs';
import { iriReference } from '../src/schema/formats';
import { validateSchema } from '../src/validate';
import type { JsonObject } from '../src/types';

type Doc = Record<string, any>;
const read = (file: string): Doc => JSON.parse(readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8'));
const cdx = (): Doc => read('cases/cdx16-complete.json');
const spdx = (): Doc => read('cases/spdx23-complete.json');
const graph = (): Doc => read('cisa-2026-spdx3-corpus.json').minimal_conformant;
const check = (d: Doc, id: string) => FRAMEWORKS.flatMap(f => f.assess(detect(d))).find(f => f.id === id)!;
const versionIds = [
  'ntia-2021:version',
  'cisa-2025:component-version',
  'cisa-2026:component-version',
  'bsi-tr03183:component-version',
];
const deps = [
  'ntia-2021:dependency-relationship',
  'cisa-2025:dependency-relationship',
  'cisa-2026:component-dependency-relationship',
  'bsi-tr03183:dependencies',
];
const valid = async (d: Doc) => expect((await validateSchema(detect(d))).status).toBe('valid');
const reference = (extra: Partial<ExternalRef> = {}): ExternalRef => ({
  url: 'https://example.test/bom',
  kind: 'bom',
  type: 'bom',
  source: 'test',
  hashes: {},
  ...extra,
});
const mockFetch = (fn: (u: any, init?: RequestInit) => Promise<Response>) => fn as unknown as typeof fetch;

// Each scenario validates its input against an official schema before checking the finding.
describe('schema-valid standards regressions', () => {
  test('F01 primary and nested components cannot escape any version check', async () => {
    for (const primary of [true, false]) {
      const d = cdx();
      if (primary) delete d.metadata.component.version;
      else d.components[0].components = [{ type: 'library', name: 'nested', 'bom-ref': 'nested' }];
      await valid(d);
      for (const id of versionIds) expect(check(d, id).status).toBe('fail');
    }
  });
  test('F02 shipped file components and arbitrary SPDXID strings require versions', async () => {
    const c = cdx();
    c.components[0].type = 'file';
    delete c.components[0].version;
    const s = spdx();
    s.packages[0].SPDXID = 'SPDXRef-File-RealApplication';
    delete s.packages[0].versionInfo;
    for (const d of [c, s]) {
      await valid(d);
      for (const id of versionIds) expect(check(d, id).status).toBe('fail');
    }
  });
  test('F03 legal embedded SPDX3 elements and inline CreationInfo are assessed', async () => {
    const d = graph(),
      nodes = d['@graph'];
    const root = structuredClone(nodes.find((n: Doc) => n.type === 'SpdxDocument'));
    root['@context'] = d['@context'];
    root.creationInfo = nodes.find((n: Doc) => n.type === 'CreationInfo');
    root.element = nodes.filter((n: Doc) => !['CreationInfo', 'SpdxDocument'].includes(n.type));
    delete root.element.find((n: Doc) => n.type === 'software_Package').software_packageVersion;
    await valid(root);
    expect(detect(root).schemaVersion).toBe('3.0.1');
    for (const id of versionIds) expect(check(root, id).status).toBe('fail');
  });
  test('F04 a fabricated inline signature is never proof of author authenticity', async () => {
    const d = cdx();
    d.signature = { algorithm: 'RS256', value: 'AAAA' };
    await valid(d);
    expect(check(d, 'cisa-2026:sbom-author-signature').status).toBe('warning');
    delete d.signature;
    expect(check(d, 'cisa-2026:sbom-author-signature').status).toBe('warning');
  });
  test('F05 SHA256 alone fails BSI; ADLER32 is not a cryptographic hash', async () => {
    const d = cdx();
    for (const c of [d.metadata.component, ...d.components]) {
      c.hashes = [{ alg: 'SHA-256', content: 'a'.repeat(64) }];
      for (const r of c.externalReferences) if (r.hashes) r.hashes = c.hashes;
    }
    await valid(d);
    expect(check(d, 'bsi-tr03183:hash-value').status).toBe('fail');
    const s = spdx();
    for (const p of s.packages) p.checksums = [{ algorithm: 'ADLER32', checksumValue: '00000001' }];
    await valid(s);
    for (const id of [
      'cisa-2025:component-hash',
      'cisa-2026:component-hash-value',
      'cisa-2026:component-hash-algorithm',
    ])
      expect(check(s, id).status).toBe('fail');
  });
  test('F06 nested acknowledgements distinguish original and distribution licenses', async () => {
    const d = cdx();
    await valid(d);
    expect(check(d, 'bsi-tr03183:original-licences').status).toBe('pass');
    d.components[0].licenses = [{ license: { id: 'MIT', acknowledgement: 'declared' } }];
    await valid(d);
    expect(check(d, 'bsi-tr03183:distribution-licences').status).toBe('fail');
    expect(check(d, 'bsi-tr03183:original-licences').status).toBe('pass');
    d.components[0].licenses = [{ expression: 'MIT AND', acknowledgement: 'concluded' }];
    await valid(d);
    expect(check(d, 'bsi-tr03183:distribution-licences').status).toBe('fail');
    expect(validLicense('MIT AND Apache-2.0')).toBe(true);
    expect(validLicense('MIT AND')).toBe(false);
  });
  test('F07 one edge cannot cover an orphan or unknown leaf dependencies', async () => {
    const d = cdx();
    d.components.push({ type: 'library', name: 'orphan', version: '1', 'bom-ref': 'orphan' });
    await valid(d);
    for (const id of deps) expect(check(d, id).status).toBe('fail');
    const leaf = cdx();
    leaf.dependencies = leaf.dependencies.filter((n: Doc) => n.dependsOn.length);
    await valid(leaf);
    for (const id of deps) expect(check(leaf, id).status).toBe('fail');
    const scoped = cdx();
    scoped.compositions = [{ aggregate: 'complete', assemblies: [scoped.metadata.component['bom-ref']] }];
    await valid(scoped);
    expect(check(scoped, 'bsi-tr03183:dependencies').status).toBe('fail');
    // SPDX coverage must also include every package, not just any edge.
    for (const s of [spdx(), graph()]) {
      if (s.packages) s.packages.push({ ...s.packages[0], SPDXID: 'SPDXRef-Orphan' });
      else s['@graph'].push({ ...s['@graph'].find((n: Doc) => n.type === 'software_Package'), spdxId: 'urn:orphan' });
      await valid(s);
      for (const id of deps.slice(0, 3)) expect(check(s, id).status).toBe('fail');
    }
  });
  test('F09 BSI purpose absence with interpretation comment encodes negative flags', async () => {
    const d = graph(),
      ci = d['@graph'].find((n: Doc) => n.type === 'CreationInfo'),
      pkg = d['@graph'].find((n: Doc) => n.type === 'software_Package');
    d['@graph'].push({
      type: 'software_File',
      spdxId: 'urn:artifact',
      creationInfo: ci['@id'],
      name: 'app.bin',
      software_additionalPurpose: ['firmware'],
      comment: 'software_additionalPurpose field is used to indicate the properties of BSI TR-03183-2',
      verifiedUsing: [{ type: 'Hash', algorithm: 'sha512', hashValue: 'a'.repeat(128) }],
    });
    d['@graph'].push({
      type: 'Relationship',
      spdxId: 'urn:artifact-rel',
      creationInfo: ci['@id'],
      from: pkg.spdxId,
      to: ['urn:artifact'],
      relationshipType: 'hasDistributionArtifact',
      completeness: 'complete',
    });
    await valid(d);
    for (const key of ['executable-property', 'archive-property', 'structured-property'])
      expect(check(d, `bsi-tr03183:${key}`).status).toBe('pass');
  });
  test('F10 BSI referenced components use reduced descriptions; ambiguous scopes warn', async () => {
    const d = cdx();
    delete d.components[0].hashes;
    delete d.components[0].properties;
    d.components[0].externalReferences = [{ type: 'bom', url: 'https://example.test/component-bom.json' }];
    await valid(d);
    for (const field of ['filename', 'hash-value', 'executable-property', 'archive-property', 'structured-property'])
      expect(check(d, `bsi-tr03183:${field}`).status).toBe('pass');
    d.components[0].externalReferences = [];
    await valid(d);
    expect(check(d, 'bsi-tr03183:filename').status).toBe('warning');
  });
  test('F11 signing is a BSI recommendation, not a mandatory conformance field', () => {
    const f = check(cdx(), 'bsi-tr03183:attestation-check');
    expect(f.status).toBe('warning');
    expect(f.description).toContain('recommended');
    expect(f.remediation).not.toContain('requires digital signature');
  });
  test('F13 author names, tool versions, and component UUIDs keep distinct meanings', async () => {
    const d = cdx();
    d.metadata.authors = [{ email: 'sbom@example.test' }];
    delete d.metadata.manufacturer;
    await valid(d);
    expect(check(d, 'cisa-2026:sbom-author').status).toBe('fail');
    const s = graph();
    const t = s['@graph'].find((n: Doc) => n.type === 'Tool');
    t.name = 'unversioned-tool';
    t.externalIdentifier = [
      { type: 'ExternalIdentifier', externalIdentifierType: 'other', identifier: 'urn:tool:stable-id' },
    ];
    await valid(s);
    expect(check(s, 'cisa-2026:sbom-tool-version').status).toBe('fail');
    const p = s['@graph'].find((n: Doc) => n.type === 'software_Package');
    delete p.software_packageUrl;
    p.externalIdentifier = [
      {
        type: 'ExternalIdentifier',
        externalIdentifierType: 'other',
        identifier: 'urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79',
      },
    ];
    await valid(s);
    expect(check(s, 'cisa-2026:component-identifiers').status).toBe('pass');
  });
});

test('F08 RFC3339 dates and RFC9557 critical suffix consumption', () => {
  for (const v of ['2026-01-01', '2026-01-01T01:02:03', '2026-02-30T00:00:00Z']) expect(rfc3339(v)).toBe(false);
  expect(rfc3339('2016-12-31T23:59:60Z')).toBe(true);
  expect(rfc3339('2017-01-01T00:59:60+01:00')).toBe(true);
  expect(rfc3339('2016-12-31T12:00:60Z')).toBe(false);
  expect(validTimestamp('2026-07-29T10:00:00+02:00[+02:00]')).toBe(true);
  expect(validTimestamp('2026-07-29T10:00:00Z[!unknown=x]')).toBe(false);
  expect(validTimestamp('2026-07-29T10:00:00Z[unknown=x]')).toBe(true);
  expect(validTimestamp('2026-07-29T10:00:00Z[!Europe/Paris]')).toBe(true);
  expect(validTimestamp('2026-07-29T10:00:00+01:00[!Europe/Paris]')).toBe(false);
  expect(validTimestamp('2026-07-29T10:00:00Z[_experiment=x]')).toBe(false);
});

test('F12 every digest and conflicting duplicate URL assertion is preserved', async () => {
  const buf = new TextEncoder().encode('hello').buffer;
  const good = new Bun.CryptoHasher('sha256').update('hello').digest('hex');
  expect((await verifyHashes(buf, { 'sha-256': good, 'sha-512': '0'.repeat(128) })).status).toBe('mismatch');
  const d = cdx();
  d.externalReferences = [good, '0'.repeat(64)].map(content => ({
    type: 'bom',
    url: 'https://example.test/same',
    hashes: [{ alg: 'SHA-256', content }],
  }));
  const refs = extractRefs(detect(d));
  const r = refs.find(r => r.url.endsWith('/same'))!;
  expect((await verifyHashes(buf, r.hashes)).status).toBe('mismatch');
  expect((await verifyHashes(buf, { 'sha-256': good, md5: '0'.repeat(32) })).status).toBe('unverifiable');
});
test('F14 full IRI grammar rejects malformed escapes, authority and paths', async () => {
  for (const value of [
    'https://example.test/%ZZ',
    'https://[broken/a',
    'https://example.test/[bad',
    'a b',
    'https://example.test:abc/path',
  ])
    expect(iriReference(value)).toBe(false);
  for (const value of ['https://例え.jp/道', '../relative?x=1', 'https://[::1]/a%20b', ''])
    expect(iriReference(value)).toBe(true);
  const d = cdx();
  d.externalReferences = [{ type: 'website', url: 'https://example.test/%ZZ' }];
  expect((await validateSchema(detect(d))).status).toBe('invalid');
});
test('F15 SPDX namespace identities are not fetched or expanded as physical SBOMs', async () => {
  const d = spdx();
  d.externalDocumentRefs = [
    {
      externalDocumentId: 'DocumentRef-x',
      spdxDocument: 'https://example.test/namespace',
      checksum: { algorithm: 'SHA256', checksumValue: '0'.repeat(64) },
    },
  ];
  const r = extractRefs(detect(d)).find(r => r.type === 'externalDocumentRef')!;
  let requests = 0;
  const result = await checkRef(r, {
    fetchImpl: mockFetch(async () => {
      requests++;
      return new Response('{}');
    }),
  });
  expect(requests).toBe(0);
  expect(result.status).toBe('skipped');
  expect(result.body).toBeUndefined();
});
test('F16 streaming size cap cancels without buffering a whole unbounded body', async () => {
  let pulls = 0,
    cancelled = false;
  const response = new Response(
    new ReadableStream<Uint8Array>({
      pull(c) {
        pulls++;
        c.enqueue(new Uint8Array(8));
      },
      cancel() {
        cancelled = true;
      },
    })
  );
  const result = await checkRef(reference({ hashes: { sha256: 'a' } }), {
    maxBodyBytes: 10,
    fetchImpl: mockFetch(async () => response),
  });
  expect(result.body).toBeUndefined();
  expect(result.hash?.status).toBe('unverifiable');
  expect(cancelled).toBe(true);
  expect(pulls).toBeLessThan(5);
});
test('F16 deadlines cover stalled bodies and HEAD-to-GET fallback', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const read = await checkRef(reference(), { timeoutMs: 20, fetchImpl: mockFetch(async () => new Response(body)) });
  expect(read.status).toBe('unreachable');
  expect(cancelled).toBe(true);
  const fallback = await checkRef(reference({ kind: 'other' }), {
    timeoutMs: 20,
    fetchImpl: mockFetch(async (_u, init) =>
      init?.method === 'HEAD' ? new Response(null, { status: 405 }) : new Promise<Response>(() => {})
    ),
  });
  expect(fallback.status).toBe('unreachable');
});
test('F17 future versions are unsupported instead of mapped onto an older schema', async () => {
  const d = cdx();
  d.specVersion = '1.99';
  expect(detect(d).schemaVersion).toBeNull();
  expect(check(d, 'bsi-tr03183:sbom-format').status).toBe('warning');
  const s = graph();
  s['@graph'].find((n: Doc) => n.type === 'CreationInfo').specVersion = '3.0.99';
  expect(detect(s).schemaVersion).toBeNull();
  expect((await validateSchema(detect(s))).status).toBe('unsupported');
});
test('reference extraction traverses metadata children, nested services and embedded SPDX3', () => {
  const d = cdx();
  d.metadata.component.components = [
    { name: 'child', externalReferences: [{ type: 'website', url: 'https://example.test/child' }] },
  ];
  d.services = [
    {
      name: 'outer',
      services: [{ name: 'inner', externalReferences: [{ type: 'website', url: 'https://example.test/inner' }] }],
    },
  ];
  const urls = extractRefs(detect(d)).map(r => r.url);
  expect(urls).toContain('https://example.test/child');
  expect(urls).toContain('https://example.test/inner');
  const root: JsonObject = {
    '@context': 'https://spdx.org/rdf/3.0.1/spdx-context.jsonld',
    type: 'SpdxDocument',
    element: [
      {
        type: 'software_Package',
        externalRef: [{ type: 'ExternalRef', externalRefType: 'vcs', locator: ['https://example.test/src'] }],
      },
    ],
  };
  expect(extractRefs(detect(root)).map(r => r.url)).toContain('https://example.test/src');
});

test('CISA distinguishes cryptographic output from an unestablished algorithm approval', async () => {
  const d = spdx();
  for (const p of d.packages) p.checksums = [{ algorithm: 'MD5', checksumValue: 'a'.repeat(32) }];
  await valid(d);
  expect(check(d, 'cisa-2025:component-hash').status).toBe('pass');
  expect(check(d, 'cisa-2026:component-hash-value').status).toBe('pass');
  expect(check(d, 'cisa-2026:component-hash-algorithm').status).toBe('warning');
});

test("minimum-elements date-and-time fields do not invent BSI's offset requirement", () => {
  const d = cdx();
  d.metadata.timestamp = '2026-07-29T10:00:00';
  expect(check(d, 'ntia-2021:timestamp').status).toBe('pass');
  expect(check(d, 'cisa-2025:timestamp').status).toBe('pass');
  expect(check(d, 'bsi-tr03183:timestamp').status).toBe('fail');
  expect(check(d, 'cisa-2026:sbom-timestamp').status).toBe('fail');
});
