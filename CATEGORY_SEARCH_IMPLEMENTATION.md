# Category Global Search Feature Implementation

## Overview
A global search functionality has been added to the Categories list page (home page) that allows users to search for posts and comments across all categories.

## Features Implemented

### 1. **Inline Search Section**
   - Seamlessly integrated at the top of the categories list page
   - Clean, modern styling consistent with the theme
   - Fully responsive layout

### 2. **Search Scope**
   - Single search field covers topic titles, first posts, and all comments/replies

### 3. **Search Functionality**
   - Real-time search with 400 ms debounce
   - Minimum 2 characters required
  - Searches across all categories
   - Highlight search terms in results

### 4. **Default Behaviour**
   - Match mode: **any word** (no toggle shown)
   - Sorting: **newest first** (timestamp descending)
   - Clear button to reset the search quickly

### 5. **Search Results Display**
   - Card-based layout showing title, author, and timestamp
   - Content preview with highlighted matches
   - Click to navigate to the full post
   - Loading indicator and “no matches” feedback

## Files Added

1. **Template**: `templates/partials/category-global-search.tpl`
   - Search modal HTML structure

2. **Styles**: `scss/category-global-search.scss`
   - All styling for the search modal and components
   - Responsive design with mobile-first approach

3. **JavaScript**: `public/category-global-search.js`
   - Search functionality and event handlers
   - API integration with NodeBB search
   - Results rendering and display

4. **Documentation**: `CATEGORY_SEARCH_IMPLEMENTATION.md` (this file)

## Files Modified

1. **templates/category.tpl**
   - Added import for category-global-search partial

2. **templates/categories.tpl**
   - Added inline search section

3. **templates/partials/category-global-search.tpl**
   - Replaced overlay markup with inline search layout

4. **scss/category-global-search.scss**
   - Rewritten styles for inline search experience

5. **scss/harmony.scss**
   - Includes the updated search styles

6. **public/category-global-search.js**
   - Handles inline search interactions and API calls

7. **plugin.json**
   - Ensures the search script is bundled

## How to Build and Deploy

### Step 1: Rebuild NodeBB
Navigate to your NodeBB installation directory:

```bash
cd speek-nodebb
```

### Step 2: Build the theme
```bash
./nodebb build
```

Or if you want to build only the theme:
```bash
./nodebb build harmony-speek
```

### Step 3: Restart NodeBB
```bash
./nodebb restart
```

## Usage

### For Users

1. **Locate Search Box**:
   - At the top of the `/categories` page you’ll see the “Search” panel.

2. **Enter Search Query**:
   - Type at least 2 characters; results appear automatically.

3. **Clear Results**:
   - Use the “×” button inside the input to clear the field.

4. **View Results**:
   - Click any result card to navigate directly to the post.

## Technical Details

### Search API Integration
The feature uses NodeBB's built-in search API:
- Endpoint: `/api/search`
- Parameters: term, in, matchWords, sortBy, categories, searchChildren

### Search Scoping
- Searches across all categories
- Respects user permissions: Only shows results user has access to

### Performance
- Debounced search (400 ms) to reduce API calls
- Minimum 2 characters to start search
- Results limited by NodeBB's pagination

### Accessibility
- Keyboard navigation support
- ARIA labels on buttons
- Focus management (auto-focus on open)
- ESC key to close

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Works with touch devices

## Customization

### Styling
Edit `scss/category-global-search.scss` to customize:
- Colors (using CSS variables)
- Spacing and layout
- Animation timing
- Button position

### Behavior
Edit `public/category-global-search.js` to customize:
- Debounce delay (default: 500ms)
- Minimum search characters (default: 2)
- Result display format
- Search parameters

### Position
The search box is rendered inline within the `/categories` page layout. Styling can be customised inside `scss/category-global-search.scss`.

## Troubleshooting

### Search button not appearing
1. Clear browser cache
2. Rebuild theme: `./nodebb build`
3. Check browser console for JavaScript errors

### Styles not applying
1. Clear NodeBB cache: `./nodebb reset -t`
2. Rebuild: `./nodebb build`
3. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`

### Search not working
1. Check `nodebb-plugin-dbsearch` is enabled in NodeBB
2. Verify user has search permissions
3. Check browser console for API errors

### Modal not centered on mobile
1. Clear browser cache
2. Check viewport meta tag in header
3. Test in different mobile browsers

## Future Enhancements (Optional)

- [ ] Add advanced filters (date range, author, tags)
- [ ] Add search history
- [ ] Add keyboard navigation in results
- [ ] Add search suggestions/autocomplete
- [ ] Add saved searches
- [ ] Add export search results

## Support

For issues or questions:
1. Check NodeBB logs: `tail -f logs/output.log`
2. Check browser console for errors
3. Verify all files are in correct locations
4. Ensure the theme is properly built and activated

## License
This feature follows the same license as the parent theme (nodebb-theme-harmony-speek).

