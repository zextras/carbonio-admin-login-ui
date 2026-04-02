/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './offline-modal';
import './credentials-form';
import '../ui-components/ds-snackbar';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { postV1Login } from '../services/v1-service';
import { saveCredentials } from '../utils';

@customElement('v1-login-manager')
export class V1LoginManager extends LitElement {
  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @property({ type: Boolean, attribute: 'disable-inputs' })
  accessor disableInputs = false;

  @property({ type: Array })
  accessor authMethods: Array<string> = [];

  @state()
  private accessor loading = false;

  @state()
  private accessor authError: string | boolean = false;

  @state()
  private accessor snackbarNetworkError = false;

  @state()
  private accessor detailNetworkModal = false;

  private readonly handleSubmitCredentials = async (e: Event): Promise<void> => {
    const { username, password } = (e as CustomEvent<{ username: string; password: string }>)
      .detail;
    const t = i18next.t.bind(i18next);

    this.loading = true;
    try {
      const res = await postV1Login('password', username, password);
      switch (res.status) {
        case 200:
          await saveCredentials(username, password);
          globalThis.location.assign(this.destinationUrl);
          break;
        case 401:
          this.authError = t(
            'credentials_not_valid',
            'Credentials are not valid, please check data and try again',
          );
          this.loading = false;
          break;
        case 403:
          this.authError = t(
            'auth_not_valid',
            'The authentication policy needs more steps: please contact your administrator for more information',
          );
          this.loading = false;
          break;
        case 502:
          this.authError = t('server_unreachable', 'Error 502: Service Unreachable - Retry later.');
          this.loading = false;
          break;
        default:
          this.snackbarNetworkError = true;
          this.loading = false;
      }
    } catch {
      this.loading = false;
    }
  };

  private readonly handleSnackbarAction = (): void => {
    this.detailNetworkModal = true;
  };

  private readonly handleSnackbarClose = (): void => {
    this.snackbarNetworkError = false;
  };

  private readonly handleOfflineModalClose = (): void => {
    this.detailNetworkModal = false;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  private renderCredentialsForm(): TemplateResult {
    return html`
      <credentials-form
        destination-url=${this.destinationUrl}
        .authMethods=${this.authMethods}
        ?disable-inputs=${this.disableInputs}
        auth-error=${typeof this.authError === 'string' ? this.authError : ''}
        ?loading=${this.loading}
      ></credentials-form>
    `;
  }

  private renderSnackbar(): TemplateResult {
    const t = i18next.t.bind(i18next);
    return html`
      <ds-snackbar
        ?open=${this.snackbarNetworkError}
        label=${t('cant_login', 'Can not do the login now')}
        action-label=${t('details', 'Details')}
        @snackbar:action-click=${this.handleSnackbarAction}
        @snackbar:close=${this.handleSnackbarClose}
        auto-hide-timeout=${10000}
        severity="error"
      ></ds-snackbar>
    `;
  }

  private renderOfflineModal(): TemplateResult {
    return html`
      <offline-modal
        ?open=${this.detailNetworkModal}
        @offline-modal:close=${this.handleOfflineModalClose}
      ></offline-modal>
    `;
  }

  override render(): TemplateResult {
    return html`
      ${this.renderCredentialsForm()} ${this.renderSnackbar()} ${this.renderOfflineModal()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'v1-login-manager': V1LoginManager;
  }
}
