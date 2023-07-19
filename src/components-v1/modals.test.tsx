/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, screen, within } from '@testing-library/react';
import React from 'react';
import OfflineModal from './modals';
import { setup } from '../tests/testUtils';

describe('modals', () => {
	test('loads modal screen', async () => {
		const onCloseFn = jest.fn();
		const open = true;
		const { user } = setup(<OfflineModal open={open} onClose={onCloseFn} />);
		act(() => {
			jest.runOnlyPendingTimers();
		});
		expect(screen.getByText('Offline')).toBeVisible();

		const okButton = screen.getByRole('button', {
			name: /ok/i
		});
		expect(okButton).toBeEnabled();
		const offline = screen.getByTestId('offlineMsg');
		expect(within(offline).getByText(/offline/i)).toBeVisible();
	});
});
