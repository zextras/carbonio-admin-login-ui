// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

export default rest.get(
	'/zx/login/v1/config',
	(req, res, ctx) => {
		const domain = req.url.searchParams.get('domain');
		const host = req.url.searchParams.get('host');
		return res(
			ctx.status(200),
			ctx.json({
				publicUrl: 'https://infra-6f4c8e62.testarea.zextras.com',
				loginPageBackgroundImage: '',
				loginPageLogo: '',
				loginPageSkinLogoUrl: '',
				loginPageFavicon: '',
				loginPageColorSet: {
					primary: '2b73d2',
					secondary: '666666'
				},
				zimbraPublicServiceHostname: "infra-6f4c8e62.testarea.zextras.com",
				zimbraPublicServicePort: "443",
				zimbraPublicServiceProtocol: "https",
				zimbraDomainName: "6f4c8e62.testarea.zextras.com",
				isDarkThemeEnable: false
			}),
		);
	}
);


