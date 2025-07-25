/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type Error = {
	errorMessage: string;
};

type Success = {
	supported: boolean;
};

export type GetAdvancedSupportedResponse = Promise<Success | Error>;

function errorMessage(): Error {
	return { errorMessage: 'Failed to check Advanced installation' };
}

export function getAdvancedSupported(): GetAdvancedSupportedResponse {
	return fetch('/advanced/supported')
		.then(async (res) => {
			if (res.ok) {
				const data = await res.json();
				if (!('supported' in data)) {
					return errorMessage();
				}
				return { supported: data.supported };
			}
			return errorMessage();
		})
		.catch(() => {
			return { errorMessage: 'Failed to check Advanced installation' };
		});
}
