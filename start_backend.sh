#!/usr/bin/env bash
# Start the FastAPI backend from the project root.
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f ".venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
fi

exec uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
