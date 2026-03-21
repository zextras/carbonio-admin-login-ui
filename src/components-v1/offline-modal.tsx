/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import i18next from 'i18next';
import { useCallback, useEffect, useRef } from 'react';

import styles from './offline-modal.module.css';

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

export const OfflineModal = ({ onClose, open }: ModalProps) => {
  const t = i18next.t.bind(i18next);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      document.body.style.scrollbarGutter = 'stable';
    } else {
      dialog.close();
      document.body.style.overflow = '';
      document.body.style.scrollbarGutter = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      // Clean up body styles if the component unmounts while open
      document.body.style.overflow = '';
      document.body.style.scrollbarGutter = '';
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      // Only close if the click target is the dialog itself (the backdrop),
      // not any of its children
      if (event.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      // Prevent the native dialog close so we control state ourselves
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      aria-labelledby="offline-modal-title"
      aria-describedby="offline-modal-description"
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <ds-text id="offline-modal-title" className={styles.modalTitle} weight="bold">
            {t('modal.offline.title', 'Offline')}
          </ds-text>
          <ds-button
            icon="Close"
            size="large"
            type="ghost"
            color="text"
            onClick={onClose}
            aria-label={t('modal.offline.close', 'Close')}
          />
        </div>
        <ds-divider />
        <div className={styles.modalBody}>
          <ds-text
            id="offline-modal-description"
            overflow="break-word"
            line-height={1.4}
            className={styles.paragraph}
            data-testid="offlineMsg"
          >
            {t(
              'modal.offline.description',
              'You are currently offline, please check your internet connection',
            )}
          </ds-text>
        </div>
        <ds-divider />
        <div className={styles.modalFooter}>
          <ds-button
            className={styles.confirmButton}
            color="primary"
            min-width="6.25rem"
            onClick={onClose}
            label="OK"
          />
        </div>
      </div>
    </dialog>
  );
};
