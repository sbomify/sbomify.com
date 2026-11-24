/**
 * SBOM checker page controller.
 *
 * The page (layouts/tools/sbom-checker.html) renders the upload form as
 * plain HTML; this script wires it up, hands files to the worker and renders
 * the results. Everything stays in the browser: the SBOM is never uploaded.
 * Untrusted SBOM text only ever reaches the DOM through textContent or
 * attribute setters, never innerHTML.
 */
import type { Analysis } from "./analyse";
import { refsProps, resultProps, setTool, sizeBucket, track } from "./analytics";
import { fixSummary, linksFor } from "./links";
import { checkRefs, type ExternalRef, type RefCheck } from "./refs";
import type { BomKind, Finding, FrameworkResult } from "./types";
import { MAX_ISSUES, type SchemaResult } from "./validate";

/** Largest file accepted. Validation of very large SPDX 3 graphs is slow. */
const MAX_FILE_BYTES = 50 * 1024 * 1024;
/** How deep referenced SBOMs are followed, and how many in total. */
const MAX_DEPTH = 2;
const MAX_NESTED = 10;
/** Upper bound on references checked in one go. */
const MAX_REFS = 150;

type Child = Node | string | null | undefined | false;

/** Which checker this page is (data-kind on the root): the SBOM checker or the CBOM, HBOM or AIBOM validator. */
let kind: BomKind = "sbom";
const noun = () => kind.toUpperCase();

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string | boolean | undefined> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === "class") el.className = String(v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

function icon(name: string, cls = ""): Node {
  const tpl = document.getElementById(`checker-icon-${name}`) as HTMLTemplateElement | null;
  const node = tpl?.content.firstElementChild?.cloneNode(true) as Element | undefined;
  if (!node) return document.createTextNode("");
  if (cls) node.setAttribute("class", `${node.getAttribute("class") ?? ""} ${cls}`.trim());
  return node;
}

const STATUS_LABEL: Record<Finding["status"], string> = { pass: "Pass", fail: "Fail", warning: "Warning", error: "Error" };
const STATUS_ICON: Record<Finding["status"], string> = { pass: "pass", fail: "fail", warning: "warning", error: "fail" };

function pill(status: Finding["status"] | "info", label?: string): HTMLElement {
  const iconName = status === "info" ? "info" : STATUS_ICON[status];
  return h("span", { class: `checker-pill is-${status}` }, icon(iconName), label ?? (status === "info" ? "Info" : STATUS_LABEL[status]));
}

// ---------------------------------------------------------------- worker

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, (a: Analysis) => void>();

function getWorker(url: string): Worker {
  if (worker) return worker;
  worker = new Worker(url, { type: "module" });
  worker.onmessage = (e: MessageEvent<{ id: number; result: Analysis }>) => {
    pending.get(e.data.id)?.(e.data.result);
    pending.delete(e.data.id);
  };
  worker.onerror = () => {
    for (const [id, resolve] of pending) resolve({ ok: false, name: "", error: "The checker failed to start in this browser.", errorKind: "worker_failed" }), pending.delete(id);
    worker = null;
  };
  return worker;
}

function analyseInWorker(workerUrl: string, text: string, name: string): Promise<Analysis> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    getWorker(workerUrl).postMessage({ id, text, name, kind });
  });
}

// ---------------------------------------------------------------- page

