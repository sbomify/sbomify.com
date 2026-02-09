# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sbomify.com is the marketing and documentation website for Sbomify, a Software Bill of Materials (SBOM) management platform. It is a Jekyll 4.3+ static site using Tailwind CSS, deployed to GitHub Pages via Docker-based CI/CD.

## PageSpeed Performance Target

Achieving a perfect Google PageSpeed score (100/100) for both mobile and desktop is a critical goal. Every change must be evaluated for its performance impact. This means:

- Minimize and defer JavaScript; avoid adding JS unless absolutely necessary
- Use WebP images via the `{% picture %}` tag for automatic format optimization with fallback
- Lazy-load all images and iframes (YouTube embeds already use lazy loading)
- Keep CSS minimal; Tailwind purges unused styles in production
- Avoid render-blocking resources; inline critical CSS where needed
- Optimize font loading (prefer system fonts or font-display: swap)
- Ensure all assets are properly compressed (jekyll-minifier handles HTML/JS/CSS)
- Keep LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint) within Google's "good" thresholds
- Test changes against PageSpeed Insights before merging

## Build & Development Commands

### Local Development

```bash
# Recommended: Docker Compose (runs D2 watcher, CSS watcher, and Jekyll serve)
docker-compose up
# Site available at http://localhost:4040

# Manual setup (requires Ruby, Bun, and D2 installed locally):
bundle install && bun install
bun run watch:d2 &
bun run watch:css &
bundle exec jekyll serve --config _config.yml,_config_development.yml
```

### Build

```bash
bun run build:css          # Compile Tailwind CSS
bun run build:d2           # Compile D2 diagrams to SVG
JEKYLL_ENV=production bundle exec jekyll build   # Production build
```

### Linting

```bash
bun run lint               # Run all linters (markdown + SCSS + D2)
bun run lint:markdown      # dprint check on all .md files
bun run lint:markdown:fix  # Auto-fix markdown formatting
bun run lint:scss          # stylelint on all .scss files
bun run lint:scss:fix      # Auto-fix SCSS issues
bun run lint:d2            # Format D2 diagram files
```

### HTML Validation (runs in CI via Docker)

```bash
bundle exec htmlproofer ./_site --disable-external
```

## Architecture

**Static site generator:** Jekyll with Liquid templating and kramdown Markdown.

**Styling:** Tailwind CSS 3.4 compiled via PostCSS, plus custom SCSS in `_sass/`. Output goes to `assets/css/styles.css`.

**Diagrams:** D2 source files in `_d2/` compile to SVG in both `assets/images/d2/` (image refs) and `_includes/d2/` (inline SVG). All diagrams share a theme from `_d2/theme.d2`.

**Custom Jekyll plugins** in `_plugins/`:
- `picture_tag.rb` - `{% picture %}` tag for WebP images with fallback
- `webp_converter.rb` - Converts jpg/png to WebP during build (output to `_site/img/`)
- `cache_buster.rb` - Asset cache busting
- `git_dates.rb` - Extracts publish/modified dates from git history

**Layouts** in `_layouts/`: `default`, `post`, `page`, `about`, `author`, `case_study`, `pricing`.

**Data files** in `_data/`: `authors.yml`, `advisors.yml`, `main.yml` (navigation/social links).

**Deployment:** GitHub Actions builds inside Docker, deploys to GitHub Pages. A nightly cron job rebuilds the site to publish future-dated posts. The deploy pipeline also generates SBOMs for both JavaScript and Ruby dependencies via the sbomify GitHub Action.

## Content Authoring

**Blog posts** go in `_posts/` with the naming convention `YYYY-MM-DD-slug.md`. Required frontmatter: `title`, `description`, `keywords`, `author` (must match a key in `_data/authors.yml`). Optional: `tldr` (for TL;DR blocks), `image` (social preview).

**WebP images:** Use `{% picture /assets/images/blog/photo.jpg %}` in Markdown. For HTML, use `<picture>` with a `/img/*.webp` source. Original images go in `assets/images/`.

**YouTube embeds:** Use `{% include components/video-embed.html video_id="ID" title="Title" %}`. This uses `youtube-nocookie.com`, lazy loads, and includes VideoObject schema.

**D2 diagrams:** Preferred inline: `{% include d2/filename.svg %}` wrapped in a styled div. Alternative: `![alt](/assets/images/d2/filename.svg)`.

**Meta tags:** Set `description` and `keywords` in page frontmatter. They fall back to site-level values in `_config.yml`.

## CI/CD

- **Lint workflow** (`.github/workflows/lint.yml`): Triggers on PRs affecting `.md`, `.scss`, `.d2`, `Dockerfile`, `Gemfile`, or `package.json`. Runs `bun run lint` and a Docker build with `htmlproofer`.
- **Deploy workflow** (`.github/workflows/deploy.yml`): Triggers on push to `master` and nightly at 05:00 UTC. Builds D2, CSS, Jekyll (production), and deploys to GitHub Pages.

## Key Conventions

- Main branch is `master`
- Permalink format: `/:year/:month/:day/:title/`
- Jekyll config is NOT auto-reloaded; restart the server after editing `_config.yml`
- Development config (`_config_development.yml`) overrides URL to localhost:8080, enables future posts, and sets port 4040
- Sass output is compressed with no sourcemaps in production
