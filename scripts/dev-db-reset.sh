#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)

cd "$ROOT_DIR"

sh ./scripts/dev-db-start.sh

set -a
. ./.env.local
set +a

pnpm prisma migrate reset --force --skip-seed
node ./prisma/seed.js