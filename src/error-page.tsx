/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import errorSVG from '../assets/carbonio-load-app-error.svg';
import styles from './error-page.module.css';
import { Button } from './ui-components/src';

export const ErrorPage = () => {
	const [t] = useTranslation();
	return (
		<div className={styles.outerContainer}>
			<div className={styles.horizontalContainer}>
				<div className={styles.imageWrapper}>
					<img src={errorSVG} alt="load-error" />
				</div>
				<div className={styles.contentWrapper}>
					<div className={styles.textGroup}>
						<zx-text
							style={{ '--text-font-size': '64px' } as React.CSSProperties}
							weight="medium"
							color="primary"
						>
							{t('error.something_went_wrong', 'Something went wrong')}
						</zx-text>
						<zx-text
							overflow="break-word"
							style={{ '--text-font-size': '40px' } as React.CSSProperties}
							weight="light"
							color="secondary"
						>
							{t(
								'error.loading_page',
								"We're sorry, but there was an error trying to load this page."
							)}
						</zx-text>
					</div>
					<div className={styles.rowWrapper}>
						<zx-text
							style={{ '--text-font-size': '24px' } as React.CSSProperties}
							weight="regular"
							color="secondary"
						>
							{t('error.contact_support', 'Contact support or try refreshing the page')}
						</zx-text>
						<Button
							iconPlacement="left"
							icon="Refresh"
							label={t('button.refresh_page', 'REFRESH')}
							type="outlined"
							onClick={(): void => window.location.reload()}
							color="primary"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
