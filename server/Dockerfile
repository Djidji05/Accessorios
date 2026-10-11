FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci

# Génération du client Prisma
RUN npx prisma generate

# Copie du code source
COPY tsconfig.json ./
COPY src ./src/

# Compilation TypeScript
RUN npm run build

# Étape finale d'exécution légère
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances de production uniquement
RUN npm ci --only=production
RUN npx prisma generate

# Récupération du build compilé
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