export function init(root: HTMLElement): void {
  const workerUrl = root.dataset.worker;
  if (!workerUrl) return;
  const k = root.dataset.kind;
  kind = k === "cbom" || k === "hbom" || k === "aibom" ? k : "sbom";
  setTool(kind);
  const form = root.querySelector<HTMLFormElement>("[data-checker-form]")!;
  const input = root.querySelector<HTMLInputElement>("[data-checker-file]")!;
  const drop = root.querySelector<HTMLElement>("[data-checker-drop]")!;
  const paste = root.querySelector<HTMLTextAreaElement>("[data-checker-paste]");
  const pasteBtn = root.querySelector<HTMLButtonElement>("[data-checker-paste-run]");
  const exampleBtns = root.querySelectorAll<HTMLButtonElement>("[data-checker-example]");
  const out = root.querySelector<HTMLElement>("[data-checker-results]")!;
  const status = root.querySelector<HTMLElement>("[data-checker-status]")!;
  root.classList.add("is-ready");

  let running = false;
  let runs = 0;
  type Source = { source: "file" | "drop" | "paste" | "example"; example?: string; bytes: number; gzipped?: boolean };
  const run = async (text: string, name: string, src: Source) => {
    if (running) return;
    running = true;
    runs += 1;
    const base = { source: src.source, example: src.example, run_index: runs };
    track("input", { ...base, size_bucket: sizeBucket(src.bytes), gzipped: src.gzipped ?? false });
    root.classList.add("is-busy");
    status.textContent = `Checking ${name}…`;
    out.replaceChildren();
    const started = performance.now();
    const analysis = await analyseInWorker(workerUrl, text, name);
    running = false;
    root.classList.remove("is-busy");
    status.textContent = analysis.ok ? `Checked ${name}.` : `Could not check ${name}.`;
    const view = renderAnalysis(analysis, { workerUrl, depth: 0, budget: { nested: 0 } });
    out.replaceChildren(view, analysis.ok ? renderCta(analysis) : renderCta(null));
    out.hidden = false;
    out.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    out.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    track("result", { ...base, depth: 0, ...resultProps(analysis, Math.round(performance.now() - started)) });
  };

  const readFile = async (file: File, source: "file" | "drop") => {
    const gzipped = /\.gz$/i.test(file.name);
    if (file.size > MAX_FILE_BYTES) {
      track("input", { source, size_bucket: sizeBucket(file.size), gzipped });
      track("result", { source, depth: 0, ok: false, error_kind: "too_large" });
      status.textContent = "";
      out.replaceChildren(errorCard(file.name, `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The checker accepts files up to ${MAX_FILE_BYTES / 1024 / 1024} MB.`, `sbomify handles large ${noun()}s server-side; upload it there instead.`));
      out.hidden = false;
      return;
    }
    let text: string;
    if (gzipped && "DecompressionStream" in window) {
      text = await new Response(file.stream().pipeThrough(new DecompressionStream("gzip"))).text();
    } else {
      text = await file.text();
    }
    await run(text, file.name.replace(/\.gz$/i, ""), { source, bytes: file.size, gzipped });
  };

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) void readFile(file, "file");
    input.value = "";
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  for (const ev of ["dragenter", "dragover"]) {
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    });
  }
  for (const ev of ["dragleave", "drop"]) drop.addEventListener(ev, () => drop.classList.remove("is-over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = (e as DragEvent).dataTransfer?.files?.[0];
    if (file) void readFile(file, "drop");
  });
  pasteBtn?.addEventListener("click", () => {
    const text = paste?.value ?? "";
    if (text.trim()) void run(text, `pasted ${noun()}`, { source: "paste", bytes: new Blob([text]).size });
  });
  exampleBtns.forEach((btn) =>
    btn.addEventListener("click", async () => {
      const url = btn.dataset.checkerExample!;
      status.textContent = "Loading the example…";
      const res = await fetch(url);
      const text = await res.text();
      const example = /spdx/i.test(url) ? "spdx" : kind === "sbom" ? "cyclonedx" : kind;
      await run(text, btn.dataset.checkerExampleName ?? url.split("/").pop()!, { source: "example", example, bytes: text.length });
    }),
  );

  // Report interactions, delegated so nested reports are covered too. Links
  // carry data-track (what kind of link) plus framework/element/step.
  out.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]") as HTMLElement | null;
      if (!el) return;
      const d = el.dataset;
      if (d.track === "tile") track("tile_click", { target: d.target });
      else track("link_click", { kind: d.track, framework: d.framework, element: d.element, step: d.step, destination: el.getAttribute("href") ?? undefined }, true);
    },
    true,
  );
  out.addEventListener(
    "toggle",
    (e) => {
      const el = e.target as HTMLDetailsElement;
      if (!(el instanceof HTMLDetailsElement) || !el.open || !el.dataset.expand) return;
      track("expand", { what: el.dataset.expand, framework: el.dataset.framework, element: el.dataset.element });
    },
    true,
  );
}

// ---------------------------------------------------------------- results

interface RenderCtx {
  workerUrl: string;
  depth: number;
  budget: { nested: number };
}

function errorCard(name: string, error: string, hint?: string): HTMLElement {
  return h(
    "section",
    { class: "checker-card is-fail", "aria-labelledby": "checker-error-title" },
    h("h2", { class: "checker-h2", id: "checker-error-title", tabindex: "-1" }, `We couldn’t read ${name}`),
    h("p", { class: "checker-p" }, error),
    hint ? h("p", { class: "checker-p checker-hint" }, hint) : null,
  );
}

