FROM node:22 AS node-builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

FROM ruby:3.2-bookworm

WORKDIR /usr/src/app

# Node.js runtime is required by execjs (used by autoprefixer and uglifier)
# hadolint ignore=DL3008
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    nodejs \
    npm \
    pkg-config \
    libxml2-dev \
    libxslt-dev \
    webp && \
    rm -rf /var/lib/apt/lists/*

COPY --from=node-builder /usr/src/app/node_modules ./node_modules

COPY Gemfile Gemfile.lock ./
# hadolint ignore=DL3028
RUN gem install bundler --no-document && \
    bundle config build.nokogiri --use-system-libraries && \
    bundle config set --local force_ruby_platform true && \
    bundle install

COPY . .