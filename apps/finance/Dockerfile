# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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

# Expose port
EXPOSE 3001

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "3001"]
