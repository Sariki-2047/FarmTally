// Jenkins Pipeline Integration for FarmTally Artifact Management
// This script provides Jenkins-specific functions for artifact management

def createArtifact() {
    echo "Creating FarmTally build artifact..."
    
    // Set build environment variables
    env.BUILD_ENV = env.BUILD_ENV ?: 'production'
    env.BUILD_NUMBER = env.BUILD_NUMBER ?: currentBuild.number
    
    // Determine which artifact manager to use based on OS
    def artifactScript
    if (isUnix()) {
        artifactScript = './scripts/artifact-manager.sh'
        sh 'chmod +x scripts/artifact-manager.sh'
    } else {
        artifactScript = 'powershell -ExecutionPolicy Bypass -File scripts/artifact-manager.ps1'
    }
    
    try {
        // Create the artifact
        if (isUnix()) {
            sh "${artifactScript} create"
        } else {
            bat "${artifactScript} create"
        }
        
        // Get artifact information
        def artifactInfo = getLatestArtifactInfo()
        
        // Archive the artifact in Jenkins
        archiveArtifacts artifacts: "artifacts/${artifactInfo.name}/**/*", 
                        fingerprint: true,
                        allowEmptyArchive: false
        
        // Set build description with artifact info
        currentBuild.description = "Artifact: ${artifactInfo.name} (${artifactInfo.commit})"
        
        // Store artifact metadata as build properties
        def props = [
            "ARTIFACT_NAME=${artifactInfo.name}",
            "ARTIFACT_VERSION=${artifactInfo.version}",
            "ARTIFACT_COMMIT=${artifactInfo.commit}",
            "ARTIFACT_TIMESTAMP=${artifactInfo.timestamp}"
        ]
        
        writeFile file: 'artifact.properties', text: props.join('\n')
        archiveArtifacts artifacts: 'artifact.properties', fingerprint: true
        
        echo "Artifact created successfully: ${artifactInfo.name}"
        return artifactInfo
        
    } catch (Exception e) {
        error "Failed to create artifact: ${e.getMessage()}"
    }
}

def verifyArtifact(String artifactName) {
    echo "Verifying artifact: ${artifactName}"
    
    def artifactScript
    if (isUnix()) {
        artifactScript = './scripts/artifact-manager.sh'
    } else {
        artifactScript = 'powershell -ExecutionPolicy Bypass -File scripts/artifact-manager.ps1'
    }
    
    try {
        if (isUnix()) {
            sh "${artifactScript} verify ${artifactName}"
        } else {
            bat "${artifactScript} verify -ArtifactName ${artifactName}"
        }
        echo "Artifact verification successful"
        return true
    } catch (Exception e) {
        error "Artifact verification failed: ${e.getMessage()}"
        return false
    }
}

def listArtifacts() {
    echo "Listing available artifacts..."
    
    def artifactScript
    if (isUnix()) {
        artifactScript = './scripts/artifact-manager.sh'
    } else {
        artifactScript = 'powershell -ExecutionPolicy Bypass -File scripts/artifact-manager.ps1'
    }
    
    if (isUnix()) {
        sh "${artifactScript} list"
    } else {
        bat "${artifactScript} list"
    }
}

def cleanOldArtifacts() {
    echo "Cleaning old artifacts..."
    
    def artifactScript
    if (isUnix()) {
        artifactScript = './scripts/artifact-manager.sh'
    } else {
        artifactScript = 'powershell -ExecutionPolicy Bypass -File scripts/artifact-manager.ps1'
    }
    
    if (isUnix()) {
        sh "${artifactScript} clean"
    } else {
        bat "${artifactScript} clean"
    }
}

def getLatestArtifactInfo() {
    // Read the latest artifact manifest to get information
    def artifactsDir = 'artifacts'
    
    if (isUnix()) {
        def latestArtifact = sh(
            script: "ls -1t ${artifactsDir} | grep '^farmtally-' | head -1",
            returnStdout: true
        ).trim()
        
        if (latestArtifact) {
            def manifestPath = "${artifactsDir}/${latestArtifact}/manifest.json"
            if (fileExists(manifestPath)) {
                def manifest = readJSON file: manifestPath
                return [
                    name: manifest.name,
                    version: manifest.version,
                    commit: manifest.git.shortCommit,
                    timestamp: manifest.timestamp,
                    path: "${artifactsDir}/${latestArtifact}"
                ]
            }
        }
    } else {
        def latestArtifact = bat(
            script: "@echo off & for /f \"tokens=*\" %i in ('dir /b /od artifacts\\farmtally-* 2^>nul ^| findstr /r \"^farmtally-\" ^| tail -1') do @echo %i",
            returnStdout: true
        ).trim()
        
        if (latestArtifact) {
            def manifestPath = "artifacts\\${latestArtifact}\\manifest.json"
            if (fileExists(manifestPath)) {
                def manifest = readJSON file: manifestPath
                return [
                    name: manifest.name,
                    version: manifest.version,
                    commit: manifest.git.shortCommit,
                    timestamp: manifest.timestamp,
                    path: "artifacts\\${latestArtifact}"
                ]
            }
        }
    }
    
    error "No artifact information found"
}

