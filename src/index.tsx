/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './i18n/i18n.config';
import './index.css';
import './ui-components/web-components/';

import { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app';
import { LoadingView } from './loading-view';

function getAppRoot(): HTMLElement {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Root element #app not found');
  }
  return root;
}

ReactDOM.createRoot(getAppRoot()).render(
  <StrictMode>
    <Suspense fallback={<LoadingView />}>
      <App />
    </Suspense>
  </StrictMode>,
);
