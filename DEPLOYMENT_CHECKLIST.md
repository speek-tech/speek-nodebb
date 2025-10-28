# NodeBB Session Sharing - Deployment Checklist

## 🎯 **Overview**
This checklist ensures all components are properly configured and deployed for NodeBB session sharing to work with `app.lets-speek.com`.

---

## ✅ **Pre-Deployment Checklist**

### **1. Verify All Code Changes Are Committed**
- [ ] `speek-nodebb/docker-entrypoint.sh` - Session sharing configuration
- [ ] `speek-nodebb/docker-compose.yml` - Environment variables
- [ ] `speek-api/src/controllers/nodebb-sso.controller.ts` - Email field included
- [ ] `speek-api/env.example` - NODEBB_SESSION_SHARING_SECRET documented
- [ ] `speek-web/pages/community.tsx` - Iframe permissions & error logging

### **2. Infrastructure Configuration**

#### **API Environment Variables (Already Configured in Terraform)**
- [x] `NODEBB_SESSION_SHARING_SECRET` - Provided by SSM parameter
- [x] Terraform modules provide the secret automatically

#### **NodeBB Environment Variables**

**For Staging:**
```yaml
NODE_ENV: staging
NODEBB_URL: https://test-community.lets-speek.com
NODEBB_SSO_SECRET: <same-as-api-secret>
DB_HOST: <rds-endpoint>
DB_PORT: 5432
DB_USERNAME: nodebb
DB_PASSWORD: <secure-password>
DB_NAME: nodebb
REDIS_HOST: <elasticache-endpoint>
REDIS_PORT: 6379
REDIS_PASSWORD: <secure-password>
NODEBB_ADMIN_USERNAME: admin
NODEBB_ADMIN_PASSWORD: <secure-password>
NODEBB_ADMIN_EMAIL: admin@speek.com
```

**For Production:**
```yaml
NODE_ENV: production
NODEBB_URL: https://community.lets-speek.com
NODEBB_SSO_SECRET: <same-as-api-secret>
# ... same as staging but with production values
```

#### **Web Frontend Environment Variables**

**For Staging:**
```bash
NEXT_PUBLIC_NODEBB_URL=https://test-community.lets-speek.com
```

**For Production:**
```bash
NEXT_PUBLIC_NODEBB_URL=https://community.lets-speek.com
```

---

## 🚀 **Deployment Steps**

### **Step 1: Deploy NodeBB**

```bash
# Build new Docker image
cd speek-nodebb
docker build -t nodebb:latest .

# Tag for ECR
docker tag nodebb:latest <ecr-repo>:latest

# Push to ECR
docker push <ecr-repo>:latest

# Update ECS service
aws ecs update-service \
  --cluster <cluster-name> \
  --service <nodebb-service> \
  --force-new-deployment
```

### **Step 2: Deploy API**

```bash
cd speek-api
# Build and deploy (your existing process)
```

### **Step 3: Deploy Web Frontend**

```bash
cd speek-web
# Build and deploy (your existing process)
```

---

## 🔍 **Post-Deployment Verification**

### **1. Check NodeBB Logs**

```bash
# Check CloudWatch logs or container logs
aws logs tail /ecs/<project>-<env>/nodebb --follow

# Look for these success messages:
✅ session-sharing configured: {...}
✅ Permissions-Policy configured
```

### **2. Test SSO Flow**

1. **Login to Web App**
   - Go to: `https://test.lets-speek.com` (staging) or `https://app.lets-speek.com` (prod)
   - Login with valid credentials

2. **Navigate to Community**
   - Click "Community" link
   - Should see loading screen briefly

3. **Verify Auto-Login**
   - NodeBB should load in iframe
   - User should be automatically logged in
   - Should see user avatar/name in NodeBB header

### **3. Verify Browser Console**

**Expected logs:**
```
🔑 Fetching SSO token from API...
SSO Token received: eyJhbGciOiJIUzI1NiIs...
🌐 Getting NodeBB URL from config...
NodeBB URL: https://test-community.lets-speek.com
🍪 Cookie configuration: {isHttps: true, isProduction: true}
✅ Cookie set: {domain: "Domain=.lets-speek.com;", ...}
🔍 Cookie verification: Token cookie found
🚀 Loading iframe with URL: https://test-community.lets-speek.com/?cb=...
✅ Iframe loaded successfully
Iframe contentWindow: Available
```

**No errors like:**
- ❌ "refused to connect"
- ❌ "Permissions policy violation: fullscreen"
- ❌ "Permissions policy violation: clipboard-write"

### **4. Verify Cookie in DevTools**

1. Open DevTools → Application → Cookies
2. Check for `token` cookie:
   - **Domain**: `.lets-speek.com`
   - **Path**: `/`
   - **SameSite**: `None`
   - **Secure**: `✓` (checked)
   - **Value**: JWT string (long)

