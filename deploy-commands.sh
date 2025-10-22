
# Area 1 Direct Deployment Commands
# Copy these commands and run them on your VPS

# 1. Copy the new server file to the container
docker cp server-area1-direct.js farmtally-backend-isolated:/app/

# 2. Copy the package.json to the container  
docker cp container-package.json farmtally-backend-isolated:/app/package.json

# 3. Install dependencies in the container
docker exec farmtally-backend-isolated npm install

# 4. Restart the backend container with new server
docker restart farmtally-backend-isolated

# 5. Check if it's running
docker logs farmtally-backend-isolated --tail=10

# 6. Test the new endpoints
curl http://147.93.153.247:8082/api
curl http://147.93.153.247:8082/api/health/db
curl http://147.93.153.247:8082/api/users
curl http://147.93.153.247:8082/api/organizations
