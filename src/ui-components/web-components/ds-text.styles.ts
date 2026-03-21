/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css, unsafeCSS } from 'lit';

import { theme } from '../theme/theme';

export const dsTextVars = {
  fontSize: '--ds-text-font-size',
  color: '--ds-text-color',
  weight: '--ds-text-font-weight',
  lineHeight: '--ds-text-line-height',
} as const;

export const textStyles = css`
  :host {
    display: block;
    margin: 0;
    max-width: 100%;
    color: var(${unsafeCSS(dsTextVars.color)}, ${unsafeCSS(theme.color.text.regular)});
    font-size: var(${unsafeCSS(dsTextVars.fontSize)}, ${unsafeCSS(theme.font.size.medium)});
    font-weight: var(${unsafeCSS(dsTextVars.weight)}, ${unsafeCSS(theme.font.weight.regular)});
    font-family: var(--text-font-family, var(--font-family));
  }

  :host([overflow='ellipsis']) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :host([overflow='break-word']) {
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
`;
