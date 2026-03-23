/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './error-page';
import './loading-view';
import './login-advanced';

import React, { Suspense, useEffect, useState } from 'react';

import { getAdvancedSupported } from './services/advanced-supported';

type Error = {
  errorMessage: string;
};

type AdvancedSupport = {
  supported: boolean;
};

type Loading = {
  isLoading: true;
};

export function App(): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<AdvancedSupport | Loading | Error>({
    isLoading: true,
  });

  useEffect(() => {
    setApiResponse({ isLoading: true });
    getAdvancedSupported().then((data) => {
      if ('supported' in data) {
        setApiResponse({
          supported: data.supported,
        });
      } else {
        setApiResponse({
          errorMessage: '',
        });
      }
    });
  }, []);
  const errorResponse = apiResponse && 'errorMessage' in apiResponse;
  const isLoading = !apiResponse || (apiResponse && 'isLoading' in apiResponse);
  const supportedResponse = apiResponse && 'supported' in apiResponse;

  return (
    <>
      <Suspense fallback={<loading-view></loading-view>}>
        {errorResponse && <error-page></error-page>}
        {isLoading && <loading-view></loading-view>}
        {supportedResponse && apiResponse.supported && <login-advanced></login-advanced>}
        {supportedResponse && !apiResponse.supported && <login-ce></login-ce>}
      </Suspense>
    </>
  );
}
