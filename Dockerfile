# Multi-stage Docker build for Railway deployment
# Optimized for Railway's Docker environment and Next.js standalone mode

FROM node:20-alpine AS base

# Install system dependencies and clean up
RUN apk add --no-cache libc6-compat git dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY packages/admin/package.json ./packages/admin/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shopify/package.json ./packages/shopify/
COPY packages/email/package.json ./packages/email/

# === Dependencies stage ===
FROM base AS deps

# Set npm configuration for Railway stability
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set network-timeout 300000

# Install dependencies with multiple retry strategies
RUN npm ci --frozen-lockfile --prefer-offline --no-audit --no-fund || \
    (sleep 10 && npm ci --frozen-lockfile --prefer-offline --no-audit --no-fund) || \
    (sleep 30 && npm ci --frozen-lockfile --no-audit --no-fund)

# === Builder stage ===
FROM base AS builder

# Set Node.js environment and memory limits for Railway
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NEXT_TELEMETRY_DISABLED=1
ENV RAILWAY_ENVIRONMENT=1

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy all source files
COPY . .

# Build packages first (if they need building)
RUN npm run packages:build || echo "No packages to build"

# Generate Prisma client if needed
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Build the Next.js application with error handling
RUN npm run build || (echo "Build failed, retrying..." && sleep 5 && npm run build)

# === Production stage ===
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package.json for reference
COPY package.json ./

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create necessary directories and set permissions
RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next && \
    chmod -R 755 .next

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]