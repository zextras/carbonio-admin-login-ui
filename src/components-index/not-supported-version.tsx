/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useCallback, useState } from 'react';

import { Snackbar } from '../ui-components';

export const NotSupportedVersion = () => {
	const t = i18next.t.bind(i18next);
	const [isOpen, setOpen] = useState(true);
	const onCloseCbk = useCallback(() => setOpen(false), []);

	return (
		<Snackbar
			open={isOpen}
			label={t(
				'unsupported_version',
				'The server sent a not valid response. Please contact your server administrator'
			)}
			onClose={onCloseCbk}
			autoHideTimeout={10000}
			severity="error"
			data-testid="not-supported-version"
		/>
	);
};
