/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './loading-view.css';

import helmet from './assets/carbonio-head.svg';

export const LoadingView = () => (
  <div data-testid={'loading-view'} className="splash">
    <img src={helmet} alt={'carbonio-head'} />
    <div className="loader">
      <div className="bar"></div>
    </div>
  </div>
);
