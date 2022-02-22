// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { carbonioConfig } from "../config/carbonio-config";

export function getLoginSupported() {
	return fetch('/zx/login/supported')
		.then((res) => {
			if (res.status === 200) return res.json();
			throw Error('Network Error');
		});
}

export function getLoginConfig(version, domain, host) {
	const carbonioConfigData = carbonioConfig();
	console.log('[carbonioConfigData]: ', carbonioConfigData);
	console.warn('[carbonioConfigData] warn: ', carbonioConfigData);
	console.error('[carbonioConfigData] error: ', carbonioConfigData);
	return new Promise((resolve, reject) => {
		resolve(carbonioConfigData);
	});
}

export function checkClassicUi() {
	return fetch('/public/blank.html')
		.then(res => {
			if (res.status === 404) {
				return { hasClassic: false }
			}
			return { hasClassic: true }
		})
}