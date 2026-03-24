/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './i18n/i18n.config';
import './index.css';
import './loading-view';
import './ui-components/';
import './app';

function getAppRoot(): HTMLElement {
	const root = document.getElementById('app');
	if (!root) {
		throw new Error('Root element #app not found');
	}
	return root;
}

function mountApp(): void {
	const root = getAppRoot();
	const appElement = document.createElement('app-root');
	root.appendChild(appElement);
}

document.addEventListener('DOMContentLoaded', mountApp);
