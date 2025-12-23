/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

export default http.get('/zx/login/v3/config', ({ request }) => {
	// Extract query parameters if needed
	const url = new URL(request.url);
	const domain = url.searchParams.get('domain');
	const host = url.searchParams.get('host');

	return HttpResponse.json(
		{
			publicUrl: 'https://infra-6f4c8e62.testarea.zextras.com',
			loginPageBackgroundImage: '',
			loginPageLogo: '',
			loginPageSkinLogoUrl: '',
			loginPageFavicon: '',
			loginPageTitle: '',
			loginPageColorSet: {
				primary: '2b73d2',
				secondary: '666666'
			},
			zimbraPublicServiceHostname: 'infra-6f4c8e62.testarea.zextras.com',
			zimbraPublicServicePort: '443',
			zimbraPublicServiceProtocol: 'https',
			zimbraDomainName: domain || '6f4c8e62.testarea.zextras.com',
			isDarkThemeEnable: false,
			carbonioAdminUiTitle: '',
			carbonioAdminUiFavicon: '',
			carbonioWebUiDarkMode: false,
			carbonioAdminUiBackground: '',
			carbonioAdminUiLoginLogo: '',
			carbonioAdminUiDarkBackground: '',
			carbonioAdminUiDarkLoginLogo: '',
			carbonioAdminUiDescription: '',
			carbonioLogoURL: ''
		},
		{ status: 200 }
	);
});