### **5. Test User Experience**

- [ ] User can view topics
- [ ] User can create posts
- [ ] User can reply to posts
- [ ] User avatar/name displays correctly
- [ ] Admin users have admin privileges (if applicable)
- [ ] Logout from web app also logs out from NodeBB

---

## 🐛 **Troubleshooting**

### **Issue: "NODEBB_SESSION_SHARING_SECRET not configured"**

**Cause:** Environment variable not set in API
**Fix:** Verify Terraform applied the SSM parameter correctly

```bash
# Check SSM parameter exists
aws ssm get-parameter \
  --name "/<project>-<env>/nodebb-sso-secret" \
  --with-decryption

# Check ECS task definition has the secret
aws ecs describe-task-definition \
  --task-definition <api-task-def> \
  | jq '.taskDefinition.containerDefinitions[0].secrets'
```

### **Issue: "Token cookie NOT found!"**

**Cause:** Cookie not being set (HTTPS issue or domain mismatch)
**Fix:** 
1. Verify HTTPS is enabled
2. Check cookie domain matches (`.lets-speek.com`)
3. Verify SameSite=None requires Secure flag

### **Issue: Iframe loads but user not logged in**

**Possible Causes:**
1. **Secret mismatch** - Verify both secrets are identical
2. **Email undefined** - Check API controller includes email field
3. **Plugin not configured** - Check NodeBB logs for session-sharing config
4. **Cookie domain wrong** - Should be `.lets-speek.com` not `test.lets-speek.com`

**Debug Steps:**
```bash
# Check NodeBB database for session-sharing config
docker exec <nodebb-container> node -e "
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

### **Issue: Permissions Policy Violations**

**Cause:** Permissions-Policy not configured
**Fix:**
1. Check NodeBB logs for "✅ Permissions-Policy configured"
2. Manually set in admin panel: Settings → Advanced → Headers
3. Restart NodeBB after configuration

---

## 📊 **Environment-Specific Configuration**

### **Local Development**
```yaml
NODE_ENV: <not set or "local">
Cookie Domain: <empty> (host-only)
Host Whitelist: localhost,127.0.0.1
Permissions-Policy: fullscreen=(self "http://localhost:3000"), ...
```

### **Staging**
```yaml
NODE_ENV: staging
Cookie Domain: .lets-speek.com
Host Whitelist: test.lets-speek.com,test-community.lets-speek.com
Permissions-Policy: fullscreen=(self "https://test.lets-speek.com"), ...
```

### **Production**
```yaml
NODE_ENV: production
Cookie Domain: .lets-speek.com
Host Whitelist: lets-speek.com,app.lets-speek.com,community.lets-speek.com
Permissions-Policy: fullscreen=(self "https://app.lets-speek.com"), ...
```

---

## 🔒 **Security Checklist**

- [ ] Secrets are in AWS Secrets Manager / SSM Parameter Store
- [ ] Secrets match exactly between API and NodeBB
- [ ] HTTPS is enforced in production
- [ ] Cookie has Secure flag in production
- [ ] Host whitelist is restrictive (no wildcards)
- [ ] Admin credentials are strong and unique
- [ ] Database passwords are rotated regularly

---

## 📝 **Rollback Plan**

If session sharing doesn't work after deployment:

1. **Quick Fix:** Revert to previous ECS task definitions
   ```bash
   aws ecs update-service \
     --cluster <cluster> \
     --service <service> \
     --task-definition <previous-revision>
   ```

2. **Manual Configuration:** Set Permissions-Policy in NodeBB admin panel

3. **Full Rollback:** Revert Git commits and redeploy

---

## ✅ **Success Criteria**

Session sharing is working correctly when:

1. ✅ User logs into web app
2. ✅ Clicks "Community" 
3. ✅ NodeBB loads in iframe automatically
4. ✅ User is logged into NodeBB without prompt
5. ✅ User can interact with forum (post, reply, etc.)
6. ✅ No console errors related to cookies or permissions
7. ✅ Admin users have admin privileges in NodeBB
8. ✅ Logout from web app logs out from NodeBB

---

## 📞 **Support**

If issues persist after following this checklist:

1. Check all logs (NodeBB, API, Web frontend)
2. Verify all environment variables are set
3. Test JWT token manually at jwt.io
4. Review `SESSION_SHARING_SETUP.md` for detailed documentation
5. Check browser DevTools for cookie and network errors

---

## 🎉 **Post-Deployment Tasks**

After successful deployment:

- [ ] Document any environment-specific changes
- [ ] Update team on new community features
- [ ] Monitor error rates for first 24 hours
- [ ] Gather user feedback
- [ ] Schedule secret rotation (3-6 months)

