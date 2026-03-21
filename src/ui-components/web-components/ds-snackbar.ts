/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { resolveThemeColor } from '../theme/theme-utils';
import { type IconName } from './icon-registry';
import { snackbarStyles } from './snackbar.styles';

const DEFAULT_HIDE_TIMEOUT = 4000;

const icons: Record<'success' | 'info' | 'warning' | 'error', IconName> = {
  success: 'CheckmarkOutline',
  info: 'InfoOutline',
  warning: 'AlertTriangleOutline',
  error: 'CloseCircleOutline',
};

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

@customElement('ds-snackbar')
export class DsSnackbar extends LitElement {
  static override styles = snackbarStyles;

  @property({ type: Boolean, reflect: true })
  accessor open = false;

  @property({ type: String, reflect: true })
  accessor severity: SnackbarSeverity = 'info';

  @property({ type: String })
  accessor label = '';

  @property({ type: String, attribute: 'action-label' })
  accessor actionLabel = 'Ok';

  @property({ type: Number, attribute: 'auto-hide-timeout' })
  accessor autoHideTimeout = DEFAULT_HIDE_TIMEOUT;

  private timeoutId: number | undefined;

  private handleClose(): void {
    this.dispatchEvent(new CustomEvent('snackbar:close', { bubbles: true, composed: true }));
  }

  private handleActionClick(): void {
    this.dispatchEvent(new CustomEvent('snackbar:action-click', { bubbles: true, composed: true }));
  }

  private handleButtonClick(): void {
    this.handleActionClick();
    this.handleClose();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open') || changedProperties.has('autoHideTimeout')) {
      clearTimeout(this.timeoutId);
      if (this.open) {
        this.timeoutId = setTimeout(() => {
          this.handleClose();
        }, this.autoHideTimeout) as unknown as number;
      }
    }
  }

  override disconnectedCallback(): void {
    clearTimeout(this.timeoutId);
    super.disconnectedCallback();
  }

  override render() {
    if (!this.open) return nothing;

    const containerStyles = styleMap({
      '--snackbar-z-index': '1000',
      '--snackbar-background-color': resolveThemeColor(this.severity, 'regular'),
    });

    const progressBarStyles = styleMap({
      animationDuration: `${this.autoHideTimeout}ms`,
      background: resolveThemeColor(this.severity, 'active'),
    });

    return html`
      <div class="snack-container" style=${containerStyles} data-testid="snackbar">
        <div class="snack-content">
          <icon-wc size="large" icon=${icons[this.severity]} color="gray6"></icon-wc>
          <ds-text color="gray6" overflow="break-word">${this.label}</ds-text>
          <ds-button
            label=${this.actionLabel}
            type="ghost"
            color="gray6"
            @click=${this.handleButtonClick}
          ></ds-button>
        </div>
        <div class="progress-bar" style=${progressBarStyles} data-testid="progress-bar"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-snackbar': DsSnackbar;
  }
}
