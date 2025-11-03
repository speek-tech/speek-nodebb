# NodeBB Admin Panel Setup for Speek Integration

## 🎯 Overview

This document provides step-by-step instructions for configuring NodeBB via the Admin Panel to enable session sharing with the Speek application.

**Required for:** First-time setup or when automated configuration via `docker-entrypoint.sh` fails.

---

## 🌍 **Environment Overview**

Speek has **4 environments** with different configurations:

| Environment | NODE_ENV | Web App URL | NodeBB URL | Cookie Domain | Note |
|-------------|----------|-------------|------------|---------------|------|
| **Local** | *(not set)* | `http://localhost:3000` | `http://localhost:4567` | *(empty)* | Docker compose on local machine |
| **Development** | `development` | `https://dev.lets-speek.com` | `https://dev-community.lets-speek.com` | `.lets-speek.com` | AWS dev environment (also supports localhost) |
| **Staging** | `staging` | `https://test.lets-speek.com` | `https://test-community.lets-speek.com` | `.lets-speek.com` | AWS staging environment |
| **Production** | `production` | `https://app.lets-speek.com` | `https://community.lets-speek.com` | `.lets-speek.com` | AWS production environment |

**Note:** Development environment supports both cloud deployment AND local development (localhost).

---

## 🔐 **Admin Panel Access**

### **URLs:**
- **Local:** `http://localhost:4567/admin`
- **Staging:** `https://test-community.lets-speek.com/admin`
- **Production:** `https://community.lets-speek.com/admin`

### **Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123` (local) or from environment variable
- **Email:** `admin@speek.local` (local) or from environment variable

⚠️ **Security:** Change these credentials immediately in production!

---

## 📋 **Step 1: Configure Session Sharing Plugin**

### **Navigation:**
```
Admin Panel → Extend → Plugins → Session Sharing
```

Or directly: `/admin/plugins/session-sharing`

### **Required Fields:**

| Field | Local | Development | Staging | Production | Description |
|-------|-------|-------------|---------|------------|-------------|
| **Base Name** | `speek` | `speek` | `speek` | `speek` | SSO application identifier |
| **Cookie Name** | `token` | `token` | `token` | `token` | Name of JWT cookie (must match frontend) |
| **Cookie Domain** | *(empty)* | `.lets-speek.com` | `.lets-speek.com` | `.lets-speek.com` | Cross-subdomain cookie sharing (note the leading dot) |
| **JWT Secret** | `a604917d...` | `<from-ssm>` | `<from-ssm>` | `<from-ssm>` | **MUST match** `NODEBB_SESSION_SHARING_SECRET` in API |
| **Host Whitelist** | `localhost,127.0.0.1` | `localhost,127.0.0.1,dev.lets-speek.com,dev-community.lets-speek.com` | `test.lets-speek.com,test-community.lets-speek.com` | `lets-speek.com,app.lets-speek.com,community.lets-speek.com` | Comma-separated allowed domains |

### **Checkbox Settings:**

| Setting | Recommended | Why |
|---------|-------------|-----|
| ☐ Apply revalidation rules to administrators | **Unchecked** (testing)<br>**Checked** (production) | Admins exempt by default; enable in prod for max security |
| ☐ Do not automatically create NodeBB accounts | **MUST be Unchecked** | ✅ CRITICAL: Allows auto-creation of SSO users |
| ☑ Automatically update profile information | **Checked** | ✅ Keeps user data synchronized |
| ☐ Allow banned users | **Unchecked** | Banned users should be completely blocked |
| ☑ Automatically join groups if present in payload | **Checked** | ✅ Enables admin privileges via `isAdmin` field |
| ☑ Automatically leave groups if not present | **Checked** | ✅ Syncs group membership changes |

### **Click:** **"Save changes"** button

---

## 📋 **Step 2: Configure Security Headers**

### **Navigation:**
```
Admin Panel → Settings → Advanced
```

Or directly: `/admin/settings/advanced`

### **Scroll to "Headers" Section**

---

### **2.1 CSP frame-ancestors**

