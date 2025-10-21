# Quick FarmTally VPS Deployment Script (PowerShell)
# Run this on Windows to deploy to VPS: 147.93.153.247

param(
    [string]$VpsHost = "147.93.153.247",
    [string]$VpsUser = "root"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Quick deploying FarmTally to VPS: $VpsHost" -ForegroundColor Green

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are available
Write-Info "Checking required tools..."

if (!(Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH client not found. Please install OpenSSH or use WSL."
    exit 1
}

if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Error "SCP not found. Please install OpenSSH or use WSL."
    exit 1
}

# Step 1: Test SSH connection
Write-Info "Testing SSH connection to $VpsHost..."
try {
    $sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes "$VpsUser@$VpsHost" "exit" 2>$null
    Write-Info "SSH connection successful"
} catch {
    Write-Warn "SSH key authentication failed, will prompt for password"
}

# Step 2: Create deployment package
Write-Info "Creating deployment package..."

# Create temporary directory for packaging
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
$packagePath = Join-Path $tempDir "farmtally-deploy"
New-Item -ItemType Directory -Path $packagePath -Force | Out-Null

# Copy files excluding node_modules and build artifacts
Write-Info "Copying project files..."
$excludePatterns = @(
    "node_modules",
    ".git",
    "farmtally-frontend/node_modules",
    "farmtally-frontend/.next",
    "farmtally-frontend/dist",
    "*.log",
    ".env.local"
)

# Copy all files except excluded ones
Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($item.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    return !$shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $packagePath $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    } else {
        Copy-Item $_.FullName $destPath -Force
    }
}

# Create tar.gz package (requires tar command)
$packageFile = "farmtally-deploy.tar.gz"
Write-Info "Creating package archive..."

if (Get-Command tar -ErrorAction SilentlyContinue) {
    Set-Location $tempDir
    tar -czf $packageFile farmtally-deploy
    Move-Item $packageFile (Get-Location).Path
    Set-Location ..
} else {
    Write-Error "tar command not found. Please install tar or use WSL."
    exit 1
}

# Cleanup temp directory
Remove-Item $tempDir -Recurse -Force

# Step 3: Upload to VPS
Write-Info "Uploading to VPS..."
scp $packageFile "$VpsUser@$VpsHost":/tmp/

# Step 4: Execute deployment on VPS
Write-Info "Executing deployment on VPS..."

$deploymentScript = @'
set -e

echo "📦 Setting up FarmTally on VPS..."

# Create project directory
mkdir -p /opt/farmtally
cd /opt/farmtally

# Extract deployment package
tar -xzf /tmp/farmtally-deploy.tar.gz --strip-components=1
rm /tmp/farmtally-deploy.tar.gz

# Make scripts executable
find scripts -name "*.sh" -exec chmod +x {} \;

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://farmtally:farmtally123@localhost:5432/farmtally
JWT_SECRET=farmtally_jwt_secret_key_2024
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
NEXT_PUBLIC_APP_URL=http://147.93.153.247
CORS_ORIGIN=http://147.93.153.247
EOF

# Install dependencies
echo "Installing dependencies..."
npm install --production

if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    npm install
    npm run build
    cd ..
fi

# Create Docker Compose file
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  farmtally-db:
    image: postgres:14-alpine
    container_name: farmtally-db
    environment:
      POSTGRES_DB: farmtally
      POSTGRES_USER: farmtally
      POSTGRES_PASSWORD: farmtally123
    volumes:
      - farmtally_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  farmtally-backend:
    build: .
    container_name: farmtally-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://farmtally:farmtally123@farmtally-db:5432/farmtally
      - JWT_SECRET=farmtally_jwt_secret_key_2024
    depends_on:
      - farmtally-db
    restart: unless-stopped

  farmtally-frontend:
    image: nginx:alpine
    container_name: farmtally-frontend
    ports:
      - "80:80"
    volumes:
      - ./farmtally-frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - farmtally-backend
    restart: unless-stopped

volumes:
  farmtally_db_data:
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
EOF

# Create Nginx config
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://farmtally-backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /health {
            proxy_pass http://farmtally-backend:3000/health;
        }
    }
}
EOF

# Start services
echo "Starting FarmTally services..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services to start
sleep 30

# Check status
echo "Checking service status..."
docker-compose ps

echo "✅ FarmTally deployment completed!"
echo "🌐 Application: http://147.93.153.247"
echo "🔧 Jenkins: http://147.93.153.247:8080"
echo "🐳 Docker: http://147.93.153.247:9000"
'@

ssh "$VpsUser@$VpsHost" $deploymentScript

# Step 5: Cleanup local files
Write-Info "Cleaning up local files..."
Remove-Item $packageFile -Force

# Step 6: Test deployment
Write-Info "Testing deployment..."
Start-Sleep 5

try {
    $response = Invoke-WebRequest -Uri "http://$VpsHost/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Info "✅ Deployment successful! Application is running."
} catch {
    Write-Warn "⚠️  Application may still be starting. Check in a few minutes."
}

Write-Host ""
Write-Host "🎉 FarmTally deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:"
Write-Host "🌐 Frontend: http://$VpsHost" -ForegroundColor Cyan
Write-Host "🔧 Jenkins: http://$VpsHost`:8080" -ForegroundColor Cyan
Write-Host "🐳 Docker: http://$VpsHost`:9000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check status:"
Write-Host "ssh $VpsUser@$VpsHost 'cd /opt/farmtally && docker-compose ps'" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs:"
Write-Host "ssh $VpsUser@$VpsHost 'cd /opt/farmtally && docker-compose logs -f'" -ForegroundColor Yellow