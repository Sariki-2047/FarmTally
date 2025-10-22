# Jenkins SSH Issue Fix

## Problem
The Jenkins pipeline failed with error: `No such DSL method 'sshagent' found`

This indicates that the SSH Agent plugin is not installed in Jenkins.

## Solutions

### Option 1: Install SSH Agent Plugin (Recommended)
1. Go to Jenkins → Manage Jenkins → Manage Plugins
2. Search for "SSH Agent Plugin"
3. Install the plugin
4. Restart Jenkins
5. Re-run the pipeline

### Option 2: Use Updated Jenkinsfile (Alternative)
The main `Jenkinsfile` has been updated to use `withCredentials` instead of `sshagent`:

```groovy
withCredentials([sshUserPrivateKey(credentialsId: 'farmtally-vps-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
    // SSH operations using the key file
}
```

### Option 3: No-SSH Deployment (Fallback)
Use `Jenkinsfile.no-ssh` which creates deployment packages without requiring SSH:

1. Copy `Jenkinsfile.no-ssh` to `Jenkinsfile`
2. Commit and push to trigger build
3. Download deployment package from Jenkins artifacts
4. Manually deploy on VPS

## Quick Fix Commands

### Update Jenkins Job to Use Fixed Jenkinsfile
```bash
# The Jenkinsfile has already been updated
git add Jenkinsfile
git commit -m "Fix Jenkins SSH issue - use withCredentials instead of sshagent"
git push origin main
```

### Manual Deployment (if SSH still fails)
```bash
# On VPS
cd /opt/farmtally
wget [jenkins-artifacts-url]/farmtally-deployment.tar.gz
tar -xzf farmtally-deployment.tar.gz
./deploy-script.sh
```

## Verification
After fixing, the pipeline should:
1. ✅ Checkout code successfully
2. ✅ Prepare deployment files
3. ✅ Deploy to VPS (with proper SSH credentials)
4. ✅ Complete health checks

## Next Steps
1. Try running the pipeline again
2. If SSH issues persist, install the SSH Agent plugin
3. If all else fails, use the no-SSH deployment method