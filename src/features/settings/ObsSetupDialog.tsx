import { useEffect, useRef } from "react";
import { Button } from "../../components/Button";

type ObsSetupDialogProps = {
  onClose: () => void;
  open: boolean;
};

export function ObsSetupDialog({ onClose, open }: ObsSetupDialogProps) {
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
      className="setup-dialog"
      aria-labelledby="obs-setup-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="setup-dialog-content">
        <div className="setup-dialog-header">
          <div>
            <span>Setup guide</span>
            <h3 id="obs-setup-title">Connect Timestamper to OBS</h3>
          </div>
          <Button aria-label="Close setup guide" onClick={onClose}>
            Close
          </Button>
        </div>
        <ol className="setup-steps">
          <li>
            <strong>Open the OBS connection settings</strong>
            <span>In OBS, open Tools, then WebSocket Server Settings.</span>
          </li>
          <li>
            <strong>Enable the server</strong>
            <span>
              Enable the WebSocket server, keep port 4455, and copy its
              password.
            </span>
          </li>
          <li>
            <strong>Enter the details here</strong>
            <span>
              Enable OBS integration, use host 127.0.0.1, and paste the
              password.
            </span>
          </li>
          <li>
            <strong>Check and save</strong>
            <span>Click Test connection, then Save when it succeeds.</span>
          </li>
        </ol>
        <p className="setup-note">
          Timestamper only follows the OBS stream state. It never starts or
          stops OBS.
        </p>
      </div>
    </dialog>
  );
}
