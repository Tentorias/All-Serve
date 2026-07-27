// src/rotas/RotaAdmin.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAutenticacao.jsx';
import { Spinner, Center, Text } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useState, useEffect } from 'react';

export default function RotaAdmin({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().role === 'administrador') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [currentUser, authLoading]);

  if (authLoading || loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="red.500">
          Acesso Negado. Você não tem permissão para ver esta página.
        </Text>
      </Center>
    );
  }

  return children;
}
