#!/bin/sh

set -eu

CONTAINER_NAME="applin-postgres"
POSTGRES_IMAGE="postgres:16-alpine"
POSTGRES_USER="applin"
POSTGRES_PASSWORD="applin"
POSTGRES_DB="applin_dev"
HOST_PORT="5433"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required to start the local database" >&2
  exit 1
fi

if ! podman info >/dev/null 2>&1; then
  if ! podman machine list | grep -q '^podman-machine-default'; then
    echo "Initializing Podman machine..."
    podman machine init
  fi

  echo "Starting Podman machine..."
  podman machine start
fi

if podman ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  if podman ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    echo "Container '$CONTAINER_NAME' is already running"
  else
    echo "Starting existing container '$CONTAINER_NAME'..."
    podman start "$CONTAINER_NAME" >/dev/null
  fi
else
  echo "Creating container '$CONTAINER_NAME'..."
  podman run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_USER="$POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB="$POSTGRES_DB" \
    -p "$HOST_PORT":5432 \
    "$POSTGRES_IMAGE" >/dev/null
fi

echo "Waiting for PostgreSQL to accept connections..."
podman exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Local database is ready at postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$HOST_PORT/$POSTGRES_DB?schema=public"