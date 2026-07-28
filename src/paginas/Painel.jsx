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
    <Box py={8} px={4}>
      <VStack spacing={6} align="stretch" maxW="1000px" margin="auto">
        <Box className="glacial-card" p={8}>
          <VStack spacing={6} align="flex-start">
            <Box>
              <Box className="glacial-badge" mb={2}>
                ⚙️ Central do Usuário
              </Box>
              <Heading size="xl" color="teal.900" fontWeight="900">
                Meu <span className="glacial-text-gradient">Painel</span>
              </Heading>
            </Box>

            {userData ? (
              <>
                <Box>
                  <Text fontSize="xl" fontWeight="600" color="gray.800">
                    Bem-vindo, {userData.email}!
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    Seu perfil está autenticado no nível:{' '}
                    <strong style={{ color: '#008080' }}>{userData.role?.toUpperCase()}</strong>
                  </Text>
                </Box>

                {/* Ações e Links */}
                <VStack align="stretch" spacing={3} width="100%" pt={2}>
                  {userData.role === 'cliente' && (
                    <>
                      <Link as={RouterLink} to="/buscar" color="teal.700" fontWeight="600" _hover={{ color: 'teal.500' }}>
                        🍸 Buscar Bartenders Disponíveis
                      </Link>
                      <Link as={RouterLink} to="/bartenders" color="teal.700" fontWeight="600" _hover={{ color: 'teal.500' }}>
                        ⭐ Avaliar Bartenders da Comunidade
                      </Link>
                    </>
                  )}

                  {userData.role === 'bartender' && (
                    <>
                      <Link as={RouterLink} to={`/bartender/${currentUser.uid}`} color="teal.700" fontWeight="600" _hover={{ color: 'teal.500' }}>
                        👁️ Ver Meu Perfil Público
                      </Link>
                      <Link as={RouterLink} to="/bartender/editar" color="teal.700" fontWeight="800" _hover={{ color: 'teal.500' }}>
                        ✏️ Editar meu Perfil (Foto, Preço, Especialidade)
                      </Link>
                    </>
                  )}

                  {userData.role === 'administrador' && (
                    <>
                      <PainelAdmin />
                      <Link as={RouterLink} to="/admin/moderar-avaliacoes" color="red.600" fontWeight="bold">
                        🛡️ Moderar Avaliações do Sistema
                      </Link>
                    </>
                  )}
                </VStack>

                {/* Lista de Agendamentos e Orçamentos para Clientes ou Bartenders */}
                {(userData.role === 'cliente' || userData.role === 'bartender') && (
                  <Box width="full" pt={4}>
                    <ListaAgendamentos role={userData.role} />
                  </Box>
                )}
              </>
            ) : (
              <Text>Não foi possível carregar os dados do usuário.</Text>
            )}

            <Button mt={4} colorScheme="red" variant="outline" borderRadius="full" onClick={handleLogout}>
              Sair da Conta
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
