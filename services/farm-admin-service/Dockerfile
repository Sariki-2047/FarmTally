FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY services/farm-admin-service/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY services/farm-admin-service/ ./

# Expose port
EXPOSE 8089

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8089/health || exit 1

# Start the service
CMD ["node", "server.js"]