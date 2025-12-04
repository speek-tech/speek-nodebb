# Lucide Icons Migration Guide

## Overview

This document explains the migration from FontAwesome to Lucide icons in the NodeBB application.

## What Was Done

### 1. ✅ Installed Lucide Package
- Added `lucide` package to `package.json`
- Using CDN version for browser compatibility with AMD modules

### 2. ✅ Created Global Helper Module
- **File**: `public/src/modules/lucideHelper.js`
- **Purpose**: AMD module for creating and managing Lucide icons on the client side
- **Features**:
  - Create icons dynamically
  - Replace elements with icons
  - Convert FontAwesome names to Lucide equivalents
  - Auto-initialize icons on page load

### 3. ✅ Added Template Helper
- **File**: `public/src/modules/helpers.common.js`
- **Function**: `buildLucideIcon(iconName, size, className, color, strokeWidth)`
- **Usage in templates**: `{buildLucideIcon("arrow-right", 16, "ms-1")}`
- **Features**: Automatic FontAwesome to Lucide name conversion

### 4. ✅ Integrated Lucide CDN
- **File**: `src/views/partials/footer/js.tpl`
- Loads Lucide from CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- Auto-initializes icons on:
  - Page load
  - AJAX navigation (`action:ajaxify.end`)
  - Posts loaded (`action:posts.loaded`)
  - Chat messages (`action:chat.received`)

### 5. ✅ Updated Categories Template
- **File**: `src/views/categories.tpl`
- Replaced: `<i class="fa fa-arrow-right"></i>`
- With: `{buildLucideIcon("arrow-right", 16, "ms-1")}`

### 6. ✅ Category Icon Migration (January 2025)
- **Admin Panel**: New Lucide icon picker for category management
- **Database Migration**: Automatic conversion of existing FA icons to Lucide
- **Templates**: Category icons now use `buildLucideIcon()` via `buildCategoryIcon()`
- **Web Integration**: Dynamic icon loading from API using `lucideIconMapper`
- **Documentation**: See `CATEGORY_ICON_MIGRATION.md` for details

## How to Use

### In Templates (.tpl files)

#### Basic Usage
```html
{buildLucideIcon("home", 24)}
```

#### With Custom Size and Class
```html
{buildLucideIcon("arrow-right", 16, "ms-2")}
```

#### With Color and Stroke Width
```html
{buildLucideIcon("user", 20, "me-1", "#FF0000", 2.5)}
```

### In JavaScript (Client-side)

#### Load the Helper Module
```javascript
require(['lucideHelper'], function(lucideHelper) {
    // Create an icon
    const $icon = lucideHelper.create('home', {
        size: 24,
        color: 'currentColor',
        strokeWidth: 2,
        className: 'my-icon'
    });
    
    // Add to element
    $('#myElement').append($icon);
    
    // Refresh all icons on page
    lucideHelper.refresh();
});
```

#### Convert FontAwesome Names
```javascript
require(['lucideHelper'], function(lucideHelper) {
    // Will convert 'fa-home' to 'home'
    const iconName = lucideHelper.fromFontAwesome('fa-home');
    const $icon = lucideHelper.create(iconName);
});
```

## FontAwesome to Lucide Mapping

### Common Icon Conversions

| FontAwesome | Lucide |
|------------|--------|
| `fa-home` | `home` |
| `fa-user` | `user` |
| `fa-users` | `users` |
| `fa-cog` / `fa-gear` | `settings` |
| `fa-search` | `search` |
| `fa-envelope` | `mail` |
| `fa-bell` | `bell` |
| `fa-heart` | `heart` |
| `fa-star` | `star` |
| `fa-bars` | `menu` |
| `fa-times` / `fa-xmark` | `x` |
| `fa-check` | `check` |
| `fa-plus` | `plus` |
| `fa-minus` | `minus` |
| `fa-trash` | `trash-2` |
| `fa-edit` / `fa-pen` | `edit` |
| `fa-share` | `share-2` |
| `fa-arrow-right` | `arrow-right` |
| `fa-arrow-left` | `arrow-left` |
| `fa-chevron-right` | `chevron-right` |
| `fa-chevron-left` | `chevron-left` |
| `fa-info-circle` | `info` |
| `fa-question-circle` | `help-circle` |
| `fa-exclamation-circle` | `alert-circle` |
| `fa-exclamation-triangle` | `alert-triangle` |
| `fa-check-circle` | `check-circle` |
| `fa-times-circle` | `x-circle` |
| `fa-lock` | `lock` |
| `fa-unlock` | `unlock` |
| `fa-eye` | `eye` |
| `fa-eye-slash` | `eye-off` |
| `fa-calendar` | `calendar` |
| `fa-clock` | `clock` |
| `fa-comment` | `message-circle` |
| `fa-comments` | `message-square` |
| `fa-file` | `file` |
| `fa-folder` | `folder` |
| `fa-image` | `image` |
| `fa-camera` | `camera` |
| `fa-video` | `video` |
| `fa-download` | `download` |
| `fa-upload` | `upload` |
| `fa-link` | `link` |
| `fa-thumbtack` | `pin` |
| `fa-bookmark` | `bookmark` |
| `fa-flag` | `flag` |
| `fa-tag` | `tag` |
| `fa-phone` | `phone` |
| `fa-globe` | `globe` |
| `fa-map-marker` | `map-pin` |
| `fa-filter` | `filter` |
| `fa-sort` | `arrow-up-down` |
| `fa-list` | `list` |
| `fa-play` | `play` |
| `fa-pause` | `pause` |
| `fa-refresh` | `refresh-cw` |
| `fa-sign-out` | `log-out` |
| `fa-sign-in` | `log-in` |
| `fa-code` | `code` |
| `fa-database` | `database` |
| `fa-cloud` | `cloud` |

