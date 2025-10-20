#!/bin/bash

# FarmTally Project Cleanup Script
# Removes redundant and obsolete files

echo "🧹 Starting FarmTally project cleanup..."

# Remove Supabase-related files
echo "Removing Supabase files..."
rm -rf supabase/
rm -f supabase.exe supabase_windows.tar.gz
rm -f SUPABASE_*.md
rm -f configure-supabase-cli.bat
rm -f setup-supabase-cli.js
rm -f install-supabase-cli.js
rm -f get-supabase-info.js
rm -f test-supabase-*.js
rm -f test-farmtally-supabase.bat

# Remove Redis files
echo "Removing Redis files..."
rm -rf redis/
rm -f redis.zip dump.rdb

# Remove old deployment files
echo "Removing old deployment files..."
rm -f deploy-railway.bat
rm -f deploy-supabase-windows.bat
rm -f deploy-supabase.sh
rm -f deploy-with-cli.bat
rm -f deploy-farmtally-automated.bat
rm -f upload-to-supabase.bat
rm -f deploy-to-supabase-storage.js
rm -f upload-to-farmtally-app-bucket.js

# Remove old test files
echo "Removing old test files..."
rm -f test-postgres-passwords.js
rm -f test-delivery-system.ps1
rm -f test-enhanced-delivery-system.ps1
rm -f test-farmer-system.ps1
rm -f test-lorry-request-system.ps1
rm -f test-lorry-system.ps1
rm -f test-report-system.ps1
rm -f test-reports-simple.ps1

# Remove old setup files
echo "Removing old setup files..."
rm -f setup-environment.ps1
rm -f reset-postgres-password.ps1
rm -f install-dependencies-windows.ps1

# Remove duplicate documentation
echo "Removing duplicate documentation..."
rm -f manual-connection-string.md
rm -f manual-test.md
rm -f setup-database.md
rm -f update-database-url.md
rm -f railway-setup.md

# Remove email setup files
echo "Removing email setup files..."
rm -f EMAIL_SETUP.md
rm -f EMAIL_TROUBLESHOOTING.md
rm -f GMAIL_SETUP.md
rm -f setup-gmail.js
rm -f test-email-invitation.js

# Remove development-only files
echo "Removing development-only files..."
rm -f serve-farmtally-local.js
rm -f serve-web.js
rm -f clean-server.js
rm -f check-system-requirements.js

# Remove duplicate start files
echo "Removing duplicate start files..."
rm -f start-farmtally.bat
rm -f start-server.bat
rm -f start-web-app.bat

# Remove old mobile app files
echo "Removing old mobile app files..."
rm -f farmtally_mobile/run_admin_with_auth.dart
rm -f farmtally_mobile/run_admin_working.dart
rm -f farmtally_mobile/serve_web_simple.dart
rm -f farmtally_mobile/test_integration.dart
rm -f farmtally_mobile/web_access.html
rm -f farmtally_mobile/cleanup-ports.ps1
rm -f farmtally_mobile/dev-start.ps1
rm -f farmtally_mobile/run-dev.bat
rm -f farmtally_mobile/run-dev.ps1
rm -f farmtally_mobile/run-prod.ps1
rm -f farmtally_mobile/pubspec_supabase.yaml

# Remove duplicate mobile documentation
echo "Removing duplicate mobile documentation..."
rm -f farmtally_mobile/ADMIN_*.md
rm -f farmtally_mobile/FIELD_MANAGER_*.md
rm -f farmtally_mobile/FRONTEND_BACKEND_INTEGRATION_COMPLETE.md
rm -f farmtally_mobile/INTEGRATION_GUIDE.md
rm -f farmtally_mobile/ENVIRONMENT_SETUP.md
rm -f farmtally_mobile/TROUBLESHOOTING.md

# Remove other redundant files
echo "Removing other redundant files..."
rm -f open-upload-locations.bat
rm -f fix-missing-tables.js
rm -f check-missing-tables.js
rm -f test-supabase-status.js

echo "✅ Cleanup complete!"
echo ""
echo "📊 Project size reduced significantly"
echo "🎯 Kept only essential production files"
echo "📚 Maintained core documentation"
echo ""
echo "Next steps:"
echo "1. Review remaining files"
echo "2. Test deployment: ./deploy.sh local"
echo "3. Deploy to production: ./deploy.sh railway"