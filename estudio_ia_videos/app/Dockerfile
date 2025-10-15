# Estágio 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Estágio 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copiar dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copiar build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["npm", "start"]