| Field | Value |
|-------|-------|
| **Label** | Set Content-Security-Policy frame-ancestors header to Place NodeBB in an iFrame |
| **Local** | `http://localhost:3000` |
| **Development** | `http://localhost:3000 http://127.0.0.1:3000 https://dev.lets-speek.com` |
| **Staging** | `https://test.lets-speek.com` |
| **Production** | `https://app.lets-speek.com` |

**Purpose:** Allows parent page to embed NodeBB in iframe

---

### **2.2 Permissions-Policy**

| Field | Value |
|-------|-------|
| **Label** | Permissions-Policy |
| **Local** | `fullscreen=(self "http://localhost:3000"), clipboard-write=(self "http://localhost:3000"), clipboard-read=(self "http://localhost:3000")` |
| **Development** | `fullscreen=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-write=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-read=(self "http://localhost:3000" "https://dev.lets-speek.com")` |
| **Staging** | `fullscreen=(self "https://test.lets-speek.com"), clipboard-write=(self "https://test.lets-speek.com"), clipboard-read=(self "https://test.lets-speek.com")` |
| **Production** | `fullscreen=(self "https://app.lets-speek.com"), clipboard-write=(self "https://app.lets-speek.com"), clipboard-read=(self "https://app.lets-speek.com")` |

**Purpose:** Allows iframe to use fullscreen and clipboard features

---

### **2.3 Cross-Origin Policies**

#### **Cross-Origin-Embedder-Policy**
```
☑ Turn ON (Enabled/Checked)
```
**Purpose:** Enables Spectre protection and allows parent page COEP compatibility

#### **Cross-Origin-Opener-Policy**
```
Select: unsafe-none
```
**Purpose:** Allows cross-origin iframe embedding

#### **Cross-Origin-Resource-Policy**
```
Select: cross-origin
```
**Purpose:** Allows resources to be loaded from other origins

---

### **2.4 X-Frame-Options**

⚠️ **This setting is NOT directly available in admin panel**

**Status:** Should be automatically disabled when `csp-frame-ancestors` is set

**Verification:** Check response headers - should NOT contain `x-frame-options`

**If X-Frame-Options still appears:**
- Run the database cleanup command (see Troubleshooting section)
- Restart NodeBB container

### **Click:** **"Save changes"** button

---

## 📋 **Step 3: Apply Speek Custom CSS**

⚠️ **IMPORTANT:** This step must be done **manually in each environment** (Local, Development, Staging, Production). The custom CSS is NOT automatically deployed - you must copy-paste it into each NodeBB admin panel.

### **Navigation:**
```
Admin Panel → Appearance → Customise
```

Or directly: `/admin/appearance/customise`

### **3.1 Enable Custom CSS**

Scroll to the **Custom CSS** section at the bottom of the page.

### **3.2 Copy-Paste Speek Branding CSS**

**IMPORTANT:** You need to manually copy and paste the **ENTIRE** `nodebb.css` file contents into the admin panel.

**Steps:**
1. Open the file: `speek-nodebb/nodebb.css` (270 lines)
2. **Select ALL** (Ctrl+A) and copy (Ctrl+C)
3. In NodeBB Admin Panel, scroll to **"Custom CSS"** textarea
4. **Paste** the entire CSS code (Ctrl+V)
5. The textarea should now contain all 270 lines of Speek branding CSS

**What you're pasting:**
- File location: `speek-nodebb/nodebb.css`
- Lines: 270 lines of CSS
- Contents: Speek's brand colors, fonts, layout overrides, and component styling

### **Key Features of Speek Custom CSS:**

| Feature | Description |
|---------|-------------|
| **Brand Colors** | Beige background (`#efece1`), primary blue-green (`#b6d3da`), accent yellow (`#e6ff00`) |
| **Typography** | DM Sans font family (matches Speek web app) |
| **Layout** | Hides Harmony sidebars, applies Speek card/surface styling |
| **Consistency** | Makes NodeBB look integrated with Speek web app |

### **CSS Highlights:**

