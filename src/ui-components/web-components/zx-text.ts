/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { resolveThemeColor } from '../theme/theme-utils';

export type TextSize = theme;
export type TextWeight = 'light' | 'regular' | 'medium' | 'bold';
export type TextOverflow = 'ellipsis' | 'break-word';

export class ZxText extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin: 0;
      max-width: 100%;
      color: var(--text-color);
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
      '--text-color',
      resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
    );

    if (!this.style.getPropertyValue('font-size')) {
      this.style.setProperty('font-size', `var(--text-font-size, var(--font-size-${this.size}))`);
    }

    this.style.setProperty('font-weight', `var(--font-weight-${this.weight})`);
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
