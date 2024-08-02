/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

export default http.get('/zx/login/supported', () => {
	return HttpResponse.json(
		{
			minApiVersion: 1,
			maxApiVersion: 1
		},
		{ status: 200 }
	);
});
