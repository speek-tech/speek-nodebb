# Lucide Icons - Quick Start Guide

## 🚀 Quick Usage

### In Templates (.tpl files)

```html
<!-- Basic icon -->
{buildLucideIcon("home", 24)}

<!-- Icon with class -->
{buildLucideIcon("arrow-right", 16, "ms-2")}

<!-- Icon with color -->
{buildLucideIcon("heart", 20, "text-danger")}

<!-- Full customization -->
{buildLucideIcon("settings", 18, "me-1", "#FF0000", 2)}
```

### In JavaScript

```javascript
require(['lucideHelper'], function(lucideHelper) {
    // Create icon
    const $icon = lucideHelper.create('home', { size: 24 });
    $('#element').append($icon);
    
    // Refresh all icons after dynamic content
    lucideHelper.refresh();
});
```

## 🔄 Quick Migration Pattern

### Before (FontAwesome)
```html
<i class="fa fa-arrow-right"></i>
```

### After (Lucide)
```html
{buildLucideIcon("arrow-right", 16)}
```

## 📝 Common Icon Names

| Action | Lucide Name |
|--------|-------------|
| Home | `home` |
| User | `user` |
| Settings | `settings` |
| Search | `search` |
| Mail | `mail` |
| Menu | `menu` |
| Close/X | `x` |
| Check | `check` |
| Plus | `plus` |
| Minus | `minus` |
| Trash | `trash-2` |
| Edit | `edit` |
| Arrow Right | `arrow-right` |
| Arrow Left | `arrow-left` |
| Info | `info` |
| Warning | `alert-triangle` |
| Error | `alert-circle` |
| Success | `check-circle` |

## 🎯 Template Helper Signature

```javascript
buildLucideIcon(iconName, size, className, color, strokeWidth)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `iconName` | string | required | Icon name (e.g., "home") |
| `size` | number | 24 | Icon size in pixels |
| `className` | string | "" | Additional CSS classes |
| `color` | string | "currentColor" | Icon color |
| `strokeWidth` | number | 2 | Stroke width |

## 🔍 Find All Icons

Browse all available icons: https://lucide.dev/icons

## 🐛 Troubleshooting

### Icons not showing?
1. Check browser console for errors
2. Verify Lucide CDN is loaded (check Network tab)
3. Try refreshing icons: `window.lucide.createIcons()`

### Icon name not working?
1. Check if it's a FontAwesome name (needs conversion)
2. Browse Lucide icon library for correct name
3. Check spelling and use kebab-case (e.g., "arrow-right")

## 📚 More Resources

- Full Migration Guide: `LUCIDE_MIGRATION_GUIDE.md`
- Helper Module: `public/src/modules/lucideHelper.js`
- Template Helper: `public/src/modules/helpers.common.js`
- Lucide Docs: https://lucide.dev/

---

**Need Help?** Check the migration guide or open an issue.

