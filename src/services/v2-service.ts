/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { deviceId, getDeviceModel } from '../utils';

export function submitOtp(id: string, code: string, trustDevice: boolean) {
  return fetch('/zx/auth/v2/admin/otp/validate', {
    method: 'POST',
    headers: {
      'X-Device-Model': getDeviceModel(),
      'X-Device-Id': deviceId(),
      'X-Service': 'WebAdminUI',
      'Content-Type': 'application/json',
      version: '2',
    },
    body: JSON.stringify({
      id,
      code,
      unsecure_device: !trustDevice,
    }),
  });
}

export function loginToCarbonioAdvancedAdmin(user: string, password: string) {
  return fetch(`/zx/auth/v2/admin/login`, {
    method: 'POST',
    headers: {
      'X-Device-Model': getDeviceModel(),
      'X-Device-Id': deviceId(),
      'X-Service': 'WebAdminUI',
      'Content-Type': 'application/json',
      version: '2',
    },
    referrerPolicy: 'same-origin',
    body: JSON.stringify({
      auth_method: 'password',
      user,
      password,
    }),
  });
}

export function loginToCarbonioAdmin(username: string, password: string) {
  return fetch(`/service/admin/soap/AuthRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'same-origin',
    body: JSON.stringify({
      Body: {
        AuthRequest: {
          _jsns: 'urn:zimbraAdmin',
          csrfTokenSecured: '0',
          persistAuthTokenCookie: '1',
          account: {
            by: 'name',
            _content: username,
          },
          password: {
            _content: password,
          },
        },
      },
    }),
  });
}
