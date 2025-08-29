# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json medusa-config.ts tsconfig.json ./
COPY src ./src

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile=false

# Build the backend (includes admin UI to .medusa/admin)
RUN pnpm run build

RUN if [ -d .medusa/server/public/admin ]; then \
      mkdir -p .medusa/admin && \
      cp -r .medusa/server/public/admin/* .medusa/admin/; \
    fi

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/package.json ./
# Use the compiled JavaScript config instead of TypeScript
COPY --from=builder /app/.medusa/server/medusa-config.js ./medusa-config.js
# Copy the modules directory with source files
COPY --from=builder /app/src/modules ./src/modules

WORKDIR /app/.medusa/server

# Ensure all runtime files (including .medusa/admin) belong to medusa user
RUN addgroup -g 1001 -S medusa \
    && adduser -S -u 1001 -G medusa medusa \
    && chown -R medusa:medusa /app

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile=false

USER medusa

EXPOSE 9000

RUN pwd
RUN ls -lhR ../admin || echo \"../admin missing\"
RUN ls -lhR /app/.medusa/admin || echo \"/app/.medusa/admin missing\"

CMD ["sh", "-c", "pwd && ls -lhR ../admin && pnpm run predeploy && pnpm run start"]
