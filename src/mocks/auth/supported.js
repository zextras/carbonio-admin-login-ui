// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

export default rest.get(
	'/zx/auth/supported',
	(req, res, ctx) => {
		const domain = req.url.searchParams.get('domain');

		return res(
			ctx.status(200),
			ctx.json({
				twoFactorsEnabled: false,
				domain: '6f4c8e62.testarea.zextras.com',
				minApiVersion: 1,
				maxApiVersion: 2,
				destinationUrl: '',
				authMethods: ['password', 'saml']
			}),
		)
	}
);
