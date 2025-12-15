import { memo } from 'react';
import Modal from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
}

/**
 * Confirmation modal for delete operations
 * Shows item name and warning message
 */
const DeleteConfirmModal = memo<DeleteConfirmModalProps>(
  ({ isOpen, onClose, onConfirm, itemName, itemType = 'item', isLoading = false }) => {
    const title = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be
            undone.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }
);

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;

