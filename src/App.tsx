// src/App.tsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminUsuarios from './components/AdminUsuarios';
import SeleccionarTurno from './components/SeleccionarTurno';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para crear un nuevo usuario en Firestore si no existe
  const crearUsuarioSiNoExiste = async (currentUser: any) => {
    const usuarioRef = doc(db, 'usuarios', currentUser.uid);
    const usuarioSnap = await getDoc(usuarioRef);

    if (!usuarioSnap.exists()) {
      // Crear el usuario si no existe
      await setDoc(usuarioRef, {
        nombre: currentUser.displayName,
        admin: false,
        deudaActiva: true, 
        deuda: 1000, 
        ultimaDeudaAplicada: new Date().toISOString(),
      });
      console.log(`Usuario ${currentUser.displayName} creado en Firestore`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        await crearUsuarioSiNoExiste(currentUser);

        const usuarioRef = doc(db, 'usuarios', currentUser.uid);
        const usuarioDoc = await getDoc(usuarioRef);
        setIsAdmin(usuarioDoc.data()?.admin || false);
      }

      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!user) {
    return <Login />; 
  }

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reservas" element={<SeleccionarTurno />} />
          {isAdmin && <Route path="/admin" element={<AdminUsuarios />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
