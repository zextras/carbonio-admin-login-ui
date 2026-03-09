# Carbonio Design System Migration Analysis

This document contains a comprehensive analysis of `@zextras/carbonio-design-system` usage in this project.

## Summary

- **Total Components to Migrate**: 22 distinct items
- **Source Files Using Design System**: 14 files
- **Package Version**: `^7.1.0`

---

## Components by Category

### UI Components (16)

| Component | Files Used | Count | Complexity |
|-----------|-----------|-------|------------|
| **Row** | 6 files | 17 | Layout - medium |
| **Text** | 6 files | 15 | Display - low |
| **Snackbar** | 5 files | 5 | Feedback - high |
| **Button** | 4 files | 6 | Interactive - medium |
| **Input** | 3 files | 4 | Form - medium |
| **PasswordInput** | 3 files | 4 | Form - high (toggle visibility) |
| **Container** | 2 files | 9 | Layout - medium |
| **SnackbarManager** | 2 files | 2 | Context/Provider - high |
| **Modal** | 1 file | 1 | Overlay - high |
| **ModalManager** | 1 file (tests) | 1 | Context/Provider - high |
| **Paragraph** | 1 file | 1 | Display - low |
| **Padding** | 1 file | 2 | Layout - low |
| **Link** | 1 file | 1 | Navigation - low |
| **Icon** | 1 file | 1 | Display - medium |
| **Checkbox** | 1 file | 1 | Form - medium |
| **Select** | 1 file | 1 | Form - high |

### Theme System (4)

| Component | File | Complexity |
|-----------|------|------------|
| **ThemeProvider** | `src/theme-provider/theme-provider.tsx` | High - core to app |
| **useTheme** | `src/primary-color/use-get-primary-color.tsx` | Medium - hook |
| **generateColorSet** | `src/theme-provider/theme-provider.tsx` | Medium - color utility |
| **Theme type** | `types/styled-components.d.ts` | Low - type definition |

### Hooks (1)

| Hook | File | Complexity |
|------|------|------------|
| **useScreenMode** | `src/components-v1/page-layout.jsx` | Medium - responsive |

---

## Files Requiring Migration

| File | Components Used |
|------|-----------------|
| `src/app.tsx` | SnackbarManager |
| `src/error-page.tsx` | Button, Container, Row, Text |
| `src/theme-provider/theme-provider.tsx` | generateColorSet, ThemeProvider |
| `src/primary-color/use-get-primary-color.tsx` | useTheme |
| `src/tests/testUtils.tsx` | ModalManager, SnackbarManager |
| `src/components-v1/page-layout.jsx` | Container, Link, Padding, Row, Text, Icon, useScreenMode |
| `src/components-v1/credentials-form.jsx` | Button, Input, PasswordInput, Row, Text |
| `src/components-v1/v1-login-manager.jsx` | Row, Snackbar |
| `src/components-v1/v2-login-manager.jsx` | Button, Checkbox, Input, Row, Select, Snackbar, Text |
| `src/components-v1/modals.jsx` | Modal, Paragraph |
| `src/components-v1/change-password-form.jsx` | Row, Text, Input, Button, PasswordInput |
| `src/components-index/not-supported-version.jsx` | Snackbar |
| `src/components-index/server-not-responding.jsx` | Snackbar |
| `types/styled-components.d.ts` | Theme (type) |

---

## Detailed Component Usage

### Row
Layout component for horizontal/vertical arrangement.

**Files:**
- `src/components-v1/credentials-form.jsx` - lines 104, 116, 143, 158
- `src/components-v1/page-layout.jsx` - line 388
- `src/components-v1/v1-login-manager.jsx` - lines 95, 120
- `src/components-v1/v2-login-manager.jsx` - lines 120, 127, 132, 141, 151, 158, 167
- `src/components-v1/change-password-form.jsx` - lines 306, 311, 314, 325, 331, 341, 348, 358, 365
- `src/error-page.tsx` - line 51

**Props used:** `orientation`, `crossAlignment`, `mainAlignment`, `padding`, `wrap`, `gap`

### Text
Typography component for displaying text.

**Files:**
- `src/components-v1/credentials-form.jsx` - line 140
- `src/components-v1/page-layout.jsx` - lines 91, 96, 234, 240, 396
- `src/components-v1/v2-login-manager.jsx` - lines 128, 152
- `src/components-v1/change-password-form.jsx` - lines 307, 326, 343, 360
- `src/error-page.tsx` - lines 35, 38, 52

**Props used:** `color`, `size`, `overflow`, `weight`, `style`

### Snackbar
Toast notification component.

**Files:**
- `src/components-index/not-supported-version.jsx` - lines 18-28
- `src/components-index/server-not-responding.jsx` - lines 18-28
- `src/components-v1/v1-login-manager.jsx` - lines 99-107
- `src/components-v1/v2-login-manager.jsx` - lines 184-192

**Props used:** `open`, `label`, `actionLabel`, `onActionClick`, `onClose`, `autoHideTimeout`, `type`, `data-testid`

### SnackbarManager
Context provider for snackbars.

**Files:**
- `src/app.tsx` - line 56
- `src/tests/testUtils.tsx` - line 161

### Button
Interactive button component.

**Files:**
- `src/components-v1/credentials-form.jsx` - lines 69-78, 148-156
- `src/components-v1/v2-login-manager.jsx` - lines 159-165
- `src/components-v1/change-password-form.jsx` - lines 366-373
- `src/error-page.tsx` - lines 55-62

