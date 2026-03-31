/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../components-v1/credentials-form';
import '../components-v1/change-password-form';

import i18next from 'i18next';
import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { loginToCarbonioAdmin } from '../services/v2-service';

const FORM_STATE = {
  credentials: 'credentials',
  waiting: 'waiting',
  twoFactor: 'two-factor',
  changePassword: 'change-password',
} as const;

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE];

@customElement('zimbra-form')
export class ZimbraForm extends LitElement {
  static override styles = css`
    :host {
      width: 100%;
    }
  `;

  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @state()
  private accessor authError = '';

  @state()
  private accessor loading = false;

  @state()
  private accessor progress: FormState = FORM_STATE.credentials;

  @state()
  private accessor email = '';

  @query('credentials-form')
  private accessor credentialsForm: HTMLElement | null = null;

  private handleSubmitCredentials = async (e: Event): Promise<void> => {
    const { username, password } = (e as CustomEvent<{ username: string; password: string }>)
      .detail;
    const t = i18next.t.bind(i18next);

    this.loading = true;
    try {
      const res = await loginToCarbonioAdmin(username, password);
      let payload;
      try {
        payload = await res.json();
      } catch {
        payload = res;
      }
      this.email = username;
      if (payload?.Body?.Fault) {
        if (
          payload.Body.Fault?.Detail?.Error?.Code &&
          payload.Body.Fault?.Detail?.Error?.Code === 'account.CHANGE_PASSWORD'
        ) {
          this.progress = FORM_STATE.changePassword;
        } else {
          throw new Error(payload.Body.Fault.Reason.Text);
        }
      }
      switch (res.status) {
        case 200:
          window.location.assign('/carbonioAdmin');
          break;
        case 401:
        case 500:
          this.authError = t(
            'credentials_not_valid',
            'Credentials are not valid, please check data and try again',
          ) as string;
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
          this.loading = false;
      }
    } catch (err_1: unknown) {
      this.loading = false;
      if (err_1 instanceof Error) {
        if (err_1.message.startsWith('authentication failed')) {
          this.authError = t(
            'credentials_not_valid',
            'Credentials are not valid, please check data and try again',
          );
        } else {
          this.authError = err_1.message;
        }
      }
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  override render(): TemplateResult {
    if (this.progress === FORM_STATE.credentials) {
      return html`
        <credentials-form
          destination-url=${this.destinationUrl}
          .authMethods=${['zimbra']}
          ?disable-inputs=${false}
          auth-error=${this.authError}
          ?loading=${this.loading}
        ></credentials-form>
      `;
    }

    if (this.progress === FORM_STATE.changePassword) {
      return html`
        <change-password-form
          username=${this.email}
          destination-url=${window.location.origin}
        ></change-password-form>
      `;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zimbra-form': ZimbraForm;
  }
}
