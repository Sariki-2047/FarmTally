#!/bin/bash

# FarmTally Pipeline Notification Configuration Script
# This script helps configure email notifications for pipeline events

set -e

echo "🔔 FarmTally Pipeline Notification Configuration"
echo "=============================================="

# Configuration file path
CONFIG_FILE="pipeline-notifications.env"

# Function to prompt for email addresses
prompt_emails() {
    local notification_type="$1"
    local description="$2"
    
    echo ""
    echo "📧 Configure ${description}"
    echo "Enter email addresses separated by commas (or press Enter to skip):"
    read -r emails
    
    if [ -n "$emails" ]; then
        echo "${notification_type}_EMAIL_RECIPIENTS=${emails}" >> "$CONFIG_FILE"
        echo "✅ ${description} configured: $emails"
    else
        echo "⏭️ ${description} skipped"
    fi
}

# Create or reset configuration file
echo "# FarmTally Pipeline Notification Configuration" > "$CONFIG_FILE"
echo "# Generated on $(date)" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "This script will configure email notifications for different pipeline events."
echo "You can configure notifications for:"
echo "  - Success: When deployments complete successfully"
echo "  - Failure: When pipeline stages fail"
echo "  - Warning: When pipeline completes with warnings"
echo ""

# Configure different notification types
prompt_emails "SUCCESS" "Success Notifications (deployment completed successfully)"
prompt_emails "FAILURE" "Failure Notifications (pipeline failed or deployment issues)"
prompt_emails "WARNING" "Warning Notifications (completed with warnings)"

# Optional: Configure Slack webhook
echo ""
echo "💬 Configure Slack Notifications (optional)"
echo "Enter Slack webhook URL (or press Enter to skip):"
read -r slack_webhook

if [ -n "$slack_webhook" ]; then
    echo "SLACK_WEBHOOK_URL=${slack_webhook}" >> "$CONFIG_FILE"
    echo "✅ Slack notifications configured"
else
    echo "⏭️ Slack notifications skipped"
fi

echo ""
echo "📄 Configuration saved to: $CONFIG_FILE"
echo ""
echo "To use this configuration in Jenkins:"
echo "1. Add the email addresses as Jenkins credentials:"
echo "   - success-email-recipients"
echo "   - failure-email-recipients" 
echo "   - warning-email-recipients"
echo "2. Add the Slack webhook as a Jenkins credential:"
echo "   - slack-webhook-url"
echo "3. Update your Jenkinsfile environment section to reference these credentials"
echo ""
echo "Example Jenkins credential configuration:"
echo "  environment {"
echo "    SUCCESS_EMAIL_RECIPIENTS = credentials('success-email-recipients')"
echo "    FAILURE_EMAIL_RECIPIENTS = credentials('failure-email-recipients')"
echo "    WARNING_EMAIL_RECIPIENTS = credentials('warning-email-recipients')"
echo "    SLACK_WEBHOOK_URL = credentials('slack-webhook-url')"
echo "  }"
echo ""

# Display current configuration
if [ -s "$CONFIG_FILE" ]; then
    echo "📋 Current Configuration:"
    echo "========================"
    cat "$CONFIG_FILE"
fi

echo ""
echo "✅ Notification configuration completed!"