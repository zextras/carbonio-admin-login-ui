/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const offlineModalStyles = css`
  :host {
    display: contents;
  }

  .dialog {
    max-width: 90vw;
    max-height: 90vh;
    width: 31.25rem;
    padding: 0;
    border: none;
    border-radius: 1rem;
    background-color: var(--color-gray6-regular);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
    overflow: visible;
    color-scheme: dark;
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog:focus {
    outline: none;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    min-width: 25rem;
    box-sizing: border-box;
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: var(--padding-size-small);
    padding-bottom: var(--padding-size-small);
  }

  .modal-title {
    flex: 1;
    line-height: 1.5;
    padding: var(--padding-size-small) 0;
  }

  .modal-body {
    overflow-y: auto;
    padding-block: var(--padding-size-large);
    flex-grow: 1;
  }

  .modal-body::-webkit-scrollbar {
    width: 0.5rem;
  }

  .paragraph {
    padding-bottom: 0.8rem;
  }

  .paragraph:last-child {
    padding-bottom: 0;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--padding-size-large);
  }
`;
