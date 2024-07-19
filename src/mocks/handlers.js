/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import authSupported from './auth/supported';
import v1login from './auth/v1/login';
import v1logout from './auth/v1/logout';
import v2login from './auth/v2/login';
import v2logout from './auth/v2/logout';
import v2OTPValidate from './auth/v2/otp_validate';
import irisStatus from './login/iris';
import loginSupported from './login/supported';
import v1config from './login/v1/config';
import zimbraLogin from './login/zimbra';

export const handlers = [
	loginSupported,
	authSupported,
	v1config,
	v1login,
	v2login,
	v1logout,
	v2logout,
	v2OTPValidate,
	zimbraLogin,
	irisStatus
];
