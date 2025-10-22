#!/bin/bash

# Setup Docker Integration in Jenkins
# This script configures Docker access for Jenkins container

VPS_HOST="147.93.153.247"
VPS_USER="root"

echo "🐳 Setting up Docker Integration in Jenkins..."
echo "=============================================="

echo "1. Installing Docker in Jenkins container..."
ssh $VPS_USER@$VPS_HOST "
    docker exec -u root jenkins apt-get update
    docker exec -u root jenkins apt-get install -y docker.io docker-compose curl
"

echo -e "\n2. Adding Jenkins user to docker group..."
ssh $VPS_USER@$VPS_HOST "
    docker exec -u root jenkins usermod -aG docker jenkins
"

echo -e "\n3. Setting up Docker socket permissions..."
ssh $VPS_USER@$VPS_HOST "
    chmod 666 /var/run/docker.sock
"

echo -e "\n4. Restarting Jenkins container to apply changes..."
ssh $VPS_USER@$VPS_HOST "docker restart jenkins"

echo -e "\n5. Waiting for Jenkins to restart..."
sleep 30

echo -e "\n6. Verifying Docker integration..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins docker --version"
ssh $VPS_USER@$VPS_HOST "docker exec jenkins docker ps"

echo -e "\n7. Installing Jenkins Docker plugins via CLI..."
ssh $VPS_USER@$VPS_HOST "
    docker exec jenkins java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ install-plugin docker-workflow docker-commons docker-build-step -restart
" 2>/dev/null || echo "Plugin installation requires authentication - install manually via web interface"

echo -e "\n✅ Docker Integration Setup Complete!"
echo "================================================"
echo "Next steps:"
echo "1. Access Jenkins: http://147.93.153.247:8080"
echo "2. Go to Manage Jenkins → Manage Plugins"
echo "3. Install Docker Pipeline plugin if not already installed"
echo "4. Create a new pipeline job to test Docker integration"