/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const passwordInputStyles = `
  ds-password-input {
    display: block;
    width: 100%;
  }

  ds-password-input .toggle-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    outline: none;
  }

  ds-password-input .toggle-button:focus {
    outline: 2px solid var(--color-primary-regular, #0d6efd);
    outline-offset: 2px;
    border-radius: var(--border-radius, 0.25rem);
  }

  ds-password-input .toggle-button:disabled {
    cursor: default;
  }
`;
