# FarmTally Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=http://147.93.153.247:8090
ENV NEXT_PUBLIC_AUTH_URL=http://147.93.153.247:8081
ENV NEXT_PUBLIC_FIELD_MANAGER_URL=http://147.93.153.247:8088
ENV NEXT_PUBLIC_FARM_ADMIN_URL=http://147.93.153.247:8089
ENV NEXT_PUBLIC_SOCKET_URL=http://147.93.153.247:8090
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]