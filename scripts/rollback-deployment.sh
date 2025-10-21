#!/bin/bash

# FarmTally Deployment Rollback Script
# This script handles rollback to the previous successful deployment

set -e

# Configuration
VPS_HOST="${VPS_HOST:-147.93.153.247}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="${APP_DIR:-/opt/farmtally}"
BACKUP_DIR="${APP_DIR}/backups"
LOG_FILE="rollback.log"

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

# Check if rollback target is specified
check_rollback_target() {
    if [ -z "$ROLLBACK_BUILD_NUMBER" ]; then
        log "ERROR" "ROLLBACK_BUILD_NUMBER environment variable not set"
        log "INFO" "Usage: ROLLBACK_BUILD_NUMBER=123 ./rollback-deployment.sh"
        return 1
    fi
    
    log "INFO" "Rollback target: Build #$ROLLBACK_BUILD_NUMBER"
    return 0
}

# Verify backup exists
verify_backup_exists() {
    log "INFO" "Verifying backup exists for build #$ROLLBACK_BUILD_NUMBER..."
    
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
        if [ ! -d '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}' ]; then
            echo 'Backup directory not found: ${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}'
            exit 1
        fi
        
        if [ ! -f '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}/backend.tar.gz' ]; then
            echo 'Backend backup not found'
            exit 1
        fi
        
        if [ ! -f '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}/frontend.tar.gz' ]; then
            echo 'Frontend backup not found'
            exit 1
        fi
        
        if [ ! -f '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}/manifest.json' ]; then
            echo 'Manifest not found'
            exit 1
        fi
        
        echo 'All backup files verified'
    "
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Backup verification passed"
        return 0
    else
        log "ERROR" "Backup verification failed"
        return 1
    fi
}

# Create current state backup before rollback
backup_current_state() {
    log "INFO" "Creating backup of current state before rollback..."
    
    local current_backup_name="pre-rollback-$(date +%Y%m%d-%H%M%S)"
    
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
        mkdir -p '${BACKUP_DIR}/${current_backup_name}'
        
        # Backup current backend
        if [ -d '${APP_DIR}/backend' ]; then
            tar -czf '${BACKUP_DIR}/${current_backup_name}/backend.tar.gz' -C '${APP_DIR}' backend/
        fi
        
        # Backup current frontend
        if [ -d '${APP_DIR}/frontend' ]; then
            tar -czf '${BACKUP_DIR}/${current_backup_name}/frontend.tar.gz' -C '${APP_DIR}' frontend/
        fi
        
        # Create rollback manifest
        cat > '${BACKUP_DIR}/${current_backup_name}/manifest.json' << EOF
{
    \"type\": \"pre-rollback-backup\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"rollback_target\": \"${ROLLBACK_BUILD_NUMBER}\",
    \"jenkins_build\": \"${BUILD_NUMBER:-unknown}\"
}
EOF
        
        echo 'Current state backup completed: ${current_backup_name}'
    "
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Current state backup completed"
        return 0
    else
        log "ERROR" "Failed to backup current state"
        return 1
    fi
}

# Stop application services
stop_services() {
    log "INFO" "Stopping application services..."
    
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
        # Stop PM2 processes
        pm2 stop farmtally-backend || true
        pm2 delete farmtally-backend || true
        
        # Wait for graceful shutdown
        sleep 3
        
        echo 'Services stopped'
    "
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Services stopped successfully"
        return 0
    else
        log "WARNING" "Some services may not have stopped cleanly"
        return 0  # Continue with rollback even if stop has issues
    fi
}

# Restore from backup
restore_from_backup() {
    log "INFO" "Restoring from backup build #$ROLLBACK_BUILD_NUMBER..."
    
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
        # Remove current deployment
        rm -rf '${APP_DIR}/backend'
        rm -rf '${APP_DIR}/frontend'
        
        # Create directories
        mkdir -p '${APP_DIR}/backend'
        mkdir -p '${APP_DIR}/frontend'
        
        # Restore backend
        echo 'Restoring backend...'
        tar -xzf '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}/backend.tar.gz' -C '${APP_DIR}/'
        
        # Restore frontend
        echo 'Restoring frontend...'
        tar -xzf '${BACKUP_DIR}/build-${ROLLBACK_BUILD_NUMBER}/frontend.tar.gz' -C '${APP_DIR}/'
        
        echo 'Restoration completed'
    "
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Restoration completed successfully"
        return 0
    else
        log "ERROR" "Restoration failed"
        return 1
    fi
}

# Restore database to previous state (if needed)
restore_database_state() {
    log "INFO" "Checking if database rollback is needed..."
    
    # For now, we'll just log this step
    # In a production environment, you might want to:
    # 1. Check if schema changes were made
    # 2. Run reverse migrations if available
    # 3. Restore from database backup if necessary
    
    log "WARNING" "Database rollback not implemented - manual intervention may be required"
    log "INFO" "Please verify database state manually if schema changes were made"
    
    return 0
}

