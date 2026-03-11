/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

export const LinkText = ({ to, children }: { to: string; children?: ReactNode }) => {
	return (
		<a
			href={to || '#'}
			target="_blank"
			rel="noreferrer"
			style={{
				textDecorationLine: 'underline',
				cursor: 'pointer',
				color: '#2b73d2'
			}}
		>
			{children}
		</a>
	);
};
