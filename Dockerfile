FROM ruby:3.3-bookworm
ENV LANG C.UTF-8
RUN apt-get update -qq && \
    apt-get install -y python3 build-essential curl

# Install nvm (Node Version Manager)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash \
    && apt-get update -qq \
    && apt-get install nodejs -y

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES true

# Install Ruby dependencies
ADD Gemfile /usr/src/app
ADD Gemfile.lock /usr/src/app
RUN gem install bundle && \
    bundle && \
    bundle install

# Install Node.js dependencies including specific npm version and Tailwind CSS
ADD package.json /usr/src/app
ADD package-lock.json /usr/src/app
RUN npm install

#CMD jekyll serve --host 0.0.0.0 --incremental
CMD ["sh", "-c", "npm run watch:css & bundle exec jekyll serve --host 0.0.0.0 --incremental"]

EXPOSE 4000