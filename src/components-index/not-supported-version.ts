/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ui-components/ds-snackbar';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('not-supported-version')
export class NotSupportedVersion extends LitElement {
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
          'unsupported_version',
          'The server sent a not valid response. Please contact your server administrator',
        )}
        auto-hide-timeout=${10000}
        severity="error"
        data-testid="not-supported-version"
        @close=${this.onClose}
      ></ds-snackbar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'not-supported-version': NotSupportedVersion;
  }
}
