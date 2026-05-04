/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { dsTextVars, textStyles } from './ds-text.styles';
import { type Theme } from './theme/theme';
import { resolveThemeColor } from './theme/theme-utils';

type TextSize = keyof Theme['font']['size'];
type TextWeight = keyof Theme['font']['weight'];
type TextOverflow = 'ellipsis' | 'break-word';
type TextTag =
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'strong'
  | 'em'
  | 'small';

@customElement('ds-text')
export class DsText extends LitElement {
  static override readonly styles = textStyles;

  @property({ type: String })
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

  @property({ type: String })
  accessor as: TextTag = 'span';

  override render(): TemplateResult {
    const styles = {
      [dsTextVars.color]: resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
      ...(this.lineHeight !== undefined && { [dsTextVars.lineHeight]: String(this.lineHeight) }),
    };

    const tagStyle = styleMap(styles);

    switch (this.as) {
      case 'p':
        return html`<p style=${tagStyle}><slot></slot></p>`;
      case 'h1':
        return html`<h1 style=${tagStyle}><slot></slot></h1>`;
      case 'h2':
        return html`<h2 style=${tagStyle}><slot></slot></h2>`;
      case 'h3':
        return html`<h3 style=${tagStyle}><slot></slot></h3>`;
      case 'h4':
        return html`<h4 style=${tagStyle}><slot></slot></h4>`;
      case 'h5':
        return html`<h5 style=${tagStyle}><slot></slot></h5>`;
      case 'h6':
        return html`<h6 style=${tagStyle}><slot></slot></h6>`;
      case 'label':
        return html`<label style=${tagStyle}><slot></slot></label>`;
      case 'strong':
        return html`<strong style=${tagStyle}><slot></slot></strong>`;
      case 'em':
        return html`<em style=${tagStyle}><slot></slot></em>`;
      case 'small':
        return html`<small style=${tagStyle}><slot></slot></small>`;
      default:
        return html`<span style=${tagStyle}><slot></slot></span>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-text': DsText;
  }
}
