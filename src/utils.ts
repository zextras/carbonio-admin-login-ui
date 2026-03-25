/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Firefox')) {
    name = 'Firefox';
    const match = ua.match(/Firefox\/(\d+(?:\.\d+)?)/);
    version = match?.[1] ?? 'Unknown';
  } else if (ua.includes('Edg/')) {
    name = 'Edge';
    const match = ua.match(/Edg\/(\d+(?:\.\d+)?)/);
    version = match?.[1] ?? 'Unknown';
  } else if (ua.includes('Chrome')) {
    name = 'Chrome';
    const match = ua.match(/Chrome\/(\d+(?:\.\d+)?)/);
    version = match?.[1] ?? 'Unknown';
  } else if (ua.includes('Safari')) {
    name = 'Safari';
    const match = ua.match(/Version\/(\d+(?:\.\d+)?)/);
    version = match?.[1] ?? 'Unknown';
  }

  return { name, version };
}

function getOsInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Windows NT 10')) {
    name = 'Windows';
    version = '10';
  } else if (ua.includes('Windows NT 6.3')) {
    name = 'Windows';
    version = '8.1';
  } else if (ua.includes('Windows NT 6.2')) {
    name = 'Windows';
    version = '8';
  } else if (ua.includes('Windows NT 6.1')) {
    name = 'Windows';
    version = '7';
  } else if (ua.includes('Mac OS X')) {
    name = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/);
    version = match?.[1]?.replace('_', '.') ?? 'Unknown';
  } else if (ua.includes('Linux')) {
    name = 'Linux';
  } else if (ua.includes('Android')) {
    name = 'Android';
    const match = ua.match(/Android (\d+(?:\.\d+)?)/);
    version = match?.[1] ?? 'Unknown';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    name = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/);
    version = match?.[1]?.replace('_', '.') ?? 'Unknown';
  }

  return { name, version };
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getDeviceModel() {
  const browser = getBrowserInfo();
  const os = getOsInfo();
  const deviceModel = isMobileDevice()
    ? `Mobile ${browser.name} ${browser.version}`
    : `${browser.name} ${browser.version}`;
  return `${deviceModel}/${os.name} ${os.version}`;
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

export const isSafeRedirect = (url) => {
  if (typeof url !== 'string') return false;
  try {
    // eslint-disable-next-line no-undef
    const parsed = new URL(url, globalThis.location.origin);
    if (/[\\]/.test(url)) return false;
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
