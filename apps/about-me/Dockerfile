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
RUN mv /app/dist/index.production.html /app/dist/index.html

# Expose port
EXPOSE 3002

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "3002"]
