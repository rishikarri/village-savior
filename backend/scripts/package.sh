#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_DIR="${ROOT}/.package"
ZIP_PATH="${ROOT}/lambda.zip"

rm -rf "${PACKAGE_DIR}" "${ZIP_PATH}"
mkdir -p "${PACKAGE_DIR}"

python3 -m pip install -r "${ROOT}/requirements.txt" -t "${PACKAGE_DIR}" --upgrade
cp -R "${ROOT}/app" "${PACKAGE_DIR}/app"

(
  cd "${PACKAGE_DIR}"
  zip -qr "${ZIP_PATH}" .
)

echo "Wrote ${ZIP_PATH}"
