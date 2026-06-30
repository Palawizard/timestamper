import { useEffect, useRef } from "react";
import { Button } from "./Button";

type ConfirmationDialogProps = {
  confirmLabel: string;
  isConfirming?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function ConfirmationDialog({
  confirmLabel,
  isConfirming = false,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
      onCancel={(event) => {
        event.preventDefault();

        if (!isConfirming) {
          onCancel();
        }
      }}
    >
      <div className="confirmation-dialog-content">
        <h3 id="confirmation-dialog-title">{title}</h3>
        <p id="confirmation-dialog-message">{message}</p>
        <div className="confirmation-dialog-actions">
          <Button autoFocus disabled={isConfirming} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="button-danger"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
