FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    postgresql-dev \
    oniguruma-dev \
    linux-headers

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip bcmath gd sockets

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Create necessary directories and set permissions
RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs public && \
    chown -R www-data:www-data bootstrap/cache storage public && \
    chmod -R 775 bootstrap/cache storage public

# Install dependencies with security audit disabled for the prototype
RUN composer install --no-interaction --no-scripts --no-progress --prefer-dist --no-security-blocking

RUN chmod +x entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["./entrypoint.sh"]
