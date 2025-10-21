#!/bin/bash

# FarmTally Artifact Deployment System
# Handles deployment and rollback of versioned artifacts

set -e

# Configuration
ARTIFACTS_DIR="artifacts"
DEPLOYMENT_LOG_DIR="deployment-logs"
BACKUP_DIR="deployment-backups"
DEFAULT_DEPLOY_PATH="/opt/farmtally"
DEFAULT_USER="farmtally"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_warn() {
    echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Create deployment log entry
create_deployment_log() {
    local action="$1"
    local artifact_name="$2"
    local target_host="$3"
    local deploy_path="$4"
    local status="$5"
    local details="$6"
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local log_file="$DEPLOYMENT_LOG_DIR/deployment-$(date +%Y%m%d).log"
    
    # Ensure log directory exists
    mkdir -p "$DEPLOYMENT_LOG_DIR"
    
    # Create log entry
    cat >> "$log_file" << EOF
{
  "timestamp": "$timestamp",
  "action": "$action",
  "artifact": "$artifact_name",
  "target": "$target_host",
  "path": "$deploy_path",
  "status": "$status",
  "details": "$details",
  "buildNumber": "${BUILD_NUMBER:-unknown}",
  "buildUrl": "${BUILD_URL:-unknown}",
  "user": "$(whoami)",
  "host": "$(hostname)"
}
EOF
    
    log_info "Deployment log entry created: $log_file"
}

# Verify artifact exists and is valid
verify_artifact_for_deployment() {
    local artifact_name="$1"
    local artifact_path="$ARTIFACTS_DIR/$artifact_name"
    
    log_info "Verifying artifact for deployment: $artifact_name"
    
    if [ ! -d "$artifact_path" ]; then
        log_error "Artifact directory not found: $artifact_path"
        return 1
    fi
    
    # Check manifest exists
    if [ ! -f "$artifact_path/manifest.json" ]; then
        log_error "Artifact manifest not found: $artifact_path/manifest.json"
        return 1
    fi
    
    # Verify artifact integrity using the artifact manager
    if ! ./scripts/artifact-manager.sh verify "$artifact_name"; then
        log_error "Artifact integrity verification failed"
        return 1
    fi
    
    log_info "Artifact verification successful"
    return 0
}

# Create backup of current deployment
create_deployment_backup() {
    local target_host="$1"
    local deploy_path="$2"
    local backup_name="$3"
    
    log_info "Creating deployment backup: $backup_name"
    
    local backup_path="$BACKUP_DIR/$backup_name"
    mkdir -p "$backup_path"
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local deployment
        if [ -d "$deploy_path" ]; then
            log_info "Backing up local deployment from $deploy_path"
            tar -czf "$backup_path/current-deployment.tar.gz" -C "$(dirname "$deploy_path")" "$(basename "$deploy_path")" 2>/dev/null || {
                log_warn "Failed to create backup, deployment directory may not exist"
                return 0
            }
        else
            log_warn "Deployment path does not exist, skipping backup: $deploy_path"
            return 0
        fi
    else
        # Remote deployment
        log_info "Backing up remote deployment from $target_host:$deploy_path"
        ssh "$target_host" "tar -czf - -C '$(dirname "$deploy_path")' '$(basename "$deploy_path")' 2>/dev/null" > "$backup_path/current-deployment.tar.gz" || {
            log_warn "Failed to create remote backup, deployment directory may not exist"
            return 0
        }
    fi
    
    # Create backup metadata
    cat > "$backup_path/backup-info.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "$target_host:$deploy_path",
  "backupName": "$backup_name",
  "creator": "$(whoami)@$(hostname)"
}
EOF
    
    log_info "Backup created successfully: $backup_path"
    return 0
}

