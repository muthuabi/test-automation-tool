# Theme Customization Guide

## 🎨 Centralized Theme Management

All colors and styling for the Test Automater application are now managed in a single file.

**Location**: `src/theme/theme.js`

## How to Customize

### 1. Change Primary Color (Main Brand Color)

In `src/theme/theme.js`, find the `colors` object:

```javascript
const colors = {
  primary: '#667eea',           // Change this to your color
  primaryLight: '#8b9ff8',      // Light variant
  primaryDark: '#4c5ecf',       // Dark variant
  // ...rest of colors
};
```

**For Caterpillar Yellow Theme:**
```javascript
const colors = {
  primary: '#FFEB3B',           // Caterpillar yellow
  primaryLight: '#FFF176',      // Light yellow
  primaryDark: '#FBC02D',       // Dark yellow
  // ...
};
```

### 2. Change Secondary Color (Accent/Complementary)

```javascript
const colors = {
  // ...
  secondary: '#764ba2',         // Change this
  secondaryLight: '#9575cd',    // Light variant
  secondaryDark: '#4527a0',     // Dark variant
  // ...
};
```

**For Caterpillar Gray/Black:**
```javascript
const colors = {
  // ...
  secondary: '#333333',         // Caterpillar dark gray
  secondaryLight: '#666666',    // Light gray
  secondaryDark: '#000000',     // Black
  // ...
};
```

### 3. Add Caterpillar Green Accent (Optional)

```javascript
const colors = {
  // ...
  accent: '#00b050',            // Already set for green
  accentLight: '#4cb050',
  accentDark: '#217346',
  // ...
};
```

### 4. Status Colors (Success, Error, Warning)

```javascript
const colors = {
  success: '#4caf50',           // Green
  warning: '#ff9800',           // Orange
  error: '#f44336',             // Red
  info: '#2196f3',              // Blue
};
```

## Complete Caterpillar Theme Example

```javascript
const colors = {
  // Caterpillar Yellow + Gray
  primary: '#FFEB3B',           // Caterpillar yellow
  primaryLight: '#FFF176',
  primaryDark: '#FBC02D',

  secondary: '#333333',         // Caterpillar dark gray
  secondaryLight: '#666666',
  secondaryDark: '#000000',

  accent: '#00b050',            // Caterpillar green
  accentLight: '#4cb050',
  accentDark: '#217346',

  // Keep these as-is
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#bdbdbd',
  textHint: '#9e9e9e',

  background: '#ffffff',
  backgroundLight: '#f5f5f5',
  backgroundAlt: '#fafafa',

  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  border: '#e0e0e0',
  divider: '#e0e0e0',

  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
};
```

## What Gets Updated Automatically

When you change colors in `src/theme/theme.js`, the following automatically update across the entire application:

✅ **Navigation Sidebar**
- Background gradient (uses primary + secondary)
- Hover states
- Active item highlighting

✅ **Top AppBar**
- Background color (uses primary + secondary gradient)
- Text color

✅ **Buttons**
- All button colors
- Hover effects
- Shadow colors

✅ **Cards**
- Border colors
- Background

✅ **Forms**
- Input field borders
- Focus colors
- Label colors

✅ **Tabs**
- Active tab color
- Tab hover states

✅ **Icons**
- Icon colors throughout the app
- Status icons (success, error, warning)

✅ **Alerts & Messages**
- Alert backgrounds
- Alert text colors

✅ **Links & Text**
- Primary text color
- Secondary text color
- Disabled text color

## Gradient Backgrounds

Some components (AppBar, Sidebar) use gradients combining primary and secondary colors:

```javascript
background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
```

This automatically uses your new primary and secondary colors!

## Testing Your Changes

1. **Edit** `src/theme/theme.js` and change the `primary` color
2. **Save** the file
3. **Browser** automatically hot-reloads
4. **Observe** - all components update with the new color

## File Structure

```
frontend/src/
├── theme/
│   └── theme.js          ← Edit this file for colors
├── App.jsx               ← Imports theme automatically
├── pages/
│   ├── Dashboard.jsx
│   ├── Users.jsx
│   ├── Integrations.jsx
│   └── ... (all pages automatically use theme)
└── layout/
    └── Layout.jsx        ← Uses theme for sidebar & appbar
```

## No Need to Update Individual Components

❌ **Don't do this** - editing individual component styles:
```javascript
// Bad - colors are hardcoded
sx={{ backgroundColor: '#667eea' }}
```

✅ **Do this** - use theme colors:
```javascript
// Note: This is already done in existing code
// Just update src/theme/theme.js and it flows everywhere
```

## Color Hex Codes Reference

**Caterpillar Official Colors:**
- Yellow: `#FFEB3B` or `#FDD835`
- Gray: `#333333` or `#424242`
- Green: `#00b050` or `#558b2f`
- Black: `#000000`

**Material Design Colors:**
- Light colors: Use `Lighten(%)` tools
- Dark colors: Use `Darken(%)` tools

## Troubleshooting

**Colors not changing?**
1. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
2. Make sure you edited the correct `colors` object
3. Check that Vite hot-reload is working

**Text not readable?**
- Adjust `textPrimary` color for better contrast
- Good contrast ratios: >= 4.5:1 for text on background

**Gradient looks wrong?**
- The gradient uses primary + secondary
- Make sure both colors have good visual difference
- Test on actual backgrounds before deploying

## Quick Reference

| Color Variable | Used For | Caterpillar Value |
|---|---|---|
| `primary` | Main brand, buttons, links | `#FFEB3B` (yellow) |
| `secondary` | Accents, appbar, hover | `#333333` (gray) |
| `accent` | Optional highlight | `#00b050` (green) |
| `success` | Checkmarks, passed | `#4caf50` |
| `error` | Delete, failed, error | `#f44336` |
| `warning` | Caution, warning | `#ff9800` |
| `info` | Information | `#2196f3` |

That's it! Edit one file and see your entire app change colors. 🎨
