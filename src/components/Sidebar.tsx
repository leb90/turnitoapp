// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="lg:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Club La Armonía</h2>
        <button onClick={toggleMenu} className="focus:outline-none">
          <span>{isOpen ? '✖' : '☰'}</span>
        </button>
      </div>

      <div
        className={`bg-gray-800 text-white lg:block ${isOpen ? 'block' : 'hidden'} h-full lg:relative fixed top-0 left-0 w-64 z-50`}
      >
        <h2 className="text-xl font-bold mb-6 p-4 hidden lg:block">Club La Armonía</h2>

        <div className="text-l font-bold mb-6 px-4">
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
          <ul className="space-y-4 px-4">
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

            {isAdmin && (
              <li>
                <Link to="/admin" className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg">
                  <span>Admin</span>
                </Link>
              </li>
            )}

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
    </div>
  );
};

export default Sidebar;