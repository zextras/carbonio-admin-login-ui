/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const submitChangePassword = (
  username: string,
  oldPassword: string,
  newPassword: string,
) => {
  return fetch('/service/admin/soap/ChangePasswordRequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    body: JSON.stringify({
      Body: {
        ChangePasswordRequest: {
          _jsns: 'urn:zimbraAccount',
          csrfTokenSecured: '0',
          persistAuthTokenCookie: '1',
          account: {
            by: 'name',
            _content: username,
          },
          oldPassword: {
            _content: oldPassword,
          },
          password: {
            _content: newPassword,
          },
          prefs: [{ pref: { name: 'zimbraPrefMailPollingInterval' } }],
        },
      },
    }),
  });
};
