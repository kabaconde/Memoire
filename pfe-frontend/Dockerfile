# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Invalider le cache
ARG CACHE_BUST=$(date +%s)

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# 🔧 PATCH : Créer un fichier Close.js dans @mui/material
RUN echo "module.exports = require('@mui/icons-material/Close');" > node_modules/@mui/material/Close.js
RUN echo "exports.Close = require('@mui/icons-material/Close');" >> node_modules/@mui/material/index.js
RUN echo "exports.default = exports;" >> node_modules/@mui/material/index.js

# 🔧 PATCH : Créer un alias pour CloseIcon
RUN mkdir -p node_modules/@mui/icons-material && \
    echo "module.exports = require('@mui/icons-material/Close');" > node_modules/@mui/icons-material/CloseIcon.js

# Copier le code source
COPY . ./

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]