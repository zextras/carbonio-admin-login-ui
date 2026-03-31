/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './ds-icon';
import './ds-button';
import './ds-text';

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { snackbarStyles } from './ds-snackbar.styles';
import { type IconName } from './icon-registry';
import { resolveThemeColor } from './theme/theme-utils';

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

  @state()
  accessor closing = false;

  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private timerStart = 0;
  private remainingTime = 0;

  private clearTimer(): void {
    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }

  private startTimer(duration: number): void {
    this.clearTimer();
    this.timerStart = Date.now();
    this.remainingTime = duration;
    this.timeoutId = setTimeout(() => {
      this.handleClose();
    }, duration);
  }

  private handleClose(): void {
    this.clearTimer();
    this.dispatchEvent(new CustomEvent('snackbar:close', { bubbles: true, composed: true }));
  }

  private handleActionClick(): void {
    this.dispatchEvent(new CustomEvent('snackbar:action-click', { bubbles: true, composed: true }));
  }

  private handleButtonClick(): void {
    this.handleActionClick();
    this.handleClose();
  }

  private handleMouseEnter(): void {
    if (!this.open || this.closing) return;
    this.clearTimer();
    this.remainingTime = Math.max(0, this.remainingTime - (Date.now() - this.timerStart));
  }

  private handleMouseLeave(): void {
    if (!this.open || this.closing) return;
    this.startTimer(this.remainingTime);
  }

  private handleAnimationEnd(event: AnimationEvent): void {
    if (event.animationName === 'fadeOutLeft' && this.closing) {
      this.closing = false;
      this.removeAttribute('closing');
    }
  }

  override willUpdate(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.closing = false;
        this.removeAttribute('closing');
      } else if (changedProperties.get('open')) {
        this.closing = true;
        this.setAttribute('closing', '');
      }
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.startTimer(this.autoHideTimeout);
      } else {
        this.clearTimer();
      }
    }
    if (changedProperties.has('autoHideTimeout') && this.open && !this.closing) {
      this.startTimer(this.autoHideTimeout);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimer();
  }

  override render() {
    if (!this.open && !this.closing) return nothing;

    const containerStyles = styleMap({
      '--snackbar-z-index': '1000',
      '--snackbar-background-color': resolveThemeColor(this.severity, 'regular'),
    });

    const progressBarStyles = styleMap({
      animationDuration: `${this.autoHideTimeout}ms`,
      background: resolveThemeColor(this.severity, 'active'),
    });

    return html`
      <div
        class="snack-container${this.closing ? ' closing' : ''}"
        style=${containerStyles}
        role="status"
        aria-live="polite"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @animationend=${this.handleAnimationEnd}
      >
        <div class="snack-content">
          <ds-icon size="large" icon=${icons[this.severity]} color="gray6"></ds-icon>
          <ds-text as="span" color="gray6" overflow="break-word">${this.label}</ds-text>
          <ds-button
            label=${this.actionLabel}
            type="ghost"
            color="gray6"
            aria-label=${this.actionLabel}
            @click=${this.handleButtonClick}
          ></ds-button>
        </div>
        <div class="progress-bar" style=${progressBarStyles}></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-snackbar': DsSnackbar;
  }
}
