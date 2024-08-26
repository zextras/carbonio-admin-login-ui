/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

export default http.get('/zx/auth/supported', () => {
	return HttpResponse.json(
		{
			twoFactorsEnabled: false,
			domain: '6f4c8e62.testarea.zextras.com',
			minApiVersion: 1,
			maxApiVersion: 2,
			destinationUrl: '',
			authMethods: ['password', 'saml']
		},
		{ status: 200 }
	);
});
