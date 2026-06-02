# base image
FROM harbor.tegical.world/docker.io/python:3.12-slim-bookworm AS base

WORKDIR /app/api

# Install uv
ENV UV_VERSION=0.8.9
ENV PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
ENV UV_DEFAULT_INDEX=https://mirrors.aliyun.com/pypi/simple/
ENV UV_HTTP_TIMEOUT=120
ARG NLTK_DATA_BASE_URL=https://v4.gh-proxy.org/https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages

RUN pip install --no-cache-dir uv==${UV_VERSION}


FROM base AS packages

RUN sed -i 's@deb.debian.org@mirrors.aliyun.com@g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
          # basic environment
          g++ \
          # for building gmpy2
          libgmp-dev libmpfr-dev libmpc-dev

# Install Python dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# production stage
FROM base AS production

ENV FLASK_APP=app.py
ENV EDITION=SELF_HOSTED
ENV DEPLOY_ENV=PRODUCTION
ENV CONSOLE_API_URL=http://127.0.0.1:5001
ENV CONSOLE_WEB_URL=http://127.0.0.1:3000
ENV SERVICE_API_URL=http://127.0.0.1:5001
ENV APP_WEB_URL=http://127.0.0.1:3000

EXPOSE 5001

# set timezone
ENV TZ=UTC

# Set UTF-8 locale
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV PYTHONIOENCODING=utf-8

WORKDIR /app/api

RUN \
    sed -i 's@deb.debian.org@mirrors.aliyun.com@g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    # Install dependencies
    && apt-get install -y --no-install-recommends \
        # basic environment
        curl nodejs \
        # for gmpy2 \
        libgmp-dev libmpfr-dev libmpc-dev \
        # For Security
        expat libldap-2.5-0 perl libsqlite3-0 zlib1g \
        # install fonts to support the use of tools like pypdfium2
        fonts-noto-cjk \
        # install a package to improve the accuracy of guessing mime type and file extension
        media-types \
        # install libmagic to support the use of python-magic guess MIMETYPE
        libmagic1 \
        # unzip preloaded nltk zip resources
        unzip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy Python environment and packages
ENV VIRTUAL_ENV=/app/api/.venv
COPY --from=packages ${VIRTUAL_ENV} ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:${PATH}"

# Download nltk data
RUN set -eu \
    && mkdir -p /root/nltk_data/tokenizers /root/nltk_data/corpora \
    && curl -fsSL --retry 3 --retry-delay 2 \
      ${NLTK_DATA_BASE_URL}/tokenizers/punkt.zip \
      -o /tmp/punkt.zip \
    && unzip -q /tmp/punkt.zip -d /root/nltk_data/tokenizers \
    && rm -f /tmp/punkt.zip \
    && curl -fsSL --retry 3 --retry-delay 2 \
      ${NLTK_DATA_BASE_URL}/corpora/stopwords.zip \
      -o /tmp/stopwords.zip \
    && unzip -q /tmp/stopwords.zip -d /root/nltk_data/corpora \
    && rm -f /tmp/stopwords.zip

ENV TIKTOKEN_CACHE_DIR=/app/api/.tiktoken_cache

RUN python -c "import tiktoken; tiktoken.encoding_for_model('gpt2')"

# Copy source code
COPY . /app/api/

# Copy entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
