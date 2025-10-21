# Create Isolated Jenkins Job for FarmTally
# This creates a Jenkins job that deploys FarmTally in isolated containers

param(
    [string]$JenkinsUrl = "http://147.93.153.247:8080",
    [string]$JobName = "farmtally-isolated-deployment",
    [string]$Username = "admin",
    [string]$ApiToken = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Creating isolated Jenkins job for FarmTally..." -ForegroundColor Green
Write-Host "📋 Job Configuration:" -ForegroundColor Cyan
Write-Host "   - Frontend Port: 8081" -ForegroundColor White
Write-Host "   - Backend Port: 8082" -ForegroundColor White
Write-Host "   - Database Port: 8083" -ForegroundColor White
Write-Host "   - Isolated Network: farmtally-network" -ForegroundColor White
Write-Host ""

if ([string]::IsNullOrEmpty($ApiToken)) {
    $ApiToken = Read-Host "Enter Jenkins API token (or password)"
}

# Create isolated job XML configuration
$jobXml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>FarmTally Isolated Deployment - Runs in isolated Docker containers with unique ports to avoid conflicts with other projects</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <com.coravy.hudson.plugins.github.GithubProjectProperty plugin="github@1.37.3.1">
      <projectUrl>https://github.com/Sariki-2047/FarmTally/</projectUrl>
      <displayName></displayName>
    </com.coravy.hudson.plugins.github.GithubProjectProperty>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <com.cloudbees.jenkins.GitHubPushTrigger plugin="github@1.37.3.1">
          <spec></spec>
        </com.cloudbees.jenkins.GitHubPushTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>FARMTALLY_FRONTEND_PORT</name>
          <description>Port for FarmTally frontend (default: 8081)</description>
          <defaultValue>8081</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>FARMTALLY_BACKEND_PORT</name>
          <description>Port for FarmTally backend (default: 8082)</description>
          <defaultValue>8082</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>FARMTALLY_DB_PORT</name>
          <description>Port for FarmTally database (default: 8083)</description>
          <defaultValue>8083</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.14.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/Sariki-2047/FarmTally.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile.isolated</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

# Create credentials for authentication
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${Username}:${ApiToken}"))

try {
    Write-Host "Creating isolated Jenkins job: $JobName" -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/xml"
    }
    
    $createJobUrl = "$JenkinsUrl/createItem?name=$JobName"
    
    Invoke-RestMethod -Uri $createJobUrl -Method Post -Body $jobXml -Headers $headers
    
    Write-Host ""
    Write-Host "✅ Jenkins job '$JobName' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Job Details:" -ForegroundColor Cyan
    Write-Host "   Job URL: $JenkinsUrl/job/$JobName" -ForegroundColor White
    Write-Host "   Pipeline File: Jenkinsfile.isolated" -ForegroundColor White
    Write-Host "   Deployment Type: Isolated containers" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 After deployment, access FarmTally at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://147.93.153.247:8081" -ForegroundColor White
    Write-Host "   Backend API: http://147.93.153.247:8082" -ForegroundColor White
    Write-Host "   Health Check: http://147.93.153.247:8082/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to the job URL above" -ForegroundColor White
    Write-Host "2. Click 'Build Now' to start deployment" -ForegroundColor White
    Write-Host "3. Monitor the build progress" -ForegroundColor White
    Write-Host "4. Access your application once deployment completes" -ForegroundColor White
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Job may already exist. Updating existing job..." -ForegroundColor Yellow
        
        try {
            $updateJobUrl = "$JenkinsUrl/job/$JobName/config.xml"
            Invoke-RestMethod -Uri $updateJobUrl -Method Post -Body $jobXml -Headers $headers
            Write-Host "✅ Jenkins job '$JobName' updated successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to update job: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create job: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "- Check Jenkins URL: $JenkinsUrl" -ForegroundColor White
        Write-Host "- Verify username and API token" -ForegroundColor White
        Write-Host "- Ensure Jenkins is accessible" -ForegroundColor White
        Write-Host "- Check if you have permission to create jobs" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📖 Manual setup instructions (if automatic creation failed):" -ForegroundColor Cyan
Write-Host "1. Go to $JenkinsUrl" -ForegroundColor White
Write-Host "2. Navigate to FarmTally folder" -ForegroundColor White
Write-Host "3. Click 'New Item'" -ForegroundColor White
Write-Host "4. Enter name: $JobName" -ForegroundColor White
Write-Host "5. Select 'Pipeline'" -ForegroundColor White
Write-Host "6. Under Pipeline section:" -ForegroundColor White
Write-Host "   - Definition: Pipeline script from SCM" -ForegroundColor White
Write-Host "   - SCM: Git" -ForegroundColor White
Write-Host "   - Repository URL: https://github.com/Sariki-2047/FarmTally.git" -ForegroundColor White
Write-Host "   - Branch: */main" -ForegroundColor White
Write-Host "   - Script Path: Jenkinsfile.isolated" -ForegroundColor White
Write-Host "7. Save and click 'Build Now'" -ForegroundColor White

Write-Host ""
Write-Host "🔐 Required Jenkins Setup:" -ForegroundColor Yellow
Write-Host "- SSH key for VPS access (credential ID: 'vps-ssh-key')" -ForegroundColor White
Write-Host "- Node.js 18 tool configured in Jenkins" -ForegroundColor White
Write-Host "- Docker available on Jenkins agent" -ForegroundColor White