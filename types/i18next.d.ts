/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// import the original type declarations
import * as i18next from 'i18next';

// import all namespaces (for the default language, only)
import en from '../translations/en.json';

type DefaultNs = i18next.TypeOptions['defaultNS'];

declare module 'i18next' {
  interface TypeOptions {
    resources: Record<DefaultNs, typeof en>;
    returnNull: false;
    returnType: 'string';
    jsonFormat: 'v4';
    allowObjectInHTMLChildren: true;
  }
}
