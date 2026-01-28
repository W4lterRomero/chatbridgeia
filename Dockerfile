# ============================================
# ChatBridge IA - Production Dockerfile
# Multi-Stage Build: Node.js → Nginx Alpine
# ============================================

# Stage 1: Build
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the static site
RUN npm run build

# Stage 2: Production (Nginx Alpine)
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user for security (preparation for Round 4)
# RUN addgroup -g 1001 -S nginx && adduser -S nginx -u 1001

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
