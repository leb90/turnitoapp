import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Sidebar from '../components/Sidebar';

interface Usuario {
  uid: string;
  nombre: string;
  deuda: number;
  admin: boolean;
}

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editarDeuda, setEditarDeuda] = useState<string | null>(null); // Para editar deuda
  const [cantidadDeuda, setCantidadDeuda] = useState<string>(''); // Guardamos como string para manejar números negativos

  useEffect(() => {
    // Escuchar los cambios en tiempo real en la colección de usuarios
    const unsubscribe = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      const usuariosList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Usuario[];
      setUsuarios(usuariosList);
    });

    return () => unsubscribe(); // Limpieza del listener al desmontar el componente
  }, []);

  const modificarDeuda = async (uid: string) => {
    const usuarioRef = doc(db, 'usuarios', uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (usuarioDoc.exists()) {
      const cantidad = parseFloat(cantidadDeuda); // Convertir el input string a número
      if (isNaN(cantidad)) {
        alert("Por favor ingresa un número válido");
        return;
      }

      const nuevaDeuda = (usuarioDoc.data()?.deuda || 0) + cantidad;

      // Actualizar la deuda del usuario
      await updateDoc(usuarioRef, {
        deuda: nuevaDeuda
      });

      // Resetear el modo de edición y la cantidad
      setEditarDeuda(null);
      setCantidadDeuda('');
    } else {
      console.error('El documento de usuario no existe');
    }
  };

  const handleCancelarEdicion = () => {
    setEditarDeuda(null);
    setCantidadDeuda('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir solo números (incluyendo negativos)
    if (/^-?\d*$/.test(value)) {
      setCantidadDeuda(value);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 max-w-4xl mx-auto my-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">Gestión de Usuarios</h2>
        <ul className="divide-y divide-gray-200">
          {usuarios.map((usuario) => (
            <li key={usuario.uid} className="py-4 flex justify-between items-center">
              <div className="flex flex-col">
                <p className="text-lg font-medium text-gray-800">{usuario.nombre}</p>
                <p className={`text-sm ${usuario.deuda > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  Deuda: ${usuario.deuda}
                </p>
              </div>

              <div className="space-x-4">
                {editarDeuda === usuario.uid ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cantidadDeuda}
                      onChange={handleInputChange}
                      className="border p-2 rounded-lg"
                      placeholder="Cantidad"
                    />
                    <button
                      onClick={() => modificarDeuda(usuario.uid)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      ✔
                    </button>
                    <button
                      onClick={handleCancelarEdicion}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      ✘
                    </button>
                  </div>
                ) : (
                  <div className="space-x-4">
                    <button
                      onClick={() => setEditarDeuda(usuario.uid)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Modificar Deuda
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminUsuarios;