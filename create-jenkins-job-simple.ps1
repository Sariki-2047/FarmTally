# Simple Jenkins Job Creator for FarmTally Isolated Deployment

param(
    [string]$JenkinsUrl = "http://147.93.153.247:8080",
    [string]$JobName = "farmtally-isolated-deployment",
    [string]$Username = "admin"
)

Write-Host "🔧 Creating Jenkins job for FarmTally isolated deployment..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Jenkins URL: $JenkinsUrl" -ForegroundColor White
Write-Host "   Job Name: $JobName" -ForegroundColor White
Write-Host "   Frontend Port: 8081" -ForegroundColor White
Write-Host "   Backend Port: 8082" -ForegroundColor White
Write-Host "   Database Port: 8083" -ForegroundColor White
Write-Host ""

$ApiToken = Read-Host "Enter Jenkins API token (or password)"

if ([string]::IsNullOrEmpty($ApiToken)) {
    Write-Host "❌ API token is required" -ForegroundColor Red
    exit 1
}

# Job XML configuration
$jobXml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>FarmTally Isolated Deployment - Safe deployment with unique ports</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <com.coravy.hudson.plugins.github.GithubProjectProperty plugin="github@1.37.3.1">
      <projectUrl>https://github.com/Sariki-2047/FarmTally/</projectUrl>
    </com.coravy.hudson.plugins.github.GithubProjectProperty>
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

# Create authentication header
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${Username}:${ApiToken}"))
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/xml"
}

Write-Host "🚀 Creating Jenkins job..." -ForegroundColor Yellow

try {
    $createJobUrl = "$JenkinsUrl/createItem?name=$JobName"
    Invoke-RestMethod -Uri $createJobUrl -Method Post -Body $jobXml -Headers $headers -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ Jenkins job created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Job URL: $JenkinsUrl/job/$JobName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: $JenkinsUrl/job/$JobName" -ForegroundColor White
    Write-Host "2. Click 'Build Now'" -ForegroundColor White
    Write-Host "3. Wait for deployment (5-10 minutes)" -ForegroundColor White
    Write-Host "4. Access FarmTally at:" -ForegroundColor White
    Write-Host "   - Frontend: http://147.93.153.247:8081" -ForegroundColor Cyan
    Write-Host "   - Backend: http://147.93.153.247:8082" -ForegroundColor Cyan
    Write-Host "   - Health: http://147.93.153.247:8082/health" -ForegroundColor Cyan
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Job already exists. Trying to update..." -ForegroundColor Yellow
        
        try {
            $updateJobUrl = "$JenkinsUrl/job/$JobName/config.xml"
            Invoke-RestMethod -Uri $updateJobUrl -Method Post -Body $jobXml -Headers $headers -ErrorAction Stop
            Write-Host "✅ Job updated successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to update: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create job: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Manual Setup:" -ForegroundColor Yellow
        Write-Host "1. Go to $JenkinsUrl" -ForegroundColor White
        Write-Host "2. Click 'New Item'" -ForegroundColor White
        Write-Host "3. Name: $JobName" -ForegroundColor White
        Write-Host "4. Type: Pipeline" -ForegroundColor White
        Write-Host "5. Repository: https://github.com/Sariki-2047/FarmTally.git" -ForegroundColor White
        Write-Host "6. Script Path: Jenkinsfile.isolated" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📖 Manual Instructions (if needed):" -ForegroundColor Cyan
Write-Host "1. Open Jenkins: $JenkinsUrl" -ForegroundColor White
Write-Host "2. Navigate to FarmTally folder" -ForegroundColor White
Write-Host "3. New Item → Pipeline" -ForegroundColor White
Write-Host "4. Pipeline from SCM → Git" -ForegroundColor White
Write-Host "5. Repository: https://github.com/Sariki-2047/FarmTally.git" -ForegroundColor White
Write-Host "6. Script Path: Jenkinsfile.isolated" -ForegroundColor White