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
  HStack,
  Link,
  Badge,
  Divider,
  Container,
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
        <Spinner size="xl" color="teal.400" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box
        bg="#161c28"
        borderWidth="1px"
        borderColor="#263147"
        borderRadius="xl"
        p={8}
        boxShadow="xl"
      >
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center" flexWrap="wrap">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="white">
                Meu Painel de Controle
              </Heading>
              {userData && (
                <Text color="gray.400" fontSize="md">
                  Bem-vindo(a), <strong style={{ color: '#fff' }}>{userData.email}</strong>
                </Text>
              )}
            </VStack>

            {userData && (
              <Badge
                colorScheme="teal"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                textTransform="uppercase"
              >
                Perfil: {userData.role}
              </Badge>
            )}
          </HStack>

          <Divider borderColor="#263147" />

          {userData ? (
            <>
              {/* Menu Rápido por Perfil */}
              <Box>
                <Text fontWeight="600" color="gray.300" mb={3} fontSize="sm">
                  ATALHOS DO SEU PERFIL:
                </Text>
                <HStack spacing={4} flexWrap="wrap">
                  {userData.role === 'cliente' && (
                    <>
                      <Button
                        as={RouterLink}
                        to="/buscar"
                        colorScheme="teal"
                        size="sm"
                      >
                        🔍 Buscar Bartenders
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/bartenders"
                        variant="outline"
                        colorScheme="teal"
                        size="sm"
                      >
                        ⭐ Avaliar Bartenders
                      </Button>
                    </>
                  )}

                  {userData.role === 'bartender' && (
                    <>
                      <Button
                        as={RouterLink}
                        to={`/bartender/${currentUser.uid}`}
                        colorScheme="teal"
                        size="sm"
                      >
                        👁️ Ver Meu Perfil Público
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/bartender/editar"
                        variant="outline"
                        colorScheme="teal"
                        size="sm"
                      >
                        ✏️ Editar Foto e Preço
                      </Button>
                    </>
                  )}

                  {userData.role === 'administrador' && (
                    <Button
                      as={RouterLink}
                      to="/admin/moderar-avaliacoes"
                      colorScheme="red"
                      size="sm"
                    >
                      🛡️ Moderar Avaliações
                    </Button>
                  )}
                </HStack>
              </Box>

              {/* Lista de Agendamentos e Orçamentos */}
              {(userData.role === 'cliente' || userData.role === 'bartender') && (
                <Box width="full" pt={2}>
                  <ListaAgendamentos role={userData.role} />
                </Box>
              )}

              {/* Painel de Estatísticas / Controle do Admin */}
              {userData.role === 'administrador' && (
                <Box pt={4}>
                  <PainelAdmin />
                </Box>
              )}
            </>
          ) : (
            <Text color="gray.400">Não foi possível carregar os dados do usuário.</Text>
          )}

          <Divider borderColor="#263147" pt={4} />

          <Box>
            <Button colorScheme="red" variant="outline" size="sm" onClick={handleLogout}>
              Sair da Conta
            </Button>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
