/*
  Reusable confirmation modal. Accepts a message and two callbacks:
  onConfirm — user clicked Confirm
  onCancel  — user clicked Cancel or the overlay
*/

import Button from './Button';

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            {/* Stop clicks inside the card from closing the modal */}
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-actions">
                    <Button type="button" onClick={onConfirm}>Confirm</Button>
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
