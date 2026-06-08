# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source de l'application
COPY . ./

# 🔧 CORRECTION DIRECTE : Remplacer l'import défaillant dans vos sources (src/)
RUN find src/ -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
    -exec sed -i 's/import {.*Close.*} from \x27@mui\/material\x27/import Close from \x27@mui\/icons-material\/Close\x27/g' {} + \
    -exec sed -i 's/import {.*Close.*} from "@mui\/material"/import Close from "@mui\/icons-material\/Close"/g' {} +

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

# Installer curl pour le HEALTHCHECK (requis sur nginx:alpine qui n'a pas curl par défaut)
RUN apk add --no-cache curl

COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]