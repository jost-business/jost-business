# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy app source
COPY . .

# Build the about-me app
RUN npx nx build about-me

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist/apps/about-me /app/dist

# Copy serve configuration
COPY --from=builder /app/apps/about-me/serve.json /app

# Expose port
EXPOSE 3002

# Start the app with serve configuration
CMD ["serve", "-c", "/app/serve.json", "-s", "/app/dist", "-l", "3002"]
