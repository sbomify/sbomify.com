FROM golang:1.24-alpine AS hugo-build
ARG HUGO_VERSION=0.145.0
RUN apk add --no-cache git gcc g++ musl-dev && \
    CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@v${HUGO_VERSION}

FROM alpine:3.21 AS d2-source
WORKDIR /tmp
ARG D2_VERSION=0.7.1
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then D2_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then D2_ARCH="arm64"; \
    else echo "Unsupported architecture: $ARCH"; exit 1; fi && \
    curl -fsSL "https://github.com/terrastruct/d2/releases/download/v${D2_VERSION}/d2-v${D2_VERSION}-linux-${D2_ARCH}.tar.gz" -o d2.tar.gz && \
    tar -xzf d2.tar.gz && \
    find . -type f -name d2 -exec mv {} /usr/local/bin/d2 \; && \
    chmod +x /usr/local/bin/d2

FROM alpine:3.21

RUN apk add --no-cache \
    curl \
    git \
    libwebp-tools \
    bash

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Symlink npm to bun for libraries that hardcode npm
RUN ln -s /root/.bun/bin/bun /root/.bun/bin/npm

# Install Hugo
COPY --from=hugo-build /go/bin/hugo /usr/local/bin/hugo

# Install d2
COPY --from=d2-source /usr/local/bin/d2 /usr/local/bin/d2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Bun dependencies to a separate location
COPY package.json bun.lock /usr/local/bun-deps/
WORKDIR /usr/local/bun-deps
RUN bun install --frozen-lockfile

# Add the installed binaries to PATH and set NODE_PATH for module resolution
ENV PATH="/usr/local/bun-deps/node_modules/.bin:$PATH"
ENV NODE_PATH="/usr/local/bun-deps/node_modules"

# Switch back to app directory
WORKDIR /usr/src/app

COPY . .
