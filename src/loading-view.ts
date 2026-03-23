/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import helmet from './assets/carbonio-head.svg';
import { loadingViewStyles } from './loading-view.styles';

@customElement('loading-view')
export class LoadingView extends LitElement {
  static override styles = loadingViewStyles;

  override render(): TemplateResult {
    return html`
      <img src=${helmet} alt="carbonio-head" />
      <div class="loader" data-testid="loading-view">
        <div class="bar"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-view': LoadingView;
  }
}
