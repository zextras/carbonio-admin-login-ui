// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

/* eslint @typescript-eslint/no-var-requires: "off" */
import { darken, desaturate, lighten, setLightness } from 'polished';
import {
	browserName,
	browserVersion,
	isMobile,
	mobileModel,
	mobileVendor,
	osName,
	osVersion
} from 'react-device-detect';

export function getDeviceModel() {
	let deviceModel = isMobile ? `${mobileVendor} ${mobileModel}` : `${browserName} ${browserVersion}`;
	deviceModel = `${deviceModel}/${osName} ${osVersion}`;
	return deviceModel;
}

export function deviceId() {
	const uuid = localStorage.getItem('device-uuid');
	if (uuid !== null) return uuid;
	// eslint-disable-next-line
	const generatedUUID = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
	localStorage.setItem('device-uuid', generatedUUID);
	return generatedUUID;
}

export function saveCredentials(username, password) {
	if ("PasswordCredential" in window) {
		// eslint-disable-next-line no-undef
		const cred = new PasswordCredential({
			id: username,
			password,
			name: password
		});
		return navigator.credentials.store(cred);
	}
	return Promise.resolve();
}

export function prepareUrlForForward(oUrl) {
	if (typeof oUrl !== 'string') return oUrl;
	let url;
	try {
		url = new URL(oUrl);
	}
	catch(err) {
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
		'destinationUrl'
	];
	blackListedQueryStrings.map((queryString) => urlParams.has(queryString) && urlParams.delete(queryString));
	urlParams.forEach((value, key) => {
		url.searchParams.set(key, value);
	});
	return url.toString();
}

export function generateColorSet({ regular, hover, active, disabled, focus }, dark = false) {
	return {
		regular,
		hover: hover ?? dark ? lighten(0.1, regular) : darken(0.1, regular),
		focus: focus ?? dark ? lighten(0.1, regular) : darken(0.1, regular),
		active: active ?? dark ? lighten(0.15, regular) : darken(0.15, regular),
		disabled: disabled ?? dark ? setLightness(0.8, regular) : desaturate(0.3, darken(0.3, regular))
	};
}

export function getCookieKeys() {
	return document.cookie.split(';').map(v => v.split('=')[0].trim())
}

export function getCookie(key) {
	const cookies = document.cookie.split(';').map(v => v.trim());
	const foundCookie = cookies.find(v => v.split('=')[0] === key);
	return foundCookie ? foundCookie.split('=')[1] : '';
}

export const setCookie = (cName, cValue, expDays) => {
	const date = new Date();
	if (expDays && Number.isInteger(expDays)) {
		date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
	}
	const expires = expDays && Number.isInteger(expDays) ? `expires=${date.toUTCString()}` : undefined;
	document.cookie = `${cName}=${cValue}; ${expires || ''}; path=/`;
};