let uid = 0;

export function renderAnalysis(a: Analysis, ctx: RenderCtx): HTMLElement {
  if (!a.ok) return errorCard(a.name, a.error, a.hint);
  const id = `r${++uid}`;
  const wrap = h("div", { class: "checker-report" });

  // Overview
  const tiles = h("ul", { class: "checker-tiles", role: "list" });
  tiles.append(tile(`${id}-schema`, "schema", "Schema", schemaVerdict(a.schema)));
  for (const f of a.frameworks) tiles.append(tile(`${id}-${f.id}`, f.id, shortName(f), frameworkVerdict(f)));
  if (a.kind === "sbom") tiles.append(tile(`${id}-refs`, "references", "External references", { status: "info", text: a.refs.length ? `${a.refs.length} found` : "None" }));

  wrap.append(
    h(
      "section",
      { class: "checker-card checker-overview", "aria-labelledby": `${id}-title` },
      h(
        "div",
        { class: "checker-overview-head" },
        h("div", {}, h("p", { class: "eyebrow" }, ctx.depth ? "Referenced SBOM" : "Results"), h("h2", { class: "checker-h2", id: `${id}-title`, tabindex: "-1" }, a.name)),
        ctx.depth === 0 ? downloadButton(a) : null,
      ),
      h(
        "dl",
        { class: "checker-facts" },
        fact("Format", a.formatLabel),
        a.inventory.cryptoAssets !== undefined ? fact("Cryptographic assets", a.inventory.cryptoAssets.toLocaleString()) : null,
        a.inventory.devices !== undefined ? fact("Hardware devices", a.inventory.devices.toLocaleString()) : null,
        a.inventory.models !== undefined ? fact("AI models", a.inventory.models.toLocaleString()) : null,
        a.inventory.datasets !== undefined ? fact("Datasets", a.inventory.datasets.toLocaleString()) : null,
        // The CBOM, HBOM and AIBOM facts above say what matters; skip empty generic counts (an SPDX 3 AIBOM has no software packages).
        a.kind === "sbom" || a.inventory.components ? fact("Components", a.inventory.components.toLocaleString()) : null,
        a.kind === "sbom" || a.inventory.dependencies ? fact("Dependency links", a.inventory.dependencies.toLocaleString()) : null,
      ),
      tiles,
    ),
  );

  wrap.append(renderSchema(`${id}-schema`, a.schema));
  if (a.kind === "sbom") wrap.append(renderRefs(`${id}-refs`, a.refs, ctx));
  for (const f of a.frameworks) wrap.append(renderFramework(`${id}-${f.id}`, f));
  return wrap;
}

function shortName(f: FrameworkResult): string {
  const known: Record<string, string> = {
    "ntia-2021": "NTIA 2021",
    "cisa-2025": "CISA 2025 draft",
    "cisa-2026": "CISA 2026",
    cbom: "Required fields",
    hbom: "Required fields",
    aibom: "Required fields",
  };
  return known[f.id] ?? (f.id.startsWith("bsi") ? "EU CRA" : f.name);
}

/** Section heading: short enough to sit on one line beside the status pill. */
function cardTitle(f: FrameworkResult): string {
  const known: Record<string, string> = {
    "ntia-2021": "NTIA Minimum Elements (2021)",
    "cisa-2025": "CISA Minimum Elements (2025 draft)",
    "cisa-2026": "CISA Minimum Elements (2026)",
  };
  return known[f.id] ?? (f.id.startsWith("bsi") ? "EU CRA: BSI TR-03183-2" : f.name);
}

type Verdict = { status: Finding["status"] | "info"; text: string };

function schemaVerdict(s: SchemaResult): Verdict {
  if (s.status === "valid") return { status: "pass", text: "Valid" };
  if (s.status === "invalid") return { status: "fail", text: `${s.totalIssues} issue${s.totalIssues === 1 ? "" : "s"}` };
  return { status: "warning", text: "Not checked" };
}

/** The CBOM, HBOM and AIBOM required-field checks, as opposed to SBOM frameworks. */
const isFieldCheck = (id: string) => id === "cbom" || id === "hbom" || id === "aibom";

