/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-divider';

import { useEffect, useRef } from 'react';

import { Container } from './Container';
import styles from './modal.module.css';
import { Padding } from './Padding';
import { Row } from './Row';

type ModalProps = {
  open: boolean;
  children: React.ReactNode | React.ReactNode[];
  onClose: (event: React.MouseEvent | KeyboardEvent) => void;
  title: string;
};

export const Modal = ({ title, onClose, open, children }: ModalProps) => {
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
        <Row width="100%" padding={{ bottom: 'small' }}>
          <ds-text className={styles.modalTitle} weight="bold">
            {title}
          </ds-text>
          <ds-button
            icon="Close"
            size="large"
            type="ghost"
            color="text"
            onClick={onClose as (e: Event) => void}
          />
        </Row>
        <ds-divider></ds-divider>
        <div className={styles.modalBody}>{children}</div>
        <ds-divider></ds-divider>
        <Container orientation="horizontal" mainAlignment="flex-end" padding={{ top: 'large' }}>
          <Container
            className={styles.buttonContainer}
            orientation="horizontal"
            mainAlignment="flex-end"
          >
            <Padding right="large" />
            {onClose && (
              <ds-button
                className={styles.confirmButton}
                color="primary"
                onClick={onClose as (e: Event) => void}
                label="OK"
              />
            )}
          </Container>
        </Container>
      </div>
    </dialog>
  );
};
