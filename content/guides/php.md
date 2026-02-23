---

url: /guides/php/
title: "SBOM Generation Guide for PHP - Composer"
description: "Learn how to generate Software Bill of Materials for PHP projects. Complete guide with composer.lock examples, dev dependencies, and CycloneDX output."
section: guides
---

## Source vs Build SBOMs

PHP's dependency management is handled primarily through Composer, which provides excellent lockfile support through `composer.lock`. This makes source SBOM generation straightforward and reliable.

- **Source SBOMs** are generated from `composer.lock`
- **Build SBOMs** are generated from the installed `vendor/` directory

For most PHP projects, the lockfile approach is preferred because `composer.lock` contains:

- Exact resolved versions
- Package hashes for integrity verification
- Full dependency tree including transitive dependencies

## Lockfile Deep Dive

### composer.json vs composer.lock

| File            | Purpose                                      | Commit to VCS? |
| --------------- | -------------------------------------------- | -------------- |
| `composer.json` | Dependency declarations, version constraints | Always         |
| `composer.lock` | Resolved versions, hashes, full tree         | Always         |

### composer.json

The `composer.json` file declares your dependencies:

```json
{
    "name": "mycompany/myapp",
    "require": {
        "php": "^8.2",
        "laravel/framework": "^11.0",
        "guzzlehttp/guzzle": "^7.8"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0",
        "phpstan/phpstan": "^1.10"
    }
}
```

### composer.lock

The `composer.lock` file contains resolved dependencies:

```json
{
    "_readme": [
        "This file locks the dependencies of your project to a known state"
    ],
    "content-hash": "abc123def456...",
    "packages": [
        {
            "name": "guzzlehttp/guzzle",
            "version": "7.8.1",
            "source": {
                "type": "git",
                "url": "https://github.com/guzzle/guzzle.git",
                "reference": "abc123..."
            },
            "dist": {
                "type": "zip",
                "url": "https://api.github.com/repos/guzzle/guzzle/zipball/abc123",
                "reference": "abc123...",
                "shasum": ""
            },
            "require": {
                "php": "^8.1",
                "guzzlehttp/promises": "^2.0",
                "guzzlehttp/psr7": "^2.5"
            }
        }
    ],
    "packages-dev": [
        {
            "name": "phpunit/phpunit",
            "version": "11.0.0"
        }
    ]
}
```

Key sections:

- **packages**: Production dependencies
- **packages-dev**: Development dependencies (tests, tools)
- **content-hash**: Hash of composer.json for integrity

## Dev Dependencies (require-dev)

Composer separates production and development dependencies:

```json
{
    "require": {
        "monolog/monolog": "^3.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0",
        "mockery/mockery": "^1.6"
    }
}
```

For production SBOMs, you typically exclude dev dependencies:

```bash
# Install without dev dependencies
composer install --no-dev
```

Most SBOM tools can filter dev dependencies from the generated SBOM.

## Platform Requirements

Composer tracks platform requirements:

```json
{
    "require": {
        "php": "^8.2",
        "ext-json": "*",
        "ext-pdo": "*",
        "ext-openssl": "*"
    }
}
```

These platform requirements specify:

- PHP version constraints
- Required PHP extensions
- System library dependencies

Consider including these in your SBOM for completeness.

## Generating an SBOM

SBOM generation is the first step in the [SBOM lifecycle](/features/generate-collaborate-analyze/). After generation, you typically need to enrich your SBOM with package metadata and augment it with your organization's details.

### Using sbomify GitHub Action (Recommended)

