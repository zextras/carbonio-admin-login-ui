/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

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

export type PaddingVarObj =
  | {
      value: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }
  | {
      all: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }
  | RequireAtLeastOne<{
      vertical: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      horizontal: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }>
  | RequireAtLeastOne<{
      top: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      right: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      bottom: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
      left: string | 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge' | 0;
    }>;

const paddingSizeTokens = ['extrasmall', 'small', 'medium', 'large', 'extralarge'] as const;
type PaddingSizeToken = (typeof paddingSizeTokens)[number];

function isPaddingSizeToken(value: string): value is PaddingSizeToken {
  return paddingSizeTokens.includes(value as PaddingSizeToken);
}

function paddingTokenToVar(padding: string): string {
  if (isPaddingSizeToken(padding)) {
    return `var(--padding-size-${padding})`;
  }
  return padding;
}

function simpleParsePaddingVar(size: string): string {
  const explodedSizes = size.split(' ');
  explodedSizes.forEach((padding, index) => {
    explodedSizes[index] = paddingTokenToVar(padding);
  });
  return explodedSizes.join(' ');
}

type PaddingDirection = {
  key: string;
  indices: Array<number>;
};

const PADDING_DIRECTIONS: Array<PaddingDirection> = [
  { key: 'vertical', indices: [0, 2] },
  { key: 'horizontal', indices: [1, 3] },
  { key: 'top', indices: [0] },
  { key: 'right', indices: [1] },
  { key: 'bottom', indices: [2] },
  { key: 'left', indices: [3] },
];

export function getPaddingVar(padding: string | PaddingVarObj | 0): string | undefined {
  if (padding === 0 || padding === '0') return '0';
  if (typeof padding === 'string') {
    return simpleParsePaddingVar(padding);
  }

  const shorthand = 'value' in padding
    ? padding.value
    : 'all' in padding
      ? padding.all
      : undefined;

  if (shorthand !== undefined && shorthand !== '') {
    return getPaddingVar(shorthand);
  }

  const sides: Array<string> = ['0', '0', '0', '0'];
  for (const { key, indices } of PADDING_DIRECTIONS) {
    if (key in padding) {
      const value = String((padding as Record<string, unknown>)[key]);
      for (const i of indices) {
        sides[i] = value;
      }
    }
  }

  return sides.map((val) => paddingTokenToVar(val)).join(' ');
}
