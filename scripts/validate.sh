#!/bin/sh
# Run all validation tests

cd "$(dirname "$0")/.." || exit 1
exec .githooks/pre-commit
