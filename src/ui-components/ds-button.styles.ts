/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const buttonStyles = css`
  :host {
    display: inline-block;
    max-width: 100%;
  }

  :host([width='fill']) {
    display: block;
    width: 100%;
  }

  .grid {
    width: var(--btn-width);
    max-width: 100%;
    min-width: 0;
    display: grid;
    place-items: center;
    align-content: center;
    justify-content: stretch;
  }

  .button {
    grid-row: 1;
    grid-column: 1;
    line-height: normal;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-transform: uppercase;
    padding: var(--btn-padding);
    gap: var(--btn-gap);
    width: var(--btn-width);
    max-width: 100%;
    border: none;
    border-radius: 0.25rem;
    color: var(--btn-color);
    background-color: var(--btn-bg);
    cursor: pointer;
    transition:
      color 0.2s ease-out,
      background-color 0.2s ease-out,
      border-color 0.2s ease-out;
    font-family: var(--font-family);
  }

  .outlined {
    border: 0.0625rem solid var(--btn-color);
    padding: var(--btn-padding-adjusted, var(--btn-padding));
  }

  .button:focus:not(:disabled) {
    outline: none;
    color: var(--btn-color-focus, var(--btn-color));
    background-color: var(--btn-bg-focus, var(--btn-bg));
    border-color: var(--btn-color-focus, var(--btn-color));
  }

  .button:hover:not(:disabled) {
    outline: none;
    color: var(--btn-color-hover, var(--btn-color));
    background-color: var(--btn-bg-hover, var(--btn-bg));
    border-color: var(--btn-color-hover, var(--btn-color));
  }

  .button:active:not(:disabled) {
    outline: none;
    color: var(--btn-color-active, var(--btn-color));
    background-color: var(--btn-bg-active, var(--btn-bg));
    border-color: var(--btn-color-active, var(--btn-color));
  }

  .button:disabled {
    cursor: default;
    color: var(--btn-color-disabled, var(--btn-color));
    background-color: var(--btn-bg-disabled, var(--btn-bg));
    border-color: var(--btn-color-disabled, var(--btn-color));
  }

  .loading-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    width: var(--icon-size);
    min-width: var(--icon-size);
    height: var(--icon-size);
    min-height: var(--icon-size);
    flex-shrink: 0;
    order: var(--icon-order, 1);
  }

  .icon[data-loading='true'] {
    opacity: 0;
  }

  .text {
    user-select: none;
    text-transform: uppercase;
    font-size: var(--text-size);
    order: var(--text-order, 2);
    overflow: hidden;
    min-width: 0;
  }

  .text[data-loading='true'] {
    opacity: 0;
  }
`;