**Props used:** `type`, `data-testid`, `label`, `color`, `disabled`, `onClick`, `height`, `loading`, `width`, `iconPlacement`, `icon`

### Input
Text input component.

**Files:**
- `src/components-v1/credentials-form.jsx` - lines 105-114
- `src/components-v1/v2-login-manager.jsx` - lines 142-149
- `src/components-v1/change-password-form.jsx` - line 312

**Props used:** `defaultValue`, `disabled`, `data-testid`, `onChange`, `hasError`, `autocomplete`, `label`, `backgroundColor`

### PasswordInput
Password input with show/hide toggle.

**Files:**
- `src/components-v1/credentials-form.jsx` - lines 117-126
- `src/components-v1/change-password-form.jsx` - lines 315-322, 332-339, 349-356

**Props used:** `defaultValue`, `disabled`, `data-testid`, `onChange`, `hasError`, `autocomplete`, `label`, `backgroundColor`

### Container
Layout container component.

**Files:**
- `src/components-v1/page-layout.jsx` - lines 44, 70, 364, 366, 383
- `src/error-page.tsx` - lines 16, 17, 18, 21, 29, 50

**Props used:** `padding`, `background`, `justifyContent`, `alignItems`, `mainAlignment`, `crossAlignment`, `height`, `width`, `orientation`, `gap`, `style`

### Modal
Modal dialog component.

**Files:**
- `src/components-v1/modals.jsx` - line 15

**Props used:** `title`, `open`, `onClose`

### ModalManager
Context provider for modals.

**Files:**
- `src/tests/testUtils.tsx` - line 163

### Paragraph
Text paragraph component.

**Files:**
- `src/components-v1/modals.jsx` - line 16

**Props used:** `data-testid`

### Padding
Spacing component.

**Files:**
- `src/components-v1/page-layout.jsx` - lines 365, 389

**Props used:** `value`, `right`

### Link
Navigation link component.

**Files:**
- `src/components-v1/page-layout.jsx` - line 90 (styled)

**Note:** Already replaced with custom `<a>` element in `LinkText` component (line 253-267).

### Icon
Icon display component.

**Files:**
- `src/components-v1/page-layout.jsx` - lines 390-394

**Props used:** `color`, `icon`, `size`

**Icons used:** `CheckmarkOutline`, `InfoOutline`

### Checkbox
Checkbox input component.

**Files:**
- `src/components-v1/v2-login-manager.jsx` - lines 168-172

**Props used:** `value`, `label`, `onClick`

### Select
Dropdown select component.

**Files:**
- `src/components-v1/v2-login-manager.jsx` - lines 133-139

**Props used:** `items`, `background`, `label`, `onChange`, `defaultSelection`

---

## Theme System Details

### ThemeProvider (`src/theme-provider/theme-provider.tsx`)

Core theme provider that wraps the entire application. Integrates with:
- styled-components
- darkreader (for dark mode)
- Custom palette extensions
- Dynamic primary color

**Key functionality:**
- Provides theme context to all styled-components
- Manages dark mode state via darkreader
- Extends default theme with custom colors (primary, shared, linked)
- Auto-scaling font size

### useTheme (`src/primary-color/use-get-primary-color.tsx`)

Hook to access theme object. Used to get primary color from palette.

```tsx
const theme = useTheme();
const primaryColor = theme.palette.primary.regular;
```

### generateColorSet (`src/theme-provider/theme-provider.tsx`)

Utility function to generate color variations (regular, hover, active, focus, disabled) from a single color.

```tsx
{ primary: generateColorSet({ regular: primaryColor }) }
```

### Theme Type (`types/styled-components.d.ts`)

Extends styled-components DefaultTheme with Carbonio theme types.

---

## Migration Complexity Assessment

| Category | Count | Effort | Priority |
|----------|-------|--------|----------|
| **Layout** (Row, Container, Padding) | 3 | Medium | High |
| **Typography** (Text, Paragraph) | 2 | Low | Medium |
| **Form** (Input, PasswordInput, Button, Checkbox, Select) | 5 | Medium-High | High |
| **Feedback** (Snackbar, SnackbarManager) | 2 | High | High |
| **Overlay** (Modal, ModalManager) | 2 | High | Medium |
| **Theme** (ThemeProvider, useTheme, generateColorSet) | 3 | High | Critical |
| **Other** (Icon, Link, useScreenMode, Theme type) | 4 | Medium | Medium |

---

## Recommended Migration Order

1. **Theme System** - Foundation for everything else
2. **Layout Components** - Row, Container, Padding
3. **Typography** - Text, Paragraph
4. **Form Components** - Input, PasswordInput, Button, Checkbox, Select
5. **Feedback System** - Snackbar, SnackbarManager
6. **Overlay System** - Modal, ModalManager
7. **Remaining** - Icon, Link, useScreenMode

---

## Notes

- The `Link` component is already partially replaced with a custom `<a>` element in `LinkText`
- `Icon` requires an icon library - currently uses Carbonio icons (`CheckmarkOutline`, `InfoOutline`, `Refresh`)
- `useScreenMode` is a responsive hook that returns `'desktop'` or `'mobile'`
- Test utilities (`testUtils.tsx`) wrap components with both `SnackbarManager` and `ModalManager`
