/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Modal, Paragraph } from '../ui-components/src/';

export default function OfflineModal({ open, onClose }: any) {
	const [t] = useTranslation();
	return (
		<Modal title="Offline" open={open} onClose={onClose}>
			<Paragraph data-testid="offlineMsg">
				{t('offline', 'You are currently offline, please check your internet connection')}
			</Paragraph>
		</Modal>
	);
}
