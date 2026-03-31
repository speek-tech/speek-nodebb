# Admin Control Panel (ACP) — Essential Settings

This guide documents the **minimum ACP settings** we consider essential for a healthy Speek ↔ NodeBB environment.

All settings in this document are mandatory and must be configured in every environment.

---

## Access

- **Admin URL**:
  - Local: `http://localhost:4567/admin`
  - Dev: `https://dev-community.lets-speek.com/admin`
  - Staging: `https://test-community.lets-speek.com/admin`
  - Production: `https://community.lets-speek.com/admin`

---

## 1) Security & Accounts

### Required

- **Change default admin credentials**
  - Default: `admin` / `admin123`
  - Do this immediately in staging/production.

### Recommended

- **Create a second admin** (named human account) and reduce reliance on the default `admin` user.
- **Disable or tightly restrict new registrations** if your environment expects SSO-only access.

---

## 2) Categories

**ACP → Manage → Categories**

### Mandatory

- Ensure categories match the Speek community structure (no accidental default/test categories in staging/production).

### Current categories

- `Introductions`
- `Supporting my child`
- `Navigating pubi systems`
- `Looking after myself`

### Category edit screenshots

![NodeBB ACP - Edit Category - Introductions](images/nodebb-acp-category-introductions-edit.png)
![NodeBB ACP - Edit Category - Supporting my child](images/nodebb-acp-category-supporting-my-child-edit.png)
![NodeBB ACP - Edit Category - Navigating public systems](images/nodebb-acp-category-navigating-public-systems-edit.png)
![NodeBB ACP - Edit Category - Looking after myself](images/nodebb-acp-category-looking-after-myself-edit.png)

### Mandatory checks per category

- Correct **Category Name**
- Correct **Category Handle**
- Correct **Category Description**
- Correct **Icon**
- Correct **Background Color**
- Correct ordering in the list

---

## 3) General Settings

**ACP → Settings → General**

![NodeBB ACP - General Settings](images/nodebb-acp-settings-general.png)

### Required

- Confirm **Site Title / Site Description** and branding are correct per environment.
- Confirm **Site Title in Header** is disabled.
- Confirm **Site URL** matches the deployed environment domain.

---

## 4) Default Notification Settings

**ACP → Settings → Users → Default notifications settings**

![NodeBB ACP - Default Notification Settings](images/nodebb-acp-settings-user-default-notifications.png)

### Recommended

- Review defaults for new users so they’re not overly noisy (or overly silent) for your community.
- If you rely on email notifications, ensure defaults make sense alongside your email configuration.

---

## 5) Post Restrictions

**ACP → Settings → Posts → Post Restrictions**

![NodeBB ACP - Posts → Post Restrictions](images/nodebb-acp-settings-posts-post-restrictions.png)

### Mandatory (especially in production)

- Set reasonable anti-abuse limits (rate limits, minimum intervals, etc.) appropriate for your traffic profile.
- Review any restrictions that could break legitimate usage (e.g., too strict limits impacting normal replies).
- Configure the following values in **Posting Restrictions**:
  - **Title Length**: Min `3`, Max `255`
  - **Comment Length**: Min `2`, Max `32767`
  - **Number of seconds between comments**: `0`
  - **Seconds a comment remains editable** (set to `0` to disable): `0`
  - **Seconds a comment remains deletable** (set to `0` to disable): `0`
  - **# of replies after which users are disallowed to delete their own posts** (set to `0` to disable): `0`
  - **Days until post is considered stale**: `60`

---

## 6) Unread & Recent Settings

**ACP → Settings → Posts → Unread & Recent Settings**

### Mandatory

- Tune “unread” and “recent” behavior to match how you want activity to surface for members.

---

## 7) Plugins (Enablement & Health)

**ACP → Extend → Plugins**

### Required

- Confirm required plugins are **installed and activated**, especially:
  - **Session Sharing** (see below)

### Recommended

- After enabling/disabling plugins, restart NodeBB and re-test the SSO + iframe flow.

---

## 8) Speek SSO / Session Sharing (Plugin)

**ACP → Extend → Plugins → Session Sharing**

### Required settings

| Field | Value | Notes |
|-------|-------|-------|
| Base Name | `speek` | |
| Cookie Name | `token` | Must match the web app cookie |
| Cookie Domain | See env table in [Setup Guide](SETUP.md) | Leading dot required for cloud |
| JWT Secret | `<from-env>` | Must match API secret exactly |
| Host Whitelist | See [Setup Guide](SETUP.md) | Comma-separated domains |

