# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx nx build api --configuration=production

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/api ./

RUN npm ci --omit=dev

EXPOSE 3005

ENV NODE_ENV=production HOST=0.0.0.0 PORT=3005

CMD ["node", "main.js"]
