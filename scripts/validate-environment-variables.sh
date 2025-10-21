#!/bin/bash

# Environment Variable Validation Script for FarmTally
# This script validates that all required environment variables are properly set
# and performs basic connectivity tests where applicable.

set -e

echo "🔍 Validating environment variables for FarmTally deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

# Function to check if a variable is set and not empty
check_required_var() {
    local var_name="$1"
    local description="$2"
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ REQUIRED: $var_name is not set or empty${NC}"
        echo -e "   Description: $description"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    else
        echo -e "${GREEN}✅ $var_name${NC} (${#var_value} characters)"
        return 0
    fi
}

# Function to check optional variables
check_optional_var() {
    local var_name="$1"
    local description="$2"
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠️  OPTIONAL: $var_name is not set${NC}"
        echo -e "   Description: $description"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
        return 1
    else
        echo -e "${GREEN}✅ $var_name${NC} (${#var_value} characters)"
        return 0
    fi
}

# Function to validate URL format
validate_url() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [[ $var_value =~ ^https?://[a-zA-Z0-9.-]+.*$ ]]; then
        echo -e "   ${GREEN}✓ Valid URL format${NC}"
        return 0
    else
        echo -e "   ${RED}✗ Invalid URL format${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    fi
}

# Function to validate database URL
validate_database_url() {
    local var_value="$DATABASE_URL"
    
    if [[ $var_value =~ ^postgresql://.*$ ]]; then
        echo -e "   ${GREEN}✓ Valid PostgreSQL URL format${NC}"
        
        # Test database connectivity if possible
        if command -v psql >/dev/null 2>&1; then
            echo -e "   ${BLUE}🔍 Testing database connectivity...${NC}"
            if timeout 10 psql "$var_value" -c "SELECT 1;" >/dev/null 2>&1; then
                echo -e "   ${GREEN}✓ Database connection successful${NC}"
            else
                echo -e "   ${YELLOW}⚠️  Database connection failed (may be expected in build environment)${NC}"
                VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
            fi
        else
            echo -e "   ${BLUE}ℹ️  psql not available, skipping connectivity test${NC}"
        fi
        return 0
    else
        echo -e "   ${RED}✗ Invalid PostgreSQL URL format${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    fi
}

# Function to validate JWT secret strength
validate_jwt_secret() {
    local var_value="$JWT_SECRET"
    local length=${#var_value}
    
    if [ $length -lt 32 ]; then
        echo -e "   ${RED}✗ JWT secret too short (${length} chars, minimum 32 recommended)${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    elif [ $length -lt 64 ]; then
        echo -e "   ${YELLOW}⚠️  JWT secret could be longer (${length} chars, 64+ recommended)${NC}"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    else
        echo -e "   ${GREEN}✓ JWT secret length adequate (${length} chars)${NC}"
    fi
    
    # Check for common weak patterns
    if [[ $var_value == *"test"* ]] || [[ $var_value == *"dev"* ]] || [[ $var_value == *"example"* ]]; then
        echo -e "   ${RED}✗ JWT secret appears to contain test/development patterns${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    else
        echo -e "   ${GREEN}✓ JWT secret does not contain obvious test patterns${NC}"
    fi
    
    return 0
}

# Function to validate email configuration
validate_email_config() {
    echo -e "${BLUE}📧 Validating email configuration...${NC}"
    
    # Check SMTP host format
    if [[ $SMTP_HOST =~ ^[a-zA-Z0-9.-]+$ ]]; then
        echo -e "   ${GREEN}✓ SMTP host format valid${NC}"
    else
        echo -e "   ${RED}✗ SMTP host format invalid${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
    
    # Check SMTP port
    if [[ $SMTP_PORT =~ ^[0-9]+$ ]] && [ "$SMTP_PORT" -ge 1 ] && [ "$SMTP_PORT" -le 65535 ]; then
        echo -e "   ${GREEN}✓ SMTP port valid (${SMTP_PORT})${NC}"
    else
        echo -e "   ${RED}✗ SMTP port invalid (${SMTP_PORT})${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
    
    # Check email format
    if [[ $SMTP_USER =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "   ${GREEN}✓ SMTP user email format valid${NC}"
    else
        echo -e "   ${RED}✗ SMTP user email format invalid${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
    
    # Test SMTP connectivity if possible
    if command -v nc >/dev/null 2>&1; then
        echo -e "   ${BLUE}🔍 Testing SMTP connectivity...${NC}"
        if timeout 5 nc -z "$SMTP_HOST" "$SMTP_PORT" >/dev/null 2>&1; then
            echo -e "   ${GREEN}✓ SMTP server reachable${NC}"
        else
            echo -e "   ${YELLOW}⚠️  SMTP server not reachable (may be expected in build environment)${NC}"
            VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
        fi
    fi
}

# Function to validate numeric values
validate_numeric() {
    local var_name="$1"
    local var_value="${!var_name}"
    local min_val="$2"
    local max_val="$3"
    
    if [[ $var_value =~ ^[0-9]+$ ]]; then
        if [ -n "$min_val" ] && [ "$var_value" -lt "$min_val" ]; then
            echo -e "   ${RED}✗ $var_name value too low (${var_value}, minimum ${min_val})${NC}"
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
            return 1
        elif [ -n "$max_val" ] && [ "$var_value" -gt "$max_val" ]; then
            echo -e "   ${RED}✗ $var_name value too high (${var_value}, maximum ${max_val})${NC}"
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
            return 1
        else
            echo -e "   ${GREEN}✓ Valid numeric value (${var_value})${NC}"
            return 0
        fi
    else
        echo -e "   ${RED}✗ $var_name is not a valid number (${var_value})${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        return 1
    fi
}

echo -e "\n${BLUE}🔍 Checking required backend environment variables:${NC}"

# Database configuration
check_required_var "DATABASE_URL" "PostgreSQL database connection URL"
if [ $? -eq 0 ]; then
    validate_database_url
fi

# JWT configuration
check_required_var "JWT_SECRET" "JWT signing secret for authentication"
if [ $? -eq 0 ]; then
    validate_jwt_secret
fi

check_required_var "JWT_EXPIRES_IN" "JWT token expiration time"
check_required_var "JWT_REFRESH_EXPIRES_IN" "JWT refresh token expiration time"

# CORS configuration
check_required_var "CORS_ORIGINS" "Allowed CORS origins for API access"

# SMTP configuration
check_required_var "SMTP_HOST" "SMTP server hostname"
check_required_var "SMTP_USER" "SMTP authentication username"
check_required_var "SMTP_PASS" "SMTP authentication password"
check_required_var "SMTP_PORT" "SMTP server port"

if [ $? -eq 0 ]; then
    validate_email_config
fi

# Application configuration
check_required_var "PORT" "Application server port"
if [ $? -eq 0 ]; then
    validate_numeric "PORT" 1000 65535
fi

check_required_var "NODE_ENV" "Node.js environment"
check_required_var "FRONTEND_URL" "Frontend URL for email links"
if [ $? -eq 0 ]; then
    validate_url "FRONTEND_URL"
fi

echo -e "\n${BLUE}🔍 Checking security and performance settings:${NC}"

check_required_var "BCRYPT_SALT_ROUNDS" "BCrypt salt rounds for password hashing"
if [ $? -eq 0 ]; then
    validate_numeric "BCRYPT_SALT_ROUNDS" 10 15
fi

check_required_var "MAX_FILE_SIZE" "Maximum file upload size in bytes"
if [ $? -eq 0 ]; then
    validate_numeric "MAX_FILE_SIZE" 1048576 52428800  # 1MB to 50MB
fi

check_required_var "RATE_LIMIT_WINDOW_MS" "Rate limiting window in milliseconds"
if [ $? -eq 0 ]; then
    validate_numeric "RATE_LIMIT_WINDOW_MS" 60000 3600000  # 1 minute to 1 hour
fi

check_required_var "RATE_LIMIT_MAX" "Maximum requests per rate limit window"
if [ $? -eq 0 ]; then
    validate_numeric "RATE_LIMIT_MAX" 10 1000
fi

echo -e "\n${BLUE}🔍 Checking frontend environment variables:${NC}"

check_required_var "NEXT_PUBLIC_API_URL" "Frontend API endpoint URL"
if [ $? -eq 0 ]; then
    validate_url "NEXT_PUBLIC_API_URL"
fi

check_required_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL"
if [ $? -eq 0 ]; then
    validate_url "NEXT_PUBLIC_SUPABASE_URL"
fi

check_required_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous access key"

echo -e "\n${BLUE}🔍 Checking optional configuration:${NC}"

check_optional_var "REDIS_URL" "Redis connection URL for caching"
check_optional_var "EMAIL_NOTIFICATIONS_ENABLED" "Enable/disable email notifications"
check_optional_var "SMTP_FROM_NAME" "Email sender display name"

# Generate validation report
echo -e "\n${BLUE}📊 Validation Summary:${NC}"
echo -e "   Errors: ${RED}${VALIDATION_ERRORS}${NC}"
echo -e "   Warnings: ${YELLOW}${VALIDATION_WARNINGS}${NC}"

# Create validation report file
cat > environment-validation-report.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "buildNumber": "${BUILD_NUMBER:-unknown}",
    "gitCommit": "${GIT_COMMIT:-unknown}",
    "validation": {
        "errors": ${VALIDATION_ERRORS},
        "warnings": ${VALIDATION_WARNINGS},
        "status": "$([ $VALIDATION_ERRORS -eq 0 ] && echo "passed" || echo "failed")"
    }
}
EOF

echo -e "📝 Validation report saved to environment-validation-report.json"

# Exit with error if validation failed
if [ $VALIDATION_ERRORS -gt 0 ]; then
    echo -e "\n${RED}❌ Environment validation failed with ${VALIDATION_ERRORS} error(s)!${NC}"
    echo -e "   Please fix the above issues before proceeding with deployment."
    exit 1
else
    echo -e "\n${GREEN}✅ Environment validation passed successfully!${NC}"
    if [ $VALIDATION_WARNINGS -gt 0 ]; then
        echo -e "   Note: ${VALIDATION_WARNINGS} warning(s) found - review recommended."
    fi
    exit 0
fi