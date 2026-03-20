/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css, unsafeCSS } from 'lit';

import { theme } from '../theme/theme';
import { zxTextVars } from './zx-text';

export const textStyles = css`
  :host {
    display: block;
    margin: 0;
    max-width: 100%;
    color: var(${unsafeCSS(zxTextVars.color)}, ${unsafeCSS(theme.color.text.regular)});
    font-size: var(${unsafeCSS(zxTextVars.fontSize)}, ${unsafeCSS(theme.font.size.medium)});
    font-weight: var(${unsafeCSS(zxTextVars.weight)}, ${unsafeCSS(theme.font.weight.regular)});
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
