# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sbomify.com is the marketing and documentation website for Sbomify, a Software Bill of Materials (SBOM) management platform. It is a Hugo static site using Tailwind CSS, deployed to GitHub Pages via CI/CD.

## PageSpeed Performance Target

Achieving a perfect Google PageSpeed score (100/100) for both mobile and desktop is a critical goal. Every change must be evaluated for its performance impact. This means:

- Minimize and defer JavaScript; avoid adding JS unless absolutely necessary
- Use WebP images via the `{{</* picture */>}}` shortcode for automatic WebP conversion with fallback
- Lazy-load all images and iframes (YouTube embeds already use lazy loading)
- Keep CSS minimal; Tailwind purges unused styles in production
- Avoid render-blocking resources; inline critical CSS where needed
- Optimize font loading (prefer system fonts or font-display: swap)
- Ensure all assets are properly compressed (Hugo `minifyOutput = true` handles HTML/JS/CSS)
- Keep LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint) within Google's "good" thresholds
- Test changes against PageSpeed Insights before merging

## Build & Development Commands

### Local Development

```bash
# Recommended: Docker Compose (runs D2 watcher, CSS watcher, and Hugo server)
docker-compose up
# Site available at http://localhost:4040

# Manual setup (requires Hugo, Bun, and D2 installed locally):
bun install
bun run watch:d2 &
bun run watch:css &
hugo server --environment development --buildFuture --buildDrafts --port 4040
```

### Build

```bash
bun run build:css          # Compile Tailwind CSS
bun run build:d2           # Compile D2 diagrams to SVG
hugo --minify --environment production   # Production build (outputs to public/)
```

### Linting

```bash
bun run lint               # Run all linters (markdown + D2)
bun run lint:markdown      # dprint check on all .md files
bun run lint:markdown:fix  # Auto-fix markdown formatting
bun run lint:d2            # Format D2 diagram files
```

## Architecture

**Static site generator:** Hugo with Go templating and goldmark Markdown.

**Styling:** Tailwind CSS 3.4 compiled via PostCSS. All styles (including former SCSS) are in `_assets/css/tailwind.css`. Output goes to `assets/css/styles.css`.

**Design tokens:** The brand (sbomify Brand Guidelines v2.0: Navy, White, Mist, Signal Orange, the semantic palette, Figtree and the system mono stack) lives in `_assets/css/tokens.css`, imported at the top of `tailwind.css` via `postcss-import`. It has two tiers: primitives (`--color-navy-80`, `--color-orange-700`, ...) and roles (`--color-ink`, `--color-canvas`, `--color-accent-strong`, ...). `tailwind.config.js` replaces Tailwind's default palette with these tokens, so `indigo-500`-style classes no longer exist; use the role names (`text-ink`, `text-ink-muted`, `bg-surface`, `border-line`, `bg-inverse`, `bg-accent-strong`) or a primitive scale (`navy-*`, `orange-*`). Never hard-code a hex in templates or CSS; component styles use `rgb(var(--color-*))`. `_d2/theme.d2` and `assets/css/native.css` (code highlighting) mirror the tokens, since D2 cannot read CSS variables.

Brand rules the tokens encode:

