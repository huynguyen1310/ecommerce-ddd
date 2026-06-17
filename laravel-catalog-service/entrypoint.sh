#!/bin/sh

# Wait for DB
echo "Waiting for database..."
sleep 15

# Run migrations and seeders (only once, usually on the main service)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Ensuring directories exist..."
    mkdir -p public bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
    
    echo "Updating autoloader..."
    composer dump-autoload --no-interaction
    
    echo "Running migrations..."
    php artisan migrate --force
    
    echo "Seeding database..."
    php artisan db:seed --force
fi

# Execute the CMD from docker-compose
exec "$@"
