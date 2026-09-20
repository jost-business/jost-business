FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx nx build header-element --configuration=production

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist/components/header/browser ./dist
EXPOSE 3010
CMD ["serve", "-s", "/app/dist", "-l", "3010"]
