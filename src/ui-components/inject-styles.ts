/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function injectStyles(id: string, css: string, root: Document | ShadowRoot): void {
  const target = root instanceof Document ? root.head : root;
  if (target.querySelector(`style[data-style-id="${id}"]`)) {
    return;
  }
  const style = document.createElement('style');
  style.dataset['styleId'] = id;
  style.textContent = css;
  target.appendChild(style);
}
