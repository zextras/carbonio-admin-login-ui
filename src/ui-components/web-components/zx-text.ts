/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';

import { type Theme, theme } from '../theme/theme';
import { resolveThemeColor } from '../theme/theme-utils';

export type TextSize = keyof Theme['font']['size'];
export type TextWeight = keyof Theme['font']['weight'];
export type TextOverflow = 'ellipsis' | 'break-word';

export const zxTextVars = {
  fontSize: '--zx-text-font-size',
  color: '--zx-text-color',
  weight: '--zx-text-font-weight',
  lineHeight: '--zx-text-line-height',
} as const;

export class ZxText extends LitElement {
  static override styles = css`
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

  @property({ type: String, reflect: true })
  accessor color = 'text';

  @property({ type: String, reflect: true })
  accessor size: TextSize = 'medium';

  @property({ type: String, reflect: true })
  accessor weight: TextWeight = 'regular';

  @property({ type: String, reflect: true })
  accessor overflow: TextOverflow = 'ellipsis';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Number, attribute: 'line-height' })
  accessor lineHeight: number | undefined;

  override render(): TemplateResult {
    this.style.setProperty(
      zxTextVars.color,
      resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
    );

    if (!this.style.getPropertyValue(zxTextVars.fontSize)) {
      this.style.setProperty(zxTextVars.fontSize, theme.font.size[this.size]);
    }

    if (!this.style.getPropertyValue(zxTextVars.weight)) {
      this.style.setProperty(zxTextVars.weight, String(theme.font.weight[this.weight]));
    }

    if (this.lineHeight !== undefined) {
      this.style.setProperty('line-height', String(this.lineHeight));
    }

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zx-text': ZxText;
  }
}

if (!customElements.get('zx-text')) {
  customElements.define('zx-text', ZxText);
}
