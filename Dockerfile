FROM node:18 as builder

WORKDIR /app

COPY . .

RUN npm install && npm run build

# Etapa final com Nginx
FROM nginx:stable

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