```css
/* Speek Brand Tokens */
--speek-bg: #efece1;           /* Page canvas (beige) */
--speek-primary: #b6d3da;      /* Primary color */
--speek-accent: #e6ff00;       /* Accent yellow */
--speek-card: #ffffff;         /* White cards */
--speek-radius: 10px;          /* Border radius */
```

### **3.3 Verify CSS is Pasted**

Before saving, verify:
- ✅ Textarea is NOT empty
- ✅ First line should be: `/* ===== Speek brand tokens ===== */`
- ✅ Contains `:root` declarations with `--speek-bg`, `--speek-primary`, etc.
- ✅ Contains approximately 270 lines

### **3.4 Save and Apply**

1. Scroll down and find **"Use Custom CSS"** toggle - **Turn it ON** (enabled)
2. Click **"Save"** button at the top
3. NodeBB will automatically apply the CSS
4. Refresh the forum page to see changes (background should turn beige)

**Expected Visual Result:**
- Background changes from white/default to beige (`#efece1`)
- Font changes to DM Sans
- Cards get rounded corners
- Harmony sidebars disappear

**Note:** 
- The CSS MUST be pasted manually in admin panel for each environment
- The `docker-entrypoint.sh` script attempts to apply `nodebb.css` automatically if mounted, but **manual admin panel configuration is the primary method**

---

## 📋 **Step 4: Verify Configuration**

### **4.1 Check Custom CSS Applied**

**Visual Verification:**
- ✅ Background is beige (`#efece1`)
- ✅ Font is DM Sans
- ✅ Cards have white background with rounded corners
- ✅ Primary color is blue-green
- ✅ Accent color is yellow
- ✅ Harmony sidebars are hidden

**Admin Panel Check:**
1. Go to: `Admin → Appearance → Customise`
2. Scroll to "Custom CSS" section
3. Should see the Speek CSS code
4. "Use Custom CSS" should be enabled

### **4.2 Check Session Sharing Settings**

Go to: `Admin → Extend → Plugins → Session Sharing`

**Verify:**
- ✅ Base Name: `speek`
- ✅ Cookie Name: `token`
- ✅ Cookie Domain: `.lets-speek.com` (production/staging) or empty (local)
- ✅ JWT Secret: Matches API secret
- ✅ Host Whitelist: Correct domains listed
- ✅ "Do not automatically create accounts" is **UNCHECKED**
- ✅ "Automatically update profile information" is **CHECKED**

### **3.2 Check Security Headers**

Go to: `Admin → Settings → Advanced → Headers`

**Verify:**
- ✅ CSP frame-ancestors: `https://app.lets-speek.com` (or test.lets-speek.com for staging)
- ✅ Permissions-Policy: Contains `fullscreen`, `clipboard-write`, `clipboard-read` for parent domain
- ✅ Cross-Origin-Embedder-Policy: **ON** (checked)
- ✅ Cross-Origin-Opener-Policy: `unsafe-none`
- ✅ Cross-Origin-Resource-Policy: `cross-origin`

---

## 📋 **Step 5: Restart NodeBB**

After making changes, restart NodeBB to apply configuration:

### **Docker:**
```bash
docker-compose restart nodebb
```

### **Standalone:**
```bash
./nodebb restart
```

**Wait ~30-60 seconds** for NodeBB to fully restart and rebuild assets.

---

## ✅ **Step 6: Test Session Sharing**

### **6.1 Test SSO Flow**

1. **Login to Speek Web App:**
   - Go to: `https://test.lets-speek.com` (staging) or `https://app.lets-speek.com` (prod)
   - Login with valid credentials

2. **Navigate to Community:**
   - Click "Community" link or go to `/community` page

3. **Expected Behavior:**
   - ✅ NodeBB loads in iframe automatically
   - ✅ User is logged into NodeBB (no login prompt)
   - ✅ User avatar/name appears in NodeBB header
   - ✅ User can post, reply, interact with forum

### **6.2 Verify in Browser DevTools**

**Console Logs (should show):**
```
🔑 Fetching SSO token from API...
✅ Cookie set: {domain: "Domain=.lets-speek.com;", ...}
🔍 Cookie verification: Token cookie found
✅ Iframe loaded successfully
Iframe contentWindow: Available
```

