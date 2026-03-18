# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy app source
COPY . .

# Build the shell app
RUN npx nx build shell

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist/apps/shell /app/dist

# Copy serve configuration
COPY --from=builder /app/apps/shell/serve.json /app

# Expose port
EXPOSE 3000

# Start the app with serve configuration
CMD ["serve", "-c", "/app/serve.json", "-s", "/app/dist", "-l", "3000"]
