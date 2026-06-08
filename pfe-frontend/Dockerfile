# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# 🔧 PATCH PROPRE : Injection de l'export ESM avec un vrai saut de ligne physique
RUN sed -i '1i export { CloseIcon as Close } from "@mui/icons-material";' node_modules/@mui/material/index.js

# Copier le reste du code source
COPY . ./

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]