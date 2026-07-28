// src/componentes/bartender/CartaoBartender.jsx

import {
  Box,
  Image,
  Text,
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

  // Imagem de coquetel cristalino de alta qualidade como padrão
  const placeholderImage =
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80';

  return (
    <Box
      className="glacial-card"
      overflow="hidden"
      width="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={fotoURL || placeholderImage}
          alt={`Foto de ${nome}`}
          height="210px"
          width="100%"
          objectFit="cover"
          transition="transform 0.4s ease"
          _hover={{ transform: 'scale(1.05)' }}
        />
        {/* Camada de brilho na base da imagem */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="40px"
          bgGradient="linear(to-t, rgba(255, 255, 255, 0.75), transparent)"
        />
      </Box>

      <VStack p={5} align="stretch" spacing={4} flex="1" justify="space-between">
        <VStack align="stretch" spacing={2}>
          <Heading as="h3" size="md" noOfLines={1} color="teal.900" fontWeight="800">
            {nome || bartender.email?.split('@')[0] || 'Bartender'}
          </Heading>

          <Box>
            <span className="glacial-badge">
              🍸 {especialidade || 'Mixologia Geral'}
            </span>
          </Box>
        </VStack>

        <VStack align="stretch" spacing={3} pt={2}>
          <HStack justify="space-between" align="center">
            <Text fontWeight="900" fontSize="xl" className="glacial-text-gradient">
              R$ {precoPorHora || '150'}/h
            </Text>
            <HStack
              spacing={1.5}
              bg="rgba(255, 215, 0, 0.15)"
              px={2.5}
              py={1}
              borderRadius="full"
              border="1px solid rgba(255, 215, 0, 0.35)"
            >
              <Icon as={IconeEstrela} color="yellow.500" />
              <Text fontWeight="bold" fontSize="sm" color="gray.800">
                {mediaAvaliacao.toFixed(1)}
              </Text>
              <Text color="gray.600" fontSize="xs">
                ({totalAvaliacoes})
              </Text>
            </HStack>
          </HStack>

          <ChakraLink as={RouterLink} to={`/bartender/${id}`} _hover={{ textDecoration: 'none' }}>
            <Button width="full" className="glacial-btn" py={5}>
              Ver Perfil Completo ✨
            </Button>
          </ChakraLink>
        </VStack>
      </VStack>
    </Box>
  );
}
