# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# 🔧 PATCH : Ajouter l'export Close dans @mui/material
RUN echo "export const Close = require('@mui/icons-material/Close').default;" >> node_modules/@mui/material/index.js
RUN echo "export { default as CloseIcon } from '@mui/icons-material/Close';" >> node_modules/@mui/material/index.js

# Copier le reste du code source
COPY . ./

# Build - Désactiver le mode strict pour ignorer les warnings
RUN GENERATE_SOURCEMAP=false CI=false npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

# Installer curl pour le HEALTHCHECK
RUN apk add --no-cache curl

COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]