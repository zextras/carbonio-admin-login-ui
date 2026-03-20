/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  browserName,
  browserVersion,
  isMobile,
  mobileModel,
  mobileVendor,
  osName,
  osVersion,
} from 'react-device-detect';

export function getDeviceModel() {
  let deviceModel = isMobile
    ? `${mobileVendor} ${mobileModel}`
    : `${browserName} ${browserVersion}`;
  deviceModel = `${deviceModel}/${osName} ${osVersion}`;
  return deviceModel;
}

export function deviceId(): string {
  const existing = localStorage.getItem('device-uuid');
  if (existing !== null) return existing;
  const uuid = crypto.randomUUID();
  localStorage.setItem('device-uuid', uuid);
  return uuid;
}

type PasswordCredentialData = {
  id: string;
  password: string;
  name?: string;
};

type PasswordCredentialConstructor = {
  new (data: PasswordCredentialData): Credential;
};

declare const PasswordCredential: PasswordCredentialConstructor;

export async function saveCredentials(id: string, password: string): Promise<void> {
  if ('PasswordCredential' in window) {
    const cred = new PasswordCredential({ id, password, name: id });
    await navigator.credentials.store(cred);
    return undefined;
  }
  return Promise.resolve();
}

export function prepareUrlForForward(oUrl: string | undefined) {
  if (typeof oUrl !== 'string') return oUrl;
  let url;
  try {
    url = new URL(oUrl);
  } catch {
    return undefined;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const blackListedQueryStrings = [
    'loginOp',
    'loginNewPassword',
    'totpcode',
    'loginConfirmNewPassword',
    'loginErrorCode',
    'username',
    'email',
    'password',
    'zrememberme',
    'ztrusteddevice',
    'zlastserver',
    'client',
    'login_csrf',
    'ignoreLoginURL',
    'soo',
    'destinationUrl',
  ];
  blackListedQueryStrings.forEach(
    (queryString) => urlParams.has(queryString) && urlParams.delete(queryString),
  );
  urlParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export const setCookie = (cName: string, cValue: string, expDays?: number) => {
  const date = new Date();
  if (expDays && Number.isInteger(expDays)) {
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
  }
  const expires =
    expDays && Number.isInteger(expDays) ? `expires=${date.toUTCString()}` : undefined;
  document.cookie = `${cName}=${cValue}; ${expires || ''}; path=/`;
};

export const isSafeRedirect = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
};
