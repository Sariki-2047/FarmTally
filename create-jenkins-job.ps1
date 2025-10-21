# Create Jenkins Job for FarmTally
# Run this to automatically create the Jenkins job

param(
    [string]$JenkinsUrl = "http://147.93.153.247:8080",
    [string]$JobName = "farmtally-pipeline",
    [string]$Username = "admin",
    [string]$ApiToken = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Creating Jenkins job for FarmTally..." -ForegroundColor Green

if ([string]::IsNullOrEmpty($ApiToken)) {
    $ApiToken = Read-Host "Enter Jenkins API token (or password)"
}

# Create job XML configuration
$jobXml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>FarmTally CI/CD Pipeline - Complete corn procurement management system</description>
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
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

# Create credentials for authentication
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${Username}:${ApiToken}"))

try {
    # Create the job
    Write-Host "Creating Jenkins job: $JobName"
    
    $headers = @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/xml"
    }
    
    $createJobUrl = "$JenkinsUrl/createItem?name=$JobName"
    
    Invoke-RestMethod -Uri $createJobUrl -Method Post -Body $jobXml -Headers $headers
    
    Write-Host "✅ Jenkins job '$JobName' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Job URL: $JenkinsUrl/job/$JobName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Visit the job URL to configure additional settings"
    Write-Host "2. Add GitHub webhook for automatic builds"
    Write-Host "3. Configure environment variables"
    Write-Host "4. Run the first build"
    
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
        Write-Host "Please check:"
        Write-Host "- Jenkins URL is correct: $JenkinsUrl"
        Write-Host "- Username and API token are valid"
        Write-Host "- Jenkins is accessible"
    }
}

Write-Host ""
Write-Host "Manual setup instructions:"
Write-Host "1. Go to $JenkinsUrl"
Write-Host "2. Click 'New Item'"
Write-Host "3. Enter name: $JobName"
Write-Host "4. Select 'Pipeline'"
Write-Host "5. Under Pipeline, select 'Pipeline script from SCM'"
Write-Host "6. SCM: Git"
Write-Host "7. Repository URL: https://github.com/Sariki-2047/FarmTally.git"
Write-Host "8. Branch: */main"
Write-Host "9. Script Path: Jenkinsfile"
Write-Host "10. Save and build"