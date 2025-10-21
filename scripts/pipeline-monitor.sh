#!/bin/bash

# Pipeline Monitor Shell Script
# Wrapper for pipeline-monitor.js

set -e

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the Node.js monitor script
node "$SCRIPT_DIR/pipeline-monitor.js" "$@"