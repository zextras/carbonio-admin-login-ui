/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const snackbarStyles = css`
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }

  @keyframes fadeInRight {
    from {
      transform: translateX(3.125rem);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  :host {
    display: none;
  }

  :host([open]) {
    display: flex;
  }

  .snack-container {
    position: fixed;
    user-select: none;
    right: 0;
    bottom: 5vh;
    box-shadow: var(--shadow-snackbar);
    z-index: var(--snackbar-z-index, 1000);
    display: flex;
    background-color: var(--snackbar-background-color);
    flex-direction: column;
    width: auto;
    height: auto;
    max-width: 40%;
    gap: 0;
    animation: fadeInRight 225ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .snack-content {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    padding: 0.5rem 0.5rem 0.5rem 1.5rem;
    align-items: center;
  }

  .snack-content > icon-wc {
    flex-shrink: 0;
  }

  .snack-content > zx-text {
    flex: 1 1 50%;
    min-width: 0;
  }

  .snack-content > ds-button {
    margin-left: auto;
    flex-shrink: 0;
  }

  .progress-bar {
    animation-name: shrink;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    border-radius: 1rem 0 0 1rem;
    align-self: flex-end;
    height: 0.25rem;
    width: 100%;
  }
`;
