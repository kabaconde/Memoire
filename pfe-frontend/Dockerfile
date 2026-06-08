# --- Étape 1 : Build React ---
FROM node:20-alpine AS builder

WORKDIR /build

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . ./

# Build
RUN npm run build

# --- Étape 2 : Production avec Nginx ---
FROM nginx:alpine

# Copie de la configuration Nginx personnalisée si vous en avez une, sinon la ligne suivante suffit
COPY --from=builder /build/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]