#!/usr/bin/env bash
# ==============================================================================
# Script Otomasi Let's Encrypt SSL (100% Pure Docker - No Host Nginx)
# ==============================================================================
set -e

EMAIL="${1:-admin@socket-clenicapp.my.id}"
DOMAIN="${2:-elearning.socket-clenicapp.my.id}"

echo "=========================================================="
echo "  Pure Docker Let's Encrypt SSL Setup"
echo "  Domain : https://$DOMAIN"
echo "  Email  : $EMAIL"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

# 1. Matikan Nginx host jika sebelumnya pernah terinstall/aktif agar port 80 & 443 bebas untuk Docker
if command -v systemctl &> /dev/null; then
  echo "[1/6] Memastikan port 80 & 443 bebas dari Nginx host..."
  systemctl stop nginx 2>/dev/null || true
  systemctl disable nginx 2>/dev/null || true
fi

# 2. Siapkan folder certbot untuk sertifikat dan ACME challenge
echo "[2/6] Menyiapkan direktori certbot volume..."
mkdir -p "./certbot/conf/live/$DOMAIN"
mkdir -p "./certbot/www"

# 3. Buat sertifikat dummy self-signed jika sertifikat asli belum ada
# Tujuannya agar Nginx Docker bisa menyala pertama kali tanpa crash karena missing .pem
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "[3/6] Sertifikat belum ada. Membuat dummy cert sementara untuk inisialisasi Nginx Docker..."
  if command -v openssl &> /dev/null; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "./certbot/conf/live/$DOMAIN/privkey.pem" \
      -out "./certbot/conf/live/$DOMAIN/fullchain.pem" \
      -subj "/CN=$DOMAIN"
  else
    docker run --rm \
      -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
      alpine/openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
      -out "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
      -subj "/CN=$DOMAIN"
  fi
else
  echo "[3/6] Direktori sertifikat sudah tersedia."
fi

# 4. Jalankan stack Docker (Frontend Nginx akan mendengarkan port 80 & 443)
echo "[4/6] Menjalankan Frontend Nginx Docker..."
docker compose -f docker-compose.prod.yml up -d frontend
sleep 3

# 5. Minta sertifikat asli Let's Encrypt melalui container Certbot
echo "[5/6] Menerbitkan sertifikat SSL resmi Let's Encrypt via Docker Certbot..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
  -d $DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  --force-renewal" certbot

# 6. Reload Nginx Docker untuk memuat sertifikat Let's Encrypt yang baru terbit
echo "[6/6] Memuat ulang Nginx di dalam container Docker..."
docker compose -f docker-compose.prod.yml exec -T frontend nginx -s reload

# Jalankan daemon certbot untuk auto-renewal background setiap 12 jam
docker compose -f docker-compose.prod.yml up -d certbot

echo "=========================================================="
echo "🎉 SELAMAT! SSL Let's Encrypt Berhasil Dipasang di Docker!"
echo "🌐 Akses sekarang: https://$DOMAIN"
echo "🔒 Nginx berjalan murni di Docker tanpa menyentuh VPS OS host."
echo "🔄 Container certbot aktif berjalan di background untuk auto-renew."
echo "=========================================================="
