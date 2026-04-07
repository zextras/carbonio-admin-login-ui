/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const inputStyles = `
  ds-input {
    display: block;
    width: 100%;
  }

  ds-input .input-wrapper {
    display: flex;
    flex-direction: column;
    height: fit-content;
    width: 100%;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: nowrap;
    border-radius: var(--border-radius, 0.25rem);
    box-sizing: border-box;
  }

  ds-input .input-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    width: 100%;
    height: fit-content;
    padding: 0 var(--padding-size-medium, 1rem);
    gap: 0.5rem;
    border-radius: var(--border-radius, 0.25rem) var(--border-radius, 0.25rem) 0 0;
    box-sizing: border-box;
    min-height: calc(
      var(--font-size-medium, 1rem) * 1.5 + var(--font-size-extrasmall, 0.625rem) * 1.5 + 0.125rem
    );
    cursor: text;
    background: var(--input-container-bg);
    transition: background 0.2s ease-out;
  }

  ds-input .input-container:hover {
    background: var(--input-container-bg-hover);
  }

  ds-input .input-container:focus-within {
    background: var(--input-container-bg-focus);
  }

  ds-input .input-container:active {
    background: var(--input-container-bg-active);
  }

  ds-input .input-container[data-disabled] {
    cursor: default;
    background: var(--input-container-bg-disabled);
  }

  ds-input .relative-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    border-radius: var(--border-radius, 0.25rem);
    box-sizing: border-box;
    padding: var(--padding-vertical, 0.625rem) 0;
    height: 100%;
    flex: 1;
    min-width: 0;
    min-height: inherit;
    position: relative;
    --input-color: var(--color-text-regular);
    --input-color-disabled: var(--color-text-disabled);
    --label-color: var(--label-color);
  }

  ds-input .relative-container[data-has-label='true'] {
    --padding-vertical: 0.0625rem;
  }

  ds-input .relative-container[data-has-label='false'] {
    --padding-vertical: 0.625rem;
  }

  ds-input .input {
    border: none !important;
    height: auto !important;
    width: 100%;
    outline: 0;
    background: transparent !important;
    font-size: var(--font-size-medium, 1rem);
    font-weight: var(--font-weight-regular, 400);
    font-family: var(--font-family);
    color: var(--input-color);
    transition: background 0.2s ease-out;
    line-height: 1.5;
    padding: 0;
  }

  ds-input .input:disabled {
    color: var(--input-color-disabled);
  }

  ds-input .input::placeholder {
    color: transparent;
    font-size: 0;
    user-select: none;
  }

  ds-input .label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    font-size: var(--font-size-medium, 1rem);
    font-weight: var(--font-weight-regular, 400);
    font-family: var(--font-family);
    line-height: 1.5;
    color: var(--label-color);
    transition:
      transform 150ms ease-out,
      font-size 150ms ease-out,
      top 150ms ease-out,
      left 150ms ease-out;
    cursor: inherit;
    user-select: none;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  ds-input .input:focus ~ .label,
  ds-input .input:not(:placeholder-shown) ~ .label {
    top: 0;
    transform: translateY(0);
    font-size: var(--font-size-extrasmall, 0.625rem);
  }

  ds-input .icon-slot {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;
