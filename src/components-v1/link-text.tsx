/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const LinkText = ({ to }: { to: string }) => {
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
		/>
	);
};
