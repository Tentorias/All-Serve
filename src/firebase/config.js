// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCulyFGQNV-YqQr9H9Tjt4s6zsAIJYvJYI",
  authDomain: "all-service-d9f99.firebaseapp.com",
  projectId: "all-service-d9f99",
  storageBucket: "all-service-d9f99.firebasestorage.app",
  messagingSenderId: "267615703336",
  appId: "1:267615703336:web:b1b89330dfc8c00974c01d",
  measurementId: "G-QS0CVGRRLN"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);