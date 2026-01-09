# NodeBB Slack Notify Plugin

Send real-time Slack notifications when users create new topics or post replies in your NodeBB forum.

## Features

- 🔔 Notifications for new topics
- 💬 Notifications for replies
- ⚙️ Configurable via Admin Panel
- 🎨 Rich Slack message formatting with buttons
- 🛡️ Non-blocking (won't disrupt post creation if Slack is down)
- 📊 Customizable content preview length

## Installation

The plugin is already installed in this NodeBB instance via local file reference in `package.json`:

```json
"nodebb-plugin-slack-notify": "file:plugins/nodebb-plugin-slack-notify"
```

### Next Steps

1. **Build NodeBB** (required for new plugins):
   ```bash
   cd speek-nodebb
   ./nodebb build
   ```

2. **Restart NodeBB**:
   ```bash
   ./nodebb restart
   ```

3. **Activate the Plugin**:
   - Navigate to: **Admin Panel > Extend > Plugins**
   - Find "Slack Notify" in the list
   - Click "Activate"
   - Rebuild & Restart when prompted

## Configuration

### 1. Create Slack Webhook

Before configuring the plugin, you need to create a Slack Incoming Webhook:

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create a new app or select an existing one
3. Navigate to **"Incoming Webhooks"** in the left sidebar
4. Toggle **"Activate Incoming Webhooks"** to ON
5. Click **"Add New Webhook to Workspace"**
6. Select the channel where notifications should be posted
7. Click **"Allow"**
8. Copy the Webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

### 2. Configure Plugin in NodeBB

1. Navigate to: **Admin Panel > Plugins > Slack Notify**
2. Paste your Slack Webhook URL
3. Enable notifications for:
   - ✅ New Topics
   - ✅ Replies
4. Set content preview length (default: 200 characters)
5. Click **"Save Settings"**
6. Click **"Send Test Notification"** to verify it works
7. Check your Slack channel for the test message

## Notification Format

### New Topic Notification
```
👤 username created a new topic in Category Name
Topic Title
[content preview...]
[View Topic] button
```

### Reply Notification
```
💬 username replied to Topic Title in Category Name
[reply content preview...]
[View Reply] button
```

## Troubleshooting

### Plugin not appearing in Admin Panel
- Make sure you ran `./nodebb build` after installation
- Restart NodeBB with `./nodebb restart`
- Check NodeBB logs for any errors

### Notifications not sending
- Verify the Webhook URL is correct
- Check NodeBB logs for `[slack-notify]` messages
- Try the "Send Test Notification" button in plugin settings
- Ensure the Slack app has permission to post to the channel

### Checking Logs
```bash
# View NodeBB logs
tail -f speek-nodebb/logs/output.log

# Look for messages like:
# [slack-notify] Plugin initializing...
# [slack-notify] Settings loaded successfully
# [slack-notify] Notification sent for post PID: 12345
# [slack-notify] Failed to send notification: [error details]
```

## Technical Details

### Hooks Used
- `static:app.load` - Initialize plugin and load settings
- `action:post.save` - Triggered when posts/replies are saved
- `filter:admin.header.build` - Add admin navigation menu item

### Settings Storage
Settings are stored in NodeBB's database using the `meta.settings` API with hash `slack-notify`.

### Error Handling
The plugin uses a "fail silent" approach - if Slack notifications fail, the error is logged but post creation continues normally. This ensures forum functionality is never disrupted by Slack issues.

## Development

### File Structure
```
plugins/nodebb-plugin-slack-notify/
├── plugin.json                           # Plugin metadata and hooks
├── library.js                           # Main plugin logic
├── package.json                         # NPM package info
├── README.md                            # This file
└── static/
    └── templates/
        └── admin/
            └── plugins/
                └── slack-notify.tpl     # Admin settings UI
```

### Modifying the Plugin
After making changes to the plugin code:
```bash
./nodebb build
./nodebb restart
```

## License

MIT

## Support

For issues or questions, check the NodeBB logs or contact the development team.
