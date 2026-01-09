---
layout: page
permalink: /guides/ruby/
title: "SBOM Generation Guide for Ruby - Bundler"
description: "Learn how to generate Software Bill of Materials for Ruby projects. Complete guide with Gemfile.lock examples, platform-specific gems, and CycloneDX output."
section: guides
---

## Source vs Build SBOMs

Ruby's Bundler package manager provides excellent lockfile support through `Gemfile.lock`. This makes source SBOM generation reliable and reproducible.

- **Source SBOMs** are generated from `Gemfile.lock`
- **Build SBOMs** are generated from installed gems in the bundle path

For most Ruby projects, generating from `Gemfile.lock` is preferred because it contains:

- Exact gem versions
- Platform specifications
- Complete dependency tree including transitive dependencies
- Git references for git-sourced gems

## Lockfile Deep Dive

### Gemfile vs Gemfile.lock

| File           | Purpose                                      | Commit to VCS?                     |
| -------------- | -------------------------------------------- | ---------------------------------- |
| `Gemfile`      | Dependency declarations, version constraints | Always                             |
| `Gemfile.lock` | Resolved versions, full dependency tree      | Always for apps, Optional for gems |

### Gemfile

The `Gemfile` declares your dependencies:

```ruby
source 'https://rubygems.org'

ruby '3.3.0'

gem 'rails', '~> 7.1'
gem 'puma', '~> 6.0'
gem 'pg', '~> 1.5'

group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'rubocop', '~> 1.60'
end

group :development do
  gem 'web-console'
end
```

### Gemfile.lock

The `Gemfile.lock` contains resolved dependencies:

```
GEM
  remote: https://rubygems.org/
  specs:
    actioncable (7.1.3)
      actionpack (= 7.1.3)
      activesupport (= 7.1.3)
      nio4r (~> 2.0)
      websocket-driver (>= 0.6.1)
    actionmailbox (7.1.3)
      actionpack (= 7.1.3)
      activejob (= 7.1.3)
    pg (1.5.4)
    puma (6.4.2)
      nio4r (~> 2.0)
    rails (7.1.3)
      actioncable (= 7.1.3)
      actionmailbox (= 7.1.3)

PLATFORMS
  arm64-darwin-23
  x86_64-linux

DEPENDENCIES
  pg (~> 1.5)
  puma (~> 6.0)
  rails (~> 7.1)
  rspec-rails (~> 6.0)
  rubocop (~> 1.60)
  web-console

RUBY VERSION
   ruby 3.3.0p0

BUNDLED WITH
   2.5.6
```

Key sections:

- **GEM specs**: All resolved gems with versions and dependencies
- **PLATFORMS**: Target platforms for the bundle
- **DEPENDENCIES**: Direct dependencies from Gemfile
- **RUBY VERSION**: Ruby version constraint
- **BUNDLED WITH**: Bundler version used

## Platform-Specific Gems

Ruby gems can have platform-specific variants:

```ruby
# Gemfile
gem 'nokogiri', '~> 1.16'  # Has native extensions

# Platform-specific gems
gem 'wdm', '>= 0.1.0', platforms: [:mingw, :mswin, :x64_mingw]
```

Add platforms to ensure proper resolution:

```bash
# Add platforms to Gemfile.lock
bundle lock --add-platform x86_64-linux arm64-darwin ruby
```

The lockfile will include platform-specific versions:

```
nokogiri (1.16.0)
nokogiri (1.16.0-arm64-darwin)
nokogiri (1.16.0-x86_64-linux)
```

**SBOM consideration:** Platform-specific gems may have different native dependencies that aren't captured in the lockfile.

## Git-Sourced Gems

Gems can come from Git repositories:

```ruby
# Gemfile
gem 'my-gem', git: 'https://github.com/example/my-gem.git', branch: 'main'
gem 'another-gem', git: 'https://github.com/example/another.git', tag: 'v1.0.0'
```

In `Gemfile.lock`:

```
GIT
  remote: https://github.com/example/my-gem.git
  revision: abc123def456
  branch: main
  specs:
    my-gem (1.0.0)
```

The Git revision is captured, but these gems won't have RubyGems metadata for enrichment.

## Groups and Development Dependencies

Bundler organizes gems into groups:

```ruby
group :development do
  gem 'debug'
end

group :test do
  gem 'rspec'
  gem 'factory_bot'
end

group :production do
  gem 'rails_12factor'
end
```

For production SBOMs, exclude development/test groups:

```bash
bundle install --without development test
```

## Generating an SBOM

### Using cdxgen (Recommended)

