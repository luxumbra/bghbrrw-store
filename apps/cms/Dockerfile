# Base image with Node.js
FROM node:20-alpine AS base

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Development stage
FROM base AS development

WORKDIR /workspace

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/cms ./apps/cms

# Set working directory to CMS app
WORKDIR /workspace/apps/cms

# Expose Sanity Studio port
EXPOSE 3333

# Start development server
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "3333"]

# Production build stage
FROM base AS build

WORKDIR /workspace

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/cms ./apps/cms

# Set working directory to CMS app
WORKDIR /workspace/apps/cms

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=build /workspace/apps/cms/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/cms/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]