function frameworkVerdict(f: FrameworkResult): Verdict {
  const total = f.findings.length;
  const { pass, fail, warning, error } = f.summary;
  if (error) return { status: "error", text: "Could not run" };
  // Required-field checks: a warning is a recommendation, so "8 of 10 met" would read as a failure.
  if (isFieldCheck(f.id)) {
    if (fail) return { status: "fail", text: `${fail} missing` };
    if (warning) return { status: "warning", text: `${warning} recommended` };
    return { status: "pass", text: "All present" };
  }
  if (fail) return { status: "fail", text: `${pass} of ${total} met` };
  if (warning) return { status: "warning", text: `${pass} of ${total} met` };
  return { status: "pass", text: `All ${total} met` };
}

function tile(target: string, name: string, label: string, v: Verdict): HTMLElement {
  return h("li", {}, h("a", { class: `checker-tile is-${v.status}`, href: `#${target}`, "data-track": "tile", "data-target": name }, h("span", { class: "checker-tile-label" }, label), h("span", { class: "checker-tile-value" }, icon(v.status === "info" ? "info" : STATUS_ICON[v.status]), v.text)));
}

function fact(label: string, value: string): HTMLElement {
  const d = h("div", {}, h("dt", {}, label), h("dd", {}, value));
  return d;
}

function section(id: string, title: string, verdict: Verdict, ...body: Child[]): HTMLElement {
  return h(
    "section",
    { class: `checker-card is-${verdict.status}`, id, "aria-labelledby": `${id}-h` },
    h("div", { class: "checker-card-head" }, h("h3", { class: "checker-h3", id: `${id}-h` }, title), pill(verdict.status, verdict.text)),
    ...body,
  );
}

// ---------------------------------------------------------------- schema

function renderSchema(id: string, s: SchemaResult): HTMLElement {
  const v = schemaVerdict(s);
  if (s.status === "valid") {
    return section(id, "Schema validation", v, h("p", { class: "checker-p" }, `The document is valid against the official ${s.schema.label} JSON schema.`));
  }
  if (s.status === "unsupported") {
    return section(id, "Schema validation", v, h("p", { class: "checker-p" }, s.reason), s.hint ? h("p", { class: "checker-p checker-hint" }, s.hint) : null);
  }
  const list = h("ol", { class: "checker-issues" });
  for (const issue of s.issues) list.append(h("li", {}, h("code", { class: "checker-loc" }, issue.location), h("span", {}, issue.message)));
  return section(
    id,
    "Schema validation",
    v,
    h("p", { class: "checker-p" }, `The document does not conform to the official ${s.schema.label} JSON schema. Tools that validate input will reject it, and the framework checks below may miss data that is in the wrong place.`),
    list,
    s.totalIssues > s.issues.length ? h("p", { class: "checker-p checker-hint" }, `Showing the first ${MAX_ISSUES} of ${s.totalIssues} issues. Fixing the first few often clears many of the rest.`) : null,
  );
}

// ---------------------------------------------------------------- frameworks

function renderFramework(id: string, f: FrameworkResult): HTMLElement {
  const v = frameworkVerdict(f);
  const order: Record<Finding["status"], number> = { error: 0, fail: 1, warning: 2, pass: 3 };
  const sorted = [...f.findings].sort((a, b) => order[a.status] - order[b.status]);
  const open = sorted.filter((x) => x.status !== "pass");
  const passed = sorted.filter((x) => x.status === "pass");
  const sbomFramework = !isFieldCheck(f.id);
  const parts: Child[] = [];
  if (f.guideUrl) parts.push(h("a", { class: "link", href: f.guideUrl, "data-track": "framework_guide", "data-framework": f.id }, "Read our guide"));
  if (f.id.startsWith("bsi")) parts.push(h("a", { class: "link", href: "/compliance/eu-cra/", "data-track": "eu_cra_guide", "data-framework": f.id }, "EU CRA guide"));
  if (sbomFramework) parts.push(h("a", { class: "link", href: "/compliance/schema-crosswalk/", "data-track": "field_mappings", "data-framework": f.id }, "Field mappings"));
  parts.push(h("a", { class: "link", href: f.url, rel: "nofollow noopener noreferrer", target: "_blank", "data-track": "official_source", "data-framework": f.id }, sbomFramework ? "Official source" : "CycloneDX specification"));
  const links = h("p", { class: "checker-meta" }, sbomFramework ? `${f.name}, version ${f.version}. ` : `${f.version}. `, ...parts.flatMap((p, i) => (i ? [" · ", p] : [p])));
  const list = h("ul", { class: "checker-findings", role: "list" });
  for (const fd of open) list.append(renderFinding(fd, f.id));
  const body: Child[] = [links];
  if (open.length) body.push(list);
  else body.push(h("p", { class: "checker-p" }, sbomFramework ? "Every element this framework asks for is present." : "Every required and recommended field is present."));
  if (passed.length) {
    const pl = h("ul", { class: "checker-findings", role: "list" });
    for (const fd of passed) pl.append(renderFinding(fd, f.id));
    body.push(h("details", { class: "checker-passed", open: open.length === 0, "data-expand": "passed", "data-framework": f.id }, h("summary", {}, `${passed.length} element${passed.length === 1 ? "" : "s"} met`), pl));
  }
  return section(id, cardTitle(f), v, ...body);
}

