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
				loginPageBackgroundImage: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.freecreatives.com%2Fwp-content%2Fuploads%2F2016%2F02%2FAmazing-Road-Background-For-Free1.jpg',
				loginPageLogo: '',
				loginPageSkinLogoUrl: 'https://banner2.cleanpng.com/20180513/fpq/kisspng-royalty-free-logo-dragon-5af7c7407136a9.1946411915261878404637.jpg',
				loginPageFavicon: '',
				loginPageColorSet: {
					primary: 'ff0000',
					secondary: '666666'
				},
				zimbraPublicServiceHostname: "infra-6f4c8e62.testarea.zextras.com",
				zimbraPublicServicePort: "443",
				zimbraPublicServiceProtocol: "https",
				zimbraDomainName: "6f4c8e62.testarea.zextras.com",
			}),
		);
	}
);
