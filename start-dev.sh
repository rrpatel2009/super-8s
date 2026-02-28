#!/bin/bash
# Wrapper that ensures node is in PATH for Turbopack's child process spawning
export PATH="/Users/rrpatel/.local/bin:/Users/rrpatel/.nvm/versions/node/v24.11.1/bin:$PATH"
exec "/Users/rrpatel/.nvm/versions/node/v24.11.1/bin/node" \
  "/Users/rrpatel/Downloads/Code Projects/super-8s/node_modules/next/dist/bin/next" \
  dev
