# Roadmap: React → Web Components Migration

## Project Overview

| Current State | Target State |
|---------------|--------------|
| 17 React app components | 17 Lit web components |
| 25 React UI components | 25 Lit web components |
| React + react-dom | Lit |
| react-router-dom | No routing (SPA) |
| react-i18next | i18next (vanilla) |
| styled-components | CSS/Lit CSS |
| Zustand | Zustand (kept) |

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup
- [ ] Remove React dependencies from `package.json`
- [ ] Remove Vite React plugin, add Lit support
- [ ] Update `tsconfig.json` for Lit/ decorators
- [ ] Configure Vite for web components (keep existing config, remove React plugin)

### 1.2 Core Infrastructure
- [ ] Create `src/core/` folder for shared utilities:
  - `store.ts` - Zustand store accessor (vanilla JS)
  - `i18n.ts` - i18next setup without React bindings
  - `events.ts` - Custom event helpers for component communication
  - `theming.ts` - CSS custom properties / theming system

### 1.3 Base Web Component Class
- [ ] Create `src/core/BaseElement.ts` - Lit base class with:
  - i18next integration
  - Zustand store subscription
  - Common lifecycle helpers

```typescript
// Example structure
export class BaseElement extends LitElement {
  protected t(key: string): string;
  protected store = useLoginConfigStore;
}
```

---

## Phase 2: UI Components Migration (Week 2-4)

### 2.1 Primitives (Low Complexity)
Migrate in this order:

| Component | Priority | Notes |
|-----------|----------|-------|
| `Text` | High | Used everywhere |
| `Padding` | High | Layout primitive |
| `Container` | High | Layout primitive |
| `Row` | High | Layout primitive |
| `Divider` | Done | Already exists |
| `Icon` | Done | Already exists |
| `Spinner` | Done | Already exists |

### 2.2 Form Components (Medium Complexity)

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| `Input` | High | Text, Container |
| `PasswordInput` | High | Input, Icon |
| `Checkbox` | Medium | Text |
| `Select` | Medium | Text, Container |
| `Button` | High | Text, Icon |

### 2.3 Feedback Components (Higher Complexity)

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| `Tooltip` | Medium | Popper, Text |
| `Snackbar` | Medium | Text, Icon |
| `Modal` | High | Container, Padding, Button |
| `CustomModal` | Medium | Modal |
| `Popper` | High | Used by Tooltip, Dropdown |
| `Dropdown` | Medium | Popper, Container, Divider |

---

## Phase 3: App Components Migration (Week 4-6)

### 3.1 Static Components (Low Complexity)
Start with stateless components:

| Component | Migration Effort |
|-----------|-----------------|
| `loading-view` | Easy - pure HTML |
| `link-text` | Easy - pure HTML |
| `copyright-banner` | Easy - props only |

### 3.2 Form Components (Medium Complexity)

| Component | Key Challenges |
|-----------|----------------|
| `credentials-form` | useState, form validation, async submit |
| `change-password-form` | useState, fetch API, validation |
| `zimbra-form` | useState, form handling |

### 3.3 Layout & Orchestration (High Complexity)

| Component | Key Challenges |
|-----------|----------------|
| `page-layout` | useLayoutEffect, Zustand, theming, favicon injection |
| `v1-login-manager` | useState, useCallback, async API calls |
| `v2-login-manager` | useState, useCallback, async API calls |
| `form-selector` | useState, useEffect, conditional rendering |
| `app` | Remove react-router, simplify to single entry |

---

## Phase 4: Cleanup & Optimization (Week 6-7)

### 4.1 Remove React Dependencies
- [ ] Remove from `package.json`:
  - `react`, `react-dom`
  - `react-router-dom`
  - `react-i18next`
  - `styled-components`
  - `@testing-library/react`
- [ ] Delete `src/ui-components/src/components/` React folder
- [ ] Delete `src/ui-components/src/hooks/` React hooks

### 4.2 Update Entry Points
- [ ] Update `src/index.tsx` → `src/index.ts` (vanilla JS entry)
- [ ] Update `src/index.html` to use new entry
- [ ] Remove React-specific Vite config

### 4.3 Testing Updates
- [ ] Update test setup for web components
- [ ] Migrate tests from React Testing Library to web component testing
- [ ] Update `vitest.config.ts` for web component testing

---

## Phase 5: Final Integration (Week 7-8)

### 5.1 End-to-End Testing
- [ ] Test all user flows
- [ ] Verify form submissions
- [ ] Test dark mode / theming
- [ ] Verify i18n works correctly

### 5.2 Bundle Optimization
- [ ] Tree-shake unused code
- [ ] Optimize Lit bundle
- [ ] Analyze bundle size comparison

### 5.3 Documentation
- [ ] Document all web components
- [ ] Update README with new architecture
- [ ] Create usage examples

---

## File Structure (Target)

