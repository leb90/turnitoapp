// src/components/AdminUsers.tsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface User {
  uid: string;
  name: string;
  debt: number;
  isAdmin: boolean;
}

const AdminUsers: React.FC = () => {
  const { isAdmin } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [debtAmount, setDebtAmount] = useState<string>(''); 

  useEffect(() => {
    if (!isAdmin) return; 

    const unsubscribe = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
      setUsers(usersList);
    });

    return () => unsubscribe(); 
  }, [isAdmin]);

  const updateDebt = async (uid: string) => {
    const userRef = doc(db, 'usuarios', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const amount = parseFloat(debtAmount);
      if (isNaN(amount)) {
        alert("Por favor, ingresa un número válido");
        return;
      }

      const newDebt = (userDoc.data()?.debt || 0) + amount;

      await updateDoc(userRef, { debt: newDebt });

      setEditingDebt(null);
      setDebtAmount('');
    } else {
      console.error('El documento del usuario no existe');
    }
  };

  const handleCancelEdit = () => {
    setEditingDebt(null);
    setDebtAmount('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*$/.test(value)) {
      setDebtAmount(value);
    }
  };

  if (!isAdmin) {
    return <p className="text-center text-gray-700">No tienes permisos para acceder a esta sección.</p>; 
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 w-full lg:max-w-4xl mx-auto my-8 p-4 sm:p-6 bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-700 mb-4 sm:mb-6">Gestión de Usuarios</h2>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.uid} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex flex-col items-start sm:items-start mb-4 sm:mb-0 w-full sm:w-auto">
                <p className="text-lg font-medium text-gray-800">{user.name}</p>
                <p className={`text-sm ${user.debt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  Deuda: ${user.debt}
                </p>
              </div>

              <div className="space-y-2 sm:space-x-4 flex flex-col sm:flex-row items-center w-full sm:w-auto">
                {editingDebt === user.uid ? (
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={debtAmount}
                      onChange={handleInputChange}
                      className="border p-2 rounded-lg w-full sm:w-28"
                      placeholder="Cantidad"
                    />
                    <button
                      onClick={() => updateDebt(user.uid)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      ✔
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      ✘
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDebt(user.uid)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 w-full sm:w-auto"
                  >
                    Editar Deuda
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminUsers;