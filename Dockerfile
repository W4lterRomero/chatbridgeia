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
# Add libc6-compat for sharp compatibility in Alpine
RUN apk add --no-cache libc6-compat python3 make g++

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

# Copy node_modules from build stage (SSR needs all dependencies)
COPY --from=build /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist

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
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

# Start the SSR server
CMD ["node", "dist/server/entry.mjs"]
