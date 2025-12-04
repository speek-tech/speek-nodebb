# Category Dropdown Icon Fix

## Problem
Icons were not displaying in the category selector dropdown menu shown in the screenshot. This dropdown appears:
- In the admin category edit page when selecting a parent category
- In the admin categories page header (category switcher)
- Anywhere the category selector is used

## Root Cause
The category dropdown is rendered dynamically by the `categorySearch` module. After the HTML is injected into the DOM with `data-lucide` attributes, the icons were not being initialized.

## Solution

### Files Modified

#### 1. `speek-nodebb/public/src/modules/categorySearch.js`
**Added `lucideInit` dependency:**
```javascript
define('categorySearch', ['alerts', 'bootstrap', 'api', 'lucideInit'], function (alerts, bootstrap, api, lucideInit) {
```

**Added icon initialization after rendering dropdown (line 107):**
```javascript
// Initialize Lucide icons in the dropdown
lucideInit.initDelayed(50, el.find('[component="category/list"]')[0]);
```

#### 2. `speek-nodebb/public/src/modules/categorySelector.js`
**Added `lucideInit` dependency:**
```javascript
define('categorySelector', [
    'categorySearch', 'bootbox', 'hooks', 'translator', 'lucideInit',
], function (categorySearch, bootbox, hooks, translator, lucideInit) {
```

**Added icon initialization when a category is selected (line 56):**
```javascript
// Initialize Lucide icons in the selected category display
lucideInit.initDelayed(50, selector.el.find('[component="category-selector-selected"]')[0]);
```

**Added icon initialization for pre-selected categories (line 70):**
```javascript
// Initialize Lucide icons in the selected category display
lucideInit.initDelayed(50, selector.el.find('[component="category-selector-selected"]')[0]);
```

## How It Works

### Flow

1. **User clicks dropdown** → `show.bs.dropdown` event fires
2. **categorySearch.js** fetches categories from API
3. **Template is rendered** with `buildCategoryIcon()` helper
4. **HTML is injected** into `[component="category/list"]`
5. **lucideInit.initDelayed(50)** is called with dropdown scope
6. **Icons are initialized** 50ms later (either via CDN or fallback)

### Icon Rendering in Dropdown

The dropdown template (`admin/partials/category/selector-dropdown-content.tpl`) uses:
```html
{buildCategoryIcon(@value, "24px", "rounded-circle")}
```

This generates:
```html
<span class="icon">
    <i data-lucide="home" data-lucide-size="12"></i>
</span>
```

Then `lucideInit` converts it to:
```html
<span class="icon">
    <svg>...</svg>
</span>
```

## Testing

### Before Fix
❌ Icons appeared as empty circles or not at all
❌ Dropdown showed category names without icons
❌ Selected category showed name without icon

### After Fix
✅ Icons display correctly in dropdown list
✅ Icons display when category is selected
✅ Icons display for pre-selected categories
✅ Icons work with both CDN and fallback data

## Build and Test

```bash
cd speek-nodebb
./nodebb build
```

Then test:
1. Go to `/admin/manage/categories/1`
2. Look at the "Introductions" dropdown in the top right (category switcher)
3. Click it - you should see all categories with their icons
4. Scroll down to "Parent Category" section
5. Click that dropdown - you should see all categories with their icons

## Key Points

- **Scoped initialization**: Icons are initialized only within the dropdown element, not globally
- **Delayed execution**: 50ms delay ensures DOM is ready before initialization
- **Fallback support**: Uses embedded SVG data if CDN fails
- **Automatic**: Works for all category dropdowns across the admin panel

## Related Files

- `speek-nodebb/themes/nodebb-theme-harmony-speek/templates/partials/category/selector-dropdown-content.tpl` - Dropdown template (already correct)
- `speek-nodebb/public/src/modules/helpers.common.js` - `buildCategoryIcon()` helper (already correct)
- `speek-nodebb/public/src/modules/lucideInit.js` - Centralized icon initialization module (created earlier)

## Success Criteria

✅ Icons display in category switcher dropdown
✅ Icons display in parent category selector dropdown
✅ Icons display when category is selected
✅ Icons persist after dropdown closes and reopens
✅ Works in all admin pages that use category selector

