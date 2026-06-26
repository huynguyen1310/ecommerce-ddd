#!/bin/sh

# Wait for DB
echo "Waiting for database..."
sleep 10

# Wait for Meilisearch
echo "Waiting for Meilisearch..."
for i in $(seq 1 30); do
  if curl -sf http://meilisearch:7700/health > /dev/null 2>&1; then
    echo "Meilisearch ready."
    break
  fi
  sleep 1
done

# Run migrations and seeders (only once, usually on the main service)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Ensuring directories exist..."
    mkdir -p public bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs

    echo "Clearing stale bootstrap cache..."
    rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php
    
    echo "Updating autoloader..."
    composer dump-autoload --no-interaction
    
    echo "Running migrations..."
    php artisan migrate --force
    
    echo "Seeding database..."
    php artisan db:seed --force

    echo "Setting up Meilisearch index..."
    php artisan meilisearch:setup

    echo "Indexing products in Meilisearch..."
    php artisan meilisearch:reindex
fi

# Execute the CMD from docker-compose
exec "$@"
