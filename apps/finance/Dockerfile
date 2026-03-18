# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy app source
COPY . .

# Build the finance app (using ng build directly)
RUN npx nx build finance

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist/apps/finance /app/dist

# Copy serve configuration
COPY --from=builder /app/apps/finance/serve.json /app

# Expose port
EXPOSE 3001

# Start the app with serve configuration
CMD ["serve", "-c", "/app/serve.json", "-s", "/app/dist", "-l", "3001"]
