# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Invalider le cache
ARG CACHE_BUST=$(date +%s)

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# 🔧 PATCH : Créer l'export manquant dans @mui/material
RUN echo "exports.Close = require('@mui/icons-material/Close');" >> node_modules/@mui/material/index.js
RUN echo "exports.default = exports;" >> node_modules/@mui/material/index.js

# Copier le code source
COPY . ./

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]