# Deploy backend component
deploy_backend() {
    local artifact_path="$1"
    local target_host="$2"
    local deploy_path="$3"
    
    log_info "Deploying backend component"
    
    local backend_package="$artifact_path/backend/backend.tar.gz"
    if [ ! -f "$backend_package" ]; then
        # Try .zip format (Windows)
        backend_package="$artifact_path/backend/backend.zip"
        if [ ! -f "$backend_package" ]; then
            log_error "Backend package not found in artifact"
            return 1
        fi
    fi
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local deployment
        log_info "Deploying backend locally to $deploy_path"
        
        # Create deployment directory
        mkdir -p "$deploy_path"
        
        # Extract backend package
        if [[ "$backend_package" == *.tar.gz ]]; then
            tar -xzf "$backend_package" -C "$deploy_path"
        elif [[ "$backend_package" == *.zip ]]; then
            unzip -q "$backend_package" -d "$deploy_path"
        fi
        
        # Set permissions
        chmod -R 755 "$deploy_path"
        
    else
        # Remote deployment
        log_info "Deploying backend to remote host $target_host:$deploy_path"
        
        # Copy package to remote host
        scp "$backend_package" "$target_host:/tmp/"
        
        # Extract on remote host
        local package_name=$(basename "$backend_package")
        if [[ "$backend_package" == *.tar.gz ]]; then
            ssh "$target_host" "mkdir -p '$deploy_path' && tar -xzf '/tmp/$package_name' -C '$deploy_path' && rm '/tmp/$package_name'"
        elif [[ "$backend_package" == *.zip ]]; then
            ssh "$target_host" "mkdir -p '$deploy_path' && unzip -q '/tmp/$package_name' -d '$deploy_path' && rm '/tmp/$package_name'"
        fi
        
        # Set permissions
        ssh "$target_host" "chmod -R 755 '$deploy_path'"
    fi
    
    log_info "Backend deployment completed"
    return 0
}

# Deploy frontend component
deploy_frontend() {
    local artifact_path="$1"
    local target_host="$2"
    local deploy_path="$3"
    
    log_info "Deploying frontend component"
    
    local frontend_package="$artifact_path/frontend/frontend.tar.gz"
    if [ ! -f "$frontend_package" ]; then
        # Try .zip format (Windows)
        frontend_package="$artifact_path/frontend/frontend.zip"
        if [ ! -f "$frontend_package" ]; then
            log_error "Frontend package not found in artifact"
            return 1
        fi
    fi
    
    local frontend_path="$deploy_path/frontend"
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local deployment
        log_info "Deploying frontend locally to $frontend_path"
        
        # Create frontend directory
        mkdir -p "$frontend_path"
        
        # Extract frontend package
        if [[ "$frontend_package" == *.tar.gz ]]; then
            tar -xzf "$frontend_package" -C "$frontend_path"
        elif [[ "$frontend_package" == *.zip ]]; then
            unzip -q "$frontend_package" -d "$frontend_path"
        fi
        
        # Set permissions
        chmod -R 755 "$frontend_path"
        
    else
        # Remote deployment
        log_info "Deploying frontend to remote host $target_host:$frontend_path"
        
        # Copy package to remote host
        scp "$frontend_package" "$target_host:/tmp/"
        
        # Extract on remote host
        local package_name=$(basename "$frontend_package")
        if [[ "$frontend_package" == *.tar.gz ]]; then
            ssh "$target_host" "mkdir -p '$frontend_path' && tar -xzf '/tmp/$package_name' -C '$frontend_path' && rm '/tmp/$package_name'"
        elif [[ "$frontend_package" == *.zip ]]; then
            ssh "$target_host" "mkdir -p '$frontend_path' && unzip -q '/tmp/$package_name' -d '$frontend_path' && rm '/tmp/$package_name'"
        fi
        
        # Set permissions
        ssh "$target_host" "chmod -R 755 '$frontend_path'"
    fi
    
    log_info "Frontend deployment completed"
    return 0
}

# Install dependencies and setup environment
setup_deployment_environment() {
    local target_host="$1"
    local deploy_path="$2"
    
    log_info "Setting up deployment environment"
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local setup
        cd "$deploy_path"
        
        # Install production dependencies
        if [ -f "package.json" ]; then
            log_info "Installing production dependencies"
            npm ci --only=production
        fi
        
        # Run database migrations if needed
        if [ -f "prisma/schema.prisma" ]; then
            log_info "Running database migrations"
            npx prisma migrate deploy
        fi
        
    else
        # Remote setup
        ssh "$target_host" "cd '$deploy_path' && \
            if [ -f package.json ]; then npm ci --only=production; fi && \
            if [ -f prisma/schema.prisma ]; then npx prisma migrate deploy; fi"
    fi
    
    log_info "Environment setup completed"
    return 0
}

