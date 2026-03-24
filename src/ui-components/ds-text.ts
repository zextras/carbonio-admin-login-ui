/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme/theme.css';

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { type Theme, theme } from './theme/theme';
import { resolveThemeColor } from './theme/theme-utils';
import { dsTextVars, textStyles } from './ds-text.styles';

export type TextSize = keyof Theme['font']['size'];
export type TextWeight = keyof Theme['font']['weight'];
export type TextOverflow = 'ellipsis' | 'break-word';

@customElement('ds-text')
export class DsText extends LitElement {
  static override styles = textStyles;

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
      dsTextVars.color,
      resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
    );
    this.style.setProperty(dsTextVars.fontSize, theme.font.size[this.size]);
    this.style.setProperty(dsTextVars.weight, String(theme.font.weight[this.weight]));
    this.style.setProperty('line-height', String(this.lineHeight));

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-text': DsText;
  }
}
