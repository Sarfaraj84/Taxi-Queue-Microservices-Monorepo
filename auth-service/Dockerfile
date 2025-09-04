# auth-service/Dockerfile
FROM node:24-alpine

# Install dependencies for node-gyp
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm)
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S auth-service -u 1001

# Change ownership of app directory
RUN chown -R auth-service:nodejs /app

# Switch to non-root user
USER auth-service

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE 50051

# Start command
CMD ["node", "server.js"]