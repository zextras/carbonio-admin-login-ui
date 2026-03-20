/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React from 'react';

import { Row } from '../Row';
import { Tooltip } from '../Tooltip';
import styles from './ModalHeader.module.css';

type ModalHeaderProps = {
	centered?: boolean;
	type?: 'default' | 'error';
	title?: string | React.ReactElement;
	showCloseIcon?: boolean;
	onClose?: (event: React.MouseEvent | KeyboardEvent) => void;
	closeIconTooltip?: string;
};

function ModalHeader({
	centered,
	onClose,
	showCloseIcon,
	title,
	type,
	closeIconTooltip,
}: ModalHeaderProps): React.JSX.Element {
	return (
		<Row width="100%" padding={{ bottom: 'small' }}>
			<ds-text
				class={clsx(styles.modalTitle, centered && styles.centered)}
				color={type === 'error' ? 'error' : undefined}
				weight="bold"
			>
				{title}
			</ds-text>
			{showCloseIcon && onClose && (
				<Tooltip label={closeIconTooltip} disabled={!closeIconTooltip}>
					<ds-button
						icon="Close"
						size="large"
						type="ghost"
						color="text"
						onClick={onClose as (e: Event) => void}
					/>
				</Tooltip>
			)}
		</Row>
	);
}

export type { ModalHeaderProps };
export { ModalHeader };
