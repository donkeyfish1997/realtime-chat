FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client
RUN npm install --only=production
EXPOSE 4000

CMD ["npm", "run", "start:prod"]

# 建議：如果您的應用程式需要環境變數，請確保在 Docker Compose 中傳遞