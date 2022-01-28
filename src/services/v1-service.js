// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { getDeviceModel, deviceId } from '../utils';

export function postV1Login(authMethod, user, password, service) {
	return fetch('/zx/auth/v1/login', {
		method: 'POST',
		headers: {
			'X-Device-Model': getDeviceModel(),
			'X-Device-Id': deviceId(),
			'X-Service': 'webUI',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			auth_method: authMethod,
			user,
			password
		})
	});
}