# Restart services
restart_services() {
    local target_host="$1"
    local deploy_path="$2"
    local service_name="${3:-farmtally}"
    
    log_info "Restarting services"
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local service restart
        if command -v pm2 >/dev/null 2>&1; then
            log_info "Restarting PM2 service: $service_name"
            pm2 restart "$service_name" || pm2 start "$deploy_path/dist/server.js" --name "$service_name"
        elif command -v systemctl >/dev/null 2>&1; then
            log_info "Restarting systemd service: $service_name"
            sudo systemctl restart "$service_name"
        else
            log_warn "No service manager found, manual restart required"
        fi
    else
        # Remote service restart
        ssh "$target_host" "
            if command -v pm2 >/dev/null 2>&1; then
                pm2 restart '$service_name' || pm2 start '$deploy_path/dist/server.js' --name '$service_name'
            elif command -v systemctl >/dev/null 2>&1; then
                sudo systemctl restart '$service_name'
            else
                echo 'No service manager found, manual restart required'
            fi
        "
    fi
    
    log_info "Service restart completed"
    return 0
}

# Verify deployment health
verify_deployment_health() {
    local target_host="$1"
    local health_url="${2:-http://localhost:3000/api/health}"
    local max_attempts=30
    local attempt=1
    
    log_info "Verifying deployment health at $health_url"
    
    # Wait for service to start
    sleep 5
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        if curl -f -s "$health_url" >/dev/null 2>&1; then
            log_info "Health check successful"
            return 0
        fi
        
        sleep 2
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Main deployment function
deploy_artifact() {
    local artifact_name="$1"
    local target_host="${2:-localhost}"
    local deploy_path="${3:-$DEFAULT_DEPLOY_PATH}"
    local service_name="${4:-farmtally}"
    local health_url="${5:-http://localhost:3000/api/health}"
    
    log_info "Starting deployment of artifact: $artifact_name"
    log_info "Target: $target_host:$deploy_path"
    
    local artifact_path="$ARTIFACTS_DIR/$artifact_name"
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)-$(whoami)"
    
    # Verify artifact
    if ! verify_artifact_for_deployment "$artifact_name"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Artifact verification failed"
        return 1
    fi
    
    # Create backup
    if ! create_deployment_backup "$target_host" "$deploy_path" "$backup_name"; then
        log_warn "Backup creation failed, continuing with deployment"
    fi
    
    # Deploy components
    if ! deploy_backend "$artifact_path" "$target_host" "$deploy_path"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Backend deployment failed"
        return 1
    fi
    
    if ! deploy_frontend "$artifact_path" "$target_host" "$deploy_path"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Frontend deployment failed"
        return 1
    fi
    
    # Setup environment
    if ! setup_deployment_environment "$target_host" "$deploy_path"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Environment setup failed"
        return 1
    fi
    
    # Restart services
    if ! restart_services "$target_host" "$deploy_path" "$service_name"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Service restart failed"
        return 1
    fi
    
    # Verify health
    if ! verify_deployment_health "$target_host" "$health_url"; then
        create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "failed" "Health check failed"
        log_error "Deployment health check failed, consider rollback"
        return 1
    fi
    
    create_deployment_log "deploy" "$artifact_name" "$target_host" "$deploy_path" "success" "Deployment completed successfully"
    log_info "Deployment completed successfully: $artifact_name"
    return 0
}

# Rollback to previous deployment
rollback_deployment() {
    local target_host="${1:-localhost}"
    local deploy_path="${2:-$DEFAULT_DEPLOY_PATH}"
    local backup_name="$3"
    local service_name="${4:-farmtally}"
    local health_url="${5:-http://localhost:3000/api/health}"
    
    log_info "Starting rollback deployment"
    log_info "Target: $target_host:$deploy_path"
    
    if [ -z "$backup_name" ]; then
        # Find the most recent backup
        backup_name=$(ls -1t "$BACKUP_DIR" | head -1)
        if [ -z "$backup_name" ]; then
            log_error "No backup found for rollback"
            return 1
        fi
        log_info "Using most recent backup: $backup_name"
    fi
    
    local backup_path="$BACKUP_DIR/$backup_name"
    local backup_file="$backup_path/current-deployment.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Rolling back from backup: $backup_name"
    
    if [ "$target_host" = "localhost" ] || [ "$target_host" = "127.0.0.1" ] || [ -z "$target_host" ]; then
        # Local rollback
        log_info "Performing local rollback"
        
        # Remove current deployment
        if [ -d "$deploy_path" ]; then
            rm -rf "$deploy_path"
        fi
        
        # Restore from backup
        mkdir -p "$(dirname "$deploy_path")"
        tar -xzf "$backup_file" -C "$(dirname "$deploy_path")"
        
    else
        # Remote rollback
        log_info "Performing remote rollback"
        
        # Copy backup to remote host
        scp "$backup_file" "$target_host:/tmp/rollback-backup.tar.gz"
        
        # Restore on remote host
        ssh "$target_host" "
            rm -rf '$deploy_path' && \
            mkdir -p '$(dirname "$deploy_path")' && \
            tar -xzf '/tmp/rollback-backup.tar.gz' -C '$(dirname "$deploy_path")' && \
            rm '/tmp/rollback-backup.tar.gz'
        "
    fi
    
    # Restart services
    if ! restart_services "$target_host" "$deploy_path" "$service_name"; then
        create_deployment_log "rollback" "$backup_name" "$target_host" "$deploy_path" "failed" "Service restart failed during rollback"
        return 1
    fi
    
    # Verify health
    if ! verify_deployment_health "$target_host" "$health_url"; then
        create_deployment_log "rollback" "$backup_name" "$target_host" "$deploy_path" "failed" "Health check failed after rollback"
        log_error "Rollback health check failed"
        return 1
    fi
    
    create_deployment_log "rollback" "$backup_name" "$target_host" "$deploy_path" "success" "Rollback completed successfully"
    log_info "Rollback completed successfully"
    return 0
}

