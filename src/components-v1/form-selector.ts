/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../components-index/not-supported-version';
import '../components-index/server-not-responding';
import './v1-login-manager';
import './v2-login-manager';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { doAuthLogout, getAuthSupported } from '../services/auth-configuration-service';
import { type Configuration } from './credentials-form';

@customElement('form-selector')
export class FormSelector extends LitElement {
  static override styles = css`
    :host {
      width: 100%;
    }
  `;

  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @property({ type: String })
  accessor domain: string | null = null;

  @state()
  private accessor configuration: Configuration = null;

  @state()
  private accessor error = false;

  @state()
  private accessor disableInputs = true;

  private _isConnected = false;

  private async fetchConfiguration(): Promise<void> {
    try {
      const res = await getAuthSupported(this.domain);
      if (this._isConnected) {
        this.configuration = {
          ...(this.configuration ?? {}),
          ...res,
          destinationUrl: this.destinationUrl,
        };
        this.disableInputs = false;
      }
    } catch {
      if (this._isConnected) {
        this.error = true;
      }
    }
  }

  private handleLogout(): void {
    const urlParams = new URLSearchParams(globalThis.location.search);
    if (this.configuration && urlParams.has('loginOp') && urlParams.get('loginOp') === 'logout') {
      doAuthLogout(this.configuration).catch(() => {
        // Logout failed - silently ignore
      });
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._isConnected = true;
    this.fetchConfiguration();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._isConnected = false;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('destinationUrl') || changedProperties.has('domain')) {
      this.fetchConfiguration();
    }
    if (changedProperties.has('configuration')) {
      this.handleLogout();
    }
  }

  private renderServerError(): TemplateResult {
    return html`<server-not-responding></server-not-responding>`;
  }

  private renderLoading(): TemplateResult {
    return html`<div></div>`;
  }

  private renderV2LoginManager(): TemplateResult {
    return html`
      <v2-login-manager
        destination-url=${this.configuration!.destinationUrl}
        .authMethods=${this.configuration!.authMethods ?? []}
        ?disable-inputs=${this.disableInputs}
      ></v2-login-manager>
    `;
  }

  private renderV1LoginManager(): TemplateResult {
    return html`
      <v1-login-manager
        destination-url=${this.configuration!.destinationUrl}
        .authMethods=${this.configuration!.authMethods ?? []}
        ?disable-inputs=${this.disableInputs}
      ></v1-login-manager>
    `;
  }

  private renderNotSupported(): TemplateResult {
    return html`<not-supported-version></not-supported-version>`;
  }

  override render(): TemplateResult {
    if (this.error) {
      return this.renderServerError();
    }

    if (!this.configuration?.destinationUrl) {
      return this.renderLoading();
    }

    const { maxApiVersion, minApiVersion } = this.configuration;

    if (maxApiVersion && maxApiVersion >= 2 && minApiVersion && minApiVersion <= 2) {
      return this.renderV2LoginManager();
    }

    if (maxApiVersion && maxApiVersion >= 1 && minApiVersion && minApiVersion <= 1) {
      return this.renderV1LoginManager();
    }

    return this.renderNotSupported();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'form-selector': FormSelector;
  }
}
