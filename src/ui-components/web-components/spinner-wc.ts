/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { spinnerStyles } from './spinner.styles';

@customElement('spinner-wc')
export class SpinnerWC extends LitElement {
  static override styles = spinnerStyles;

  override render() {
    return html`
      <svg viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spinner-wc': SpinnerWC;
  }
}
