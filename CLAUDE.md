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

**WebP images:** Use `{{</* picture "/assets/images/blog/photo.jpg" alt="description" */>}}` in Markdown. Hugo automatically generates WebP versions. Original images go in `assets/images/`.

**YouTube embeds:** Use `{{</* video-embed video_id="ID" title="Title" */>}}`. This uses `youtube-nocookie.com`, lazy loads, and includes VideoObject schema.

**D2 diagrams:** Preferred inline: `{{</* d2 "filename" */>}}` wrapped in a styled div. Alternative: `![alt](/assets/images/d2/filename.svg)`.

**Meta tags:** Set `description` and `keywords` in page frontmatter. They fall back to site-level values in `hugo.toml`.

## CI/CD

- **Lint workflow** (`.github/workflows/lint.yml`): Triggers on PRs affecting `.md`, `.d2`, `Dockerfile`, `hugo.toml`, `layouts/`, `content/`, or `package.json`. Runs `bun run lint`, Hugo build, and lychee link checker.
- **Deploy workflow** (`.github/workflows/deploy.yml`): Triggers on push to `master` and nightly at 05:00 UTC. Builds D2, CSS, Hugo (production), and deploys to GitHub Pages.

## Key Conventions

- Main branch is `master`
- Permalink format: `/:year/:month/:day/:title/`
- Hugo config lives in `hugo.toml` (main) and `config/development/hugo.toml` (dev overrides)
- Hugo live-reloads automatically when content or templates change
- Output directory is `public/` (not `_site/`)
