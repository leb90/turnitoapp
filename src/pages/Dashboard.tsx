// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [debt, setDebt] = useState<number | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loadingDebt, setLoadingDebt] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDebt = async () => {
      if (!user) return;
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      if (data) {
        setDebt(data.debt || 0);
      }
      setLoadingDebt(false);
    };

    fetchDebt();
  }, [user]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;
      const q = query(collection(db, "reservas"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => doc.data());

      const futureBookings = bookings.filter((booking) => {
        const bookingDate = new Date(`${booking.date}T${booking.time}`);
        return bookingDate > new Date();
      });

      setMyBookings(futureBookings);
      setLoadingBookings(false);
    };

    fetchUserBookings();
  }, [user]);

  const settleDebt = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        debt: 0,
      });
      setDebt(0);
      alert("Deuda saldada con éxito.");
    } catch (error) {
      console.error("Error al saldar la deuda:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleSettleDebtClick = () => {
    setShowModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Panel de Control</h2>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Estado de Deuda</h3>
          {loadingDebt ? (
            <p>Cargando estado de deuda...</p>
          ) : (
            <>
              <p>
                {debt && debt > 0 ? (
                  <span className="text-red-500">
                    Tienes una deuda activa de ${debt}.
                  </span>
                ) : (
                  <span className="text-green-500">
                    No tienes deudas pendientes.
                  </span>
                )}
              </p>
              {debt && debt > 0 ? (
                <button
                  onClick={handleSettleDebtClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-4"
                >
                  Saldar Deuda
                </button>
              ) : null}
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Reservas Futuras</h3>
          {loadingBookings ? (
            <p>Cargando reservas...</p>
          ) : (
            <>
              {myBookings.length > 0 ? (
                myBookings.map((booking, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg mb-4 bg-gray-50"
                  >
                    <p>
                      <strong>Cancha:</strong> {booking.court}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {booking.date}
                    </p>
                    <p>
                      <strong>Horario:</strong> {booking.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No tienes reservas futuras.</p>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <ConfirmModal
          message="¿Seguro que deseas saldar la deuda?"
          onConfirm={settleDebt}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
