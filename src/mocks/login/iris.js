// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

import { IRIS_CHECK_URL } from '../../constants';

export default rest.get(
	IRIS_CHECK_URL,
	(req, res, ctx) => {
		return res(
			ctx.delay(1000),
			ctx.status(200)
		)
	}
);
