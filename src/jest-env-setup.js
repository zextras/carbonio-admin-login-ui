// Copyright (C) 2011-2020 Zextras
// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import '@testing-library/jest-dom/extend-expect';
import server from './mocks/server';

beforeEach(() => {
	// Do not useFakeTimers with `whatwg-fetch` if using mocked server
	// https://github.com/mswjs/msw/issues/448
	jest.useFakeTimers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
	server.resetHandlers();
	jest.runOnlyPendingTimers();
	jest.useRealTimers();
});
