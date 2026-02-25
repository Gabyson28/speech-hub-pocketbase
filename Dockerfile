############################
# Stage 1 — Downloader
############################
FROM alpine:3 AS downloader

ARG TARGETOS
ARG TARGETARCH
ARG VERSION=0.36.3

ENV BUILDX_ARCH="${TARGETOS:-linux}_${TARGETARCH:-amd64}"

# Instalar dependencias necesarias
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zlib-dev

# Descargar y extraer PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && unzip pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && chmod +x /pocketbase

############################
# Stage 2 — Runtime
############################
FROM alpine:3

EXPOSE 8090

# Instalar certificados y actualizar trust store
RUN apk add --no-cache ca-certificates \
    && update-ca-certificates

# Asegurar que Go use el bundle correcto
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# Copiar binario
COPY --from=downloader /pocketbase /usr/local/bin/pocketbase

# Copiar hooks y migrations
COPY pb_migrations /pb_migrations
COPY pb_hooks /pb_hooks

# Ejecutar PocketBase
CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--hooksDir=/pb_hooks"]