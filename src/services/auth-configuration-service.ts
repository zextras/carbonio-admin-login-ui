/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Configuration } from '../components-v1/credentials-form';

export async function getAuthSupported(
  domain: string | null,
): Promise<{ minApiVersion: number; maxApiVersion: number }> {
  const urlParams = new URLSearchParams();
  if (domain) urlParams.append('domain', domain);
  const res = await fetch(`/zx/auth/supported?${urlParams}`, {
    method: 'GET',
  });
  if (res.status === 200) return res.json();
  throw new Error('Notwork Error');
}

export async function doAuthLogout(configuration: Configuration) {
  const res = await fetch(`/zx/auth/v${configuration?.maxApiVersion}/logout`, {
    method: 'GET',
  });
  if (res.status !== 200) throw new Error('Notwork Error');
}
