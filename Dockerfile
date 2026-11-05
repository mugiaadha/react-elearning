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

# Set default API URL for build if needed (can be overridden via build arg)
ARG VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

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

