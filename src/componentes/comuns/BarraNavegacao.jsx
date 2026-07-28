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
      as="header"
      position="sticky"
      top={0}
      zIndex={1000}
      className="glacial-navbar"
      px={6}
      py={3}
    >
      <Flex maxW="1200px" margin="auto" justify="space-between" align="center">
        {/* Logo All-Serve com efeito Glacial */}
        <Heading
          as={RouterLink}
          to="/"
          size="md"
          display="flex"
          alignItems="center"
          gap={2}
          _hover={{ opacity: 0.85 }}
          textDecoration="none"
        >
          <Text as="span" fontSize="2xl">💎</Text>
          <Text as="span" className="glacial-text-gradient" fontSize="xl" fontWeight="900" letterSpacing="tight">
            All-Serve
          </Text>
        </Heading>

        {/* Itens de Navegação */}
        <HStack spacing={6} align="center">
          {currentUser ? (
            <>
              <Link
                as={RouterLink}
                to="/buscar"
                fontWeight="600"
                color="white"
                _hover={{ color: 'cyan.300', textDecoration: 'none', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
              >
                🍸 Buscar Bartenders
              </Link>
              <Link
                as={RouterLink}
                to="/painel"
                fontWeight="600"
                color="white"
                _hover={{ color: 'cyan.300', textDecoration: 'none', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
              >
                📊 Meu Painel
              </Link>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                bg="rgba(0, 198, 255, 0.15)"
                border="1px solid rgba(0, 198, 255, 0.4)"
                display={{ base: 'none', md: 'block' }}
              >
                <Text fontSize="xs" fontWeight="bold" color="cyan.200">
                  ⚡ {currentUser.email?.split('@')[0]}
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                borderRadius="full"
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
                fontWeight="600"
                color="white"
                _hover={{ color: 'cyan.300', textDecoration: 'none' }}
              >
                Entrar
              </Link>
              <Button
                as={RouterLink}
                to="/cadastro"
                size="sm"
                className="glacial-btn"
                px={5}
                py={2}
              >
                ✨ Criar Conta
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