The [sbomify GitHub Action](https://github.com/sbomify/sbomify-action/) is a swiss army knife for SBOMs that automatically selects the best generation tool for your ecosystem, enriches the output with package metadata, and optionally augments it with your business information—all in one step.

For PHP, sbomify uses **cdxgen** under the hood with fallback to Trivy and Syft.

**Standalone (no account needed):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    LOCK_FILE: composer.lock
    OUTPUT_FILE: sbom.cdx.json
    COMPONENT_NAME: my-php-app
    COMPONENT_VERSION: ${{ github.ref_name }}
    ENRICH: true
    UPLOAD: false
```

Using `github.ref_name` automatically captures your git tag (e.g., `v1.2.3`) as the SBOM version. For rolling releases without tags, use `github.sha` instead. See our [SBOM versioning guide](/guides/how-to-version-sboms/) for best practices.

**With sbomify platform (adds augmentation and upload):**

```yaml
- uses: sbomify/sbomify-action@master
  env:
    TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
    COMPONENT_ID: my-component-id
    LOCK_FILE: composer.lock
    OUTPUT_FILE: sbom.cdx.json
    AUGMENT: true
    ENRICH: true
```

### Alternative Tools

If you prefer to run SBOM generation tools manually:

**CycloneDX PHP Composer Plugin:**

```bash
composer require --dev cyclonedx/cyclonedx-php-composer
composer make-bom --output-file=sbom.cdx.json
```

**cdxgen:**

```bash
npm install -g @cyclonedx/cdxgen
cdxgen -t php -o sbom.cdx.json
```

**Trivy:**

```bash
trivy fs --format cyclonedx --output sbom.cdx.json .
```

When using these tools directly, you'll need to handle enrichment and augmentation separately.

### GitLab CI

```yaml
generate-sbom:
  image: sbomifyhub/sbomify-action
  variables:
    LOCK_FILE: composer.lock
    OUTPUT_FILE: sbom.cdx.json
    UPLOAD: "false"
    ENRICH: "true"
  script:
    - /sbomify.sh
  artifacts:
    paths:
      - sbom.cdx.json
```

## Private Packages (Satis/Private Packagist)

For projects using private Composer repositories:

```json
{
    "repositories": [
        {
            "type": "composer",
            "url": "https://packages.example.com"
        }
    ]
}
```

Ensure your CI environment has authentication configured:

```bash
# Using auth.json
{
    "http-basic": {
        "packages.example.com": {
            "username": "user",
            "password": "token"
        }
    }
}

# Or via environment variable
COMPOSER_AUTH='{"http-basic":{"packages.example.com":{"username":"user","password":"token"}}}'
```

## Handling Special Cases

### Path Repositories

Local packages via path repositories:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../my-local-package"
        }
    ]
}
```

These won't have Packagist metadata. Consider documenting them with `ADDITIONAL_PACKAGES`.

### VCS Repositories

Packages from Git/SVN:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/example/package"
        }
    ]
}
```

These appear in `composer.lock` with Git references instead of version numbers.

### Platform Overrides

If you use platform overrides:

```json
{
    "config": {
        "platform": {
            "php": "8.2.0",
            "ext-gd": "1.0.0"
        }
    }
}
```

Document these in your SBOM metadata to ensure accurate representation.

## Monorepo Support

For monorepos with multiple `composer.json` files:

```
myproject/
├── app/
│   └── composer.json
├── packages/
│   ├── core/
│   │   └── composer.json
│   └── utils/
│       └── composer.json
└── composer.json (root)
```

Generate SBOMs per component or use a tool that supports monorepo detection.

## Best Practices

1. **Always commit composer.lock** - Essential for reproducible builds
2. **Use exact versions for production** - Avoid `^` and `~` in production requirements
3. **Separate dev and production** - Use `--no-dev` for production installations
4. **Run `composer audit`** - Check for known vulnerabilities alongside SBOM generation
5. **Include platform requirements** - Document PHP version and extensions
6. **Update regularly** - Use `composer outdated` to track updates

## Security Tooling Integration

```bash
# Check for vulnerabilities
composer audit

# Generate SBOM and audit in CI
composer install --no-dev
composer audit --format=json > audit.json
composer make-bom --exclude-dev --output-file=sbom.cdx.json
```

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources](/resources/) page, which includes additional PHP-specific tools like CycloneDX PHP Composer plugin.
