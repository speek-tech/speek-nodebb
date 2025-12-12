# Documentation

Documentation for Speek NodeBB setup and deployment.

## Guides

### [Setup Guide](SETUP.md)

First-time setup and configuration:
- Environment overview
- Admin panel configuration
- Session sharing (SSO)
- Security headers
- Custom CSS
- Troubleshooting

### [Deployment Guide](DEPLOYMENT.md)

Deployment procedures:
- Pre-deployment checklist
- Deployment steps
- Verification
- Rollback procedures
- Environment-specific configs

---

## Quick Links

- **Admin Panels:**
  - Local: `http://localhost:4567/admin`
  - Staging: `https://test-community.lets-speek.com/admin`
  - Production: `https://community.lets-speek.com/admin`

- **Default Credentials:** `admin` / `admin123` (change in production!)

- **Key Files:**
  - Custom CSS: `speek-nodebb/nodebb.css`
  - Entrypoint: `speek-nodebb/docker-entrypoint.sh`

---

## Common Tasks

**Restart NodeBB:**
```bash
docker-compose restart nodebb
```

**Check logs:**
```bash
docker-compose logs nodebb | tail -100
```

**Verify session config:**
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

## Getting Help

1. Check relevant guide (Setup or Deployment)
2. Review troubleshooting sections
3. Check logs and browser console
4. Verify environment variables

---

**Last Updated:** December 12, 2025