/**
 * Finding text. The required-field checks mark field names with backticks,
 * shown as code; SBOM framework text is plain. Only our own strings come
 * through here (names from the document go into the affected list), and
 * every piece is set as text, never HTML.
 */
function prose(text: string, frameworkId: string): Child[] {
  if (!isFieldCheck(frameworkId)) return [text];
  return text.split("`").map((part, i) => (i % 2 ? h("code", {}, part) : part));
}

function renderFinding(f: Finding, frameworkId: string): HTMLElement {
  const li = h("li", { class: `checker-finding is-${f.status}` }, h("div", { class: "checker-finding-head" }, pill(f.status), h("h4", {}, f.title)), h("p", { class: "checker-p" }, ...prose(f.description, frameworkId)));
  if (f.affected?.length) {
    const total = f.affectedCount ?? f.affected.length;
    const ul = h("ul", { class: "checker-affected" });
    for (const name of f.affected) ul.append(h("li", {}, name));
    li.append(h("details", { class: "checker-affected-wrap", "data-expand": "affected", "data-framework": frameworkId, "data-element": f.id }, h("summary", {}, `${total} affected component${total === 1 ? "" : "s"}`), ul, total > f.affected.length ? h("p", { class: "checker-hint" }, `…and ${total - f.affected.length} more.`) : null));
  }
  if (f.remediation && f.status !== "pass") li.append(h("p", { class: "checker-fix" }, h("strong", {}, "How to fix: "), ...prose(f.remediation, frameworkId)));
  if (f.status !== "pass") {
    const links = linksFor(frameworkId, f);
    const t = (kind: string, step?: string) => ({ "data-track": kind, "data-framework": frameworkId, "data-element": f.id, "data-step": step });
    const items: Child[] = [];
    if (links.fix) items.push(h("li", { class: "is-fix" }, h("span", { class: "checker-link-kind" }, "sbomify action"), h("a", { class: "link", href: links.fix.href, ...t("fix", links.fix.step) }, links.fix.label)));
    if (links.guide) items.push(h("li", {}, h("span", { class: "checker-link-kind" }, "Requirement"), h("a", { class: "link", href: links.guide.href, ...t("guide") }, links.guide.label)));
    if (links.crosswalk) items.push(h("li", {}, h("span", { class: "checker-link-kind" }, "Field mapping"), h("a", { class: "link", href: links.crosswalk.href, ...t("crosswalk") }, links.crosswalk.label)));
    if (items.length) li.append(h("ul", { class: "checker-links", role: "list" }, ...items));
  }
  return li;
}

// ---------------------------------------------------------------- references

const REF_STATUS: Record<RefCheck["status"], { status: Finding["status"] | "info"; label: string }> = {
  ok: { status: "pass", label: "Resolves" },
  reachable: { status: "pass", label: "Reachable" },
  "http-error": { status: "fail", label: "Broken" },
  unreachable: { status: "fail", label: "Unreachable" },
  skipped: { status: "info", label: "Not checked" },
};

