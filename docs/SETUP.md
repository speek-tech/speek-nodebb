# Setup Guide

Quick setup guide for Speek NodeBB integration.

## Environments

| Environment | Admin URL | Cookie Domain |
|-------------|-----------|---------------|
| **Local** | `http://localhost:4567/admin` | *(empty)* |
| **Dev** | `https://dev-community.lets-speek.com/admin` | `.lets-speek.com` |
| **Staging** | `https://test-community.lets-speek.com/admin` | `.lets-speek.com` |
| **Production** | `https://community.lets-speek.com/admin` | `.lets-speek.com` |

**Default admin:** `admin` / `admin123` (change in production!)

---

## Session Sharing Setup

**Admin Panel → Extend → Plugins → Session Sharing**

### Required Settings

| Field | Value | Notes |
|-------|-------|-------|
| Base Name | `speek` | |
| Cookie Name | `token` | |
| Cookie Domain | See table above | Leading dot required for cloud |
| JWT Secret | `<from-env>` | Must match API secret exactly |
| Host Whitelist | See below | Comma-separated domains |

**Host Whitelist by Environment:**
- **Local:** `localhost,127.0.0.1`
- **Dev:** `localhost,127.0.0.1,dev.lets-speek.com,dev-community.lets-speek.com`
- **Staging:** `test.lets-speek.com,test-community.lets-speek.com`
- **Production:** `lets-speek.com,app.lets-speek.com,community.lets-speek.com`

### Checkboxes

- ☐ Apply revalidation rules to administrators *(check in production)*
- ☐ Do not automatically create accounts **→ MUST BE UNCHECKED**
- ☑ Automatically update profile information **→ CHECK**
- ☐ Allow banned users *(leave unchecked)*
- ☑ Automatically join groups if present **→ CHECK**
- ☑ Automatically leave groups if not present **→ CHECK**

---

## Security Headers

**Admin Panel → Settings → Advanced → Headers**

### CSP Frame-Ancestors

| Environment | Value |
|-------------|-------|
| **Local** | `http://localhost:3000` |
| **Dev** | `http://localhost:3000 http://127.0.0.1:3000 https://dev.lets-speek.com` |
| **Staging** | `https://test.lets-speek.com` |
| **Production** | `https://app.lets-speek.com` |

### Permissions-Policy

Format: `fullscreen=(self "PARENT_URL"), clipboard-write=(self "PARENT_URL"), clipboard-read=(self "PARENT_URL")`

Replace `PARENT_URL` with parent app URL from table above.

### Cross-Origin Settings

- **Cross-Origin-Embedder-Policy:** ON ✓
- **Cross-Origin-Opener-Policy:** `unsafe-none`
- **Cross-Origin-Resource-Policy:** `cross-origin`

---

## Custom CSS

**Admin Panel → Appearance → Customise**

1. Copy all contents from `speek-nodebb/nodebb.css`
2. Paste into **Custom CSS** textarea
3. Enable **"Use Custom CSS"** toggle
4. Click **Save**

**Must be done manually in each environment.**

---

## Verification

### Test SSO

1. Login to Speek web app
2. Navigate to Community
3. Should auto-login to NodeBB (no prompt)

### Check Browser

**DevTools → Application → Cookies**
- Cookie `token` exists
- Domain: `.lets-speek.com`
- SameSite: `None`
- Secure: ✓

**Console should show:**
```
✅ Cookie set
✅ Iframe loaded successfully
```

---

## Troubleshooting

### Cookie not being set
- Verify HTTPS enabled
- Check cookie domain matches (with leading dot)

### User not logged in
- Verify JWT secrets match exactly
- Check `email` field in JWT payload
- Ensure "Do not create accounts" is UNCHECKED

### X-Frame-Options blocking
```bash
docker exec <container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  await db.deleteObjectField('config','frame-options');
  await db.close();
})()
"
```

### Permissions violations
- Check Permissions-Policy is configured
- Restart NodeBB after changes

---

## Quick Reference

**Environment Variables (NodeBB):**
```yaml
NODEBB_URL: <nodebb-url>
NODE_ENV: <production|staging|development>
NODEBB_SSO_SECRET: <secret>
```

**Environment Variables (API):**
```yaml
NODEBB_SESSION_SHARING_SECRET: <same-as-nodebb>
```

**Restart NodeBB:**
```bash
docker-compose restart nodebb
# or
./nodebb restart
```
