# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Carbonio Admin Login UI is the authentication web application for the Carbonio Admin Panel. It provides login interfaces for administrators with support for multiple authentication flows (V1/V2 API, SAML).

## Common Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Building
npm run build            # Production build (output to ../dist)
npm run build:dev        # Development build

# Testing
npm run test             # Run tests once with Vitest
npm run test:watch       # Run tests in watch mode

# Linting & Type Checking
npm run lint             # ESLint with caching
npm run type-check       # TypeScript type checking
npm run type-check:watch # Type checking with watch mode

# Translations
npm run pull-translations  # Pull from i18n repository
npm run push-translations  # Push to i18n repository
```

## Architecture

### Entry Points

- `src/app.tsx` - Root component, determines which login flow to use
- `src/loginAdvanced.tsx` - Advanced login with API version detection
- `src/index.tsx` - Application bootstrap

### Component Layers

- `src/components-v1/` - Login-specific components (current version)
- `src/components-index/` - Legacy/shared components (ZimbraForm, error states)
- `src/ui-components/` - Reusable UI library with React components and web components

### Web Components

The codebase uses Lit-based web components in `src/ui-components/web-components/`:

- `ds-button` - Button with loading states, icons, multiple styles
- `ds-text` - Typography component
- `ds-icon`, `ds-spinner`, `ds-divider` - Utility components

These use Shadow DOM for style isolation and CSS custom properties for theming.

### State Management

- Zustand store at `src/store/login/store.ts`
- Local state with useState/useReducer for component-level state
- URL parameters for initial state (username, domain, destination)

### Styling

- **CSS Custom Properties**: Theme defined in `src/ui-components/theme/theme.css`
- **CSS Modules**: Component-scoped styles (`.module.css` files)
- **styled-components**: Available but less commonly used

Theme colors follow the pattern `--color-{name}-{state}` (regular, hover, active, focus, disabled).

### API Services

- `src/services/` - API service functions
- Vite proxy configured for `/zx` endpoint (target: `https://localhost:6071` by default)
- Set `VITE_TARGET` env var to change proxy target

## Testing

- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- **MSW** (Mock Service Worker) for API mocking
- Test setup in `src/test-setup.ts`
- MSW handlers in `src/mocks/`

## Coding Conventions

### TypeScript

- Use `type` annotations, not `interface`
- Use `Array<Type>` syntax, not `Type[]`
- Named exports preferred over default exports

### Functions

- Arrow functions for JSX returns
- Regular function declarations for utility functions

### Imports

- ESLint enforces import sorting via `eslint-plugin-simple-import-sort`
- Unused imports are automatically flagged as errors

### File Headers

All source files require SPDX license headers:

```typescript
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
```

### React Patterns

- Functional components with hooks
- `useCallback` for event handlers passed to children
- `useMemo` for expensive calculations
- Proper cleanup in `useEffect`

## Internationalization

- react-i18next for translations
- Translation files in `translations/` directory
- Use `<Trans>` component for complex strings with interpolation
- `useTranslation()` hook for simple translations

## Development Notes

### Local Development with Backend

Set the `VITE_TARGET` environment variable to point to your backend server:

```bash
VITE_TARGET=my-server.local npm run dev
```

### Running Single Tests

```bash
npx vitest run src/path/to/test.file.test.tsx
```

### Package Building

The project supports building packages for multiple Linux distributions:

```bash
make build TARGET=ubuntu-jammy  # Ubuntu 22.04
make build TARGET=rocky-9       # Rocky Linux 9
```