function renderRefs(id: string, refs: ExternalRef[], ctx: RenderCtx): HTMLElement {
  if (!refs.length) {
    return section(id, "External references", { status: "info", text: "None" }, h("p", { class: "checker-p" }, "The document does not link to anything outside itself: no external references, download locations or referenced SBOMs."));
  }
  const boms = refs.filter((r) => r.kind === "bom");
  // Referenced SBOMs first: those are the ones worth following.
  const ordered = [...boms, ...refs.filter((r) => r.kind !== "bom")];
  const toCheck = ordered.slice(0, MAX_REFS);
  const results = h("div", { class: "checker-refs" });
  const progress = h("p", { class: "checker-hint", "aria-live": "polite" });
  const btn = h("button", { type: "button", class: "btn btn-navy btn-md" }, `Check ${toCheck.length} reference${toCheck.length === 1 ? "" : "s"}`);
  const card = section(
    id,
    "External references",
    { status: "info", text: `${refs.length} found` },
    h(
      "p",
      { class: "checker-p" },
      `The document links to ${refs.length} external location${refs.length === 1 ? "" : "s"}${boms.length ? `, including ${boms.length} referenced SBOM${boms.length === 1 ? "" : "s"}` : ""}. Checking them sends a request from your browser to each host; your SBOM itself is not sent anywhere.`,
    ),
    refs.length > MAX_REFS ? h("p", { class: "checker-hint" }, `Only the first ${MAX_REFS} are checked, referenced SBOMs first.`) : null,
    h("div", { class: "checker-actions" }, btn, progress),
    results,
  );
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    progress.textContent = "Checking…";
    const started = performance.now();
    const checks = await checkRefs(toCheck, {
      pageProtocol: location.protocol,
      onProgress: (done, total) => (progress.textContent = `Checked ${done} of ${total}…`),
    });
    const broken = checks.filter((c) => c.status === "http-error" || c.status === "unreachable").length;
    const mismatched = checks.filter((c) => c.hash?.status === "mismatch").length;
    progress.textContent = broken || mismatched ? `${broken} broken${mismatched ? `, ${mismatched} hash mismatch${mismatched === 1 ? "" : "es"}` : ""}.` : "Every reference that could be checked resolves.";
    const head = card.querySelector(".checker-card-head .checker-pill");
    const verdict: Verdict = broken || mismatched ? { status: "fail", text: `${broken + mismatched} problem${broken + mismatched === 1 ? "" : "s"}` } : { status: "pass", text: "Resolves" };
    head?.replaceWith(pill(verdict.status, verdict.text));
    card.className = `checker-card is-${verdict.status}`;
    btn.remove();
    const nestedBefore = ctx.budget.nested;
    results.replaceChildren(await renderRefResults(checks, ctx));
    track("refs_checked", { depth: ctx.depth, total_refs: refs.length, ...refsProps(checks, Math.round(performance.now() - started), ctx.budget.nested - nestedBefore) });
  });
  return card;
}

async function renderRefResults(checks: RefCheck[], ctx: RenderCtx): Promise<HTMLElement> {
  const order: Record<RefCheck["status"], number> = { "http-error": 0, unreachable: 1, ok: 2, reachable: 3, skipped: 4 };
  const sorted = [...checks].sort((a, b) => (a.ref.kind === "bom" ? -1 : 0) - (b.ref.kind === "bom" ? -1 : 0) || order[a.status] - order[b.status]);
  const list = h("ul", { class: "checker-findings", role: "list" });
  for (const c of sorted) {
    const st = REF_STATUS[c.status];
    const li = h(
      "li",
      { class: `checker-finding is-${st.status}` },
      h("div", { class: "checker-finding-head is-stacking" }, pill(st.status, st.label), h("h4", {}, c.ref.source)),
      h(
        "p",
        { class: "checker-url" },
        h("span", { class: "checker-reftype" }, c.ref.type),
        /^https?:/i.test(c.ref.url) ? h("a", { class: "link", href: c.ref.url, rel: "nofollow noopener noreferrer", target: "_blank" }, c.ref.url) : h("code", {}, c.ref.url),
      ),
      h("p", { class: "checker-p" }, c.detail),
    );
    if (c.hash) li.append(h("p", { class: `checker-p is-hash-${c.hash.status}` }, h("strong", {}, c.hash.status === "match" ? "Hash verified. " : c.hash.status === "mismatch" ? "Hash mismatch. " : "Hash not verified. "), c.hash.detail));
    if (c.ref.kind === "bom") li.append(await renderNested(c, ctx));
    list.append(li);
  }
  return list;
}

