# Production Dockerfile for Bough & Burrow CMS (Sanity Studio)
# Optimized for GitHub Packages deployment

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.11.0

# Copy workspace root files for proper dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/cms/package.json ./apps/cms/

# Install all dependencies (needed for workspace)
RUN pnpm install --frozen-lockfile

# Copy CMS source code
COPY apps/cms/ ./apps/cms/

# Build the CMS
WORKDIR /app/apps/cms
RUN pnpm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sanity -u 1001

# Copy built files to nginx
COPY --from=builder --chown=sanity:nodejs /app/apps/cms/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=sanity:nodejs apps/cms/nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3333/ || exit 1

# Expose port
EXPOSE 3333

# Start nginx
CMD ["nginx", "-g", "daemon off;"]