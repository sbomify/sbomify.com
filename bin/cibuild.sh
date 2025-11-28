#!/usr/bin/env bash
set -e # halt script on error

bun install
bun run build:d2
bun run build:css
bundle exec jekyll build
#bundle exec htmlproofer ./_site
