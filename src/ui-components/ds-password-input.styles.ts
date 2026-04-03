/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const passwordInputStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    outline: none;
  }

  .toggle-button:focus {
    outline: 2px solid var(--color-primary-regular, #0d6efd);
    outline-offset: 2px;
    border-radius: var(--border-radius, 0.25rem);
  }

  .toggle-button:disabled {
    cursor: default;
  }
`;
