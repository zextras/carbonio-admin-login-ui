/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type DefaultBodyType, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { createAPIInterceptor } from '../../../tests-setup/jsdom/server';
import { getAdvancedSupported } from '../advanced-supported';

const okStatuses = [200, 201, 202];
const notOkStatuses = [418, 404, 500, 502, 302];

function mockAdvancedSupported(supplier: () => HttpResponse<DefaultBodyType>) {
  createAPIInterceptor('get', '/services/catalog/services', supplier);
}

describe('getAdvancedSupported', () => {
  it.each(okStatuses)(
    'should return advanced supported TRUE when advanced in response (status %d)',
    async (code: number) => {
      mockAdvancedSupported(() =>
        HttpResponse.json({ items: ['carbonio-advanced'] }, { status: code }),
      );
      const response = await getAdvancedSupported();
      expect(response).toEqual({ supported: true });
    },
  );

  it.each(okStatuses)(
    'should return advanced supported FALSE carbonio-advanced missing from response',
    async (code: number) => {
      mockAdvancedSupported(() =>
        HttpResponse.json({ items: ['carbonio-mailbox'] }, { status: code }),
      );
      const response = await getAdvancedSupported();
      expect(response).toEqual({ supported: false });
    },
  );

  it.each(okStatuses)(
    'should return error when api ok (status %d) but body is not a json',
    async (code: number) => {
      mockAdvancedSupported(() => HttpResponse.text('Hello', { status: code }));
      const response = await getAdvancedSupported();
      expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
    },
  );

  it.each(notOkStatuses)(
    'should return error when api returns not ok status %d',
    async (code: number) => {
      mockAdvancedSupported(() => HttpResponse.json({}, { status: code }));
      const response = await getAdvancedSupported();
      expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
    },
  );

  it.each(notOkStatuses)(
    'should return error when api returns not status %d with carbonio-advanced',
    async (code: number) => {
      mockAdvancedSupported(() => HttpResponse.json({ 'carbonio-advanced': [] }, { status: code }));
      const response = await getAdvancedSupported();
      expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
    },
  );

  it('should return error when api returns http error', async () => {
    mockAdvancedSupported(HttpResponse.error);
    const response = await getAdvancedSupported();
    expect(response).toEqual({ errorMessage: 'Failed to check Advanced installation' });
  });
});