**Network Tab → NodeBB Request → Response Headers:**
```
✅ content-security-policy: frame-ancestors https://test.lets-speek.com
✅ cross-origin-embedder-policy: require-corp
✅ cross-origin-opener-policy: unsafe-none
✅ cross-origin-resource-policy: cross-origin
✅ permissions-policy: fullscreen=(self "https://test.lets-speek.com"), ...
❌ (NO x-frame-options header)
```

**Application → Cookies:**
```
Name: token
Value: eyJhbGciOiJIUzI1NiIs... (JWT string)
Domain: .lets-speek.com
Path: /
SameSite: None
Secure: ✓
```

---

## 🐛 **Troubleshooting**

### **Issue: User Logs In as Admin (Wrong User)**

**Cause:** `adminRevalidate` is OFF, NodeBB uses cached admin status

**Fix:**
1. Go to: `Admin → Extend → Plugins → Session Sharing`
2. Find checkbox: "Apply revalidation rules to administrators as well"
3. **Check it** (turn ON)
4. Click "Save changes"
5. Clear browser cookies and test again

### **Issue: X-Frame-Options Still Blocking**

**Cause:** Legacy config in database

**Fix via Database:**
```bash
docker exec -it <nodebb-container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  await db.deleteObjectField('config','frame-options');
  await db.deleteObjectField('config','allow-from-uri');
  console.log('✅ X-Frame-Options removed');
  await db.close();
})()
"
```

Then restart NodeBB.

### **Issue: Cookie Not Being Read**

**Possible Causes:**
1. Cookie domain mismatch
2. JWT secret mismatch
3. Cookie name wrong

**Check:**
1. Verify cookie domain has leading dot: `.lets-speek.com`
2. Verify JWT secret matches exactly between API and NodeBB
3. Verify cookie name is `token` in both frontend and NodeBB config

### **Issue: User Not Created/Matched**

**Check:**
1. "Do not automatically create accounts" is **UNCHECKED**
2. JWT contains `email` field (required for matching)
3. JWT is not expired (check `exp` claim)
4. Host whitelist includes current domain

### **Issue: Admin Status Not Updating**

**Check:**
1. "Apply revalidation rules to administrators" is **CHECKED**
2. JWT contains `isAdmin` field
3. "Automatically join/leave groups" checkboxes are both **CHECKED**

### **Issue: Permissions Violations in Console**

**Check:**
1. Permissions-Policy is set in NodeBB admin
2. Permissions-Policy in web frontend allows `https://*.lets-speek.com`
3. Both parent and iframe have compatible COEP settings

---

## 🔍 **Verification Commands**

### **Check Session-Sharing Configuration:**
```bash
docker exec <nodebb-container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  const config = await db.getObject('settings:session-sharing');
  console.log('Session Sharing Config:', JSON.stringify(config, null, 2));
  await db.close();
})()
"
```

### **Check Security Headers Configuration:**
```bash
docker exec <nodebb-container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  const config = await db.getObject('config');
  console.log('=== Security Headers Config ===');
  console.log('csp-frame-ancestors:', config['csp-frame-ancestors']);
  console.log('permissions-policy:', config['permissions-policy']);
  console.log('cross-origin-embedder-policy:', config['cross-origin-embedder-policy']);
  console.log('cross-origin-opener-policy:', config['cross-origin-opener-policy']);
  console.log('cross-origin-resource-policy:', config['cross-origin-resource-policy']);
  console.log('frame-options:', config['frame-options']);
  await db.close();
})()
"
```

### **Check Current Users:**
```bash
docker exec <nodebb-container> node -e "
const db=require('./src/database');
const nconf=require('nconf');
nconf.file({file:'config.json'});
(async()=>{
  await db.init(nconf.get('database'));
  const userIds = await db.getSortedSetRange('users:joindate', 0, 9);
  for (const uid of userIds) {
    const userData = await db.getObject('user:' + uid);
    const isAdmin = await db.isSortedSetMember('group:administrators:members', uid);
    console.log('---');
    console.log('UID:', uid);
    console.log('Username:', userData.username);
    console.log('Email:', userData.email);
    console.log('Is Admin:', isAdmin);
  }
  await db.close();
})()
"
```

