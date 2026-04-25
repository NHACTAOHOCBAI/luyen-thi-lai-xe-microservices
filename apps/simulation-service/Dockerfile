# Giai đoạn 1: Prune code (Lọc code thừa)
FROM node:20-alpine AS builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune simulation-service --docker

# Giai đoạn 2: Install dependencies
FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./
RUN npm ci --include=dev

# Giai đoạn 3: Build
COPY --from=builder /app/out/full/ .
RUN npx turbo build --filter=simulation-service

# Giai đoạn 4: Runner (Image cuối cùng cực nhẹ)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app/ .
# Chạy file main.js đã build từ NestJS
CMD ["node", "apps/simulation-service/dist/main.js"]