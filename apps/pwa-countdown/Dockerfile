# Stage 1: Build
FROM node:26-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy app source
COPY . .

# Stamp the build date (Swiss time) as the version shown in the app; replaces the 'dev' placeholder
RUN apk add --no-cache tzdata \
  && echo "export const APP_VERSION = '$(TZ=Europe/Zurich date +%Y.%m.%d-%H%M)';" > apps/pwa-countdown/src/app/version.ts

# Build the pwa-countdown app
RUN npx nx build pwa-countdown --configuration production

# Stage 2: Runtime
FROM node:26-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist/apps/pwa-countdown/browser /app/dist

# Expose port
EXPOSE 3007

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "3007"]
