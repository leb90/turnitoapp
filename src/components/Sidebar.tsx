import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Asegúrate de usar react-router
import { signOut } from 'firebase/auth'; // Importar el método signOut
import { auth, db } from '../firebaseConfig'; // Importar la autenticación desde Firebase
import { doc, getDoc } from 'firebase/firestore'; // Firestore para obtener la info del usuario

const Sidebar: React.FC = () => {
  const navigate = useNavigate(); // Hook de React Router para redirigir después de logout
  const user = auth.currentUser; // Usuario actual
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Estado para verificar si es admin

  // Verificar si el usuario es administrador
  useEffect(() => {
    const verificarAdmin = async () => {
      if (user) {
        const usuarioRef = doc(db, 'usuarios', user.uid); // Referencia al documento del usuario
        const usuarioDoc = await getDoc(usuarioRef); // Obtener el documento
        if (usuarioDoc.exists() && usuarioDoc.data()?.admin) {
          setIsAdmin(true); // Es administrador
        } else {
          setIsAdmin(false); // No es administrador
        }
      }
    };

    verificarAdmin();
  }, [user]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión del usuario
      navigate('/'); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="bg-gray-800 text-white w-full lg:w-64 p-6">
      <h2 className="text-xl font-bold mb-6">Club La Armonía</h2>

      <div className="text-l font-bold mb-6">
        {user ? (
          <>
            <p>Bienvenido, {user.displayName}</p>
            {isAdmin && <p className="text-green-400">Admin</p>} {/* Mostrar "Admin" si es administrador */}
          </>
        ) : (
          'No has iniciado sesión.'
        )}
      </div>

      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/dashboard" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg">
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/reservas" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg">
              <span>Reservas</span>
            </Link>
          </li>

          {/* Mostrar solo si el usuario es administrador */}
          {isAdmin && (
            <li>
              <Link to="/admin" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg">
                <span>Admin</span>
              </Link>
            </li>
          )}

          {/* Botón para cerrar sesión */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg w-full text-left"
            >
              <span>Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;