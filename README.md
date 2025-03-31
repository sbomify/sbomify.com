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
