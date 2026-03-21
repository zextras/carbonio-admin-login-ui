/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useCallback, useState } from 'react';

export const ServerNotResponding = () => {
  const t = i18next.t.bind(i18next);
  const [isOpen, setOpen] = useState(true);
  const onCloseCbk = useCallback(() => setOpen(false), []);

  return (
    <ds-snackbar
      open={isOpen}
      label={t(
        'server_not_responding',
        'The server is not responding. Please contact your server administrator',
      )}
      onClose={onCloseCbk}
      autoHideTimeout={10000}
      severity="error"
      data-testid="server-not-responding"
    ></ds-snackbar>
  );
};
