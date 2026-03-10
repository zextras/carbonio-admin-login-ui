/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css, html, LitElement } from 'lit';

export class SpinnerWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    svg {
      animation: rotate 2s linear infinite;
      margin: -25px 0 0 -25px;
      width: 50px;
      height: 50px;
    }
    .path {
      stroke: #0000ff;
      animation: dash 1.5s ease-in-out infinite;
    }
    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.dataset.testid = 'spinner';
  }

  override render() {
    return html`
      <svg viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spinner-wc': SpinnerWC;
  }
}

if (!customElements.get('spinner-wc')) {
  customElements.define('spinner-wc', SpinnerWC);
}
