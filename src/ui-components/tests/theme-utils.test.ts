/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { resolveThemeColor } from '../theme/theme-utils';

describe('resolveThemeColor', () => {
  it('should return empty string for empty input', () => {
    expect(resolveThemeColor('', '')).toBe('');
  });

  it.each(['currentColor', 'inherit', 'initial', 'unset'] as const)(
    'should pass through CSS keyword "%s"',
    (keyword) => {
      expect(resolveThemeColor(keyword, '')).toBe(keyword);
    },
  );

  it.each(['white', 'black'] as const)('should resolve base color "%s" to var', (color) => {
    expect(resolveThemeColor(color, '')).toBe(`var(--color-${color})`);
  });

  it('should pass through raw CSS values that are not token names', () => {
    expect(resolveThemeColor('rgba(0,0,0,0.5)', '')).toBe('rgba(0,0,0,0.5)');
  });

  it('should pass through values with special characters', () => {
    expect(resolveThemeColor('123#abc', '')).toBe('123#abc');
  });

  it('should resolve token name with regular state when no state provided', () => {
    expect(resolveThemeColor('primary', '')).toBe('var(--color-primary-regular)');
  });

  it('should resolve token name with regular state when state is null', () => {
    expect(resolveThemeColor('primary', null as unknown as string)).toBe(
      'var(--color-primary-regular)',
    );
  });

  it('should resolve token name with fallback when state is provided', () => {
    expect(resolveThemeColor('primary', 'hover')).toBe(
      'var(--color-primary-hover, var(--color-primary-regular))',
    );
  });

  it('should trim whitespace from color name', () => {
    expect(resolveThemeColor(' primary ', '')).toBe('var(--color-primary-regular)');
  });
});
