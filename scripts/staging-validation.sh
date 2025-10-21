#!/bin/bash

# Staging Environment Validation Shell Script
# Wrapper for staging-validation.js

set -e

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set staging environment variables if not already set
if [ -z "$STAGING_URL" ]; then
    export STAGING_URL="http://localhost:3000"
    echo "Using default STAGING_URL: $STAGING_URL"
fi

# Run the Node.js validation script
node "$SCRIPT_DIR/staging-validation.js" "$@"