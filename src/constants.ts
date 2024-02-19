/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const MAX_SUPPORTED_VERSION = 2; // to keep updated adding new versions
export const IRIS_CHECK_URL = '/static/iris/components.json';
export const ZM_AUTH_TOKEN = 'ZM_AUTH_TOKEN';
export const INVALID_PASSWORD_ERR_CODE = 'account.INVALID_PASSWORD';
export const PASSWORD_RECENTLY_USED_ERR_CODE = 'account.PASSWORD_RECENTLY_USED';
export const PASSWORD_LOCKED = 'account.PASSWORD_LOCKED';
export const ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME = 'zimbraPasswordMinLength';
export const ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME = 'zimbraPasswordMaxLength';
export const ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME = 'zimbraPasswordMinUpperCaseChars';
export const ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME = 'zimbraPasswordMinLowerCaseChars';
export const ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME = 'zimbraPasswordMinPunctuationChars';
export const ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME = 'zimbraPasswordMinNumericChars';
export const ZIMBRA_PASSWORD_MIN_AGE_ATTR_NAME = 'zimbraPasswordMinAge';
export const ZIMBRA_PASSWORD_MAX_AGE_ATTR_NAME = 'zimbraPasswordMaxAge';
export const ZIMBRA_PASSWORD_MIN_DIGITS_OR_PUNCS = 'zimbraPasswordMinDigitsOrPuncs';
export const ZIMBRA_PASSWORD_ENFORCE_HISTORY_ATTR_NAME = 'zimbraPasswordEnforceHistory';
export const BLOCK_PERSONAL_DATA_IN_PASSWORD_POLICY = 'blockPersonalDataInPasswordPolicy';
export const BLOCK_COMMON_WORDS_IN_PASSWORD_POLICY = 'blockCommonWordsInPasswordPolicy';
export const darkReaderDynamicThemeFixes = {
	ignoreImageAnalysis: ['.no-dr-invert *'],
	invert: [],
	css: `
		.tox, .force-white-bg, .tox-swatches-menu, .tox .tox-edit-area__iframe {
			background-color: #fff !important;
			background: #fff !important;
		}
	`,
	ignoreInlineStyle: ['.tox-menu *'],
	disableStyleSheetsProxy: false
};
export const CARBONIO_LOGO_URL = 'https://www.zextras.com';
export const DARK_READER_VALUES = ['auto', 'enabled', 'disabled'] as const;
export const SCALING_OPTIONS = [
	{ value: 75, label: 'xs' },
	{ value: 87.5, label: 's' },
	{ value: 100, label: 'm' },
	{ value: 112.5, label: 'l' },
	{ value: 125, label: 'xl' }
] as const;
export const BASE_FONT_SIZE = 100;
export const SCALING_LIMIT = {
	WIDTH: 1400,
	HEIGHT: 900,
	DPR: 2 // device pixel ratio
} as const;
export const LOCAL_STORAGE_LAST_PRIMARY_KEY = 'config';
