/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import backgroundImageUrl from '../assets/carbonio_light.jpg';
import backgroundImageRetinaUrl from '../assets/carbonio_light-retina.jpg';
import logoCarbonio from '../assets/carbonio-admin-panel.svg';
import { CARBONIO_LOGO_URL } from '../constants';
import { getLoginConfig } from '../services/login-page-services';
import { isSafeRedirect, prepareUrlForForward } from '../utils';
import { pageLayoutStyles } from './page-layout.styles';
import { type Logo, processLoginConfig } from './page-layout-utils';

@customElement('page-layout')
export class PageLayout extends LitElement {
  static override styles = pageLayoutStyles;

  @property({ type: Number })
  accessor version = 1;

  @property({ type: Boolean, attribute: 'is-advanced' })
  accessor isAdvanced = false;

  @state()
  private accessor logo: Logo | null = null;

  @state()
  private accessor serverError = false;

  @state()
  private accessor destinationUrl: string | null | undefined = '';

  @state()
  private accessor domain: string | null = null;

  @state()
  private accessor bg = backgroundImageUrl;

  @state()
  private accessor isDefaultBg = true;

  @state()
  private accessor copyrightBanner = '';

  private _isConnected = false;

  private _urlParams = new URLSearchParams(window.location.search);

  private get isSupportedBrowser(): boolean {
    const ua = navigator.userAgent;
    return ua.includes('Chrome') || ua.includes('Firefox');
  }

  private async fetchLoginConfig(): Promise<void> {
    if (!this.isAdvanced) {
      this.logo = { image: logoCarbonio, width: '221px', url: CARBONIO_LOGO_URL };
      document.title = i18next.t('carbonio_authentication', 'Carbonio Authentication');
      return;
    }

    try {
      const res = await getLoginConfig(this.version, this.domain, window.location.hostname);

      if (!this._isConnected) return;

      if (!this.destinationUrl) {
        this.destinationUrl =
          prepareUrlForForward(res.adminConsolePublicUrl ?? res.publicUrl) ?? '';
      }
      if (!this.domain) {
        this.domain = res.zimbraDomainName ?? '';
      }

      const t = i18next.t.bind(i18next);
      processLoginConfig({
        res,
        version: this.version,
        setBg: (bg: string) => {
          this.bg = bg;
        },
        setIsDefaultBg: (isDefault: boolean) => {
          this.isDefaultBg = isDefault;
        },
        setCopyrightBanner: (banner: string) => {
          this.copyrightBanner = banner;
        },
        setLogo: (logo: Logo) => {
          this.logo = logo;
        },
        t,
      });
    } catch {
      if (this._isConnected) {
        this.serverError = true;
      }
    }
  }

  private getSafeRedirectUrl = (url: string | null) => {
    if (url === null) return null;
    return isSafeRedirect(url) ? prepareUrlForForward(url) : '/';
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this._isConnected = true;

    this.destinationUrl = this.getSafeRedirectUrl(
      prepareUrlForForward(this._urlParams.get('destinationUrl') ?? '') ?? '',
    );

    this.domain = this._urlParams.get('domain');

    this.fetchLoginConfig();
  }

  override disconnectedCallback(): void {
    this._isConnected = false;
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('version') || changedProperties.has('isAdvanced')) {
      this.fetchLoginConfig();
    }
    if (changedProperties.has('isDefaultBg') && this.isDefaultBg) {
      this.bg = backgroundImageUrl;
    }
  }

  private renderServerError(): TemplateResult {
    return html`<server-not-responding></server-not-responding>`;
  }

  private renderLogo(): TemplateResult {
    if (!this.logo) return html``;

    const logoImage = html`
      <img
        alt="Logo"
        src=${this.logo.image}
        width=${this.logo.width}
        class="logoImage"
        data-testid="logo"
      />
    `;

    if (this.logo.url) {
      return html`
        <a target="_blank" href=${this.logo.url} rel="noreferrer" data-testid="logo-link">
          ${logoImage}
        </a>
      `;
    }

    return logoImage;
  }

  private renderCopyright(): TemplateResult {
    const t = i18next.t.bind(i18next);
    const year = new Date().getFullYear();

    if (this.copyrightBanner) {
      return html`
        <ds-text as="span" size="small" overflow="break-word"> ${this.copyrightBanner} </ds-text>
      `;
    }

    return html`
      <ds-text as="span" size="small" overflow="break-word" data-testid="default-banner">
        ${t('copy_right', 'Copyright')} &copy; ${year} Zextras,
        ${t('all_rights_reserved', 'All rights reserved')}
      </ds-text>
    `;
  }

  override render(): TemplateResult {
    if (this.serverError) {
      return this.renderServerError();
    }

    if (!this.logo) {
      return html``;
    }

    const containerClasses = {
      loginContainer: true,
      retina: this.isDefaultBg,
    };

    return html`
      <div
        class=${classMap(containerClasses)}
        style="--background-image: url(${this
          .bg}); --background-image-retina: url(${backgroundImageRetinaUrl});"
      >
        <div class="formWrapper" data-testid="form-container">
          <div class="logoSection">${this.renderLogo()}</div>

          ${this.isAdvanced
            ? html`
                <form-selector
                  domain=${this.domain ?? ''}
                  destination-url=${this.destinationUrl ?? ''}
                ></form-selector>
              `
            : html` <zimbra-form destination-url=${this.destinationUrl ?? ''}></zimbra-form> `}

          <div class="bottomSection">
            <div class="browserSupportRow">
              <div class="iconPadding">
                <ds-icon
                  color="secondary"
                  icon=${this.isSupportedBrowser ? 'CheckmarkOutline' : 'InfoOutline'}
                  size="medium"
                ></ds-icon>
              </div>
              <ds-text as="span" size="small" color="secondary" weight="light">
                <browser-support-message
                  .is-supported-browser=${this.isSupportedBrowser}
                  .is-advanced=${this.isAdvanced}
                ></browser-support-message>
              </ds-text>
            </div>
            ${this.renderCopyright()}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-layout': PageLayout;
  }
}
