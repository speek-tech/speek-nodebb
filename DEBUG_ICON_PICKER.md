# Debug Icon Picker - Step by Step

## Step 1: Check if Lucide is Loaded

1. Open the admin category page: `http://localhost:4567/admin/manage/categories/1`
2. Open browser console (F12)
3. Type this and press Enter:

```javascript
window.lucide
```

**Expected result:** You should see an object with properties like `createIcons`, `icons`, etc.

**If you see `undefined`**, Lucide isn't loading. Check network tab for the Lucide CDN request.

## Step 2: Test Lucide Manually

In the console, run:

```javascript
// Test 1: Check if createIcons exists
console.log(typeof window.lucide.createIcons);

// Test 2: Try to create icons manually
window.lucide.createIcons();

// Test 3: Create a test icon
document.body.insertAdjacentHTML('beforeend', '<i data-lucide="home" style="width:48px;height:48px;"></i>');
window.lucide.createIcons();
```

**Expected:** You should see a home icon appear at the bottom of the page.

## Step 3: Test Icon Picker

1. Click on the category icon to open the picker
2. Wait for modal to open
3. In console, run:

```javascript
// Find the modal
const modal = document.querySelector('.bootbox.modal');
console.log('Modal found:', modal);

// Find icons in modal
const icons = modal.querySelectorAll('[data-lucide]');
console.log('Icon elements:', icons.length);

// Try to initialize icons in modal
window.lucide.createIcons();

// Check if SVGs were created
const svgs = modal.querySelectorAll('svg');
console.log('SVG elements:', svgs.length);
```

**Expected:** After running `createIcons()`, SVG elements should appear.

## Step 4: Check Console for Errors

Look for any JavaScript errors in the console. Common issues:
- `lucide is not defined` - Lucide CDN not loaded
- `createIcons is not a function` - Wrong Lucide version/API
- No errors but no icons - Timing issue with modal rendering

## Quick Fix to Test

If Step 3 creates the icons when you run it manually, then it's a timing issue. Try this in the console:

```javascript
// Override the icon picker to add a longer delay
$(document).on('click', '[component="category/preview"]', function() {
    setTimeout(function() {
        console.log('Initializing icons...');
        window.lucide.createIcons();
    }, 500);
});
```

Then open the icon picker again.

## Alternative: Use Inline SVGs

If Lucide `createIcons()` doesn't work at all, we might need to:
1. Download Lucide icons as SVG files
2. Include them directly in the template
3. Or use a different approach

## Report Results

Please report:
1. What Step 1 shows (the lucide object)
2. Whether Step 2 creates a visible home icon
3. Whether Step 3 creates icons in the modal
4. Any console errors you see

