# Category Icon Migration to Lucide

## Overview

Category icons have been migrated from FontAwesome to Lucide icons. This provides better integration with the web project and a more modern icon set.

## What Changed

### For Administrators

#### Icon Picker
When creating or editing categories in the admin panel, you'll now see a **Lucide icon picker** instead of the FontAwesome picker:

1. Click on the category icon preview to open the picker
2. Browse through ~100 curated Lucide icons
3. Use the search box to find icons by name (e.g., "home", "users", "message")
4. Click an icon to select it
5. Click "Select" to apply, or "No Icon" to remove the icon

#### Icon Names
- Icons are now stored as simple names: `home`, `users`, `message-square`
- No more `fa-` prefix needed
- Find all available icons at: https://lucide.dev/icons/

#### Existing Categories
All existing categories have been automatically migrated:
- FontAwesome icon names were converted to Lucide equivalents
- Original icon names are preserved in `iconLegacy` field for reference
- If an icon couldn't be mapped, it defaults to `circle-dot`

### For Developers

#### NodeBB Templates
Category icons now use the `buildLucideIcon()` helper:

```html
<!-- Old (FontAwesome) -->
<i class="fa fa-home"></i>

<!-- New (Lucide) -->
{buildLucideIcon("home", 24)}
```

The `buildCategoryIcon()` helper automatically converts FA names to Lucide for backward compatibility.

#### Web Project
The web project now uses dynamic icons from the API:

```typescript
import { getIconComponent } from '@/shared/utils/lucideIconMapper';

const IconComponent = getIconComponent(category.icon);
return <IconComponent className="w-5 h-5" />;
```

#### Database Schema
Categories now have:
- `icon`: Lucide icon name (e.g., "home", "users")
- `iconLegacy`: Original FontAwesome name (for rollback)

## Icon Mapping

Common FontAwesome to Lucide conversions:

| FontAwesome | Lucide |
|-------------|--------|
| `fa-home` | `home` |
| `fa-users` | `users` |
| `fa-comments` | `messages-square` |
| `fa-heart` | `heart` |
| `fa-building` | `building` |
| `fa-graduation-cap` | `graduation-cap` |
| `fa-nbb-none` | `circle-dot` |

Full mapping available in:
- `speek-nodebb/install/migrations/migrate-category-icons-to-lucide.js`
- `speek-nodebb/public/src/modules/helpers.common.js`

## Backward Compatibility

The system maintains backward compatibility:
- Old FA icon names are automatically converted to Lucide
- Templates using `buildCategoryIcon()` work with both formats
- API continues to return icon data in expected format

## Rollback

If needed, icons can be restored from the `iconLegacy` field:

```javascript
// In NodeBB console or migration script
const db = require('./src/database');
const cids = await db.getSortedSetRange('categories:cid', 0, -1);

for (const cid of cids) {
  const legacy = await db.getObjectField('category:' + cid, 'iconLegacy');
  if (legacy) {
    await db.setObjectField('category:' + cid, 'icon', legacy);
  }
}
```

## Best Practices

### Choosing Icons
- Use semantic icons that represent the category purpose
- Prefer simple, recognizable icons over complex ones
- Test icons with different background colors
- Consider mobile display (icons should be clear at small sizes)

### Common Categories
Recommended icons for common category types:
- **Introductions**: `message-square`, `users`, `hand`
- **Support**: `heart`, `heart-handshake`, `life-buoy`
- **Technical**: `code`, `terminal`, `tool`
- **General Discussion**: `messages-square`, `message-circle`
- **Announcements**: `bell`, `megaphone`, `info`
- **Resources**: `book`, `file-text`, `folder`

## Troubleshooting

### Icon Not Displaying
1. Check that the icon name is valid (no `fa-` prefix)
2. Verify the icon exists in Lucide: https://lucide.dev/icons/
3. Check browser console for errors
4. Ensure Lucide CDN is loaded (check Network tab)

### Icon Looks Wrong
1. Verify category colors are set correctly
2. Check icon size in template (use appropriate size for context)
3. Try a different icon that better fits the space

### Migration Issues
1. Check NodeBB logs for migration errors
2. Verify all categories have an icon (or `circle-dot` default)
3. Check `iconLegacy` field to see original icon name

## Support

For issues or questions:
1. Check the Lucide icon library: https://lucide.dev/icons/
2. Review the migration script logs
3. Consult the development team

## Technical Details

### Files Modified
- `speek-nodebb/public/src/modules/lucideIconSelect.js` (new)
- `speek-nodebb/src/views/partials/lucide.tpl` (new)
- `speek-nodebb/install/migrations/migrate-category-icons-to-lucide.js` (new)
- `speek-nodebb/public/src/admin/manage/category.js` (updated)
- `speek-nodebb/public/src/modules/helpers.common.js` (updated)
- `speek-web/src/shared/utils/lucideIconMapper.ts` (new)
- `speek-web/src/presentation/components/Common/CommunityOtherSpaces.tsx` (updated)

### Migration Date
January 6, 2025

### Version
NodeBB v3.x with Lucide v0.x

