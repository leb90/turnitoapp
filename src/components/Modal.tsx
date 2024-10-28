// src/components/Modal.tsx
import React from 'react';

interface ModalProps {
  step: number;
  handleCloseModal: () => void;
  handleNext: () => void;
  handleBack: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ step, handleCloseModal, handleNext, handleBack, children }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✖
        </button>

        {children}

        <div className="mt-4 flex justify-between">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </button>
          {step < 3 && (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;