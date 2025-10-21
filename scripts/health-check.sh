#!/bin/bash

# FarmTally Health Check Script
# Wrapper script for Jenkins pipeline integration

set -e

# Default values
API_URL="${API_URL:-http://localhost:3000}"
SERVICE_TOKEN="${SERVICE_TOKEN:-}"
TIMEOUT="${TIMEOUT:-10000}"
RETRIES="${RETRIES:-3}"
VERBOSE="${VERBOSE:-false}"
JSON_OUTPUT="${JSON_OUTPUT:-false}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            API_URL="$2"
            shift 2
            ;;
        --token)
            SERVICE_TOKEN="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE="true"
            shift
            ;;
        --json)
            JSON_OUTPUT="true"
            shift
            ;;
        --help)
            echo "FarmTally Health Check Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --url <url>          Base URL of the API (default: http://localhost:3000)"
            echo "  --token <token>      Service token for authenticated requests"
            echo "  --timeout <ms>       Request timeout in milliseconds (default: 10000)"
            echo "  --retries <count>    Number of retries for failed requests (default: 3)"
            echo "  --verbose            Enable verbose logging"
            echo "  --json               Output results in JSON format"
            echo "  --help               Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  API_URL              Base URL of the API"
            echo "  SERVICE_TOKEN        Service token for authenticated requests"
            echo "  JWT_SECRET           JWT secret for generating temporary tokens"
            echo "  TIMEOUT              Request timeout in milliseconds"
            echo "  RETRIES              Number of retries for failed requests"
            echo "  VERBOSE              Enable verbose logging (true/false)"
            echo "  JSON_OUTPUT          Output results in JSON format (true/false)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build node command arguments
NODE_ARGS=()
NODE_ARGS+=("--url" "$API_URL")

if [[ -n "$SERVICE_TOKEN" ]]; then
    NODE_ARGS+=("--token" "$SERVICE_TOKEN")
fi

NODE_ARGS+=("--timeout" "$TIMEOUT")
NODE_ARGS+=("--retries" "$RETRIES")

if [[ "$VERBOSE" == "true" ]]; then
    NODE_ARGS+=("--verbose")
fi

if [[ "$JSON_OUTPUT" == "true" ]]; then
    NODE_ARGS+=("--json")
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the health check script exists
if [[ ! -f "scripts/health-check.js" ]]; then
    echo "❌ Error: Health check script not found at scripts/health-check.js"
    exit 1
fi

# Check if axios is available (required dependency)
if ! node -e "require('axios')" 2>/dev/null; then
    echo "❌ Error: axios package is not installed. Run 'npm install' first."
    exit 1
fi

# Check if jsonwebtoken is available (required dependency)
if ! node -e "require('jsonwebtoken')" 2>/dev/null; then
    echo "❌ Error: jsonwebtoken package is not installed. Run 'npm install' first."
    exit 1
fi

# Run the health check
echo "🏥 Starting FarmTally health checks..."
echo "📍 API URL: $API_URL"

if [[ "$VERBOSE" == "true" ]]; then
    echo "⚙️  Configuration:"
    echo "   - Timeout: ${TIMEOUT}ms"
    echo "   - Retries: $RETRIES"
    echo "   - Service Token: ${SERVICE_TOKEN:+[PROVIDED]}${SERVICE_TOKEN:-[NOT PROVIDED]}"
    echo ""
fi

# Execute the health check
node scripts/health-check.js "${NODE_ARGS[@]}"
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
    echo ""
    echo "✅ All health checks passed successfully!"
else
    echo ""
    echo "❌ Health checks failed with exit code $exit_code"
fi

exit $exit_code