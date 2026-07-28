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
  const {
    id,
    nome,
    especialidade,
    precoPorHora,
    fotoURL,
    mediaAvaliacao = 0,
    totalAvaliacoes = 0,
  } = bartender;

  const placeholderImage = 'https://via.placeholder.com/400x250/161c28/94a3b8?text=Bartender';

  return (
    <Box
      bg="#161c28"
      borderWidth="1px"
      borderColor="#263147"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      width="100%"
      transition="all 0.25s ease"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: 'teal.400',
        boxShadow: '2xl',
      }}
    >
      <Image
        src={fotoURL || placeholderImage}
        alt={`Foto de ${nome || bartender.email}`}
        height="200px"
        width="100%"
        objectFit="cover"
      />

      <VStack p={5} align="stretch" spacing={3}>
        <Heading as="h3" size="md" noOfLines={1} color="white">
          {nome || bartender.email}
        </Heading>

        <Badge
          colorScheme="teal"
          alignSelf="flex-start"
          px={2}
          py={0.5}
          borderRadius="md"
          fontSize="xs"
        >
          {especialidade || 'Coquetelaria em Geral'}
        </Badge>

        <HStack justify="space-between" pt={1}>
          <Text fontWeight="700" fontSize="lg" color="teal.300">
            R$ {precoPorHora || 0}/h
          </Text>
          <HStack spacing={1}>
            <Icon as={IconeEstrela} color="gold" boxSize={4} />
            <Text fontWeight="bold" fontSize="sm" color="white">
              {mediaAvaliacao.toFixed(1)}
            </Text>
            <Text color="gray.400" fontSize="xs">
              ({totalAvaliacoes})
            </Text>
          </HStack>
        </HStack>

        <ChakraLink as={RouterLink} to={`/bartender/${id}`} pt={2}>
          <Button
            width="full"
            colorScheme="teal"
            variant="outline"
            size="sm"
            _hover={{ bg: 'rgba(45, 212, 191, 0.1)' }}
          >
            Ver Perfil Completo
          </Button>
        </ChakraLink>
      </VStack>
    </Box>
  );
}
