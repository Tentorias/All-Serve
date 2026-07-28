// src/componentes/comuns/BarraNavegacao.jsx

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Link, Button, Heading, Text, HStack } from '@chakra-ui/react';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';
import { useCarrinho } from '../../contexto/ContextoCarrinho.jsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config.js';

export default function BarraNavegacao() {
  const { currentUser, userRole } = useAuth();
  const { totalItens } = useCarrinho();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <Box
      bg="#161c28"
      borderBottom="1px solid"
      borderColor="#263147"
      px={8}
      py={4}
      boxShadow="lg"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        {/* Logo/Título da Plataforma */}
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          color="white"
          _hover={{ textDecoration: 'none' }}
          display="flex"
          alignItems="center"
          gap={2}
        >
          <span>🍸</span>
          <Text as="span" bgGradient="linear(to-r, teal.300, #81E6D9)" bgClip="text">
            All-Serve
          </Text>
        </Heading>

        {/* Links de navegação */}
        <HStack spacing={6} align="center">
          <Link
            as={RouterLink}
            to="/buscar"
            color="gray.300"
            fontWeight="500"
            _hover={{ color: 'teal.300', textDecoration: 'none' }}
          >
            Buscar Bartenders
          </Link>
          {currentUser && (!userRole || userRole === 'cliente') && (
            <Button
              as={RouterLink}
              to="/carrinho"
              size="sm"
              colorScheme="teal"
              variant="solid"
              fontWeight="bold"
            >
              🛒 Carrinho {totalItens > 0 && `(${totalItens})`}
            </Button>
          )}
          {currentUser ? (
            <>
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
