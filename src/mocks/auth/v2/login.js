// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

export default rest.post(
	'/zx/auth/v2/login',
	(req, res, ctx) => {
		return res(
			ctx.delay(3000),
			ctx.status(200),
			ctx.json({
				otp: [
					{
						id: "9c3fcd35-848f-4a74-885a-f9618a55f9c2",
						label: "OTP4q8Q-admin@99b88fa0.testarea.zextras.com"
					}
				],
				services: {
					ZxDrive: {
						urls: "https://infra-99b88fa0.testarea.zextras.com/drive",
						commercial_name: "Zextras Drive",
						name: "ZxDrive"
					},
					ZxAuth: {
						urls: "https://infra-99b88fa0.testarea.zextras.com/zx/auth",
						commercial_name: "Zextras Auth",
						name: "ZxAuth"
					},
					ZxChat: {
						urls: "https://infra-99b88fa0.testarea.zextras.com/zx/team",
						commercial_name: "Zextras Team",
						name: "ZxChat"
					},
					LOGIN: {
						urls: "https://infra-99b88fa0.testarea.zextras.com/zx/login",
						commercial_name: "LOGIN",
						name: "LOGIN"
					}
				},
				user: {
					lastSeen: 1615373602124,
					displayName: "admin@99b88fa0.testarea.zextras.com",
					picturePresent: false,
					guest: false,
					userId: "a8e74508-a56b-48e4-9db6-e04c129f6c56",
					primaryEmail: "admin@99b88fa0.testarea.zextras.com"
				},
				"2FA": true
			})
		);
	}
);