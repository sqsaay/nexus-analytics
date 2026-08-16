FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY prisma ./prisma/
COPY --from=builder /app/dist ./dist
RUN npx prisma generate

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