# List available backups
list_backups() {
    echo "Available deployment backups:"
    echo "============================="
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "No backup directory found"
        return
    fi
    
    local count=0
    for backup_dir in "$BACKUP_DIR"/backup-*; do
        if [ -d "$backup_dir" ]; then
            local backup_name=$(basename "$backup_dir")
            local info_file="$backup_dir/backup-info.json"
            
            if [ -f "$info_file" ]; then
                local timestamp=$(grep '"timestamp"' "$info_file" | cut -d'"' -f4)
                local source=$(grep '"source"' "$info_file" | cut -d'"' -f4)
                echo "  $backup_name (created: $timestamp, source: $source)"
            else
                echo "  $backup_name (no info available)"
            fi
            ((count++))
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo "No backups found"
    else
        echo ""
        echo "Total: $count backups"
    fi
}

# Show deployment logs
show_deployment_logs() {
    local date_filter="$1"
    
    echo "Deployment logs:"
    echo "==============="
    
    if [ ! -d "$DEPLOYMENT_LOG_DIR" ]; then
        echo "No deployment logs found"
        return
    fi
    
    if [ -n "$date_filter" ]; then
        local log_file="$DEPLOYMENT_LOG_DIR/deployment-$date_filter.log"
        if [ -f "$log_file" ]; then
            cat "$log_file"
        else
            echo "No logs found for date: $date_filter"
        fi
    else
        # Show recent logs
        find "$DEPLOYMENT_LOG_DIR" -name "deployment-*.log" -type f -exec cat {} \; | tail -20
    fi
}

# Main function
main() {
    local command="${1:-help}"
    
    case "$command" in
        "deploy")
            if [ -z "$2" ]; then
                echo "Usage: $0 deploy <artifact-name> [target-host] [deploy-path] [service-name] [health-url]"
                exit 1
            fi
            deploy_artifact "$2" "$3" "$4" "$5" "$6"
            ;;
        
        "rollback")
            rollback_deployment "$2" "$3" "$4" "$5" "$6"
            ;;
        
        "list-backups")
            list_backups
            ;;
        
        "logs")
            show_deployment_logs "$2"
            ;;
        
        "help"|"-h"|"--help")
            echo "FarmTally Artifact Deployer"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  deploy <artifact-name> [target-host] [deploy-path] [service-name] [health-url]"
            echo "    Deploy an artifact to target environment"
            echo ""
            echo "  rollback [target-host] [deploy-path] [backup-name] [service-name] [health-url]"
            echo "    Rollback to previous deployment"
            echo ""
            echo "  list-backups"
            echo "    List available deployment backups"
            echo ""
            echo "  logs [date]"
            echo "    Show deployment logs (format: YYYYMMDD)"
            echo ""
            echo "  help"
            echo "    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 deploy farmtally-v123-abc12345"
            echo "  $0 deploy farmtally-v123-abc12345 production-server /opt/farmtally"
            echo "  $0 rollback"
            echo "  $0 rollback production-server /opt/farmtally backup-20240115-143022-jenkins"
            echo "  $0 list-backups"
            echo "  $0 logs 20240115"
            ;;
        
        *)
            echo "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"