/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/icon-wc';

import React, { useCallback, useEffect } from 'react';

import { resolveThemeColor } from '../theme/theme-utils';
import { type IconName } from '../web-components/icon-registry';
import { TIMERS } from './constants';
import { Container } from './Container';
import { Row } from './Row';
import styles from './Snackbar.module.css';

const icons: Record<'success' | 'info' | 'warning' | 'error', IconName> = {
  success: 'CheckmarkOutline',
  info: 'InfoOutline',
  warning: 'AlertTriangleOutline',
  error: 'CloseCircleOutline',
};

type SnackbarProps = {
  /** Whether to show the Snackbar or not */
  open?: boolean;
  /** Snackbar severity */
  severity?: 'success' | 'info' | 'warning' | 'error';
  /** Snackbar text message */
  label: string | React.ReactElement;
  /** Snackbar button text */
  actionLabel?: string;
  /** Button's click callback */
  onActionClick?: () => void;
  /** Callback to handle Snackbar closing */
  onClose?: () => void;
  /** autoHide timing in milliseconds */
  autoHideTimeout?: number;
};

const Snackbar = ({
  open = false,
  severity = 'info',
  label,
  actionLabel = 'Ok',
  onActionClick,
  onClose,
  autoHideTimeout = TIMERS.SNACKBAR.DEFAULT_HIDE_TIMEOUT,
}: SnackbarProps) => {
  const handleClick = useCallback(() => {
    if (onActionClick) {
      onActionClick();
    } else if (onClose) {
      onClose();
    }
  }, [onActionClick, onClose]);

  const enableTimeout = open && onClose !== undefined;

  useEffect(() => {
    let timeout: number;
    if (enableTimeout) {
      timeout = setTimeout(() => {
        onClose();
      }, autoHideTimeout) as unknown as number;
    }
    return (): void => {
      clearTimeout(timeout);
    };
  }, [onClose, autoHideTimeout, enableTimeout]);

  if (!open) return null;

  return (
    <div
      className={styles.snackContainer}
      style={
        {
          '--snackbar-z-index': 1000,
          '--snackbar-background-color': resolveThemeColor(severity, 'regular'),
        } as React.CSSProperties
      }
      data-testid="snackbar"
    >
      <Container
        orientation="horizontal"
        mainAlignment="flex-start"
        gap={'1rem'}
        height="auto"
        width="auto"
        padding={{
          top: '0.5rem',
          right: '0.5rem',
          bottom: '0.5rem',
          left: '1.5rem',
        }}
        maxWidth={'100%'}
      >
        <Row flexShrink={0}>
          <Row flexShrink={0}>
            <icon-wc size="large" icon={icons[severity]} color="gray6"></icon-wc>
          </Row>
        </Row>
        <Container
          gap={'1rem'}
          wrap={'wrap'}
          flexBasis={'fit-content'}
          mainAlignment={'flex-start'}
          orientation={'row'}
          minWidth={0}
        >
          <Row
            mainAlignment="flex-start"
            flexBasis={'50%'}
            flexShrink={1}
            flexGrow={1}
            width={'auto'}
          >
            <zx-text color="gray6" overflow="break-word">
              {label}
            </zx-text>
          </Row>
          <Row
            margin={{ left: 'auto', right: '0' }}
            wrap={'nowrap'}
            flexGrow={0}
            flexShrink={0}
            minWidth={0}
            flexBasis={'fit-content'}
          >
            <zx-button label={actionLabel} type="ghost" color="gray6" onClick={handleClick} />
          </Row>
        </Container>
      </Container>
      {enableTimeout && (
        <Container
          className={styles.progressBar}
          style={{ animationDuration: `${autoHideTimeout}ms` }}
          height={'0.25rem'}
          data-testid={'progress-bar'}
          background={`${severity}.active`}
          width={'100%'}
        />
      )}
    </div>
  );
};

export { Snackbar };
