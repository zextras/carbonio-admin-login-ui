/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TFunction } from 'react-i18next';

type CopyrightBannerProps = {
	copyrightBanner?: string;
	t: TFunction;
};
export const CopyrightBanner = ({ copyrightBanner, t }: CopyrightBannerProps) => {
	if (copyrightBanner) {
		return (
			<zx-text size="small" overflow="break-word">
				{copyrightBanner}
			</zx-text>
		);
	}
	return (
		<zx-text size="small" overflow="break-word" data-testid="default-banner">
			{t('copy_right', 'Copyright')} &copy;
			{` ${new Date().getFullYear()} Zextras, `}
			{t('all_rights_reserved', 'All rights reserved')}
		</zx-text>
	);
};