---

## 🔒 **Security Checklist**

Before going to production:

- [ ] Change admin password from default `admin123`
- [ ] Verify JWT secret is strong (32+ characters)
- [ ] Enable "Apply revalidation rules to administrators"
- [ ] Set cookie domain to `.lets-speek.com` (with leading dot)
- [ ] Restrict host whitelist to only necessary domains
- [ ] Enable HTTPS (required for SameSite=None cookies)
- [ ] Verify Cross-Origin-Embedder-Policy is enabled
- [ ] Test with non-admin user account
- [ ] Test admin user account (if applicable)
- [ ] Verify banned users cannot login

---

## 📊 **Configuration Quick Reference**

### **Session Sharing Plugin Settings**

```yaml
Base Name: speek
Cookie Name: token
Cookie Domain: .lets-speek.com  # Empty for localhost
JWT Secret: a604917d01b7742cf166d7040a67e7fb29bccdda303719d5606e15acb03854d0
Host Whitelist: test.lets-speek.com,test-community.lets-speek.com

Checkboxes:
  ☐ Apply revalidation rules to administrators (ON for production)
  ☐ Do not automatically create accounts (MUST be OFF)
  ☑ Automatically update profile information (ON)
  ☐ Allow banned users (OFF)
  ☑ Automatically join groups if present in payload (ON)
  ☑ Automatically leave groups if not present (ON)
```

### **Security Headers Settings**

```yaml
CSP frame-ancestors: https://test.lets-speek.com
Permissions-Policy: fullscreen=(self "https://test.lets-speek.com"), clipboard-write=(self "https://test.lets-speek.com"), clipboard-read=(self "https://test.lets-speek.com")

Toggles:
  ☑ Cross-Origin-Embedder-Policy (ON)

Dropdowns:
  Cross-Origin-Opener-Policy: unsafe-none
  Cross-Origin-Resource-Policy: cross-origin
```

---

## 🚀 **Post-Configuration Steps**

### **1. Rebuild NodeBB Assets**
After configuration changes, rebuild assets:

**Via Admin Panel:**
```
Admin Panel → Dashboard → Rebuild & Restart
```

Or via CLI:
```bash
./nodebb build
./nodebb restart
```

### **2. Clear Browser Cache**
```
Chrome/Edge: Ctrl+Shift+R
Firefox: Ctrl+Shift+Delete → Cookies and Cache
```

### **3. Test End-to-End**
1. Login to web app
2. Navigate to community
3. Verify auto-login works
4. Test posting/replying
5. Test admin features (if applicable)

---

## 📝 **Environment-Specific Values**

### **Local (NODE_ENV not set)**

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:4567` |
| Cookie Domain | *(leave empty)* |
| Host Whitelist | `localhost,127.0.0.1` |
| Frame Ancestors | `http://localhost:3000` |
| Permissions-Policy | `fullscreen=(self "http://localhost:3000"), clipboard-write=(self "http://localhost:3000"), clipboard-read=(self "http://localhost:3000")` |

### **Development (NODE_ENV=development)**

| Setting | Value |
|---------|-------|
| Base URL | `https://dev-community.lets-speek.com` |
| Cookie Domain | `.lets-speek.com` |
| Host Whitelist | `localhost,127.0.0.1,dev.lets-speek.com,dev-community.lets-speek.com` |
| Frame Ancestors | `http://localhost:3000 http://127.0.0.1:3000 https://dev.lets-speek.com` |
| Permissions-Policy | `fullscreen=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-write=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-read=(self "http://localhost:3000" "https://dev.lets-speek.com")` |

### **Staging (NODE_ENV=staging)**

