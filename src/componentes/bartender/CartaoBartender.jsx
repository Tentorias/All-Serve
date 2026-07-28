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
  Heading,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import IconeEstrela from '../comuns/IconeEstrela.jsx';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

export default function CartaoBartender({ bartender }) {
  const { currentUser, userRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    id,
    nome,
    especialidade,
    precoPorHora,
    fotoURL,
    mediaAvaliacao = 0,
    totalAvaliacoes = 0,
  } = bartender;

  const placeholderImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23161c28"><rect width="400" height="250" fill="%2311151f"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="26" fill="%232dd4bf">🍸 All-Serve Bartender</text></svg>';

  const handleContratar = () => {
    if (!currentUser) {
      toast({
        title: 'Login Necessário 🍸',
        description:
          'Para contratar ou reservar com este bartender, faça login ou crie sua conta grátis!',
        status: 'info',
        duration: 3500,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    navigate(`/bartender/${id}`);
  };

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

        <HStack spacing={2} pt={2}>
          <Button
            as={RouterLink}
            to={`/bartender/${id}`}
            flex={1}
            colorScheme="teal"
            variant="outline"
            size="sm"
            _hover={{ bg: 'rgba(45, 212, 191, 0.1)' }}
          >
            Ver Perfil
          </Button>
          <Button
            flex={1}
            colorScheme="teal"
            variant="solid"
            size="sm"
            fontWeight="bold"
            onClick={handleContratar}
          >
            {userRole === 'bartender'
              ? '🤝 Parceria'
              : userRole === 'administrador'
              ? '🛡️ Ver Detalhes'
              : '📅 Contratar'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
