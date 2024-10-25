import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnl3ww5R3VNHp7s8LgWAhV_vRWzghNLs0",
  authDomain: "turnitoapp-a3dac.firebaseapp.com",
  projectId: "turnitoapp-a3dac",
  storageBucket: "turnitoapp-a3dac.appspot.com",
  messagingSenderId: "470791061529",
  appId: "1:470791061529:web:76ad7192441d0e4c342a88",
  measurementId: "G-FQ8MV5ZD0R" // Este campo es opcional
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios específicos que vas a usar
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Puedes omitir analytics si no lo necesitas