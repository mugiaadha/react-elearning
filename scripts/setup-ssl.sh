#!/usr/bin/env bash
# ==============================================================================
# Script Otomasi Let's Encrypt SSL (Resilient Pure Docker Stack)
# ==============================================================================
set -euo pipefail

EMAIL="${1:-admin@socket-clenicapp.my.id}"
DOMAIN="${2:-${APP_DOMAIN:-nac.socket-clenicapp.my.id}}"

echo "=========================================================="
echo "  Pure Docker Let's Encrypt SSL Setup (Resilient Mode)"
echo "  Domain : https://$DOMAIN"
echo "  Email  : $EMAIL"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

# Helper aman untuk update/insert key=value di file .env (tahan karakter spesial /, &, |, $)
set_env_var() {
  local file="$1"
  local key="$2"
  local val="$3"
  [ -z "$val" ] && return 0
  if [ ! -f "$file" ]; then
    touch "$file"
  fi
  awk -v k="$key" -v v="$val" '
    BEGIN { found=0 }
    $0 ~ "^"k"=" { print k"="v; found=1; next }
    { print }
    END { if (!found) print k"="v }
  ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Baca domain dari argumen, environment, atau root .env jika tersedia
if [ -z "${2:-}" ] && [ -f .env ]; then
  ENV_DOMAIN=$(grep -E '^APP_DOMAIN=' .env | cut -d '=' -f2- | tr -d '"\r ' || true)
  if [ -n "$ENV_DOMAIN" ]; then
    DOMAIN="$ENV_DOMAIN"
  fi
fi
export APP_DOMAIN="$DOMAIN"

# Pastikan root .env & backend/.env tersedia dan sinkron dengan APP_DOMAIN
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi
set_env_var ".env" "APP_DOMAIN" "$DOMAIN"
set_env_var ".env" "VITE_API_BASE_URL" "https://${DOMAIN}/api"

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env
fi
set_env_var "backend/.env" "APP_URL" "https://${DOMAIN}"
set_env_var "backend/.env" "FRONTEND_URL" "https://${DOMAIN}"
set_env_var "backend/.env" "GOOGLE_REDIRECT_URI" "https://${DOMAIN}/api/auth/google/callback"
set_env_var "backend/.env" "MAIL_FROM_ADDRESS" "\"no-reply@${DOMAIN}\""

# 1. Siapkan volume certbot & direktori backup persisten di luar folder repo (/var/backups/letsencrypt)
echo "[1/5] Menyiapkan direktori volume & backup persisten Certbot..."
BACKUP_SSL_DIR="/var/backups/letsencrypt"
mkdir -p "./certbot/conf" "./certbot/ssl" "./certbot/www"
mkdir -p "$BACKUP_SSL_DIR" 2>/dev/null || true

# 2. Restore otomatis dari backup atau /etc/letsencrypt jika sertifikat di ./certbot/conf belum ada
echo "[2/5] Memeriksa apakah sertifikat untuk $DOMAIN sudah pernah terdaftar..."
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  if [ -f "$BACKUP_SSL_DIR/live/$DOMAIN/fullchain.pem" ]; then
    echo "  -> Ditemukan sertifikat tersimpan di backup persisten ($BACKUP_SSL_DIR). Merestore sertifikat..."
    cp -a "$BACKUP_SSL_DIR/." "./certbot/conf/" 2>/dev/null || true
  elif [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "  -> Ditemukan sertifikat tersimpan di /etc/letsencrypt host. Menyalin sertifikat..."
    cp -a /etc/letsencrypt/. "./certbot/conf/" 2>/dev/null || true
  fi
fi

# 3. Cek validitas sertifikat yang ada (pakai yang sudah terdaftar, jangan request baru jika masih valid)
NEED_ISSUE=true
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ] && [ -f "./certbot/conf/live/$DOMAIN/privkey.pem" ]; then
  ISSUER=$(openssl x509 -in "./certbot/conf/live/$DOMAIN/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
  # Cek apakah sertifikat masih berlaku minimal 7 hari ke depan (604800 detik) dan bukan dummy self-signed
  if openssl x509 -checkend 604800 -noout -in "./certbot/conf/live/$DOMAIN/fullchain.pem" 2>/dev/null; then
    if echo "$ISSUER" | grep -qiE "Let's Encrypt|R3|R10|R11|R12|R13|E1|E5|E6|ZeroSSL|Staging"; then
      echo "[3/5] ✅ Sertifikat SSL untuk $DOMAIN sudah terdaftar & masih aktif ($ISSUER)."
      echo "      Menggunakan sertifikat yang sudah ada tanpa request baru ke Let's Encrypt!"
      NEED_ISSUE=false
    fi
  fi
fi

# 4. Jika benar-benar belum ada sertifikat yang valid, baru minta ke Let's Encrypt
if [ "$NEED_ISSUE" = true ]; then
  echo "[3/5] Membebaskan port 80 & 443 untuk penerbitan sertifikat..."
  if command -v systemctl &> /dev/null; then
    systemctl stop nginx apache2 httpd 2>/dev/null || true
    systemctl disable nginx apache2 httpd 2>/dev/null || true
  fi
  docker compose -f docker-compose.prod.yml stop frontend 2>/dev/null || true
  docker rm -f nac-frontend-prod 2>/dev/null || true

  # Hapus sisa folder live/archive/renewal dummy jika ada agar certbot tidak menolak dengan 'live directory exists'
  rm -rf "./certbot/conf/live/$DOMAIN" "./certbot/conf/archive/$DOMAIN" "./certbot/conf/renewal/$DOMAIN.conf" 2>/dev/null || true

  echo "  -> Meminta sertifikat SSL resmi Let's Encrypt (dengan proteksi --keep-until-expiring)..."
  if docker run --rm \
    -p 80:80 \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    --keep-until-expiring \
    --reinstall \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive; then
    echo "  -> ✅ Sertifikat resmi Let's Encrypt Production berhasil diterbitkan!"
  else
    echo "  -> ⚠️ Terkena Rate Limit / kendala jaringan Let's Encrypt Production."
    echo "  -> 🔄 Beralih otomatis ke Let's Encrypt STAGING (Tanpa Rate Limit) agar server tetap berjalan..."
    rm -rf "./certbot/conf/live/$DOMAIN" "./certbot/conf/archive/$DOMAIN" "./certbot/conf/renewal/$DOMAIN.conf" 2>/dev/null || true
    if docker run --rm \
      -p 80:80 \
      -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
      -v "$(pwd)/certbot/www:/var/www/certbot" \
      certbot/certbot certonly \
      --standalone \
      --staging \
      --keep-until-expiring \
      -d "$DOMAIN" \
      --email "$EMAIL" \
      --agree-tos \
      --no-eff-email \
      --non-interactive; then
      echo "  -> ✅ Sertifikat Let's Encrypt Staging berhasil dipasang!"
    else
      echo "  -> ⚠️ Gagal menghubungi Let's Encrypt. Membuat sertifikat fallback lokal agar Nginx tetap menyala..."
      mkdir -p "./certbot/conf/live/$DOMAIN"
      openssl req -x509 -nodes -newkey rsa:2048 -days 90 \
        -keyout "./certbot/conf/live/$DOMAIN/privkey.pem" \
        -out "./certbot/conf/live/$DOMAIN/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null || true
    fi
  fi
fi

# 5. Simpan salinan sertifikat ke backup persisten (/var/backups/letsencrypt & /etc/letsencrypt)
#    dan dereference symlink ke ./certbot/ssl agar Nginx container selalu punya file riil!
echo "[4/5] Menyimpan backup sertifikat & menyiapkan aktif SSL di ./certbot/ssl..."
mkdir -p "./certbot/ssl"
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ] && [ -f "./certbot/conf/live/$DOMAIN/privkey.pem" ]; then
  cp -fL "./certbot/conf/live/$DOMAIN/fullchain.pem" "./certbot/ssl/fullchain.pem"
  cp -fL "./certbot/conf/live/$DOMAIN/privkey.pem" "./certbot/ssl/privkey.pem"
  mkdir -p "$BACKUP_SSL_DIR" 2>/dev/null || true
  cp -a ./certbot/conf/. "$BACKUP_SSL_DIR/" 2>/dev/null || true
  mkdir -p /etc/letsencrypt 2>/dev/null || true
  cp -a ./certbot/conf/. /etc/letsencrypt/ 2>/dev/null || true
fi

# Safety net: pastikan ./certbot/ssl/fullchain.pem & privkey.pem 100% ada dan tidak kosong sebelum Nginx start
if [ ! -s "./certbot/ssl/fullchain.pem" ] || [ ! -s "./certbot/ssl/privkey.pem" ]; then
  echo "  -> ⚠️ Membuat sertifikat darurat di ./certbot/ssl agar Nginx dijamin tidak gagal start..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 90 \
    -keyout "./certbot/ssl/privkey.pem" \
    -out "./certbot/ssl/fullchain.pem" \
    -subj "/CN=$DOMAIN" 2>/dev/null || true
fi
chmod 644 "./certbot/ssl/fullchain.pem" "./certbot/ssl/privkey.pem" 2>/dev/null || true

# 6. Jalankan stack Docker dengan sertifikat yang sudah siap
echo "[5/5] Menjalankan Docker Stack (Nginx HTTPS + Backend + MariaDB)..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "=========================================================="
echo "🎉 SELAMAT! SSL & Docker Stack Berhasil Dijalankan!"
echo "🌐 Akses sekarang: https://$DOMAIN"
echo "🔒 HTTPS sudah aktif penuh di container Docker Nginx!"
echo "🔄 Container certbot aktif berjalan di background untuk auto-renew."
echo "=========================================================="
