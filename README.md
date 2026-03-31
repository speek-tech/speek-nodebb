# Speek NodeBB Community Forum

Customized NodeBB forum with seamless Speek web app integration via session sharing (SSO).

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Configuration and admin panel setup
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment procedures and verification
- **[Docs Index](docs/)** - Complete documentation

---

## Features

- **Session Sharing (SSO)** - Auto-login from Speek web app
- **Custom Branding** - Speek colors, fonts, and styling
- **Iframe Integration** - Embedded in Speek app
- **Multi-Environment** - Local, Dev, Staging, Production configs

---

## Environments

| Environment | Community URL | Admin Panel |
|-------------|---------------|-------------|
| **Local** | `http://localhost:4567` | `http://localhost:4567/admin` |
| **Dev** | `https://dev-community.lets-speek.com` | `https://dev-community.lets-speek.com/admin` |
| **Staging** | `https://test-community.lets-speek.com` | `https://test-community.lets-speek.com/admin` |
| **Production** | `https://community.lets-speek.com` | `https://community.lets-speek.com/admin` |

**Default credentials:** `admin` / `admin123` (change in production!)

---

## Quick Start

### Local Development

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f nodebb

# Access forum
open http://localhost:4567
```

### Configuration

1. Access admin panel
2. Configure session sharing plugin (see [Setup Guide](docs/SETUP.md))
3. Set security headers
4. Apply custom CSS from `nodebb.css`

---

## Key Files

- **`nodebb.css`** - Speek custom styling
- **`docker-entrypoint.sh`** - Initialization script
- **`docker-compose.yml`** - Local development setup
- **`themes/nodebb-theme-harmony-speek/`** - Customized Harmony theme

---

## Tech Stack

- **NodeBB v3.x** - Forum platform
- **Node.js 20+** - Runtime
- **PostgreSQL** - Primary database
- **Redis** - Cache and sessions
- **Docker** - Containerization

---

## Common Commands

**Restart:**
```bash
docker-compose restart nodebb
```

**Rebuild:**
```bash
./nodebb build
```

**Check session config:**
```bash
docker exec <container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  const config = await db.getObject('settings:session-sharing');
  console.log(JSON.stringify(config, null, 2));
  await db.close();
})()
"
```

---

## Architecture

```
Speek Web App (Next.js)
    ↓
API (/api/nodebb/sso-token)
    ↓ JWT Token
    ↓
Cookie (token=<jwt>; Domain=.lets-speek.com)
    ↓
NodeBB (Session Sharing Plugin)
    ↓ Validates JWT
    ↓
User Auto-Login ✓
```

---

## Development

**Install dependencies:**
```bash
npm install
```

**Build theme:**
```bash
./nodebb build harmony-speek
```

**Run setup:**
```bash
./nodebb setup
```

---

## License

NodeBB is licensed under **GNU General Public License v3 (GPL-3)**.

Speek customizations are proprietary.

---

## Links

- [NodeBB Documentation](https://docs.nodebb.org)
- [Session Sharing Plugin](https://github.com/julianlam/nodebb-plugin-session-sharing)
- [Speek Project](../)