async function renderNested(c: RefCheck, ctx: RenderCtx): Promise<Node> {
  if (c.status === "reachable") return h("p", { class: "checker-hint" }, "The referenced SBOM could not be read cross-origin, so it was not checked. Download it and check it here directly.");
  if (!c.body) return document.createTextNode("");
  if (ctx.depth + 1 > MAX_DEPTH || ctx.budget.nested >= MAX_NESTED) return h("p", { class: "checker-hint" }, "Not expanded: the checker follows referenced SBOMs two levels deep and at most ten in total.");
  ctx.budget.nested += 1;
  const name = c.ref.url.split("/").filter(Boolean).pop() ?? c.ref.url;
  const started = performance.now();
  const analysis = await analyseInWorker(ctx.workerUrl, c.body, name);
  track("result", { source: "reference", depth: ctx.depth + 1, ...resultProps(analysis, Math.round(performance.now() - started)) });
  const details = h("details", { class: "checker-nested", "data-expand": "nested" }, h("summary", {}, analysis.ok ? `Checked the referenced SBOM (${analysis.formatLabel})` : "The referenced document is not a readable SBOM"));
  details.append(renderAnalysis(analysis, { ...ctx, depth: ctx.depth + 1 }));
  return details;
}

// ---------------------------------------------------------------- report + CTA

function downloadButton(a: Extract<Analysis, { ok: true }>): HTMLElement {
  const btn = h("button", { type: "button", class: "btn btn-secondary btn-md" }, icon("download"), "Download report");
  btn.addEventListener("click", () => {
    track("report_download", { format: a.format, failed_total: a.frameworks.reduce((n, f) => n + f.summary.fail, 0) });
    const report = {
      generator: `sbomify ${noun()} checker (https://sbomify.com/tools/${kind}-checker/)`,
      generatedAt: new Date().toISOString(),
      file: a.name,
      format: a.formatLabel,
      inventory: a.inventory,
      schema: a.schema,
      frameworks: a.frameworks,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = h("a", { href: url, download: `${a.name.replace(/\.json$/i, "")}.${kind}-check.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return btn;
}

/** Closing call to action, tailored to what the check found. */
function renderCta(a: Extract<Analysis, { ok: true }> | null): HTMLElement {
  const tpl = document.getElementById("checker-cta") as HTMLTemplateElement | null;
  const node = tpl ? (tpl.content.firstElementChild!.cloneNode(true) as HTMLElement) : h("div");
  const lead = node.querySelector<HTMLElement>("[data-cta-lead]");
  if (lead && a && a.kind !== "sbom") {
    const failing = a.frameworks.reduce((n, f) => n + f.summary.fail, 0);
    const problems = [failing ? `${failing} missing required field${failing === 1 ? "" : "s"}` : "", a.schema.status === "invalid" ? "schema errors" : ""].filter(Boolean);
    lead.textContent = problems.length
      ? `This ${noun()} has ${problems.join(" and ")}. Fix them where the ${noun()} is generated, then keep every release's ${noun()} in one place.`
      : `This ${noun()} is valid and has every required field. Keep it that way for every release: store each version alongside your SBOMs and share them from one place.`;
  } else if (lead && a) {
    const failing = a.frameworks.reduce((n, f) => n + f.summary.fail, 0);
    const schemaBad = a.schema.status === "invalid";
    if (failing || schemaBad) {
      const frameworks = a.frameworks.filter((f) => f.summary.fail > 0).length;
      const parts = [failing ? `${failing} failed check${failing === 1 ? "" : "s"} across ${frameworks} framework${frameworks === 1 ? "" : "s"}` : "", schemaBad ? "schema errors" : ""].filter(Boolean);
      const by = fixSummary(a.frameworks);
      const steps = [
        by.enrichment ? `${by.enrichment} by enrichment (suppliers, licences, hashes, URLs)` : "",
        by.augmentation ? `${by.augmentation} by augmentation (authors, lifecycle phase)` : "",
        by.generation ? `${by.generation} at generation (tool, timestamp, identifiers)` : "",
        by.attestation ? `${by.attestation} by signing in CI` : "",
      ].filter(Boolean);
      const list = steps.length > 1 ? `${steps.slice(0, -1).join(", ")} and ${steps[steps.length - 1]}` : steps[0];
      lead.textContent = `This SBOM has ${parts.join(" and ")}.` + (list ? ` Of those, the sbomify GitHub Action addresses ${list}.` : "");
    } else {
      lead.textContent = "This SBOM meets every element checked here. Keep it that way for every release: generate it in CI and manage each version in one place.";
    }
  }
  return node;
}

const root = document.getElementById("sbom-checker");
if (root) init(root);
