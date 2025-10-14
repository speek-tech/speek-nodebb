#!/bin/sh
set -e

echo "Starting NodeBB Docker container..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
  sleep 1
done

# Note: Redis disabled for now - NodeBB will use PostgreSQL for sessions/cache
# ElastiCache TLS has connection issues that need further investigation
echo "Note: Redis disabled - using PostgreSQL for all storage"

echo "Database services are ready!"

# Check if NodeBB needs first-time setup (before creating config.json)
NEEDS_SETUP=false
if [ ! -f "/app/config.json" ] || [ ! -s "/app/config.json" ]; then
  NEEDS_SETUP=true
  echo "NodeBB not configured, will run setup after creating config..."
  echo "Note: Database should be created by Terraform DB init task before this runs"
fi

# ALWAYS create/update config.json with proper settings (PostgreSQL-only, no Redis)
echo "Creating/updating config.json with PostgreSQL-only configuration..."
cat > /app/config.json <<EOF
{
  "url": "${NODEBB_URL:-http://localhost:4567}",
  "secret": "${NODEBB_SSO_SECRET:-$(openssl rand -hex 32)}",
  "database": "postgres",
  "postgres": {
    "host": "${DB_HOST:-postgres}",
    "port": ${DB_PORT:-5432},
    "username": "${DB_USERNAME:-nodebb}",
    "password": "${DB_PASSWORD:-nodebb123}",
    "database": "${DB_NAME:-nodebb}",
    "ssl": { "rejectUnauthorized": false }
  }
}
EOF

echo "config.json created (PostgreSQL-only, Redis disabled)"

# Run setup only if this is first time OR if no admin user exists
if [ "$NEEDS_SETUP" = true ]; then
  export NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin}
  export NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123}
  export NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local}
  
  echo "Running NodeBB database initialization..."
  echo "Admin credentials: ${NODEBB_ADMIN_USERNAME} / ${NODEBB_ADMIN_EMAIL}"
  node app --setup
else
  echo "NodeBB config exists, checking if admin user needs to be created..."
  
  # Check if admin user exists by trying to connect and query
  HAS_ADMIN=$(node -e "
    const nconf = require('nconf');
    const db = require('./src/database');
    (async () => {
      try {
        nconf.file({ file: 'config.json' });
        await db.init(nconf.get('database'));
        const adminCount = await db.sortedSetCard('users:admins');
        console.log(adminCount > 0 ? 'true' : 'false');
        await db.close();
        process.exit(0);
      } catch (e) {
        console.log('false');
        process.exit(0);
      }
    })();
  " 2>/dev/null || echo "false")
  
  if [ "$HAS_ADMIN" = "false" ]; then
    echo "No admin user found, creating admin user..."
    export NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin}
    export NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123}
    export NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local}
    
    echo "Admin credentials: ${NODEBB_ADMIN_USERNAME} / ${NODEBB_ADMIN_EMAIL}"
    node app --setup
  else
    echo "Admin user exists, skipping setup"
  fi
fi

# Configure Redis and PostgreSQL SSL (runs ALWAYS, not just first time)
# This ensures configuration is present even if config.json existed from previous deployment
echo "Ensuring database connections are configured..."
node -e "
  const nconf = require('nconf');
  const fs = require('fs');
  nconf.file({ file: 'config.json' });
  
  // Ensure PostgreSQL SSL is enabled for RDS (with AWS certificate acceptance)
  if (nconf.get('postgres')) {
    nconf.set('postgres:ssl', { rejectUnauthorized: false });
    console.log('PostgreSQL SSL enabled for RDS connection (accepting AWS certificate)');
  }
  
  // Skip Redis configuration - NodeBB can use PostgreSQL for sessions/cache
  // Redis with TLS has connection issues, PostgreSQL is proven working
  console.log('Using PostgreSQL for sessions and cache (Redis disabled)');
  
  // Save config
  fs.writeFileSync('config.json', JSON.stringify(nconf.stores.file.store, null, 2));
  console.log('Database configuration complete');
" || echo "Warning: Failed to configure database connections"

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
