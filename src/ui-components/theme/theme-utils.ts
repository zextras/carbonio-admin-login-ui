/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const CSS_KEYWORDS = new Set(['currentColor', 'inherit', 'initial', 'unset']);
const BASE_COLORS = new Set(['white', 'black']);

export function resolveThemeColor(colorName: string, state: string): string {
  if (!colorName) return '';
  const trimmed = colorName.trim();

  if (CSS_KEYWORDS.has(trimmed)) return trimmed;

  if (BASE_COLORS.has(trimmed)) {
    return `var(--color-${trimmed})`;
  }

  // Pass through any raw CSS value that isn't a design token name
  const isTokenName = /^[a-zA-Z0-9-]+$/.test(trimmed);
  if (!isTokenName) return trimmed;

  const sanitizedState = state?.trim();
  if (!sanitizedState) {
    return `var(--color-${trimmed}-regular)`;
  }

  return `var(--color-${trimmed}-${sanitizedState}, var(--color-${trimmed}-regular))`;
}
