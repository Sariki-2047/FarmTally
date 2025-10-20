# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S farmtally -u 1001

# Copy built application
COPY --from=builder --chown=farmtally:nodejs /app/dist ./dist
COPY --from=builder --chown=farmtally:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=farmtally:nodejs /app/package*.json ./
COPY --from=builder --chown=farmtally:nodejs /app/prisma ./prisma

# Copy Flutter web build (if available)
COPY --chown=farmtally:nodejs farmtally_mobile/build/web ./dist/public

USER farmtally

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]