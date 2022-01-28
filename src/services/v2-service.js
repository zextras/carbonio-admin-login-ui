// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { getDeviceModel, deviceId } from '../utils';

export function postV2Login(authMethod, user, password, service) {
	return fetch('/zx/auth/v2/login', {
		method: 'POST',
		headers: {
			'X-Device-Model': getDeviceModel(),
			'X-Device-Id': deviceId(),
			'X-Service': 'WebUI',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			auth_method: authMethod,
			user,
			password
		})
	});
}

export function submitOtp(id, code, trustDevice) {
	return fetch('/zx/auth/v2/otp/validate', {
		method: 'POST',
		headers: {
			'X-Device-Model': getDeviceModel(),
			'X-Device-Id': deviceId(),
			'X-Service': 'WebUI',
			'Content-Type': 'application/json',
			version: '2'
		},
		body: JSON.stringify({
			id,
			code,
			unsecure_device: !trustDevice
		})
	});
}