```
src/
├── core/
│   ├── BaseElement.ts          # Lit base class
│   ├── store.ts                # Zustand accessor
│   ├── i18n.ts                 # i18next setup
│   └── events.ts               # Custom events
├── web-components/
│   ├── primitives/
│   │   ├── text-wc.ts
│   │   ├── padding-wc.ts
│   │   ├── container-wc.ts
│   │   └── row-wc.ts
│   ├── forms/
│   │   ├── input-wc.ts
│   │   ├── password-input-wc.ts
│   │   ├── checkbox-wc.ts
│   │   ├── select-wc.ts
│   │   └── button-wc.ts
│   ├── feedback/
│   │   ├── modal-wc.ts
│   │   ├── snackbar-wc.ts
│   │   ├── tooltip-wc.ts
│   │   └── dropdown-wc.ts
│   └── app/
│       ├── login-form-wc.ts
│       ├── page-layout-wc.ts
│       └── app-wc.ts
├── store/
│   └── login/
│       └── store.ts            # Zustand store (kept)
├── services/                   # API services (kept)
├── i18n/                       # Translations (kept)
└── index.ts                    # Entry point
```

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Lit | Lightweight, already in use, great TS support |
| State Management | Zustand | Keep existing, works with vanilla JS |
| i18n | i18next | Keep existing, just remove React bindings |
| Routing | None | SPA, no routing needed |
| Migration | Gradual | Keep React working while migrating |
| Testing | Vitest | Already configured |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Gradual migration, test each component |
| Bundle size increase | Tree-shaking, code splitting |
| i18n integration issues | Create i18n mixin for Lit |
| Form validation complexity | Port existing validation logic |
| Theme/styling consistency | Use CSS custom properties |

---

## Component Inventory

### React App Components (17 total)

**src/components-v1/** (8 components):
| Component | Hooks Used | Dependencies |
|-----------|------------|--------------|
| `modals.tsx` | `useTranslation` | Modal, Text (ui-components) |
| `v2-login-manager.tsx` | `useState`, `useCallback`, `useTranslation` | Multiple ui-components, services |
| `page-layout.tsx` | `useState`, `useEffect`, `useLayoutEffect`, `useTranslation`, `Trans` | Container, Padding, Row, Text, zustand store |
| `form-selector.tsx` | `useState`, `useEffect` | V1/V2LoginManager |
| `copyright-banner.tsx` | None (props only) | Text |
| `link-text.tsx` | None | Pure JSX |
| `credentials-form.tsx` | `useState`, `useCallback`, `useMemo`, `useEffect`, `useTranslation` | Input, PasswordInput, Button, Row, Text |
| `change-password-form.tsx` | `useState`, `useCallback`, `useEffect`, `useTranslation` | Input, PasswordInput, Button, Row, Text |
| `v1-login-manager.tsx` | `useState`, `useCallback`, `useTranslation` | CredentialsForm, Snackbar, OfflineModal |

**src/ root level** (6 components):
| Component | Hooks Used | Dependencies |
|-----------|------------|--------------|
| `app.tsx` | `useState`, `useEffect` | react-router-dom (Router, Switch), Suspense |
| `index.tsx` | None (entry point) | react-dom render |
| `error-page.tsx` | `useTranslation` | Container, Row, Text, Button |
| `loginAdvanced.tsx` | `useState`, `useEffect` | PageLayout |
| `loginCE.tsx` | `React.lazy` | PageLayout |
| `loading-view.tsx` | None | Pure JSX |

**src/components-index/** (3 components):
| Component | Hooks Used |
|-----------|------------|
| `zimbra-form.tsx` | `useState`, `useCallback`, `useTranslation` |
| `server-not-responding.tsx` | `useState`, `useCallback`, `useTranslation` |
| `not-supported-version.tsx` | `useState`, `useCallback`, `useTranslation` |

### Existing Web Components (3 total)

Located in `src/ui-components/src/web-components/`:

| Web Component | Tag | Description |
|---------------|-----|-------------|
| `IconWC` | `<icon-wc>` | SVG icon with size, color, disabled props |
| `SpinnerWC` | `<spinner-wc>` | Loading spinner animation |
| `DividerElement` | `<divider-wc>` | Horizontal separator |

### React Dependencies to Remove

| Dependency | Version | Replacement |
|------------|---------|-------------|
| `react` | 17.0.2 | Lit |
| `react-dom` | 17.0.2 | Vanilla JS |
| `react-router-dom` | 5.3.0 | None (SPA) |
| `react-i18next` | 11.13.0 | i18next (vanilla) |
| `styled-components` | 5.3.6 | CSS/Lit CSS |
| `react-device-detect` | 2.2.2 | Vanilla UA detection |

---

## Migration Complexity Assessment

| Complexity | Components | Reason |
|------------|------------|--------|
| **Low** | `link-text`, `copyright-banner`, `loading-view` | Pure presentational, no hooks |
| **Medium** | `modals`, `server-not-responding`, `not-supported-version`, `error-page` | Simple hooks (useTranslation, useState) |
| **High** | `page-layout`, `v2-login-manager`, `v1-login-manager`, `credentials-form`, `change-password-form`, `form-selector`, `zimbra-form`, `app`, `loginAdvanced` | Multiple hooks, routing, state management, async logic |
