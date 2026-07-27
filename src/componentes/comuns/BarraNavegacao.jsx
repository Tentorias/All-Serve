// src/componentes/comuns/BarraNavegacao.jsx

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Link, Button, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config.js';

export default function BarraNavegacao() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Box bg="teal.500" p={4} color="white">
      <Flex maxW="container.xl" margin="auto" justify="space-between" align="center">
        <Heading as={RouterLink} to="/" size="md">
          Meu App
        </Heading>
        <Flex gap={4} align="center">
          {currentUser ? (
            <>
              <Link as={RouterLink} to="/buscar">
                Buscar Bartenders
              </Link>
              <Link as={RouterLink} to="/painel">
                Painel
              </Link>
              <Text>Olá, {currentUser.email}</Text>
              <Button colorScheme="red" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link as={RouterLink} to="/login">
                Entrar
              </Link>
              <Link as={RouterLink} to="/cadastro">
                Criar Conta
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
