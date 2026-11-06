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

# 2. Siapkan folder certbot untuk ACME webroot
echo "[2/6] Menyiapkan direktori certbot volume..."
mkdir -p "./certbot/www"

# 3. Cek apakah sertifikat Let's Encrypt resmi sudah ada
IS_REAL_CERT=false
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  if openssl x509 -in "./certbot/conf/live/$DOMAIN/fullchain.pem" -noout -issuer 2>/dev/null | grep -qi "Let's Encrypt"; then
    IS_REAL_CERT=true
  fi
fi

# Jika belum ada sertifikat sama sekali, buat dummy cert agar Nginx Docker bisa boot
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "[3/6] Sertifikat belum ada. Membuat dummy cert sementara untuk inisialisasi Nginx Docker..."
  mkdir -p "./certbot/conf/live/$DOMAIN"
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
  echo "[3/6] Sertifikat ditemukan (Status Real Let's Encrypt: $IS_REAL_CERT)."
fi

# 4. Jalankan stack Docker (Frontend Nginx akan mendengarkan port 80 & 443)
echo "[4/6] Menjalankan Frontend Nginx Docker..."
docker compose -f docker-compose.prod.yml up -d frontend
sleep 3

# 5. Minta sertifikat asli Let's Encrypt jika belum terpasang
if [ "$IS_REAL_CERT" = true ]; then
  echo "[5/6] Sertifikat resmi Let's Encrypt sudah terpasang dan valid. Lewati penerbitan."
else
  echo "[5/6] Menerbitkan sertifikat SSL resmi Let's Encrypt via Docker Certbot..."
  # Hapus direktori dummy agar certbot tidak menolak dengan error "live directory exists"
  rm -rf "./certbot/conf/live/$DOMAIN"
  rm -rf "./certbot/conf/archive/$DOMAIN"
  rm -rf "./certbot/conf/renewal/$DOMAIN.conf"

  docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive" certbot

  # Proteksi: jika certbot gagal, kembalikan dummy cert agar Nginx tidak error saat reload
  if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "[-] Certbot belum berhasil menerbitkan sertifikat. Membuat kembali dummy cert..."
    mkdir -p "./certbot/conf/live/$DOMAIN"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "./certbot/conf/live/$DOMAIN/privkey.pem" \
      -out "./certbot/conf/live/$DOMAIN/fullchain.pem" \
      -subj "/CN=$DOMAIN"
    exit 1
  fi
fi

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
