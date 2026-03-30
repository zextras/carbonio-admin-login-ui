/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ui-components/ds-button';
import '../ui-components/ds-input';
import '../ui-components/ds-password-input';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { checkClassicUi } from '../services/login-page-services';
import { setCookie } from '../utils';

const urlParams = new URLSearchParams(window.location.search);

export type Configuration = {
  destinationUrl: string;
  minApiVersion?: number;
  maxApiVersion?: number;
  authMethods?: Array<string>;
} | null;

@customElement('credentials-form')
export class CredentialsForm extends LitElement {
  @property({ type: String, attribute: 'auth-error' })
  accessor authError = '';

  @property({ type: Boolean })
  accessor loading = false;

  @property({ type: Boolean, attribute: 'disable-inputs' })
  accessor disableInputs = false;

  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @property({ type: Array, attribute: 'auth-methods' })
  accessor authMethods: Array<string> = [];

  private username = urlParams.get('username') || '';
  private password = '';

  override connectedCallback(): void {
    super.connectedCallback();
    checkClassicUi()
      .then((res) => {
        if (!res.hasClassic) {
          setCookie('UI', 'iris');
        }
      })
      .catch(() => {});
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    if (this.username && this.password) {
      let usernameModified = this.username;
      if (urlParams.has('virtualacctdomain')) {
        usernameModified = `${usernameModified.replace('@', '.')}@${urlParams.get('virtualacctdomain')}`;
      } else if (urlParams.has('customerDomain') && !this.username.includes('@')) {
        usernameModified = `${usernameModified.trim()}@${urlParams.get('customerDomain')}`;
      }
      this.dispatchEvent(
        new CustomEvent('credentials-submit', {
          detail: { username: usernameModified, password: this.password },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleUsernameChange(e: CustomEvent<{ value: string }>): void {
    this.username = e.detail.value;
  }

  private handlePasswordChange(e: CustomEvent<{ value: string }>): void {
    this.password = e.detail.value;
  }

  private handleSamlClick(): void {
    window.location.assign(`/zx/auth/startSamlWorkflow?redirectUrl=${this.destinationUrl}`);
  }

  private renderSamlButton(): TemplateResult {
    if (this.authMethods?.includes('saml')) {
      return html`
        <ds-button
          type="outlined"
          data-testid="loginSaml"
          .label=${i18next.t('login_saml', 'Login SAML')}
          color="primary"
          ?disabled=${this.disableInputs}
          @click=${this.handleSamlClick}
          style="height: 36px"
        ></ds-button>
      `;
    }
    return html`<div style="min-height: 20px"></div>`;
  }

  override render(): TemplateResult {
    const t = i18next.t.bind(i18next);

    return html`
      <form
        @submit=${(e: Event) => e.preventDefault()}
        style="width: 100%"
        data-testid="credentials-form"
      >
        <div
          style="display: flex; align-items: center; justify-content: center; padding: 0 0 var(--padding-size-large) 0; box-sizing: border-box"
        >
          <ds-input
            default-value=${this.username}
            ?disabled=${this.disableInputs}
            ?has-error=${!!this.authError}
            data-testid="username"
            @change=${this.handleUsernameChange}
            label=${t('username', 'Username')}
          ></ds-input>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: center; padding: 0 0 var(--padding-size-small) 0; box-sizing: border-box"
        >
          <ds-password-input
            initial-value=${this.password}
            ?disabled=${this.disableInputs}
            data-testid="password"
            ?has-error=${!!this.authError}
            @change=${this.handlePasswordChange}
            label=${t('password', 'Password')}
          ></ds-password-input>
        </div>
        <ds-text as="span" color="error" size="small" overflow="break-word">
          ${this.authError || html`<br />`}
        </ds-text>

        <div
          style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: var(--padding-size-small) 0 var(--padding-size-large) 0; box-sizing: border-box"
        >
          <ds-button
            style="height: 36px"
            ?loading=${this.loading}
            data-testid="login"
            @click=${this.handleSubmit}
            ?disabled=${this.disableInputs}
            label=${t('login', 'Login')}
            width="fill"
          ></ds-button>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: flex-end; padding: 0 0 var(--padding-size-extralarge) 0; box-sizing: border-box"
        >
          ${this.renderSamlButton()}
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'credentials-form': CredentialsForm;
  }
}
