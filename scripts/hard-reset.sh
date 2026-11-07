# 1. Hentikan & hapus SEMUA container, image, network, dan volume Docker
docker stop $(docker ps -aq) 2>/dev/null
docker rm -f $(docker ps -aq) 2>/dev/null
docker rmi -f $(docker images -aq) 2>/dev/null
docker volume rm -f $(docker volume ls -q) 2>/dev/null
docker network prune -f
docker system prune -a --volumes -f

# 2. Hapus seluruh direktori project & source code
rm -rf /var/www/*

# 3. Bersihkan web server host & sertifikat SSL lama jika ada
systemctl stop nginx apache2 2>/dev/null
apt-get purge -y nginx nginx-common nginx-full apache2 certbot 2>/dev/null
rm -rf /etc/nginx /etc/apache2 /etc/letsencrypt

# 4. Bersihkan package cache, sampah Linux, & log
apt-get autoremove --purge -y
apt-get clean
journalctl --vacuum-time=1d
find /var/log -type f -regex '.*\.[0-9]+\.gz$' -delete
cat /dev/null > ~/.bash_history && history -c

# 5. Reboot bersih
reboot