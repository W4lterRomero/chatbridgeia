# ============================================
# ChatBridge IA - Production Dockerfile (SSR)
# Multi-Stage Build: Build → Node.js Runtime
# ============================================

# Stage 1: Build
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the SSR application
RUN npm run build

# Stage 2: Production (Node.js Runtime)
FROM node:lts-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY --from=build /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy environment variables
COPY --from=build /app/.env* ./

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port 4321
EXPOSE 4321

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/ || exit 1

# Start the SSR server
CMD ["node", "dist/server/entry.mjs"]
