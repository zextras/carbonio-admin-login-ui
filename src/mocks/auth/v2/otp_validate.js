/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

export default http.post('/zx/auth/v2/otp/validate', () => {
	return HttpResponse.json(null, { status: 200 });
});
