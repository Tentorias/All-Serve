// src/componentes/comuns/BarraNavegacao.jsx

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Link, Button, Heading, Text, HStack } from '@chakra-ui/react';
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
    <Box
      as="nav"
      bg="rgba(22, 28, 40, 0.85)"
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor="#263147"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex maxW="container.xl" margin="auto" justify="space-between" align="center">
        {/* Logo */}
        <Heading
          as={RouterLink}
          to="/"
          size="md"
          letterSpacing="wide"
          display="flex"
          alignItems="center"
          gap={2}
          _hover={{ opacity: 0.9 }}
        >
          <span>🍹</span>
          <Text as="span" color="white" fontWeight="800">
            All
          </Text>
          <Text as="span" color="teal.400" fontWeight="800">
            Serve
          </Text>
        </Heading>

        {/* Links de navegação */}
        <HStack spacing={6} align="center">
          {currentUser ? (
            <>
              <Link
                as={RouterLink}
                to="/buscar"
                color="gray.300"
                fontWeight="500"
                _hover={{ color: 'teal.300', textDecoration: 'none' }}
              >
                Buscar Bartenders
              </Link>
              <Link
                as={RouterLink}
                to="/painel"
                color="gray.300"
                fontWeight="500"
                _hover={{ color: 'teal.300', textDecoration: 'none' }}
              >
                Painel
              </Link>
              <Text color="gray.400" fontSize="sm" display={{ base: 'none', md: 'block' }}>
                {currentUser.email}
              </Text>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link
                as={RouterLink}
                to="/login"
                color="gray.300"
                fontWeight="500"
                _hover={{ color: 'teal.300', textDecoration: 'none' }}
              >
                Entrar
              </Link>
              <Button
                as={RouterLink}
                to="/cadastro"
                size="sm"
                colorScheme="teal"
                fontWeight="bold"
              >
                Criar Conta
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
