import React from 'react';
import { signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';
import '../Login.css';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario logueado: ', user);
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