| Setting | Value |
|---------|-------|
| Base URL | `https://test-community.lets-speek.com` |
| Cookie Domain | `.lets-speek.com` |
| Host Whitelist | `test.lets-speek.com,test-community.lets-speek.com` |
| Frame Ancestors | `https://test.lets-speek.com` |
| Permissions-Policy | `fullscreen=(self "https://test.lets-speek.com"), clipboard-write=(self "https://test.lets-speek.com"), clipboard-read=(self "https://test.lets-speek.com")` |

### **Production (NODE_ENV=production)**

| Setting | Value |
|---------|-------|
| Base URL | `https://community.lets-speek.com` |
| Cookie Domain | `.lets-speek.com` |
| Host Whitelist | `lets-speek.com,app.lets-speek.com,community.lets-speek.com` |
| Frame Ancestors | `https://app.lets-speek.com` |
| Permissions-Policy | `fullscreen=(self "https://app.lets-speek.com"), clipboard-write=(self "https://app.lets-speek.com"), clipboard-read=(self "https://app.lets-speek.com")` |

---

## 🎯 **Common Mistakes to Avoid**

| Mistake | Impact | Correct Value |
|---------|--------|---------------|
| Forgot leading dot in cookie domain | Cookie not shared across subdomains | `.lets-speek.com` not `lets-speek.com` |
| "Do not create accounts" is checked | New users can't login | Must be **unchecked** |
| JWT secret doesn't match API | Token validation fails | Must be **identical** |
| Wrong domain in host whitelist | Requests blocked | Must match actual domains |
| X-Frame-Options not disabled | Iframe blocked | Remove via database command |
| COEP not enabled | Parent page blocks iframe | Must be **enabled** |

---

## 📞 **Getting Help**

### **Check Logs:**
```bash
# Docker
docker-compose logs nodebb | tail -100

# Find errors
docker-compose logs nodebb | grep -i "error\|warning\|session-sharing"
```

### **Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid JWT signature" | Secret mismatch | Verify secrets match exactly |
| "User not found" | Email mismatch or auto-create disabled | Check "Do not create accounts" is OFF |
| "refused to connect" | X-Frame-Options or CSP blocking | Check frame-ancestors is set correctly |
| "Permissions policy violation" | Permissions-Policy missing | Configure in admin panel |

---

## ✅ **Success Indicators**

You'll know session sharing is working when:

1. ✅ User logs into web app
2. ✅ Clicks "Community" link
3. ✅ NodeBB loads in iframe (no errors)
4. ✅ User is automatically logged in (no login prompt)
5. ✅ User can interact with forum (post, reply, etc.)
6. ✅ User avatar/name shows in NodeBB
7. ✅ Admin status correctly reflects JWT `isAdmin` field
8. ✅ No console errors about cookies, CORS, or permissions

---

## 🔧 **Advanced: Reset Configuration**

If you need to completely reset and reconfigure:

```bash
# Stop NodeBB
docker-compose down

# Remove NodeBB data (⚠️ This deletes all forum data!)
docker volume rm speek-nodebb_nodebb_data

# Remove database (⚠️ This deletes all users/posts!)
docker volume rm speek-nodebb_postgres_data

# Start fresh
docker-compose up -d --build
```

**Note:** Only do this in development! In production, fix configuration without deleting data.

---

## 📝 **Custom CSS File Reference**

### **File Location:**
```
speek-nodebb/nodebb.css
```

### **Key Components:**

| Section | Purpose | Lines |
|---------|---------|-------|
| **Brand Tokens** | CSS variables for Speek colors, spacing, borders | 1-29 |
| **Global Canvas** | Applies beige background to all major containers | 40-59 |
| **Typography** | DM Sans font family | 61-64 |
| **Header/Navbar** | Speek-branded navigation bar | 66-92 |
| **Sidebars** | Beige background with white card widgets | 94-119 |
| **Surfaces** | White cards with Speek borders and shadows | 120-134 |
| **Buttons** | Speek primary colors and styling | 140-153 |
| **Forms** | Input fields with Speek styling | 155-168 |
| **Hide Elements** | Hides Harmony sidebars and bottom bar | 258-268 |

### **How It's Applied:**

