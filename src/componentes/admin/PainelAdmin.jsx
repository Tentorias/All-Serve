// src/componentes/admin/PainelAdmin.jsx

import { Box, Heading, Text, VStack, Divider } from '@chakra-ui/react';

export default function PainelAdmin() {
  return (
    <Box
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      borderColor="red.500"
      bg="rgba(239, 68, 68, 0.08)"
      width="full"
    >
      <VStack spacing={3} align="flex-start" color="gray.300">
        <Heading size="md" color="red.300">🛡️ Painel de Administração e Segurança</Heading>
        <Divider />
        <Text>• Gerenciar Usuários</Text>
        <Text>• Ver Relatórios de Vendas</Text>
        <Text>• Modificar Cardápio</Text>
      </VStack>
    </Box>
  );
}
