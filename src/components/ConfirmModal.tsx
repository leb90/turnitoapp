// src/components/ConfirmModal.tsx
import React from 'react';

interface ConfirmModalProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ mensaje, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        {/* Mensaje */}
        <p className="text-lg font-medium text-gray-900 mb-4">{mensaje}</p>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Sí
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
