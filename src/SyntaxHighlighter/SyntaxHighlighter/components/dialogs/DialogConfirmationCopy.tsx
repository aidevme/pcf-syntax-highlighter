import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@fluentui/react-components';
import { CheckmarkCircleColor } from '@fluentui/react-icons';

export interface IDialogConfirmationCopyProps {
  open: boolean;
  onClose: () => void;
}

export const DialogConfirmationCopy: React.FC<IDialogConfirmationCopyProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} modalType="non-modal" onOpenChange={(_, { open: isOpen }) => !isOpen && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={null}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckmarkCircleColor />
              Success
            </span>
          </DialogTitle>
          <DialogContent>
            The code has been copied to your clipboard.
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onClose}>
              OK
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
