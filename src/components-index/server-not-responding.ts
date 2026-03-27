/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('server-not-responding')
export class ServerNotResponding extends LitElement {
  @property({ type: Boolean, reflect: true })
  accessor open = true;

  private onClose(): void {
    this.open = false;
  }

  override render(): TemplateResult {
    return html`
      <ds-snackbar
        ?open=${this.open}
        label=${i18next.t(
          'server_not_responding',
          'The server is not responding. Please contact your server administrator',
        )}
        auto-hide-timeout=${10000}
        severity="error"
        data-testid="server-not-responding"
        @close=${this.onClose}
      ></ds-snackbar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'server-not-responding': ServerNotResponding;
  }
}
