#!/bin/bash
set -e

echo "Starting NodeBB Docker container..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  sleep 1
done

echo "Database services are ready!"

# Check if NodeBB is already configured
if [ ! -f "/app/config.json" ]; then
    echo "NodeBB not configured, running setup..."
    
    # Set environment variables for automated setup
    export NODEBB_URL=${NODEBB_URL:-http://localhost:4567}
    export NODEBB_DB=${NODEBB_DB:-postgres}
    export NODEBB_DB_HOST=${NODEBB_DB_HOST:-postgres}
    export NODEBB_DB_PORT=${NODEBB_DB_PORT:-5432}
    export NODEBB_DB_USER=${NODEBB_DB_USER:-nodebb}
    export NODEBB_DB_PASSWORD=${NODEBB_DB_PASSWORD:-nodebb123}
    export NODEBB_DB_NAME=${NODEBB_DB_NAME:-nodebb}
    export NODEBB_REDIS_HOST=${NODEBB_REDIS_HOST:-redis}
    export NODEBB_REDIS_PORT=${NODEBB_REDIS_PORT:-6379}
    export NODEBB_REDIS_PASSWORD=${NODEBB_REDIS_PASSWORD:-redis123}
    export NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin}
    export NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123}
    export NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local}
    
    # Run setup
    ./nodebb setup
fi

echo "Starting NodeBB..."
exec "$@"
