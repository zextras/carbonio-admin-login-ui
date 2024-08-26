/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, delay, HttpResponse } from 'msw';

export default http.get('/zx/auth/v2/myself', async () => {
	await delay(1000);
	return HttpResponse.json(null, { status: 401 });
});
