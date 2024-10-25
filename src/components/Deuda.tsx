// src/components/Deuda.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación

interface DeudaInfo {
  deuda: boolean;
  monto: number;
  estado: string;
}

const Deuda: React.FC = () => {
  const { user } = useAuth(); // Obtiene el usuario desde el contexto
  const [deudaInfo, setDeudaInfo] = useState<DeudaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeuda = async () => {
      if (!user) return; // Verifica que el usuario esté autenticado

      const deudaRef = doc(db, 'deudas', user.uid); // Usa el UID del usuario autenticado
      const deudaSnap = await getDoc(deudaRef);
      if (deudaSnap.exists()) {
        setDeudaInfo(deudaSnap.data() as DeudaInfo);
      } else {
        console.log("No hay información de deuda para este usuario.");
      }
      setLoading(false);
    };

    fetchDeuda();
  }, [user]);

  if (loading) {
    return <p>Cargando información de deuda...</p>;
  }

  return (
    <div>
      {deudaInfo ? (
        deudaInfo.deuda ? (
          <p className="text-red-500">
            Tienes una deuda pendiente de ${deudaInfo.monto}. Estado: {deudaInfo.estado}
          </p>
        ) : (
          <p className="text-green-500">No tienes deudas pendientes. Estás al día.</p>
        )
      ) : (
        <p>No se encontró información de deuda.</p>
      )}
    </div>
  );
};

export default Deuda;