### Required checkboxes

- ☐ Do not automatically create accounts **→ MUST BE UNCHECKED**
- ☑ Automatically update profile information **→ CHECK**
- ☑ Automatically join groups if present **→ CHECK**
- ☑ Automatically leave groups if not present **→ CHECK**

> Full environment-specific values and verification steps live in the [Setup Guide](SETUP.md).

---

## 9) Iframe + Security Headers (Embedding NodeBB in Speek)

**ACP → Settings → Advanced → Headers**

### Required

- **CSP `frame-ancestors`**: set per-environment (see [Setup Guide](SETUP.md))
- **Permissions-Policy**: set per-environment (see [Setup Guide](SETUP.md))
- **Cross-Origin settings**:
  - Cross-Origin-Embedder-Policy: **ON**
  - Cross-Origin-Opener-Policy: `unsafe-none`
  - Cross-Origin-Resource-Policy: `cross-origin`

### Required verification

In browser DevTools for a NodeBB page, verify:

- `content-security-policy` includes `frame-ancestors` pointing at the Speek app origin
- **No** `x-frame-options` header is present

---

## 10) Appearance (Speek Styling)

### Required

**ACP → Appearance → Customise**

1. Copy all contents from `speek-nodebb/nodebb.css`
2. Paste into **Custom CSS**
3. Enable **Use Custom CSS**
4. Click **Save**

**Must be applied separately in each environment.**

---

## 11) Custom Content (HTML / JS / CSS)

**ACP → Appearance → Custom Content (HTML/JS/CSS)**

### Recommended

- If you inject any custom HTML/JS/CSS here, treat it like production code:
  - Keep it minimal
  - Validate it per environment
  - Re-check after NodeBB/theme/plugin upgrades

> For Speek styling, the canonical approach is **Custom CSS** via Appearance → Customise (above).

---

## 12) Pagination

**ACP → Settings → Pagination**

### Recommended

- Set topics/posts per page to balance usability and performance.

---

## 13) Email (Password resets, admin notifications)

### Recommended

Configure outbound email so operational workflows don’t silently fail.

- **ACP → Settings → Email**
  - Ensure SMTP is configured for staging/production
  - Send a test email after changes

If you operate SSO-only, password resets may be less important, but **admin alerts still rely on email**.

---

## 14) Registration, Moderation, and Spam Controls

### Recommended (especially in production)

- **ACP → Settings → User**
  - Restrict registrations if you do not want public signups
  - Ensure “require email verification” matches your intended flow

- **ACP → Manage → Registration Queue / IP Blacklist / Banned** (as applicable)
  - Monitor spikes in signups and ban/blacklist quickly

---

## 15) Groups & Privileges (minimum sanity checks)

### Required

If Speek assigns roles via groups, ensure the groups exist and permissions are correct.

- **ACP → Manage → Groups**
  - Confirm expected groups are present (e.g., members/moderators)

- **ACP → Manage → Privileges**
  - Confirm non-admin users can access categories they should, and cannot access categories they shouldn’t

### Recommended

- Keep category creation and global moderation limited to trusted groups only.

---

## 16) Uploads & Performance Safety

### Recommended

- **ACP → Settings → Posts**
  - Review maximum post length and rate limits to reduce abuse

- **ACP → Settings → Uploads**
  - Set reasonable limits for file size and image uploads
  - Prefer HTTPS-only external image proxying if enabled in your environment

---

## Quick Audit Checklist (per environment)

- [ ] Admin password changed, at least two admin accounts exist
- [ ] Categories and category privileges reviewed
- [ ] General settings (site title + site URL) verified
- [ ] Required plugins enabled (incl. Session Sharing)
- [ ] Session Sharing plugin configured and secrets match API
- [ ] `frame-ancestors` set correctly; no `x-frame-options`
- [ ] Custom CSS applied and enabled
- [ ] Any Appearance → Custom Content reviewed (or empty)
- [ ] Posts settings reviewed (restrictions + unread/recent)
- [ ] Pagination reviewed
- [ ] SMTP configured (staging/prod)
- [ ] Registration and spam controls match intended access model
- [ ] Groups/privileges reviewed for least privilege
- [ ] Upload and rate limits reviewed

