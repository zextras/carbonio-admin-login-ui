/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

beforeAll(async () => {
  // await startMockWorker();
});

beforeEach(() => {
  // resetMockWorker();
});

afterAll(() => {
  // stopMockWorker();
  vi.clearAllMocks();
  // resetMockWorker();
});

afterEach(() => {
  vi.unstubAllGlobals();
  // resetMockWorker();
});
