#!/bin/bash

# Jenkins Docker Integration Check Script
# Run this script to verify Docker availability in Jenkins

VPS_HOST="147.93.153.247"
VPS_USER="root"

echo "🔍 Checking Docker Integration in Jenkins..."
echo "=============================================="

# Check if Jenkins container exists
echo "1. Checking Jenkins container status..."
ssh $VPS_USER@$VPS_HOST "docker ps | grep jenkins"

echo -e "\n2. Checking Docker version in Jenkins container..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins docker --version 2>/dev/null || echo 'Docker not available in Jenkins container'"

echo -e "\n3. Checking Docker socket permissions..."
ssh $VPS_USER@$VPS_HOST "ls -la /var/run/docker.sock"

echo -e "\n4. Checking if Jenkins user can access Docker..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins whoami"
ssh $VPS_USER@$VPS_HOST "docker exec jenkins groups 2>/dev/null || echo 'Cannot check groups'"

echo -e "\n5. Testing Docker commands from Jenkins..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins docker ps 2>/dev/null || echo 'Docker commands not accessible from Jenkins'"

echo -e "\n6. Checking Docker Compose availability..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins docker-compose --version 2>/dev/null || echo 'Docker Compose not available'"

echo -e "\n7. Checking Jenkins plugins directory..."
ssh $VPS_USER@$VPS_HOST "docker exec jenkins ls -la /var/jenkins_home/plugins/ | grep -i docker || echo 'No Docker plugins found'"

echo -e "\n8. Current running containers on VPS..."
ssh $VPS_USER@$VPS_HOST "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo -e "\n✅ Docker Integration Check Complete!"
echo "================================================"
echo "If Docker is not available in Jenkins, run the setup script."