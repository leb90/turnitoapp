// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth(); // Utiliza el contexto de usuario
  const [deuda, setDeuda] = useState<number | null>(null);
  const [misReservas, setMisReservas] = useState<any[]>([]);
  const [loadingDeuda, setLoadingDeuda] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Obtener información de la deuda del usuario
  useEffect(() => {
    const obtenerDeuda = async () => {
      if (!user) return;
      const usuarioRef = doc(db, 'usuarios', user.uid);
      const usuarioSnap = await getDoc(usuarioRef);
      const data = usuarioSnap.data();

      if (data) {
        setDeuda(data.deuda || 0);
      }
      setLoadingDeuda(false);
    };

    obtenerDeuda();
  }, [user]);

  // Obtener reservas futuras del usuario
  useEffect(() => {
    const obtenerReservasUsuario = async () => {
      if (!user) return;
      const q = query(collection(db, 'reservas'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const reservas = snapshot.docs.map(doc => doc.data());

      const reservasFuturas = reservas.filter((reserva) => {
        const fechaReserva = new Date(`${reserva.fecha}T${reserva.horario}`);
        const ahora = new Date();
        return fechaReserva > ahora;
      });

      setMisReservas(reservasFuturas);
      setLoadingReservas(false);
    };

    obtenerReservasUsuario();
  }, [user]);

  // Función para saldar deuda
  const saldarDeuda = async () => {
    if (!user) return;

    try {
      const usuarioRef = doc(db, 'usuarios', user.uid);
      await updateDoc(usuarioRef, {
        deuda: 0, // Poner la deuda en 0 al saldarla
      });
      setDeuda(0); // Actualizar el estado local
      alert('Deuda saldada con éxito.');
    } catch (error) {
      console.error("Error al saldar la deuda:", error);
    } finally {
      setMostrarModal(false); // Cerrar el modal
    }
  };

  // Mostrar el modal de confirmación
  const handleSaldarDeudaClick = () => {
    setMostrarModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

        {/* Mostrar deuda */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Estado de Deuda</h3>
          {loadingDeuda ? (
            <p>Cargando estado de deuda...</p>
          ) : (
            <>
              <p>
                {deuda && deuda > 0 ? (
                  <span className="text-red-500">Tienes una deuda activa de ${deuda}.</span>
                ) : (
                  <span className="text-green-500">No tienes deudas pendientes.</span>
                )}
              </p>
              {deuda && deuda > 0 && (
                <button
                  onClick={handleSaldarDeudaClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-4"
                >
                  Saldar Deuda
                </button>
              )}
            </>
          )}
        </div>

        {/* Mostrar reservas futuras */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Reservas Futuras</h3>
          {loadingReservas ? (
            <p>Cargando reservas...</p>
          ) : (
            <>
              {misReservas.length > 0 ? (
                misReservas.map((reserva, index) => (
                  <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                    <p><strong>Cancha:</strong> {reserva.cancha}</p>
                    <p><strong>Fecha:</strong> {reserva.fecha}</p>
                    <p><strong>Horario:</strong> {reserva.horario}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No tienes reservas futuras.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarModal && (
        <ConfirmModal
          mensaje="¿Seguro que deseas saldar la deuda?"
          onConfirm={saldarDeuda}
          onCancel={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;