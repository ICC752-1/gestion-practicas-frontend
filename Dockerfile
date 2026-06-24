FROM node:20.19-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

# Instalar envsubst para procesar variables de entorno
RUN apk add --no-cache gettext

ENV API_UPSTREAM=http://backend:8000

# Copiar build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar plantilla de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Exponer puerto 80
EXPOSE 80

# Usar envsubst solo para API_UPSTREAM, dejando $host, $remote_addr, etc. intactos
CMD ["sh", "-c", "envsubst '${API_UPSTREAM}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
