# Étape 1 : Construction du bundle Vite React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Construction du bundle de production
RUN npm run build

# Étape 2 : Serveur web Nginx ultra-léger
FROM nginx:alpine

# Copie des fichiers compilés dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
