/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './error-page';
import './loading-view';
import './login-advanced';
import './login-ce';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { getAdvancedSupported } from './services/advanced-supported';

type ApiResponse = { supported: boolean } | { isLoading: true } | { errorMessage: string };

@customElement('app-root')
export class AppRoot extends LitElement {
  @state()
  private accessor apiResponse: ApiResponse = { isLoading: true };

  private _abortController: AbortController | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    getAdvancedSupported().then((data) => {
      if (!signal.aborted) {
        if ('supported' in data) {
          this.apiResponse = { supported: data.supported };
        } else {
          this.apiResponse = { errorMessage: '' };
        }
      }
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._abortController?.abort();
  }

  override render(): TemplateResult {
    const isLoading = 'isLoading' in this.apiResponse;
    const hasError = 'errorMessage' in this.apiResponse;
    const hasSupported = 'supported' in this.apiResponse;
    const isSupported = hasSupported && (this.apiResponse as { supported: boolean }).supported;

    return html`
      ${hasError ? html`<error-page></error-page>` : nothing}
      ${isLoading ? html`<loading-view></loading-view>` : nothing}
      ${hasSupported && isSupported ? html`<login-advanced></login-advanced>` : nothing}
      ${hasSupported && !isSupported ? html`<login-ce></login-ce>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