# Start services with rollback version
start_services() {
    log "INFO" "Starting services with rollback version..."
    
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
        cd '${APP_DIR}/backend'
        
        # Install dependencies (in case they changed)
        npm ci --only=production
        
        # Start PM2 process
        pm2 start server.js --name farmtally-backend
        pm2 save
        
        # Wait for startup
        sleep 5
        
        # Check status
        pm2 status
        
        # Verify process is running
        if ! pm2 list | grep -q 'farmtally-backend.*online'; then
            echo 'Failed to start backend process'
            pm2 logs farmtally-backend --lines 20
            exit 1
        fi
        
        echo 'Services started successfully'
    "
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Services started successfully"
        return 0
    else
        log "ERROR" "Failed to start services"
        return 1
    fi
}

# Verify rollback health
verify_rollback_health() {
    log "INFO" "Verifying rollback health..."
    
    # Wait for services to fully initialize
    sleep 10
    
    # Check health endpoint
    local health_check_attempts=5
    local attempt=1
    
    while [ $attempt -le $health_check_attempts ]; do
        log "INFO" "Health check attempt $attempt/$health_check_attempts..."
        
        if curl -f -s "http://${VPS_HOST}:3000/api/health" > /dev/null; then
            log "SUCCESS" "Health check passed on attempt $attempt"
            return 0
        else
            log "WARNING" "Health check failed on attempt $attempt"
            if [ $attempt -lt $health_check_attempts ]; then
                sleep 10
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    log "ERROR" "Health check failed after $health_check_attempts attempts"
    return 1
}

# Generate rollback report
generate_rollback_report() {
    log "INFO" "Generating rollback report..."
    
    local report_file="rollback_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "rollback_execution": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "target_build": "${ROLLBACK_BUILD_NUMBER}",
        "initiated_by": "${USER:-unknown}",
        "jenkins_build": "${BUILD_NUMBER:-unknown}",
        "status": "completed"
    },
    "environment": {
        "vps_host": "${VPS_HOST}",
        "app_directory": "${APP_DIR}",
        "backup_directory": "${BACKUP_DIR}"
    },
    "verification": {
        "health_check_passed": true,
        "services_running": true
    }
}
EOF
    
    log "SUCCESS" "Rollback report generated: $report_file"
    echo "$report_file"
}

# Main rollback function
main() {
    log "INFO" "=== FarmTally Deployment Rollback Started ==="
    log "INFO" "Target Build: ${ROLLBACK_BUILD_NUMBER:-not specified}"
    log "INFO" "Current Build: ${BUILD_NUMBER:-unknown}"
    
    # Execute rollback steps
    if ! check_rollback_target; then
        exit 1
    fi
    
    if ! verify_backup_exists; then
        log "ERROR" "Cannot proceed with rollback - backup verification failed"
        exit 1
    fi
    
    if ! backup_current_state; then
        log "ERROR" "Failed to backup current state"
        exit 1
    fi
    
    if ! stop_services; then
        log "ERROR" "Failed to stop services cleanly"
        # Continue anyway - we need to complete the rollback
    fi
    
    if ! restore_from_backup; then
        log "ERROR" "Failed to restore from backup"
        exit 1
    fi
    
    if ! restore_database_state; then
        log "WARNING" "Database state restoration had issues"
        # Continue - this is often manual
    fi
    
    if ! start_services; then
        log "ERROR" "Failed to start services after rollback"
        exit 1
    fi
    
    if ! verify_rollback_health; then
        log "ERROR" "Rollback health verification failed"
        exit 1
    fi
    
    # Generate final report
    local report_file=$(generate_rollback_report)
    
    log "SUCCESS" "=== Rollback Completed Successfully ==="
    log "INFO" "Rollback report: $report_file"
    log "INFO" "Rollback log: $LOG_FILE"
    log "INFO" "Application should now be running build #$ROLLBACK_BUILD_NUMBER"
    
    exit 0
}

# Handle script arguments
case "${1:-main}" in
    "verify-backup")
        check_rollback_target && verify_backup_exists
        ;;
    "health-check")
        verify_rollback_health
        ;;
    "rollback"|"main"|"")
        main
        ;;
    *)
        echo "Usage: $0 [verify-backup|health-check|rollback|main]"
        echo "  verify-backup: Check if backup exists for ROLLBACK_BUILD_NUMBER"
        echo "  health-check: Verify application health"
        echo "  rollback: Execute full rollback process"
        echo "  main: Execute full rollback process (default)"
        echo ""
        echo "Environment variables:"
        echo "  ROLLBACK_BUILD_NUMBER: Target build number to rollback to (required)"
        echo "  VPS_HOST: VPS hostname (default: 147.93.153.247)"
        echo "  VPS_USER: VPS username (default: root)"
        echo "  APP_DIR: Application directory (default: /opt/farmtally)"
        exit 1
        ;;
esac