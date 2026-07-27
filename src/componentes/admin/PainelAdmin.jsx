// src/componentes/admin/PainelAdmin.jsx

import { Box, Heading, Text, VStack, Divider } from '@chakra-ui/react';

export default function PainelAdmin() {
  return (
    <Box
      mt={8}
      p={4}
      borderWidth={1}
      borderRadius={8}
      borderColor="red.500"
      bg="red.50"
      width="full"
    >
      <VStack spacing={3} align="flex-start">
        <Heading size="md" color="red.700">Painel do Administrador</Heading>
        <Divider />
        <Text>• Gerenciar Usuários</Text>
        <Text>• Ver Relatórios de Vendas</Text>
        <Text>• Modificar Cardápio</Text>
      </VStack>
    </Box>
  );
}