**Primary Method (Manual via Admin Panel):**
1. Copy entire contents of `nodebb.css` file (270 lines)
2. Paste into Admin → Appearance → Customise → Custom CSS textarea
3. Enable "Use Custom CSS" toggle
4. Click "Save"
5. Changes apply immediately
6. **Required for each environment** (Local, Dev, Staging, Production)

**Automated Method (Backup):**
- The `docker-entrypoint.sh` script (lines 260-264) attempts to apply `/app/nodebb.css` automatically
- This is a fallback mechanism
- **Primary method is still manual admin panel paste**

### **Updating Custom CSS:**

**Standard Workflow:**
1. Edit `speek-nodebb/nodebb.css` file in repository
2. Copy the updated CSS
3. Paste into NodeBB Admin Panel → Appearance → Customise
4. Save in admin panel
5. Commit the file changes to repository

**For Each Environment:**
- You must paste the CSS manually in each NodeBB instance
- Local environment: Paste in local NodeBB admin
- Development: Paste in dev-community.lets-speek.com admin
- Staging: Paste in test-community.lets-speek.com admin  
- Production: Paste in community.lets-speek.com admin

**Note:** The CSS configuration is stored in NodeBB's database, so it persists across container restarts once saved via admin panel.

---

## 📚 **Related Documentation**

- `SESSION_SHARING_SETUP.md` - Complete technical guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment procedures
- `FINAL_REVIEW_CHECKLIST.md` - Configuration verification

---

## 🚀 **Quick Copy-Paste Reference**

### **For Staging Environment:**

**Session Sharing Plugin:**
```
Base Name: speek
Cookie Name: token
Cookie Domain: .lets-speek.com
JWT Secret: <from-aws-ssm-parameter>
Host Whitelist: test.lets-speek.com,test-community.lets-speek.com
```

**Security Headers:**
```
CSP frame-ancestors: https://test.lets-speek.com
Permissions-Policy: fullscreen=(self "https://test.lets-speek.com"), clipboard-write=(self "https://test.lets-speek.com"), clipboard-read=(self "https://test.lets-speek.com")

Toggles:
  ☑ Cross-Origin-Embedder-Policy: ON
  
Dropdowns:
  Cross-Origin-Opener-Policy: unsafe-none
  Cross-Origin-Resource-Policy: cross-origin
```

### **For Production Environment:**

**Session Sharing Plugin:**
```
Base Name: speek
Cookie Name: token
Cookie Domain: .lets-speek.com
JWT Secret: <from-aws-ssm-parameter>
Host Whitelist: lets-speek.com,app.lets-speek.com,community.lets-speek.com
```

**Security Headers:**
```
CSP frame-ancestors: https://app.lets-speek.com
Permissions-Policy: fullscreen=(self "https://app.lets-speek.com"), clipboard-write=(self "https://app.lets-speek.com"), clipboard-read=(self "https://app.lets-speek.com")

Toggles:
  ☑ Cross-Origin-Embedder-Policy: ON
  
Dropdowns:
  Cross-Origin-Opener-Policy: unsafe-none
  Cross-Origin-Resource-Policy: cross-origin
```

### **For Development Environment:**

**Session Sharing Plugin:**
```
Base Name: speek
Cookie Name: token
Cookie Domain: .lets-speek.com
JWT Secret: <from-aws-ssm-parameter>
Host Whitelist: localhost,127.0.0.1,dev.lets-speek.com,dev-community.lets-speek.com
```

**Security Headers:**
```
CSP frame-ancestors: http://localhost:3000 http://127.0.0.1:3000 https://dev.lets-speek.com
Permissions-Policy: fullscreen=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-write=(self "http://localhost:3000" "https://dev.lets-speek.com"), clipboard-read=(self "http://localhost:3000" "https://dev.lets-speek.com")

Toggles:
  ☑ Cross-Origin-Embedder-Policy: ON
  
Dropdowns:
  Cross-Origin-Opener-Policy: unsafe-none
  Cross-Origin-Resource-Policy: cross-origin
```

---

**Last Updated:** October 28, 2025  
**Version:** 1.0  
**Maintained By:** Speek Development Team

