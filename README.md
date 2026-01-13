# sbomify.com

sbomify.com marketing site

## Webp Converter

All `.jpg`, `.jpeg` and `.png` files are converted to `.webp` and saved under `_site/img` during the build. Original files are preserved.

_To use the `.webp` versions, use the below tag when using markdown:_

```md
{% picture /assets/images/blog/sample.jpg alt="alt text" class="image-class" %}
```

_To use `.webp` in plain html, use the below markup:_

```html
<picture>
  <source srcset="/img/sample.webp" type="image/webp">
  <img src="/assets/images/blog/sample.jpg" alt="alt text">
</picture>
```

**Note**: The `.webp` path points to `/img/image-name.webp`

## D2 Diagrams

D2 diagram files (`.d2`) are stored in the `_d2/` directory and automatically compiled to SVG format during the build process. The compilation script applies a shared theme from `_d2/theme.d2` to all diagrams for consistent styling.

### Building Diagrams

To compile all D2 files to SVG:

```bash
bun run build:d2
```

To watch for changes and automatically recompile:

```bash
bun run watch:d2
```

The compiled SVG files are output to two locations:

- `assets/images/d2/` - for direct image references
- `_includes/d2/` - for Jekyll includes

### Using Diagrams

There are two ways to include D2 diagrams in your content:

**1. Using Jekyll includes (recommended for inline SVG):**

```markdown
<div class="my-12 bg-white rounded-xl p-6 border border-gray-100">
    {% include d2/lifecycle.svg %}
</div>
```

**2. Using direct image references:**

```markdown
![SBOM hub](/assets/images/d2/sbom-hierarchy.svg)
```

### Linting

To format D2 files:

```bash
bun run lint:d2
```

### Theme

All diagrams automatically use the theme defined in `_d2/theme.d2`, which provides consistent styling across all diagrams. The theme includes predefined classes for nodes (`primary`, `accent`, `secondary`, `group`) and connections (`flow`, `flow-pink`).

## YouTube Video Embeds

Use the video embed component for consistent, responsive YouTube embeds with built-in VideoObject structured data for SEO.

### Usage

```liquid
{% include components/video-embed.html
    video_id="E77ohYZA2vo"
    title="SBOM Deep Dive with Allan Friedman"
    description="An in-depth discussion about SBOMs with Allan Friedman, formerly of CISA."
%}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `video_id` | Yes | YouTube video ID (e.g., `E77ohYZA2vo`) |
| `title` | Yes | Video title for schema and accessibility |
| `description` | No | Video description for schema (defaults to page description) |
| `upload_date` | No | Video upload date for schema (defaults to page date) |

### Features

- **Privacy-enhanced**: Uses `youtube-nocookie.com` to prevent cookies until user plays
- **Responsive**: Full width on mobile, max 768px centered on desktop
- **Lazy loading**: Defers iframe load until needed for better performance
- **SEO-ready**: Each video includes its own VideoObject structured data

## Meta Tags & Social Preview

Meta keywords tag is dependent on `keywords` metadata

```html
<meta name="keywords" content="{{ page.keywords | default: site.keywords }}">
```

```markdown
keywords: "keyword1, keyword2, keyword3"
```

Meta description tag (including for social sharing previews) are dependent on `description` metadata

```markdown
description: "Some content description"
```

```html
<meta name="description" content="{{ page.description | default: site.description }}">
```

```html
<meta name="twitter:title" content="{{ page.title | default: site.title }}">
<meta name="twitter:description" content="{{ page.description | default: site.description }}">
```

In both the cases, they fallback to site level keywords and description.
