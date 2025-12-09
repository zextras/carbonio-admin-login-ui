/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

export default http.get('/zx/login/v1/config', ({ request }) => {
	// Extract query parameters if needed
	const url = new URL(request.url);
	const domain = url.searchParams.get('domain');
	const host = url.searchParams.get('host');

	return HttpResponse.json(
		{
			publicUrl: 'https://infra-6f4c8e62.testarea.zextras.com',
			loginPageBackgroundImage: '',
			loginPageLogo: 'https://example.com/test-logo.png',
			loginPageSkinLogoUrl: 'https://example.com/test-url',
			loginPageFavicon: '',
			loginPageColorSet: {
				primary: '2b73d2',
				secondary: '666666'
			},
			zimbraPublicServiceHostname: 'infra-6f4c8e62.testarea.zextras.com',
			zimbraPublicServicePort: '443',
			zimbraPublicServiceProtocol: 'https',
			zimbraDomainName: domain || '6f4c8e62.testarea.zextras.com',
			isDarkThemeEnable: false
		},
		{ status: 200 }
	);
});
