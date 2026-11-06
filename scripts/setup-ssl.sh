#!/usr/bin/env bash
# ==============================================================================
# Script Otomasi Let's Encrypt SSL untuk elearning.socket-clenicapp.my.id
# ==============================================================================
set -e

EMAIL="$1"
DOMAIN="${2:-elearning.socket-clenicapp.my.id}"

echo "=========================================================="
echo "  Let's Encrypt SSL Setup for: https://$DOMAIN"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "[-] Harap jalankan script ini sebagai root atau dengan sudo:"
  echo "    sudo bash scripts/setup-ssl.sh [email-kamu@example.com]"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "[1/6] Memeriksa port Docker Frontend..."
if grep -q "FRONTEND_PORT=127.0.0.1:8080" .env 2>/dev/null; then
    echo "  -> Port docker sudah 127.0.0.1:8080"
else
    echo "  -> Mengalihkan port Docker frontend ke 127.0.0.1:8080 agar port 80/443 dipakai Host Nginx..."
    if grep -q "FRONTEND_PORT=" .env 2>/dev/null; then
        sed -i 's/^FRONTEND_PORT=.*/FRONTEND_PORT=127.0.0.1:8080/' .env
    else
        echo "FRONTEND_PORT=127.0.0.1:8080" >> .env
    fi
    echo "  -> Merestart container frontend dengan port baru..."
    docker compose -f docker-compose.prod.yml up -d frontend
fi

echo "[2/6] Memasang Nginx & Certbot di Host VPS..."
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

echo "[3/6] Mengonfigurasi Nginx Reverse Proxy untuk $DOMAIN..."
CONF_SRC="$SCRIPT_DIR/nginx/host-vps-nginx.conf.example"
CONF_DEST="/etc/nginx/sites-available/$DOMAIN"

if [ -f "$CONF_SRC" ]; then
    cp "$CONF_SRC" "$CONF_DEST"
    sed -i "s/server_name .*/server_name $DOMAIN;/" "$CONF_DEST"
else
    cat <<EOF > "$CONF_DEST"
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
}
EOF
fi

ln -sf "$CONF_DEST" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

echo "[4/6] Menguji & memuat ulang Nginx..."
nginx -t
systemctl reload nginx

echo "[5/6] Meminta sertifikat SSL Let's Encrypt via Certbot..."
if [ -n "$EMAIL" ]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
fi

echo "[6/6] Verifikasi Auto-Renewal Certbot..."
systemctl status certbot.timer --no-pager || true

echo "=========================================================="
echo "  SELAMAT! SSL Let's Encrypt Berhasil Dipasang!"
echo "  Akses sekarang: https://$DOMAIN"
echo "  Semua trafik HTTP (port 80) otomatis di-redirect ke HTTPS (port 443)."
echo "=========================================================="

