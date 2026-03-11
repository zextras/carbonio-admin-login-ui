/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import i18next from 'i18next';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { CARBONIO_CE_SUPPORTED_BROWSER_LINK, CARBONIO_SUPPORTED_BROWSER_LINK } from '../constants';

@customElement('browser-support-message')
export class BrowserSupportMessage extends LitElement {
  static override styles = css`
    a {
      text-decoration-line: underline;
      cursor: pointer;
      color: #2b73d2;
    }
  `;

  @property({ type: Boolean, attribute: 'is-supported-browser' })
  accessor isSupportedBrowser = false;

  @property({ type: Boolean, attribute: 'is-advanced' })
  accessor isAdvanced = false;

  private get i18nKey(): string {
    return this.isSupportedBrowser ? 'browser_fully_supported' : 'browser_limited_supported';
  }

  private get defaultValue(): string {
    return this.isSupportedBrowser
      ? 'Your browser is fully <a>supported</a>'
      : 'Having troubles? Try a fully <a>supported</a> browser';
  }

  private get href(): string {
    return this.isAdvanced ? CARBONIO_SUPPORTED_BROWSER_LINK : CARBONIO_CE_SUPPORTED_BROWSER_LINK;
  }

  override render() {
    const translated = i18next.t(this.i18nKey, {
      defaultValue: this.defaultValue,
    });

    const interpolated = translated.replace(
      /<a>(.*?)<\/a>/,
      `<a href="${this.href}" target="_blank" rel="noreferrer" aria-label="supported">$1</a>`,
    );

    return html`${unsafeHTML(interpolated)}`;
  }
}
