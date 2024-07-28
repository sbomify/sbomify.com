#!/bin/bash

docker run \
    -ti \
    -p 4000:4000 \
    -v "$(pwd):/usr/src/app" \
    blog.vp
