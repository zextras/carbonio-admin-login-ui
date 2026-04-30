/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

function errorMessage() {
  return { errorMessage: 'Failed to check Advanced installation' };
}

export const getAdvancedSupported = () =>
  fetch('/services/catalog/services', { redirect: 'manual' })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if ('items' in data && Array.isArray(data.items)) {
          const installedServices = data.items as Array<string>;
          const isAdvanced =
            installedServices.filter((service): boolean => service === 'carbonio-advanced').length >
            0;
          return { supported: isAdvanced };
        }
      }
      return errorMessage();
    })
    .catch(() => {
      return { errorMessage: 'Failed to check Advanced installation' };
    });
