#!/bin/sh
# Start Hugo development server

cd "$(dirname "$0")/.." || exit 1

hugo server --bind 0.0.0.0 --baseURL http://192.168.64.100:1313 --appendPort=false
