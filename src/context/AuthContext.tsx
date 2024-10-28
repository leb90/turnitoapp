// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup } from 'firebase/auth';
import { auth, provider, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Definir el tipo del contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>; // Incluir signIn en el contexto
}

// Crear el contexto de autenticación
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para crear un usuario en Firestore si no existe
  const createUserIfNotExist = async (currentUser: User) => {
    const userRef = doc(db, 'usuarios', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        nombre: currentUser.displayName,
        admin: false,
        deudaActiva: true,
        deuda: 1000,
        ultimaDeudaAplicada: new Date().toISOString(),
      });
    }
  };

  // Función para manejar el inicio de sesión con Google
  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      setUser(currentUser);
      await createUserIfNotExist(currentUser);
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
    }
  };

  // Efecto para monitorear el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        await createUserIfNotExist(currentUser);
        const userRef = doc(db, 'usuarios', currentUser.uid);
        const userDoc = await getDoc(userRef);
        setIsAdmin(userDoc.data()?.admin || false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};