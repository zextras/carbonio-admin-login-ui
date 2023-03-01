/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BASE_FONT_SIZE, SCALING_LIMIT, SCALING_OPTIONS } from '../constants';

export const getAutoScalingFontSize = (): number => {
	if (
		window.screen.width <= SCALING_LIMIT.WIDTH &&
		window.screen.height <= SCALING_LIMIT.HEIGHT &&
		window.devicePixelRatio >= SCALING_LIMIT.DPR
	) {
		const baseFontIndex = SCALING_OPTIONS.findIndex((option) => option.value === BASE_FONT_SIZE);
		if (baseFontIndex > 0) {
			return SCALING_OPTIONS[baseFontIndex - 1].value;
		}
	}
	return BASE_FONT_SIZE;
};
