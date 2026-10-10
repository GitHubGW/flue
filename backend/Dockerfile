FROM node:24-trixie-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends bash coreutils findutils ca-certificates git python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=docker.io/cloudflare/sandbox:1.0.0 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim

COPY sandbox-files/ /workspace/

WORKDIR /workspace
CMD ["sleep", "infinity"]
