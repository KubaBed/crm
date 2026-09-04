#!/usr/bin/env bash
# Deploy jednego z dwóch projektów Vercel z korzenia monorepo.
#
# Oba projekty (crm-app z rootDirectory=apps/app, crm-api z root=repo) deployujemy z korzenia
# repo, bo CLI dokleja rootDirectory do cwd: `--cwd apps/app` dawało "apps/app/apps/app".
# Jeden katalog może być zlinkowany tylko z jednym projektem, więc skrypt przelinkowuje
# .vercel/project.json przed każdym deployem.
#
#   workshift/deploy.sh api            # preview
#   workshift/deploy.sh app --prod     # produkcja
#
# Wymaga: `bunx vercel login` (npx vercel pada na EBADDEVENGINES z Node 25).
set -euo pipefail
cd "$(dirname "$0")/.."
target="${1:-}"; shift || true
case "$target" in
  api) project=crm-api ;;
  app) project=crm-app ;;
  *) echo "użycie: $0 <api|app> [--prod]" >&2; exit 2 ;;
esac
bunx vercel link --project "$project" --yes >/dev/null
echo "deploy $project $*"
bunx vercel deploy --yes "$@"
