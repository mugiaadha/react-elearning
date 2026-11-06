#!/usr/bin/env bash
# ==============================================================================
# Setup Lengkap: Optimasi Memory + Docker + Nginx SSL untuk elearning.socket-clenicapp.my.id
# ==============================================================================
set -e

EMAIL="$1"
DOMAIN="${2:-elearning.socket-clenicapp.my.id}"

echo "=========================================================="
echo " Setup VPS & SSL untuk: https://$DOMAIN"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "[-] Harap jalankan script ini sebagai root atau dengan sudo:"
  echo "    sudo bash $0 [email-kamu@example.com]"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd || pwd)"
cd "$SCRIPT_DIR"

# ------------------------------------------------------------------------------
# [1/7] Optimasi Kernel Memory (Aman untuk RAM 1 GB)
# ------------------------------------------------------------------------------
echo "[1/7] Mengonfigurasi parameter memory kernel..."
sysctl -w vm.swappiness=10 >/dev/null
sysctl -w vm.vfs_cache_pressure=50 >/dev/null

grep -q '^vm.swappiness' /etc/sysctl.conf && sed -i 's/^vm.swappiness.*/vm.swappiness=10/' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
grep -q '^vm.vfs_cache_pressure' /etc/sysctl.conf && sed -i 's/^vm.vfs_cache_pressure.*/vm.vfs_cache_pressure=50/' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf

# ------------------------------------------------------------------------------
# [2/7] Pasang Docker Engine Resmi & Optimasi Ukuran Log
# ------------------------------------------------------------------------------
echo "[2/7] Memeriksa & memasang Docker Engine..."
if ! command -v docker &>/dev/null; then
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Batasi log Docker agar disk 20GB tidak habis
mkdir -p /etc/docker
cat <<EOF > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true
}
EOF
systemctl restart docker

# ------------------------------------------------------------------------------
# [3/7] Konfigurasi Port Container Frontend
# ------------------------------------------------------------------------------
echo "[3/7] Memeriksa port Docker Frontend..."
if [ -f "docker-compose.prod.yml" ]; then
  if grep -q "FRONTEND_PORT=127.0.0.1:8080" .env 2>/dev/null; then
      echo "  -> Port docker sudah 127.0.0.1:8080"
  else
      echo "  -> Mengalihkan port Docker frontend ke 127.0.0.1:8080..."
      if grep -q "FRONTEND_PORT=" .env 2>/dev/null; then
          sed -i 's/^FRONTEND_PORT=.*/FRONTEND_PORT=127.0.0.1:8080/' .env
      else
          echo "FRONTEND_PORT=127.0.0.1:8080" >> .env
      fi
      echo "  -> Menjalankan container frontend..."
      docker compose -f docker-compose.prod.yml up -d frontend || true
  fi
else
  echo "  [i] Catatan: file docker-compose.prod.yml belum ditemukan di direktori ini, lewati build container."
fi

# ------------------------------------------------------------------------------
# [4/7] Memasang Nginx & Certbot di Host VPS
# ------------------------------------------------------------------------------
echo "[4/7] Memasang Nginx & Certbot di Host VPS..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx

# ------------------------------------------------------------------------------
# [5/7] Konfigurasi Nginx Reverse Proxy
# ------------------------------------------------------------------------------
echo "[5/7] Mengonfigurasi Nginx Reverse Proxy untuk $DOMAIN..."
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

# ------------------------------------------------------------------------------
# [6/7] Uji & Muat Ulang Nginx
# ------------------------------------------------------------------------------
echo "[6/7] Menguji & memuat ulang Nginx..."
nginx -t
systemctl restart nginx

# ------------------------------------------------------------------------------
# [7/7] Meminta Sertifikat SSL Let's Encrypt
# ------------------------------------------------------------------------------
echo "[7/7] Meminta sertifikat SSL Let's Encrypt via Certbot..."
if [ -n "$EMAIL" ]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
fi

echo "=========================================================="
echo " SELAMAT! Setup & SSL Let's Encrypt Berhasil Dipasang!"
echo " Akses sekarang: https://$DOMAIN"
echo "=========================================================="