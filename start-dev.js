#!/usr/bin/env node
// Ensures nvm node is in PATH before Turbopack starts spawning child processes.
// Run via: /path/to/node start-dev.js
const path = require("path")

// Derive the bin dir from whichever node binary is running this script,
// so this works regardless of NVM version or machine.
const NODE_BIN = path.dirname(process.execPath)
process.env.PATH = `${NODE_BIN}:${process.env.PATH || "/usr/bin:/bin"}`

// Load next dev relative to this file — no hardcoded absolute paths.
require(path.join(__dirname, "node_modules/next/dist/bin/next"))