def deployArtifact(String artifactName, String targetHost, String deployPath) {
    echo "Deploying artifact ${artifactName} to ${targetHost}:${deployPath}"
    
    def artifactPath = "artifacts/${artifactName}"
    
    // Verify artifact exists and is valid
    if (!fileExists(artifactPath)) {
        error "Artifact not found: ${artifactPath}"
    }
    
    verifyArtifact(artifactName)
    
    // Extract and deploy backend
    def backendPackage = "${artifactPath}/backend/backend.tar.gz"
    if (fileExists(backendPackage)) {
        if (isUnix()) {
            sh """
                scp ${backendPackage} ${targetHost}:${deployPath}/
                ssh ${targetHost} 'cd ${deployPath} && tar -xzf backend.tar.gz && rm backend.tar.gz'
            """
        } else {
            // For Windows, use PowerShell with SCP or similar
            bat """
                scp ${backendPackage} ${targetHost}:${deployPath}/
                ssh ${targetHost} "cd ${deployPath} && tar -xzf backend.tar.gz && rm backend.tar.gz"
            """
        }
    }
    
    // Extract and deploy frontend
    def frontendPackage = "${artifactPath}/frontend/frontend.tar.gz"
    if (fileExists(frontendPackage)) {
        if (isUnix()) {
            sh """
                scp ${frontendPackage} ${targetHost}:${deployPath}/
                ssh ${targetHost} 'cd ${deployPath} && tar -xzf frontend.tar.gz && rm frontend.tar.gz'
            """
        } else {
            bat """
                scp ${frontendPackage} ${targetHost}:${deployPath}/
                ssh ${targetHost} "cd ${deployPath} && tar -xzf frontend.tar.gz && rm frontend.tar.gz"
            """
        }
    }
    
    // Log deployment
    def deploymentLog = [
        timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
        artifact: artifactName,
        target: targetHost,
        path: deployPath,
        buildNumber: env.BUILD_NUMBER,
        buildUrl: env.BUILD_URL
    ]
    
    writeJSON file: 'deployment.json', json: deploymentLog
    archiveArtifacts artifacts: 'deployment.json', fingerprint: true
    
    echo "Deployment completed successfully"
}

def rollbackToPreviousArtifact(String targetHost, String deployPath) {
    echo "Rolling back to previous artifact on ${targetHost}:${deployPath}"
    
    // Get list of artifacts sorted by creation time (newest first)
    def artifacts = []
    
    if (isUnix()) {
        def artifactList = sh(
            script: "ls -1t artifacts/ | grep '^farmtally-' | head -5",
            returnStdout: true
        ).trim().split('\n')
        artifacts = artifactList.findAll { it.trim() }
    } else {
        // Windows equivalent - simplified for this example
        def artifactList = bat(
            script: "@echo off & dir /b /od artifacts\\farmtally-* 2>nul",
            returnStdout: true
        ).trim().split('\n')
        artifacts = artifactList.findAll { it.trim() }
    }
    
    if (artifacts.size() < 2) {
        error "No previous artifact available for rollback"
    }
    
    // Use the second artifact (previous one)
    def previousArtifact = artifacts[1]
    echo "Rolling back to artifact: ${previousArtifact}"
    
    // Deploy the previous artifact
    deployArtifact(previousArtifact, targetHost, deployPath)
    
    // Update build description
    currentBuild.description = "ROLLBACK to: ${previousArtifact}"
    
    echo "Rollback completed successfully"
}

def getArtifactManifest(String artifactName) {
    def manifestPath = "artifacts/${artifactName}/manifest.json"
    
    if (!fileExists(manifestPath)) {
        error "Manifest not found for artifact: ${artifactName}"
    }
    
    return readJSON file: manifestPath
}

def compareArtifacts(String artifact1, String artifact2) {
    echo "Comparing artifacts: ${artifact1} vs ${artifact2}"
    
    def manifest1 = getArtifactManifest(artifact1)
    def manifest2 = getArtifactManifest(artifact2)
    
    def comparison = [
        artifact1: [
            name: manifest1.name,
            version: manifest1.version,
            commit: manifest1.git.commit,
            timestamp: manifest1.timestamp
        ],
        artifact2: [
            name: manifest2.name,
            version: manifest2.version,
            commit: manifest2.git.commit,
            timestamp: manifest2.timestamp
        ],
        differences: []
    ]
    
    // Compare components
    manifest1.components.each { comp1 ->
        def comp2 = manifest2.components.find { it.name == comp1.name }
        if (comp2) {
            if (comp1.checksum != comp2.checksum) {
                comparison.differences << "Component ${comp1.name} has different checksum"
            }
            if (comp1.size != comp2.size) {
                comparison.differences << "Component ${comp1.name} has different size"
            }
        } else {
            comparison.differences << "Component ${comp1.name} missing in ${artifact2}"
        }
    }
    
    writeJSON file: 'artifact-comparison.json', json: comparison
    archiveArtifacts artifacts: 'artifact-comparison.json', fingerprint: true
    
    echo "Artifact comparison completed. Found ${comparison.differences.size()} differences."
    return comparison
}

// Return the functions for use in Jenkinsfile
return this