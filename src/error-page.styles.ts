/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const errorPageStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--color-gray5-regular);
    height: 100%;
    width: 100%;
  }
  .horizontal-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 70px;
    height: fit-content;
  }
  .image-wrapper {
    width: fit-content;
  }
  .content-wrapper {
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
    gap: 104px;
    margin-top: 64px;
  }
  .text-group {
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
  }
  .row-wrapper {
    display: flex;
    align-items: flex-start;
    height: fit-content;
    gap: 16px;
  }
`;
