/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const i18nReady = i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    missingKeyHandler: (_lng, _ns, key) => {
      // eslint-disable-next-line no-console
      console.warn('Missing translation with key', key);
    },
    backend: {
      loadPath: 'i18n/{{lng}}.json',
    },
  });

export { i18nReady };
export default i18n;
