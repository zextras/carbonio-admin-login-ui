/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Modal, Text} from '../ui-components/src/';
import styles from './modals.module.css';

export default function OfflineModal({ open, onClose }: any) {
	const [t] = useTranslation();
	return (
		<Modal title="Offline" open={open} onClose={onClose}>
		<Text overflow={'break-word'} lineHeight={1.4} className={styles.paragraph} data-testid="offlineMsg">
				{t('offline', 'You are currently offline, please check your internet connection')}
        </Text>
		</Modal>
	);
}
