#!/bin/sh
set -e

# 1. Clear any stale package/service cache mounted from host
rm -f bootstrap/cache/*.php 2>/dev/null || true

# 2. Copy .env from .env.example if .env does not exist
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 3. Wait for database connection if using MariaDB / MySQL
if [ "$DB_CONNECTION" = "mariadb" ] || [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MariaDB connection at $DB_HOST:$DB_PORT..."
    MAX_TRIES=30
    COUNT=0
    until php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Throwable \$e) { exit(1); }" 2>/dev/null; do
        COUNT=$((COUNT+1))
        if [ $COUNT -ge $MAX_TRIES ]; then
            echo "Timeout waiting for MariaDB connection."
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

# 4. Ensure correct permissions
chmod -R 777 storage bootstrap/cache database 2>/dev/null || true

# 5. Ensure public storage symlink
php artisan storage:link 2>/dev/null || true

# 6. Only run migrations & seeding in the main web server container (skip in queue worker to avoid race condition)
if [ "$1" = "php" ] && [ "$2" = "artisan" ] && [ "$3" = "serve" ]; then
    # Generate app key if not set
    if ! grep -q "^APP_KEY=base64:" .env; then
        echo "Generating Application Key..."
        php artisan key:generate --force
    fi

    echo "Running migrations..."
    php artisan migrate --force

    # Check if brevets table is populated using lightweight PDO query (no high-memory tinker)
    BREVET_COUNT=$(php -r "try { \$pdo = new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo \$pdo->query('SELECT COUNT(*) FROM brevets')->fetchColumn(); } catch (Throwable \$e) { echo '0'; }" 2>/dev/null || echo "0")
    if [ "$BREVET_COUNT" = "0" ] || [ -z "$BREVET_COUNT" ]; then
        echo "Seeding initial Brevet and User data..."
        php artisan db:seed --class=DatabaseSeeder --force
    fi
fi

echo "Laravel Backend Ready!"
exec "$@"
