#!/bin/bash

docker run \
    --rm \
    -v "$(pwd):/usr/src/app" \
    -e JEKYLL_ENV=production \
    blog.vp bundle exec htmlproofer ./_site
