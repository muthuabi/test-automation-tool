# Sidebar & Header Customization Guide

## 🎨 Complete Theme Control

All sidebar and header colors are now fully controlled through the centralized theme. No hardcoded colors in components.

## Quick Change: Caterpillar Colors

**File**: `frontend/src/theme/theme.js`

### Default (Current)
```javascript
const colors = {
  primary: '#FFEB3B',      // Yellow
  secondary: '#333333',    // Dark gray
  // ...
};
```

## What Gets Customized Automatically

### Sidebar (Drawer)
- ✅ Header background (gradient: primary + secondary)
- ✅ Header text color (white)
- ✅ Menu item background on hover (primary with 5% opacity)
- ✅ Active menu item: background (primary with 10% opacity)
- ✅ Active menu item: border-left color (primary)
- ✅ Active menu item: text color (primary)
- ✅ Active menu item: icon color (primary)
- ✅ Settings section background (light gray from theme)

### Top AppBar (Header)
- ✅ Background gradient (primary + secondary)
- ✅ Text color (from theme)
- ✅ Box shadow (from theme)

## Color Variables Used

| Component | Color Property | Value |
|-----------|---|---|
| Sidebar Header Gradient | primary + secondary | `#FFEB3B` + `#333333` |
| Active Menu Item | primary | `#FFEB3B` |
| Hover State | primary (10% opacity) | Calculated from primary |
| AppBar Gradient | primary + secondary | `#FFEB3B` + `#333333` |

## To Change Colors

Simply edit the `colors` object in `frontend/src/theme/theme.js`:

```javascript
const colors = {
  primary: '#FFEB3B',      // Change this ← Sidebar active, AppBar primary
  primaryLight: '#FFF176',
  primaryDark: '#FBC02D',

  secondary: '#333333',    // Change this ← AppBar secondary, sidebar accent
  secondaryLight: '#666666',
  secondaryDark: '#000000',

  // ... rest of colors
};
```

**Examples:**

**Green & Black Theme:**
```javascript
const colors = {
  primary: '#00b050',      // Green
  secondary: '#000000',    // Black
};
```

**Blue & White Theme:**
```javascript
const colors = {
  primary: '#2196f3',      // Blue
  secondary: '#ffffff',    // White
};
```

## How Colors Flow

```
theme.js (colors object)
    ↓
    ├─→ React Components via 'colors' import
    │   └─→ Layout.jsx uses colors.primary, colors.secondary
    │       └─→ All sidebar & header colors update
    │
    └─→ MUI Theme Creation
        └─→ palette → primary.main, secondary.main
            └─→ AppBar, Buttons, Text, etc. update
```

## Implementation Details

### Sidebar Header Gradient
**File**: `frontend/src/layout/Layout.jsx` (line ~68)
```javascript
background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
```

### Active Menu Item
**File**: `frontend/src/layout/Layout.jsx` (line ~86)
```javascript
sx={{
  backgroundColor: isActive(item.path) ? alpha(colors.primary, 0.1) : 'transparent',
  borderLeft: isActive(item.path) ? `4px solid ${colors.primary}` : 'none',
  color: isActive(item.path) ? colors.primary : 'inherit',
}}
```

### Menu Hover State
**File**: `frontend/src/layout/Layout.jsx` (line ~90)
```javascript
'&:hover': {
  backgroundColor: alpha(colors.primary, 0.05),
}
```

### AppBar Gradient
**File**: `frontend/src/layout/Layout.jsx` (line ~168)
```javascript
background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
```

**Also in theme.js MuiAppBar component (line ~159):**
```javascript
MuiAppBar: {
  styleOverrides: {
    root: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    },
  },
}
```

## Testing Changes

1. **Edit** `frontend/src/theme/theme.js`
2. **Change** the `primary` and `secondary` colors
3. **Save** - browser hot-reloads
4. **Observe** - sidebar header, active items, and AppBar all update immediately

## No Component Updates Needed

All components already use theme colors. You only need to edit `theme.js`.

✅ **Already Implemented:**
- Layout imports colors from theme
- Alpha function used for opacity
- Gradient backgrounds use theme variables
- All colors flow from central theme

## Tech Details

- Using Material-UI's `alpha()` utility for 5% and 10% opacity variations
- Template literals for dynamic gradient backgrounds
- Centralized colors object exported from theme.js
- No hardcoded color values in components

## Color Hex Reference Guide

**Professional Palettes:**

| Theme | Primary | Secondary | Use Case |
|-------|---------|-----------|----------|
| Caterpillar | #FFEB3B | #333333 | Heavy equipment |
| Corporate Blue | #2196f3 | #1976d2 | Tech companies |
| Green Pro | #00b050 | #2d5016 | Environmental |
| Orange Energy | #ff9800 | #e65100 | Energy sector |
| Purple Tech | #667eea | #764ba2 | Software/tech |

That's it! One-file customization for entire app theme. 🎨
