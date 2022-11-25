/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Snackbar } from '@zextras/carbonio-design-system';

export default function NotSupportedVersion() {
	const [t] = useTranslation();
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
			type="error"
		/>
	);
}
