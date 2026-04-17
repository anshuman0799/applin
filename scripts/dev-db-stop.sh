#!/bin/sh

set -eu

CONTAINER_NAME="applin-postgres"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required to stop the local database" >&2
  exit 1
fi

if ! podman info >/dev/null 2>&1; then
  echo "Podman machine is not running"
  exit 0
fi

if podman ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "Stopping container '$CONTAINER_NAME'..."
  podman stop "$CONTAINER_NAME" >/dev/null
  echo "Local database stopped"
else
  echo "Container '$CONTAINER_NAME' is not running"
fi