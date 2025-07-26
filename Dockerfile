# Etapa de build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia o restante do código, incluindo o .env.production
COPY . .

# Confirma se .env.production está disponível para o build
RUN ls -la .env.production

# Executa o build usando react-scripts (usa automaticamente .env.production)
RUN npm run build

# Etapa final com Nginx
FROM nginx:stable

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
