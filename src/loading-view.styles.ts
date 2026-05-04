/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const loadingViewStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    width: 100vw;
    height: 100vh;
    padding: 15vh 30vw;
    box-sizing: border-box;
  }

  img {
    display: block;
  }

  .loader {
    height: 4px;
    min-height: 4px;
    position: relative;
    width: 100%;
    overflow-x: clip;
    overflow-y: visible;
  }

  .bar {
    position: absolute;
    transform: translateX(-50%);
    top: -2px;
    height: 8px;
    animation-name: loader-animation;
    animation-direction: alternate;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }

  @keyframes loader-animation {
    0% {
      width: 20%;
      left: 0%;
    }
    50% {
      width: 50%;
    }
    100% {
      left: 100%;
      width: 20%;
    }
  }

  @media (prefers-color-scheme: dark) {
    :host {
      background: #00506d;
      color: #ffffff;
    }
    .bar {
      background-color: #ffffff;
    }
    .loader {
      background: #aac8ee;
    }
  }

  @media (prefers-color-scheme: light) {
    :host {
      background: #e5e5e5;
      color: #a3aebc;
    }
    .bar {
      background-color: #00506d;
    }
    .loader {
      background: #ffffff;
    }
  }
`;
