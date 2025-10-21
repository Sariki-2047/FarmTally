@echo off
setlocal enabledelayedexpansion

REM FarmTally Pipeline Notification Configuration Script
REM This script helps configure email notifications for pipeline events

echo 🔔 FarmTally Pipeline Notification Configuration
echo ==============================================

REM Configuration file path
set CONFIG_FILE=pipeline-notifications.env

REM Create or reset configuration file
echo # FarmTally Pipeline Notification Configuration > %CONFIG_FILE%
echo # Generated on %date% %time% >> %CONFIG_FILE%
echo. >> %CONFIG_FILE%

echo This script will configure email notifications for different pipeline events.
echo You can configure notifications for:
echo   - Success: When deployments complete successfully
echo   - Failure: When pipeline stages fail
echo   - Warning: When pipeline completes with warnings
echo.

REM Configure success notifications
echo 📧 Configure Success Notifications
echo Enter email addresses separated by commas (or press Enter to skip):
set /p success_emails=
if not "!success_emails!"=="" (
    echo SUCCESS_EMAIL_RECIPIENTS=!success_emails! >> %CONFIG_FILE%
    echo ✅ Success notifications configured: !success_emails!
) else (
    echo ⏭️ Success notifications skipped
)

echo.

REM Configure failure notifications
echo 📧 Configure Failure Notifications
echo Enter email addresses separated by commas (or press Enter to skip):
set /p failure_emails=
if not "!failure_emails!"=="" (
    echo FAILURE_EMAIL_RECIPIENTS=!failure_emails! >> %CONFIG_FILE%
    echo ✅ Failure notifications configured: !failure_emails!
) else (
    echo ⏭️ Failure notifications skipped
)

echo.

REM Configure warning notifications
echo 📧 Configure Warning Notifications
echo Enter email addresses separated by commas (or press Enter to skip):
set /p warning_emails=
if not "!warning_emails!"=="" (
    echo WARNING_EMAIL_RECIPIENTS=!warning_emails! >> %CONFIG_FILE%
    echo ✅ Warning notifications configured: !warning_emails!
) else (
    echo ⏭️ Warning notifications skipped
)

echo.

REM Configure Slack webhook
echo 💬 Configure Slack Notifications (optional)
echo Enter Slack webhook URL (or press Enter to skip):
set /p slack_webhook=
if not "!slack_webhook!"=="" (
    echo SLACK_WEBHOOK_URL=!slack_webhook! >> %CONFIG_FILE%
    echo ✅ Slack notifications configured
) else (
    echo ⏭️ Slack notifications skipped
)

echo.
echo 📄 Configuration saved to: %CONFIG_FILE%
echo.
echo To use this configuration in Jenkins:
echo 1. Add the email addresses as Jenkins credentials:
echo    - success-email-recipients
echo    - failure-email-recipients
echo    - warning-email-recipients
echo 2. Add the Slack webhook as a Jenkins credential:
echo    - slack-webhook-url
echo 3. Update your Jenkinsfile environment section to reference these credentials
echo.
echo Example Jenkins credential configuration:
echo   environment {
echo     SUCCESS_EMAIL_RECIPIENTS = credentials('success-email-recipients')
echo     FAILURE_EMAIL_RECIPIENTS = credentials('failure-email-recipients')
echo     WARNING_EMAIL_RECIPIENTS = credentials('warning-email-recipients')
echo     SLACK_WEBHOOK_URL = credentials('slack-webhook-url')
echo   }
echo.

REM Display current configuration
if exist %CONFIG_FILE% (
    echo 📋 Current Configuration:
    echo ========================
    type %CONFIG_FILE%
)

echo.
echo ✅ Notification configuration completed!

pause