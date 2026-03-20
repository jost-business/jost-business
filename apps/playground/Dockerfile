# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy app source
COPY . .

# Build the playground app
RUN npx nx build playground

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist/apps/playground /app/dist

# Expose port
EXPOSE 3003

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "3003"]
