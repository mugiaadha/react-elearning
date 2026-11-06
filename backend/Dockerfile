FROM php:8.2-cli-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions via official installer (mlocati/docker-php-extension-installer)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install tools & PHP extensions directly without manual compile overhead
RUN apk add --no-cache curl git unzip mariadb-client sqlite \
    && install-php-extensions \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        bcmath \
        mbstring \
        zip \
        pcntl \
        intl

# Install Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer manifest files
COPY composer.json composer.lock* ./

# Install Composer dependencies (including dev packages so providers like Pail are available)
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy application source code
COPY . .

# Inject Anti-php2shell & PHP Security Hardening configuration
COPY docker/security.ini /usr/local/etc/php/conf.d/security.ini

# Set up storage and cache directories permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    database \
    && chmod -R 777 storage bootstrap/cache database \
    && chmod +x docker-entrypoint.sh

# Expose Laravel default port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]

# Default command
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
