/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse } from 'msw';

import { APIInterceptor, createAPIInterceptor } from '../../jest-env-setup';
import { getAdvancedSupported } from '../advanced-supported';

function mockAdvancedSupportedApi(response: () => HttpResponse): APIInterceptor {
	return createAPIInterceptor('get', '/advanced/supported', response);
}

const okStatuses = [200, 201, 202];
const notOkStatuses = [418, 404, 500, 502, 302];

describe('getAdvancedSupported', () => {
	it.each(okStatuses)(
		'should return advanced supported TRUE when it replies true (status %d)',
		async (code: number) => {
			mockAdvancedSupportedApi(() => HttpResponse.json({ supported: true }, { status: code }));
			const response = await getAdvancedSupported();
			expect(response).toEqual({ supported: true });
		}
	);

	it.each(okStatuses)('should return advanced supported FALSE when it replies false', async () => {
		mockAdvancedSupportedApi(() => HttpResponse.json({ supported: false }, { status: 200 }));
		const response = await getAdvancedSupported();
		expect(response).toEqual({ supported: false });
	});

	it.each(okStatuses)(
		'should return error when api ok (status %d) but supported not in json body',
		async (code: number) => {
			mockAdvancedSupportedApi(() => HttpResponse.json({}, { status: code }));
			const response = await getAdvancedSupported();
			expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
		}
	);

	it.each(okStatuses)(
		'should return error when api ok (status %d) but body is not a json',
		async (code: number) => {
			mockAdvancedSupportedApi(() => HttpResponse.text('Hello', { status: code }));
			const response = await getAdvancedSupported();
			expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
		}
	);

	it.each(notOkStatuses)('should return error when api returns %d', async (code: number) => {
		mockAdvancedSupportedApi(() => HttpResponse.json({}, { status: code }));
		const response = await getAdvancedSupported();
		expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
	});

	it.each(notOkStatuses)(
		'should return error when api returns %d with supported',
		async (code: number) => {
			mockAdvancedSupportedApi(() => HttpResponse.json({ supported: true }, { status: code }));
			const response = await getAdvancedSupported();
			expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
		}
	);

	it('should return error when api returns http error', async () => {
		mockAdvancedSupportedApi(HttpResponse.error);
		const response = await getAdvancedSupported();
		expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
	});
});
