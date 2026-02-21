FROM alpine:3 as downloader

ARG TARGETOS
ARG TARGETARCH
ARG VERSION=0.36.3

ENV BUILDX_ARCH="${TARGETOS:-linux}_${TARGETARCH:-amd64}"

# Install dependencies required to download PocketBase
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zlib-dev

# Download and extract PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && unzip pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && chmod +x /pocketbase

# Final minimal container
FROM alpine:3

EXPOSE 8090

# Certificados SSL necesarios para conexiones TLS
RUN apk add --no-cache ca-certificates

# Copy PocketBase binary into final image
COPY --from=downloader /pocketbase /usr/local/bin/pocketbase

# pb_data is NOT copied — it lives in a Railway persistent volume at /pb_data
COPY pb_migrations /pb_migrations
COPY pb_hooks /pb_hooks

CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--hooksDir=/pb_hooks"]