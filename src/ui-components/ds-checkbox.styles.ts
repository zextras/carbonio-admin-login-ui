import { css } from 'lit';
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const checkboxStyles = css`
  :host {
    display: flex;
    flex-direction: row;
    width: fit-content;
    height: fit-content;
    align-items: flex-start;
    cursor: default;
  }

  :host([disabled]) {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input[type='checkbox'] {
    appearance: none;
    position: absolute;
    width: var(--icon-size-large, 1.5rem);
    height: var(--icon-size-large, 1.5rem);
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  .wrapper {
    display: flex;
    align-items: center;
    height: calc(var(--font-size-medium, 1rem) * 1.5);
    cursor: inherit;
  }

  input:focus-visible + ds-icon {
    --icon-color: var(--ds-checkbox-focus);
  }

  .wrapper:hover ds-icon {
    --icon-color: var(--ds-checkbox-hover);
  }

  .wrapper:active ds-icon {
    --icon-color: var(--ds-checkbox-active);
  }

  .label {
    padding-left: var(--padding-size-small, 0.5rem);
    user-select: none;
    line-height: 1.5;
  }
`;
