/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const selectStyles = css`
  :host {
    display: block;
    position: relative;
    width: 100%;
  }

  /* ── Trigger ─────────────────────────────────────────────── */

  .trigger {
    position: relative;
    cursor: pointer;
    outline: none;
  }

  .trigger-inner {
    position: relative;
    display: flex;
    width: 100%;
    align-items: flex-end;
    justify-content: space-between;
    border-radius: var(--border-radius, 0.25rem) var(--border-radius, 0.25rem) 0 0;
    padding: var(--padding-size-small, 0.5rem) var(--padding-size-large, 1rem);
    box-sizing: border-box;
    transition: background 0.2s ease-out;
    background: var(--color-gray5-regular);
  }

  .trigger-inner:hover {
    background: var(--color-gray5-hover);
  }

  :host([focused]) .trigger-inner {
    background: var(--color-gray5-focus);
  }

  .content-area {
    display: flex;
    flex-grow: 1;
    flex-basis: 0;
    align-items: center;
    min-width: 0;
    box-sizing: border-box;
  }

  .selected-text {
    width: 100%;
    padding-top: var(--padding-size-medium, 0.75rem);
    min-height: 1.167em;
  }

  .label {
    position: absolute;
    left: 0;
    transition: all 150ms ease-out;
    pointer-events: none;
  }

  .label[data-has-selection='false'] {
    top: 50%;
    transform: translateY(-50%);
  }

  .label[data-has-selection='true'] {
    top: calc(0.5rem - 0.0625rem);
    left: 1rem;
    transform: translateY(0);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    align-self: center;
    pointer-events: none;
    line-height: 0;
  }

  /* ── Dropdown ────────────────────────────────────────────── */

  .dropdown {
    position: fixed;
    display: none;
    visibility: hidden;
    pointer-events: none;
    background-color: var(--color-gray5-regular);
    box-shadow: var(--shadow-regular);
    z-index: 999;
    max-height: 50vh;
    overflow-y: auto;
    margin: 0;
    border: none;
    padding: 0;
  }

  .dropdown.open {
    display: block;
    visibility: visible;
    pointer-events: auto;
  }

  .dropdown::-webkit-scrollbar {
    width: 0.5rem;
  }

  .dropdown::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .dropdown::-webkit-scrollbar-thumb {
    background-color: var(--color-gray3-regular);
    border-radius: 0.25rem;
  }

  .dropdown:popover-open {
    display: block;
    visibility: visible;
    pointer-events: auto;
  }

  /* ── Items ───────────────────────────────────────────────── */

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--padding-size-small, 0.5rem);
    padding: var(--padding-size-small, 0.5rem) var(--padding-size-large, 1rem);
    border-radius: var(--border-radius, 0.25rem);
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    outline: none;
    transition: background 0.2s ease-out;
  }

  .dropdown-item:hover {
    background: var(--color-gray5-hover);
  }

  .dropdown-item.active {
    outline: none;
    background: var(--color-gray5-focus);
  }

  .dropdown-item:active {
    background: var(--color-gray5-active);
  }
`;
