#!/bin/bash
set -e

docker build --tag alancnet/token-tool .
docker push alancnet/token-tool

