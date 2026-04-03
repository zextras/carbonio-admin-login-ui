/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, afterEach, beforeAll } from 'vitest';

import { getSetupServer } from './tests-setup/jsdom/server';

const server = getSetupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.events.removeAllListeners();
  server.resetHandlers();
});
