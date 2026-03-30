/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ui-components/theme/theme.css';
import '../ui-components/ds-text';
import '../ui-components/ds-button';
import '../ui-components/ds-divider';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { offlineModalStyles } from './offline-modal-styles';

@customElement('offline-modal')
export class OfflineModal extends LitElement {
  static override styles = offlineModalStyles;

  @property({ type: Boolean, reflect: true })
  accessor open = false;

  @query('dialog')
  private accessor dialog!: HTMLDialogElement;

  private previousActiveElement: HTMLElement | null = null;

  private handleClose(): void {
    this.dispatchEvent(new CustomEvent('offline-modal:close', { bubbles: true, composed: true }));
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog) {
      this.handleClose();
    }
  }

  private handleCancel(event: Event): void {
    event.preventDefault();
    this.handleClose();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.previousActiveElement = document.activeElement as HTMLElement;
        this.dialog?.showModal();
        document.body.style.overflow = 'hidden';
        document.body.style.scrollbarGutter = 'stable';
      } else {
        this.dialog?.close();
        document.body.style.overflow = '';
        document.body.style.scrollbarGutter = '';
        this.previousActiveElement?.focus();
      }
    }
  }

  override disconnectedCallback(): void {
    document.body.style.overflow = '';
    document.body.style.scrollbarGutter = '';
    super.disconnectedCallback();
  }

  override render(): TemplateResult {
    const modalTitle = i18next.t('modal.offline.title', 'Offline');
    const modalDescription = i18next.t(
      'modal.offline.description',
      'You are currently offline, please check your internet connection',
    );

    return html`
      <dialog
        class="dialog"
        @click=${this.handleBackdropClick}
        @cancel=${this.handleCancel}
        aria-labelledby="offline-modal-title"
        aria-describedby="offline-modal-description"
      >
        <div class="modal-content">
          <div class="modal-header">
            <ds-text as="h2" id="offline-modal-title" class="modal-title" weight="bold">
              ${modalTitle}
            </ds-text>
            <ds-button
              icon="Close"
              size="large"
              type="ghost"
              color="text"
              @click=${this.handleClose}
              aria-label=${i18next.t('modal.offline.close', 'Close')}
            ></ds-button>
          </div>
          <ds-divider></ds-divider>
          <div class="modal-body">
            <ds-text
              as="p"
              id="offline-modal-description"
              overflow="break-word"
              line-height=${1.4}
              class="paragraph"
              data-testid="offlineMsg"
            >
              ${modalDescription}
            </ds-text>
          </div>
          <ds-divider></ds-divider>
          <div class="modal-footer">
            <ds-button color="primary" min-width="6.25rem" @click=${this.handleClose} label="OK">
            </ds-button>
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'offline-modal': OfflineModal;
  }
}
