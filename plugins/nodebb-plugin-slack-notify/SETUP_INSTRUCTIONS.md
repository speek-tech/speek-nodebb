# 🚀 Quick Setup Guide - Slack Notifications for NodeBB

## ✅ What's Already Done

The plugin has been successfully installed and configured:
- ✅ Plugin files created in `speek-nodebb/plugins/nodebb-plugin-slack-notify/`
- ✅ Added to `package.json` as `"nodebb-plugin-slack-notify": "file:plugins/nodebb-plugin-slack-notify"`
- ✅ Dependencies installed with `npm install`

## 📋 What You Need to Do Next

### Step 1: Build and Restart NodeBB (5 minutes)

```bash
cd speek-nodebb

# Build NodeBB to recognize the new plugin
./nodebb build

# Restart NodeBB
./nodebb restart

# Or if using Docker:
docker-compose restart nodebb
```

**Expected output:** NodeBB should start successfully and load the plugin.

### Step 2: Activate the Plugin (2 minutes)

1. Open your NodeBB admin panel (usually at `https://your-domain.com/admin`)
2. Go to: **Extend > Plugins**
3. Find **"Slack Notify"** in the plugins list
4. Click the **"Activate"** button
5. When prompted, click **"Rebuild & Restart"**
6. Wait for NodeBB to restart

**Visual guide:**
```
Admin Panel
  └─ Extend
      └─ Plugins
          └─ Slack Notify [Activate] ← Click here
```

### Step 3: Create Slack Webhook (5 minutes)

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** or select an existing app
3. Choose **"From scratch"**
4. Enter app name: "NodeBB Notifications" (or your choice)
5. Select your Slack workspace
6. Click **"Create App"**

7. In the left sidebar, click **"Incoming Webhooks"**
8. Toggle **"Activate Incoming Webhooks"** to **ON**
9. Click **"Add New Webhook to Workspace"**
10. Select the channel (e.g., `#community-activity`, `#forum-notifications`)
11. Click **"Allow"**

12. **Copy the Webhook URL** - it looks like:
    ```
    https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
    ```

### Step 4: Configure Plugin in NodeBB (2 minutes)

1. In NodeBB admin, go to: **Plugins > Slack Notify**
2. Paste your **Slack Webhook URL** in the "Webhook URL" field
3. Enable notifications:
   - ✅ Check **"Notify on New Topics"**
   - ✅ Check **"Notify on Replies"**
4. Set **"Content Preview Length"** to **200** (or your preference)
5. Click **"Save Settings"**

### Step 5: Test the Integration (1 minute)

**Option A: Use the Test Button**
1. In the plugin settings page, click **"Send Test Notification"**
2. Check your Slack channel - you should see: "🧪 Test Notification"
3. If you see it, you're done! ✅

**Option B: Create a Real Post**
1. Go to your NodeBB forum
2. Create a new topic or reply to an existing one
3. Check your Slack channel for the notification
4. You should see a formatted message with:
   - Author name
   - Topic title
   - Content preview
   - "View Topic" or "View Reply" button

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Test notification appears in Slack
- ✅ New posts trigger Slack notifications
- ✅ Replies trigger Slack notifications
- ✅ NodeBB logs show: `[slack-notify] Notification sent for post PID: xxxxx`

## 📊 Verification Checklist

- [ ] NodeBB rebuilt successfully
- [ ] NodeBB restarted without errors
- [ ] Plugin appears in Plugins list
- [ ] Plugin is activated
- [ ] Slack webhook created
- [ ] Webhook URL configured in plugin settings
- [ ] Settings saved
- [ ] Test notification sent successfully
- [ ] Test notification received in Slack
- [ ] Real post notification works

## 🐛 Troubleshooting

### Plugin doesn't appear in admin panel
```bash
# Rebuild and restart
./nodebb build
./nodebb restart

# Check logs
tail -f logs/output.log | grep slack-notify
```

### Test notification fails
- ✅ Verify webhook URL is correct (no extra spaces)
- ✅ Check that Slack app has permission to post
- ✅ Try creating a new webhook
- ✅ Check browser console for errors (F12)

### Notifications not sending
Check NodeBB logs:
```bash
cd speek-nodebb
tail -f logs/output.log | grep slack-notify

# Should see:
# [slack-notify] Plugin initializing...
# [slack-notify] Settings loaded successfully
# [slack-notify] Notification sent for post PID: 12345
```

### Common issues:
1. **Webhook URL is empty** → Configure it in plugin settings
2. **Plugin not activated** → Go to Extend > Plugins and activate
3. **NodeBB not rebuilt** → Run `./nodebb build` and restart
4. **Slack app lacks permissions** → Reinstall webhook with correct permissions

## 📝 Configuration Options Explained

| Setting | Description | Default |
|---------|-------------|---------|
| Webhook URL | Your Slack incoming webhook URL | (empty) |
| Notify on New Topics | Send notification when user creates new topic | ✅ Enabled |
| Notify on Replies | Send notification when user replies to topic | ✅ Enabled |
| Content Preview Length | Max characters in notification preview | 200 |

## 🎨 Customizing Notifications

To customize the notification format, edit:
```
plugins/nodebb-plugin-slack-notify/library.js
```

Look for the `formatSlackMessage` function around line 80.

After changes:
```bash
./nodebb build
./nodebb restart
```

## 📞 Need Help?

If you encounter issues:
1. Check NodeBB logs: `tail -f speek-nodebb/logs/output.log`
2. Look for `[slack-notify]` log entries
3. Verify webhook URL at https://api.slack.com/apps
4. Check Slack channel permissions

---

**Estimated total setup time: ~15 minutes**

**Status:** Plugin code is complete and installed. Manual configuration steps required above.
