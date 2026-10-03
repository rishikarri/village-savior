#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_DIR="${ROOT}/.package"
ZIP_PATH="${ROOT}/lambda.zip"

rm -rf "${PACKAGE_DIR}" "${ZIP_PATH}"
mkdir -p "${PACKAGE_DIR}"

PYTHON="${ROOT}/.venv/bin/python3"
if [ ! -x "${PYTHON}" ]; then
  PYTHON="python3"
fi

# Linux wheels for Lambda (not macOS). uvicorn is local-only.
"${PYTHON}" -m pip install \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 3.12 \
  --only-binary=:all: \
  --upgrade \
  -t "${PACKAGE_DIR}" \
  fastapi==0.115.6 \
  pydantic==2.10.4 \
  mangum==0.19.0 \
  starlette==0.41.3 \
  anyio==4.12.1 \
  typing-extensions==4.16.0 \
  annotated-types==0.7.0 \
  pydantic-core==2.27.2 \
  idna==3.20 \
  exceptiongroup==1.3.1

cp -R "${ROOT}/app" "${PACKAGE_DIR}/app"

(
  cd "${PACKAGE_DIR}"
  zip -qr "${ZIP_PATH}" .
)

echo "Wrote ${ZIP_PATH}"
