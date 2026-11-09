#!/usr/bin/env bash
set -u

# 0. Pastikan port SSH & HTTP/HTTPS selalu terbuka di UFW dan layanan SSH aktif setelah reboot
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp 2>/dev/null || true
  ufw allow OpenSSH 2>/dev/null || true
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
fi
systemctl enable ssh 2>/dev/null || systemctl enable sshd 2>/dev/null || true

# 1. Hentikan & hapus SEMUA container, image, network, dan volume Docker
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker rmi -f $(docker images -aq) 2>/dev/null || true
docker volume rm -f $(docker volume ls -q) 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker system prune -a --volumes -f 2>/dev/null || true

# 2. Hapus seluruh direktori project & source code
rm -rf /var/www/*

# 3. Bersihkan web server host lama jika ada (SIMPAN /etc/letsencrypt & /var/backups/letsencrypt agar tidak terkena rate-limit Certbot)
systemctl stop nginx apache2 2>/dev/null || true
apt-get purge -y nginx nginx-common nginx-full apache2 2>/dev/null || true
rm -rf /etc/nginx /etc/apache2

# 4. Bersihkan package cache, sampah Linux, & log
apt-get autoremove --purge -y 2>/dev/null || true
apt-get clean 2>/dev/null || true
journalctl --vacuum-time=1d 2>/dev/null || true
find /var/log -type f -regex '.*\.[0-9]+\.gz$' -delete 2>/dev/null || true
cat /dev/null > ~/.bash_history && history -c 2>/dev/null || true

# 5. Reboot bersih
reboot
