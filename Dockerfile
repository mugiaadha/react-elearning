# ==========================================
# 1. Development Target
# ==========================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite)
RUN npm install

# Copy application files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev:fe", "--", "--host", "0.0.0.0"]

# ==========================================
# 2. Production Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set default API URL & public client keys for Vite build (can be overridden via build arg)
ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_MIDTRANS_CLIENT_KEY=
ARG VITE_DEV_MODE=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_MIDTRANS_CLIENT_KEY=${VITE_MIDTRANS_CLIENT_KEY}
ENV VITE_DEV_MODE=${VITE_DEV_MODE}

RUN npm run build

# ==========================================
# 3. Production Nginx Server
# ==========================================
FROM nginx:alpine AS production

# Copy compiled static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

