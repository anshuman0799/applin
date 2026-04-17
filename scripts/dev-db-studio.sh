#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)

cd "$ROOT_DIR"

if [ ! -f ./.env.local ]; then
  echo ".env.local not found" >&2
  exit 1
fi

sh ./scripts/dev-db-start.sh

set -a
. ./.env.local
set +a

pnpm prisma studio --port 5555