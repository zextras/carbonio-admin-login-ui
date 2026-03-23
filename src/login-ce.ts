/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './components-v1/page-layout';

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('login-ce')
export class LoginCE extends LitElement {
  override render(): TemplateResult {
    return html`<page-layout is-advanced=${false}></page-layout>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-ce': LoginCE;
  }
}
