#!/usr/bin/env bash
# ==============================================================================
# Script Otomasi Let's Encrypt SSL (Certbot Standalone -> Pure Docker Stack)
# ==============================================================================
set -e

EMAIL="${1:-admin@socket-clenicapp.my.id}"
DOMAIN="${2:-elearning.socket-clenicapp.my.id}"

echo "=========================================================="
echo "  Pure Docker Let's Encrypt SSL Setup (Standalone Mode)"
echo "  Domain : https://$DOMAIN"
echo "  Email  : $EMAIL"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

# Pastikan backend/.env tersedia agar docker compose tidak gagal membaca env_file
if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env
fi

# 1. Pastikan port 80 & 443 bebas untuk Certbot Standalone
echo "[1/4] Membebaskan port 80 & 443..."
if command -v systemctl &> /dev/null; then
  systemctl stop nginx 2>/dev/null || true
  systemctl disable nginx 2>/dev/null || true
fi
docker compose -f docker-compose.prod.yml stop frontend 2>/dev/null || true
docker rm -f nac-frontend-prod 2>/dev/null || true

# 2. Siapkan volume certbot
echo "[2/4] Menyiapkan direktori volume Certbot..."
mkdir -p "./certbot/conf"
mkdir -p "./certbot/www"

# 3. Terbitkan sertifikat Let's Encrypt via Certbot Standalone jika belum ada
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "[3/4] Sertifikat Let's Encrypt untuk $DOMAIN sudah ada. Lewati pembuatan baru."
else
  echo "[3/4] Menerbitkan sertifikat SSL resmi Let's Encrypt via Certbot Standalone di port 80..."
  docker run --rm \
    -p 80:80 \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive
fi

# 4. Jalankan stack Docker dengan sertifikat resmi yang sudah siap
echo "[4/4] Menjalankan Docker Stack (Nginx HTTPS + Backend + MariaDB)..."
docker compose -f docker-compose.prod.yml up -d

echo "=========================================================="
echo "🎉 SELAMAT! SSL Let's Encrypt Berhasil Dipasang!"
echo "🌐 Akses sekarang: https://$DOMAIN"
echo "🔒 HTTPS sudah aktif penuh di container Docker Nginx!"
echo "🔄 Container certbot aktif berjalan di background untuk auto-renew."
echo "=========================================================="
