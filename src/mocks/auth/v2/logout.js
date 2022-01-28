// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

export default rest.get(
	'/zx/auth/v2/logout',
	(req, res, ctx) => {
		return res(
			ctx.status(200)
		);
	}
);