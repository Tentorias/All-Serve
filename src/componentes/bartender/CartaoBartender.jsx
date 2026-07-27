// src/componentes/bartender/CartaoBartender.jsx

import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
  Button,
  Link as ChakraLink,
  Heading,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import IconeEstrela from '../comuns/IconeEstrela.jsx';

export default function CartaoBartender({ bartender }) {
  const { id, nome, especialidade, precoPorHora, fotoURL, mediaAvaliacao = 0, totalAvaliacoes = 0 } = bartender;
  
  // URL de imagem padrão caso não haja uma
  const placeholderImage = 'https://via.placeholder.com/300x200?text=Bartender';

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" width="100%">
      <Image src={fotoURL || placeholderImage} alt={`Foto de ${nome}`} height="200px" width="100%" objectFit="cover" />

      <VStack p={4} align="stretch" spacing={3}>
        <Heading as="h3" size="md" noOfLines={1}>
          {nome}
        </Heading>

        <Badge colorScheme="teal" alignSelf="flex-start">
          {especialidade}
        </Badge>

        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg" color="teal.600">
            R$ {precoPorHora}/hora
          </Text>
          <HStack spacing={1}>
            <Icon as={IconeEstrela} color="gold" />
            <Text fontWeight="medium">{mediaAvaliacao.toFixed(1)}</Text>
            <Text color="gray.500">({totalAvaliacoes})</Text>
          </HStack>
        </HStack>
        
        <ChakraLink as={RouterLink} to={`/bartender/${id}`}>
          <Button width="full" colorScheme="teal" variant="outline">
            Ver Perfil Completo
          </Button>
        </ChakraLink>
      </VStack>
    </Box>
  );
}
