/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';
import React from 'react';

import { Modal, Paragraph } from '@zextras/zapp-ui';

export function OfflineModal ({ open, onClose }) {
	const [ t ] = useTranslation();
	return (
		<Modal
			title="Offline"
			open={open}
			onClose={onClose}
		>
			<Paragraph>
				{t('offline', 'You are currently offline, please check your internet connection')}
			</Paragraph>
		</Modal>
	);
}

