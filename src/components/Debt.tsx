// src/components/Debt.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

interface DebtInfo {
  hasDebt: boolean;
  amount: number;
  status: string;
}

const Debt: React.FC = () => {
  const { user } = useAuth(); 
  const [debtInfo, setDebtInfo] = useState<DebtInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebt = async () => {
      if (!user) return; 

      const debtRef = doc(db, 'deudas', user.uid); 
      const debtSnap = await getDoc(debtRef);
      if (debtSnap.exists()) {
        setDebtInfo(debtSnap.data() as DebtInfo);
      } else {
        console.log("No se encontró información de deuda para este usuario.");
      }
      setLoading(false);
    };

    fetchDebt();
  }, [user]);

  if (loading) {
    return <p>Cargando información de deuda...</p>;
  }

  return (
    <div>
      {debtInfo ? (
        debtInfo.hasDebt ? (
          <p className="text-red-500">
            Tienes una deuda pendiente de ${debtInfo.amount}. Estado: {debtInfo.status}
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

export default Debt;