// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		react: {
			useSuspense: false
		},
		fallbackLng: 'en',
		debug: false,
		interpolation: {
			escapeValue: false // react already safes from xss
		},
		missingKeyHandler: (lng, ns, key, fallbackValue) => {
			console.warn('Missing translation with key', key);
		},
		backend: {
			loadPath: 'i18n/{{lng}}.json',
		}
	});

export default i18n;
