// src/componentes/comuns/Layout.jsx

import { Outlet } from 'react-router-dom';
import BarraNavegacao from './BarraNavegacao.jsx';
import { Box, Flex, Text, Container } from '@chakra-ui/react';

export default function Layout() {
  return (
    <Flex direction="column" minH="100vh" bg="#0f131c" color="#e2e8f0">
      <BarraNavegacao />
      
      <Box as="main" flex="1" pb={12}>
        <Outlet />
      </Box>

      {/* Rodapé Tranquilo / Dark */}
      <Box
        as="footer"
        borderTop="1px solid"
        borderColor="#263147"
        bg="#121722"
        py={6}
        mt="auto"
      >
        <Container maxW="container.xl" textAlign="center">
          <Text fontSize="sm" color="gray.400">
            All-Serve © 2026 — Plataforma de Bartenders e Coquetelaria para Eventos. Todos os direitos reservados.
          </Text>
        </Container>
      </Box>
    </Flex>
  );
}
