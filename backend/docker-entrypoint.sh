#!/bin/sh
set -e

# 1. Clear any stale package/service cache mounted from host
rm -f bootstrap/cache/*.php 2>/dev/null || true

# 2. Copy .env from .env.example if .env does not exist
if [ ! -f .env ] && [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 3. Wait for database connection if using MariaDB / MySQL
if [ "$DB_CONNECTION" = "mariadb" ] || [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MariaDB connection at $DB_HOST:$DB_PORT..."
    MAX_TRIES=45
    COUNT=0
    until php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Throwable \$e) { exit(1); }" 2>/dev/null; do
        COUNT=$((COUNT+1))
        if [ $COUNT -ge $MAX_TRIES ]; then
            echo "WARNING: Timeout waiting for MariaDB connection after $((MAX_TRIES * 2))s."
            break
        fi
        sleep 2
    done
    echo "MariaDB is ready and connected!"
elif [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    if [ ! -f database/database.sqlite ]; then
        echo "Creating database/database.sqlite..."
        mkdir -p database
        touch database/database.sqlite
    fi
fi

# 4. Ensure correct permissions & storage directories
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache 2>/dev/null || true
chmod -R 777 storage bootstrap/cache database 2>/dev/null || true

# 5. Ensure public storage symlink
php artisan storage:link --force 2>/dev/null || true

# 6. Coordinate database initialization between 'backend' (web server) and 'queue' (worker)
if [ "$1" = "php" ] && [ "$2" = "artisan" ] && [ "$3" = "serve" ]; then
    # Generate app key ONLY if not set (preserve existing APP_KEY from GitHub Secrets)
    if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
        echo "Generating Application Key..."
        php artisan key:generate --force || true
    fi

    echo "Running database migrations (with retry resilience)..."
    for attempt in 1 2 3; do
        if php artisan migrate --force; then
            break
        fi
        echo "  -> Migration attempt $attempt failed, retrying in 3s..."
        sleep 3
    done

    # Check if brevets table is populated using lightweight PDO query (avoids high-memory tinker)
    BREVET_COUNT=$(php -r "try { \$pdo = new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo (int)\$pdo->query('SELECT COUNT(*) FROM brevets')->fetchColumn(); } catch (Throwable \$e) { echo '0'; }" 2>/dev/null || echo "0")
    if [ "$BREVET_COUNT" = "0" ] || [ -z "$BREVET_COUNT" ]; then
        echo "Seeding initial Brevet and User data..."
        php artisan db:seed --class=DatabaseSeeder --force || echo "WARNING: Seeding encountered a non-fatal issue."
    fi
elif [ "$1" = "php" ] && [ "$2" = "artisan" ] && { [ "$3" = "queue:work" ] || [ "$3" = "queue:listen" ]; }; then
    echo "Queue worker waiting for 'jobs' table to be created by backend container..."
    for i in $(seq 1 30); do
        HAS_JOBS=$(php -r "try { \$pdo = new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); \$res = \$pdo->query(\"SHOW TABLES LIKE 'jobs'\")->fetchColumn(); echo \$res ? '1' : '0'; } catch (Throwable \$e) { echo '0'; }" 2>/dev/null || echo "0")
        if [ "$HAS_JOBS" = "1" ]; then
            echo "  -> 'jobs' table is ready!"
            break
        fi
        sleep 2
    done
fi

echo "Laravel Backend Ready!"
exec "$@"
