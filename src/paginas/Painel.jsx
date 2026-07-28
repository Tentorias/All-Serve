// src/paginas/Painel.jsx

import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Center,
  VStack,
  Link,
} from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config.js';
import { useAuth } from '../contexto/ContextoAutenticacao.jsx';
import PainelAdmin from '../componentes/admin/PainelAdmin.jsx';
import ListaAgendamentos from '../componentes/agendamentos/ListaAgendamentos.jsx';

export default function Painel() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('Documento do usuário não encontrado no Firestore!');
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading>Painel</Heading>
        {userData ? (
          <>
            <Text fontSize="xl">
              Bem-vindo, {userData.email}!
            </Text>
            <Text fontSize="lg">
              Seu papel é: <strong>{userData.role}</strong>
            </Text>

            {/* Links para Clientes */}
            {userData.role === 'cliente' && (
              <>
                <Link as={RouterLink} to="/buscar" color="teal.500" fontSize="lg">
                  Buscar Bartenders
                </Link>
                <Link as={RouterLink} to="/bartenders" color="teal.500" fontSize="lg">
                  Lista de Bartenders para Avaliar
                </Link>
              </>
            )}
            
            {/* Links para Bartenders */}
            {userData.role === 'bartender' && (
              <>
                <Link as={RouterLink} to={`/bartender/${currentUser.uid}`} color="teal.500" fontSize="lg">
                  Ver meu Perfil Público
                </Link>
                <Link as={RouterLink} to="/bartender/editar" color="teal.500" fontSize="lg" fontWeight="bold">
                  ✏️ Editar meu Perfil (Foto, Preço, Especialidade)
                </Link>
              </>
            )}

            {/* Lista de Agendamentos e Orçamentos para Clientes ou Bartenders */}
            {(userData.role === 'cliente' || userData.role === 'bartender') && (
              <Box width="full" pt={2}>
                <ListaAgendamentos role={userData.role} />
              </Box>
            )}

            {/* Painel do Admin */}
            {userData.role === 'administrador' && (
              <>
                <PainelAdmin />
                <Link as={RouterLink} to="/admin/moderar-avaliacoes" color="red.500" fontSize="lg">
                  Moderar Avaliações
                </Link>
              </>
            )}
          </>
        ) : (
          <Text>Não foi possível carregar os dados do usuário.</Text>
        )}
        <Button mt={4} colorScheme="red" onClick={handleLogout}>
          Sair
        </Button>
      </VStack>
    </Box>
  );
}
