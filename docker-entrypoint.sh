#!/bin/sh
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

# Non-interactive setup on first run (auto-create admin)
if [ ! -f "/app/config.json" ] || [ ! -s "/app/config.json" ]; then
  echo "NodeBB not configured, running non-interactive setup..."
  NODEBB_URL=${NODEBB_URL:-http://localhost:4567}
  NODEBB_DB=${NODEBB_DB:-postgres}
  NODEBB_DB_HOST=${NODEBB_DB_HOST:-postgres}
  NODEBB_DB_PORT=${NODEBB_DB_PORT:-5432}
  NODEBB_DB_USER=${NODEBB_DB_USER:-nodebb}
  NODEBB_DB_PASSWORD=${NODEBB_DB_PASSWORD:-nodebb123}
  NODEBB_DB_NAME=${NODEBB_DB_NAME:-nodebb}
  NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin}
  NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123}
  NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local}

  cat > /tmp/setup.json <<EOF
{
  "url": "${NODEBB_URL}",
  "secret": "abcdef",
  "admin:username": "${NODEBB_ADMIN_USERNAME}",
  "admin:email": "${NODEBB_ADMIN_EMAIL}",
  "admin:password": "${NODEBB_ADMIN_PASSWORD}",
  "admin:password:confirm": "${NODEBB_ADMIN_PASSWORD}",
  "database": "${NODEBB_DB}",
  "postgres:host": "${NODEBB_DB_HOST}",
  "postgres:port": ${NODEBB_DB_PORT},
  "postgres:username": "${NODEBB_DB_USER}",
  "postgres:password": "${NODEBB_DB_PASSWORD}",
  "postgres:database": "${NODEBB_DB_NAME}"
}
EOF
  node app --setup="$(cat /tmp/setup.json)"
fi

# Apply non-interactive configuration driven by environment variables
echo "Applying runtime configuration..."

# Navigation layout (Harmony)
if [ -n "${NODEBB_NAV}" ]; then
  ./nodebb config set harmony:navigation "${NODEBB_NAV}" || true
fi
if [ -n "${NODEBB_SIDEBAR}" ]; then
  ./nodebb config set harmony:sidebar "${NODEBB_SIDEBAR}" || true
fi

# Lock user appearance/theme switching if requested
if [ "${NODEBB_ALLOW_USER_SKINS}" = "false" ]; then
  ./nodebb config set appearance:allowUserSkins false || true
  ./nodebb config set theme:allowUserSkins false || true
fi
if [ "${NODEBB_ALLOW_THEME_SWITCH}" = "false" ]; then
  ./nodebb config set appearance:themeSelection false || true
  ./nodebb config set harmony:showSkins false || true
fi

# Rebuild assets after any config change
echo "Building NodeBB assets..."
./nodebb build || true

echo "Starting NodeBB..."
exec "$@"
