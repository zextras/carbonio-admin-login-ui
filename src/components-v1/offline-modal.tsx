/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useEffect, useRef } from 'react';

import styles from './offline-modal.module.css';

type ModalProps = {
  open: boolean;
  onClose: (event: React.MouseEvent | KeyboardEvent) => void;
};

export const OfflineModal = ({ onClose, open }: ModalProps) => {
  const t = i18next.t.bind(i18next);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent): void => {
      const rect = dialog.getBoundingClientRect();
      const isBackdropClick =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (isBackdropClick) {
        onCloseRef.current(event as unknown as React.MouseEvent);
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, []);

  function handleClose(): void {
    onClose(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={handleClose}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <ds-text className={styles.modalTitle} weight="bold">
            {t('modal.offline.title', 'Offline')}
          </ds-text>
          <ds-button
            icon="Close"
            size="large"
            type="ghost"
            color="text"
            onClick={onClose as (e: Event) => void}
          />
        </div>
        <ds-divider></ds-divider>
        <div className={styles.modalBody}>
          <ds-text
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
        <ds-divider></ds-divider>
        <div className={styles.modalFooter}>
          <div className={styles.spacer} />
          <ds-button
            className={styles.confirmButton}
            color="primary"
            min-width="6.25rem"
            onClick={onClose as (e: Event) => void}
            label="OK"
          />
        </div>
      </div>
    </dialog>
  );
};
