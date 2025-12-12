# Deployment Guide

Quick deployment checklist for Speek NodeBB.

## Pre-Deployment

### Environment Variables

**NodeBB:**
```yaml
NODE_ENV: production
NODEBB_URL: https://community.lets-speek.com
NODEBB_SSO_SECRET: <from-ssm>
DB_HOST: <rds-endpoint>
REDIS_HOST: <elasticache-endpoint>
```

**API:**
```yaml
NODEBB_SESSION_SHARING_SECRET: <same-as-nodebb>
```

**Web:**
```yaml
NEXT_PUBLIC_NODEBB_URL: https://community.lets-speek.com
```

### Checklist

- [ ] All code changes committed
- [ ] Secrets configured in SSM/Secrets Manager
- [ ] Secrets match between API and NodeBB
- [ ] Environment variables set correctly

---

## Deployment Steps

### 1. Deploy NodeBB

```bash
cd speek-nodebb
docker build -t nodebb:latest .
docker tag nodebb:latest <ecr-repo>:latest
docker push <ecr-repo>:latest

aws ecs update-service \
  --cluster <cluster> \
  --service <nodebb-service> \
  --force-new-deployment
```

### 2. Deploy API & Web

Deploy using your standard process.

### 3. Configure Admin Panel

After deployment, manually configure in NodeBB admin:
1. Session Sharing plugin (see [Setup Guide](SETUP.md))
2. Security headers (see [Setup Guide](SETUP.md))
3. Custom CSS (see [Setup Guide](SETUP.md))
4. Restart NodeBB

---

## Post-Deployment Verification

### 1. Check Logs

```bash
aws logs tail /ecs/<project>-<env>/nodebb --follow
```

Look for:
```
✅ session-sharing configured
✅ Permissions-Policy configured
```

### 2. Test SSO Flow

1. Login to web app
2. Click Community
3. Verify auto-login works
4. Test posting/replying

### 3. Verify Cookie

**DevTools → Application → Cookies**
- Name: `token`
- Domain: `.lets-speek.com`
- SameSite: `None`
- Secure: ✓

### 4. Check Headers

**DevTools → Network → NodeBB request → Response Headers**
```
✅ content-security-policy: frame-ancestors https://app.lets-speek.com
✅ cross-origin-embedder-policy: require-corp
✅ permissions-policy: fullscreen=...
❌ (NO x-frame-options)
```

---

## Troubleshooting

### Secret mismatch
```bash
# Check SSM parameter
aws ssm get-parameter --name "/<project>-<env>/nodebb-sso-secret" --with-decryption
```

### User not logged in
- Verify secrets match exactly
- Check session-sharing config in admin panel
- Verify cookie domain is `.lets-speek.com`

### Permissions violations
- Check Permissions-Policy configured
- Restart NodeBB after config changes

---

## Rollback

### Quick rollback
```bash
aws ecs update-service \
  --cluster <cluster> \
  --service <service> \
  --task-definition <previous-revision>
```

---

## Security Checklist

Before production:

- [ ] Change admin password from default
- [ ] JWT secret is strong (32+ chars)
- [ ] HTTPS enforced
- [ ] Cookie domain correct (`.lets-speek.com`)
- [ ] Host whitelist restrictive
- [ ] Test with non-admin user
- [ ] Verify banned users blocked

---

## Environment Configs

### Local
```yaml
Cookie Domain: (empty)
Host Whitelist: localhost,127.0.0.1
Frame Ancestors: http://localhost:3000
```

### Staging
```yaml
Cookie Domain: .lets-speek.com
Host Whitelist: test.lets-speek.com,test-community.lets-speek.com
Frame Ancestors: https://test.lets-speek.com
```

### Production
```yaml
Cookie Domain: .lets-speek.com
Host Whitelist: lets-speek.com,app.lets-speek.com,community.lets-speek.com
Frame Ancestors: https://app.lets-speek.com
```