[cdxgen](https://github.com/CycloneDX/cdxgen) has excellent Ruby/Bundler support:

```bash
# Install cdxgen
npm install -g @cyclonedx/cdxgen

# Generate SBOM
cdxgen -t ruby -o sbom.cdx.json

# With deep analysis
cdxgen -t ruby --deep -o sbom.cdx.json
```

### Using CycloneDX Ruby Gem

The official CycloneDX gem:

```bash
# Install the gem
gem install cyclonedx-ruby

# Generate SBOM
cyclonedx-ruby -p . -o sbom.cdx.json

# Exclude dev/test groups
cyclonedx-ruby -p . -o sbom.cdx.json --exclude-dev
```

Or add to your Gemfile:

```ruby
group :development do
  gem 'cyclonedx-ruby'
end
```

### Using Trivy

[Trivy](https://github.com/aquasecurity/trivy) can scan Ruby projects:

```bash
# Generate CycloneDX SBOM
trivy fs --format cyclonedx --output sbom.cdx.json .

# Generate SPDX SBOM
trivy fs --format spdx-json --output sbom.spdx.json .
```

### Using Syft

[Syft](https://github.com/anchore/syft) supports Gemfile.lock:

```bash
syft . -o cyclonedx-json=sbom.cdx.json
```

## Automate with sbomify GitHub Action

The [sbomify GitHub Action](https://github.com/sbomify/github-action/) supports Ruby projects:

```yaml
---
name: Generate SBOM for Ruby Project

on: [push]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true

      - name: Generate and Upload SBOM
        uses: sbomify/github-action@master
        env:
          TOKEN: ${{ secrets.SBOMIFY_TOKEN }}
          COMPONENT_ID: 'my-ruby-component'
          LOCK_FILE: 'Gemfile.lock'
          OUTPUT_FILE: 'sbom.cdx.json'
          ENRICH: true
          UPLOAD: true
```

## GitLab and Other CI/CD

For GitLab CI:

```yaml
generate-sbom:
  image: ghcr.io/sbomify/github-action:latest
  stage: build
  script:
    - /entrypoint.sh
  variables:
    LOCK_FILE: "Gemfile.lock"
    OUTPUT_FILE: "sbom.cdx.json"
    ENRICH: "true"
  artifacts:
    paths:
      - sbom.cdx.json
```

## Rails Applications

For Rails applications, consider these additional aspects:

### Asset Pipeline Dependencies

If using Webpacker/Shakapacker, also generate a JavaScript SBOM:

```yaml
- name: Generate Ruby SBOM
  uses: sbomify/github-action@master
  env:
    LOCK_FILE: 'Gemfile.lock'
    OUTPUT_FILE: 'ruby-sbom.cdx.json'

- name: Generate JS SBOM
  uses: sbomify/github-action@master
  env:
    LOCK_FILE: 'yarn.lock'
    OUTPUT_FILE: 'js-sbom.cdx.json'
```

### Database Adapters

Native database adapters (`pg`, `mysql2`, `sqlite3`) have system library dependencies not captured in the lockfile. Document these:

```yaml
env:
  ADDITIONAL_PACKAGES: "libpq:14.0,openssl:1.1.1"
```

## Handling Special Cases

### Path Gems

Local gems via path:

```ruby
gem 'my-local-gem', path: '../my-local-gem'
```

These won't have RubyGems metadata and may need manual documentation.

### Private Gem Sources

For private gem servers (Gemfury, private RubyGems):

```ruby
source 'https://rubygems.org'
source 'https://gems.example.com' do
  gem 'private-gem'
end
```

Ensure your CI has authentication configured:

```bash
bundle config set --global gems.example.com user:password
```

### Bundler Settings

Consider your bundler configuration when generating SBOMs:

```bash
# View current settings
bundle config list

# Common settings that affect dependencies
bundle config set --local without development:test
bundle config set --local path vendor/bundle
```

## Best Practices

1. **Always commit Gemfile.lock** - Essential for reproducible builds
2. **Add all target platforms** - Use `bundle lock --add-platform`
3. **Pin Ruby version** - Use `.ruby-version` or specify in Gemfile
4. **Exclude dev dependencies** - For production SBOMs, use `--without development test`
5. **Run `bundle audit`** - Check for vulnerabilities alongside SBOM generation
6. **Update regularly** - Use `bundle outdated` to track updates

## Security Tooling Integration

```bash
# Install bundler-audit
gem install bundler-audit

# Check for vulnerabilities
bundle audit check --update

# Generate SBOM and audit in CI
bundle audit --format json > audit.json
cyclonedx-ruby -p . -o sbom.cdx.json
```

## Further Resources

For more SBOM tools and resources, see our [SBOM Resources]({{ site.url }}/resources/) page, which includes additional Ruby-specific tools like CycloneDX Ruby gem.
