FROM ruby:3-slim

ENV LANG=C.UTF-8

# Install system dependencies including curl first
RUN rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    unzip \
    webp \
    git \
    pkg-config \
    zlib1g-dev \
    libxml2-dev \
    libxslt-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Symlink npm to bun for libraries that hardcode npm
RUN ln -s /root/.bun/bin/bun /root/.bun/bin/npm

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES=true

# Install Ruby dependencies
COPY Gemfile Gemfile.lock ./
RUN gem install bundler --no-document && \
    bundle config build.nokogiri --use-system-libraries && \
    bundle config set --local force_ruby_platform true && \
    bundle install

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