/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import errorSVG from './assets/carbonio-load-app-error.svg';
import { errorPageStyles } from './error-page.styles';

@customElement('error-page')
export class ErrorPage extends LitElement {
  static override styles = errorPageStyles;

  override render() {
    return html`
      <div class="horizontal-container">
        <div class="image-wrapper">
          <img src=${errorSVG} alt="load-error" />
        </div>
        <div class="content-wrapper">
          <div class="text-group">
            <ds-text style="--ds-text-font-size: 64px" weight="medium" color="primary">
              ${i18next.t('error.something_went_wrong', 'Something went wrong')}
            </ds-text>
            <ds-text
              as="h2"
              overflow="break-word"
              style="--ds-text-font-size: 40px"
              weight="light"
              color="secondary"
            >
              ${i18next.t(
                'error.loading_page',
                'We’re sorry, but there was an error trying to load this page.',
              )}
            </ds-text>
          </div>
          <div class="row-wrapper">
            <ds-text as="p" style="--ds-text-font-size: 24px" weight="regular" color="secondary">
              ${i18next.t('error.contact_support', 'Contact support or try refreshing the page')}
            </ds-text>
            <ds-button
              icon-placement="left"
              icon="Refresh"
              .label=${i18next.t('button.refresh_page', 'REFRESH')}
              type="outlined"
              color="primary"
              @click=${(): void => window.location.reload()}
            ></ds-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-page': ErrorPage;
  }
}
