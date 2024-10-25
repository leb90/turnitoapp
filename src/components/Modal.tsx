// src/components/Modal.tsx
import React from 'react';

interface ModalProps {
  paso: number;
  handleCerrarModal: () => void;
  handleSiguiente: () => void;
  handleAtras: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ paso, handleCerrarModal, handleSiguiente, handleAtras, children }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        {/* X para cerrar el modal */}
        <button
          onClick={handleCerrarModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✖
        </button>

        {children}

        {/* Botones de navegación */}
        <div className="mt-4 flex justify-between">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleAtras}
            disabled={paso === 1}  // Deshabilitar si es el primer paso
          >
            Atrás
          </button>
          {paso < 3 && <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleSiguiente}
          >
             Siguiente
          </button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
