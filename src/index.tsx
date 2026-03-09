/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './i18n/i18n.config';
import './index.css';

import { render } from 'react-dom';

import { App } from './app';

render(<App />, document.getElementById('app'));