- Layouts are predominantly white with navy type. Dark sections use `bg-inverse` (white on navy).
- Signal Orange gets one moment per layout, normally the primary call to action (`btn-primary`). Section-level actions use `btn-navy` or `btn-secondary`.
- Type on orange is always white, on an Orange 700 fill (`bg-accent-strong`); orange text on white is `text-accent-strong`, never `text-accent`.
- Body text is `text-ink-muted` (Navy 80) or darker. `text-ink-subtle` (Navy 55, the app's `text-muted`) is for captions, eyebrows and meta on white; it is 4.2:1 on Mist Soft, so on `bg-surface` use `text-ink-muted` (the `.eyebrow` component does this automatically).
- Tokens shared with the app (sbomify/sbomify `tailwind.src.css`, `:root.light`) keep the app's values: Navy 55 `#6E7180`, Mist Soft `#EEF0F4`. Copy follows the app's rules too: "sbomify" is always lowercase, and the auth verbs are "Sign in" / "Sign up".
- Success/danger/warning/info signal status only, never decoration: full colour for the dot or border, `-tint` for the fill, navy type.
- Shared components in `tailwind.css`: `btn-primary`, `btn-navy`, `btn-secondary` (sizes `btn-md`, `btn-lg`), `link`, `eyebrow`, `eyebrow-chip`, `tag`, `card`, `hero`.

**Diagrams:** D2 source files in `_d2/` compile to SVG in both `assets/images/d2/` (image refs) and `layouts/partials/d2/` (inline SVG). All diagrams share a theme from `_d2/theme.d2`.

**Hugo features replacing former Jekyll plugins:**

- `{{</* picture */>}}` shortcode with Hugo image processing for WebP conversion
- Hugo Pipes `| fingerprint` for asset cache busting
- `enableGitInfo = true` for git-based dates (`.Lastmod`, `.PublishDate`)
- Hugo's built-in minification, sitemap, and RSS generation

**Layouts** in `layouts/`: `_default/baseof.html` (base), `_default/single.html` (pages), `posts/single.html` (blog posts), `_default/about.html`, `_default/pricing.html`, `_default/integrations.html`, `authors/single.html`, `case-studies/single.html`.

**Shortcodes** in `layouts/shortcodes/`: `picture`, `video-embed`, `video-embed-native`, `d2`, `cta-ready`, `feature-card`, `artifact-card`, `check-list-item`, `impact-card`, `sbomified-badge`, `trust-center-pillars`, `trust-center-pillars-grid`, `trust-center-artifacts`, `compliance-block`.

**Data files** in `data/`: `authors.yml`, `advisors.yml`, `main.yml` (navigation/social links).

**Deployment:** GitHub Actions builds with Hugo + Bun, deploys to GitHub Pages. A nightly cron job rebuilds the site to publish future-dated posts. The deploy pipeline also generates an SBOM for JavaScript dependencies via the sbomify GitHub Action.

## Content Authoring

**Blog posts** go in `content/posts/` with the naming convention `YYYY-MM-DD-slug.md`. Required frontmatter: `title`, `description`, `keywords`, `author` (must match a key in `data/authors.yml`). Optional: `tldr` (for TL;DR blocks), `image` (social preview).

**Code blocks:** Fenced code renders through `layouts/_default/_markup/render-codeblock.html` with a header band (language plus a Copy button revealed by `assets/js/main.js`). Always give fences a language.

**WebP images:** Use `{{</* picture "/assets/images/blog/photo.jpg" alt="description" */>}}` in Markdown. Hugo automatically generates WebP versions. Original images go in `assets/images/`.

**YouTube embeds:** Use `{{</* video-embed video_id="ID" title="Title" */>}}`. This uses `youtube-nocookie.com`, lazy loads, and includes VideoObject schema.

**D2 diagrams:** Preferred inline: `{{</* d2 "filename" */>}}` wrapped in a styled div. Alternative: `![alt](/assets/images/d2/filename.svg)`.

**Meta tags:** Set `description` and `keywords` in page frontmatter. They fall back to site-level values in `hugo.toml`.

**Table of contents:** Pages with at least five h2/h3 headings and 1000 words get an "On this page" list automatically (sticky sidebar at `xl`, collapsible block below). Set `toc: false` in frontmatter to turn it off. Logic is in `layouts/partials/toc-enabled.html` and `layouts/partials/toc.html`.

## CI/CD

- **Lint workflow** (`.github/workflows/lint.yml`): Triggers on PRs affecting `.md`, `.d2`, `Dockerfile`, `hugo.toml`, `layouts/`, `content/`, or `package.json`. Runs `bun run lint`, Hugo build, and lychee link checker.
- **Deploy workflow** (`.github/workflows/deploy.yml`): Triggers on push to `master` and nightly at 05:00 UTC. Builds D2, CSS, Hugo (production), and deploys to GitHub Pages.

## Key Conventions

- Main branch is `master`
- Permalink format: `/:year/:month/:day/:title/`
- Hugo config lives in `hugo.toml` (main) and `config/development/hugo.toml` (dev overrides)
- Hugo live-reloads automatically when content or templates change
- Output directory is `public/` (not `_site/`)

## Outbound Links (rel="nofollow")

Links to anything outside our own domains automatically get `rel="nofollow noopener noreferrer"`. Do not add it by hand. The policy lives in `[params.links]` in `hugo.toml` (`internalHosts`, `externalRel`, `externalTarget`); `sbomify.com` and its subdomains are internal.

Three pieces apply it:

- `layouts/_markup/render-link.html` — render hook for every Markdown link
- `layouts/partials/nofollow-links.html` — filter over rendered page content, covering hand-written `<a>` tags and `.html` content pages. Applied inside `layouts/partials/content.html`, which every layout already uses to render `.Content`, so no layout changes are needed
- `layouts/partials/link-attrs.html` — helper for links written in templates/shortcodes: `<a href="{{ $url }}"{{ partial "link-attrs.html" $url }}>`, or pass `(dict "url" $url "rel" "noopener noreferrer" "target" "_blank")` to keep baseline attributes for internal links

## Analytics & Cookie Consent

PostHog is consent-gated. It is analytics, not a strictly necessary cookie, so it may not run before the visitor opts in — until then the SDK is never even requested.

- `layouts/partials/posthog.html` (in `<head>`) loads nothing on its own. It exposes `window.sbomifyAnalytics` with `load()` (immediate), `loadDeferred()` (after window load + 2s, keeping PostHog off the critical path) and `forget()` (opt out and clear `ph_*` / `__ph*` cookies and local storage). It also installs a no-op `window.posthog` stub, because `onclick="posthog.capture(...)"` handlers in the header, nav, pricing page and `cta-ready` shortcode would otherwise throw for anyone who declines.
- `layouts/partials/cookie-consent.html` (rendered after the footer in `baseof.html`) owns the banner and the decision. The choice lives in `localStorage` under `sbomify_cookie_consent` as `{status, version, date}` — recording a refusal must not itself need a cookie. Bump `VERSION` in that file when the purposes change and every visitor is asked again.
- The **Cookie settings** button in `layouts/partials/footer.html` re-opens the banner. It ships `hidden` and is revealed by the consent script, so it is not a dead control without JavaScript.
- `forget()` runs only on an explicit "Reject" click, never on plain page loads: PostHog's cookie is set on `.sbomify.com`, so sweeping it on every page view would keep resetting analytics state for `app.sbomify.com` too.
- Cookies and choices are documented in `content/privacy.md` under "Your Cookie Choices". Keep the two in step.