*For a complete list, see the `faToLucideMap` in `public/src/modules/lucideHelper.js` or `public/src/modules/helpers.common.js`*

## Migration Strategy

### Phase 1: Infrastructure (✅ COMPLETED)
- [x] Install Lucide package
- [x] Create helper modules
- [x] Add CDN integration
- [x] Add template helper function

### Phase 2: Template Migration (🔄 IN PROGRESS)
- [x] Categories page
- [ ] Navigation menus
- [ ] Chat interface
- [ ] Topic pages
- [ ] User profiles
- [ ] Admin panels
- [ ] Settings pages

### Phase 3: JavaScript Migration (⏳ PENDING)
- [ ] Client-side scripts
- [ ] Admin scripts
- [ ] Module files
- [ ] Plugin compatibility

### Phase 4: Cleanup (⏳ PENDING)
- [ ] Remove FontAwesome SCSS imports
- [ ] Remove FontAwesome from package.json
- [ ] Update documentation

## Template Files Requiring Update

### High Priority (User-facing)
- ✅ `src/views/categories.tpl`
- ⏳ `src/views/register.tpl`
- ⏳ `src/views/login.tpl`
- ⏳ `src/views/partials/chats/*.tpl`
- ⏳ `src/views/partials/topic/*.tpl`
- ⏳ `src/views/partials/category/*.tpl`

### Medium Priority (Admin)
- ⏳ `src/views/admin/*.tpl`
- ⏳ `src/views/admin/partials/*.tpl`

### Low Priority (Emails & Less Visible)
- ⏳ `src/views/emails/*.tpl`
- ⏳ `src/views/modals/*.tpl`

## Testing Checklist

### Visual Testing
- [ ] Categories page icons render correctly
- [ ] Icons maintain proper sizing
- [ ] Icons maintain proper colors
- [ ] Icons work on all pages
- [ ] Icons work after AJAX navigation
- [ ] Icons work in chat
- [ ] Icons work in admin panel

### Functional Testing
- [ ] Icon picker still works
- [ ] Category icons display correctly
- [ ] User interface remains responsive
- [ ] No console errors
- [ ] Performance is acceptable

### Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Benefits of Lucide

### Advantages
✅ **Smaller bundle size** - Only icons you use are loaded
✅ **Modern design** - Clean, consistent icon style
✅ **Open source** - MIT licensed, community-driven
✅ **Tree-shakeable** - Better performance
✅ **Regular updates** - Active development
✅ **Better accessibility** - Built with a11y in mind
✅ **Customizable** - Easy to style with CSS/props

### Considerations
⚠️ **Learning curve** - Different icon names
⚠️ **Migration effort** - Need to update 779 usages
⚠️ **Plugin compatibility** - Plugins may still use FontAwesome

## Rollback Plan

If issues arise:

1. **Remove Lucide CDN** from `src/views/partials/footer/js.tpl`
2. **Revert template changes** using git
3. **Keep FontAwesome** in package.json
4. **File issues** for future retry

## Resources

- **Lucide Documentation**: https://lucide.dev/
- **Lucide Icons Browser**: https://lucide.dev/icons
- **Lucide React Guide**: https://lucide.dev/guide/packages/lucide-react
- **Lucide GitHub**: https://github.com/lucide-icons/lucide

## Support

For questions or issues:
1. Check this migration guide
2. Browse Lucide documentation
3. Check helper module comments
4. File an issue in the project repository

---

**Last Updated**: November 6, 2025
**Status**: Phase 1 Complete, Phase 2 In Progress

