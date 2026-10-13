FROM node:20-alpine AS builder

WORKDIR /app

# Installation d'OpenSSL requis par le moteur Prisma sous Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm install

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

# Installation d'OpenSSL requis pour l'exécution de Prisma sous Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances de production uniquement
RUN npm install --omit=dev
RUN npx prisma generate

# Récupération du build compilé
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
