#!/bin/sh
set -e

echo "Starting NodeBB Docker container..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
  sleep 1
done

# Wait for Redis to be ready (for sessions)
echo "Waiting for Redis to be ready..."
while ! nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}; do
  sleep 1
done

echo "Database services are ready!"

# Non-interactive setup on first run (auto-create admin)
if [ ! -f "/app/config.json" ] || [ ! -s "/app/config.json" ]; then
  echo "NodeBB not configured, running non-interactive setup..."
  NODEBB_URL=${NODEBB_URL:-http://localhost:4567}
  NODEBB_DB=${NODEBB_DB:-postgres}
  NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin}
  NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123}
  NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local}

  cat > /tmp/setup.json <<EOF
{
  "url": "${NODEBB_URL}",
  "secret": "${NODEBB_SSO_SECRET:-$(openssl rand -hex 32)}",
  "admin:username": "${NODEBB_ADMIN_USERNAME}",
  "admin:email": "${NODEBB_ADMIN_EMAIL}",
  "admin:password": "${NODEBB_ADMIN_PASSWORD}",
  "admin:password:confirm": "${NODEBB_ADMIN_PASSWORD}",
  "database": "${NODEBB_DB}",
  "postgres:host": "${DB_HOST:-postgres}",
  "postgres:port": ${DB_PORT:-5432},
  "postgres:username": "${DB_USERNAME:-nodebb}",
  "postgres:password": "${DB_PASSWORD:-nodebb123}",
  "postgres:database": "${DB_NAME:-nodebb}",
  "redis:host": "${REDIS_HOST:-redis}",
  "redis:port": ${REDIS_PORT:-6379},
  "redis:password": "${REDIS_PASSWORD:-}",
  "redis:database": 0,
  "redis:tls": true
}
EOF
  echo "Running NodeBB setup with admin credentials: ${NODEBB_ADMIN_USERNAME} / ${NODEBB_ADMIN_EMAIL}"
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

# Install & enable session-sharing plugin at boot (idempotent)
if [ ! -d "node_modules/nodebb-plugin-session-sharing" ]; then
  echo "Installing nodebb-plugin-session-sharing..."
  npm install nodebb-plugin-session-sharing || true
fi
echo "Enabling nodebb-plugin-session-sharing..."
./nodebb plugins enable nodebb-plugin-session-sharing || true

# Configure session-sharing plugin (JWT via query string)
if [ -n "${NODEBB_SSO_SECRET}" ]; then
  echo "Configuring session-sharing plugin..."
  node -e "(async()=>{try{const nconf=require('nconf');const db=require('./src/database');nconf.file({file:'config.json'});await db.init(nconf.get('database'));const o={name:process.env.NODEBB_SSO_APPID||'speek',cookieName:'token',cookieDomain:undefined,secret:process.env.NODEBB_SSO_SECRET,behaviour:'trust',adminRevalidate:'off',noRegistration:'off',payloadParent:undefined,allowBannedUsers:false,hostWhitelist:'localhost,127.0.0.1','payload:id':'id','payload:username':'username','payload:email':'email','payload:picture':'picture','payload:fullname':'fullname'};await db.setObject('settings:session-sharing',o);await db.close();console.log('session-sharing configured');}catch(e){console.error('Warning: Failed to configure session-sharing:',e.message);}})()" || echo "Warning: session-sharing configuration failed, will retry on next start"
fi

# Iframe embedding headers: disable X-Frame-Options and set CSP frame-ancestors
if [ -n "${NODEBB_FRAME_ANCESTORS}" ]; then
  ./nodebb config set "csp-frame-ancestors" "${NODEBB_FRAME_ANCESTORS}" || true
else
  # Default to local app origins for development
  ./nodebb config set "csp-frame-ancestors" "http://localhost:3000 http://127.0.0.1:3000" || true
fi
./nodebb config set xframe disabled || true

# Apply custom CSS from /app/nodebb.css
if [ -f "/app/nodebb.css" ]; then
  echo "Applying custom CSS from nodebb.css..."
  node -e "const fs=require('fs');const nconf=require('nconf');const db=require('./src/database');(async()=>{try{nconf.file({file:'config.json'});await db.init(nconf.get('database'));await db.setObjectField('config','customCSS',fs.readFileSync('nodebb.css','utf8'));await db.setObjectField('config','useCustomCSS',true);await db.close();console.log('customCSS set');}catch(e){console.error('Warning: Failed to set custom CSS:',e.message);}})()" || echo "Warning: custom CSS configuration failed"
  ./nodebb config set useCustomCSS true || true
fi

# Rebuild assets after any config change
echo "Building NodeBB assets..."
./nodebb build || true

echo "Starting NodeBB..."
exec "$@"
