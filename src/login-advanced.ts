/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './components-v1/page-layout';
import './error-page';

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { getLoginSupported } from './services/login-page-services';

type Versions = {
  minApiVersion: number;
  maxApiVersion: number;
  version: number;
};

@customElement('login-advanced')
export class LoginAdvanced extends LitElement {
  @state()
  private accessor versions: Versions | undefined = undefined;

  @state()
  private accessor hasError = false;

  private _abortController: AbortController | null = null;

  private get notSupported(): boolean {
    return this.hasError || (this.versions !== undefined && this.versions.version < this.versions.minApiVersion);
  }

  override connectedCallback(): void {
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    getLoginSupported(signal)
      .then(({ minApiVersion, maxApiVersion }) => {
        if (!signal.aborted) {
          this.versions = {
            minApiVersion,
            maxApiVersion,
            version: maxApiVersion,
          };
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          this.hasError = true;
        }
      });
  }

  override disconnectedCallback(): void {
    this._abortController?.abort();
  }

  override render(): TemplateResult {
    if (this.versions !== undefined && this.versions.version >= this.versions.minApiVersion) {
      return html`<page-layout version=${this.versions.version} is-advanced></page-layout>`;
    }

    if (this.notSupported) {
      return html`<error-page></error-page>`;
    }

    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-advanced': LoginAdvanced;
  }
}
