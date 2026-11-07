# ==============================================================================
# CHEAT SHEET: DOCKER, LARAVEL & VPS ELEVISION STACK
# ==============================================================================

# --- 1. ONE-LINER RESET & RELOAD CEPAT ---
# Clear cache Laravel + restart backend/queue + reload Nginx
docker exec -it nac-backend-prod php artisan optimize:clear && docker compose -f docker-compose.prod.yml restart backend queue && docker exec -it nac-frontend-prod nginx -s reload

# Force recreate container backend (baca .env baru) + clear cache + reload Nginx
docker compose -f docker-compose.prod.yml up -d --force-recreate backend queue && docker exec -it nac-backend-prod php artisan optimize:clear && docker exec -it nac-frontend-prod nginx -s reload


# --- 2. EKSEKUSI LARAVEL (PHP ARTISAN) ---
# Bersihkan seluruh cache konfigurasi, route, dan view
docker exec -it nac-backend-prod php artisan optimize:clear

# Generate ulang APP_KEY yang valid (jika unsupported cipher / error 500)
docker exec -it nac-backend-prod php artisan key:generate --force

# Cek apakah APP_KEY terbaca benar di Laravel
docker exec -it nac-backend-prod php artisan tinker --execute="dump(config('app.key'));"

# Database migration & seed (Warning: --force untuk bypass proteksi production)
docker exec -it nac-backend-prod php artisan migrate --force
docker exec -it nac-backend-prod php artisan migrate:fresh --seed --force

# Composer di dalam container
docker exec -it nac-backend-prod composer install --no-dev --optimize-autoloader
docker exec -it nac-backend-prod composer dump-autoload


# --- 3. TROUBLESHOOTING & CEK LOG ---
# Cek log aplikasi Laravel (50 baris terakhir)
docker exec -it nac-backend-prod tail -n 50 /var/www/html/storage/logs/laravel.log

# Pantau log Laravel realtime (Live Stream - tekan Ctrl+C untuk keluar)
docker exec -it nac-backend-prod tail -f /var/www/html/storage/logs/laravel.log

# Cek log error Nginx frontend (untuk diagnosa 502 Bad Gateway)
docker exec -it nac-frontend-prod tail -n 25 /var/log/nginx/error.log

# Cek console log container Docker
docker logs --tail 50 nac-backend-prod
docker logs --tail 50 nac-frontend-prod


# --- 4. DEBUGGING KONEKSI & REVERSE PROXY ---
# Tes koneksi internal dari frontend ke backend (harus HTTP 200 OK)
docker exec -it nac-frontend-prod curl -I http://backend:8000/api/auth/google/url

# Cek apakah string localhost:8000 masih tertanam di bundle JavaScript React
docker exec -it nac-frontend-prod grep -ro "localhost:8000" /usr/share/nginx/html/

# Tes respon domain publik via SSL
curl -Iv https://elearning.socket-clenicapp.my.id/api/auth/google/url


# --- 5. BUILD & SINKRONISASI FRONTEND ---
# Opsi A: Build via Docker Compose tanpa cache
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend

# Opsi B: Build lokal di VPS lalu salin langsung ke container Nginx
cd /var/www/elearning && npm run build
docker cp dist/. nac-frontend-prod:/usr/share/nginx/html/
docker exec -it nac-frontend-prod nginx -s reload


# --- 6. DOCKER LIFECYCLE & MAINTENANCE ---
# Masuk ke shell container
docker exec -it nac-backend-prod bash
docker exec -it nac-frontend-prod sh

# Cek status semua container (termasuk yang mati)
docker ps -a

# Cek penggunaan RAM dan CPU container secara realtime
docker stats

# Bersihkan container mati, network lama, dan build cache (hemat disk)
docker system prune -f
docker system df