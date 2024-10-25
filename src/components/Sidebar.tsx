// src/components/Sidebar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext'; // Importa el contexto de autenticación

const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth(); // Obtén el usuario y el rol de administrador desde el contexto
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
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
            {isAdmin && <p className="text-green-400">Admin</p>}
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