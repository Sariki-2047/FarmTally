# Jenkins Pipeline Alignment Requirements

## Introduction

The FarmTally project requires a production-ready CI/CD pipeline that properly aligns with the current repository structure, handles environment configuration securely, executes database migrations, and ensures all services are properly integrated. The current Jenkins pipeline has misaligned workspace paths and lacks proper configuration management, database migration handling, and comprehensive testing.

## Requirements

### Requirement 1: Workspace Path Alignment

**User Story:** As a DevOps engineer, I want the Jenkins pipeline to execute build and deployment commands in the correct directories, so that all build stages complete successfully without path-related errors.

#### Acceptance Criteria

1. WHEN the Jenkins pipeline runs the backend build stage THEN it SHALL execute commands from the repository root directory where package.json exists
2. WHEN the Jenkins pipeline runs the frontend build stage THEN it SHALL execute commands from the farmtally-frontend/ directory
3. WHEN the pipeline uploads build artifacts THEN it SHALL reference the correct output paths (dist/ for backend, farmtally-frontend/.next/ for frontend)
4. WHEN any pipeline stage references file paths THEN it SHALL use paths that exist in the actual repository structure
5. IF the pipeline encounters "No such file or directory" errors THEN the build SHALL fail with clear error messages indicating the correct paths

### Requirement 2: Secure Environment Configuration Management

**User Story:** As a security-conscious developer, I want all sensitive configuration values to be securely injected into the pipeline, so that the application runs with proper credentials without exposing secrets in logs or code.

#### Acceptance Criteria

1. WHEN the backend build stage runs THEN it SHALL have access to all required environment variables (DATABASE_URL, JWT_SECRET, SMTP credentials, CORS_ORIGIN)
2. WHEN environment variables are injected THEN they SHALL be sourced from Jenkins credentials store, not hardcoded in the pipeline
3. WHEN the backend application starts THEN it SHALL successfully connect to all external services using the injected credentials
4. WHEN pipeline logs are viewed THEN sensitive values SHALL be masked or redacted
5. IF any required environment variable is missing THEN the build SHALL fail with a clear error message indicating which variable is needed

### Requirement 3: Database Migration Integration

**User Story:** As a database administrator, I want database schema migrations to be automatically executed during deployment, so that the production database schema stays synchronized with the application code.

#### Acceptance Criteria

1. WHEN a new backend version is deployed THEN Prisma migrations SHALL be executed before the application starts
2. WHEN migrations are executed THEN they SHALL run with the production DATABASE_URL
3. WHEN migrations complete successfully THEN the deployment SHALL proceed to start the application
4. WHEN migrations fail THEN the deployment SHALL be aborted and the previous version SHALL remain running
5. WHEN migrations are executed THEN the pipeline logs SHALL show the migration status and any applied changes
6. IF the database is unreachable THEN the migration step SHALL fail with a clear error message

### Requirement 4: Comprehensive API Health Verification

**User Story:** As a system administrator, I want the deployment pipeline to verify that all critical API endpoints are functioning after deployment, so that I can be confident the system is working correctly before users access it.

#### Acceptance Criteria

1. WHEN deployment completes THEN the pipeline SHALL test the /api/health endpoint and verify HTTP 200 response
2. WHEN health checks run THEN they SHALL test at least one authenticated endpoint (e.g., /api/auth/verify) using a service token
3. WHEN health checks run THEN they SHALL verify database connectivity through an API endpoint
4. WHEN all health checks pass THEN the deployment SHALL be marked as successful
5. WHEN any health check fails THEN the deployment SHALL be marked as failed and alerts SHALL be sent
6. WHEN health checks execute THEN response times and status codes SHALL be logged for monitoring

### Requirement 5: Frontend Production Configuration

**User Story:** As a frontend developer, I want the production frontend build to be configured with the correct API endpoints, so that the deployed application communicates with the production backend instead of development or staging services.

#### Acceptance Criteria

1. WHEN the frontend is built for production THEN NEXT_PUBLIC_API_URL SHALL point to the production VPS backend
2. WHEN the frontend build runs THEN all required environment variables SHALL be injected from Jenkins credentials
3. WHEN the frontend is deployed THEN it SHALL make API calls to the production backend, not Supabase edge functions
4. WHEN environment variables are missing THEN the frontend build SHALL fail with clear error messages
5. WHEN the frontend loads in production THEN browser network logs SHALL show API calls going to the correct production endpoints
6. IF Supabase credentials are still needed THEN they SHALL be properly configured alongside the VPS API URL

### Requirement 6: Pipeline Error Handling and Rollback

**User Story:** As a DevOps engineer, I want the pipeline to handle failures gracefully and provide rollback capabilities, so that failed deployments don't leave the system in a broken state.

#### Acceptance Criteria

1. WHEN any pipeline stage fails THEN the deployment SHALL be aborted and the previous version SHALL remain active
2. WHEN a deployment fails THEN notification SHALL be sent to the development team with failure details
3. WHEN migration failures occur THEN the database SHALL remain in its previous consistent state
4. WHEN health checks fail THEN the new deployment SHALL be stopped and the previous version SHALL be restored
5. WHEN rollback is needed THEN it SHALL be executable through a manual Jenkins job trigger
6. WHEN pipeline failures occur THEN detailed logs SHALL be available for troubleshooting

### Requirement 7: Build Artifact Management

**User Story:** As a release manager, I want build artifacts to be properly versioned and stored, so that I can track deployments and perform rollbacks when necessary.

#### Acceptance Criteria

1. WHEN a build completes successfully THEN artifacts SHALL be tagged with the Git commit hash and build number
2. WHEN artifacts are stored THEN they SHALL include both backend (dist/) and frontend (build output) components
3. WHEN deployments occur THEN the specific artifact version SHALL be logged and traceable
4. WHEN rollback is needed THEN previous artifact versions SHALL be available for restoration
5. WHEN artifacts are created THEN they SHALL include a manifest file listing all included components and their versions