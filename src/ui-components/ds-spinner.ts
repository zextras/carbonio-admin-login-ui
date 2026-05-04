/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { spinnerStyles } from './ds-spinner.styles';
import { resolveThemeColor } from './theme/theme-utils';

@customElement('ds-spinner')
export class DsSpinner extends LitElement {
  static override readonly styles = spinnerStyles;

  @property({ type: String })
  accessor color: string = 'primary';

  override render() {
    return html`
      <svg
        viewBox="0 0 50 50"
        style=${styleMap({ '--ds-spinner-color': resolveThemeColor(this.color, 'regular') })}
      >
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-spinner': DsSpinner;
  }
}
