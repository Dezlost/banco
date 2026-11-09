# Imagen de producción del sistema bancario.
FROM node:22-alpine

WORKDIR /app

# pnpm fijado para que la imagen sea reproducible.
RUN npm install -g pnpm@10.33.0

# Instalar dependencias primero para aprovechar la caché de capas.
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# Copiar el código y compilar.
COPY . .
RUN pnpm prisma generate && pnpm build

EXPOSE 3000

# Aplica migraciones pendientes y arranca la API.
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/server.js"]
