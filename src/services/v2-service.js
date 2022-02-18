// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { getDeviceModel, deviceId } from '../utils';

export function postV2Login(authMethod, user, password, service) {
	return fetch('/service/auth/v2/login', {
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
	return fetch('/service/auth/v2/otp/validate', {
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

export function loginToCarbonioAdmin(configuration, username, password) {
	return fetch(`/service/admin/soap/AuthRequest`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/soap+xml'
		},
		referrerPolicy: 'same-origin',
		body: `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header><context xmlns="urn:zimbra"><userAgent xmlns="" name="CarbonioWebClient - FF97 (Linux)"/><session xmlns=""/><authTokenControl xmlns="" voidOnExpired="1"/><format xmlns="" type="js"/></context></soap:Header><soap:Body><AuthRequest xmlns="urn:zimbraAdmin"><name xmlns="">${ username }</name><password xmlns="">${password}</password><virtualHost xmlns="">nbm-s03.demo.zextras.io</virtualHost><csrfTokenSecured xmlns="">1</csrfTokenSecured></AuthRequest></soap:Body></soap:Envelope>`
		/* JSON.stringify({
			Body: {
				AuthRequest: {
					_jsns: 'urn:zimbraAdmin',
					csrfTokenSecured: '0',
					persistAuthTokenCookie: '1',
					account: {
						by: 'name',
						_content: username
					},
					password: {
						_content: password
					}
				}
			}
		}) */
	});
}
