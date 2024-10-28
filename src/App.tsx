import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminUsuarios from './components/AdminUsers';
import SeleccionarTurno from './components/SelectTurn';
import Dashboard from './pages/Dashboard';

const AppContent: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reservas" element={<SeleccionarTurno />} />
      {isAdmin && <Route path="/admin" element={<AdminUsuarios />} />}
    </Routes>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;