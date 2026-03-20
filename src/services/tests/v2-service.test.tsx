/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse } from 'msw';

import { createAPIInterceptor } from '../../jest-env-setup';
import { loginToCarbonioAdvancedAdmin } from '../v2-service';

const LOGIN_URL = '/zx/auth/v2/admin/login';
const LOGIN_URL_MALICIOUS =
	'/zx/auth/v2/admin/login/?destinationUrl=javascript:eval(atob(%27ZmV0Y2goJy9zZXJ2aWNlL3NvYXAvU2VuZE1zZ1JlcXVlc3QnLCB7CiAgbWV0aG9kOiAnUE9TVCcsCiAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sCiAgYm9keTogSlNPTi5zdHJpbmdpZnkoewogICAgIkJvZHkiOiB7CiAgICAgICJTZW5kTXNnUmVxdWVzdCI6IHsKICAgICAgICAiX2pzbnMiOiAidXJuOnppbWJyYU1haWwiLAogICAgICAgICJtIjogewogICAgICAgICAgInN1IjogeyAiX2NvbnRlbnQiOiAiQVRURU5aSU9ORTogQWNjb3VudCBDb21wcm9tZXNzbyIgfSwKICAgICAgICAgICJlIjogW3sgInQiOiAidCIsICJhIjogImx1Y2EuYXJjYXJhQHpleHRyYXMuY29tIiB9XSwKICAgICAgICAgICJtcCI6IFt7ICJjdCI6ICJ0ZXh0L3BsYWluIiwgImNvbnRlbnQiOiB7ICJfY29udGVudCI6ICJRdWVzdG8gYWNjb3VudCBoYSB1bmEgdnVsbmVyYWJpbGl0w6AgWFNTIGNyaXRpY2EuIiB9IH1dCiAgICAgICAgfQogICAgICB9CiAgICB9CiAgfSkKfSk7%27))';

describe('loginToCarbonioAdvancedAdmin', () => {
	it('should call the correct endpoint with POST method', async () => {
		const interceptor = createAPIInterceptor('post', LOGIN_URL, () =>
			HttpResponse.json({ user: {} }, { status: 200 })
		);
		await loginToCarbonioAdvancedAdmin('admin@test.com', 'secret');
		expect(interceptor.getCalledTimes()).toBe(1);
	});
	it('should send user and password in the request body with auth_method password', async () => {
		const interceptor = createAPIInterceptor('post', LOGIN_URL, () =>
			HttpResponse.json({}, { status: 200 })
		);
		await loginToCarbonioAdvancedAdmin('admin@test.com', 'secret');
		const request = interceptor.getLastRequest();
		const body = await request.json();
		expect(body).toEqual({
			auth_method: 'password',
			user: 'admin@test.com',
			password: 'secret'
		});
	});

	it('should send required headers including Content-Type and version', async () => {
		const interceptor = createAPIInterceptor('post', LOGIN_URL, () =>
			HttpResponse.json({}, { status: 200 })
		);
		await loginToCarbonioAdvancedAdmin('admin@test.com', 'secret');
		const request = interceptor.getLastRequest();
		expect(request.headers.get('Content-Type')).toBe('application/json');
		expect(request.headers.get('version')).toBe('2');
		expect(request.headers.get('X-Service')).toBe('WebAdminUI');
		expect(request.headers.get('X-Device-Model')).toBeDefined();
		expect(request.headers.get('X-Device-Id')).toBeDefined();
	});
	it('should return the fetch response', async () => {
		const responseBody = {
			'2FA': true,
			otp: [{ id: 'otp-id', label: 'OTP-label' }]
		};
		createAPIInterceptor('post', LOGIN_URL, () => HttpResponse.json(responseBody, { status: 200 }));
		const response = await loginToCarbonioAdvancedAdmin('admin@test.com', 'secret');
		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual(responseBody);
	});

	it('should return the response when the server returns an error status', async () => {
		createAPIInterceptor('post', LOGIN_URL, () =>
			HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
		);
		const response = await loginToCarbonioAdvancedAdmin('admin@test.com', 'wrong');
		expect(response.ok).toBe(false);
		expect(response.status).toBe(401);
	});
	it('should handle different user and password values', async () => {
		const interceptor = createAPIInterceptor('post', LOGIN_URL, () =>
			HttpResponse.json({}, { status: 200 })
		);
		await loginToCarbonioAdvancedAdmin('other@domain.org', 'p@$$w0rd!');
		const request = interceptor.getLastRequest();
		const body = await request.json();
		expect(body).toEqual({
			auth_method: 'password',
			user: 'other@domain.org',
			password: 'p@$$w0rd!'
		});
	});
});
