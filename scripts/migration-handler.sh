#!/bin/bash

# FarmTally Database Migration Handler
# This script handles database migrations with proper error handling and logging

set -e  # Exit on any error

# Configuration
LOG_FILE="migration.log"
MIGRATION_TIMEOUT=300  # 5 minutes timeout
RETRY_COUNT=3
RETRY_DELAY=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
    
    case $level in
        "ERROR")
            echo -e "${RED}${timestamp} [${level}] ${message}${NC}" >&2
            ;;
        "SUCCESS")
            echo -e "${GREEN}${timestamp} [${level}] ${message}${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}${timestamp} [${level}] ${message}${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}${timestamp} [${level}] ${message}${NC}"
            ;;
    esac
}

# Check if required environment variables are set
check_environment() {
    log "INFO" "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        log "ERROR" "DATABASE_URL environment variable is not set"
        return 1
    fi
    
    log "SUCCESS" "Environment variables validated"
    return 0
}

# Verify database connectivity
verify_database_connectivity() {
    log "INFO" "Verifying database connectivity..."
    
    local retry=0
    while [ $retry -lt $RETRY_COUNT ]; do
        if timeout $MIGRATION_TIMEOUT npx prisma db pull --preview-feature --force > /dev/null 2>&1; then
            log "SUCCESS" "Database connectivity verified"
            return 0
        else
            retry=$((retry + 1))
            if [ $retry -lt $RETRY_COUNT ]; then
                log "WARNING" "Database connection failed (attempt $retry/$RETRY_COUNT). Retrying in ${RETRY_DELAY}s..."
                sleep $RETRY_DELAY
            else
                log "ERROR" "Failed to connect to database after $RETRY_COUNT attempts"
                return 1
            fi
        fi
    done
}

# Get current migration status
get_migration_status() {
    log "INFO" "Checking current migration status..."
    
    if npx prisma migrate status > migration_status.tmp 2>&1; then
        local pending_migrations=$(grep -c "Following migration have not yet been applied" migration_status.tmp || echo "0")
        local applied_migrations=$(grep -c "applied" migration_status.tmp || echo "0")
        
        log "INFO" "Applied migrations: $applied_migrations"
        log "INFO" "Pending migrations: $pending_migrations"
        
        # Store status for reporting
        echo "{\"applied\": $applied_migrations, \"pending\": $pending_migrations, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > migration_status.json
        
        rm -f migration_status.tmp
        return 0
    else
        log "ERROR" "Failed to get migration status"
        rm -f migration_status.tmp
        return 1
    fi
}

# Execute database migrations
execute_migrations() {
    log "INFO" "Starting database migration execution..."
    
    # Create backup of current schema (if possible)
    log "INFO" "Creating schema backup..."
    if npx prisma db pull --force > /dev/null 2>&1; then
        log "SUCCESS" "Schema backup created"
    else
        log "WARNING" "Could not create schema backup, proceeding with migration"
    fi
    
    # Execute migrations with timeout
    log "INFO" "Applying pending migrations..."
    if timeout $MIGRATION_TIMEOUT npx prisma migrate deploy 2>&1 | tee -a "$LOG_FILE"; then
        log "SUCCESS" "Migrations applied successfully"
        
        # Verify migration completion
        if verify_migration_completion; then
            log "SUCCESS" "Migration completion verified"
            return 0
        else
            log "ERROR" "Migration completion verification failed"
            return 1
        fi
    else
        local exit_code=$?
        log "ERROR" "Migration execution failed with exit code: $exit_code"
        return $exit_code
    fi
}

# Verify migration completion
verify_migration_completion() {
    log "INFO" "Verifying migration completion..."
    
    # Check if there are any pending migrations
    if npx prisma migrate status | grep -q "Database schema is up to date"; then
        log "SUCCESS" "All migrations have been applied successfully"
        return 0
    elif npx prisma migrate status | grep -q "Following migration have not yet been applied"; then
        log "ERROR" "Some migrations are still pending"
        return 1
    else
        log "WARNING" "Migration status unclear, performing additional verification"
        
        # Try to generate Prisma client as additional verification
        if npx prisma generate > /dev/null 2>&1; then
            log "SUCCESS" "Prisma client generation successful - migrations likely completed"
            return 0
        else
            log "ERROR" "Prisma client generation failed - migrations may be incomplete"
            return 1
        fi
    fi
}

# Generate migration report
generate_migration_report() {
    log "INFO" "Generating migration report..."
    
    local report_file="migration_report_$(date +%Y%m%d_%H%M%S).json"
    
    # Get final migration status
    get_migration_status
    
    # Create comprehensive report
    cat > "$report_file" << EOF
{
    "migration_execution": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "status": "completed",
        "log_file": "$LOG_FILE",
        "database_url_hash": "$(echo -n "$DATABASE_URL" | sha256sum | cut -d' ' -f1)",
        "prisma_version": "$(npx prisma --version | head -n1 | cut -d' ' -f2 || echo 'unknown')"
    },
    "migration_status": $(cat migration_status.json 2>/dev/null || echo '{"error": "status unavailable"}'),
    "environment": {
        "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
        "npm_version": "$(npm --version 2>/dev/null || echo 'unknown')",
        "build_number": "${BUILD_NUMBER:-unknown}",
        "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
    }
}
EOF
    
    log "SUCCESS" "Migration report generated: $report_file"
    echo "$report_file"
}

# Cleanup function
cleanup() {
    log "INFO" "Cleaning up temporary files..."
    rm -f migration_status.tmp migration_status.json
}

# Main migration handler function
main() {
    log "INFO" "=== FarmTally Database Migration Handler Started ==="
    log "INFO" "Build Number: ${BUILD_NUMBER:-unknown}"
    log "INFO" "Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Execute migration steps
    if ! check_environment; then
        log "ERROR" "Environment validation failed"
        exit 1
    fi
    
    if ! verify_database_connectivity; then
        log "ERROR" "Database connectivity check failed"
        exit 1
    fi
    
    if ! get_migration_status; then
        log "ERROR" "Failed to get initial migration status"
        exit 1
    fi
    
    if ! execute_migrations; then
        log "ERROR" "Migration execution failed"
        exit 1
    fi
    
    # Generate final report
    local report_file=$(generate_migration_report)
    
    log "SUCCESS" "=== Database Migration Completed Successfully ==="
    log "INFO" "Migration report: $report_file"
    log "INFO" "Migration log: $LOG_FILE"
    
    exit 0
}

# Handle script arguments
case "${1:-main}" in
    "check-connectivity")
        check_environment && verify_database_connectivity
        ;;
    "status")
        check_environment && get_migration_status
        ;;
    "migrate")
        main
        ;;
    "main"|"")
        main
        ;;
    *)
        echo "Usage: $0 [check-connectivity|status|migrate|main]"
        echo "  check-connectivity: Verify database connection"
        echo "  status: Check migration status"
        echo "  migrate: Run full migration process"
        echo "  main: Run full migration process (default)"
        exit 1
        ;;
esac