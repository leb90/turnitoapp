// src/components/Login.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../Login.css';

const Login: React.FC = () => {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Error al iniciar sesión: ', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="title">Bienvenido al Club La Armonía</h1>
        <p className="description">
          Inicia sesión con Google para continuar.
        </p>
        <button onClick={handleLogin} className="login-button">
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

export default Login;