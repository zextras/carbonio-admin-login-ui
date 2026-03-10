/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import create from 'zustand';

import type { LoginConfigStore } from '../../../types';

export const useLoginConfigStore = create<LoginConfigStore>(() => ({}));
