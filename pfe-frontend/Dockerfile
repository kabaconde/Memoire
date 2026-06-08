# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Invalider le cache
ARG CACHE_BUST=$(date +%s)

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Ajouter un script post-install pour créer un alias
RUN mkdir -p node_modules/@mui/material && \
    echo "module.exports = require('@mui/icons-material/Close');" > node_modules/@mui/material/Close.js

# Copier le code source
COPY . ./

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

COPY --from=builder /build/build /usr/share/nginx/html
COPY --from=builder /build/node_modules/@mui/material/Close.js /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]